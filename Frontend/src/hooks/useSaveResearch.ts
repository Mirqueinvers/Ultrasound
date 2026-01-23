// Frontend/src/hooks/useSaveResearch.ts
import { useState } from "react";

interface UseSaveResearchParams {
  patientFullName: string;
  patientDateOfBirth: string;
  researchDate: string;
  selectedStudies: string[];
  studiesData: Record<string, unknown>;
  clearStudiesData: () => void;
  onCancelNewResearch: () => void;
  onSaved?: (researchId: number) => void;
}

interface SaveMessage {
  type: "success" | "error";
  text: string;
}

export const useSaveResearch = ({
  patientFullName,
  patientDateOfBirth,
  researchDate,
  selectedStudies,
  studiesData,
  clearStudiesData,
  onCancelNewResearch,
  onSaved,
}: UseSaveResearchParams) => {
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<SaveMessage | null>(null);

  const saveResearch = async (paymentType: "oms" | "paid") => {
    const fullNameParts = patientFullName.split(" ");
    const lastName = fullNameParts[0] || "";
    const firstName = fullNameParts[1] || "";
    const middleName = fullNameParts[2] || "";

    if (!lastName.trim()) {
      setSaveMessage({
        type: "error",
        text: "Введите фамилию пациента",
      });
      return;
    }
    if (!firstName.trim()) {
      setSaveMessage({
        type: "error",
        text: "Введите имя пациента",
      });
      return;
    }
    if (!patientDateOfBirth.trim()) {
      setSaveMessage({
        type: "error",
        text: "Введите дату рождения",
      });
      return;
    }
    if (!researchDate.trim()) {
      setSaveMessage({
        type: "error",
        text: "Введите дату исследования",
      });
      return;
    }
    if (selectedStudies.length === 0) {
      setSaveMessage({
        type: "error",
        text: "Выберите хотя бы одно исследование",
      });
      return;
    }

    setIsSaving(true);
    setSaveMessage(null);

    try {
      const patientResult = await window.patientAPI.findOrCreate({
        lastName: lastName.trim(),
        firstName: firstName.trim(),
        middleName: middleName.trim() || null,
        dateOfBirth: patientDateOfBirth.trim(),
      });

      if (!patientResult.success || !patientResult.patient) {
        setSaveMessage({
          type: "error",
          text: "Ошибка при сохранении пациента",
        });
        return;
      }

      const patientId = patientResult.patient.id;

      const researchResult = await window.researchAPI.create({
        patientId,
        researchDate: researchDate,
        paymentType,
      });

      if (!researchResult.success || !researchResult.researchId) {
        setSaveMessage({
          type: "error",
          text: "Ошибка при создании исследования",
        });
        return;
      }

      const researchId = researchResult.researchId;

      for (const studyType of selectedStudies) {
        const studyData = studiesData[studyType] || {};

        console.log(`Сохранение ${studyType}:`, studyData);

        const studyResult = await window.researchAPI.addStudy({
          researchId,
          studyType,
          studyData,
        });

        if (!studyResult.success) {
          console.error(
            `Ошибка сохранения ${studyType}:`,
            studyResult.message
          );
        }
      }

      setSaveMessage({
        type: "success",
        text: `Исследование успешно сохранено (ID: ${researchId})`,
      });

      onSaved?.(researchId);

      setTimeout(() => {
        setSaveMessage(null);
        clearStudiesData();
        onCancelNewResearch();
      }, 3000);
    } catch (error) {
      console.error("Error saving research:", error);
      setSaveMessage({
        type: "error",
        text: "Произошла ошибка при сохранении",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return {
    isSaving,
    saveMessage,
    saveResearch,
    setSaveMessage,
  };
};
