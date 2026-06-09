import initSqlJs, { Database as SqlJsDatabase } from "sql.js";
import fs from "fs";
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

let db: SqlJsDatabase | null = null;
let SQL: Awaited<ReturnType<typeof initSqlJs>> | null = null;

function saveDb() {
  if (!db) return;
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);
}

export async function initDb(): Promise<void> {
  SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  db.run("PRAGMA foreign_keys = ON");
  initSchema();
  saveDb();
}

function initSchema() {
  if (!db) return;
  db.run(`
    CREATE TABLE IF NOT EXISTS patients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      last_name TEXT NOT NULL,
      first_name TEXT NOT NULL,
      middle_name TEXT DEFAULT '',
      date_of_birth TEXT NOT NULL
    );
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS appointments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
      appointment_date TEXT NOT NULL,
      studies TEXT NOT NULL DEFAULT '[]',
      department TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);
  db.run(`
    CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
  `);
  // Добавляем колонку department, если её нет (для существующих БД)
  try {
    db.run(`ALTER TABLE appointments ADD COLUMN department TEXT DEFAULT ''`);
  } catch {
    // Колонка уже существует
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS doctors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      max_patients_per_day INTEGER NOT NULL DEFAULT 15,
      work_days TEXT NOT NULL DEFAULT '[1,2,3,4,5]'
    );
  `);
}

export interface Doctor {
  id: number;
  name: string;
  max_patients_per_day: number;
  work_days: string; // JSON array of numbers [1,2,3,...]
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
  if (!db) return [];

  const stmt = db.prepare(`
    SELECT a.*, p.id as p_id, p.last_name, p.first_name, p.middle_name, p.date_of_birth
    FROM appointments a
    JOIN patients p ON p.id = a.patient_id
    WHERE a.appointment_date = ?
    ORDER BY a.created_at ASC
  `);
  stmt.bind([date]);

  const rows: any[] = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();

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
  if (!db) throw new Error("Database not initialized");

  // Ищем существующего пациента
  const findStmt = db.prepare(
    `SELECT id FROM patients WHERE last_name = ? AND first_name = ? AND date_of_birth = ?`
  );
  findStmt.bind([patientData.last_name, patientData.first_name, patientData.date_of_birth]);

  let patientId: number | null = null;
  if (findStmt.step()) {
    const row = findStmt.getAsObject() as { id: number };
    patientId = row.id;
  }
  findStmt.free();

  if (patientId) {
    db.run(`UPDATE patients SET middle_name = ? WHERE id = ?`, [
      patientData.middle_name,
      patientId,
    ]);
  } else {
    db.run(
      `INSERT INTO patients (last_name, first_name, middle_name, date_of_birth) VALUES (?, ?, ?, ?)`,
      [patientData.last_name, patientData.first_name, patientData.middle_name, patientData.date_of_birth]
    );
    patientId = (db.exec("SELECT last_insert_rowid() as id")[0]?.values[0]?.[0] as number);
  }

  const department = patientData.department || "";

  db.run(
    `INSERT INTO appointments (patient_id, appointment_date, studies, department) VALUES (?, ?, ?, ?)`,
    [patientId, appointmentDate, JSON.stringify(studies), department]
  );

  const newId = db.exec("SELECT last_insert_rowid() as id")[0]?.values[0]?.[0] as number;

  saveDb();

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

export function updateAppointment(id: number, studies: string[]): Appointment | null {
  if (!db) return null;

  db.run(`UPDATE appointments SET studies = ? WHERE id = ?`, [
    JSON.stringify(studies),
    id,
  ]);

  const stmt = db.prepare(`
    SELECT a.*, p.id as p_id, p.last_name, p.first_name, p.middle_name, p.date_of_birth
    FROM appointments a
    JOIN patients p ON p.id = a.patient_id
    WHERE a.id = ?
  `);
  stmt.bind([id]);

  let row: any = null;
  if (stmt.step()) {
    row = stmt.getAsObject();
  }
  stmt.free();

  if (!row) return null;

  saveDb();

  return {
    id: row.id,
    patient_id: row.patient_id,
    appointment_date: row.appointment_date,
    studies: JSON.parse(row.studies || "[]"),
    created_at: row.created_at,
    patient: {
      id: row.p_id,
      last_name: row.last_name,
      first_name: row.first_name,
      middle_name: row.middle_name || "",
      date_of_birth: row.date_of_birth,
    },
  };
}

export function deleteAppointment(id: number): boolean {
  if (!db) return false;

  const result = db.run(`DELETE FROM appointments WHERE id = ?`, [id]);
  saveDb();
  return result.changes > 0;
}

// Doctors CRUD
export function getDoctors(): Doctor[] {
  if (!db) return [];
  const stmt = db.prepare(`SELECT * FROM doctors ORDER BY name ASC`);
  const rows: any[] = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    max_patients_per_day: row.max_patients_per_day,
    work_days: row.work_days,
  }));
}

export function createDoctor(name: string, maxPatientsPerDay: number, workDays: number[]): Doctor {
  if (!db) throw new Error("Database not initialized");
  const workDaysJson = JSON.stringify(workDays);
  db.run(
    `INSERT INTO doctors (name, max_patients_per_day, work_days) VALUES (?, ?, ?)`,
    [name, maxPatientsPerDay, workDaysJson]
  );
  const newId = db.exec("SELECT last_insert_rowid() as id")[0]?.values[0]?.[0] as number;
  saveDb();
  return { id: newId, name, max_patients_per_day: maxPatientsPerDay, work_days: workDaysJson };
}

export function updateDoctor(id: number, name: string, maxPatientsPerDay: number, workDays: number[]): Doctor | null {
  if (!db) return null;
  const workDaysJson = JSON.stringify(workDays);
  db.run(
    `UPDATE doctors SET name = ?, max_patients_per_day = ?, work_days = ? WHERE id = ?`,
    [name, maxPatientsPerDay, workDaysJson, id]
  );
  saveDb();
  return { id, name, max_patients_per_day: maxPatientsPerDay, work_days: workDaysJson };
}

export function deleteDoctor(id: number): boolean {
  if (!db) return false;
  const result = db.run(`DELETE FROM doctors WHERE id = ?`, [id]);
  saveDb();
  return result.changes > 0;
}
