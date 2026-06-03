import { useCallback } from "react";

interface UseClearResearchDraftParams {
  clearHeaderData: () => void;
  clearStudiesData: () => void;
  setOrganization: (organization: string) => void;
  userOrganization: string | undefined;
  onClearResearch: () => void;
}

export const useClearResearchDraft = ({
  clearHeaderData,
  clearStudiesData,
  setOrganization,
  userOrganization,
  onClearResearch,
}: UseClearResearchDraftParams) => {
  const clearResearchDraft = useCallback(() => {
    clearHeaderData();
    clearStudiesData();

    if (userOrganization) {
      setOrganization(userOrganization);
    }

    onClearResearch();
  }, [
    clearHeaderData,
    clearStudiesData,
    onClearResearch,
    setOrganization,
    userOrganization,
  ]);

  return { clearResearchDraft };
};
