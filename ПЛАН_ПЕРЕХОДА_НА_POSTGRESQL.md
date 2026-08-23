# План перехода на PostgreSQL (центральный сервер)

> **Цель:** перевести **Desktop** и **Registry** на единый центральный PostgreSQL, доступный по локальной сети клиники. Данные Desktop переносятся из старых баз, данные Registry **не переносятся** — новая база стартует пустой.
> **ORM:** Prisma.
> **Составлен:** 23.08.2026

---

## 1. Архитектура решения

### 1.1. Целевая схема

```
┌─────────────────────────────────────────────────────┐
│  СЕРВЕР (отдельная машина в локальной сети клиники)  │
│                                                     │
│  ┌─────────────┐   ┌─────────────────────────────┐  │
│  │ PostgreSQL  │◄──│  API-сервер (Node.js)       │  │
│  │ (Docker)    │   │  Express/Fastify + Prisma   │  │
│  └─────────────┘   └──────────────┬──────────────┘  │
└───────────────────────────────────┼─────────────────┘
                                    │ HTTP (локальная сеть)
                    ┌───────────────┴───────────────┐
                    │                               │
             ┌──────┴──────┐                ┌───────┴──────┐
             │   Desktop   │                │   Registry   │
             │ (кабинет УЗИ)│                │ (регистратура)│
             └──────┬──────┘                └──────────────┘
                    │ WebSocket (как сейчас)
             ┌──────┴──────┐
             │   Mobile    │
             │ (пульт, без │
             │  своей БД)  │
             └─────────────┘
```

### 1.2. Ключевые принципы

| Принцип | Описание |
|---|---|
| **Единый источник данных** | Desktop и Registry работают с одной базой PostgreSQL. Локальные БД прекращают быть источником правды. |
| **Старт с пустой БД** | Данные Registry (`registry.db`) **не переносятся** в PostgreSQL. Новая база для регистратуры начинается с нуля. |
| **Данные Desktop переносятся** | Старые `ultrasound.db` со всех машин кабинетов переносятся в PostgreSQL (миграция). |
| **UUID вместо автоинкремента** | Все таблицы получают `id UUID`. Это исключает конфликты ID при объединении данных с нескольких машин. |
| **Desktop — прокси для Mobile и Medison** | Mobile и аппарат Medison продолжают работать через Desktop по WebSocket/сети, как сейчас. |
| **Офлайн-устойчивость** | Кабинет кэширует данные локально и ставит операции в очередь при обрыве сети. Синхронизация — при восстановлении соединения. |
| **HTTP внутри локальной сети** | Без HTTPS/SSL. Авторизация — токены, доступ по IP-адресам. |

---

## 2. Текущее состояние (что переделываем)

### 2.1. Desktop (`Desktop/`) — МИГРИРУЕТ ВМЕСТЕ С ДАННЫМИ

- **Стек:** Electron + React + Vite.
- **БД:** SQLite через `better-sqlite3`. Файл `ultrasound.db` в `app.getPath("userData")`.
- **Слой БД:** `Desktop/electron/database/` — 8 репозиториев:

| Файл | Содержимое | Оценка строк |
|---|---|---|
| `database.ts` | `DatabaseManager` (синглтон), инициализация, доступ к репозиториям | 65 |
| `initDatabase.ts` | Создание таблиц + ручные миграции (`ALTER TABLE`) | 50 |
| `schema.ts` | DDL-константы (CREATE TABLE/INDEX) + TypeScript-интерфейсы | 187 |
| `userRepository.ts` | Регистрация, вход, профиль, смена пароля (`bcryptjs`) | 178 |
| `patientRepository.ts` | CRUD пациентов, поиск, findOrCreate | 184 |
| `researchRepository.ts` | CRUD исследований, study_data JSON, сложный поиск с «ё→е» | 354 |
| `journalRepository.ts` | Журнал за период/дату (пациент + исследования) | 122 |
| `protocolRepository.ts` | Протоколы: `research_studies` + `print_block_overrides`, транзакции | 94 |
| `statisticsRepository.ts` | Статистика: COUNT, GROUP BY, JOIN, `strftime`, фильтры | 401 |
| `medisonMappingRepository.ts` | Маппинги Medison: CRUD, дефолты (~50 записей) | 205 |
| `registryAppointmentRepository.ts` | Кэш записей регистратуры (замена всей таблицы) | 140 |

