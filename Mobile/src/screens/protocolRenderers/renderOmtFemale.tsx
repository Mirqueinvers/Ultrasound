import { OmtFemaleProtocolBlock } from "../omtFemale/OmtFemaleProtocolBlock";
import type { ProtocolUpdateHandlers } from "../../hooks/useProtocolUpdateHandlers";
import type { AppStyles } from "../../styles/appStyles";
import type { OmtFemaleDraft } from "../../shared/omtFemaleDraft";
import type { FieldVisibility } from "../../settings/fieldVisibility";

type RenderOmtFemaleProps = {
  styles: AppStyles;
  activeSectionId: string | null;
  fieldVisibility: FieldVisibility;
  activeOmtFemaleDraft: OmtFemaleDraft;
  protocolUpdateHandlers: ProtocolUpdateHandlers;
};

export function renderOmtFemale({
  styles,
  activeSectionId,
  fieldVisibility,
  activeOmtFemaleDraft,
  protocolUpdateHandlers,
}: RenderOmtFemaleProps) {
  return (
    <OmtFemaleProtocolBlock
      fieldVisibility={fieldVisibility}
      styles={styles}
      value={activeOmtFemaleDraft}
      onChange={protocolUpdateHandlers.updateOmtFemaleStudy}
      activeSectionId={activeSectionId}
    />
  );
}
