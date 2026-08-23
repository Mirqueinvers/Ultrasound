import { Router } from "express";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { buildPatientSearchText } from "../utils/search.js";

const router = Router();

const createAppointmentSchema = z.object({
  lastName: z.string().min(1, "Фамилия обязательна"),
  firstName: z.string().min(1, "Имя обязательно"),
  middleName: z.string().optional().nullable(),
  dateOfBirth: z.string().min(1, "Дата рождения обязательна"),
  appointmentDate: z.string().min(1, "Дата записи обязательна"),
  studies: z.array(z.string()).default([]),
  department: z.string().optional().nullable(),
});

const updateAppointmentSchema = z
  .object({
    studies: z.array(z.string()).optional(),
    lastName: z.string().optional(),
    firstName: z.string().optional(),
    middleName: z.string().optional().nullable(),
    dateOfBirth: z.string().optional(),
    department: z.string().optional().nullable(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Нет данных для обновления",
  });

function serializeAppointment(a: {
  id: string;
  patientId: string;
  appointmentDate: string;
  studies: Prisma.JsonValue;
  department: string | null;
  createdAt: Date;
  patient?: {
    id: string;
    lastName: string;
    firstName: string;
    middleName: string | null;
    dateOfBirth: string;
    searchText: string;
    createdAt: Date;
    updatedAt: Date;
  } | null;
}) {
  let studies: string[] = [];
  if (Array.isArray(a.studies)) {
    studies = a.studies.filter((s): s is string => typeof s === "string");
  } else if (typeof a.studies === "string") {
    try {
      const parsed: unknown = JSON.parse(a.studies);
      if (Array.isArray(parsed)) {
        studies = parsed.filter((s): s is string => typeof s === "string");
      }
    } catch {
      // Не JSON
    }
  }

  return {
    id: a.id,
    patient_id: a.patientId,
    appointment_date: a.appointmentDate,
    studies,
    department: a.department || "",
    created_at: a.createdAt,
    patient: a.patient
      ? {
          id: a.patient.id,
          last_name: a.patient.lastName,
          first_name: a.patient.firstName,
          middle_name: a.patient.middleName || "",
          date_of_birth: a.patient.dateOfBirth,
        }
      : undefined,
  };
}

// GET /api/appointments?date=YYYY-MM-DD | ?month=&year=
router.get("/", async (req, res, next) => {
  try {
    const date = typeof req.query.date === "string" ? req.query.date : "";
    const month = typeof req.query.month === "string" ? req.query.month : "";
    const year = typeof req.query.year === "string" ? req.query.year : "";

    // Записи за месяц (по префиксу YYYY-MM)
    if (month && year) {
      const m = parseInt(month, 10) + 1;
      const y = parseInt(year, 10);
      if (isNaN(m) || isNaN(y)) {
        res.status(400).json({ error: "Некорректные month/year" });
        return;
      }
      const prefix = `${y}-${String(m).padStart(2, "0")}`;

      const appointments = await prisma.appointment.findMany({
        where: { appointmentDate: { startsWith: prefix } },
        include: { patient: true },
        orderBy: [{ appointmentDate: "asc" }, { createdAt: "asc" }],
      });

      res.json(appointments.map(serializeAppointment));
      return;
    }

    if (!date) {
      res.status(400).json({ error: "date параметр обязателен" });
      return;
    }

    const appointments = await prisma.appointment.findMany({
      where: { appointmentDate: date },
      include: { patient: true },
      orderBy: { createdAt: "asc" },
    });

    res.json(appointments.map(serializeAppointment));
  } catch (err) {
    next(err);
  }
});

// POST /api/appointments — создать (найти/создать пациента + запись, транзакция)
router.post("/", async (req, res, next) => {
  try {
    const data = createAppointmentSchema.parse(req.body);

    const result = await prisma.$transaction(async (tx) => {
      let patient = await tx.patient.findFirst({
        where: {
          lastName: data.lastName,
          firstName: data.firstName,
          middleName: data.middleName || null,
          dateOfBirth: data.dateOfBirth,
        },
      });

      if (!patient) {
        patient = await tx.patient.create({
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
      }

      const appointment = await tx.appointment.create({
        data: {
          patientId: patient.id,
          appointmentDate: data.appointmentDate,
          studies: data.studies as Prisma.InputJsonValue,
          department: data.department || null,
        },
        include: { patient: true },
      });

      return appointment;
    });

    res.status(201).json(serializeAppointment(result));
  } catch (err) {
    next(err);
  }
});

// PUT /api/appointments/:id — изменить (запись + данные пациента)
router.put("/:id", async (req, res, next) => {
  try {
    const data = updateAppointmentSchema.parse(req.body);

    const existing = await prisma.appointment.findUnique({
      where: { id: req.params.id },
      include: { patient: true },
    });
    if (!existing) {
      res.status(404).json({ error: "Запись не найдена" });
      return;
    }

    const updated = await prisma.$transaction(async (tx) => {
      const appointment = await tx.appointment.update({
        where: { id: req.params.id },
        data: {
          ...(data.studies !== undefined
            ? { studies: data.studies as Prisma.InputJsonValue }
            : {}),
          ...(data.department !== undefined
            ? { department: data.department }
            : {}),
        },
        include: { patient: true },
      });

      // Обновляем пациента, если переданы его данные
      const patientData: Prisma.PatientUpdateInput = {};
      if (data.lastName !== undefined) patientData.lastName = data.lastName;
      if (data.firstName !== undefined) patientData.firstName = data.firstName;
      if (data.middleName !== undefined) patientData.middleName = data.middleName;
      if (data.dateOfBirth !== undefined) patientData.dateOfBirth = data.dateOfBirth;

      if (Object.keys(patientData).length > 0) {
        const patient = await tx.patient.update({
          where: { id: appointment.patientId },
          data: {
            ...patientData,
            searchText: buildPatientSearchText({
              lastName: data.lastName ?? appointment.patient.lastName,
              firstName: data.firstName ?? appointment.patient.firstName,
              middleName: data.middleName !== undefined ? data.middleName : appointment.patient.middleName,
              dateOfBirth: data.dateOfBirth ?? appointment.patient.dateOfBirth,
            }),
          },
        });
        return { ...appointment, patient };
      }

      return appointment;
    });

    res.json(serializeAppointment(updated));
  } catch (err) {
    next(err);
  }
});

// DELETE /api/appointments/:id
router.delete("/:id", async (req, res, next) => {
  try {
    const existing = await prisma.appointment.findUnique({ where: { id: req.params.id }, select: { id: true } });
    if (!existing) {
      res.status(404).json({ error: "Запись не найдена" });
      return;
    }
    await prisma.appointment.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

export default router;