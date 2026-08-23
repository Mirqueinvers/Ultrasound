import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { app, clearDatabase, registerAndLogin, authHeader, prisma } from "./helpers.js";

describe("Auth API", () => {
  beforeEach(async () => {
    await clearDatabase();
  });

  describe("POST /api/auth/register", () => {
    it("регистрирует нового пользователя", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({ username: "doctor1", password: "secret123", name: "Иван Петров" })
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.userId).toBeTruthy();
    });

    it("возвращает 400 при дубликате логина", async () => {
      await request(app)
        .post("/api/auth/register")
        .send({ username: "doctor1", password: "secret123", name: "Иван Петров" })
        .expect(201);

      const res = await request(app)
        .post("/api/auth/register")
        .send({ username: "doctor1", password: "secret123", name: "Иван Петров" })
        .expect(400);

      expect(res.body.error).toContain("уже существует");
    });

    it("возвращает 400 при коротком пароле", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({ username: "doctor2", password: "123", name: "Тест" })
        .expect(400);

      expect(res.body.error).toBeTruthy();
    });
  });

  describe("POST /api/auth/login", () => {
    it("входит и возвращает JWT", async () => {
      await request(app)
        .post("/api/auth/register")
        .send({ username: "doctor1", password: "secret123", name: "Иван Петров" })
        .expect(201);

      const res = await request(app)
        .post("/api/auth/login")
        .send({ username: "doctor1", password: "secret123" })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeTruthy();
      expect(res.body.user.username).toBe("doctor1");
      expect(res.body.user.password).toBeUndefined();
    });

    it("возвращает 400 при неверном пароле", async () => {
      await request(app)
        .post("/api/auth/register")
        .send({ username: "doctor1", password: "secret123", name: "Иван Петров" })
        .expect(201);

      const res = await request(app)
        .post("/api/auth/login")
        .send({ username: "doctor1", password: "wrong-password" })
        .expect(400);

      expect(res.body.error).toContain("Неверный логин или пароль");
    });
  });

  describe("GET /api/auth/me", () => {
    it("возвращает текущего пользователя", async () => {
      const user = await registerAndLogin("me_user", "secret123", "Меня Зовут");

      const res = await request(app)
        .get("/api/auth/me")
        .set(authHeader(user.token))
        .expect(200);

      expect(res.body.username).toBe("me_user");
      expect(res.body.name).toBe("Меня Зовут");
    });

    it("возвращает 401 без токена", async () => {
      await request(app).get("/api/auth/me").expect(401);
    });

    it("возвращает 401 с неверным токеном", async () => {
      await request(app)
        .get("/api/auth/me")
        .set(authHeader("invalid-token"))
        .expect(401);
    });
  });

  describe("PATCH /api/auth/profile", () => {
    it("обновляет профиль", async () => {
      const user = await registerAndLogin("profile_user", "secret123", "Старое Имя");

      const res = await request(app)
        .patch("/api/auth/profile")
        .set(authHeader(user.token))
        .send({ name: "Новое Имя", username: "profile_user", organization: "Клиника №1" })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.user.name).toBe("Новое Имя");
      expect(res.body.user.organization).toBe("Клиника №1");
    });
  });

  describe("PATCH /api/auth/password", () => {
    it("меняет пароль", async () => {
      const user = await registerAndLogin("password_user", "old_password", "Тест");

      await request(app)
        .patch("/api/auth/password")
        .set(authHeader(user.token))
        .send({ currentPassword: "old_password", newPassword: "new_password_1" })
        .expect(200);

      // Старый пароль больше не работает
      await request(app)
        .post("/api/auth/login")
        .send({ username: "password_user", password: "old_password" })
        .expect(400);

      // Новый работает
      await request(app)
        .post("/api/auth/login")
        .send({ username: "password_user", password: "new_password_1" })
        .expect(200);
    });

    it("возвращает 400 при неверном текущем пароле", async () => {
      const user = await registerAndLogin("password_user2", "secret123", "Тест");

      const res = await request(app)
        .patch("/api/auth/password")
        .set(authHeader(user.token))
        .send({ currentPassword: "wrong", newPassword: "new_password_1" })
        .expect(400);

      expect(res.body.error).toContain("текущий пароль");
    });
  });

  describe("JWT-защита", () => {
    it("блокирует доступ без токена к /api/patients", async () => {
      await request(app).get("/api/patients").expect(401);
    });

    it("health доступен без токена", async () => {
      await request(app).get("/api/health").expect(200);
    });
  });
});