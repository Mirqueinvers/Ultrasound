// @vitest-environment node
import { describe, expect, it, beforeEach } from "vitest";
import { UserRepository } from "../userRepository";
import { createInMemoryDatabase } from "./helpers";
import type Database from "better-sqlite3";

describe("UserRepository", () => {
  let db: Database.Database;
  let repo: UserRepository;

  beforeEach(() => {
    db = createInMemoryDatabase();
    repo = new UserRepository(db);
  });

  it("регистрирует пользователя", async () => {
    const result = await repo.registerUser("doctor@example.com", "password123", "Иванов И.И.", "ГБУЗ №1");
    expect(result.success).toBe(true);
    expect(result.userId).toBeTypeOf("number");
  });

  it("не регистрирует дубликат username", async () => {
    await repo.registerUser("doctor@example.com", "password123", "Иванов И.И.");
    const second = await repo.registerUser("doctor@example.com", "other", "Петров П.П.");
    expect(second.success).toBe(false);
    expect(second.message).toBe("Пользователь с таким логином уже существует");
  });

  it("выполняет вход с корректным паролем (bcrypt)", async () => {
    await repo.registerUser("doctor@example.com", "password123", "Иванов И.И.", "ГБУЗ №1");
    const login = await repo.loginUser("doctor@example.com", "password123");
    expect(login.success).toBe(true);
    expect(login.user?.username).toBe("doctor@example.com");
    // пароль не должен попадать в ответ
    expect((login.user as Record<string, unknown>).password).toBeUndefined();
  });

  it("отклоняет вход с неверным паролем", async () => {
    await repo.registerUser("doctor@example.com", "password123", "Иванов И.И.");
    const login = await repo.loginUser("doctor@example.com", "wrong");
    expect(login.success).toBe(false);
    expect(login.message).toBe("Неверный логин или пароль");
  });

  it("получает пользователя по id", async () => {
    const { userId } = await repo.registerUser("doctor@example.com", "password123", "Иванов И.И.");
    const user = repo.getUserById(userId!);
    expect(user?.name).toBe("Иванов И.И.");
    expect(repo.getUserById(9999)).toBeUndefined();
  });

  it("обновляет профиль пользователя", async () => {
    const { userId } = await repo.registerUser("doctor@example.com", "password123", "Иванов И.И.");
    const result = await repo.updateUser(userId!, "Новое имя", "new@example.com", "Организация");
    expect(result.success).toBe(true);

    const user = repo.getUserById(userId!);
    expect(user?.name).toBe("Новое имя");
    expect(user?.username).toBe("new@example.com");
  });

  it("не позволяет занять username другого пользователя", async () => {
    await repo.registerUser("first@example.com", "password123", "Первый");
    const { userId } = await repo.registerUser("second@example.com", "password123", "Второй");
    const result = await repo.updateUser(userId!, "Второй", "first@example.com");
    expect(result.success).toBe(false);
  });

  it("меняет пароль", async () => {
    const { userId } = await repo.registerUser("doctor@example.com", "password123", "Иванов И.И.");
    const result = await repo.changePassword(userId!, "password123", "newpassword1");
    expect(result.success).toBe(true);

    const login = await repo.loginUser("doctor@example.com", "newpassword1");
    expect(login.success).toBe(true);
  });

  it("отклоняет смену пароля с неверным текущим", async () => {
    const { userId } = await repo.registerUser("doctor@example.com", "password123", "Иванов И.И.");
    const result = await repo.changePassword(userId!, "wrong", "newpassword1");
    expect(result.success).toBe(false);
    expect(result.message).toBe("Неверный текущий пароль");
  });

  it("отклоняет короткий новый пароль", async () => {
    const { userId } = await repo.registerUser("doctor@example.com", "password123", "Иванов И.И.");
    const result = await repo.changePassword(userId!, "password123", "12345");
    expect(result.success).toBe(false);
  });
});