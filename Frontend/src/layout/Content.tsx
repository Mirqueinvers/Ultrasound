// Frontend/src/components/Content.tsx
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

import PrintModal from "@components/print/PrintModal";

interface ContentProps {
  selectedStudy: string;
  activeSection: string;
  selectedStudies: string[];
  onRemoveStudy: (study: string) => void;
  isMultiSelectMode: boolean;
  onStartNewResearch: () => void;
  onCancelNewResearch: () => void;
}

// тип ключей для органных секций
type SectionKey =
  | "ОБП:печень"
  | "ОБП:желчный"
  | "ОБП:поджелудочная"
  | "ОБП:селезёнка"
  | "Почки:правая"
  | "Почки:левая"
  | "Почки:мочевой пузырь"
  | "ОМТ (Ж):матка"
  | "ОМТ (Ж):правый яичник"
  | "ОМТ (Ж):левый яичник"
  | "ОМТ (Ж):мочевой пузырь"
  | "ОМТ (М):простата"
  | "ОМТ (М):мочевой пузырь";

const ORG_LABELS: Record<SectionKey, string> = {
  "ОБП:печень": "Печень",
  "ОБП:желчный": "Желчный пузырь",
  "ОБП:поджелудочная": "Поджелудочная",
  "ОБП:селезёнка": "Селезёнка",
  "Почки:правая": "Почка правая",
  "Почки:левая": "Почка левая",
  "Почки:мочевой пузырь": "Мочевой пузырь",
  "ОМТ (Ж):матка": "Матка",
  "ОМТ (Ж):правый яичник": "Правый яичник",
  "ОМТ (Ж):левый яичник": "Левый яичник",
  "ОМТ (Ж):мочевой пузырь": "Мочевой пузырь",
  "ОМТ (М):простата": "Предстательная железа",
  "ОМТ (М):мочевой пузырь": "Мочевой пузырь",
};


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
    setStudyData,
  } = useResearch();

  const [isSaving, setIsSaving] = React.useState(false);
  const [saveMessage, setSaveMessage] = React.useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [paymentType, setPaymentType] = React.useState<"oms" | "paid">("oms");
  const [isPrintModalOpen, setIsPrintModalOpen] = React.useState(false);

  // refs для органных секций
const [sectionRefs] = React.useState<
  Record<SectionKey, React.RefObject<HTMLDivElement>>
>(() => {
  return {
    "ОБП:печень": React.createRef<HTMLDivElement>(),
    "ОБП:желчный": React.createRef<HTMLDivElement>(),
    "ОБП:поджелудочная": React.createRef<HTMLDivElement>(),
    "ОБП:селезёнка": React.createRef<HTMLDivElement>(),
    "Почки:правая": React.createRef<HTMLDivElement>(),
    "Почки:левая": React.createRef<HTMLDivElement>(),
    "Почки:мочевой пузырь": React.createRef<HTMLDivElement>(),
    "ОМТ (Ж):матка": React.createRef<HTMLDivElement>(),
    "ОМТ (Ж):правый яичник": React.createRef<HTMLDivElement>(),
    "ОМТ (Ж):левый яичник": React.createRef<HTMLDivElement>(),
    "ОМТ (Ж):мочевой пузырь": React.createRef<HTMLDivElement>(),
    "ОМТ (М):простата": React.createRef<HTMLDivElement>(),
    "ОМТ (М):мочевой пузырь": React.createRef<HTMLDivElement>(),
  };
});


  const [isToolbarCollapsed, setIsToolbarCollapsed] = React.useState(false);

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
        paymentType: paymentType,
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

    const scrollToSection = (key: SectionKey) => {
    const ref = sectionRefs[key];
    if (!ref?.current) return;

    const element = ref.current;
    const offset = 300; // сколько пикселей оставить сверху

    const rect = element.getBoundingClientRect();
    const absoluteElementTop = rect.top + window.pageYOffset;
    const targetY = absoluteElementTop - offset;

    window.scrollTo({
      top: targetY,
      behavior: "smooth",
    });
  };


  // Тестовый режим
  if (activeSection === "test") {
    return (
      <div className="content">
        <h2 className="text-slate-800 mt-0">Тестовый режим</h2>
        <p className="text-slate-600">
          Здесь можно будет добавить тестовый вывод печати
        </p>
      </div>
    );
  }

  // Не "УЗИ протоколы"
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
    // какие секции есть для выбранных исследований
