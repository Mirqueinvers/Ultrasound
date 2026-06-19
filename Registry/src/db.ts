import Database from "better-sqlite3";
import path from "path";

function getDbPath(): string {
  try {
    const { app } = require("electron");
    if (app?.getPath) {
      return path.join(app.getPath("userData"), "registry.db");
    }
  } catch {
    // Вне Electron
  }
  return path.join(__dirname, "..", "registry.db");
}

const DB_PATH = getDbPath();

let db: Database.Database;

export function initDb(): void {
  db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  initSchema();
}

function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS patients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      last_name TEXT NOT NULL,
      first_name TEXT NOT NULL,
      middle_name TEXT DEFAULT '',
      date_of_birth TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS appointments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
      appointment_date TEXT NOT NULL,
      studies TEXT NOT NULL DEFAULT '[]',
      department TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);

    CREATE TABLE IF NOT EXISTS doctors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      max_patients_per_day INTEGER NOT NULL DEFAULT 15,
      work_days TEXT NOT NULL DEFAULT '[1,2,3,4,5]'
    );
  `);

  // Добавляем колонку department, если её нет (для существующих БД)
  try {
    db.exec(`ALTER TABLE appointments ADD COLUMN department TEXT DEFAULT ''`);
  } catch {
    // Колонка уже существует
  }
}

export interface Doctor {
  id: number;
  name: string;
  max_patients_per_day: number;
  work_days: string;
}

export interface Patient {
  id: number;
  last_name: string;
  first_name: string;
  middle_name: string;
  date_of_birth: string;
  department?: string;
}

export interface Appointment {
  id: number;
  patient_id: number;
  appointment_date: string;
  studies: string[];
  department?: string;
  created_at: string;
  patient?: Patient;
}

export function getAppointmentsByDate(date: string): Appointment[] {
  const rows = db
    .prepare(
      `
      SELECT a.*, p.id as p_id, p.last_name, p.first_name, p.middle_name, p.date_of_birth
      FROM appointments a
      JOIN patients p ON p.id = a.patient_id
      WHERE a.appointment_date = ?
      ORDER BY a.created_at ASC
    `
    )
    .all(date) as any[];

  return rows.map((row) => ({
    id: row.id,
    patient_id: row.patient_id,
    appointment_date: row.appointment_date,
    studies: JSON.parse(row.studies || "[]"),
    department: row.department || "",
    created_at: row.created_at,
    patient: {
      id: row.p_id,
      last_name: row.last_name,
      first_name: row.first_name,
      middle_name: row.middle_name || "",
      date_of_birth: row.date_of_birth,
    },
  }));
}

export function createAppointment(
  patientData: Omit<Patient, "id">,
  appointmentDate: string,
  studies: string[]
): Appointment {
  // Ищем существующего пациента
  const existingPatient = db
    .prepare(
      `SELECT id FROM patients WHERE last_name = ? AND first_name = ? AND date_of_birth = ?`
    )
    .get(patientData.last_name, patientData.first_name, patientData.date_of_birth) as
    | { id: number }
    | undefined;

  let patientId: number;

  if (existingPatient) {
    patientId = existingPatient.id;
    db.prepare(`UPDATE patients SET middle_name = ? WHERE id = ?`).run(
      patientData.middle_name,
      patientId
    );
  } else {
    const result = db
      .prepare(
        `INSERT INTO patients (last_name, first_name, middle_name, date_of_birth) VALUES (?, ?, ?, ?)`
      )
      .run(
        patientData.last_name,
        patientData.first_name,
        patientData.middle_name,
        patientData.date_of_birth
      );
    patientId = result.lastInsertRowid as number;
  }

  const department = patientData.department || "";

  const result = db
    .prepare(
      `INSERT INTO appointments (patient_id, appointment_date, studies, department) VALUES (?, ?, ?, ?)`
    )
    .run(patientId, appointmentDate, JSON.stringify(studies), department);

  const newId = result.lastInsertRowid as number;

  return {
    id: newId,
    patient_id: patientId,
    appointment_date: appointmentDate,
    studies,
    department,
    created_at: new Date().toISOString(),
    patient: {
      id: patientId,
      ...patientData,
    },
  };
}

export function updateAppointment(
  id: number,
  studies: string[],
  patientData?: { last_name?: string; first_name?: string; middle_name?: string; date_of_birth?: string }
): Appointment | null {
  // Обновляем исследования
  db.prepare(`UPDATE appointments SET studies = ? WHERE id = ?`).run(
    JSON.stringify(studies),
    id
  );

  // Если переданы данные пациента, обновляем и пациента
  if (patientData) {
    const row = db
      .prepare(`SELECT patient_id FROM appointments WHERE id = ?`)
      .get(id) as { patient_id: number } | undefined;

    if (row) {
      const updates: string[] = [];
      const params: any[] = [];

      if (patientData.last_name !== undefined) {
        updates.push("last_name = ?");
        params.push(patientData.last_name);
      }
      if (patientData.first_name !== undefined) {
        updates.push("first_name = ?");
        params.push(patientData.first_name);
      }
      if (patientData.middle_name !== undefined) {
        updates.push("middle_name = ?");
        params.push(patientData.middle_name);
      }
      if (patientData.date_of_birth !== undefined) {
        updates.push("date_of_birth = ?");
        params.push(patientData.date_of_birth);
      }

      if (updates.length > 0) {
        params.push(row.patient_id);
        db.prepare(`UPDATE patients SET ${updates.join(", ")} WHERE id = ?`).run(...params);
      }
    }
  }

  // Возвращаем обновлённую запись
  const updated = db
    .prepare(
      `
      SELECT a.*, p.id as p_id, p.last_name, p.first_name, p.middle_name, p.date_of_birth
      FROM appointments a
      JOIN patients p ON p.id = a.patient_id
      WHERE a.id = ?
    `
    )
    .get(id) as any | undefined;

  if (!updated) return null;

  return {
    id: updated.id,
    patient_id: updated.patient_id,
    appointment_date: updated.appointment_date,
    studies: JSON.parse(updated.studies || "[]"),
    department: updated.department || "",
    created_at: updated.created_at,
    patient: {
      id: updated.p_id,
      last_name: updated.last_name,
      first_name: updated.first_name,
      middle_name: updated.middle_name || "",
      date_of_birth: updated.date_of_birth,
    },
  };
}

export function deleteAppointment(id: number): boolean {
  const result = db.prepare(`DELETE FROM appointments WHERE id = ?`).run(id);
  return result.changes > 0;
}

// Doctors CRUD
export function getDoctors(): Doctor[] {
  return db.prepare(`SELECT * FROM doctors ORDER BY name ASC`).all() as Doctor[];
}

export function createDoctor(
  name: string,
  maxPatientsPerDay: number,
  workDays: number[]
): Doctor {
  const workDaysJson = JSON.stringify(workDays);
  const result = db
    .prepare(
      `INSERT INTO doctors (name, max_patients_per_day, work_days) VALUES (?, ?, ?)`
    )
    .run(name, maxPatientsPerDay, workDaysJson);
  const newId = result.lastInsertRowid as number;
  return {
    id: newId,
    name,
    max_patients_per_day: maxPatientsPerDay,
    work_days: workDaysJson,
  };
}

export function updateDoctor(
  id: number,
  name: string,
  maxPatientsPerDay: number,
  workDays: number[]
): Doctor | null {
  const workDaysJson = JSON.stringify(workDays);
  db.prepare(
    `UPDATE doctors SET name = ?, max_patients_per_day = ?, work_days = ? WHERE id = ?`
  ).run(name, maxPatientsPerDay, workDaysJson, id);
  return {
    id,
    name,
    max_patients_per_day: maxPatientsPerDay,
    work_days: workDaysJson,
  };
}

export function deleteDoctor(id: number): boolean {
  const result = db.prepare(`DELETE FROM doctors WHERE id = ?`).run(id);
  return result.changes > 0;
}