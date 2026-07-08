import { KidneysProtocolBlock } from "../kidneys/KidneysProtocolBlock";
import type { ProtocolUpdateHandlers } from "../../hooks/useProtocolUpdateHandlers";
import type { AppStyles } from "../../styles/appStyles";
import type { KidneyStudyDraft } from "../../shared/kidneyDraft";
import type { FieldVisibility } from "../../settings/fieldVisibility";

type RenderKidneysProps = {
  styles: AppStyles;
  activeSectionId: string | null;
  fieldVisibility: FieldVisibility;
  isLandscape?: boolean;
  activeKidneyDraft: KidneyStudyDraft;
  protocolUpdateHandlers: ProtocolUpdateHandlers;
};

export function renderKidneys({
  styles,
  activeSectionId,
  fieldVisibility,
  isLandscape,
  activeKidneyDraft,
  protocolUpdateHandlers,
}: RenderKidneysProps) {
  return (
    <KidneysProtocolBlock
      fieldVisibility={fieldVisibility}
      styles={styles}
      value={activeKidneyDraft}
      onChange={protocolUpdateHandlers.updateKidneyStudy}
      activeSectionId={activeSectionId}
      isLandscape={isLandscape}
    />
  );
}
