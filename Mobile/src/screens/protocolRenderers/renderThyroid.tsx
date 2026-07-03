import { ThyroidProtocolBlock } from "../thyroid/ThyroidProtocolBlock";
import type { ProtocolUpdateHandlers } from "../../hooks/useProtocolUpdateHandlers";
import type { AppStyles } from "../../styles/appStyles";
import type { ThyroidStudyDraft } from "../../shared/thyroidDraft";
import type { FieldVisibility } from "../../settings/fieldVisibility";

type RenderThyroidProps = {
  styles: AppStyles;
  activeSectionId: string | null;
  fieldVisibility: FieldVisibility;
  activeThyroidDraft: ThyroidStudyDraft;
  protocolUpdateHandlers: ProtocolUpdateHandlers;
};

export function renderThyroid({
  styles,
  activeSectionId,
  fieldVisibility,
  activeThyroidDraft,
  protocolUpdateHandlers,
}: RenderThyroidProps) {
  return (
    <ThyroidProtocolBlock
      fieldVisibility={fieldVisibility}
      styles={styles}
      value={activeThyroidDraft}
      activeSectionId={activeSectionId}
      onChange={protocolUpdateHandlers.updateThyroidStudy}
    />
  );
}
