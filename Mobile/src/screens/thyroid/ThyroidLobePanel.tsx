import { Text, View } from "react-native";

import { ProtocolActionButton } from "../../components/protocol/ProtocolActionButton";
import { ProtocolFieldRow } from "../../components/protocol/ProtocolFieldRow";
import { ProtocolOrganHeader, ProtocolSectionHeader } from "../../components/protocol/ProtocolHeaders";
import type { ThyroidLobeDraft } from "../../shared/thyroidDraft";
import { isNormalizedMatch } from "../../shared/normalizeSelectValue";
import type { AppStyles } from "../../styles/appStyles";
import {
  THYROID_VOLUME_FORMATIONS_OPTIONS,
  type EditorState,
} from "./thyroidFieldConfigs";
import { ThyroidNodeCard } from "./ThyroidNodeCard";
import type { ThyroidNodeDraft } from "../../shared/thyroidDraft";

type ThyroidLobePanelProps = {
  styles: AppStyles;
  side: "right" | "left";
  lobe: ThyroidLobeDraft;
  activeSectionId: string | null | undefined;
  fv: Record<string, boolean>;
  openEditor: (config: NonNullable<EditorState>) => void;
  onUpdateLobeField: (side: "right" | "left", field: keyof ThyroidLobeDraft, value: string) => void;
  onAddNode: (side: "right" | "left") => void;
  onUpdateNodeField: (side: "right" | "left", index: number, field: keyof ThyroidNodeDraft, value: string) => void;
  onRemoveNode: (side: "right" | "left", index: number) => void;
};

export function ThyroidLobePanel({
  styles,
  side,
  lobe,
  activeSectionId,
  fv,
  openEditor,
  onUpdateLobeField,
  onAddNode,
  onUpdateNodeField,
  onRemoveNode,
}: ThyroidLobePanelProps) {
  const title = side === "right" ? "Правая доля" : "Левая доля";
  const showNodes = isNormalizedMatch(lobe.volumeFormations, "определяются");
  const sectionId = side === "right" ? "thyroid.right_lobe" : "thyroid.left_lobe";

  if (activeSectionId && activeSectionId !== sectionId) {
    return null;
  }

  return (
    <View style={styles.kidneyPlainSection} key={side}>
      <ProtocolOrganHeader title={title} />

      <View style={styles.obpFieldList}>
        {fv["thyroid.lobe.sizes"] !== false && (
          <>
            <ProtocolSectionHeader title="Размеры" />
            <ProtocolFieldRow
              label="Длина (мм)"
              value={lobe.length || "Нажмите для ввода"}
              typeLabel="numpad"
              filled={Boolean(lobe.length)}
              onPress={() =>
                openEditor({
                  title: `${title}: длина`,
                  mode: "number",
                  value: lobe.length,
                  placeholder: "мм",
                  onSave: (nextValue) => onUpdateLobeField(side, "length", nextValue),
                })
              }
            />
            <ProtocolFieldRow
              label="Ширина (мм)"
              value={lobe.width || "Нажмите для ввода"}
              typeLabel="numpad"
              filled={Boolean(lobe.width)}
              onPress={() =>
                openEditor({
                  title: `${title}: ширина`,
                  mode: "number",
                  value: lobe.width,
                  placeholder: "мм",
                  onSave: (nextValue) => onUpdateLobeField(side, "width", nextValue),
                })
              }
            />
            <ProtocolFieldRow
              label="Глубина (мм)"
              value={lobe.depth || "Нажмите для ввода"}
              typeLabel="numpad"
              filled={Boolean(lobe.depth)}
              onPress={() =>
                openEditor({
                  title: `${title}: глубина`,
                  mode: "number",
                  value: lobe.depth,
                  placeholder: "мм",
                  onSave: (nextValue) => onUpdateLobeField(side, "depth", nextValue),
                })
              }
            />
            <ProtocolFieldRow
              label="Объем (мл)"
              value={lobe.volume || "Рассчитывается автоматически"}
              typeLabel="auto"
              filled={Boolean(lobe.volume)}
              readonly
            />
          </>
        )}

        <ProtocolSectionHeader title="Объемные образования" />
        <ProtocolFieldRow
          label="Определение"
          value={lobe.volumeFormations || "Нажмите для ввода"}
          typeLabel="select"
          filled={Boolean(lobe.volumeFormations)}
          options={THYROID_VOLUME_FORMATIONS_OPTIONS}
          onSelectOption={(nextValue) => onUpdateLobeField(side, "volumeFormations", nextValue)}
        />

        {showNodes && (
          <View style={styles.obpFieldList}>
            {lobe.nodesList.length === 0 ? (
              <Text style={styles.helperText}>Добавьте хотя бы один узел.</Text>
            ) : (
              lobe.nodesList.map((node, index) => (
                <ThyroidNodeCard
                  key={`${side}-thyroid-node-${index}`}
                  styles={styles}
                  node={node}
                  index={index}
                  side={side}
                  openEditor={openEditor}
                  onUpdateNodeField={onUpdateNodeField}
                  onRemoveNode={onRemoveNode}
                />
              ))
            )}

            <ProtocolActionButton
              label="+ Узел"
              onPress={() => onAddNode(side)}
            />
          </View>
        )}

        {fv["thyroid.additional"] !== false && (
          <>
            <ProtocolSectionHeader title="Дополнительно" />
            <ProtocolFieldRow
              label="Дополнительно"
              value={lobe.additional || "Нажмите для ввода"}
              typeLabel="text"
              filled={Boolean(lobe.additional)}
              onPress={() =>
                openEditor({
                  title: `${title}: дополнительно`,
                  mode: "text",
                  value: lobe.additional,
                  placeholder: "Введите дополнительное описание",
                  multiline: true,
                  onSave: (nextValue) => onUpdateLobeField(side, "additional", nextValue),
                })
              }
            />
          </>
        )}
      </View>
    </View>
  );
}
