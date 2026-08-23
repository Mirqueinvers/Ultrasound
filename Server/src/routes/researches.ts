import { Router } from "express";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { normalizeSearchText } from "../utils/search.js";

const router = Router();

const researchSchema = z.object({
  patientId: z.string().min(1),
  researchDate: z.string().min(1),
  paymentType: z.enum(["oms", "paid"]),
  organization: z.string().optional().nullable(),
  doctorName: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

const createSchema = researchSchema;
const updateSchema = researchSchema.partial();

const studySchema = z.object({
  studyType: z.string().min(1),
  studyData: z.unknown(),
});

type ResearchRow = Prisma.ResearchGetPayload<{ include: { studies: true } }>;
type ResearchWithPatient = Prisma.ResearchGetPayload<{
  include: { studies: true; patient: true };
}>;

function serializeResearch(r: ResearchRow) {
  return {
    id: r.id,
    patient_id: r.patientId,
    research_date: r.researchDate,
    payment_type: r.paymentType,
    organization: r.organization,
    doctor_name: r.doctorName,
    notes: r.notes,
    created_at: r.createdAt,
    updated_at: r.updatedAt,
    studies: r.studies.map((s) => ({
      id: s.id,
      research_id: s.researchId,
      study_type: s.studyType,
      study_data: s.studyData,
      created_at: s.createdAt,
    })),
  };
}

function serializeResearchWithPatient(r: ResearchWithPatient) {
  return {
    ...serializeResearch(r),
    patient: r.patient
      ? {
          id: r.patient.id,
          last_name: r.patient.lastName,
          first_name: r.patient.firstName,
          middle_name: r.patient.middleName,
          date_of_birth: r.patient.dateOfBirth,
        }
      : undefined,
  };
}

// GET /api/researches — список; ?patientId=, ?q=, ?limit=, ?offset=
router.get("/", async (req, res, next) => {
  try {
    const patientId = typeof req.query.patientId === "string" ? req.query.patientId : "";
    const search = typeof req.query.q === "string" ? req.query.q : "";
    const limit = Math.min(Math.max(parseInt(String(req.query.limit ?? "100"), 10) || 100, 1), 500);
    const offset = Math.max(parseInt(String(req.query.offset ?? "0"), 10) || 0, 0);

    let where: Prisma.ResearchWhereInput = {};
    if (patientId) {
      where = { patientId };
    }
    if (search) {
      const normalized = normalizeSearchText(search);
      where = {
        ...where,
        OR: [
          { patient: { lastName: { contains: search, mode: "insensitive" } } },
          { patient: { firstName: { contains: search, mode: "insensitive" } } },
          { patient: { middleName: { contains: search, mode: "insensitive" } } },
          { patient: { dateOfBirth: { contains: search, mode: "insensitive" } } },
          { patient: { searchText: { contains: normalized } } },
          { researchDate: { contains: search, mode: "insensitive" } },
          { id: { contains: search, mode: "insensitive" } },
        ],
      };
    }

    const [total, researches] = await Promise.all([
      prisma.research.count({ where }),
      prisma.research.findMany({
        where,
        include: { studies: true, patient: true },
        orderBy: [{ researchDate: "desc" }, { createdAt: "desc" }],
        take: limit,
        skip: offset,
      }),
    ]);

    res.json({
      researches: researches.map((r) => serializeResearchWithPatient(r as ResearchWithPatient)),
      total,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/researches
router.post("/", async (req, res, next) => {
  try {
    const data = createSchema.parse(req.body);
    const research = await prisma.research.create({
      data: {
        patientId: data.patientId,
        researchDate: data.researchDate,
        paymentType: data.paymentType,
        organization: data.organization || null,
        doctorName: data.doctorName || null,
        notes: data.notes || null,
      },
      include: { studies: true },
    });
    res.status(201).json({
      success: true,
      message: "Исследование создано",
      researchId: research.id,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/researches/:id/studies
router.post("/:id/studies", async (req, res, next) => {
  try {
    const data = studySchema.parse(req.body);
    const existing = await prisma.research.findUnique({ where: { id: req.params.id }, select: { id: true } });
    if (!existing) {
      res.status(404).json({ error: "Исследование не найдено" });
      return;
    }

    const study = await prisma.researchStudy.create({
      data: {
        researchId: req.params.id,
        studyType: data.studyType,
        studyData: (data.studyData ?? {}) as Prisma.InputJsonValue,
      },
    });

    res.status(201).json({
      success: true,
      message: "Исследование добавлено",
      studyId: study.id,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/researches/search?q=
router.get("/search", async (req, res, next) => {
  try {
    const q = typeof req.query.q === "string" ? req.query.q : "";
    if (!q.trim()) {
      res.json({ researches: [], total: 0 });
      return;
    }
    const limit = Math.min(Math.max(parseInt(String(req.query.limit ?? "50"), 10) || 50, 1), 500);
    const normalized = normalizeSearchText(q);

    const researches = await prisma.research.findMany({
      where: {
        OR: [
          { patient: { lastName: { contains: q, mode: "insensitive" } } },
          { patient: { firstName: { contains: q, mode: "insensitive" } } },
          { patient: { middleName: { contains: q, mode: "insensitive" } } },
          { patient: { searchText: { contains: normalized } } },
          { patient: { dateOfBirth: { contains: q, mode: "insensitive" } } },
          { researchDate: { contains: q, mode: "insensitive" } },
          { id: { contains: q, mode: "insensitive" } },
        ],
      },
      include: { studies: true, patient: true },
      orderBy: [{ researchDate: "desc" }, { createdAt: "desc" }],
      take: limit,
    });

    res.json({
      researches: researches.map((r) => serializeResearchWithPatient(r as ResearchWithPatient)),
      total: researches.length,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/researches/:id
router.get("/:id", async (req, res, next) => {
  try {
    const research = await prisma.research.findUnique({
      where: { id: req.params.id },
      include: { studies: true, patient: true },
    });
    if (!research) {
      res.status(404).json({ error: "Исследование не найдено" });
      return;
    }
    res.json(serializeResearchWithPatient(research as ResearchWithPatient));
  } catch (err) {
    next(err);
  }
});

// PUT /api/researches/:id
router.put("/:id", async (req, res, next) => {
  try {
    const data = updateSchema.parse(req.body);
    const existing = await prisma.research.findUnique({ where: { id: req.params.id }, select: { id: true } });
    if (!existing) {
      res.status(404).json({ error: "Исследование не найдено" });
      return;
    }

    await prisma.research.update({
      where: { id: req.params.id },
      data: {
        ...(data.researchDate !== undefined ? { researchDate: data.researchDate } : {}),
        ...(data.paymentType !== undefined ? { paymentType: data.paymentType } : {}),
        ...(data.organization !== undefined ? { organization: data.organization } : {}),
        ...(data.doctorName !== undefined ? { doctorName: data.doctorName } : {}),
        ...(data.notes !== undefined ? { notes: data.notes } : {}),
      },
    });

    res.json({ success: true, message: "Исследование обновлено" });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/researches/:id
router.delete("/:id", async (req, res, next) => {
  try {
    const existing = await prisma.research.findUnique({ where: { id: req.params.id }, select: { id: true } });
    if (!existing) {
      res.status(404).json({ error: "Исследование не найдено" });
      return;
    }
    await prisma.research.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: "Исследование удалено" });
  } catch (err) {
    next(err);
  }
});

export default router;