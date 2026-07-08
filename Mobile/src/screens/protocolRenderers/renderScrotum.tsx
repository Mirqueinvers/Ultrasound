import { ScrotumProtocolBlock } from "../scrotum/ScrotumProtocolBlock";
import type { ProtocolUpdateHandlers } from "../../hooks/useProtocolUpdateHandlers";
import type { AppStyles } from "../../styles/appStyles";
import type { ScrotumDraft } from "../../shared/scrotumDraft";
import type { FieldVisibility } from "../../settings/fieldVisibility";

type RenderScrotumProps = {
  styles: AppStyles;
  activeSectionId: string | null;
  fieldVisibility: FieldVisibility;
  isLandscape?: boolean;
  activeScrotumDraft: ScrotumDraft;
  protocolUpdateHandlers: ProtocolUpdateHandlers;
};

export function renderScrotum({
  styles,
  activeSectionId,
  fieldVisibility,
  isLandscape,
  activeScrotumDraft,
  protocolUpdateHandlers,
}: RenderScrotumProps) {
  return (
    <ScrotumProtocolBlock
      fieldVisibility={fieldVisibility}
      styles={styles}
      value={activeScrotumDraft}
      activeSectionId={activeSectionId}
      isLandscape={isLandscape}
      onChange={protocolUpdateHandlers.updateScrotumStudy}
    />
  );
}
