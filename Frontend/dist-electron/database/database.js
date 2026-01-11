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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseManager = void 0;
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const electron_1 = require("electron");
const path = __importStar(require("path"));
const bcrypt = __importStar(require("bcryptjs"));
const schema_1 = require("./schema");
class DatabaseManager {
    constructor() {
        const userDataPath = electron_1.app.getPath('userData');
        const dbPath = path.join(userDataPath, 'ultrasound.db');
        console.log('📁 Путь к БД:', dbPath);
        this.db = new better_sqlite3_1.default(dbPath);
        this.initializeDatabase();
        console.log('✅ База данных инициализирована');
    }
    static getInstance() {
        if (!DatabaseManager.instance) {
            DatabaseManager.instance = new DatabaseManager();
        }
        return DatabaseManager.instance;
    }
    initializeDatabase() {
        this.db.exec(schema_1.CREATE_USERS_TABLE);
        this.db.exec(schema_1.CREATE_USERNAME_INDEX);
    }
    async registerUser(username, password, name) {
        try {
            const existingUser = this.db.prepare('SELECT id FROM users WHERE username = ?').get(username);
            if (existingUser) {
                return { success: false, message: 'Пользователь с таким логином уже существует' };
            }
            const hashedPassword = await bcrypt.hash(password, 10);
            const insert = this.db.prepare('INSERT INTO users (username, password, name) VALUES (?, ?, ?)');
            const result = insert.run(username, hashedPassword, name);
            return {
                success: true,
                message: 'Регистрация успешна',
                userId: result.lastInsertRowid
            };
        }
        catch (error) {
            console.error('Registration error:', error);
            return { success: false, message: 'Ошибка при регистрации' };
        }
    }
    async loginUser(username, password) {
        try {
            const user = this.db.prepare('SELECT id, username, password, name, created_at FROM users WHERE username = ?').get(username);
            if (!user) {
                return { success: false, message: 'Неверный логин или пароль' };
            }
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return { success: false, message: 'Неверный логин или пароль' };
            }
            this.db.prepare('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?').run(user.id);
            const { password: _, ...userWithoutPassword } = user;
            return {
                success: true,
                message: 'Вход выполнен успешно',
                user: userWithoutPassword
            };
        }
        catch (error) {
            console.error('Login error:', error);
            return { success: false, message: 'Ошибка при входе' };
        }
    }
    getUserById(id) {
        const user = this.db.prepare('SELECT id, username, name, created_at, last_login FROM users WHERE id = ?').get(id);
        return user;
    }
    close() {
        this.db.close();
    }
}
exports.DatabaseManager = DatabaseManager;
