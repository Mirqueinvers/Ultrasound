// ultrasound/frontend/electron/database/userRepository.ts
import type Database from "better-sqlite3";
import * as bcrypt from "bcryptjs";
import type { User } from "./schema";

export class UserRepository {
  constructor(private db: Database.Database) {}

  async registerUser(
    username: string,
    password: string,
    name: string,
    organization?: string
  ): Promise<{ success: boolean; message: string; userId?: number }> {
    try {
      const existingUser = this.db
        .prepare("SELECT id FROM users WHERE username = ?")
        .get(username);

      if (existingUser) {
        return {
          success: false,
          message: "Пользователь с таким логином уже существует",
        };
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const insert = this.db.prepare(
        "INSERT INTO users (username, password, name, organization) VALUES (?, ?, ?, ?)"
      );
      const result = insert.run(
        username,
        hashedPassword,
        name,
        organization || null
      );

      return {
        success: true,
        message: "Регистрация успешна",
        userId: result.lastInsertRowid as number,
      };
    } catch (error) {
      console.error("Registration error:", error);
      return { success: false, message: "Ошибка при регистрации" };
    }
  }

  async loginUser(
    username: string,
    password: string
  ): Promise<{ success: boolean; message: string; user?: Partial<User> }> {
    try {
      const user = this.db
        .prepare(
          "SELECT id, username, password, name, organization, created_at FROM users WHERE username = ?"
        )
        .get(username) as User | undefined;

      if (!user) {
        return { success: false, message: "Неверный логин или пароль" };
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return { success: false, message: "Неверный логин или пароль" };
      }

      this.db
        .prepare("UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?")
        .run(user.id);

      const { password: _pw, ...userWithoutPassword } = user;
      return {
        success: true,
        message: "Вход выполнен успешно",
        user: userWithoutPassword,
      };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, message: "Ошибка при входе" };
    }
  }

  getUserById(id: number): Partial<User> | undefined {
    const user = this.db
      .prepare(
        "SELECT id, username, name, organization, created_at, last_login FROM users WHERE id = ?"
      )
      .get(id) as User | undefined;

    return user;
  }

  async updateUser(
    id: number,
    name: string,
    username: string,
    organization?: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const existingUser = this.db
        .prepare("SELECT id FROM users WHERE id = ?")
        .get(id);
      if (!existingUser) {
        return { success: false, message: "Пользователь не найден" };
      }

      const userWithSameUsername = this.db
        .prepare("SELECT id FROM users WHERE username = ? AND id != ?")
        .get(username, id);
      if (userWithSameUsername) {
        return {
          success: false,
          message: "Этот email уже используется другим пользователем",
        };
      }

      this.db
        .prepare(
          "UPDATE users SET name = ?, username = ?, organization = ? WHERE id = ?"
        )
        .run(name, username, organization || null, id);

      return { success: true, message: "Профиль успешно обновлен" };
    } catch (error) {
      console.error("Update user error:", error);
      return { success: false, message: "Ошибка при обновлении профиля" };
    }
  }

  async changePassword(
    userId: number,
    currentPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const user = this.db
        .prepare("SELECT id, password FROM users WHERE id = ?")
        .get(userId) as { id: number; password: string } | undefined;

      if (!user) {
        return { success: false, message: "Пользователь не найден" };
      }

      const isPasswordValid = await bcrypt.compare(
        currentPassword,
        user.password
      );
      if (!isPasswordValid) {
        return { success: false, message: "Неверный текущий пароль" };
      }

      if (newPassword.length < 6) {
        return {
          success: false,
          message: "Новый пароль должен содержать минимум 6 символов",
        };
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      this.db
        .prepare("UPDATE users SET password = ? WHERE id = ?")
        .run(hashedPassword, userId);

      return { success: true, message: "Пароль успешно изменен" };
    } catch (error) {
      console.error("Change password error:", error);
      return { success: false, message: "Ошибка при смене пароля" };
    }
  }
}
