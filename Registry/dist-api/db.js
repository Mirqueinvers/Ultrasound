"use strict";
/**
 * Слой доступа к данным Registry.
 *
 * Этап 3.2 плана перехода на PostgreSQL: локальная БД sql.js (registry.db)
 * заменена вызовами к центральному API-серверу (Server/).
 *
 * Все функции асинхронные. Формат данных сохранён как в старом Registry
 * (snake_case) — его отдаёт центральный API. ID теперь — строки (UUID).
 *
 * Авторизация: при initDb() выполняется вход сервисной учёткой регистратуры.
 * Учётные данные задаются переменными окружения:
 *   CENTRAL_API_URL   — адрес центрального API (по умолчанию http://localhost:4000/api);
 *   REGISTRY_USERNAME — логин (по умолчанию registry);
 *   REGISTRY_PASSWORD — пароль (по умолчанию registry123).
 * Если аккаунт ещё не создан (БД сервера стартовала пустой), при первом
 * старте он регистрируется автоматически.
 *
 * Данные старых registry.db НЕ переносятся — регистратура стартует с пустой базы.
 */
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
exports.initDb = initDb;
exports.getAppointmentsByMonth = getAppointmentsByMonth;
exports.getAppointmentsByDate = getAppointmentsByDate;
exports.createAppointment = createAppointment;
exports.updateAppointment = updateAppointment;
exports.deleteAppointment = deleteAppointment;
exports.getDoctors = getDoctors;
exports.createDoctor = createDoctor;
exports.updateDoctor = updateDoctor;
exports.deleteDoctor = deleteDoctor;
const api = __importStar(require("./services/apiClient"));
// ===== Конфигурация сервисной учётки регистратуры =====
const CENTRAL_API_URL = process.env.CENTRAL_API_URL || "http://localhost:4000/api";
const REGISTRY_USERNAME = process.env.REGISTRY_USERNAME || "registry";
const REGISTRY_PASSWORD = process.env.REGISTRY_PASSWORD || "registry123";
// ===== Маппинг DTO apiClient -> формат Registry =====
function mapAppointmentDto(a) {
    return {
        id: a.id,
        patient_id: a.patientId,
        appointment_date: a.appointmentDate,
        studies: a.studies,
        department: a.department,
        created_at: a.createdAt,
        patient: a.patient
            ? {
                id: a.patient.id,
                last_name: a.patient.lastName,
                first_name: a.patient.firstName,
                middle_name: a.patient.middleName,
                date_of_birth: a.patient.dateOfBirth,
            }
            : undefined,
    };
}
function mapDoctorDto(d) {
    return {
        id: d.id,
        name: d.name,
        max_patients_per_day: d.maxPatientsPerDay,
        work_days: JSON.stringify(d.workDays),
    };
}
// ===== Инициализация: адрес сервера + авторизация =====
async function initDb() {
    api.setApiUrl(CENTRAL_API_URL);
    // Пытаемся войти. Если аккаунта ещё нет (БД стартовала пустой) — регистрируем.
    try {
        const result = await api.login(REGISTRY_USERNAME, REGISTRY_PASSWORD);
        api.setToken(result.token);
        return;
    }
    catch (err) {
        console.warn(`initDb: вход "${REGISTRY_USERNAME}" не удался, пробуем создать учётную запись`, err);
    }
    try {
        await api.register({
            username: REGISTRY_USERNAME,
            password: REGISTRY_PASSWORD,
            name: "Регистратура",
        });
        const result = await api.login(REGISTRY_USERNAME, REGISTRY_PASSWORD);
        api.setToken(result.token);
        console.log(`initDb: учётная запись "${REGISTRY_USERNAME}" создана`);
    }
    catch (err) {
        console.error("initDb: не удалось авторизоваться в центральном API. " +
            "Проверьте CENTRAL_API_URL, REGISTRY_USERNAME, REGISTRY_PASSWORD.", err);
    }
}
// ===== Записи (Appointments) =====
async function getAppointmentsByMonth(month, year) {
    const items = await api.fetchAppointmentsByMonth(month, year);
    return items.map(mapAppointmentDto);
}
async function getAppointmentsByDate(date) {
    const items = await api.fetchAppointmentsByDate(date);
    return items.map(mapAppointmentDto);
}
async function createAppointment(patientData, appointmentDate, studies) {
    const created = await api.createAppointment({
        lastName: patientData.last_name,
        firstName: patientData.first_name,
        middleName: patientData.middle_name || "",
        dateOfBirth: patientData.date_of_birth,
        studies,
        appointmentDate,
        department: patientData.department || "",
    });
    return mapAppointmentDto(created);
}
async function updateAppointment(id, studies, patientData) {
    const input = { studies };
    if (patientData) {
        if (patientData.last_name !== undefined)
            input.lastName = patientData.last_name;
        if (patientData.first_name !== undefined)
            input.firstName = patientData.first_name;
        if (patientData.middle_name !== undefined)
            input.middleName = patientData.middle_name;
        if (patientData.date_of_birth !== undefined)
            input.dateOfBirth = patientData.date_of_birth;
    }
    const updated = await api.updateAppointment(id, input);
    return updated ? mapAppointmentDto(updated) : null;
}
async function deleteAppointment(id) {
    const result = await api.deleteAppointment(id);
    return Boolean(result?.success);
}
// ===== Врачи (Doctors) =====
async function getDoctors() {
    const doctors = await api.fetchDoctors();
    return doctors.map(mapDoctorDto);
}
async function createDoctor(name, maxPatientsPerDay, workDays) {
    const doctor = await api.createDoctor({
        name,
        maxPatientsPerDay,
        workDays,
    });
    return mapDoctorDto(doctor);
}
async function updateDoctor(id, name, maxPatientsPerDay, workDays) {
    const doctor = await api.updateDoctor(id, {
        name,
        maxPatientsPerDay,
        workDays,
    });
    return doctor ? mapDoctorDto(doctor) : null;
}
async function deleteDoctor(id) {
    const result = await api.deleteDoctor(id);
    return Boolean(result?.success);
}
//# sourceMappingURL=db.js.map