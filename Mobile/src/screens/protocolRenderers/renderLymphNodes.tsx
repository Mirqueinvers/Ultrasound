import { LymphNodesProtocolBlock } from "../lymphNodes/LymphNodesProtocolBlock";
import type { ProtocolUpdateHandlers } from "../../hooks/useProtocolUpdateHandlers";
import type { AppStyles } from "../../styles/appStyles";
import type { LymphNodesStudyDraft } from "../../shared/lymphNodesDraft";

type RenderLymphNodesProps = {
  styles: AppStyles;
  activeLymphNodesDraft: LymphNodesStudyDraft;
  protocolUpdateHandlers: ProtocolUpdateHandlers;
};

export function renderLymphNodes({
  styles,
  activeLymphNodesDraft,
  protocolUpdateHandlers,
}: RenderLymphNodesProps) {
  return (
    <LymphNodesProtocolBlock
      styles={styles}
      value={activeLymphNodesDraft}
      onChange={protocolUpdateHandlers.updateLymphNodesStudy}
    />
  );
}
