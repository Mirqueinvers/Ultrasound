import {
  createEmptyMobileSyncSnapshot,
  type MobileSyncSnapshot,
  type MobileSyncWireMessage,
} from "./mobileSync";

export interface StudyDraft {
  general: string;
  sections: Record<string, string>;
}

export function createEmptyStudyDraft(): StudyDraft {
  return {
    general: "",
    sections: {},
  };
}

export function applySyncMessage(
  snapshot: MobileSyncSnapshot,
  message: MobileSyncWireMessage,
): MobileSyncSnapshot {
  if (message.type === "sync:snapshot") {
    return message.state;
  }

  if (message.type !== "sync:update") {
    return snapshot;
  }

  if (message.fragment === "selection") {
    return {
      ...snapshot,
      selection: {
        ...snapshot.selection,
        ...message.data,
      },
    };
  }

  if (message.fragment === "header") {
    return {
      ...snapshot,
      header: {
        ...snapshot.header,
        ...message.data,
      },
    };
  }

  if (message.data.mode === "replace") {
    return {
      ...snapshot,
      studiesData: { ...message.data.studiesData },
    };
  }

  if (message.data.mode === "set") {
    return {
      ...snapshot,
      studiesData: {
        ...snapshot.studiesData,
        [message.data.studyType]: message.data.value,
      },
    };
  }

  const nextStudiesData = { ...snapshot.studiesData };
  delete nextStudiesData[message.data.studyType];

  return {
    ...snapshot,
    studiesData: nextStudiesData,
  };
}

export function createInitialMobileSnapshot(): MobileSyncSnapshot {
  return createEmptyMobileSyncSnapshot();
}
