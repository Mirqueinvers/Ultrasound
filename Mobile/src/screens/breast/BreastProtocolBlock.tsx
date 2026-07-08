import { View } from "react-native";

import { FieldEditorModal } from "../../components/FieldEditorModal";
import { ProtocolFieldRow } from "../../components/protocol/ProtocolFieldRow";
import { ProtocolSectionHeader } from "../../components/protocol/ProtocolHeaders";
import { formatDateForMobileDisplay } from "../../shared/formatDate";
import type { BreastStudyDraft } from "../../shared/breastDraft";
import type { AppStyles } from "../../styles/appStyles";
import type { FieldVisibility } from "../../settings/fieldVisibility";
import {
  BREAST_SECTION_IDS,
  BREAST_STRUCTURE_OPTIONS,
  parseDateInput,
  getDateEditorValue,
  resolveActiveBreastSection,
} from "./breastFieldConfigs";
import { useBreastDraft } from "./useBreastDraft";
import { BreastSidePanel } from "./BreastSidePanel";
import { BreastConclusionPanel } from "./BreastConclusionPanel";

type BreastProtocolBlockProps = {
  styles: AppStyles;
  fieldVisibility: FieldVisibility;
  value: BreastStudyDraft;
  onChange: (value: BreastStudyDraft) => void;
  activeSectionId?: string | null;
};

export function BreastProtocolBlock({
  styles,
  fieldVisibility,
  value,
  onChange,
  activeSectionId,
}: BreastProtocolBlockProps) {
  const draftApi = useBreastDraft(value, onChange);

  const breast = draftApi.form.breast;
  const fv = fieldVisibility as Record<string, boolean>;
  const resolvedActiveSectionId = resolveActiveBreastSection(activeSectionId);
  const showAllSections = resolvedActiveSectionId === null;

  const showLobeSections =
    showAllSections ||
    resolvedActiveSectionId === BREAST_SECTION_IDS.right ||
    resolvedActiveSectionId === BREAST_SECTION_IDS.left;

  const showRightSection =
    showAllSections || resolvedActiveSectionId === BREAST_SECTION_IDS.right;
  const showLeftSection =
    showAllSections || resolvedActiveSectionId === BREAST_SECTION_IDS.left;

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
        footerContent={draftApi.editorState?.footerContent}
        onCancel={draftApi.closeEditor}
        onSave={draftApi.saveEditor}
      />

      {(showAllSections || resolvedActiveSectionId === BREAST_SECTION_IDS.commonInfo) &&
        (fv["breast.lastMenstruationDate"] !== false || fv["breast.cycleDay"] !== false) && (
          <View style={styles.kidneyPlainSection}>
            <ProtocolSectionHeader title="Общая информация" />
            {fv["breast.lastMenstruationDate"] !== false && (
              <ProtocolFieldRow
                label="Дата последней менструации"
                value={formatDateForMobileDisplay(breast.lastMenstruationDate) || "Нажмите для ввода"}
                typeLabel="numpad"
                filled={Boolean(breast.lastMenstruationDate)}
                onPress={() =>
                  draftApi.openEditor({
                    title: "Дата последней менструации",
                    mode: "number",
                    value: getDateEditorValue(breast.lastMenstruationDate),
                    placeholder: "дд.мм.гггг",
                    onSave: (nextValue) =>
                      draftApi.updateBreastField("lastMenstruationDate", parseDateInput(nextValue)),
                  })
                }
              />
            )}
            {fv["breast.cycleDay"] !== false && (
              <ProtocolFieldRow
                label="День цикла"
                value={breast.cycleDay || "Рассчитывается автоматически"}
                typeLabel="auto"
                filled={Boolean(breast.cycleDay)}
                readonly
              />
            )}
          </View>
        )}

      {showLobeSections && (
        <>
          {showRightSection && (
            <BreastSidePanel
              styles={styles}
              side="right"
              breastSide={breast.rightBreast}
              fv={fv}
              openEditor={draftApi.openEditor}
              onUpdateSideField={draftApi.updateSideField}
              onAddNode={draftApi.addNode}
              onUpdateNodeField={draftApi.updateNodeField}
              onRemoveNode={draftApi.removeNode}
            />
          )}
          {showLeftSection && (
            <BreastSidePanel
              styles={styles}
              side="left"
              breastSide={breast.leftBreast}
              fv={fv}
              openEditor={draftApi.openEditor}
              onUpdateSideField={draftApi.updateSideField}
              onAddNode={draftApi.addNode}
              onUpdateNodeField={draftApi.updateNodeField}
              onRemoveNode={draftApi.removeNode}
            />
          )}
        </>
      )}

      {showLobeSections && fv["breast.structure"] !== false && (
        <View style={styles.kidneyPlainSection}>
          <ProtocolSectionHeader title="Структура молочных желез" />
          <ProtocolFieldRow
            label="Структура"
            value={breast.structure || "Нажмите для ввода"}
            typeLabel="select"
            filled={Boolean(breast.structure)}
            options={BREAST_STRUCTURE_OPTIONS}
            onSelectOption={(nextValue) =>
              draftApi.updateBreastField("structure", nextValue)
            }
          />
        </View>
      )}

      {(showAllSections || resolvedActiveSectionId === BREAST_SECTION_IDS.conclusion) &&
        fv["breast.conclusion"] !== false && (
          <BreastConclusionPanel
            styles={styles}
            conclusion={draftApi.form.conclusion}
            recommendations={draftApi.form.recommendations}
            openEditor={draftApi.openEditor}
            onUpdateConclusion={(value) =>
              draftApi.updateForm((current) => ({
                ...current,
                conclusion: value,
              }))
            }
            onUpdateRecommendations={(value) =>
              draftApi.updateForm((current) => ({
                ...current,
                recommendations: value,
              }))
            }
          />
        )}
    </>
  );
}

export default BreastProtocolBlock;