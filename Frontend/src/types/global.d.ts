import type {
  AuthAPI,
  PatientAPI,
  ResearchAPI,
  JournalAPI,
  WindowAPI,
  DatabaseAPI,
  PatientSearchAPI,
  ProtocolAPI,
} from "../../electron/preload";

declare global {
  interface Window {
    authAPI: AuthAPI;
    patientAPI: PatientAPI;
    researchAPI: ResearchAPI;
    journalAPI: JournalAPI;
    windowAPI: WindowAPI;
    protocolAPI: ProtocolAPI;
    patientSearchAPI: PatientSearchAPI;
    databaseAPI: DatabaseAPI;
  }
}

export {};
