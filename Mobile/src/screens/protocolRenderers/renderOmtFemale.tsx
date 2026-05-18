import { OmtFemaleProtocolBlock } from "../omtFemale/OmtFemaleProtocolBlock";
import type { ProtocolUpdateHandlers } from "../../hooks/useProtocolUpdateHandlers";
import type { AppStyles } from "../../styles/appStyles";
import type { OmtFemaleDraft } from "../../shared/omtFemaleDraft";

type RenderOmtFemaleProps = {
  styles: AppStyles;
  activeOmtFemaleDraft: OmtFemaleDraft;
  protocolUpdateHandlers: ProtocolUpdateHandlers;
};

export function renderOmtFemale({
  styles,
  activeOmtFemaleDraft,
  protocolUpdateHandlers,
}: RenderOmtFemaleProps) {
  return (
    <OmtFemaleProtocolBlock
      styles={styles}
      value={activeOmtFemaleDraft}
      onChange={protocolUpdateHandlers.updateOmtFemaleStudy}
    />
  );
}
