import { Router } from "express";
import { prisma } from "../lib/prisma.js";

const router = Router();

interface JournalEntry {
  patient: {
    id: string;
    last_name: string;
    first_name: string;
    middle_name: string | null;
    date_of_birth: string;
    created_at: Date;
    updated_at: Date;
  };
  researches: Array<{
    id: string;
    patient_id: string;
    research_date: string;
    payment_type: "oms" | "paid";
    doctor_name: string | null;
    notes: string | null;
    created_at: Date;
    updated_at: Date;
    study_types: string[];
  }>;
}

function buildJournalEntry(
  research: {
    id: string;
    userId: string | null;
    patientId: string;
    researchDate: string;
    paymentType: "oms" | "paid";
    organization: string | null;
    doctorName: string | null;
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
    studies: { studyType: string }[];
    patient: {
      id: string;
      lastName: string;
      firstName: string;
      middleName: string | null;
      dateOfBirth: string;
      createdAt: Date;
      updatedAt: Date;
    };
  }
): JournalEntry {
  return {
    patient: {
      id: research.patient.id,
      last_name: research.patient.lastName,
      first_name: research.patient.firstName,
      middle_name: research.patient.middleName,
      date_of_birth: research.patient.dateOfBirth,
      created_at: research.patient.createdAt,
      updated_at: research.patient.updatedAt,
    },
    researches: [
      {
        id: research.id,
        patient_id: research.patientId,
        research_date: research.researchDate,
        payment_type: research.paymentType,
        doctor_name: research.doctorName,
        notes: research.notes,
        created_at: research.createdAt,
        updated_at: research.updatedAt,
        study_types: research.studies.map((s) => s.studyType),
      },
    ],
  };
}

// GET /api/journal?date=YYYY-MM-DD | ?from=&to=
router.get("/", async (req, res, next) => {
  try {
    const date = typeof req.query.date === "string" ? req.query.date : "";
    const from = typeof req.query.from === "string" ? req.query.from : "";
    const to = typeof req.query.to === "string" ? req.query.to : "";

    let startDate: string;
    let endDate: string;
    if (date) {
      startDate = date;
      endDate = date;
    } else if (from && to) {
      startDate = from;
      endDate = to;
    } else {
      res.status(400).json({ error: "Укажите date или from+to" });
      return;
    }

    const researches = await prisma.research.findMany({
      where: {
        researchDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        studies: { select: { studyType: true }, orderBy: { createdAt: "asc" } },
        patient: true,
      },
      orderBy: [{ researchDate: "asc" }, { createdAt: "asc" }],
    });

    // Группировка по пациентам (как в JournalRepository Desktop)
    const map = new Map<string, JournalEntry>();
    for (const r of researches) {
      let entry = map.get(r.patientId);
      if (!entry) {
        entry = buildJournalEntry(r as never);
        map.set(r.patientId, entry);
      } else {
        entry.researches.push({
          id: r.id,
          patient_id: r.patientId,
          research_date: r.researchDate,
          payment_type: r.paymentType,
          doctor_name: r.doctorName,
          notes: r.notes,
          created_at: r.createdAt,
          updated_at: r.updatedAt,
          study_types: r.studies.map((s) => s.studyType),
        });
      }
    }

    const entries = Array.from(map.values())
      .flatMap((e) => e.researches.map((r) => ({ patient: e.patient, research: r })))
      .sort((a, b) => a.research.research_date.localeCompare(b.research.research_date));

    const result: JournalEntry[] = [];
    const seen = new Map<string, number>();
    for (const { patient, research } of entries) {
      const key = patient.id;
      const idx = seen.get(key);
      if (idx === undefined) {
        seen.set(key, result.length);
        result.push({ patient, researches: [research] });
      } else {
        result[idx].researches.push(research);
      }
    }

    res.json(result);
  } catch (err) {
    next(err);
  }
});

// GET /api/journal/doctors — список врачей
router.get("/doctors", async (_req, res, next) => {
  try {
    const rows = await prisma.research.findMany({
      where: {
        doctorName: { not: null },
      },
      select: { doctorName: true },
      distinct: ["doctorName"],
      orderBy: { doctorName: "asc" },
    });

    const doctors = rows
      .map((r) => (r.doctorName ?? "").trim())
      .filter((name) => name !== "");

    res.json(doctors);
  } catch (err) {
    next(err);
  }
});

export default router;