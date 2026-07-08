import { View } from "react-native";

import { FieldEditorModal } from "../../components/FieldEditorModal";
import { ConclusionSamples } from "../../components/ConclusionSamples";
import type { ScrotumDraft } from "../../shared/scrotumDraft";
import type { AppStyles } from "../../styles/appStyles";
import type { FieldVisibility } from "../../settings/fieldVisibility";
import { CONCLUSION_SAMPLES } from "./scrotumFieldConfigs";
import { useScrotumDraft } from "./useScrotumDraft";
import { ScrotumTestisPanel } from "./ScrotumTestisPanel";
import { ScrotumConclusionPanel } from "./ScrotumConclusionPanel";

type ScrotumProtocolBlockProps = {
  styles: AppStyles;
  fieldVisibility: FieldVisibility;
  value: ScrotumDraft;
  onChange: (value: ScrotumDraft) => void;
  activeSectionId?: string | null;
};

export function ScrotumProtocolBlock({
  styles,
  fieldVisibility,
  value,
  onChange,
  activeSectionId,
}: ScrotumProtocolBlockProps) {
  const draftApi = useScrotumDraft(value, onChange);
  const fv = fieldVisibility as Record<string, boolean>;

  const isConclusionEditor = draftApi.editorState?.title === "Заключение органов мошонки";

  const activeTestisSide =
    activeSectionId === "scrotum.right_testis"
      ? "right"
      : activeSectionId === "scrotum.left_testis"
        ? "left"
        : null;

  const showConclusionSection = Boolean(
    !activeSectionId || activeSectionId === "scrotum.conclusion",
  );

  return (
    <>
      <FieldEditorModal
        visible={Boolean(draftApi.editorState)}
        title={draftApi.editorState?.title ?? ""}
        mode={draftApi.editorState?.mode ?? "text"}
        value={draftApi.editorState?.value ?? ""}
        options={draftApi.editorState?.options}
        placeholder={draftApi.editorState?.placeholder}
        multiline={draftApi.editorState?.multiline}
        footerContent={
          isConclusionEditor
            ? ({ value, setValue, close }) => (
                <ConclusionSamples
                  currentValue={value}
                  setValue={setValue}
                  close={close}
                  styles={styles}
                  samples={CONCLUSION_SAMPLES}
                />
              )
            : undefined
        }
        onCancel={draftApi.closeEditor}
        onSave={draftApi.saveEditor}
      />

      {activeSectionId === "scrotum.conclusion" ? null : activeTestisSide ? (
        <ScrotumTestisPanel
          styles={styles}
          side={activeTestisSide}
          testis={
            activeTestisSide === "right"
              ? draftApi.form.testis.rightTestis
              : draftApi.form.testis.leftTestis
          }
          fv={fv}
          openEditor={draftApi.openEditor}
          onUpdateTestisField={draftApi.updateTestisField}
        />
      ) : activeSectionId ? (
        <ScrotumTestisPanel
          styles={styles}
          side="right"
          testis={draftApi.form.testis.rightTestis}
          fv={fv}
          openEditor={draftApi.openEditor}
          onUpdateTestisField={draftApi.updateTestisField}
        />
      ) : (
        <>
          <ScrotumTestisPanel
            styles={styles}
            side="right"
            testis={draftApi.form.testis.rightTestis}
            fv={fv}
            openEditor={draftApi.openEditor}
            onUpdateTestisField={draftApi.updateTestisField}
          />
          <ScrotumTestisPanel
            styles={styles}
            side="left"
            testis={draftApi.form.testis.leftTestis}
            fv={fv}
            openEditor={draftApi.openEditor}
            onUpdateTestisField={draftApi.updateTestisField}
          />
        </>
      )}

      {showConclusionSection && fv["scrotum.conclusion"] !== false && (
        <ScrotumConclusionPanel
          styles={styles}
          conclusion={draftApi.form.conclusion}
          recommendations={draftApi.form.recommendations}
          openEditor={draftApi.openEditor}
          onUpdateForm={draftApi.updateForm}
        />
      )}
    </>
  );
}

export default ScrotumProtocolBlock;
