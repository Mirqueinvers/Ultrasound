export type MobileSyncOrigin = "desktop" | "mobile";

export interface SelectionSyncState {
  activeSection: string;
  selectedStudy: string;
  selectedStudies: string[];
  isMultiSelectMode: boolean;
  selectedDirectoryItem: string;
}

export interface HeaderSyncState {
  patientFullName: string;
  patientDateOfBirth: string;
  researchDate: string;
  organization: string;
}

export interface DraftSessionSyncState {
  sessionId: string | null;
  activeStudyLabel: string;
  isDraftActive: boolean;
  startedAt: string | null;
  updatedAt: string | null;
}

export interface MobileSyncSnapshot {
  session: DraftSessionSyncState;
  selection: SelectionSyncState;
  header: HeaderSyncState;
  studiesData: Record<string, unknown>;
}

export type MobileSyncCommand =
  | {
      type: "sync:command";
      command: "draft:create";
      studyLabel?: string;
      origin: MobileSyncOrigin;
      updatedAt: string;
    }
  | {
      type: "sync:command";
      command: "draft:save";
      origin: MobileSyncOrigin;
      updatedAt: string;
    }
  | {
      type: "sync:command";
      command: "draft:saved";
      origin: MobileSyncOrigin;
      updatedAt: string;
    }
  | {
      type: "sync:command";
      command: "draft:print";
      origin: MobileSyncOrigin;
      updatedAt: string;
    }
  | {
      type: "sync:command";
      command: "draft:clear";
      origin: MobileSyncOrigin;
      updatedAt: string;
    }
  | {
      type: "sync:command";
      command: "draft:close";
      origin: MobileSyncOrigin;
      updatedAt: string;
    };

export type MobileSyncFragment =
  | {
      type: "sync:update";
      fragment: "selection";
      data: Partial<SelectionSyncState>;
      origin: MobileSyncOrigin;
      updatedAt: string;
    }
  | {
      type: "sync:update";
      fragment: "header";
      data: Partial<HeaderSyncState>;
      origin: MobileSyncOrigin;
      updatedAt: string;
    }
  | {
      type: "sync:update";
      fragment: "studiesData";
      data:
        | {
            mode: "replace";
            studiesData: Record<string, unknown>;
          }
        | {
            mode: "set";
            studyType: string;
            value: unknown;
          }
        | {
            mode: "remove";
            studyType: string;
          };
      origin: MobileSyncOrigin;
      updatedAt: string;
    };

export type MobileSyncWireMessage =
  | MobileSyncCommand
  | MobileSyncFragment
  | {
      type: "sync:snapshot";
      state: MobileSyncSnapshot;
      origin: MobileSyncOrigin;
      updatedAt: string;
    }
  | {
      type: "sync:requestState";
      origin: MobileSyncOrigin;
      updatedAt: string;
    };

export const createEmptySelectionSyncState = (): SelectionSyncState => ({
  activeSection: "uzi-protocols",
  selectedStudy: "",
  selectedStudies: [],
  isMultiSelectMode: false,
  selectedDirectoryItem: "",
});

export const createEmptyHeaderSyncState = (): HeaderSyncState => ({
  patientFullName: "",
  patientDateOfBirth: "",
  researchDate: getCurrentDate(),
  organization: "",
});

export const createEmptyDraftSessionSyncState = (): DraftSessionSyncState => ({
  sessionId: null,
  activeStudyLabel: "",
  isDraftActive: false,
  startedAt: null,
  updatedAt: null,
});

export const createEmptyMobileSyncSnapshot = (): MobileSyncSnapshot => ({
  session: createEmptyDraftSessionSyncState(),
  selection: createEmptySelectionSyncState(),
  header: createEmptyHeaderSyncState(),
  studiesData: {},
});

export const createSyncTimestamp = (): string => new Date().toISOString();

function getCurrentDate(): string {
  const now = new Date();
  const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 10);
}