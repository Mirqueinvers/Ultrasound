import React from "react";

import type { DesktopStudiesDataMap } from "@/researches/types";
import type { MobileSyncWireMessage } from "@/sync/mobileSync";

interface UseResearchMobileSyncParams {
  setPatientFullNameState: React.Dispatch<React.SetStateAction<string>>;
  setPatientDateOfBirthState: React.Dispatch<React.SetStateAction<string>>;
  setResearchDateState: React.Dispatch<React.SetStateAction<string>>;
  setOrganizationState: React.Dispatch<React.SetStateAction<string>>;
  setStudiesDataState: React.Dispatch<React.SetStateAction<DesktopStudiesDataMap>>;
  getCurrentDate: () => string;
}

export const useResearchMobileSync = ({
  setPatientFullNameState,
  setPatientDateOfBirthState,
  setResearchDateState,
  setOrganizationState,
  setStudiesDataState,
  getCurrentDate,
}: UseResearchMobileSyncParams) => {
  React.useEffect(() => {
    if (!window.mobileHostAPI) {
      return undefined;
    }

    return window.mobileHostAPI.onSyncMessage((message) => {
      const syncMessage = message as MobileSyncWireMessage | undefined;
      if (!syncMessage || typeof syncMessage !== "object" || !("type" in syncMessage)) {
        return;
      }

      if (syncMessage.type === "sync:snapshot") {
        const { header, studiesData: nextStudiesData } = syncMessage.state;
        setPatientFullNameState(header.patientFullName);
        setPatientDateOfBirthState(header.patientDateOfBirth);
        setResearchDateState(header.researchDate);
        setOrganizationState(header.organization);
        // МЕРЖИМ, а не заменяем — чтобы сохранить данные, которые были добавлены
        // локально на десктопе (например, импорт с флешки через mergeStudyData)
        // и ещё не отправлены на сервер. Серверные данные имеют приоритет для
        // уже существующих ключей, но поля, которых нет в snapshot, остаются.
        setStudiesDataState((prev) => ({
          ...nextStudiesData,
          ...prev,
        }));
        return;
      }

      if (syncMessage.type !== "sync:update") {
        return;
      }

      if (syncMessage.fragment === "header") {
        const { data } = syncMessage;
        if (Object.prototype.hasOwnProperty.call(data, "patientFullName")) {
          setPatientFullNameState(data.patientFullName ?? "");
        }
        if (Object.prototype.hasOwnProperty.call(data, "patientDateOfBirth")) {
          setPatientDateOfBirthState(data.patientDateOfBirth ?? "");
        }
        if (Object.prototype.hasOwnProperty.call(data, "researchDate")) {
          setResearchDateState(data.researchDate ?? getCurrentDate());
        }
        if (Object.prototype.hasOwnProperty.call(data, "organization")) {
          setOrganizationState(data.organization ?? "");
        }
        return;
      }

      if (syncMessage.fragment === "studiesData") {
        const data = syncMessage.data;

        if (data.mode === "replace") {
          setStudiesDataState({ ...data.studiesData });
          return;
        }

        if (data.mode === "set") {
          setStudiesDataState((prev) => ({
            ...prev,
            [data.studyType]: data.value,
          }));
          return;
        }

        setStudiesDataState((prev) => {
          if (!(data.studyType in prev)) {
            return prev;
          }

          const next = { ...prev };
          delete next[data.studyType];
          return next;
        });
      }
    });
  }, [
    getCurrentDate,
    setOrganizationState,
    setPatientDateOfBirthState,
    setPatientFullNameState,
    setResearchDateState,
    setStudiesDataState,
  ]);
};


