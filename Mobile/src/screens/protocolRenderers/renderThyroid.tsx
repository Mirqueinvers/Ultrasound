import { ThyroidProtocolBlock } from "../thyroid/ThyroidProtocolBlock";
import type { ProtocolUpdateHandlers } from "../../hooks/useProtocolUpdateHandlers";
import type { AppStyles } from "../../styles/appStyles";
import type { ThyroidStudyDraft } from "../../shared/thyroidDraft";

type RenderThyroidProps = {
  styles: AppStyles;
  activeThyroidDraft: ThyroidStudyDraft;
  protocolUpdateHandlers: ProtocolUpdateHandlers;
};

export function renderThyroid({
  styles,
  activeThyroidDraft,
  protocolUpdateHandlers,
}: RenderThyroidProps) {
  return (
    <ThyroidProtocolBlock
      styles={styles}
      value={activeThyroidDraft}
      onChange={protocolUpdateHandlers.updateThyroidStudy}
    />
  );
}
