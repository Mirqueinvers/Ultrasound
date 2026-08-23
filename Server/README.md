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
| `DATABASE_URL` | Адрес БД для локального запуска API вне Docker | — |

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
