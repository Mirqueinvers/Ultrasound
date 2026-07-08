import { BreastProtocolBlock } from "../breast/BreastProtocolBlock";
import type { ProtocolUpdateHandlers } from "../../hooks/useProtocolUpdateHandlers";
import type { AppStyles } from "../../styles/appStyles";
import type { BreastStudyDraft } from "../../shared/breastDraft";
import type { FieldVisibility } from "../../settings/fieldVisibility";

type RenderBreastProps = {
  styles: AppStyles;
  activeSectionId: string | null;
  fieldVisibility: FieldVisibility;
  isLandscape?: boolean;
  activeBreastDraft: BreastStudyDraft;
  protocolUpdateHandlers: ProtocolUpdateHandlers;
};

export function renderBreast({
  styles,
  activeSectionId,
  fieldVisibility,
  isLandscape,
  activeBreastDraft,
  protocolUpdateHandlers,
}: RenderBreastProps) {
  return (
    <BreastProtocolBlock
      fieldVisibility={fieldVisibility}
      styles={styles}
      value={activeBreastDraft}
      activeSectionId={activeSectionId}
      isLandscape={isLandscape}
      onChange={protocolUpdateHandlers.updateBreastStudy}
    />
  );
}