"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initDb = initDb;
exports.getAppointmentsByDate = getAppointmentsByDate;
exports.createAppointment = createAppointment;
exports.updateAppointment = updateAppointment;
exports.deleteAppointment = deleteAppointment;
exports.getDoctors = getDoctors;
exports.createDoctor = createDoctor;
exports.updateDoctor = updateDoctor;
exports.deleteDoctor = deleteDoctor;
const sql_js_1 = __importDefault(require("sql.js"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function getDbPath() {
    try {
        const { app } = require("electron");
        if (app?.getPath) {
            return path_1.default.join(app.getPath("userData"), "registry.db");
        }
    }
    catch {
        // Вне Electron
    }
    return path_1.default.join(__dirname, "..", "registry.db");
}
const DB_PATH = getDbPath();
let db = null;
let SQL = null;
function saveDb() {
    if (!db)
        return;
    const data = db.export();
    const buffer = Buffer.from(data);
    fs_1.default.writeFileSync(DB_PATH, buffer);
}
async function initDb() {
    SQL = await (0, sql_js_1.default)();
    if (fs_1.default.existsSync(DB_PATH)) {
        const fileBuffer = fs_1.default.readFileSync(DB_PATH);
        db = new SQL.Database(fileBuffer);
    }
    else {
        db = new SQL.Database();
    }
    db.run("PRAGMA foreign_keys = ON");
    initSchema();
    saveDb();
}
function initSchema() {
    if (!db)
        return;
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
    }
    catch {
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
function getAppointmentsByDate(date) {
    if (!db)
        return [];
    const stmt = db.prepare(`
    SELECT a.*, p.id as p_id, p.last_name, p.first_name, p.middle_name, p.date_of_birth
    FROM appointments a
    JOIN patients p ON p.id = a.patient_id
    WHERE a.appointment_date = ?
    ORDER BY a.created_at ASC
  `);
    stmt.bind([date]);
    const rows = [];
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
function createAppointment(patientData, appointmentDate, studies) {
    if (!db)
        throw new Error("Database not initialized");
    // Ищем существующего пациента
    const findStmt = db.prepare(`SELECT id FROM patients WHERE last_name = ? AND first_name = ? AND date_of_birth = ?`);
    findStmt.bind([patientData.last_name, patientData.first_name, patientData.date_of_birth]);
    let patientId = null;
    if (findStmt.step()) {
        const row = findStmt.getAsObject();
        patientId = row.id;
    }
    findStmt.free();
    if (patientId) {
        db.run(`UPDATE patients SET middle_name = ? WHERE id = ?`, [
            patientData.middle_name,
            patientId,
        ]);
    }
    else {
        db.run(`INSERT INTO patients (last_name, first_name, middle_name, date_of_birth) VALUES (?, ?, ?, ?)`, [patientData.last_name, patientData.first_name, patientData.middle_name, patientData.date_of_birth]);
        patientId = db.exec("SELECT last_insert_rowid() as id")[0]?.values[0]?.[0];
    }
    const department = patientData.department || "";
    db.run(`INSERT INTO appointments (patient_id, appointment_date, studies, department) VALUES (?, ?, ?, ?)`, [patientId, appointmentDate, JSON.stringify(studies), department]);
    const newId = db.exec("SELECT last_insert_rowid() as id")[0]?.values[0]?.[0];
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
function updateAppointment(id, studies) {
    if (!db)
        return null;
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
    let row = null;
    if (stmt.step()) {
        row = stmt.getAsObject();
    }
    stmt.free();
    if (!row)
        return null;
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
function deleteAppointment(id) {
    if (!db)
        return false;
    const result = db.run(`DELETE FROM appointments WHERE id = ?`, [id]);
    saveDb();
    return result.changes > 0;
}
// Doctors CRUD
function getDoctors() {
    if (!db)
        return [];
    const stmt = db.prepare(`SELECT * FROM doctors ORDER BY name ASC`);
    const rows = [];
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
function createDoctor(name, maxPatientsPerDay, workDays) {
    if (!db)
        throw new Error("Database not initialized");
    const workDaysJson = JSON.stringify(workDays);
    db.run(`INSERT INTO doctors (name, max_patients_per_day, work_days) VALUES (?, ?, ?)`, [name, maxPatientsPerDay, workDaysJson]);
    const newId = db.exec("SELECT last_insert_rowid() as id")[0]?.values[0]?.[0];
    saveDb();
    return { id: newId, name, max_patients_per_day: maxPatientsPerDay, work_days: workDaysJson };
}
function updateDoctor(id, name, maxPatientsPerDay, workDays) {
    if (!db)
        return null;
    const workDaysJson = JSON.stringify(workDays);
    db.run(`UPDATE doctors SET name = ?, max_patients_per_day = ?, work_days = ? WHERE id = ?`, [name, maxPatientsPerDay, workDaysJson, id]);
    saveDb();
    return { id, name, max_patients_per_day: maxPatientsPerDay, work_days: workDaysJson };
}
function deleteDoctor(id) {
    if (!db)
        return false;
    const result = db.run(`DELETE FROM doctors WHERE id = ?`, [id]);
    saveDb();
    return result.changes > 0;
}
//# sourceMappingURL=db.js.map