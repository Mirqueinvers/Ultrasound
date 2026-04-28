import React from "react";

import {
  Obp,
  Kidney,
  OmtFemale,
  OmtMale,
  Scrotum,
  Thyroid,
  SalivaryGlands,
  BrachioCephalicArteries,
  LowerExtremityVeins,
  Pleural,
  Breast,
  ChildDispensary,
  SoftTissue,
  UrinaryBladderResearch,
  LymphNodes,
} from "@components/researches";
import ResearchHeader from "@components/common/ResearchHeader";
import OrgNavigation, {
  type SectionKey,
} from "@components/common/OrgNavigation";
import { useResearch } from "@contexts";
import { useAuth } from "@contexts/AuthContext";
import { Directory } from "@components/directory";

import PrintModal from "@components/print/PrintModal";
import {
  useSectionRefs,
  useAvailableSectionKeys,
  useSaveResearch,
} from "@hooks";
import {
  ResearchActions,
  SaveMessageAlert,
} from "@/UI";
import { SearchSection } from "@/components/search/SearchSection";

interface ContentProps {
  selectedStudy: string;
  activeSection: string;
  selectedStudies: string[];
  onRemoveStudy: (study: string) => void;
  isMultiSelectMode: boolean;
  isDraftActive: boolean;
  mobileSaveRequestAt: string | null;
  onClearResearch: () => void;
  selectedDirectoryItem: string;
}

