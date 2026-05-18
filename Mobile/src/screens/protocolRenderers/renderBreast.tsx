import { BreastProtocolBlock } from "../breast/BreastProtocolBlock";
import type { ProtocolUpdateHandlers } from "../../hooks/useProtocolUpdateHandlers";
import type { AppStyles } from "../../styles/appStyles";
import type { BreastStudyDraft } from "../../shared/breastDraft";

type RenderBreastProps = {
  styles: AppStyles;
  activeSectionId: string | null;
  activeBreastDraft: BreastStudyDraft;
  protocolUpdateHandlers: ProtocolUpdateHandlers;
};

export function renderBreast({
  styles,
  activeSectionId,
  activeBreastDraft,
  protocolUpdateHandlers,
}: RenderBreastProps) {
  return (
    <BreastProtocolBlock
      styles={styles}
      value={activeBreastDraft}
      activeSectionId={activeSectionId}
      onChange={protocolUpdateHandlers.updateBreastStudy}
    />
  );
}
