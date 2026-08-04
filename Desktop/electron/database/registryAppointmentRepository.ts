// // ultrasound/frontend/electron/database/registryAppointmentRepository.ts
import type Database from "better-sqlite3";

export interface CachedRegistryAppointment {
  sourceIp: string;
  sourceName: string;
  appointment: {
    id: number;
    patient_id: number;
    appointment_date: string;
    studies: string[];
    department?: string;
    created_at: string;
    patient?: {
      id: number;
      last_name: string;
      first_name: string;
      middle_name: string;
      date_of_birth: string;
    };
  };
  cachedAt: string;
}

interface RegistryAppointmentRow {
  source_ip: string;
  source_name: string;
  appointment_id: number;
  appointment_date: string;
  studies: string;
  department: string | null;
  patient_id: number | null;
  patient_last_name: string | null;
  patient_first_name: string | null;
  patient_middle_name: string | null;
  patient_date_of_birth: string | null;
  cached_at: string;
}

function rowToCachedAppointment(row: RegistryAppointmentRow): CachedRegistryAppointment {
  let studies: string[] = [];
  try {
    const parsed = JSON.parse(row.studies);
    if (Array.isArray(parsed)) {
      studies = parsed;
    }
  } catch {
    studies = [];
  }

  const patient =
    row.patient_id !== null &&
    row.patient_last_name !== null &&
    row.patient_first_name !== null
      ? {
          id: row.patient_id,
          last_name: row.patient_last_name,
          first_name: row.patient_first_name,
          middle_name: row.patient_middle_name ?? "",
          date_of_birth: row.patient_date_of_birth ?? "",
        }
      : undefined;

  return {
    sourceIp: row.source_ip,
    sourceName: row.source_name,
    appointment: {
      id: row.appointment_id,
      patient_id: row.patient_id ?? row.appointment_id,
      appointment_date: row.appointment_date,
      studies,
      department: row.department ?? undefined,
      created_at: row.cached_at,
      patient,
    },
    cachedAt: row.cached_at,
  };
}

export class RegistryAppointmentRepository {
  constructor(private db: Database.Database) {}

  getAll(): CachedRegistryAppointment[] {
    const rows = this.db
      .prepare("SELECT * FROM registry_appointments ORDER BY appointment_date, appointment_id")
      .all() as RegistryAppointmentRow[];
    return rows.map(rowToCachedAppointment);
  }

  getByDate(date: string, sourceIps: string[]): CachedRegistryAppointment[] {
    if (sourceIps.length === 0) return [];
    const placeholders = sourceIps.map(() => "?").join(", ");
    const rows = this.db
      .prepare(
        `SELECT * FROM registry_appointments
         WHERE appointment_date = ?
           AND source_ip IN (${placeholders})
         ORDER BY appointment_id`,
      )
      .all(date, ...sourceIps) as RegistryAppointmentRow[];
    return rows.map(rowToCachedAppointment);
  }

  /** Полная замена кэша записей регистратур (в транзакции). */
  replaceAll(appointments: CachedRegistryAppointment[]): void {
    const insert = this.db.prepare(
      `INSERT OR REPLACE INTO registry_appointments
        (source_ip, source_name, appointment_id, appointment_date, studies, department,
         patient_id, patient_last_name, patient_first_name, patient_middle_name,
         patient_date_of_birth, cached_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    );

    const clear = this.db.prepare("DELETE FROM registry_appointments");

    this.db.transaction(() => {
      clear.run();
      for (const entry of appointments) {
        insert.run(
          entry.sourceIp,
          entry.sourceName,
          entry.appointment.id,
          entry.appointment.appointment_date,
          JSON.stringify(entry.appointment.studies || []),
          entry.appointment.department ?? null,
          entry.appointment.patient?.id ?? null,
          entry.appointment.patient?.last_name ?? null,
          entry.appointment.patient?.first_name ?? null,
          entry.appointment.patient?.middle_name ?? null,
          entry.appointment.patient?.date_of_birth ?? null,
          entry.cachedAt || new Date().toISOString(),
        );
      }
    })();
  }

  clear(): void {
    this.db.prepare("DELETE FROM registry_appointments").run();
  }
}