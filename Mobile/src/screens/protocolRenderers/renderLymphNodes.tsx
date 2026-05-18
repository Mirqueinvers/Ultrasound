import { LymphNodesProtocolBlock } from "../lymphNodes/LymphNodesProtocolBlock";
import type { ProtocolUpdateHandlers } from "../../hooks/useProtocolUpdateHandlers";
import type { AppStyles } from "../../styles/appStyles";
import type { LymphNodesStudyDraft } from "../../shared/lymphNodesDraft";

type RenderLymphNodesProps = {
  styles: AppStyles;
  activeSectionId: string | null;
  activeLymphNodesDraft: LymphNodesStudyDraft;
  protocolUpdateHandlers: ProtocolUpdateHandlers;
};

export function renderLymphNodes({
  styles,
  activeSectionId,
  activeLymphNodesDraft,
  protocolUpdateHandlers,
}: RenderLymphNodesProps) {
  return (
    <LymphNodesProtocolBlock
      styles={styles}
      value={activeLymphNodesDraft}
      activeSectionId={activeSectionId}
      onChange={protocolUpdateHandlers.updateLymphNodesStudy}
    />
  );
}
