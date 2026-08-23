"use strict";
/**
 * API-клиент для центрального сервера (PostgreSQL + Prisma).
 *
 * Этап 3.1 плана перехода на PostgreSQL.
 *
 * Назначение: заменить локальную БД Registry (sql.js) и локальный HTTP-сервер
 * (src/api.ts) вызовами к центральному API-серверу. Все данные (пациенты,
 * записи, врачи) теперь хранятся на сервере в единой базе.
 *
 * Контракт:
 *  - Базовый URL задаётся через setApiUrl() (по умолчанию — http://localhost:4000/api).
 *    Renderer при старте вызывает setApiUrl(config.apiUrl) (значение VITE_API_URL);
 *    серверная часть (db.ts) — свой адрес из переменных окружения.
 *  - Запросы отправляются в camelCase (как текущий UI);
 *  - Ответы приходят от сервера в snake_case (маппинг Prisma @@map),
 *    клиент нормализует их в DTO для UI;
 *  - ID записей — строки (UUID), а не числа.
 *  - Авторизация: JWT-токен передаётся в заголовке `Authorization: Bearer <token>`.
 *    Токен получается через login()/register() и хранится в памяти модуля
 *    (setToken()). Персистентность токена — ответственность вызывающего кода.
 *
 * ВАЖНО: модуль не зависит от `import.meta.env` / config.ts, чтобы его можно
 * было использовать и в main-процессе (tsc-сборка db.ts через tsconfig.api.json).
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.setApiUrl = setApiUrl;
exports.getApiUrl = getApiUrl;
exports.setToken = setToken;
exports.getToken = getToken;
exports.clearToken = clearToken;
exports.login = login;
exports.register = register;
exports.fetchAppointmentsByDate = fetchAppointmentsByDate;
exports.fetchAppointmentsByMonth = fetchAppointmentsByMonth;
exports.createAppointment = createAppointment;
exports.updateAppointment = updateAppointment;
exports.deleteAppointment = deleteAppointment;
exports.fetchDoctors = fetchDoctors;
exports.createDoctor = createDoctor;
exports.updateDoctor = updateDoctor;
exports.deleteDoctor = deleteDoctor;
exports.fetchHealth = fetchHealth;
// ===== Состояние клиента =====
const DEFAULT_API_URL = "http://localhost:4000/api";
let apiBase = DEFAULT_API_URL;
let token = null;
function setApiUrl(url) {
    apiBase = (url || DEFAULT_API_URL).replace(/\/+$/, "");
}
function getApiUrl() {
    return apiBase;
}
function setToken(value) {
    token = value;
}
function getToken() {
    return token;
}
function clearToken() {
    token = null;
}
// ===== Базовый запрос =====
async function request(path, options, allowNotFound = false) {
    const headers = {
        "Content-Type": "application/json",
        ...options?.headers,
    };
    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }
    const res = await fetch(`${apiBase}${path}`, {
        ...options,
        headers,
    });
    if (res.status === 404 && allowNotFound) {
        // Для DELETE 404 означает, что запись уже не существует — это успех
        return { success: true };
    }
    if (!res.ok) {
        let message = `HTTP ${res.status}`;
        try {
            const body = await res.json();
            if (body && typeof body === "object") {
                const error = body.error;
                const msg = body.message;
                if (typeof error === "string") {
                    message = error;
                }
                else if (typeof msg === "string") {
                    message = msg;
                }
            }
        }
        catch {
            // Тело не JSON — оставляем статус
        }
        throw new Error(message);
    }
    if (res.status === 204) {
        return undefined;
    }
    return res.json();
}
// ===== Маппинги =====
function normalizeStudies(studies) {
    if (Array.isArray(studies)) {
        return studies.filter((s) => typeof s === "string");
    }
    if (typeof studies === "string") {
        try {
            const parsed = JSON.parse(studies);
            if (Array.isArray(parsed)) {
                return parsed.filter((s) => typeof s === "string");
            }
        }
        catch {
            // Не JSON
        }
    }
    return [];
}
function mapAppointment(a) {
    return {
        id: a.id,
        patientId: a.patient_id,
        appointmentDate: a.appointment_date,
        studies: normalizeStudies(a.studies),
        department: a.department ?? "",
        createdAt: a.created_at,
        patient: a.patient
            ? {
                id: a.patient.id,
                lastName: a.patient.last_name,
                firstName: a.patient.first_name,
                middleName: a.patient.middle_name ?? "",
                dateOfBirth: a.patient.date_of_birth,
            }
            : undefined,
    };
}
function normalizeWorkDays(workDays) {
    if (Array.isArray(workDays)) {
        return workDays.filter((d) => typeof d === "number");
    }
    if (typeof workDays === "string") {
        try {
            const parsed = JSON.parse(workDays);
            if (Array.isArray(parsed)) {
                return parsed.filter((d) => typeof d === "number");
            }
        }
        catch {
            // Не JSON
        }
    }
    return [1, 2, 3, 4, 5];
}
function mapDoctor(d) {
    return {
        id: d.id,
        name: d.name,
        maxPatientsPerDay: d.max_patients_per_day,
        workDays: normalizeWorkDays(d.work_days),
    };
}
// ===== Авторизация =====
function login(username, password) {
    return request("/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
    });
}
function register(data) {
    return request("/auth/register", {
        method: "POST",
        body: JSON.stringify(data),
    });
}
// ===== Записи (Appointments) =====
function fetchAppointmentsByDate(date) {
    return request(`/appointments?date=${encodeURIComponent(date)}`).then((items) => items.map(mapAppointment));
}
function fetchAppointmentsByMonth(month, year) {
    return request(`/appointments?month=${month}&year=${year}`).then((items) => items.map(mapAppointment));
}
function createAppointment(data) {
    return request("/appointments", {
        method: "POST",
        body: JSON.stringify(data),
    }).then(mapAppointment);
}
function updateAppointment(id, data) {
    return request(`/appointments/${encodeURIComponent(id)}`, {
        method: "PUT",
        body: JSON.stringify(data),
    }).then(mapAppointment);
}
function deleteAppointment(id) {
    return request(`/appointments/${encodeURIComponent(id)}`, { method: "DELETE" }, true);
}
// ===== Врачи (Doctors) =====
function fetchDoctors() {
    return request("/doctors").then((items) => items.map(mapDoctor));
}
function createDoctor(data) {
    return request("/doctors", {
        method: "POST",
        body: JSON.stringify(data),
    }).then(mapDoctor);
}
function updateDoctor(id, data) {
    return request(`/doctors/${encodeURIComponent(id)}`, {
        method: "PUT",
        body: JSON.stringify(data),
    }).then(mapDoctor);
}
function deleteDoctor(id) {
    return request(`/doctors/${encodeURIComponent(id)}`, { method: "DELETE" }, true);
}
// ===== Здоровье сервера =====
function fetchHealth() {
    return request("/health");
}
//# sourceMappingURL=apiClient.js.map