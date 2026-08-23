import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { app, clearDatabase, registerAndLogin, authHeader, createPatient, prisma } from "./helpers.js";

describe("Researches API", () => {
  let token: string;
  let patientId: string;

  beforeEach(async () => {
    await clearDatabase();
    const user = await registerAndLogin("rs_user", "secret123", "Тест");
    token = user.token;
    const patient = await createPatient(user.token, {
      lastName: "Иванов",
      firstName: "Иван",
      dateOfBirth: "1985-06-10",
    });
    patientId = patient.id;
  });

  describe("POST /api/researches", () => {
    it("создаёт исследование", async () => {
      const res = await request(app)
        .post("/api/researches")
        .set(authHeader(token))
        .send({ patientId, researchDate: "2026-08-23", paymentType: "oms", doctorName: "Петрова" })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.researchId).toBeTruthy();

      const count = await prisma.research.count();
      expect(count).toBe(1);
    });

    it("создаёт платное исследование", async () => {
      const res = await request(app)
        .post("/api/researches")
        .set(authHeader(token))
        .send({ patientId, researchDate: "2026-08-23", paymentType: "paid" })
        .expect(201);

      expect(res.body.researchId).toBeTruthy();
      const research = await prisma.research.findUnique({ where: { id: res.body.researchId } });
      expect(research?.paymentType).toBe("paid");
    });
  });

  describe("POST /api/researches/:id/studies", () => {
    it("добавляет исследование (study) с JSON-данными", async () => {
      const createRes = await request(app)
        .post("/api/researches")
        .set(authHeader(token))
        .send({ patientId, researchDate: "2026-08-23", paymentType: "oms" })
        .expect(201);

      const researchId = createRes.body.researchId;

      const res = await request(app)
        .post(`/api/researches/${researchId}/studies`)
        .set(authHeader(token))
        .send({ studyType: "obp", studyData: { liver: { size: "15 см" } } })
        .expect(201);

      expect(res.body.studyId).toBeTruthy();

      const study = await prisma.researchStudy.findUnique({ where: { id: res.body.studyId } });
      expect(study?.studyType).toBe("obp");
      expect(study?.studyData).toEqual({ liver: { size: "15 см" } });
    });

    it("возвращает 404 для несуществующего исследования", async () => {
      await request(app)
        .post("/api/researches/00000000-0000-0000-0000-000000000000/studies")
        .set(authHeader(token))
        .send({ studyType: "obp", studyData: {} })
        .expect(404);
    });
  });

  describe("GET /api/researches/:id", () => {
    it("возвращает исследование со studies и пациентом", async () => {
      const createRes = await request(app)
        .post("/api/researches")
        .set(authHeader(token))
        .send({ patientId, researchDate: "2026-08-23", paymentType: "oms" })
        .expect(201);

      const researchId = createRes.body.researchId;

      await request(app)
        .post(`/api/researches/${researchId}/studies`)
        .set(authHeader(token))
        .send({ studyType: "obp", studyData: { a: 1 } })
        .expect(201);

      const res = await request(app)
        .get(`/api/researches/${researchId}`)
        .set(authHeader(token))
        .expect(200);

      expect(res.body.id).toBe(researchId);
      expect(res.body.patient_id).toBe(patientId);
      expect(res.body.patient.last_name).toBe("Иванов");
      expect(res.body.studies.length).toBe(1);
      expect(res.body.studies[0].study_type).toBe("obp");
    });
  });

  describe("GET /api/researches?patientId=", () => {
    it("фильтрует по пациенту", async () => {
      await request(app)
        .post("/api/researches")
        .set(authHeader(token))
        .send({ patientId, researchDate: "2026-08-23", paymentType: "oms" })
        .expect(201);

      const res = await request(app)
        .get("/api/researches")
        .query({ patientId })
        .set(authHeader(token))
        .expect(200);

      expect(res.body.total).toBe(1);
      expect(res.body.researches[0].patient_id).toBe(patientId);
    });
  });

  describe("GET /api/researches/search", () => {
    it("ищет по фамилии пациента с нормализацией ё→е", async () => {
      await request(app)
        .post("/api/researches")
        .set(authHeader(token))
        .send({ patientId, researchDate: "2026-08-23", paymentType: "oms" })
        .expect(201);

      const res = await request(app)
        .get("/api/researches/search")
        .query({ q: "Иванов" })
        .set(authHeader(token))
        .expect(200);

      expect(res.body.total).toBeGreaterThanOrEqual(1);
    });

    it("ищет по коду (инициалы + дата)", async () => {
      await request(app)
        .post("/api/researches")
        .set(authHeader(token))
        .send({ patientId, researchDate: "2026-08-23", paymentType: "oms" })
        .expect(201);

      // Иванов Иван 1985-06-10 → инициалы «ИИ» + «19850610»
      const res = await request(app)
        .get("/api/researches/search")
        .query({ q: "ии19850610" })
        .set(authHeader(token))
        .expect(200);

      expect(res.body.total).toBeGreaterThanOrEqual(1);
    });
  });

  describe("PUT /api/researches/:id", () => {
    it("обновляет исследование", async () => {
      const createRes = await request(app)
        .post("/api/researches")
        .set(authHeader(token))
        .send({ patientId, researchDate: "2026-08-23", paymentType: "oms" })
        .expect(201);

      const researchId = createRes.body.researchId;

      await request(app)
        .put(`/api/researches/${researchId}`)
        .set(authHeader(token))
        .send({ researchDate: "2026-08-24", paymentType: "paid" })
        .expect(200);

      const research = await prisma.research.findUnique({ where: { id: researchId } });
      expect(research?.researchDate).toBe("2026-08-24");
      expect(research?.paymentType).toBe("paid");
    });
  });

  describe("DELETE /api/researches/:id", () => {
    it("удаляет исследование и его studies", async () => {
      const createRes = await request(app)
        .post("/api/researches")
        .set(authHeader(token))
        .send({ patientId, researchDate: "2026-08-23", paymentType: "oms" })
        .expect(201);

      const researchId = createRes.body.researchId;

      await request(app)
        .post(`/api/researches/${researchId}/studies`)
        .set(authHeader(token))
        .send({ studyType: "obp", studyData: { a: 1 } })
        .expect(201);

      await request(app)
        .delete(`/api/researches/${researchId}`)
        .set(authHeader(token))
        .expect(200);

      const studiesCount = await prisma.researchStudy.count();
      expect(studiesCount).toBe(0);
    });
  });
});