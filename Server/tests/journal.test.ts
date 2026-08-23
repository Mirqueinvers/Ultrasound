import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { app, clearDatabase, registerAndLogin, authHeader, createPatient } from "./helpers.js";

describe("Journal API", () => {
  let token: string;
  let patientId: string;

  beforeEach(async () => {
    await clearDatabase();
    const user = await registerAndLogin("jr_user", "secret123", "Тест");
    token = user.token;
    const patient = await createPatient(user.token, {
      lastName: "Иванов",
      firstName: "Иван",
      middleName: "Иванович",
      dateOfBirth: "1985-06-10",
    });
    patientId = patient.id;
  });

  async function createResearch(date: string, doctorName?: string) {
    const res = await request(app)
      .post("/api/researches")
      .set(authHeader(token))
      .send({ patientId, researchDate: date, paymentType: "oms", doctorName: doctorName || "Петрова" })
      .expect(201);
    return res.body.researchId as string;
  }

  describe("GET /api/journal?date=", () => {
    it("возвращает журнал за день с grouping по пациентам", async () => {
      const researchId = await createResearch("2026-08-23");

      const res = await request(app)
        .get("/api/journal")
        .query({ date: "2026-08-23" })
        .set(authHeader(token))
        .expect(200);

      expect(res.body.length).toBe(1);
      const entry = res.body[0];
      expect(entry.patient.last_name).toBe("Иванов");
      expect(entry.researches.length).toBe(1);
      expect(entry.researches[0].id).toBe(researchId);
      expect(entry.researches[0].study_types).toEqual([]);
    });

    it("возвращает пустой список, если записей нет", async () => {
      const res = await request(app)
        .get("/api/journal")
        .query({ date: "2025-01-01" })
        .set(authHeader(token))
        .expect(200);

      expect(res.body).toEqual([]);
    });
  });

  describe("GET /api/journal?from=&to=", () => {
    it("возвращает журнал за период", async () => {
      await createResearch("2026-08-20", "Доктор А");
      await createResearch("2026-08-25", "Доктор Б");

      const res = await request(app)
        .get("/api/journal")
        .query({ from: "2026-08-19", to: "2026-08-26" })
        .set(authHeader(token))
        .expect(200);

      expect(res.body.length).toBe(1);
      expect(res.body[0].researches.length).toBe(2);
    });

    it("группирует несколько исследований одного пациента", async () => {
      await createResearch("2026-08-20", "Доктор А");
      await createResearch("2026-08-21", "Доктор Б");

      const res = await request(app)
        .get("/api/journal")
        .query({ from: "2026-08-20", to: "2026-08-21" })
        .set(authHeader(token))
        .expect(200);

      expect(res.body.length).toBe(1);
      expect(res.body[0].researches.length).toBe(2);
    });

    it("возвращает 400 без параметров", async () => {
      await request(app).get("/api/journal").set(authHeader(token)).expect(400);
    });
  });

  describe("GET /api/journal/doctors", () => {
    it("возвращает список врачей", async () => {
      await createResearch("2026-08-20", "Петрова");
      await createResearch("2026-08-21", "Сидорова");

      const res = await request(app)
        .get("/api/journal/doctors")
        .set(authHeader(token))
        .expect(200);

      expect(res.body).toContain("Петрова");
      expect(res.body).toContain("Сидорова");
    });
  });

  describe("Protocol endpoints", () => {
    it("GET /api/researches/:id/protocol возвращает протокол", async () => {
      const researchId = await createResearch("2026-08-23");

      await request(app)
        .post(`/api/researches/${researchId}/studies`)
        .set(authHeader(token))
        .send({ studyType: "obp", studyData: { liver: { size: "15 см" } } })
        .expect(201);

      const res = await request(app)
        .get(`/api/researches/${researchId}/protocol`)
        .set(authHeader(token))
        .expect(200);

      expect(res.body.researchId).toBe(researchId);
      expect(res.body.studies.obp).toEqual({ liver: { size: "15 см" } });
      expect(res.body.printOverrides).toEqual({});
    });

    it("PUT /api/researches/:id/protocol/overrides сохраняет шаблоны", async () => {
      const researchId = await createResearch("2026-08-23");

      await request(app)
        .put(`/api/researches/${researchId}/protocol/overrides`)
        .set(authHeader(token))
        .send({ printOverrides: { "block-1": "Текст шаблона 1", "block-2": "Текст шаблона 2" } })
        .expect(200);

      const res = await request(app)
        .get(`/api/researches/${researchId}/protocol`)
        .set(authHeader(token))
        .expect(200);

      expect(res.body.printOverrides["block-1"]).toBe("Текст шаблона 1");
      expect(res.body.printOverrides["block-2"]).toBe("Текст шаблона 2");
    });

    it("PUT overrides заменяет старые шаблоны", async () => {
      const researchId = await createResearch("2026-08-23");

      await request(app)
        .put(`/api/researches/${researchId}/protocol/overrides`)
        .set(authHeader(token))
        .send({ printOverrides: { "block-1": "Старый текст" } })
        .expect(200);

      await request(app)
        .put(`/api/researches/${researchId}/protocol/overrides`)
        .set(authHeader(token))
        .send({ printOverrides: { "block-2": "Новый текст" } })
        .expect(200);

      const res = await request(app)
        .get(`/api/researches/${researchId}/protocol`)
        .set(authHeader(token))
        .expect(200);

      expect(res.body.printOverrides["block-1"]).toBeUndefined();
      expect(res.body.printOverrides["block-2"]).toBe("Новый текст");
    });
  });
});