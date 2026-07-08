import { View } from "react-native";

import { FieldEditorModal } from "../../components/FieldEditorModal";
import { ProtocolOrganHeader } from "../../components/protocol/ProtocolHeaders";
import type { LymphNodesStudyDraft } from "../../shared/lymphNodesDraft";
import type { AppStyles } from "../../styles/appStyles";
import type { FieldVisibility } from "../../settings/fieldVisibility";
import { REGION_FIELDS } from "./lymphNodesFieldConfigs";
import { useLymphNodesDraft } from "./useLymphNodesDraft";
import { LymphNodeRegionCard } from "./LymphNodeRegionCard";
import { LymphNodesConclusionPanel } from "./LymphNodesConclusionPanel";

type LymphNodesProtocolBlockProps = {
  styles: AppStyles;
  fieldVisibility: FieldVisibility;
  value: LymphNodesStudyDraft;
  onChange: (value: LymphNodesStudyDraft) => void;
  activeSectionId?: string | null;
};

export function LymphNodesProtocolBlock({
  styles,
  fieldVisibility,
  value,
  onChange,
  activeSectionId,
}: LymphNodesProtocolBlockProps) {
  const draftApi = useLymphNodesDraft(value, onChange);

  const lymphNodes = draftApi.form.lymphNodes;
  const fv = fieldVisibility as Record<string, boolean>;
  const activeRegionKey =
    activeSectionId === "lymph_nodes.submandibular"
      ? "submandibular"
      : activeSectionId === "lymph_nodes.cervical"
        ? "cervical"
        : activeSectionId === "lymph_nodes.subclavian"
          ? "subclavian"
          : activeSectionId === "lymph_nodes.supraclavicular"
            ? "supraclavicular"
            : activeSectionId === "lymph_nodes.axillary"
              ? "axillary"
              : activeSectionId === "lymph_nodes.inguinal"
                ? "inguinal"
                : null;

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

      <View style={styles.kidneyPlainSection}>
        <ProtocolOrganHeader title="Лимфатические узлы" />
      </View>

      {activeSectionId === "lymph_nodes.conclusion" ? null : activeRegionKey ? (
        <View style={styles.kidneyPlainSection}>
          <LymphNodeRegionCard
            styles={styles}
            regionKey={activeRegionKey}
            title={REGION_FIELDS.find((item) => item.key === activeRegionKey)?.title ?? ""}
            region={lymphNodes[activeRegionKey]}
            fv={fv}
            openEditor={draftApi.openEditor}
            onUpdateRegionField={draftApi.updateRegionField}
            onAddNode={draftApi.addNode}
            onUpdateNodeField={draftApi.updateNodeField}
            onRemoveNode={draftApi.removeNode}
          />
        </View>
      ) : activeSectionId ? (
        <View style={styles.kidneyPlainSection}>
          <LymphNodeRegionCard
            styles={styles}
            regionKey="submandibular"
            title={REGION_FIELDS[0].title}
            region={lymphNodes.submandibular}
            fv={fv}
            openEditor={draftApi.openEditor}
            onUpdateRegionField={draftApi.updateRegionField}
            onAddNode={draftApi.addNode}
            onUpdateNodeField={draftApi.updateNodeField}
            onRemoveNode={draftApi.removeNode}
          />
        </View>
      ) : (
        REGION_FIELDS.map(({ key, title }) => (
          <View key={key} style={styles.kidneyPlainSection}>
            <LymphNodeRegionCard
              styles={styles}
              regionKey={key}
              title={title}
              region={lymphNodes[key]}
              fv={fv}
              openEditor={draftApi.openEditor}
              onUpdateRegionField={draftApi.updateRegionField}
              onAddNode={draftApi.addNode}
              onUpdateNodeField={draftApi.updateNodeField}
              onRemoveNode={draftApi.removeNode}
            />
          </View>
        ))
      )}

      {(!activeSectionId || activeSectionId === "lymph_nodes.conclusion") &&
        fv["lymph_nodes.conclusion"] !== false && (
          <LymphNodesConclusionPanel
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

export default LymphNodesProtocolBlock;