const availableSectionKeys: SectionKey[] = selectedStudies.flatMap(
  (study): SectionKey[] => {
    switch (study) {
      case "ОБП":
        return [
          "ОБП:печень",
          "ОБП:желчный",
          "ОБП:поджелудочная",
          "ОБП:селезёнка",
        ];
      case "Почки":
        return [
          "Почки:правая",
          "Почки:левая",
          "Почки:мочевой пузырь",
        ];
      case "ОМТ (Ж)":
        return [
          "ОМТ (Ж):матка",
          "ОМТ (Ж):правый яичник",
          "ОМТ (Ж):левый яичник",
          "ОМТ (Ж):мочевой пузырь",
        ];
      case "ОМТ (М)":
        return [
          "ОМТ (М):простата",
          "ОМТ (М):мочевой пузырь",
        ];
      default:
        return [];
    }
  }
);


    return (
      <div className="content relative">
        {/* Правый вертикальный тулбар */}
{availableSectionKeys.length > 0 && (
  <div className="fixed right-[7%] bottom-[4%] z-30 w-40">
    <div
      className={
        "bg-white text-black shadow-lg transform origin-bottom rounded-2xl " +
        (isToolbarCollapsed
          ? "h-10 flex items-center justify-center cursor-pointer"
          : "p-2 max-h-[70vh] flex flex-col")
      }
      onClick={() => {
        if (isToolbarCollapsed) {
          setIsToolbarCollapsed(false);
        }
      }}
    >
      {isToolbarCollapsed ? (
        <span className="text-sm font-bold select-none">
          Навигация
        </span>
      ) : (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsToolbarCollapsed(true);
            }}
            className="flex items-center justify-between px-2 py-1 text-xs font-semibold hover:bg-black/5 rounded-lg mb-1"
          >
            <span>Навигация</span>
            <span>×</span>
          </button>

          <div className="mt-1 overflow-y-auto pr-1">
            {availableSectionKeys.map((key) => (
              <button
                key={key}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  scrollToSection(key);
                }}
                className="block w-full text-left px-2 py-1 mb-0.5 text-[11px] rounded-md hover:bg-black/5"
              >
                {ORG_LABELS[key]}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  </div>
)}



        <div className="mt-6">
          <ResearchHeader
            paymentType={paymentType}
            setPaymentType={setPaymentType}
          />

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

          {selectedStudies.length > 0 && (
            <div className="mt-6 space-y-6">
              {selectedStudies.map((study, index) => (
                <div key={index} className="rounded-lg p-4 bg-white shadow-sm">
                  {study === "Почки" ? (
                    <Kidney
                      value={studiesData["Почки"]}
                      onChange={(updated) => setStudyData("Почки", updated)}
                      sectionRefs={sectionRefs}
                    />
                  ) : study === "ОБП" ? (
                    <Obp
                      value={studiesData["ОБП"]}
                      onChange={(updated) => setStudyData("ОБП", updated)}
                      sectionRefs={sectionRefs}
                    />
                  ) : study === "ОМТ (Ж)" ? (
                    <OmtFemale
                      value={studiesData["ОМТ (Ж)"]}
                      onChange={(updated) => setStudyData("ОМТ (Ж)", updated)}
                      sectionRefs={sectionRefs}
                    />
                  ) : study === "ОМТ (М)" ? (
                    <OmtMale
                      value={studiesData["ОМТ (М)"]}
                      onChange={(updated) => setStudyData("ОМТ (М)", updated)}
                      sectionRefs={sectionRefs}
                    />
                  ) : (
                    renderStudyComponent(study)
                  )}

                </div>
              ))}
            </div>
          )}

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
                  onClick={() => setIsPrintModalOpen(true)}
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

        <PrintModal
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
        />
      </div>
    );
  }

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

  return <div className="content">{renderStudyComponent(selectedStudy)}</div>;
};

// старый рендер без навигации для одиночного режима
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
