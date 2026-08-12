import React from "react";

import RegistryPanel, {
  type PatientSelectData,
} from "@/components/registry/RegistryPanel";

import { ResearchProvider } from "@contexts/ResearchProvider";
import { useResearch } from "@contexts/useResearch";

interface RegistrySectionProps {
  onSelectStudies: (studies: string[]) => void;
}

const RegistryPanelWrapper: React.FC<RegistrySectionProps> = ({
  onSelectStudies,
}) => {
  const { setPatientFullName, setPatientDateOfBirth } = useResearch();

  const handlePatientSelect = React.useCallback(
    (data: PatientSelectData) => {
      setPatientFullName(data.fullName);
      setPatientDateOfBirth(data.dateOfBirth);
      onSelectStudies(data.studies);
    },
    [setPatientFullName, setPatientDateOfBirth, onSelectStudies],
  );

  return <RegistryPanel onPatientSelect={handlePatientSelect} />;
};

const RegistrySection: React.FC<RegistrySectionProps> = ({
  onSelectStudies,
}) => {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="flex flex-col gap-3 p-6 pt-24">
        <div className="flex justify-center">
          <div className="w-[70%] px-6 py-6 rounded-lg">
            <ResearchProvider>
              <RegistryPanelWrapper onSelectStudies={onSelectStudies} />
            </ResearchProvider>
          </div>
        </div>
      </div>
    </main>
  );
};

export default RegistrySection;