// path: src/components/.../Content.tsx

import React from "react";

import Obp from "@components/researches/Obp";
import Kidney from "@components/researches/Kidney";
import OmtFemale from "@components/researches/OmtFemale";
import OmtMale from "@components/researches/OmtMale";
import Scrotum from "@components/researches/Scrotum";
import Thyroid from "@components/researches/Thyroid";
import Breast from "@components/researches/Breast";
import ChildDispensary from "@components/researches/ChildDispensary";
import SoftTissue from "@components/researches/SoftTissue";
import UrinaryBladderResearch from "@components/researches/UrinaryBladderResearch";
import ResearchHeader from "@components/common/ResearchHeader";
import { useResearch } from "@contexts";

interface ContentProps {
  selectedStudy: string;
  activeSection: string;
  selectedStudies: string[];
  onRemoveStudy: (study: string) => void;
  isMultiSelectMode: boolean;
  onStartNewResearch: () => void;
  onCancelNewResearch: () => void;
}

const Content: React.FC<ContentProps> = ({
  selectedStudy,
  activeSection,
  selectedStudies,
  isMultiSelectMode,
  onStartNewResearch,
  onCancelNewResearch,
}) => {
  const {
    patientFullName,
    patientDateOfBirth,
    researchDate,
    studiesData,
    clearStudiesData,
  } = useResearch();

  const [isSaving, setIsSaving] = React.useState(false);
  const [saveMessage, setSaveMessage] = React.useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [paymentType, setPaymentType] = React.useState<"oms" | "paid">("oms");

  const handleSaveResearch = async () => {
    const fullNameParts = patientFullName.split(" ");
    const lastName = fullNameParts[0] || "";
    const firstName = fullNameParts[1] || "";
    const middleName = fullNameParts[2] || "";

    if (!lastName.trim()) {
      setSaveMessage({ type: "error", text: "Введите фамилию пациента" });
      return;
    }
    if (!firstName.trim()) {
      setSaveMessage({ type: "error", text: "Введите имя пациента" });
      return;
    }
    if (!patientDateOfBirth.trim()) {
      setSaveMessage({ type: "error", text: "Введите дату рождения" });
      return;
    }
    if (!researchDate.trim()) {
      setSaveMessage({ type: "error", text: "Введите дату исследования" });
      return;
    }
    if (selectedStudies.length === 0) {
      setSaveMessage({ type: "error", text: "Выберите хотя бы одно исследование" });
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
        setSaveMessage({ type: "error", text: "Ошибка при сохранении пациента" });
        return;
      }

      const patientId = patientResult.patient.id;

      const researchResult = await window.researchAPI.create({
        patientId,
        researchDate: researchDate,
        paymentType: paymentType,
      });

      if (!researchResult.success || !researchResult.researchId) {
        setSaveMessage({ type: "error", text: "Ошибка при создании исследования" });
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
          console.error(`Ошибка сохранения ${studyType}:`, studyResult.message);
        }
      }

      setSaveMessage({
        type: "success",
        text: `Исследование успешно сохранено (ID: ${researchId})`,
      });

      setTimeout(() => {
        setSaveMessage(null);
        clearStudiesData();
        onCancelNewResearch();
      }, 3000);
    } catch (error) {
      console.error("Error saving research:", error);
      setSaveMessage({ type: "error", text: "Произошла ошибка при сохранении" });
    } finally {
      setIsSaving(false);
    }
  };

  // Показываем исследование только если выбрана секция "УЗИ протоколы"
  if (activeSection !== "uzi-protocols") {
    return (
      <div className="content">
        <h2 className="text-slate-800 mt-0">Основной контент</h2>
        <p className="text-slate-600">
          Выберите "УЗИ протоколы" в меню для просмотра исследований
        </p>
      </div>
    );
  }

  // Режим создания нового исследования
  if (isMultiSelectMode) {
    return (
      <div className="content">
        <div className="mt-6">
          <ResearchHeader paymentType={paymentType} setPaymentType={setPaymentType} />

          {/* Сообщение о сохранении */}
          {saveMessage && (
            <div
              className={`mb-4 px-4 py-3 rounded-lg ${
                saveMessage.type === "success"
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}
            >
              {saveMessage.text}
            </div>
          )}

          {/* Выбранные исследования */}
          {selectedStudies.length > 0 && (
            <div className="mt-6 space-y-6">
              {selectedStudies.map((study, index) => (
                <div key={index} className="rounded-lg p-4 bg-white shadow-sm">
                  {renderStudyComponent(study)}
                </div>
              ))}
            </div>
          )}

          {/* Подсказка если нет выбранных исследований */}
          {selectedStudies.length === 0 && (
            <div className="mt-6 p-6 border-2 border-dashed border-slate-300 rounded-lg text-center bg-slate-50">
              <p className="text-slate-500">Выберите исследования из левого меню</p>
            </div>
          )}

          {/* Кнопки управления */}
          <div className="mt-6 flex gap-3">
            <button
              onClick={onCancelNewResearch}
              disabled={isSaving}
              className="px-4 py-2 bg-slate-200 text-slate-700 rounded hover:bg-slate-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Отменить
            </button>

            {selectedStudies.length > 0 && (
              <>
                <button
                  onClick={() => window.print()}
                  disabled={isSaving}
                  className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Печать
                </button>

                <button
                  onClick={handleSaveResearch}
                  disabled={isSaving}
                  className={`px-4 py-2 rounded transition-colors font-medium ${
                    isSaving
                      ? "bg-slate-400 text-slate-200 cursor-not-allowed"
                      : "bg-green-600 text-white hover:bg-green-700"
                  }`}
                >
                  {isSaving ? "Сохранение..." : "Сохранить исследование"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Если исследование не выбрано, показываем кнопку для начала нового исследования
  if (!selectedStudy) {
    return (
      <div className="content">
        <div className="mt-6">
          <div className="flex flex-col items-center justify-center py-12">
            <button
              onClick={onStartNewResearch}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md hover:shadow-lg"
            >
              Начать новое исследование
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Отображаем выбранное исследование (старый режим)
  return <div className="content">{renderStudyComponent(selectedStudy)}</div>;
};

// Вспомогательная функция для рендера компонента исследования
function renderStudyComponent(study: string) {
  switch (study) {
    case "ОБП":
      return <Obp />;
    case "Почки":
      return <Kidney />;
    case "ОМТ (Ж)":
      return <OmtFemale />;
    case "ОМТ (М)":
      return <OmtMale />;
    case "Органы мошонки":
      return <Scrotum />;
    case "Щитовидная железа":
      return <Thyroid />;
    case "Молочные железы":
      return <Breast />;
    case "Детская диспансеризация":
      return <ChildDispensary />;
    case "Мягких тканей":
      return <SoftTissue />;
    case "Мочевой пузырь":
      return <UrinaryBladderResearch />;
    default:
      return (
        <div className="mt-6 p-8 border-2 border-dashed border-slate-300 rounded-lg text-center">
          <h3 className="text-slate-600 mb-2">🚧 В разработке</h3>
          <p className="text-slate-500">
            Компонент для "{study}" будет добавлен в следующей версии
          </p>
        </div>
      );
  }
}

export default Content;
