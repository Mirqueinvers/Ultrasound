/**
 * Скрипт переноса данных из старой базы регистратуры (registry.db) в PostgreSQL.
 *
 * Запускается на сервере (повторный запуск безопасен — дубли не создаются):
 *   npx tsx prisma/migrate-registry-db.ts --from <path.db> [--to postgresql://...]
 *
 * Переносит:
 *   - patients      -> patients       (дедупликация по нормализованному ФИО+ДР,
 *                                       с учётом пациентов, уже загруженных
 *                                       в PostgreSQL, например из ultrasound.db);
 *   - doctors       -> doctors        (повторно существующие врачи пропускаются);
 *   - appointments  -> appointments   (studies из JSON-строки в массив строк;
 *                                       перед вставкой проверяется совпадение,
 *                                       чтобы повторный запуск не создал дубли).
 */

import { Prisma, PrismaClient } from "@prisma/client";
// better-sqlite3 v11 без встроенных типов — типы в prisma/better-sqlite3.d.ts
import Database from "better-sqlite3";
import { randomUUID } from "node:crypto";

interface CliArgs {
  from: string[];
  to?: string;
}

function parseArgs(argv: string[]): CliArgs {
  const from: string[] = [];
  let to: string | undefined;

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--from" && argv[i + 1]) {
      from.push(argv[++i]);
    } else if (arg === "--to" && argv[i + 1]) {
      to = argv[++i];
    }
  }

  const urlIndex = argv.findIndex((a) => a.startsWith("postgresql://"));
  if (urlIndex !== -1) {
    to = to || argv[urlIndex].split("=")[1] || argv[urlIndex];
  }

  return { from, to };
}

interface PatientRow {
  id: number;
  last_name: string;
  first_name: string;
  middle_name: string | null;
  date_of_birth: string;
}

interface DoctorRow {
  id: number;
  name: string;
  max_patients_per_day: number;
  work_days: string | null;
}

interface AppointmentRow {
  id: number;
  patient_id: number;
  appointment_date: string;
  studies: string | null;
  department: string | null;
  created_at: string | null;
}

function normalizeSearchText(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/[^0-9а-я]/g, "");
}

/** Приводит дату рождения к виду YYYYMMDD (поддерживает ДД.ММ.ГГГГ и ГГГГ-ММ-ДД). */
function canonicalDateOfBirth(value: string): string {
  const s = String(value ?? "").trim();
  const ddmmyyyy = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(s);
  if (ddmmyyyy) return `${ddmmyyyy[3]}${ddmmyyyy[2]}${ddmmyyyy[1]}`;
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (iso) return `${iso[1]}${iso[2]}${iso[3]}`;
  return s.replace(/\D/g, "");
}

/** Ключ дедупликации пациента: нормализованное ФИО + каноническая дата рождения. */
function patientDedupKey(
  lastName: string,
  firstName: string,
  middleName: string | null | undefined,
  dateOfBirth: string
): string {
  const namePart = normalizeSearchText(
    `${lastName} ${firstName} ${middleName || ""}`
  );
  return `${namePart} ${canonicalDateOfBirth(dateOfBirth)}`;
}

function buildPatientSearchText(params: {
  lastName: string;
  firstName: string;
  middleName?: string | null;
  dateOfBirth: string;
}): string {
  const initials =
    String(params.lastName ?? "").charAt(0) +
    String(params.firstName ?? "").charAt(0) +
    String(params.middleName ?? "").charAt(0);

  const fullName = `${params.lastName} ${params.firstName} ${
    params.middleName || ""
  }`
    .trim()
    .toLowerCase()
    .replace(/ё/g, "е");

  const dobCode = String(params.dateOfBirth ?? "")
    .replace(/-/g, "")
    .replace(/ё/g, "е");

  return `${fullName} ${initials}${dobCode} ${dobCode}`.toLowerCase();
}

/** Разбор work_days врача: JSON-строка вида "[1,3]" -> массив чисел. */
function parseWorkDays(value: string | null): number[] {
  if (typeof value === "string") {
    try {
      const parsed: unknown = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.filter((x): x is number => typeof x === "number");
      }
    } catch {
      // не JSON
    }
  }
  return [];
}

/** Разбор studies записи: JSON-строка вида '["Почки"]' -> массив строк. */
function parseStudies(value: string | null): string[] {
  if (typeof value === "string") {
    try {
      const parsed: unknown = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.filter((x): x is string => typeof x === "string");
      }
    } catch {
      // не JSON
    }
    const trimmed = value.trim();
    if (trimmed) return [trimmed];
  }
  return [];
}

