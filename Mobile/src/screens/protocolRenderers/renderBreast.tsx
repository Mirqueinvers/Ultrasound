import { BreastProtocolBlock } from "../breast/BreastProtocolBlock";
import type { ProtocolUpdateHandlers } from "../../hooks/useProtocolUpdateHandlers";
import type { AppStyles } from "../../styles/appStyles";
import type { BreastStudyDraft } from "../../shared/breastDraft";

type RenderBreastProps = {
  styles: AppStyles;
  activeBreastDraft: BreastStudyDraft;
  protocolUpdateHandlers: ProtocolUpdateHandlers;
};

export function renderBreast({
  styles,
  activeBreastDraft,
  protocolUpdateHandlers,
}: RenderBreastProps) {
  return (
    <BreastProtocolBlock
      styles={styles}
      value={activeBreastDraft}
      onChange={protocolUpdateHandlers.updateBreastStudy}
    />
  );
}
