"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const bcrypt = __importStar(require("bcryptjs"));
class UserRepository {
    constructor(db) {
        this.db = db;
    }
    async registerUser(username, password, name, organization) {
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
            const insert = this.db.prepare("INSERT INTO users (username, password, name, organization) VALUES (?, ?, ?, ?)");
            const result = insert.run(username, hashedPassword, name, organization || null);
            return {
                success: true,
                message: "Регистрация успешна",
                userId: result.lastInsertRowid,
            };
        }
        catch (error) {
            console.error("Registration error:", error);
            return { success: false, message: "Ошибка при регистрации" };
        }
    }
    async loginUser(username, password) {
        try {
            const user = this.db
                .prepare("SELECT id, username, password, name, organization, created_at FROM users WHERE username = ?")
                .get(username);
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
        }
        catch (error) {
            console.error("Login error:", error);
            return { success: false, message: "Ошибка при входе" };
        }
    }
    getUserById(id) {
        const user = this.db
            .prepare("SELECT id, username, name, organization, created_at, last_login FROM users WHERE id = ?")
            .get(id);
        return user;
    }
    async updateUser(id, name, username, organization) {
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
                .prepare("UPDATE users SET name = ?, username = ?, organization = ? WHERE id = ?")
                .run(name, username, organization || null, id);
            return { success: true, message: "Профиль успешно обновлен" };
        }
        catch (error) {
            console.error("Update user error:", error);
            return { success: false, message: "Ошибка при обновлении профиля" };
        }
    }
    async changePassword(userId, currentPassword, newPassword) {
        try {
            const user = this.db
                .prepare("SELECT id, password FROM users WHERE id = ?")
                .get(userId);
            if (!user) {
                return { success: false, message: "Пользователь не найден" };
            }
            const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
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
        }
        catch (error) {
            console.error("Change password error:", error);
            return { success: false, message: "Ошибка при смене пароля" };
        }
    }
}
exports.UserRepository = UserRepository;
