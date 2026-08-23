import React from "react";

import ResearchHeader from "@components/common/ResearchHeader";
import {
  useSaveResearch,
  useMobileDraftCommands,
  useClearResearchDraft,
  useClearStaleStudies,
} from "@hooks";
import {
  ResearchActions,
  SaveMessageAlert,
} from "@/UI";
import { renderDesktopResearch } from "../../researches/desktopResearchRenderers";
import { mobileHostService } from "@services";
import PrintModal from "@components/print/PrintModal";
import { useAuth } from "@contexts/useAuth";
import { useResearch } from "@contexts/useResearch";

import type { SectionKey } from "@/protocols";

interface ResearchWorkspaceProps {
  selectedStudies: string[];
  isDraftActive: boolean;
  mobileSaveRequestAt: string | null;
  mobilePrintRequestAt: string | null;
  mobileClearRequestAt: string | null;
  onClearResearch: () => void;
  sectionRefs: React.MutableRefObject<
    Record<SectionKey, React.RefObject<HTMLDivElement | null>>
  >;
}

const ResearchWorkspace: React.FC<ResearchWorkspaceProps> = ({
  selectedStudies,
  isDraftActive,
  mobileSaveRequestAt,
  mobilePrintRequestAt,
  mobileClearRequestAt,
  onClearResearch,
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
  const [currentResearchId, setCurrentResearchId] = React.useState<string | null>(null);

  useClearStaleStudies(selectedStudies, studiesData, clearStudyData);

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
    onSaved: (researchId: string) => {
      setCurrentResearchId(researchId);
      if (mobileSaveRequestAt) {
        void mobileHostService.publishSync({
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

        <div data-section-key="Заключение" />

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

export default ResearchWorkspace;