- **Таблицы Desktop:** `users`, `patients`, `researches`, `research_studies`, `print_block_overrides`, `medison_mappings`, `registry_appointments`.
- **IPC-слой:** `Desktop/electron/ipc-handlers.ts` (auth, patient, research, journal, protocol, statistics, registry-cache) и `Desktop/electron/ipc/medisonMappingIpc.ts` (маппинги).
- **Mobile-хост:** `Desktop/electron/mobile-host.ts` — WebSocket-сервер для Mobile (синхронизация черновиков протоколов). Базу не использует.
- **Тесты:** `Desktop/electron/database/__tests__/` — 6 файлов (`helpers.ts` создаёт in-memory SQLite через `better-sqlite3`).

### 2.2. Registry (`Registry/`) — ПЕРЕХОДИТ, БЕЗ ПЕРЕНОСА ДАННЫХ

- **Стек:** Electron + React + Vite + собственный HTTP-сервер (приём экспорта от Desktop).
- **БД:** SQLite через `sql.js` (WASM). Файл `registry.db`. Логика в `Registry/src/db.ts` (360 строк).
- **Таблицы Registry:** `patients`, `appointments`, `doctors`.
- **Роль в новой архитектуре:** переходит на центральный PostgreSQL. Старые данные из `registry.db` **не переносятся** — регистратура начинает работать с чистой базы. Существующие механизмы обмена с Desktop (`network:sendExport` → `/receive-export`, кэш `registry_appointments`) **упрощаются или удаляются**, т.к. данные теперь общие.

### 2.3. Mobile (`Mobile/`) — НЕ ИЗМЕНЯЕТСЯ

- **Стек:** React Native (Expo).
- **БД:** отсутствует.
- **Роль:** «пульт» к Desktop по WebSocket. Управляет черновиками протоколов. Синхронизация состояния через `mobile-host.ts`.

### 2.4. update-server (`update-server/`)

- Сервер обновлений Electron-приложений. **Не относится к БД, не меняется.**

---

## 3. Этап 1 — Создание API-сервера с Prisma (`Server/`)

### 3.1. Задачи

1. Создать папку `Server/` и инициализировать проект:
   - Node.js + TypeScript;
   - Express (или Fastify) + CORS;
   - Prisma Client;
   - Docker + Docker Compose для PostgreSQL;
   - `.env.example` с `DATABASE_URL`.
2. Написать `schema.prisma` — объединённую схему Desktop + Registry (см. 3.3).
3. Создать Prisma-миграцию (`prisma migrate dev`) и поднять PostgreSQL через Docker.
4. Реализовать REST API по модулям (см. 3.4).
5. Реализовать поиск, совместимый с текущим поведением (кириллица, «ё→е»).
6. Написать скрипт миграции данных из локальных `ultrasound.db` (см. 3.6).

### 3.2. Структура проекта

```
Server/
├── prisma/
│   ├── schema.prisma          # объединённая схема Desktop + Registry
│   └── migrations/            # сгенерированные миграции
├── src/
│   ├── index.ts               # точка входа, запуск Express
│   ├── config.ts              # конфигурация (порт, секреты, URL БД)
│   ├── lib/
│   │   └── prisma.ts          # singleton PrismaClient
│   ├── middleware/
│   │   ├── auth.ts            # проверка JWT
│   │   └── error.ts           # обработка ошибок
│   ├── routes/
│   │   ├── auth.ts            # /api/auth/*
│   │   ├── patients.ts        # /api/patients/*
│   │   ├── researches.ts      # /api/researches/*
│   │   ├── journal.ts         # /api/journal/*
│   │   ├── protocol.ts        # /api/protocol/*
│   │   ├── statistics.ts      # /api/statistics
│   │   ├── medison.ts         # /api/medison-mappings/*
│   │   ├── appointments.ts    # /api/appointments/* (Registry)
│   │   └── doctors.ts         # /api/doctors/* (Registry)
│   └── utils/
│       └── search.ts          # нормализация «ё→е», экранирование LIKE
├── scripts/
│   └── migrate-local-dbs.ts   # перенос данных из ultrasound.db
├── docker-compose.yml         # PostgreSQL
├── .env.example
├── package.json
└── tsconfig.json
```

