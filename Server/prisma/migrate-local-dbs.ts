/**
 * Скрипт переноса данных из старых локальных `ultrasound.db` (Desktop) в PostgreSQL.
 *
 * Запускается ОДИН раз на сервере:
 *   npx tsx prisma/migrate-local-dbs.ts --from <path1.db> [--from <path2.db> ...] [--to postgresql://...]
 *
 * — Данные Registry (registry.db) НЕ переносятся (БД стартует пустой).
 * — Таблица registry_appointments пропускается (удалена из новой архитектуры).
 * — Пациенты объединяются со всех баз, дубликаты по (ФИО, ДР) устраняются.
 */

import { PrismaClient, PaymentType } from "@prisma/client";
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

interface UserRow {
  id: number;
  username: string;
  password: string;
  name: string;
  organization: string | null;
  created_at: string;
  last_login: string | null;
}

interface PatientRow {
  id: number;
  last_name: string;
  first_name: string;
  middle_name: string | null;
  date_of_birth: string;
  created_at: string;
  updated_at: string;
}

interface ResearchRow {
  id: number;
  patient_id: number;
  research_date: string;
  payment_type: string;
  organization: string | null;
  doctor_name: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface ResearchStudyRow {
  id: number;
  research_id: number;
  study_type: string;
  study_data: string;
  created_at: string;
}

interface PrintBlockOverrideRow {
  research_id: number;
  block_id: string;
  block_text: string;
  updated_at: string;
}

interface MedisonMappingRow {
  id: number;
  user_id: number;
  measurement_id: string;
  target_study_type: string;
  target_field: string;
  transform: string | null;
  is_enabled: number;
  created_at: string;
  updated_at: string;
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

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.from.length === 0) {
    console.error(
      "Использование: npx tsx prisma/migrate-local-dbs.ts --from <path.db> [--from <path2.db> ...] [--to postgresql://...]"
    );
    process.exit(1);
  }

  const prisma = new PrismaClient({
    datasources: args.to ? { db: { url: args.to } } : undefined,
  });

  const summary: Record<string, number> = {
    users: 0,
    patients: 0,
    researches: 0,
    research_studies: 0,
    print_block_overrides: 0,
    medison_mappings: 0,
    duplicated_patients: 0,
  };

