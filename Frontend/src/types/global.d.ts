import type {
  AuthAPI,
  PatientAPI,
  ResearchAPI,
  JournalAPI,
  WindowAPI,
  DatabaseAPI,
  PatientSearchAPI,
  ProtocolAPI,
  FileAPI,
} from "../../electron/preload";

declare global {
  interface Window {
    authAPI: AuthAPI;
    patientAPI: PatientAPI;
    researchAPI: ResearchAPI;
    journalAPI: JournalAPI;
    windowAPI: WindowAPI;
    protocolAPI: ProtocolAPI;
    fileAPI: FileAPI;
    patientSearchAPI: PatientSearchAPI;
    databaseAPI: DatabaseAPI;
  }
}

export {};
