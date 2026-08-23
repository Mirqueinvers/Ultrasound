import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { app, clearDatabase, registerAndLogin, authHeader, prisma } from "./helpers.js";

describe("Doctors API (Registry)", () => {
  let token: string;

  beforeEach(async () => {
    await clearDatabase();
    const user = await registerAndLogin("dc_user", "secret123", "Тест");
    token = user.token;
  });

  describe("POST /api/doctors", () => {
    it("создаёт врача с рабочими днями", async () => {
      const res = await request(app)
        .post("/api/doctors")
        .set(authHeader(token))
        .send({ name: "Иванова Мария", maxPatientsPerDay: 12, workDays: [1, 2, 3, 4, 5] })
        .expect(201);

      expect(res.body.id).toBeTruthy();
      expect(res.body.name).toBe("Иванова Мария");
      expect(res.body.max_patients_per_day).toBe(12);
      expect(JSON.parse(res.body.work_days)).toEqual([1, 2, 3, 4, 5]);
    });

    it("использует дефолтные значения", async () => {
      const res = await request(app)
        .post("/api/doctors")
        .set(authHeader(token))
        .send({ name: "Петров Пётр" })
        .expect(201);

      expect(res.body.max_patients_per_day).toBe(15);
      expect(JSON.parse(res.body.work_days)).toEqual([1, 2, 3, 4, 5]);
    });

    it("возвращает 400 без имени", async () => {
      await request(app)
        .post("/api/doctors")
        .set(authHeader(token))
        .send({ maxPatientsPerDay: 15 })
        .expect(400);
    });
  });

  describe("GET /api/doctors", () => {
    it("возвращает список врачей, отсортированный по имени", async () => {
      await request(app).post("/api/doctors").set(authHeader(token)).send({ name: "Б Врач" }).expect(201);
      await request(app).post("/api/doctors").set(authHeader(token)).send({ name: "А Врач" }).expect(201);

      const res = await request(app)
        .get("/api/doctors")
        .set(authHeader(token))
        .expect(200);

      expect(res.body.length).toBe(2);
      expect(res.body[0].name).toBe("А Врач");
      expect(res.body[1].name).toBe("Б Врач");
    });
  });

  describe("PUT /api/doctors/:id", () => {
    it("обновляет врача", async () => {
      const createRes = await request(app)
        .post("/api/doctors")
        .set(authHeader(token))
        .send({ name: "Старое Имя", maxPatientsPerDay: 10, workDays: [1, 2, 3] })
        .expect(201);

      const doctorId = createRes.body.id;

      const res = await request(app)
        .put(`/api/doctors/${doctorId}`)
        .set(authHeader(token))
        .send({ name: "Новое Имя", maxPatientsPerDay: 20, workDays: [1, 5] })
        .expect(200);

      expect(res.body.name).toBe("Новое Имя");
      expect(res.body.max_patients_per_day).toBe(20);
      expect(JSON.parse(res.body.work_days)).toEqual([1, 5]);
    });

    it("возвращает 404 для несуществующего id", async () => {
      await request(app)
        .put("/api/doctors/00000000-0000-0000-0000-000000000000")
        .set(authHeader(token))
        .send({ name: "Тест", maxPatientsPerDay: 15, workDays: [1] })
        .expect(404);
    });
  });

  describe("DELETE /api/doctors/:id", () => {
    it("удаляет врача", async () => {
      const createRes = await request(app)
        .post("/api/doctors")
        .set(authHeader(token))
        .send({ name: "Врач для удаления" })
        .expect(201);

      await request(app)
        .delete(`/api/doctors/${createRes.body.id}`)
        .set(authHeader(token))
        .expect(200);

      const count = await prisma.doctor.count();
      expect(count).toBe(0);
    });
  });
});