import { OmtMaleProtocolBlock } from "../omtMale/OmtMaleProtocolBlock";
import type { ProtocolUpdateHandlers } from "../../hooks/useProtocolUpdateHandlers";
import type { AppStyles } from "../../styles/appStyles";
import type { OmtMaleDraft } from "../../shared/omtMaleDraft";

type RenderOmtMaleProps = {
  styles: AppStyles;
  activeOmtMaleDraft: OmtMaleDraft;
  protocolUpdateHandlers: ProtocolUpdateHandlers;
};

export function renderOmtMale({
  styles,
  activeOmtMaleDraft,
  protocolUpdateHandlers,
}: RenderOmtMaleProps) {
  return (
    <OmtMaleProtocolBlock
      styles={styles}
      value={activeOmtMaleDraft}
      onChange={protocolUpdateHandlers.updateOmtMaleStudy}
    />
  );
}