### 3.3. Объединённая схема `schema.prisma`

Наследуем структуру из `Desktop/electron/database/schema.ts` и `Registry/src/db.ts`.

```prisma
// ===== Пользователи (Desktop) =====
model User {
  id           String   @id @default(uuid())
  username     String   @unique
  password     String
  name         String
  organization String?
  createdAt    DateTime @default(now()) @map("created_at")
  lastLogin    DateTime? @map("last_login")

  medisonMappings MedisonMapping[]

  @@map("users")
}

// ===== Пациенты (общие для Desktop и Registry) =====
model Patient {
  id          String   @id @default(uuid())
  lastName    String   @map("last_name")
  firstName   String   @map("first_name")
  middleName  String?  @map("middle_name")
  dateOfBirth String   @map("date_of_birth")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  researches   Research[]
  appointments Appointment[]

  @@index([lastName, firstName, middleName])
  @@index([dateOfBirth])
  @@map("patients")
}

// ===== Исследования (Desktop) =====
model Research {
  id           String   @id @default(uuid())
  patientId    String   @map("patient_id")
  researchDate String   @map("research_date")
  paymentType  PaymentType
  organization String?
  doctorName   String?  @map("doctor_name")
  notes        String?
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  patient Patient         @relation(fields: [patientId], references: [id], onDelete: Cascade)
  studies ResearchStudy[]

  @@index([patientId])
  @@index([researchDate])
  @@map("researches")
}

enum PaymentType {
  oms
  paid

  @@map("payment_type")
}

// ===== Исследования (протоколы) внутри исследования =====
model ResearchStudy {
  id         String   @id @default(uuid())
  researchId String   @map("research_id")
  studyType  String   @map("study_type")
  studyData  Json     @map("study_data")
  createdAt  DateTime @default(now()) @map("created_at")

  research Research @relation(fields: [researchId], references: [id], onDelete: Cascade)

  @@index([researchId])
  @@index([studyType])
  @@map("research_studies")
}

// ===== Переопределения блоков печати протокола =====
model PrintBlockOverride {
  researchId String   @map("research_id")
  blockId    String   @map("block_id")
  blockText  String   @map("block_text")
  updatedAt  DateTime @updatedAt @map("updated_at")

  research Research @relation(fields: [researchId], references: [id], onDelete: Cascade)

  @@id([researchId, blockId])
  @@map("print_block_overrides")
}

// ===== Маппинги Medison =====
model MedisonMapping {
  id              String   @id @default(uuid())
  userId          String   @map("user_id")
  measurementId   String   @map("measurement_id")
  targetStudyType String   @map("target_study_type")
  targetField     String   @map("target_field")
  transform       String   @default("number->string")
  isEnabled       Boolean  @default(true) @map("is_enabled")
  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@map("medison_mappings")
}

// ===== Записи регистратуры (Registry) =====
model Appointment {
  id              String   @id @default(uuid())
  patientId       String   @map("patient_id")
  appointmentDate String   @map("appointment_date")
  studies         Json
  department      String?
  createdAt       DateTime @default(now()) @map("created_at")

  patient Patient @relation(fields: [patientId], references: [id], onDelete: Cascade)

  @@index([appointmentDate])
  @@map("appointments")
}

// ===== Врачи регистратуры (Registry) =====
model Doctor {
  id                String   @id @default(uuid())
  name              String
  maxPatientsPerDay Int      @default(15) @map("max_patients_per_day")
  workDays          Json     @map("work_days") // массив [1,2,3,4,5]

  @@map("doctors")
}
```

**Примечания к схеме:**

- **Пациенты общие.** У Desktop и Registry была своя таблица `patients` — теперь это одна общая таблица. Desktop переносит своих пациентов, Registry создаёт новых в той же таблице. Это ключевое преимущество единой БД: регистратура и кабинет видят одних и тех же пациентов.
- `research_studies.study_data` и `appointments.studies` хранят JSON. В Prisma используем тип `Json` (колонка `jsonb`) — парсинг на клиенте не нужен, приходит объект.
- Таблица `registry_appointments` (кэш в Desktop) **удаляется** — данные регистратуры теперь в общей БД, Desktop читает `appointments` напрямую.
- `PaymentType` — enum в Prisma (PostgreSQL enum).
- Даты (`date_of_birth`, `research_date`, `appointment_date`) в формате `String` — для совместимости с текущим поведением и поиском по строкам.

