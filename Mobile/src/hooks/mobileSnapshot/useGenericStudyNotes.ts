import type { MobileStudiesDataMap } from "../../protocols/types";
import { createEmptyStudyDraft, type StudyDraft } from "../../shared/syncHelpers";

type SendStudiesPatch = (message: {
  mode: "set";
  studyType: string;
  value: unknown;
}) => void;

export function useGenericStudyNotes({
  studiesData,
  sendStudiesPatch,
}: {
  studiesData: MobileStudiesDataMap;
  sendStudiesPatch: SendStudiesPatch;
}) {
  const updateSectionNote = (
    protocolLabel: string,
    sectionDesktopKey: string,
    value: string,
  ) => {
    const currentDraft =
      (studiesData[protocolLabel] as StudyDraft | undefined) ?? createEmptyStudyDraft();
    const nextDraft: StudyDraft = {
      general: currentDraft.general,
      sections: {
        ...currentDraft.sections,
        [sectionDesktopKey]: value,
      },
    };

    sendStudiesPatch({
      mode: "set",
      studyType: protocolLabel,
      value: nextDraft,
    });
  };

  const updateGeneralNote = (protocolLabel: string, value: string) => {
    const currentDraft =
      (studiesData[protocolLabel] as StudyDraft | undefined) ?? createEmptyStudyDraft();
    const nextDraft: StudyDraft = {
      general: value,
      sections: {
        ...currentDraft.sections,
      },
    };

    sendStudiesPatch({
      mode: "set",
      studyType: protocolLabel,
      value: nextDraft,
    });
  };

  return {
    updateGeneralNote,
    updateSectionNote,
  };
}
