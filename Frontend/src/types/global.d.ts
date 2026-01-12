import type {
  AuthAPI,
  PatientAPI,
  ResearchAPI,
  JournalAPI,
  WindowAPI,
} from "../path/к/preload"; // путь подправь под себя или продублируй интерфейсы

declare global {
  interface Window {
    authAPI: AuthAPI;
    patientAPI: PatientAPI;
    researchAPI: ResearchAPI;
    journalAPI: JournalAPI;
    windowAPI: WindowAPI;
  }
}

export {};
