import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { app, clearDatabase, registerAndLogin, authHeader, prisma } from "./helpers.js";

describe("Appointments API (Registry)", () => {
  let token: string;

  beforeEach(async () => {
    await clearDatabase();
    const user = await registerAndLogin("ap_user", "secret123", "Тест");
    token = user.token;
  });

  describe("POST /api/appointments", () => {
    it("создаёт запись и автоматически создаёт пациента", async () => {
      const res = await request(app)
        .post("/api/appointments")
        .set(authHeader(token))
        .send({
          lastName: "Петров",
          firstName: "Пётр",
          middleName: "Петрович",
          dateOfBirth: "1975-05-20",
          appointmentDate: "2026-08-23",
          studies: ["obp", "kidneys"],
          department: "Отделение 1",
        })
        .expect(201);

      expect(res.body.id).toBeTruthy();
      expect(res.body.patient_id).toBeTruthy();
      expect(res.body.studies).toEqual(["obp", "kidneys"]);
      expect(res.body.department).toBe("Отделение 1");
      expect(res.body.patient.last_name).toBe("Петров");

      const patients = await prisma.patient.count();
      expect(patients).toBe(1);
    });

    it("использует существующего пациента при том же ФИО+ДР", async () => {
      await request(app)
        .post("/api/appointments")
        .set(authHeader(token))
        .send({
          lastName: "Петров",
          firstName: "Пётр",
          dateOfBirth: "1975-05-20",
          appointmentDate: "2026-08-23",
          studies: ["obp"],
        })
        .expect(201);

      await request(app)
        .post("/api/appointments")
        .set(authHeader(token))
        .send({
          lastName: "Петров",
          firstName: "Пётр",
          dateOfBirth: "1975-05-20",
          appointmentDate: "2026-08-24",
          studies: ["gyn"],
        })
        .expect(201);

      const patients = await prisma.patient.count();
      expect(patients).toBe(1);

      const appointments = await prisma.appointment.count();
      expect(appointments).toBe(2);
    });

    it("возвращает 400 без обязательных полей", async () => {
      await request(app)
        .post("/api/appointments")
        .set(authHeader(token))
        .send({ appointmentDate: "2026-08-23" })
        .expect(400);
    });
  });

  describe("GET /api/appointments", () => {
    it("возвращает записи на дату", async () => {
      await request(app)
        .post("/api/appointments")
        .set(authHeader(token))
        .send({
          lastName: "Петров",
          firstName: "Пётр",
          dateOfBirth: "1975-05-20",
          appointmentDate: "2026-08-23",
          studies: ["obp"],
        })
        .expect(201);

      const res = await request(app)
        .get("/api/appointments")
        .query({ date: "2026-08-23" })
        .set(authHeader(token))
        .expect(200);

      expect(res.body.length).toBe(1);
      expect(res.body[0].appointment_date).toBe("2026-08-23");
      expect(res.body[0].patient.first_name).toBe("Пётр");
    });

    it("возвращает записи за месяц (month 0-based, как в Registry)", async () => {
      await request(app)
        .post("/api/appointments")
        .set(authHeader(token))
        .send({
          lastName: "Петров",
          firstName: "Пётр",
          dateOfBirth: "1975-05-20",
          appointmentDate: "2026-08-23",
          studies: [],
        })
        .expect(201);

      // август = month 7 (0-based)
      const res = await request(app)
        .get("/api/appointments")
        .query({ month: 7, year: 2026 })
        .set(authHeader(token))
        .expect(200);

      expect(res.body.length).toBe(1);
    });

    it("не возвращает записи из другого месяца", async () => {
      await request(app)
        .post("/api/appointments")
        .set(authHeader(token))
        .send({
          lastName: "Петров",
          firstName: "Пётр",
          dateOfBirth: "1975-05-20",
          appointmentDate: "2026-07-15",
          studies: [],
        })
        .expect(201);

      const res = await request(app)
        .get("/api/appointments")
        .query({ month: 7, year: 2026 })
        .set(authHeader(token))
        .expect(200);

      expect(res.body.length).toBe(0);
    });
  });

  describe("PUT /api/appointments/:id", () => {
    it("обновляет исследования и данные пациента", async () => {
      const createRes = await request(app)
        .post("/api/appointments")
        .set(authHeader(token))
        .send({
          lastName: "Петров",
          firstName: "Пётр",
          dateOfBirth: "1975-05-20",
          appointmentDate: "2026-08-23",
          studies: ["obp"],
        })
        .expect(201);

      const appointmentId = createRes.body.id;

      const res = await request(app)
        .put(`/api/appointments/${appointmentId}`)
        .set(authHeader(token))
        .send({
          studies: ["gyn", "uro"],
          lastName: "Петрова",
          firstName: "Мария",
        })
        .expect(200);

      expect(res.body.studies).toEqual(["gyn", "uro"]);
      expect(res.body.patient.last_name).toBe("Петрова");
      expect(res.body.patient.first_name).toBe("Мария");
    });

    it("возвращает 404 для несуществующей записи", async () => {
      await request(app)
        .put("/api/appointments/00000000-0000-0000-0000-000000000000")
        .set(authHeader(token))
        .send({ studies: ["obp"] })
        .expect(404);
    });
  });

  describe("DELETE /api/appointments/:id", () => {
    it("удаляет запись", async () => {
      const createRes = await request(app)
        .post("/api/appointments")
        .set(authHeader(token))
        .send({
          lastName: "Петров",
          firstName: "Пётр",
          dateOfBirth: "1975-05-20",
          appointmentDate: "2026-08-23",
          studies: ["obp"],
        })
        .expect(201);

      await request(app)
        .delete(`/api/appointments/${createRes.body.id}`)
        .set(authHeader(token))
        .expect(200);

      const appointments = await prisma.appointment.count();
      expect(appointments).toBe(0);
    });
  });
});