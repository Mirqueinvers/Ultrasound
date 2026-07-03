import { ObpProtocolBlock } from "../obp/ObpProtocolBlock";
import type { ObpDraftActions } from "../../protocols/obp/useObpDraftActions";
import type { AppStyles } from "../../styles/appStyles";
import type { ObpDraft } from "../../shared/obpDraft";

import type { FieldVisibility } from "../../settings/fieldVisibility";

type RenderObpProps = {
  styles: AppStyles;
  activeSectionId: string | null;
  fieldVisibility: FieldVisibility;
  activeObpDraft: ObpDraft;
  obpActions: ObpDraftActions;
};

export function renderObp({ styles, activeSectionId, fieldVisibility, activeObpDraft, obpActions }: RenderObpProps) {
  return (
    <ObpProtocolBlock
      styles={styles}
      activeSectionId={activeSectionId}
      fieldVisibility={fieldVisibility}
      obpDraft={activeObpDraft}
      onUpdateLiverField={obpActions.updateObpLiverField}
      onUpdateGallbladderField={obpActions.updateObpGallbladderField}
      onUpdateGallbladderConcretionsList={obpActions.updateObpGallbladderConcretionsList}
      onUpdateGallbladderPolypsList={obpActions.updateObpGallbladderPolypsList}
      onAddGallbladderConcretion={obpActions.addObpGallbladderConcretion}
      onAddGallbladderPolyp={obpActions.addObpGallbladderPolyp}
      onUpdatePancreasField={obpActions.updateObpPancreasField}
      onUpdateSpleenField={obpActions.updateObpSpleenField}
      onUpdateFreeFluidField={obpActions.updateObpFreeFluidField}
      onUpdateConclusionField={obpActions.updateObpConclusionField}
      onUpdateRecommendationsField={obpActions.updateObpRecommendationsField}
    />
  );
}