### 3.4. REST API (основные эндпоинты)

| Модуль | Метод и путь | Назначение | Заменяет (текущее) |
|---|---|---|---|
| Auth | `POST /api/auth/register` | Регистрация | `db.users.registerUser` |
| Auth | `POST /api/auth/login` | Вход, выдача JWT | `db.users.loginUser` |
| Auth | `GET /api/auth/me` | Текущий пользователь | `db.users.getUserById` |
| Auth | `PATCH /api/auth/profile` | Обновление профиля | `db.users.updateUser` |
| Auth | `PATCH /api/auth/password` | Смена пароля | `db.users.changePassword` |
| Patients | `GET/POST /api/patients` | Список/создание | `getAllPatients`, `createPatient` |
| Patients | `GET/PUT/DELETE /api/patients/:id` | Один пациент | `findPatientById`, `updatePatient`, `deletePatient` |
| Patients | `GET /api/patients/search?q=` | Поиск | `searchPatients` |
| Patients | `POST /api/patients/find-or-create` | Найти или создать | `findOrCreatePatient` |
| Researches | `GET/POST /api/researches` | Список/создание | `getAllResearches`, `createResearch` |
| Researches | `GET/PUT/DELETE /api/researches/:id` | Один | `getResearchById`, `updateResearch`, `deleteResearch` |
| Researches | `GET /api/researches?patientId=` | По пациенту | `getResearchesByPatientId` |
| Researches | `GET /api/researches/search?q=` | Сложный поиск (ё↔е) | `searchResearches` |
| Researches | `POST /api/researches/:id/studies` | Добавить исследование | `addStudyToResearch` |
| Journal | `GET /api/journal?date=` | Журнал за день | `getJournalByDate` |
| Journal | `GET /api/journal?from=&to=` | Журнал за период | `getJournalByPeriod` |
| Journal | `GET /api/journal/doctors` | Список врачей | `getDoctorNames` |
| Protocol | `GET /api/researches/:id/protocol` | Протокол по исследованию | `protocol.getByResearchId` |
| Protocol | `PUT /api/researches/:id/protocol/overrides` | Сохранение шаблонов | `protocol.savePrintOverrides` |
| Statistics | `GET /api/statistics?from=&to=&doctor=` | Статистика | `statistics.getStatistics` |
| Medison | `GET/POST/DELETE /api/medison-mappings` | CRUD маппингов | `medisonMappings.*` |
| Medison | `POST /api/medison-mappings/reset` | Сброс дефолтов | `resetDefaults` |
| Appointments | `GET/POST /api/appointments` | Записи регистратуры | Registry `db.ts` |
| Appointments | `GET /api/appointments?date=` | Записи на дату | `getAppointmentsByDate` |
| Appointments | `GET /api/appointments?month=&year=` | Записи за месяц | `getAppointmentsByMonth` |
| Appointments | `PUT/DELETE /api/appointments/:id` | Изменение/удаление | `updateAppointment`, `deleteAppointment` |
| Doctors | `GET/POST /api/doctors` | Врачи | `getDoctors`, `createDoctor` |
| Doctors | `PUT/DELETE /api/doctors/:id` | Изменение/удаление | `updateDoctor`, `deleteDoctor` |

### 3.5. Важные детали реализации сервера

1. **Авторизация (JWT):**
   - Секрет — в `.env` (`JWT_SECRET`).
   - На `/api/auth/register` и `/api/auth/password` — `bcryptjs` (совместимо с существующими хэшами).
   - Middleware `auth.ts` проверяет `Authorization: Bearer <token>` для всех маршрутов, кроме `/api/auth/login` и `/api/auth/register`.

