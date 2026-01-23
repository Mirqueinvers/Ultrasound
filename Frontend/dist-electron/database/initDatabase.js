"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runMigrations = exports.initializeDatabase = void 0;
const schema_1 = require("./schema");
const initializeDatabase = (db) => {
    db.exec(schema_1.CREATE_USERS_TABLE);
    db.exec(schema_1.CREATE_USERNAME_INDEX);
    db.exec(schema_1.CREATE_PATIENTS_TABLE);
    db.exec(schema_1.CREATE_PATIENTS_INDEXES);
    db.exec(schema_1.CREATE_RESEARCHES_TABLE);
    db.exec(schema_1.CREATE_RESEARCH_STUDIES_TABLE);
    db.exec(schema_1.CREATE_RESEARCHES_INDEXES);
};
exports.initializeDatabase = initializeDatabase;
const runMigrations = (db) => {
    const tableInfo = db.pragma("table_info(users)");
    const hasOrganization = tableInfo.some((col) => col.name === "organization");
    if (!hasOrganization) {
        console.log("🔄 Добавляем колонку organization...");
        db.exec("ALTER TABLE users ADD COLUMN organization TEXT");
        console.log("✅ Колонка organization добавлена");
    }
};
exports.runMigrations = runMigrations;
