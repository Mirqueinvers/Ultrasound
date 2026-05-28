import React from "react";

import ResearchHeader from "@components/common/ResearchHeader";
import { useResearch } from "@contexts";
import { useAuth } from "@contexts/AuthContext";
import { Directory } from "@components/directory";

import PrintModal from "@components/print/PrintModal";
import {
  useSaveResearch,
  useMobileDraftCommands,
  useClearResearchDraft,
} from "@hooks";
import {
  ResearchActions,
  SaveMessageAlert,
} from "@/UI";
import { SearchSection } from "@/components/search/SearchSection";
import { renderDesktopResearch } from "../researches/desktopResearchRenderers";

import type { SectionKey } from "@/protocols";

interface ContentProps {
  activeSection: string;
  selectedStudies: string[];
  isDraftActive: boolean;
  mobileSaveRequestAt: string | null;
  mobilePrintRequestAt: string | null;
  mobileClearRequestAt: string | null;
  onClearResearch: () => void;
  selectedDirectoryItem: string;
  sectionRefs: React.MutableRefObject<
    Record<SectionKey, React.RefObject<HTMLDivElement | null>>
  >;
}

const Content: React.FC<ContentProps> = ({
  activeSection,
  selectedStudies,
  isDraftActive,
  mobileSaveRequestAt,
  mobilePrintRequestAt,
  mobileClearRequestAt,
  onClearResearch,
  selectedDirectoryItem,
  sectionRefs,
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

  const [paymentType, setPaymentType] = React.useState<"oms" | "paid">("oms");
  const [isPrintModalOpen, setIsPrintModalOpen] = React.useState(false);
  const [printAutoToken, setPrintAutoToken] = React.useState<string | null>(null);
  const [currentResearchId, setCurrentResearchId] = React.useState<number | null>(null);

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
    onSaved: (researchId: number) => {
      setCurrentResearchId(researchId);
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

  const handleSaveResearch = () => {
    saveResearch(paymentType);
  };

  const { clearResearchDraft } = useClearResearchDraft({
    clearHeaderData,
    clearStudiesData,
    setOrganization,
    userOrganization: user?.organization,
    onClearResearch,
  });

  useMobileDraftCommands({
    isDraftActive,
    isSaving,
    mobileSaveRequestAt,
    mobilePrintRequestAt,
    mobileClearRequestAt,
    paymentType,
    saveResearch,
    onPrintRequest: (token) => {
      setPrintAutoToken(token);
      setIsPrintModalOpen(true);
    },
    onClearRequest: clearResearchDraft,
  });

  if (activeSection === "search") {
    return <SearchSection />;
  }

  if (activeSection === "directory") {
    return <Directory selectedDirectoryItem={selectedDirectoryItem} />;
  }

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
              className="rounded-lg"
            >
              {renderDesktopResearch({
                study,
                studiesData,
                setStudyData,
                sectionRefs,
              })}
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
          onClear={clearResearchDraft}
          onPrint={() => setIsPrintModalOpen(true)}
          onSave={handleSaveResearch}
          isPrintEnabled={isSavedSuccessfully}
        />
      </div>

      <PrintModal
        isOpen={isPrintModalOpen}
        onClose={() => {
          setIsPrintModalOpen(false);
          setPrintAutoToken(null);
        }}
        autoPrintToken={printAutoToken}
        researchId={currentResearchId}
      />
    </div>
  );
};

export default Content;
