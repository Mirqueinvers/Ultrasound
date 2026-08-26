# Ultrasound API Server

Центральный API-сервер для Desktop и Registry (PostgreSQL + Prisma + Express).

## Быстрый старт (Docker Compose)

Требуется Docker с Docker Compose (для разработки — Docker Desktop).

```bash
# 1. Скопировать конфигурацию
cp .env.example .env

# 2. Задать обязательный JWT_SECRET (случайная строка) в .env

# 3. Собрать и запустить стек (PostgreSQL + API)
docker compose up -d --build

# 4. Проверить работу
curl http://localhost:4000/api/health   # -> {"status":"ok"}
```

Что происходит при старте:

- `postgres` — PostgreSQL 16 (volume `pgdata` хранит данные между перезапусками);
- `api` — собирается из `Dockerfile` и при каждом запуске выполняет
  `prisma migrate deploy`, затем запускает API на порту `4000`.

Переменные окружения (`Server/.env`, читается Docker Compose автоматически):

| Переменная | Назначение | По умолчанию |
|---|---|---|
| `POSTGRES_USER` | Пользователь PostgreSQL | `ultrasound` |
| `POSTGRES_PASSWORD` | Пароль PostgreSQL | `ultrasound_password` |
| `POSTGRES_DB` | Имя базы | `ultrasound` |
| `POSTGRES_PORT` | Порт PostgreSQL наружу | `5432` |
| `API_PORT` | Порт API наружу | `4000` |
| `JWT_SECRET` | Секрет JWT (обязателен!) | — |
| `DEPLOY_TOKEN` | Токен веб-деплоя (`POST /api/deploy`, заголовок `x-deploy-token`) | — |
| `DATABASE_URL` | Адрес БД для локального запуска API вне Docker | — |

## Развёртывание на Windows без Docker

Если на сервере нет Docker — используйте готовый пакет в папке `deploy/`:

1. Установить **PostgreSQL 16** (служба Windows) и **Node.js 22 LTS**.
2. Скопировать `Server/` на серверный ПК (например, `C:\Ultrasound\Server`).
3. Запустить `deploy\install-server.bat` от администратора — он всё сделает сам
   (`.env`, БД, зависимости, миграции, сборка, служба Windows через NSSM, порт 4000).

Подробная пошаговая инструкция: **`deploy/INSTALL.md`**.

## Обновление по локальной сети (веб-деплой)

Сервер умеет обновлять себя сам через HTTP — не нужно ходить к нему с флешкой.

**Один раз (после первой установки через `install-server.bat`):**
1. Забрать из `Server/.env` на серверном ПК значение `DEPLOY_TOKEN`.
2. Скопировать на серверный ПК (старым способом) новые файлы `src/`, `prisma/`,
   `package.json`, `package-lock.json`, `tsconfig.json` и папку `deploy/`
   (там появились `deploy-runner.cmd` и `deploy-lan.bat`), затем запустить
   `deploy\update-server.bat` от администратора. После этого деплой доступен по сети.

**Дальше каждое обновление — одной командой с любого ПК в локальной сети:**
```bat
deploy\deploy-lan.bat <IP-сервера> <DEPLOY_TOKEN>
```
Или через браузер: открыть `http://<IP-сервера>:4000/deploy`, ввести токен,
выбрать `deploy-package.zip` и нажать «Развернуть».

Что делает сервер: останавливает службу `UltrasoundAPI`, делает резервную копию
в `Server/backups/`, распаковывает пакет, выполняет `npm ci` → миграции Prisma →
`npm run build`, запускает службу заново. При ошибке автоматически откатывает
предыдущую версию. Ход обновления виден в логе `Server/logs/deploy.log`.

> Пакет `deploy-package.zip` собирается скриптом автоматически из `src/`, `prisma/`,
> `package.json`, `package-lock.json`, `tsconfig.json`. В нём никогда нет `node_modules`,
> `.env` и других служебных файлов.

## Локальная разработка (вне Docker)

```bash
npm install
npx prisma generate
npx prisma migrate dev   # применить миграции к локальной БД
npm run dev              # tsx watch
npm run build && npm start
```

## Тесты

Интеграционные тесты (Vitest + Supertest) используют БД `ultrasound_test`:

```bash
docker exec ultrasound-postgres psql -U ultrasound -c "CREATE DATABASE ultrasound_test"
npm test
```

## Скрипт миграции данных Desktop

```bash
npx tsx prisma/migrate-local-dbs.ts --from <путь к ultrasound.db> --to <DATABASE_URL>
```

`better-sqlite3` нужен только для этого скрипта.

## Скрипт миграции данных Registry

```bash
npx tsx prisma/migrate-registry-db.ts --from <путь к registry.db> --to <DATABASE_URL>
```

Переносит пациентов, врачей и записи на приём из старой базы регистратуры.
Пациенты объединяются с уже загруженными в PostgreSQL (в т.ч. из `ultrasound.db`)
по (ФИО, дата рождения). Повторный запуск безопасен — дубли не создаются.

Готовый запуск на серверном ПК: положить `registry.db` в `C:\ultrasound\registry.db`
и выполнить от администратора `deploy\migrate-registry-data.bat`.
