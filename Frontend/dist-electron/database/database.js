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
// ultrasound/frontend/electron/database/database.ts
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const electron_1 = require("electron");
const path = __importStar(require("path"));
const initDatabase_1 = require("./initDatabase");
const userRepository_1 = require("./userRepository");
const patientRepository_1 = require("./patientRepository");
const researchRepository_1 = require("./researchRepository");
const journalRepository_1 = require("./journalRepository");
const protocolRepository_1 = require("./protocolRepository");
class DatabaseManager {
    constructor() {
        const userDataPath = electron_1.app.getPath("userData");
        const dbPath = path.join(userDataPath, "ultrasound.db");
        console.log("📁 Путь к БД:", dbPath);
        this.db = new better_sqlite3_1.default(dbPath);
        (0, initDatabase_1.initializeDatabase)(this.db);
        (0, initDatabase_1.runMigrations)(this.db);
        console.log("✅ База данных инициализирована");
        this.users = new userRepository_1.UserRepository(this.db);
        this.patients = new patientRepository_1.PatientRepository(this.db);
        this.researches = new researchRepository_1.ResearchRepository(this.db);
        this.journal = new journalRepository_1.JournalRepository(this.db);
        this.protocol = new protocolRepository_1.ProtocolRepository(this.db);
    }
    static getInstance() {
        if (!DatabaseManager.instance) {
            DatabaseManager.instance = new DatabaseManager();
        }
        return DatabaseManager.instance;
    }
    close() {
        this.db.close();
    }
}
exports.DatabaseManager = DatabaseManager;
