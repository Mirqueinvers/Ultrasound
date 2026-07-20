import type Database from "better-sqlite3";
import {
  CREATE_USERS_TABLE,
  CREATE_USERNAME_INDEX,
  CREATE_PATIENTS_TABLE,
  CREATE_PATIENTS_INDEXES,
  CREATE_RESEARCHES_TABLE,
  CREATE_RESEARCH_STUDIES_TABLE,
  CREATE_PRINT_BLOCK_OVERRIDES_TABLE,
  CREATE_RESEARCHES_INDEXES,
  CREATE_MEDISON_MAPPINGS_TABLE,
  CREATE_MEDISON_MAPPINGS_INDEX,
} from "./schema";

export const initializeDatabase = (db: Database.Database): void => {
  db.exec(CREATE_USERS_TABLE);
  db.exec(CREATE_USERNAME_INDEX);
  db.exec(CREATE_PATIENTS_TABLE);
  db.exec(CREATE_PATIENTS_INDEXES);
  db.exec(CREATE_RESEARCHES_TABLE);
  db.exec(CREATE_RESEARCH_STUDIES_TABLE);
  db.exec(CREATE_PRINT_BLOCK_OVERRIDES_TABLE);
  db.exec(CREATE_RESEARCHES_INDEXES);
  db.exec(CREATE_MEDISON_MAPPINGS_TABLE);
  db.exec(CREATE_MEDISON_MAPPINGS_INDEX);
};

export const runMigrations = (db: Database.Database): void => {
  const usersTableInfo = db.pragma("table_info(users)") as Array<{ name: string }>;
  const usersHasOrganization = usersTableInfo.some((col) => col.name === "organization");
  if (!usersHasOrganization) {
    console.log("Добавляю поле organization в таблицу users...");
    db.exec("ALTER TABLE users ADD COLUMN organization TEXT");
    console.log("Поле organization добавлено в таблицу users");
  }

  const researchesTableInfo = db.pragma("table_info(researches)") as Array<{ name: string }>;
  const researchesHasOrganization = researchesTableInfo.some((col) => col.name === "organization");
  if (!researchesHasOrganization) {
    console.log("Добавляю поле organization в таблицу researches...");
    db.exec("ALTER TABLE researches ADD COLUMN organization TEXT");
    console.log("Поле organization добавлено в таблицу researches");
  }

  db.exec(CREATE_PRINT_BLOCK_OVERRIDES_TABLE);
};
