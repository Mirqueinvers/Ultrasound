import { KidneysProtocolBlock } from "../kidneys/KidneysProtocolBlock";
import type { ProtocolUpdateHandlers } from "../../hooks/useProtocolUpdateHandlers";
import type { AppStyles } from "../../styles/appStyles";
import type { KidneyStudyDraft } from "../../shared/kidneyDraft";

type RenderKidneysProps = {
  styles: AppStyles;
  activeSectionId: string | null;
  activeKidneyDraft: KidneyStudyDraft;
  protocolUpdateHandlers: ProtocolUpdateHandlers;
};

export function renderKidneys({
  styles,
  activeSectionId,
  activeKidneyDraft,
  protocolUpdateHandlers,
}: RenderKidneysProps) {
  return (
    <KidneysProtocolBlock
      styles={styles}
      value={activeKidneyDraft}
      onChange={protocolUpdateHandlers.updateKidneyStudy}
      activeSectionId={activeSectionId}
    />
  );
}