  try {
    // Маппинги oldId → newUuid
    const userIdMap = new Map<number, string>();
    const patientIdMap = new Map<number, string>();
    const researchIdMap = new Map<number, string>();

    // Дедупликация пациентов по (ФИО, ДР): сначала учитываем пациентов, уже
    // загруженных в PostgreSQL (например, из registry.db) — чтобы исследования
    // из ultrasound.db не создавали дубли между источниками.
    const patientKeys = new Map<string, string>();
    {
      const existingPatients = await prisma.patient.findMany({
        select: {
          id: true,
          lastName: true,
          firstName: true,
          middleName: true,
          dateOfBirth: true,
        },
      });
      for (const p of existingPatients) {
        const key = patientDedupKey(
          p.lastName,
          p.firstName,
          p.middleName,
          p.dateOfBirth
        );
        if (!patientKeys.has(key)) patientKeys.set(key, p.id);
      }
      console.log(
        `ℹ️ Уже загружено в PostgreSQL пациентов: ${existingPatients.length}`
      );
    }

    for (const dbPath of args.from) {
      console.log(`\n📂 Чтение базы: ${dbPath}`);
      const db = new Database(dbPath, { readonly: true });

      // ---------- USERS ----------
      const users = db
        .prepare(
          "SELECT id, username, password, name, organization, created_at, last_login FROM users"
        )
        .all() as UserRow[];

      for (const user of users) {
        await prisma.user.upsert({
          where: { username: user.username },
          update: {},
          create: {
            id: randomUUID(),
            username: user.username,
            password: user.password,
            name: user.name,
            organization: user.organization,
            searchText: user.name ? normalizeSearchText(user.name) : null,
          },
        });

        const created = await prisma.user.findUniqueOrThrow({
          where: { username: user.username },
        });
        userIdMap.set(user.id, created.id);
        summary.users++;
      }
      console.log(`  users: ${users.length}`);

      // ---------- PATIENTS (с дедупликацией по ФИО+ДР) ----------
      const patients = db
        .prepare(
          "SELECT id, last_name, first_name, middle_name, date_of_birth, created_at, updated_at FROM patients"
        )
        .all() as PatientRow[];

      for (const patient of patients) {
        const key = patientDedupKey(
          patient.last_name,
          patient.first_name,
          patient.middle_name,
          patient.date_of_birth
        );

        const existingId = patientKeys.get(key);
        if (existingId) {
          patientIdMap.set(patient.id, existingId);
          summary.duplicated_patients++;
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

        patientKeys.set(key, newId);
        patientIdMap.set(patient.id, newId);
        summary.patients++;
      }
      console.log(`  patients: ${patients.length} (дублей: ${patients.length - summary.patients})`);

      // ---------- RESEARCHES ----------
      const researches = db
        .prepare("SELECT * FROM researches")
        .all() as ResearchRow[];

      for (const research of researches) {
        const patientNewId = patientIdMap.get(research.patient_id);
        if (!patientNewId) continue;

        const paymentType: PaymentType =
          research.payment_type === "paid" ? "paid" : "oms";

        const newId = randomUUID();
        await prisma.research.create({
          data: {
            id: newId,
            patientId: patientNewId,
            researchDate: research.research_date,
            paymentType,
            organization: research.organization,
            doctorName: research.doctor_name,
            notes: research.notes,
          },
        });

        researchIdMap.set(research.id, newId);
        summary.researches++;
      }
      console.log(`  researches: ${researches.length}`);

      // ---------- RESEARCH_STUDIES ----------
      const studies = db
        .prepare("SELECT * FROM research_studies")
        .all() as ResearchStudyRow[];

      for (const study of studies) {
        const researchNewId = researchIdMap.get(study.research_id);
        if (!researchNewId) continue;

        let studyData: unknown = {};
        try {
          studyData = JSON.parse(study.study_data);
        } catch {
          studyData = { raw: study.study_data };
        }

        await prisma.researchStudy.create({
          data: {
            id: randomUUID(),
            researchId: researchNewId,
            studyType: study.study_type,
            studyData: studyData as object,
          },
        });
        summary.research_studies++;
      }
      console.log(`  research_studies: ${studies.length}`);

      // ---------- PRINT_BLOCK_OVERRIDES ----------
      const overrides = db
        .prepare("SELECT * FROM print_block_overrides")
        .all() as PrintBlockOverrideRow[];

      for (const o of overrides) {
        const researchNewId = researchIdMap.get(o.research_id);
        if (!researchNewId) continue;

        await prisma.printBlockOverride.upsert({
          where: { researchId_blockId: { researchId: researchNewId, blockId: o.block_id } },
          update: { blockText: o.block_text },
          create: {
            researchId: researchNewId,
            blockId: o.block_id,
            blockText: o.block_text,
          },
        });
        summary.print_block_overrides++;
      }
      console.log(`  print_block_overrides: ${overrides.length}`);

      // ---------- MEDISON_MAPPINGS ----------
      const mappings = db
        .prepare("SELECT * FROM medison_mappings")
        .all() as MedisonMappingRow[];

      for (const m of mappings) {
        const userNewId = userIdMap.get(m.user_id);
        if (!userNewId) continue;

        await prisma.medisonMapping.create({
          data: {
            id: randomUUID(),
            userId: userNewId,
            measurementId: m.measurement_id,
            targetStudyType: m.target_study_type,
            targetField: m.target_field,
            transform: m.transform || "number->string",
            isEnabled: !!m.is_enabled,
          },
        });
        summary.medison_mappings++;
      }
      console.log(`  medison_mappings: ${mappings.length}`);

      // registry_appointments — пропускаем (таблица удалена из новой архитектуры)

      db.close();
    }

    console.log("\n========================================");
    console.log("📊 Сводка миграции:");
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