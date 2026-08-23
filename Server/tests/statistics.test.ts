import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { app, clearDatabase, registerAndLogin, authHeader, createPatient } from "./helpers.js";

describe("Statistics API", () => {
  let token: string;
  let patientId: string;

  beforeEach(async () => {
    await clearDatabase();
    const user = await registerAndLogin("st_user", "secret123", "Тест");
    token = user.token;
    const patient = await createPatient(user.token, {
      lastName: "Иванов",
      firstName: "Иван",
      dateOfBirth: "1985-06-10",
    });
    patientId = patient.id;
  });

  async function createResearch(date: string, paymentType: "oms" | "paid", doctorName?: string) {
    const res = await request(app)
      .post("/api/researches")
      .set(authHeader(token))
      .send({ patientId, researchDate: date, paymentType, doctorName: doctorName || "Петрова" })
      .expect(201);
    return res.body.researchId as string;
  }

  it("возвращает базовую статистику по пустой БД", async () => {
    const res = await request(app)
      .get("/api/statistics")
      .set(authHeader(token))
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.totalPatients).toBe(1); // пациент создан в beforeEach
    expect(res.body.data.totalResearches).toBe(0);
    expect(res.body.data.totalStudies).toBe(0);
    expect(res.body.data.paymentStats).toEqual({ oms: 0, paid: 0 });
  });

  it("считает totalResearches и paymentStats (по studies, как в Desktop)", async () => {
    const omsResearchId = await createResearch("2026-08-20", "oms");
    const paidResearchId = await createResearch("2026-08-21", "paid");

    await request(app)
      .post(`/api/researches/${omsResearchId}/studies`)
      .set(authHeader(token))
      .send({ studyType: "obp", studyData: {} })
      .expect(201);

    await request(app)
      .post(`/api/researches/${paidResearchId}/studies`)
      .set(authHeader(token))
      .send({ studyType: "gyn", studyData: {} })
      .expect(201);

    const res = await request(app)
      .get("/api/statistics")
      .set(authHeader(token))
      .expect(200);

    const data = res.body.data;
    expect(data.totalResearches).toBe(2);
    expect(data.paymentStats.oms).toBe(1);
    expect(data.paymentStats.paid).toBe(1);
  });

  it("считает исследования за период (researchesInPeriod, patientsInPeriod)", async () => {
    await createResearch("2026-08-15", "oms");
    await createResearch("2026-08-25", "oms");

    const res = await request(app)
      .get("/api/statistics")
      .query({ from: "2026-08-01", to: "2026-08-31" })
      .set(authHeader(token))
      .expect(200);

    const data = res.body.data;
    expect(data.researchesInPeriod).toBe(2);
    expect(data.patientsInPeriod).toBe(1);
    expect(data.totalResearches).toBe(2);
  });

  it("считает studiesByType по ОМС-исследованиям", async () => {
    const researchId = await createResearch("2026-08-20", "oms");

    await request(app)
      .post(`/api/researches/${researchId}/studies`)
      .set(authHeader(token))
      .send({ studyType: "obp", studyData: {} })
      .expect(201);

    await request(app)
      .post(`/api/researches/${researchId}/studies`)
      .set(authHeader(token))
      .send({ studyType: "kidneys", studyData: {} })
      .expect(201);

    const res = await request(app)
      .get("/api/statistics")
      .set(authHeader(token))
      .expect(200);

    const data = res.body.data;
    expect(data.totalStudies).toBe(2);
    expect(data.paymentStats.oms).toBe(2);
    expect(data.studiesByType.obp).toBe(1);
    expect(data.studiesByType.kidneys).toBe(1);
  });

  it("считает doctorsStats — группировка по врачу", async () => {
    await createResearch("2026-08-20", "oms", "Петрова");
    await createResearch("2026-08-21", "oms", "Петрова");
    await createResearch("2026-08-22", "oms", "Сидорова");

    const res = await request(app)
      .get("/api/statistics")
      .set(authHeader(token))
      .expect(200);

    const { doctorsStats } = res.body.data;
    expect(doctorsStats.length).toBe(2);

    const petrova = doctorsStats.find((d: any) => d.doctorName === "Петрова");
    expect(petrova).toBeTruthy();
    expect(petrova.researchCount).toBe(2);
    expect(petrova.patientCount).toBe(1);

    const sidorova = doctorsStats.find((d: any) => d.doctorName === "Сидорова");
    expect(sidorova.researchCount).toBe(1);
  });

  it("фильтрует по врачу", async () => {
    await createResearch("2026-08-20", "oms", "Петрова");
    await createResearch("2026-08-21", "oms", "Сидорова");

    const res = await request(app)
      .get("/api/statistics")
      .query({ doctor: "Петрова" })
      .set(authHeader(token))
      .expect(200);

    expect(res.body.data.researchesInPeriod).toBe(0); // без from/to period не считается
    expect(res.body.data.totalResearches).toBe(2); // total не фильтруется по врачу
  });

  it("возвращает monthlyResearches в формате [{month, count}]", async () => {
    await createResearch("2026-08-20", "oms");
    await createResearch("2026-08-21", "oms");

    const res = await request(app)
      .get("/api/statistics")
      .set(authHeader(token))
      .expect(200);

    const { monthlyResearches } = res.body.data;
    expect(monthlyResearches.length).toBe(1);
    expect(monthlyResearches[0].month).toMatch(/август/i);
    expect(monthlyResearches[0].count).toBe(2);
  });
});