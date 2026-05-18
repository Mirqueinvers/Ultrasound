import { useMemo } from "react";

import type { BreastStudyDraft } from "../shared/breastDraft";
import type { KidneyStudyDraft } from "../shared/kidneyDraft";
import type { LymphNodesStudyDraft } from "../shared/lymphNodesDraft";
import type { OmtFemaleDraft } from "../shared/omtFemaleDraft";
import type { OmtMaleDraft } from "../shared/omtMaleDraft";
import type { ScrotumDraft } from "../shared/scrotumDraft";
import type { ThyroidStudyDraft } from "../shared/thyroidDraft";

type UpdateStudyByProtocolId = <T,>(protocolId: string, value: T) => void;

type ProtocolUpdateHandlers = {
  updateKidneyStudy: (value: KidneyStudyDraft) => void;
  updateScrotumStudy: (value: ScrotumDraft) => void;
  updateOmtFemaleStudy: (value: OmtFemaleDraft) => void;
  updateOmtMaleStudy: (value: OmtMaleDraft) => void;
  updateThyroidStudy: (value: ThyroidStudyDraft) => void;
  updateBreastStudy: (value: BreastStudyDraft) => void;
  updateLymphNodesStudy: (value: LymphNodesStudyDraft) => void;
};

export function useProtocolUpdateHandlers(updateStudyByProtocolId: UpdateStudyByProtocolId) {
  return useMemo<ProtocolUpdateHandlers>(
    () => ({
      updateKidneyStudy: (value) => updateStudyByProtocolId("kidneys", value),
      updateScrotumStudy: (value) => updateStudyByProtocolId("scrotum", value),
      updateOmtFemaleStudy: (value) => updateStudyByProtocolId("omt_female", value),
      updateOmtMaleStudy: (value) => updateStudyByProtocolId("omt_male", value),
      updateThyroidStudy: (value) => updateStudyByProtocolId("thyroid", value),
      updateBreastStudy: (value) => updateStudyByProtocolId("breast", value),
      updateLymphNodesStudy: (value) => updateStudyByProtocolId("lymph_nodes", value),
    }),
    [updateStudyByProtocolId],
  );
}
