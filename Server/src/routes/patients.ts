import { Router } from "express";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { buildPatientSearchText, normalizeSearchText } from "../utils/search.js";

const router = Router();

const patientSchema = z.object({
  lastName: z.string().min(1, "Фамилия обязательна"),
  firstName: z.string().min(1, "Имя обязательно"),
  middleName: z.string().optional().nullable(),
  dateOfBirth: z.string().min(1, "Дата рождения обязательна"),
});

const createSchema = patientSchema;
const updateSchema = patientSchema.partial();

/** Сериализация: ответ сервера — в snake_case (как текущие репозитории Desktop/Registry) */
function serializePatient(p: Prisma.PatientGetPayload<Record<string, never>>) {
  return {
    id: p.id,
    last_name: p.lastName,
    first_name: p.firstName,
    middle_name: p.middleName,
    date_of_birth: p.dateOfBirth,
    created_at: p.createdAt,
    updated_at: p.updatedAt,
  };
}

// GET /api/patients — список; ?q=, ?limit=, ?offset=
router.get("/", async (req, res, next) => {
  try {
    const search = typeof req.query.q === "string" ? req.query.q : "";
    const limit = Math.min(Math.max(parseInt(String(req.query.limit ?? "100"), 10) || 100, 1), 500);
    const offset = Math.max(parseInt(String(req.query.offset ?? "0"), 10) || 0, 0);

    const where = search
      ? {
          OR: [
            { lastName: { contains: search, mode: "insensitive" as const } },
            { firstName: { contains: search, mode: "insensitive" as const } },
            { middleName: { contains: search, mode: "insensitive" as const } },
            { searchText: { contains: normalizeSearchText(search) } },
          ],
        }
      : {};

    const [total, patients] = await Promise.all([
      prisma.patient.count({ where }),
      prisma.patient.findMany({
        where,
        orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
        take: limit,
        skip: offset,
      }),
    ]);

    res.json({ patients, total });
  } catch (err) {
    next(err);
  }
});

// POST /api/patients
router.post("/", async (req, res, next) => {
  try {
    const data = createSchema.parse(req.body);
    const patient = await prisma.patient.create({
      data: {
        lastName: data.lastName,
        firstName: data.firstName,
        middleName: data.middleName || null,
        dateOfBirth: data.dateOfBirth,
        searchText: buildPatientSearchText({
          lastName: data.lastName,
          firstName: data.firstName,
          middleName: data.middleName,
          dateOfBirth: data.dateOfBirth,
        }),
      },
    });
    res.status(201).json(serializePatient(patient as never));
  } catch (err) {
    next(err);
  }
});

// POST /api/patients/find-or-create
const findOrCreateSchema = z.object({
  lastName: z.string().min(1),
  firstName: z.string().min(1),
  middleName: z.string().optional().nullable(),
  dateOfBirth: z.string().min(1),
});

router.post("/find-or-create", async (req, res, next) => {
  try {
    const data = findOrCreateSchema.parse(req.body);

    const existing = await prisma.patient.findFirst({
      where: {
        lastName: data.lastName,
        firstName: data.firstName,
        middleName: data.middleName || null,
        dateOfBirth: data.dateOfBirth,
      },
    });

    if (existing) {
      res.json({ success: true, message: "Пациент найден", patient: existing });
      return;
    }

    const patient = await prisma.patient.create({
      data: {
        lastName: data.lastName,
        firstName: data.firstName,
        middleName: data.middleName || null,
        dateOfBirth: data.dateOfBirth,
        searchText: buildPatientSearchText({
          lastName: data.lastName,
          firstName: data.firstName,
          middleName: data.middleName,
          dateOfBirth: data.dateOfBirth,
        }),
      },
    });

    res.status(201).json({ success: true, message: "Пациент создан", patient });
  } catch (err) {
    next(err);
  }
});

// GET /api/patients/search?q=
router.get("/search", async (req, res, next) => {
  try {
    const q = typeof req.query.q === "string" ? req.query.q : "";
    if (!q.trim()) {
      res.json({ patients: [], total: 0 });
      return;
    }

    const limit = Math.min(Math.max(parseInt(String(req.query.limit ?? "50"), 10) || 50, 1), 500);
    const normalized = normalizeSearchText(q);

    const patients = await prisma.patient.findMany({
      where: {
        OR: [
          { lastName: { contains: q, mode: "insensitive" as const } },
          { firstName: { contains: q, mode: "insensitive" as const } },
          { middleName: { contains: q, mode: "insensitive" as const } },
          { searchText: { contains: normalized } },
        ],
      },
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
      take: limit,
    });

    res.json({ patients, total: patients.length });
  } catch (err) {
    next(err);
  }
});

// GET /api/patients/:id
router.get("/:id", async (req, res, next) => {
  try {
    const patient = await prisma.patient.findUnique({ where: { id: req.params.id } });
    if (!patient) {
      res.status(404).json({ error: "Пациент не найден" });
      return;
    }
    res.json(patient);
  } catch (err) {
    next(err);
  }
});

// PUT /api/patients/:id
router.put("/:id", async (req, res, next) => {
  try {
    const data = updateSchema.parse(req.body);

    const existing = await prisma.patient.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      res.status(404).json({ error: "Пациент не найден" });
      return;
    }

    const lastName = data.lastName ?? existing.lastName;
    const firstName = data.firstName ?? existing.firstName;
    const middleName = data.middleName !== undefined ? data.middleName : existing.middleName;
    const dateOfBirth = data.dateOfBirth ?? existing.dateOfBirth;

    const patient = await prisma.patient.update({
      where: { id: req.params.id },
      data: {
        lastName,
        firstName,
        middleName,
        dateOfBirth,
        searchText: buildPatientSearchText({
          lastName,
          firstName,
          middleName,
          dateOfBirth,
        }),
      },
    });

    res.json(patient);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/patients/:id
router.delete("/:id", async (req, res, next) => {
  try {
    const existing = await prisma.patient.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      res.status(404).json({ error: "Пациент не найден" });
      return;
    }

    await prisma.patient.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: "Пациент и его исследования удалены" });
  } catch (err) {
    next(err);
  }
});

export default router;