// Frontend/electron/database/initDatabase.ts
import type Database from "better-sqlite3";
import {
  CREATE_USERS_TABLE,
  CREATE_USERNAME_INDEX,
  CREATE_PATIENTS_TABLE,
  CREATE_PATIENTS_INDEXES,
  CREATE_RESEARCHES_TABLE,
  CREATE_RESEARCH_STUDIES_TABLE,
  CREATE_RESEARCHES_INDEXES,
} from "./schema";


export const initializeDatabase = (db: Database.Database): void => {
  db.exec(CREATE_USERS_TABLE);
  db.exec(CREATE_USERNAME_INDEX);
  db.exec(CREATE_PATIENTS_TABLE);
  db.exec(CREATE_PATIENTS_INDEXES);
  db.exec(CREATE_RESEARCHES_TABLE);
  db.exec(CREATE_RESEARCH_STUDIES_TABLE);
  db.exec(CREATE_RESEARCHES_INDEXES);
};


export const runMigrations = (db: Database.Database): void => {
  // Миграция для таблицы users
  const usersTableInfo = db.pragma("table_info(users)") as Array<{ name: string }>;
  const usersHasOrganization = usersTableInfo.some((col) => col.name === "organization");
  if (!usersHasOrganization) {
    console.log("🔄 Добавляем колонку organization в таблицу users...");
    db.exec("ALTER TABLE users ADD COLUMN organization TEXT");
    console.log("✅ Колонка organization добавлена в таблицу users");
  }

  // Миграция для таблицы researches
  const researchesTableInfo = db.pragma("table_info(researches)") as Array<{ name: string }>;
  const researchesHasOrganization = researchesTableInfo.some((col) => col.name === "organization");
  if (!researchesHasOrganization) {
    console.log("🔄 Добавляем колонку organization в таблицу researches...");
    db.exec("ALTER TABLE researches ADD COLUMN organization TEXT");
    console.log("✅ Колонка organization добавлена в таблицу researches");
  }
};
