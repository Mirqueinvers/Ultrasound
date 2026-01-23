// ultrasound/frontend/electron/database/database.ts
import Database from "better-sqlite3";
import { app } from "electron";
import * as path from "path";

import { initializeDatabase, runMigrations } from "./initDatabase";
import { UserRepository } from "./userRepository";
import { PatientRepository } from "./patientRepository";
import { ResearchRepository } from "./researchRepository";
import { JournalRepository } from "./journalRepository";
import { ProtocolRepository } from "./protocolRepository";
import type { Patient, Research } from "./schema";

export interface JournalEntry {
  patient: Patient;
  researches: Research[];
}

export class DatabaseManager {
  private db: Database.Database;
  private static instance: DatabaseManager;

  public users: UserRepository;
  public patients: PatientRepository;
  public researches: ResearchRepository;
  public journal: JournalRepository;
  public protocol: ProtocolRepository;

  private constructor() {
    const userDataPath = app.getPath("userData");
    const dbPath = path.join(userDataPath, "ultrasound.db");
    console.log("📁 Путь к БД:", dbPath);

    this.db = new Database(dbPath);
    initializeDatabase(this.db);
    runMigrations(this.db);
    console.log("✅ База данных инициализирована");

    this.users = new UserRepository(this.db);
    this.patients = new PatientRepository(this.db);
    this.researches = new ResearchRepository(this.db);
    this.journal = new JournalRepository(this.db);
    this.protocol = new ProtocolRepository(this.db);
  }

  public static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  public close(): void {
    this.db.close();
  }
}
