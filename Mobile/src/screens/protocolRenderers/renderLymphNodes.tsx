import { LymphNodesProtocolBlock } from "../lymphNodes/LymphNodesProtocolBlock";
import type { ProtocolUpdateHandlers } from "../../hooks/useProtocolUpdateHandlers";
import type { AppStyles } from "../../styles/appStyles";
import type { LymphNodesStudyDraft } from "../../shared/lymphNodesDraft";
import type { FieldVisibility } from "../../settings/fieldVisibility";

type RenderLymphNodesProps = {
  styles: AppStyles;
  activeSectionId: string | null;
  fieldVisibility: FieldVisibility;
  activeLymphNodesDraft: LymphNodesStudyDraft;
  protocolUpdateHandlers: ProtocolUpdateHandlers;
};

export function renderLymphNodes({
  styles,
  activeSectionId,
  fieldVisibility,
  activeLymphNodesDraft,
  protocolUpdateHandlers,
}: RenderLymphNodesProps) {
  return (
    <LymphNodesProtocolBlock
      fieldVisibility={fieldVisibility}
      styles={styles}
      value={activeLymphNodesDraft}
      activeSectionId={activeSectionId}
      onChange={protocolUpdateHandlers.updateLymphNodesStudy}
    />
  );
}