import { ObpProtocolBlock } from "../obp/ObpProtocolBlock";
import type { ObpDraftActions } from "../../protocols/obp/useObpDraftActions";
import type { AppStyles } from "../../styles/appStyles";
import type { ObpDraft } from "../../shared/obpDraft";

type RenderObpProps = {
  styles: AppStyles;
  activeObpDraft: ObpDraft;
  obpActions: ObpDraftActions;
};

export function renderObp({ styles, activeObpDraft, obpActions }: RenderObpProps) {
  return (
    <ObpProtocolBlock
      styles={styles}
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
