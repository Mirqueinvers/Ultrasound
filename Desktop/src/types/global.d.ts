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
  MedisonAPI,
  ImportMappingAPI,
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
    medisonAPI: MedisonAPI;
    importMappingAPI: ImportMappingAPI;
    databaseAPI: DatabaseAPI;
  }
}

export {};
