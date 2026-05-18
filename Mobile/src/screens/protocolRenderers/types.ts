import type { BreastStudyDraft } from "../../shared/breastDraft";
import type { KidneyStudyDraft } from "../../shared/kidneyDraft";
import type { LymphNodesStudyDraft } from "../../shared/lymphNodesDraft";
import type { OmtFemaleDraft } from "../../shared/omtFemaleDraft";
import type { OmtMaleDraft } from "../../shared/omtMaleDraft";
import type { ObpDraft } from "../../shared/obpDraft";
import type { ScrotumDraft } from "../../shared/scrotumDraft";
import type { ThyroidStudyDraft } from "../../shared/thyroidDraft";
import type { ObpDraftActions } from "../../protocols/obp/useObpDraftActions";
import type { ProtocolUpdateHandlers } from "../../hooks/useProtocolUpdateHandlers";
import type { AppStyles } from "../../styles/appStyles";

export type ProtocolRendererContext = {
  styles: AppStyles;
  activeSectionId: string | null;
  obpActions: ObpDraftActions;
  protocolUpdateHandlers: ProtocolUpdateHandlers;
  activeObpDraft: ObpDraft;
  activeKidneyDraft: KidneyStudyDraft;
  activeScrotumDraft: ScrotumDraft;
  activeOmtFemaleDraft: OmtFemaleDraft;
  activeOmtMaleDraft: OmtMaleDraft;
  activeThyroidDraft: ThyroidStudyDraft;
  activeBreastDraft: BreastStudyDraft;
  activeLymphNodesDraft: LymphNodesStudyDraft;
};
