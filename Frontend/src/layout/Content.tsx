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
  StartResearch,
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
  onStartNewResearch: () => void;
  onCancelNewResearch: () => void;
  selectedDirectoryItem: string;
}

const Content: React.FC<ContentProps> = ({
  activeSection,
  selectedStudies,
  onStartNewResearch,
  onCancelNewResearch,
  selectedDirectoryItem,
}) => {
  const { user } = useAuth();
  const {
    patientFullName,
    patientDateOfBirth,
    researchDate,
    studiesData,
    clearStudiesData,
    setStudyData,
    clearHeaderData,
    setOrganization,
  } = useResearch();

  const [paymentType, setPaymentType] =
    React.useState<"oms" | "paid">("oms");
  const [isPrintModalOpen, setIsPrintModalOpen] =
    React.useState(false);

  const [isCreating, setIsCreating] = React.useState(false);

  const sectionRefs = useSectionRefs();
  const availableSectionKeys = useAvailableSectionKeys(selectedStudies);

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
  });

  const handleSaveResearch = () => {
    saveResearch(paymentType);
  };

  const handleStartClick = () => {
    clearHeaderData();
    clearStudiesData();
    
    // Устанавливаем организацию из профиля пользователя
    if (user?.organization) {
      setOrganization(user.organization);
    }
    
    setIsCreating(true);
    onStartNewResearch();
  };

  const handleCancel = () => {
    setIsCreating(false);
    clearStudiesData();
    onCancelNewResearch();
  };

  const handleStartNewResearchFromActions = () => {
    clearHeaderData();
    clearStudiesData();
    
    // Устанавливаем организацию из профиля пользователя
    if (user?.organization) {
      setOrganization(user.organization);
    }
    
    setIsCreating(true);
    onStartNewResearch();
  };

  const scrollToSection = (key: SectionKey) => {
    const ref = sectionRefs.current[key];
    if (!ref?.current) return;

    const element = ref.current;
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

  // Если исследование ещё не начали — только кнопка
  if (!isCreating) {
    return <StartResearch onStart={handleStartClick} />;
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

        <ResearchActions
          isSaving={isSaving}
          hasSelectedStudies={selectedStudies.length > 0}
          onCancel={handleCancel}
          onPrint={() => setIsPrintModalOpen(true)}
          onSave={handleSaveResearch}
          onStartNewResearch={handleStartNewResearchFromActions}
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
