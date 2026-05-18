import { ScrotumProtocolBlock } from "../scrotum/ScrotumProtocolBlock";
import type { ProtocolUpdateHandlers } from "../../hooks/useProtocolUpdateHandlers";
import type { AppStyles } from "../../styles/appStyles";
import type { ScrotumDraft } from "../../shared/scrotumDraft";

type RenderScrotumProps = {
  styles: AppStyles;
  activeScrotumDraft: ScrotumDraft;
  protocolUpdateHandlers: ProtocolUpdateHandlers;
};

export function renderScrotum({
  styles,
  activeScrotumDraft,
  protocolUpdateHandlers,
}: RenderScrotumProps) {
  return (
    <ScrotumProtocolBlock
      styles={styles}
      value={activeScrotumDraft}
      onChange={protocolUpdateHandlers.updateScrotumStudy}
    />
  );
}
