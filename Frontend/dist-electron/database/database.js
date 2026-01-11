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
        this.runMigrations();
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
        this.db.exec(schema_1.CREATE_PATIENTS_TABLE);
        this.db.exec(schema_1.CREATE_PATIENTS_INDEXES);
        this.db.exec(schema_1.CREATE_RESEARCHES_TABLE);
        this.db.exec(schema_1.CREATE_RESEARCH_STUDIES_TABLE);
        this.db.exec(schema_1.CREATE_RESEARCHES_INDEXES);
    }
    runMigrations() {
        const tableInfo = this.db.pragma('table_info(users)');
        const hasOrganization = tableInfo.some((col) => col.name === 'organization');
        if (!hasOrganization) {
            console.log('🔄 Добавляем колонку organization...');
            this.db.exec('ALTER TABLE users ADD COLUMN organization TEXT');
            console.log('✅ Колонка organization добавлена');
        }
    }
    // =============== USERS ===============
    async registerUser(username, password, name, organization) {
        try {
            const existingUser = this.db
                .prepare('SELECT id FROM users WHERE username = ?')
                .get(username);
            if (existingUser) {
                return { success: false, message: 'Пользователь с таким логином уже существует' };
            }
            const hashedPassword = await bcrypt.hash(password, 10);
            const insert = this.db.prepare('INSERT INTO users (username, password, name, organization) VALUES (?, ?, ?, ?)');
            const result = insert.run(username, hashedPassword, name, organization || null);
            return {
                success: true,
                message: 'Регистрация успешна',
                userId: result.lastInsertRowid,
            };
        }
        catch (error) {
            console.error('Registration error:', error);
            return { success: false, message: 'Ошибка при регистрации' };
        }
    }
    async loginUser(username, password) {
        try {
            const user = this.db
                .prepare('SELECT id, username, password, name, organization, created_at FROM users WHERE username = ?')
                .get(username);
            if (!user) {
                return { success: false, message: 'Неверный логин или пароль' };
            }
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return { success: false, message: 'Неверный логин или пароль' };
            }
            this.db
                .prepare('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?')
                .run(user.id);
            const { password: _pw, ...userWithoutPassword } = user;
            return {
                success: true,
                message: 'Вход выполнен успешно',
                user: userWithoutPassword,
            };
        }
        catch (error) {
            console.error('Login error:', error);
            return { success: false, message: 'Ошибка при входе' };
        }
    }
    getUserById(id) {
        const user = this.db
            .prepare('SELECT id, username, name, organization, created_at, last_login FROM users WHERE id = ?')
            .get(id);
        return user;
    }
    async updateUser(id, name, username, organization) {
        try {
            const existingUser = this.db.prepare('SELECT id FROM users WHERE id = ?').get(id);
            if (!existingUser) {
                return { success: false, message: 'Пользователь не найден' };
            }
            const userWithSameUsername = this.db
                .prepare('SELECT id FROM users WHERE username = ? AND id != ?')
                .get(username, id);
            if (userWithSameUsername) {
                return { success: false, message: 'Этот email уже используется другим пользователем' };
            }
            this.db
                .prepare('UPDATE users SET name = ?, username = ?, organization = ? WHERE id = ?')
                .run(name, username, organization || null, id);
            return { success: true, message: 'Профиль успешно обновлен' };
        }
        catch (error) {
            console.error('Update user error:', error);
            return { success: false, message: 'Ошибка при обновлении профиля' };
        }
    }
    async changePassword(userId, currentPassword, newPassword) {
        try {
            const user = this.db
                .prepare('SELECT id, password FROM users WHERE id = ?')
                .get(userId);
            if (!user) {
                return { success: false, message: 'Пользователь не найден' };
            }
            const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
            if (!isPasswordValid) {
                return { success: false, message: 'Неверный текущий пароль' };
            }
            if (newPassword.length < 6) {
                return { success: false, message: 'Новый пароль должен содержать минимум 6 символов' };
            }
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            this.db
                .prepare('UPDATE users SET password = ? WHERE id = ?')
                .run(hashedPassword, userId);
            return { success: true, message: 'Пароль успешно изменен' };
        }
        catch (error) {
            console.error('Change password error:', error);
            return { success: false, message: 'Ошибка при смене пароля' };
        }
    }
    // =============== PATIENTS ===============
    createPatient(lastName, firstName, middleName, dateOfBirth) {
        try {
            const insert = this.db.prepare('INSERT INTO patients (last_name, first_name, middle_name, date_of_birth) VALUES (?, ?, ?, ?)');
            const result = insert.run(lastName, firstName, middleName, dateOfBirth);
            return {
                success: true,
                message: 'Пациент успешно создан',
                patientId: result.lastInsertRowid,
            };
        }
        catch (error) {
            console.error('Create patient error:', error);
            return { success: false, message: 'Ошибка при создании пациента' };
        }
    }
    findPatientById(id) {
        return this.db
            .prepare('SELECT * FROM patients WHERE id = ?')
            .get(id);
    }
    findPatientByFullNameAndDob(lastName, firstName, middleName, dateOfBirth) {
        return this.db
            .prepare(`
        SELECT * FROM patients
        WHERE last_name = ?
          AND first_name = ?
          AND (middle_name = ? OR (middle_name IS NULL AND ? IS NULL))
          AND date_of_birth = ?
      `)
            .get(lastName, firstName, middleName, middleName, dateOfBirth);
    }
    findOrCreatePatient(lastName, firstName, middleName, dateOfBirth) {
        try {
            const existing = this.findPatientByFullNameAndDob(lastName, firstName, middleName, dateOfBirth);
            if (existing) {
                return { success: true, message: 'Пациент найден', patient: existing };
            }
            const result = this.createPatient(lastName, firstName, middleName, dateOfBirth);
            if (result.success && result.patientId) {
                const patient = this.findPatientById(result.patientId);
                return { success: true, message: 'Пациент создан', patient };
            }
            return { success: false, message: 'Ошибка при создании пациента' };
        }
        catch (error) {
            console.error('Find or create patient error:', error);
            return { success: false, message: 'Ошибка при поиске/создании пациента' };
        }
    }
    searchPatients(query, limit = 50) {
        const searchPattern = `%${query}%`;
        return this.db
            .prepare(`
        SELECT * FROM patients
        WHERE last_name LIKE ?
           OR first_name LIKE ?
           OR middle_name LIKE ?
        ORDER BY last_name, first_name
        LIMIT ?
      `)
            .all(searchPattern, searchPattern, searchPattern, limit);
    }
    getAllPatients(limit = 100, offset = 0) {
        return this.db
            .prepare(`
        SELECT * FROM patients
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
      `)
            .all(limit, offset);
    }
    updatePatient(id, lastName, firstName, middleName, dateOfBirth) {
        try {
            const result = this.db
                .prepare(`
          UPDATE patients
          SET last_name = ?,
              first_name = ?,
              middle_name = ?,
              date_of_birth = ?,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `)
                .run(lastName, firstName, middleName, dateOfBirth, id);
            if (result.changes > 0) {
                return { success: true, message: 'Данные пациента обновлены' };
            }
            return { success: false, message: 'Пациент не найден' };
        }
        catch (error) {
            console.error('Update patient error:', error);
            return { success: false, message: 'Ошибка при обновлении данных пациента' };
        }
    }
    // =============== RESEARCHES ===============
    createResearch(patientId, researchDate, paymentType, doctorName, notes) {
        try {
            const insert = this.db.prepare('INSERT INTO researches (patient_id, research_date, payment_type, doctor_name, notes) VALUES (?, ?, ?, ?, ?)');
            const result = insert.run(patientId, researchDate, paymentType, doctorName || null, notes || null);
            return {
                success: true,
                message: 'Исследование создано',
                researchId: result.lastInsertRowid,
            };
        }
        catch (error) {
            console.error('Create research error:', error);
            return { success: false, message: 'Ошибка при создании исследования' };
        }
    }
    addStudyToResearch(researchId, studyType, studyData) {
        try {
            const insert = this.db.prepare('INSERT INTO research_studies (research_id, study_type, study_data) VALUES (?, ?, ?)');
            const result = insert.run(researchId, studyType, JSON.stringify(studyData));
            return {
                success: true,
                message: 'Исследование добавлено',
                studyId: result.lastInsertRowid,
            };
        }
        catch (error) {
            console.error('Add study error:', error);
            return { success: false, message: 'Ошибка при добавлении исследования' };
        }
    }
    getResearchById(id) {
        const research = this.db
            .prepare('SELECT * FROM researches WHERE id = ?')
            .get(id);
        if (!research)
            return null;
        const studies = this.db
            .prepare('SELECT * FROM research_studies WHERE research_id = ?')
            .all(id);
        return {
            ...research,
            studies: studies.map((study) => ({
                ...study,
                study_data: JSON.parse(study.study_data),
            })),
        };
    }
    getResearchesByPatientId(patientId, limit = 50, offset = 0) {
        const researches = this.db
            .prepare(`
        SELECT * FROM researches
        WHERE patient_id = ?
        ORDER BY research_date DESC, created_at DESC
        LIMIT ? OFFSET ?
      `)
            .all(patientId, limit, offset);
        return researches.map((research) => {
            const studies = this.db
                .prepare('SELECT * FROM research_studies WHERE research_id = ?')
                .all(research.id);
            return {
                ...research,
                studies: studies.map((study) => ({
                    ...study,
                    study_data: JSON.parse(study.study_data),
                })),
            };
        });
    }
    getAllResearches(limit = 100, offset = 0) {
        const researches = this.db
            .prepare(`
        SELECT
          r.*,
          p.last_name,
          p.first_name,
          p.middle_name,
          p.date_of_birth
        FROM researches r
        JOIN patients p ON r.patient_id = p.id
        ORDER BY r.research_date DESC, r.created_at DESC
        LIMIT ? OFFSET ?
      `)
            .all(limit, offset);
        return researches.map((research) => {
            const studies = this.db
                .prepare('SELECT * FROM research_studies WHERE research_id = ?')
                .all(research.id);
            return {
                ...research,
                studies: studies.map((study) => ({
                    ...study,
                    study_data: JSON.parse(study.study_data),
                })),
            };
        });
    }
    updateResearch(id, researchDate, paymentType, doctorName, notes) {
        try {
            const fields = [];
            const values = [];
            if (researchDate !== undefined) {
                fields.push('research_date = ?');
                values.push(researchDate);
            }
            if (paymentType !== undefined) {
                fields.push('payment_type = ?');
                values.push(paymentType);
            }
            if (doctorName !== undefined) {
                fields.push('doctor_name = ?');
                values.push(doctorName);
            }
            if (notes !== undefined) {
                fields.push('notes = ?');
                values.push(notes);
            }
            if (fields.length === 0) {
                return { success: false, message: 'Нет данных для обновления' };
            }
            fields.push('updated_at = CURRENT_TIMESTAMP');
            values.push(id);
            const result = this.db
                .prepare(`UPDATE researches SET ${fields.join(', ')} WHERE id = ?`)
                .run(...values);
            if (result.changes > 0) {
                return { success: true, message: 'Исследование обновлено' };
            }
            return { success: false, message: 'Исследование не найдено' };
        }
        catch (error) {
            console.error('Update research error:', error);
            return { success: false, message: 'Ошибка при обновлении исследования' };
        }
    }
    deleteResearch(id) {
        try {
            const result = this.db.prepare('DELETE FROM researches WHERE id = ?').run(id);
            if (result.changes > 0) {
                return { success: true, message: 'Исследование удалено' };
            }
            return { success: false, message: 'Исследование не найдено' };
        }
        catch (error) {
            console.error('Delete research error:', error);
            return { success: false, message: 'Ошибка при удалении исследования' };
        }
    }
    searchResearches(query, limit = 50) {
        const searchPattern = `%${query}%`;
        const researches = this.db
            .prepare(`
        SELECT
          r.*,
          p.last_name,
          p.first_name,
          p.middle_name
        FROM researches r
        JOIN patients p ON r.patient_id = p.id
        WHERE p.last_name LIKE ?
           OR p.first_name LIKE ?
           OR p.middle_name LIKE ?
           OR r.research_date LIKE ?
        ORDER BY r.research_date DESC
        LIMIT ?
      `)
            .all(searchPattern, searchPattern, searchPattern, searchPattern, limit);
        return researches.map((research) => {
            const studies = this.db
                .prepare('SELECT * FROM research_studies WHERE research_id = ?')
                .all(research.id);
            return {
                ...research,
                studies: studies.map((study) => ({
                    ...study,
                    study_data: JSON.parse(study.study_data),
                })),
            };
        });
    }
    // =============== JOURNAL ===============
    getJournalByDate(date) {
        const rows = this.db
            .prepare(`
        SELECT
          p.id              AS patient_id,
          p.last_name       AS p_last_name,
          p.first_name      AS p_first_name,
          p.middle_name     AS p_middle_name,
          p.date_of_birth   AS p_date_of_birth,
          p.created_at      AS p_created_at,
          p.updated_at      AS p_updated_at,
          r.id              AS research_id,
          r.patient_id      AS r_patient_id,
          r.research_date   AS r_research_date,
          r.payment_type    AS r_payment_type,
          r.doctor_name     AS r_doctor_name,
          r.notes           AS r_notes,
          r.created_at      AS r_created_at,
          r.updated_at      AS r_updated_at
        FROM researches r
        JOIN patients p ON r.patient_id = p.id
        WHERE DATE(r.research_date) = DATE(?)
        ORDER BY p.last_name, p.first_name, r.research_date
      `)
            .all(date);
        const map = new Map();
        for (const row of rows) {
            let entry = map.get(row.patient_id);
            if (!entry) {
                entry = {
                    patient: {
                        id: row.patient_id,
                        last_name: row.p_last_name,
                        first_name: row.p_first_name,
                        middle_name: row.p_middle_name ?? undefined,
                        date_of_birth: row.p_date_of_birth,
                        created_at: row.p_created_at,
                        updated_at: row.p_updated_at,
                    },
                    researches: [],
                };
                map.set(row.patient_id, entry);
            }
            entry.researches.push({
                id: row.research_id,
                patient_id: row.r_patient_id,
                research_date: row.r_research_date,
                payment_type: row.r_payment_type,
                doctor_name: row.r_doctor_name ?? undefined,
                notes: row.r_notes ?? undefined,
                created_at: row.r_created_at,
                updated_at: row.r_updated_at,
            });
        }
        return Array.from(map.values());
    }
    // =============== OTHER ===============
    close() {
        this.db.close();
    }
}
exports.DatabaseManager = DatabaseManager;
