import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { app, clearDatabase, registerAndLogin, authHeader, createPatient, prisma } from "./helpers.js";

describe("Patients API", () => {
  beforeEach(async () => {
    await clearDatabase();
  });

  describe("POST /api/patients", () => {
    it("создаёт пациента", async () => {
      const user = await registerAndLogin("pt_user", "secret123", "Тест");

      const res = await request(app)
        .post("/api/patients")
        .set(authHeader(user.token))
        .send({
          lastName: "Иванов",
          firstName: "Иван",
          middleName: "Иванович",
          dateOfBirth: "1990-01-15",
        })
        .expect(201);

      expect(res.body.id).toBeTruthy();
      expect(res.body.last_name).toBe("Иванов");
      expect(res.body.date_of_birth).toBe("1990-01-15");
    });

    it("возвращает 400 без обязательных полей", async () => {
      const user = await registerAndLogin("pt_user2", "secret123", "Тест");

      await request(app)
        .post("/api/patients")
        .set(authHeader(user.token))
        .send({ lastName: "Иванов" })
        .expect(400);
    });
  });

  describe("GET /api/patients", () => {
    it("возвращает список пациентов", async () => {
      const user = await registerAndLogin("pt_list", "secret123", "Тест");
      await createPatient(user.token, { lastName: "Петров", firstName: "Пётр", dateOfBirth: "1980-02-20" });
      await createPatient(user.token, { lastName: "Сидоров", firstName: "Сидр", dateOfBirth: "1970-03-30" });

      const res = await request(app)
        .get("/api/patients")
        .set(authHeader(user.token))
        .expect(200);

      expect(res.body.total).toBe(2);
      expect(res.body.patients.length).toBe(2);
    });

    it("ищет по дате рождения", async () => {
      const user = await registerAndLogin("pt_dob", "secret123", "Тест");
      await createPatient(user.token, { lastName: "Петров", firstName: "Пётр", dateOfBirth: "1980-02-20" });

      const res = await request(app)
        .get("/api/patients/search")
        .query({ q: "1980-02-20" })
        .set(authHeader(user.token))
        .expect(200);

      expect(res.body.total).toBe(1);
      expect(res.body.patients[0].last_name).toBe("Петров");
    });

    it("ищет с нормализацией ё→е", async () => {
      const user = await registerAndLogin("pt_yo", "secret123", "Тест");
      await createPatient(user.token, { lastName: "Сёмёнов", firstName: "Фёдор", dateOfBirth: "1991-04-20" });

      // Поиск без «ё»
      const res = await request(app)
        .get("/api/patients/search")
        .query({ q: "Семенов" })
        .set(authHeader(user.token))
        .expect(200);

      expect(res.body.total).toBeGreaterThanOrEqual(1);
    });
  });

  describe("GET /api/patients/:id", () => {
    it("возвращает пациента по id", async () => {
      const user = await registerAndLogin("pt_get", "secret123", "Тест");
      const patient = await createPatient(user.token, { lastName: "Петров", firstName: "Пётр", dateOfBirth: "1980-02-20" });

      const res = await request(app)
        .get(`/api/patients/${patient.id}`)
        .set(authHeader(user.token))
        .expect(200);

      expect(res.body.last_name).toBe("Петров");
    });

    it("возвращает 404 для несуществующего id", async () => {
      const user = await registerAndLogin("pt_get2", "secret123", "Тест");

      await request(app)
        .get("/api/patients/00000000-0000-0000-0000-000000000000")
        .set(authHeader(user.token))
        .expect(404);
    });
  });

  describe("PUT /api/patients/:id", () => {
    it("обновляет пациента", async () => {
      const user = await registerAndLogin("pt_upd", "secret123", "Тест");
      const patient = await createPatient(user.token, { lastName: "Петров", firstName: "Пётр", dateOfBirth: "1980-02-20" });

      const res = await request(app)
        .put(`/api/patients/${patient.id}`)
        .set(authHeader(user.token))
        .send({ lastName: "Петрова", firstName: "Пётр", dateOfBirth: "1980-02-20" })
        .expect(200);

      expect(res.body.last_name).toBe("Петрова");
    });
  });

  describe("DELETE /api/patients/:id", () => {
    it("удаляет пациента и его исследования", async () => {
      const user = await registerAndLogin("pt_del", "secret123", "Тест");
      const patient = await createPatient(user.token, { lastName: "Петров", firstName: "Пётр", dateOfBirth: "1980-02-20" });

      const researchRes = await request(app)
        .post("/api/researches")
        .set(authHeader(user.token))
        .send({ patientId: patient.id, researchDate: "2026-08-23", paymentType: "oms" })
        .expect(201);

      expect(researchRes.body.researchId).toBeTruthy();

      const res = await request(app)
        .delete(`/api/patients/${patient.id}`)
        .set(authHeader(user.token))
        .expect(200);

      expect(res.body.success).toBe(true);

      const count = await prisma.patient.count({ where: { id: patient.id } });
      expect(count).toBe(0);

      // Каскадно удалены исследования
      const researchCount = await prisma.research.count();
      expect(researchCount).toBe(0);
    });
  });

  describe("POST /api/patients/find-or-create", () => {
    it("возвращает существующего пациента", async () => {
      const user = await registerAndLogin("pt_foc", "secret123", "Тест");
      const patient = await createPatient(user.token, { lastName: "Петров", firstName: "Пётр", dateOfBirth: "1980-02-20" });

      const res = await request(app)
        .post("/api/patients/find-or-create")
        .set(authHeader(user.token))
        .send({ lastName: "Петров", firstName: "Пётр", middleName: "", dateOfBirth: "1980-02-20" })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.patient.id).toBe(patient.id);
    });

    it("создаёт нового пациента, если не найден", async () => {
      const user = await registerAndLogin("pt_foc2", "secret123", "Тест");

      const res = await request(app)
        .post("/api/patients/find-or-create")
        .set(authHeader(user.token))
        .send({ lastName: "Нов", firstName: "Новый", dateOfBirth: "2000-12-31" })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.patient.last_name).toBe("Нов");
    });
  });
});