const Content: React.FC<ContentProps> = ({
  activeSection,
  selectedStudies,
  isDraftActive,
  mobileSaveRequestAt,
  onClearResearch,
  selectedDirectoryItem,
}) => {
  const { user } = useAuth();
  const {
    patientFullName,
    patientDateOfBirth,
    researchDate,
    studiesData,
    clearStudyData,
    clearStudiesData,
    setStudyData,
    clearHeaderData,
    setOrganization,
  } = useResearch();

  const [paymentType, setPaymentType] =
    React.useState<"oms" | "paid">("oms");
  const [isPrintModalOpen, setIsPrintModalOpen] =
    React.useState(false);

  const sectionRefs = useSectionRefs();
  const availableSectionKeys = useAvailableSectionKeys(selectedStudies);

  React.useEffect(() => {
    const selectedStudyKeys = new Set(selectedStudies);
    const allowedDataKeys = new Set(selectedStudies);

    // Поддерживаем исторические ключи для лимфоузлов, чтобы не терять совместимость.
    if (selectedStudyKeys.has("Лимфоузлы")) {
      allowedDataKeys.add("Лимфатические узлы");
      allowedDataKeys.add("lymphNodes");
    }

    Object.keys(studiesData).forEach((studyKey) => {
      if (!allowedDataKeys.has(studyKey)) {
        clearStudyData(studyKey);
      }
    });
  }, [selectedStudies, studiesData, clearStudyData]);

  React.useEffect(() => {
    if (user?.organization) {
      setOrganization(user.organization);
    }
  }, [setOrganization, user?.organization]);

  const {
    isSaving,
    saveMessage,
    saveResearch,
    isSavedSuccessfully,
    setSaveMessage,
  } = useSaveResearch({
    patientFullName,
    patientDateOfBirth,
    researchDate,
    selectedStudies,
    studiesData,
    onSaved: () => {
      if (mobileSaveRequestAt) {
        void window.mobileHostAPI?.publishSync({
          type: "sync:command",
          command: "draft:saved",
          origin: "desktop",
          updatedAt: new Date().toISOString(),
        });
      }
    },
  });

  const processedMobileSaveRequestAt = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (!mobileSaveRequestAt || mobileSaveRequestAt === processedMobileSaveRequestAt.current) {
      return;
    }

    if (!isDraftActive || isSaving) {
      return;
    }

    processedMobileSaveRequestAt.current = mobileSaveRequestAt;
    void saveResearch(paymentType);
  }, [isDraftActive, isSaving, mobileSaveRequestAt, paymentType, saveResearch]);

  const handleSaveResearch = () => {
    saveResearch(paymentType);
  };

  const handleClear = () => {
    clearHeaderData();
    clearStudiesData();
    
    if (user?.organization) {
      setOrganization(user.organization);
    }

    onClearResearch();
  };

  const scrollToSection = (key: SectionKey) => {
    const ref = sectionRefs.current[key];
    const element =
      ref?.current ??
      (document.querySelector(
        `[data-section-key="${key}"]`
      ) as HTMLElement | null);
    if (!element) return;
    const offset = 300;

    const rect = element.getBoundingClientRect();
    const absoluteTop = rect.top + window.pageYOffset;
    const targetY = absoluteTop - offset;

    window.scrollTo({
      top: targetY,
      behavior: "smooth",
    });
  };

  // Поиск
  if (activeSection === "search") {
    return <SearchSection />;
  }

  // Справочник
  if (activeSection === "directory") {
    return <Directory selectedDirectoryItem={selectedDirectoryItem} />;
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

  return (
    <div className="content relative">
      <OrgNavigation
        availableSectionKeys={availableSectionKeys}
        scrollToSection={scrollToSection}
      />

      <div className="mt-6">
        <ResearchHeader
          paymentType={paymentType}
          setPaymentType={setPaymentType}
        />

        <SaveMessageAlert
          message={saveMessage}
          onClose={() => setSaveMessage(null)}
        />

        <div className="mt-6 space-y-6">
          {selectedStudies.map((study, index) => (
            <div
              key={index}
              className="rounded-lg p-4 bg-white shadow-sm"
            >
              {study === "Почки" ? (
                <Kidney
                  value={studiesData["Почки"]}
                  onChange={(updated) =>
                    setStudyData("Почки", updated)
                  }
                  sectionRefs={sectionRefs.current}
                />
              ) : study === "ОБП" ? (
                <Obp
                  value={studiesData["ОБП"]}
                  onChange={(updated) =>
                    setStudyData("ОБП", updated)
                  }
                  sectionRefs={sectionRefs.current}
                />
              ) : study === "ОМТ (Ж)" ? (
                <OmtFemale
                  value={studiesData["ОМТ (Ж)"]}
                  onChange={(updated) =>
                    setStudyData("ОМТ (Ж)", updated)
                  }
                  sectionRefs={sectionRefs.current}
                />
              ) : study === "ОМТ (М)" ? (
                <OmtMale
                  value={studiesData["ОМТ (М)"]}
                  onChange={(updated) =>
                    setStudyData("ОМТ (М)", updated)
                  }
                  sectionRefs={sectionRefs.current}
                />
              ) : study === "Органы мошонки" ? (
                <Scrotum
                  value={studiesData["Органы мошонки"]}
                  onChange={(updated) =>
                    setStudyData("Органы мошонки", updated)
                  }
                  sectionRefs={sectionRefs.current}
                />
              ) : study === "Щитовидная железа" ? (
                <Thyroid
                  value={studiesData["Щитовидная железа"]}
                  onChange={(updated) =>
                    setStudyData("Щитовидная железа", updated)
                  }
                  sectionRefs={sectionRefs.current}
                />
              ) : study === "Слюнные железы" ? (
                <SalivaryGlands
                  value={studiesData["Слюнные железы"]}
                  onChange={(updated) =>
                    setStudyData("Слюнные железы", updated)
                  }
                  sectionRefs={sectionRefs.current}
                />
              ) : study === "БЦА" ? (
                <BrachioCephalicArteries
                  value={studiesData["БЦА"]}
                  onChange={(updated) =>
                    setStudyData("БЦА", updated)
                  }
                  sectionRefs={sectionRefs.current}
                />
              ) : study === "УВНК" ? (
                <LowerExtremityVeins
                  value={studiesData["УВНК"]}
                  onChange={(updated) =>
                    setStudyData("УВНК", updated)
                  }
                  sectionRefs={sectionRefs.current}
                />
              ) : study === "Плевральные полости" ? (
                <Pleural
                  value={studiesData["Плевральные полости"]}
                  onChange={(updated) =>
                    setStudyData("Плевральные полости", updated)
                  }
                  sectionRefs={sectionRefs.current}
                />
              ) : study === "Молочные железы" ? (
                <Breast
                  value={studiesData["Молочные железы"]}
                  onChange={(updated) =>
                    setStudyData("Молочные железы", updated)
                  }
                  sectionRefs={sectionRefs.current}
                />
              ) : study === "Лимфоузлы" ? (
                <LymphNodes
                  value={studiesData["Лимфоузлы"]}
                  onChange={(updated) =>
                    setStudyData("Лимфоузлы", updated)
                  }
                  sectionRefs={sectionRefs.current}
                />
              ) : study === "Детская диспансеризация" ? (
                <ChildDispensary
                  value={
                    studiesData["Детская диспансеризация"]
                  }
                  onChange={(updated) =>
                    setStudyData(
                      "Детская диспансеризация",
                      updated
                    )
                  }
                />
              ) : study === "Мягких тканей" ? (
                <SoftTissue
                  value={studiesData["Мягких тканей"]}
                  onChange={(updated) =>
                    setStudyData("Мягких тканей", updated)
                  }
                  sectionRefs={sectionRefs.current}
                />
              ) : study === "Мочевой пузырь" ? (
                <UrinaryBladderResearch
                  value={studiesData["Мочевой пузырь"]}
                  onChange={(updated) =>
                    setStudyData("Мочевой пузырь", updated)
                  }
                />
              ) : null}
            </div>
          ))}
        </div>

        <div
          ref={sectionRefs.current["Заключение"]}
          data-section-key="Заключение"
        />

        <ResearchActions
          isSaving={isSaving}
          hasSelectedStudies={selectedStudies.length > 0}
          onClear={handleClear}
          onPrint={() => setIsPrintModalOpen(true)}
          onSave={handleSaveResearch}
          isPrintEnabled={isSavedSuccessfully}
        />
      </div>

      <PrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
      />
    </div>
  );
};

export default Content;