2. **Поиск с кириллицей и «ё→е»** (перенос из `researchRepository.searchResearches`):
   - На сервере — нормализация запроса: `ё → е`, удаление пробелов/не-букв для кодового поиска `кдю12101990`.
   - В PostgreSQL — `ILIKE` + экранирование `%` `_` `\`.
   - Альтернатива (проще и быстрее): функция нормализации в SQL:
     ```sql
     CREATE FUNCTION normalize_text(IN text) RETURNS text AS $$
       SELECT lower(replace(translate($1, 'ёЁ', 'еЕ'), ' ', ''));
     $$ LANGUAGE SQL IMMUTABLE;
     ```
   - Или: хранить дополнительную колонку `search_text` (нормализованное ФИО + ДР) с индексом — самый быстрый вариант.

3. **Статистика (`statisticsRepository`):**
   - SQLite-функция `strftime('%Y-%m', research_date)` → PostgreSQL: `to_char(research_date, 'YYYY-MM')`.
   - `DATE(...)` → каст `::date`.
   - Остальные запросы (COUNT, GROUP BY, JOIN) переносятся почти 1-в-1.

4. **Транзакции:**
   - `protocol.savePrintOverrides` (DELETE + INSERT) → `prisma.$transaction`.
   - Registry `createAppointment` (найти/создать пациента + вставить запись) → `prisma.$transaction`.

5. **CORS:** разрешить все источники (`*`) — приложения в локальной сети.

### 3.6. Скрипт миграции данных `migrate-local-dbs.ts`

Переносит данные из старых `ultrasound.db` (Desktop) в PostgreSQL. Запускается **один раз** на сервере.

> **Данные Registry (`registry.db`) не переносятся** — новая база для регистратуры стартует пустой.

**Алгоритм:**
1. Открыть каждый `.db` через `better-sqlite3` (читать только).
2. Пройти таблицы в порядке зависимостей:
   - `users` → сохранить маппинг `oldId → newUuid`;
   - `patients` → объединить из всех баз, устранить дубликаты (по ФИО+ДР), маппинг id;
   - `researches` → маппинг patient_id;
   - `research_studies` → маппинг research_id;
   - `print_block_overrides` → маппинг research_id;
   - `medison_mappings` → маппинг user_id;
   - `registry_appointments` → **пропускаем** (таблица удаляется из новой архитектуры).
3. **Конфликты ID:** при объединении нескольких `ultrasound.db` от разных машин возможны дубликаты пациентов. Решение:
   - сначала по «эталонной» базе (например, база главного кабинета);
   - затем добавлять пациентов из остальных баз, пропуская совпадения по (ФИО, ДР) с эталоном;
   - отчёт о пропущенных дублях — в консоль/файл.
4. Пароли пользователей переносятся как есть (`bcrypt`-хэши).
5. По завершении — вывод сводки (сколько записей перенесено по каждой таблице).

---

## 4. Этап 2 — Перевод Desktop на сервер

### 4.1. Задачи

1. Удалить/обойти 8 репозиториев `better-sqlite3`.
2. Создать HTTP-клиент `Desktop/src/services/apiClient.ts` (или аналогичный) поверх `fetch`.
3. Переписать `ipc-handlers.ts` и `medisonMappingIpc.ts`: вместо `db.repo.method()` — вызовы к API-серверу.
4. Перевести React-слой на асинхронные вызовы.
5. Добавить офлайн-кэш.
6. Перенести данные из локального `ultrasound.db` (выполняется скриптом на сервере, но нужна страница «первичная настройка сервера» в Desktop: URL сервера + логин/пароль).
7. Обновить тесты.

### 4.2. Ключевое изменение: синхронность → асинхронность

Сейчас `better-sqlite3` — синхронный, поэтому в `ipc-handlers.ts` и в React-компонентах вызовы выглядят синхронными:

```ts
// БЫЛО (пример)
const user = db.users.getUserById(userId);
```

```ts
// СТАНЕТ
const user = await apiClient.getUserById(userId);
```

**Где менять (обязательные зоны):**
- `Desktop/electron/preload.ts` — типы и методы `window.api.*` (скорее всего уже async-promise, т.к. IPC через `ipcRenderer.invoke`);
- `Desktop/electron/ipc-handlers.ts` — все `ipcMain.handle`;
- `Desktop/electron/ipc/medisonMappingIpc.ts`;
- React-компоненты, которые вызывают `window.api.*` — проверить каждое место через `search_files` по `window.api`.

**Важно:** IPC-интерфейс `window.api.*` можно **сохранить без изменений для React** — достаточно, чтобы обработчики внутри `ipcMain.handle` были асинхронными (они уже async обёртки). Тогда фронтенд почти не трогаем, кроме мест, где он сам ждёт результат.

### 4.3. Офлайн-кэш (критично для мед. софта)

Схема «кеш + очередь»:

1. **Локальное хранилище** — `better-sqlite3` или `indexedDB` во renderer-процессе:
   - кэш последних данных (пациенты, журнал, статистика);
   - очередь операций (`pending_operations`): `{ id, endpoint, method, payload, createdAt }`.
2. **При операции (запись):**
   - если сервер доступен — выполнить сразу;
   - если нет — положить в очередь и показать «данные будут синхронизированы».
3. **При восстановлении соединения** — background-процесс отправляет очередь на сервер (в порядке `createdAt`), при конфликтах — берёт последнюю версию по `updated_at`.
4. **При чтении:**
   - если сервер доступен — запросить, обновить кэш;
   - если нет — вернуть из кэша.

> **Простейший вариант на первых порах (MVP):** без полноценной очереди — только кэш чтения + явный индикатор «нет связи с сервером». Запись разрешать только онлайн. Это снимает сложность конфликтов. Полная очередь — следующим шагом.

### 4.4. Что удалить/упростить в Desktop

| Файл | Действие |
|---|---|
| `electron/database/database.ts` | Удалить (или оставить тонкую прослойку = apiClient) |
| `electron/database/schema.ts` | Удалить (схема теперь в `Server/prisma/schema.prisma`) |
| `electron/database/initDatabase.ts` | Удалить (миграции — в Prisma) |
| `electron/database/*Repository.ts` (8 шт.) | Удалить (переписать логику в apiClient/routes) |
| `electron/database/__tests__/` | Переписать как тесты мок-клиента |
| `better-sqlite3` в `package.json` | Удалить зависимость (после завершения) |
| `registry_appointments` (кэш) | Удалить — данные регистратуры теперь в общей БД, читаем `appointments` напрямую |
| `network:sendExport` → `/receive-export` | Упростить/удалить: Desktop и Registry видят одни данные |

---

## 5. Этап 3 — Перевод Registry на сервер

### 5.1. Задачи

1. Создать HTTP-клиент в `Registry/src/services/apiClient.ts`.
2. Переписать `Registry/src/db.ts` (sql.js) на асинхронные вызовы API.
3. Заменить все вызовы `db.ts` в React-компонентах (App, hooks, components) на apiClient.
4. Миграцию данных из `registry.db` **не выполняем** — регистратура стартует с пустой базой.
5. Обновить тесты.

### 5.2. Заменяемые функции `db.ts` → API

| Функция `db.ts` | Эндпоинт |
|---|---|
| `getAppointmentsByMonth` | `GET /api/appointments?month=&year=` |
| `getAppointmentsByDate` | `GET /api/appointments?date=` |
| `createAppointment` | `POST /api/appointments` |
| `updateAppointment` | `PUT /api/appointments/:id` |
| `deleteAppointment` | `DELETE /api/appointments/:id` |
| `getDoctors` | `GET /api/doctors` |
| `createDoctor` | `POST /api/doctors` |
| `updateDoctor` | `PUT /api/doctors/:id` |
| `deleteDoctor` | `DELETE /api/doctors/:id` |

### 5.3. Упрощение

- Удалить `sql.js` из `Registry/package.json`.
- Удалить собственный HTTP-сервер Registry (приём экспорта от Desktop) — данные теперь общие.
- Механизм `network:sendExport` в Desktop становится необязательным — решить: оставить как «печать/архив» или удалить.

---

## 6. Этап 4 — Mobile

**Изменений нет.**

- Mobile остаётся «пультом» к Desktop по WebSocket (`mobile-host.ts`).
- Данные Mobile получает от Desktop, который теперь синхронизирован с сервером.
- Работы: 0 часов (за исключением возможных мелких правок при отладке).

---

## 7. Этап 5 — Развёртывание и тестирование

### 7.1. Docker Compose

`Server/docker-compose.yml`:

```yaml
services:
  postgres:
    image: postgres:16-alpine
    container_name: ultrasound-postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: ultrasound
      POSTGRES_PASSWORD: <пароль>
      POSTGRES_DB: ultrasound
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ultrasound"]
      interval: 10s
      timeout: 5s
      retries: 5

  api:
    build: .
    container_name: ultrasound-api
    restart: unless-stopped
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      DATABASE_URL: postgresql://ultrasound:<пароль>@postgres:5432/ultrasound
      JWT_SECRET: <секрет>
      PORT: 4000
    ports:
      - "4000:4000"

volumes:
  pgdata:
```

### 7.2. Тестирование

| Уровень | Что проверяем |
|---|---|
| **Unit (сервер)** | Роуты auth/patients/researches/statistics/appointments/doctors — через супертест + тестовый PostgreSQL |
| **Unit (клиенты)** | Мок API-клиента, проверка, что React вызывает правильные эндпоинты |
| **Интеграция (сервер+БД)** | Прогон всех операций Desktop и Registry против реального PostgreSQL |
| **E2E** | Связка: Registry создаёт пациента/запись → Desktop видит его → заполняет протокол → сохраняет → статистика обновилась |
| **Офлайн** | Отключить сервер → Desktop показывает кэш и «нет связи» → включить → синхронизация работает |
| **Миграция** | Прогон скрипта на копии реальных `ultrasound.db`, сверка количества записей |

### 7.3. Порядок развёртывания

1. Установить Docker на серверную машину (Windows Server / Linux).
2. Скопировать `Server/`, заполнить `.env`.
3. `docker compose up -d` → поднимется PostgreSQL + API.
4. Выполнить миграцию данных Desktop: `npx tsx scripts/migrate-local-dbs.ts --from <пути к ultrasound.db> --to postgresql://...`.
5. Проверить API: `GET /api/health`.
6. Обновить Desktop (новая сборка Electron) на кабинетах, ввести адрес сервера.
7. Обновить Registry (стартует с пустой БД).
8. Mobile — переподключение к Desktop, проверка синхронизации.

---

## 8. Риски и решения

| Риск | Влияние | Решение |
|---|---|---|
| **Конфликты ID при слиянии баз Desktop** | Пациенты/исследования «склеятся» неправильно | UUID; маппинг oldId→newUuid; дедупликация по (ФИО, ДР) с эталоном |
| **Офлайн-режим** | Остановка работы кабинета при обрыве сети | Локальный кэш чтения + очередь операций; индикатор «нет связи»; MVP — только чтение офлайн |
| **Асинхронный рефакторинг** | Массовые правки в React/Electron | Держать интерфейс `window.api.*` без изменений; менять реализацию внутри `ipcMain.handle` |
| **Сложный поиск (ё→е, кодовый «кдю…»)** | Поиск перестанет находить записи | Перенос логики нормализации на сервер; колонка `search_text` с индексом |
| **Различия SQL: `strftime`, `DATE`, LIKE`** | Ошибки запросов статистики/журнала | Замена на Postgres-эквиваленты: `to_char`, `::date`, `ILIKE`; тесты на реальную БД |
| **Prisma engine в Electron** | Проблемы сборки | **Prisma живёт на сервере**, а не в Electron → проблема снимается полностью |
| **Скорость по сети** | Задержки на каждый запрос | Пагинация, индексация, минимум N+1 (include relations), кэширование на клиенте |
| **Несколько кабинетов меняют одного пациента** | Гонки при записи | `updated_at` + «последний пишет первым»; для MVP достаточно; дальше — консистентность через версии |
| **Регистратура стартует с пустой БД** | Потеря старых записей приёма | Осознанное решение пользователя; при необходимости — отдельный скрипт импорта `registry.db` позже |

---

## 9. Оценка сроков

| Этап | Задачи | Оценка |
|---|---|---|
| **Этап 1. Сервер** | Prisma-схема, миграции, REST API (auth, patients, researches, journal, protocol, statistics, medison, appointments, doctors), Docker, скрипт миграции данных Desktop | **5–7 дней** |
| **Этап 2. Desktop** | apiClient, перепись IPC, асинхронность, офлайн-кэш, удаление репозиториев, тесты | **10–14 дней** |
| **Этап 3. Registry** | apiClient, перепись `db.ts`, удаление sql.js, тесты | **4–6 дней** |
| **Этап 4. Mobile** | Без изменений | **0 дней** |
| **Этап 5. Развёртывание** | Docker, миграция данных Desktop, E2E-проверки, обновление клиентов | **3–5 дней** |
| **Непредвиденное** | Буфер на отладку, гонки, ошибки интеграции | **3–5 дней** |
| **ИТОГО** | | **≈ 4 недели** |

---

## 10. Порядок работ (чек-лист)

- [x] **Этап 1.1** — Создать `Server/`: package.json, tsconfig, Express, Prisma.
- [x] **Этап 1.2** — Написать `schema.prisma` и прогонить `prisma migrate dev`.
- [x] **Этап 1.3** — Поднять PostgreSQL через Docker Compose.
- [x] **Этап 1.4** — Реализовать модуль Auth (JWT).
- [x] **Этап 1.5** — Реализовать Patients + Researches + Journal + Protocol.
- [x] **Этап 1.6** — Реализовать Statistics (перевод `strftime` → `to_char`).
- [x] **Этап 1.7** — Реализовать Medison-mappings.
- [x] **Этап 1.8** — Реализовать Appointments + Doctors (Registry).
- [x] **Этап 1.9** — Написать `scripts/migrate-local-dbs.ts` (только `ultrasound.db`).
- [x] **Этап 1.10** — Написать интеграционные тесты API.
- [x] **Этап 2.1** — Создать apiClient в Desktop.
- [x] **Этап 2.2** — Переписать `ipc-handlers.ts` и `medisonMappingIpc.ts` на API.
- [x] **Этап 2.3** — Добавить офлайн-кэш и очередь операций.
- [x] **Этап 2.4** — Удалить репозитории `better-sqlite3` и старый слой БД.
- [x] **Этап 2.5** — Настройка адреса сервера в Desktop, экран входа.
- [x] **Этап 2.6** — Удалить кэш `registry_appointments` (чтение `appointments` напрямую).
- [x] **Этап 2.7** — Переписать тесты Desktop.
- [x] **Этап 3.1** — Создать apiClient в Registry.
- [x] **Этап 3.2** — Переписать `db.ts` (sql.js) на API.
- [ ] **Этап 3.3** — Обновить компоненты React Registry.
- [ ] **Этап 3.4** — Удалить sql.js и собственный HTTP-сервер Registry.
- [ ] **Этап 3.5** — Переписать тесты Registry.
- [ ] **Этап 5.1** — Сборка и запуск на сервере (Docker Compose).
- [ ] **Этап 5.2** — Миграция данных Desktop.
- [ ] **Этап 5.3** — E2E-тестирование всей связки (Registry → Desktop → Mobile → статистика).
- [ ] **Этап 5.4** — Проверка офлайн-режима.
- [ ] **Этап 5.5** — Обновление всех клиентов (Desktop, Registry).

---

## 11. Что НЕ входит в этот план

- Полноценный офлайн-режим с разрешением конфликтов (версионирование записей) — только MVP-кэш;
- HTTPS/шифрование трафика (локальная сеть);
- Многопользовательские роли/права (админ/врач/администратор) — только единая авторизация;
- Резервное копирование PostgreSQL (рекомендуется настроить отдельно: `pg_dump` по расписанию);
- Перевод Mobile на прямое подключение к серверу;
- Перенос данных Registry (`registry.db`) — по решению пользователя БД стартует пустой.

---

## 12. Рекомендуемые зависимости (сервер)

```
Server/package.json (devDependencies + dependencies):
  express (или fastify)
  @prisma/client
  prisma (dev)
  bcryptjs
  jsonwebtoken
  cors
  zod (валидация входящих данных)
  better-sqlite3 (dev, только для скрипта миграции)
  tsx (dev) — запуск миграции и скриптов
  typescript, @types/express, @types/jsonwebtoken, @types/cors
```

> **Примечание:** `better-sqlite3` в `Server/` нужен ТОЛЬКО для чтения старых `ultrasound.db` в скрипте миграции. После завершения миграции — удалить.