/** Разбор даты SQLite ("2026-08-26 06:36:39") в Date. */
function parseSqliteDate(value: string | null): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.from.length === 0) {
    console.error(
      "Использование: npx tsx prisma/migrate-registry-db.ts --from <path.db> [--to postgresql://...]"
    );
    process.exit(1);
  }

  const prisma = new PrismaClient({
    datasources: args.to ? { db: { url: args.to } } : undefined,
  });

  const summary: Record<string, number> = {
    patients: 0,
    doctors: 0,
    appointments: 0,
    skipped_duplicate_patients: 0,
    skipped_duplicate_doctors: 0,
    skipped_orphan_appointments: 0,
    skipped_duplicate_appointments: 0,
  };

  try {
    // Пациенты, уже загруженные в PostgreSQL (например, из ultrasound.db) —
    // чтобы между источниками не было дублей.
    const existingPatients = await prisma.patient.findMany({
      select: {
        id: true,
        lastName: true,
        firstName: true,
        middleName: true,
        dateOfBirth: true,
      },
    });
    const existingPatientKeys = new Map<string, string>();
    for (const p of existingPatients) {
      const key = patientDedupKey(
        p.lastName,
        p.firstName,
        p.middleName,
        p.dateOfBirth
      );
      if (!existingPatientKeys.has(key)) existingPatientKeys.set(key, p.id);
    }
    console.log(
      `ℹ️ В PostgreSQL уже ${existingPatients.length} пациентов (учитываются при дедупликации).`
    );

    for (const dbPath of args.from) {
      console.log(`\n📂 Чтение базы: ${dbPath}`);
      const db = new Database(dbPath, { readonly: true, fileMustExist: true });

      // ---------- PATIENTS ----------
      const patients = db
        .prepare(
          "SELECT id, last_name, first_name, middle_name, date_of_birth FROM patients"
        )
        .all() as PatientRow[];

      // Маппинг oldId -> newUuid
      const patientIdMap = new Map<number, string>();

      for (const patient of patients) {
        const key = patientDedupKey(
          patient.last_name,
          patient.first_name,
          patient.middle_name,
          patient.date_of_birth
        );

        const existingId =
          patientIdMap.get(patient.id) || existingPatientKeys.get(key);
        if (existingId) {
          patientIdMap.set(patient.id, existingId);
          summary.skipped_duplicate_patients++;
          continue;
        }

        const newId = randomUUID();
        await prisma.patient.create({
          data: {
            id: newId,
            lastName: patient.last_name,
            firstName: patient.first_name,
            middleName: patient.middle_name || null,
            dateOfBirth: patient.date_of_birth,
            searchText: buildPatientSearchText({
              lastName: patient.last_name,
              firstName: patient.first_name,
              middleName: patient.middle_name,
              dateOfBirth: patient.date_of_birth,
            }),
          },
        });

        existingPatientKeys.set(key, newId);
        patientIdMap.set(patient.id, newId);
        summary.patients++;
      }
      console.log(
        `  patients: ${patients.length} (перенесено: ${summary.patients}, дублей: ${summary.skipped_duplicate_patients})`
      );

      // ---------- DOCTORS ----------
      const doctors = db
        .prepare(
          "SELECT id, name, max_patients_per_day, work_days FROM doctors"
        )
        .all() as DoctorRow[];

      for (const doctor of doctors) {
        const existing = await prisma.doctor.findFirst({
          where: { name: doctor.name },
          select: { id: true },
        });
        if (existing) {
          summary.skipped_duplicate_doctors++;
          continue;
        }

        await prisma.doctor.create({
          data: {
            id: randomUUID(),
            name: doctor.name,
            maxPatientsPerDay: doctor.max_patients_per_day,
            workDays: parseWorkDays(doctor.work_days) as Prisma.InputJsonValue,
          },
        });
        summary.doctors++;
      }
      console.log(
        `  doctors: ${doctors.length} (перенесено: ${summary.doctors}, уже были: ${summary.skipped_duplicate_doctors})`
      );

      // ---------- APPOINTMENTS ----------
      const appointments = db
        .prepare("SELECT * FROM appointments")
        .all() as AppointmentRow[];

      for (const appt of appointments) {
        const patientNewId = patientIdMap.get(appt.patient_id);
        if (!patientNewId) {
          summary.skipped_orphan_appointments++;
          continue;
        }

        const studies = parseStudies(appt.studies);

        // Защита от повторного запуска: точное совпадение не вставляем повторно.
        const existing = await prisma.appointment.findFirst({
          where: {
            patientId: patientNewId,
            appointmentDate: appt.appointment_date,
            studies: { equals: studies as Prisma.InputJsonValue },
          },
          select: { id: true },
        });
        if (existing) {
          summary.skipped_duplicate_appointments++;
          continue;
        }

        await prisma.appointment.create({
          data: {
            id: randomUUID(),
            patientId: patientNewId,
            appointmentDate: appt.appointment_date,
            studies: studies as Prisma.InputJsonValue,
            department: appt.department || null,
            ...(appt.created_at
              ? { createdAt: parseSqliteDate(appt.created_at) ?? undefined }
              : {}),
          },
        });
        summary.appointments++;
      }
      console.log(
        `  appointments: ${appointments.length} (перенесено: ${summary.appointments}, дублей: ${summary.skipped_duplicate_appointments}, без пациента: ${summary.skipped_orphan_appointments})`
      );

      db.close();
    }

    console.log("\n========================================");
    console.log("📊 Сводка миграции Registry:");
    for (const [key, value] of Object.entries(summary)) {
      console.log(`  ${key}: ${value}`);
    }
    console.log("========================================");
  } catch (error) {
    console.error("Ошибка миграции:", error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();
