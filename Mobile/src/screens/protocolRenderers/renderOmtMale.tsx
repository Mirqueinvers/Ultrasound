import { OmtMaleProtocolBlock } from "../omtMale/OmtMaleProtocolBlock";
import type { ProtocolUpdateHandlers } from "../../hooks/useProtocolUpdateHandlers";
import type { AppStyles } from "../../styles/appStyles";
import type { OmtMaleDraft } from "../../shared/omtMaleDraft";
import type { FieldVisibility } from "../../settings/fieldVisibility";

type RenderOmtMaleProps = {
  styles: AppStyles;
  activeSectionId: string | null;
  fieldVisibility: FieldVisibility;
  isLandscape?: boolean;
  activeOmtMaleDraft: OmtMaleDraft;
  protocolUpdateHandlers: ProtocolUpdateHandlers;
};

export function renderOmtMale({
  styles,
  activeSectionId,
  fieldVisibility,
  isLandscape,
  activeOmtMaleDraft,
  protocolUpdateHandlers,
}: RenderOmtMaleProps) {
  return (
    <OmtMaleProtocolBlock
      fieldVisibility={fieldVisibility}
      styles={styles}
      value={activeOmtMaleDraft}
      activeSectionId={activeSectionId}
      isLandscape={isLandscape}
      onChange={protocolUpdateHandlers.updateOmtMaleStudy}
    />
  );
}