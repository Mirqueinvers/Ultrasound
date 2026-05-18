import { OmtMaleProtocolBlock } from "../omtMale/OmtMaleProtocolBlock";
import type { ProtocolUpdateHandlers } from "../../hooks/useProtocolUpdateHandlers";
import type { AppStyles } from "../../styles/appStyles";
import type { OmtMaleDraft } from "../../shared/omtMaleDraft";

type RenderOmtMaleProps = {
  styles: AppStyles;
  activeSectionId: string | null;
  activeOmtMaleDraft: OmtMaleDraft;
  protocolUpdateHandlers: ProtocolUpdateHandlers;
};

export function renderOmtMale({
  styles,
  activeSectionId,
  activeOmtMaleDraft,
  protocolUpdateHandlers,
}: RenderOmtMaleProps) {
  return (
    <OmtMaleProtocolBlock
      styles={styles}
      value={activeOmtMaleDraft}
      activeSectionId={activeSectionId}
      onChange={protocolUpdateHandlers.updateOmtMaleStudy}
    />
  );
}
