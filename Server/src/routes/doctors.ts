import { Router } from "express";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma.js";

const router = Router();

const doctorSchema = z.object({
  name: z.string().min(1, "Имя врача обязательно"),
  maxPatientsPerDay: z.number().int().positive().default(15),
  workDays: z.array(z.number().int().min(1).max(7)).default([1, 2, 3, 4, 5]),
});

function serializeDoctor(d: {
  id: string;
  name: string;
  maxPatientsPerDay: number;
  workDays: Prisma.JsonValue;
}) {
  let workDays: number[] = [];
  if (Array.isArray(d.workDays)) {
    workDays = d.workDays.filter((x): x is number => typeof x === "number");
  } else if (typeof d.workDays === "string") {
    try {
      const parsed: unknown = JSON.parse(d.workDays);
      if (Array.isArray(parsed)) {
        workDays = parsed.filter((x): x is number => typeof x === "number");
      }
    } catch {
      // Не JSON
    }
  }

  return {
    id: d.id,
    name: d.name,
    max_patients_per_day: d.maxPatientsPerDay,
    work_days: JSON.stringify(workDays),
  };
}

// GET /api/doctors
router.get("/", async (_req, res, next) => {
  try {
    const doctors = await prisma.doctor.findMany({
      orderBy: { name: "asc" },
    });
    res.json(doctors.map(serializeDoctor));
  } catch (err) {
    next(err);
  }
});

// POST /api/doctors
router.post("/", async (req, res, next) => {
  try {
    const data = doctorSchema.parse(req.body);
    const doctor = await prisma.doctor.create({
      data: {
        name: data.name,
        maxPatientsPerDay: data.maxPatientsPerDay,
        workDays: data.workDays as Prisma.InputJsonValue,
      },
    });
    res.status(201).json(serializeDoctor(doctor));
  } catch (err) {
    next(err);
  }
});

// PUT /api/doctors/:id
router.put("/:id", async (req, res, next) => {
  try {
    const data = doctorSchema.parse(req.body);
    const existing = await prisma.doctor.findUnique({ where: { id: req.params.id }, select: { id: true } });
    if (!existing) {
      res.status(404).json({ error: "Врач не найден" });
      return;
    }

    const doctor = await prisma.doctor.update({
      where: { id: req.params.id },
      data: {
        name: data.name,
        maxPatientsPerDay: data.maxPatientsPerDay,
        workDays: data.workDays as Prisma.InputJsonValue,
      },
    });

    res.json(serializeDoctor(doctor));
  } catch (err) {
    next(err);
  }
});

// DELETE /api/doctors/:id
router.delete("/:id", async (req, res, next) => {
  try {
    const existing = await prisma.doctor.findUnique({ where: { id: req.params.id }, select: { id: true } });
    if (!existing) {
      res.status(404).json({ error: "Врач не найден" });
      return;
    }
    await prisma.doctor.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

export default router;