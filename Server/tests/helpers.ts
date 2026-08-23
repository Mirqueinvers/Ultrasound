import request from "supertest";
import { createApp } from "../src/app.js";
import { prisma } from "../src/lib/prisma.js";

export const app = createApp();

export async function clearDatabase(): Promise<void> {
  // Порядок: сначала зависимые таблицы
  await prisma.appointment.deleteMany();
  await prisma.medisonMapping.deleteMany();
  await prisma.printBlockOverride.deleteMany();
  await prisma.researchStudy.deleteMany();
  await prisma.research.deleteMany();
  await prisma.doctor.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.user.deleteMany();
}

export interface RegisteredUser {
  token: string;
  userId: string;
  username: string;
  password: string;
}

let userCounter = 0;

/** Регистрирует и логинит тестового пользователя, возвращает JWT и данные */
export async function registerAndLogin(
  username?: string,
  password = "secret123",
  name = "Тест Тестов"
): Promise<RegisteredUser> {
  userCounter++;
  const login = username || `test_user_${Date.now()}_${userCounter}`;

  const regRes = await request(app)
    .post("/api/auth/register")
    .send({ username: login, password, name })
    .expect(201);

  const loginRes = await request(app)
    .post("/api/auth/login")
    .send({ username: login, password })
    .expect(200);

  return {
    token: loginRes.body.token as string,
    userId: regRes.body.userId as string,
    username: login,
    password,
  };
}

export function authHeader(token: string): { Authorization: string } {
  return { Authorization: `Bearer ${token}` };
}

export interface CreatedPatient {
  id: string;
  last_name: string;
  first_name: string;
}

/** Создаёт пациента через API, возвращает id */
export async function createPatient(
  token: string,
  data: {
    lastName: string;
    firstName: string;
    middleName?: string;
    dateOfBirth: string;
  }
): Promise<CreatedPatient> {
  const res = await request(app)
    .post("/api/patients")
    .set(authHeader(token))
    .send(data)
    .expect(201);

  return res.body as CreatedPatient;
}

export { prisma };