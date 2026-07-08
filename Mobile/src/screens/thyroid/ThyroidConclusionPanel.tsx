import { View } from "react-native";

import { ProtocolFieldRow } from "../../components/protocol/ProtocolFieldRow";
import { ProtocolOrganHeader } from "../../components/protocol/ProtocolHeaders";
import type { AppStyles } from "../../styles/appStyles";
import { type EditorState } from "./thyroidFieldConfigs";
import type { ThyroidStudyDraft } from "../../shared/thyroidDraft";

type ThyroidConclusionPanelProps = {
  styles: AppStyles;
  conclusion: string;
  recommendations: string;
  isLandscape?: boolean;
  openEditor: (config: NonNullable<EditorState>) => void;
  onUpdateForm: (updater: (current: ThyroidStudyDraft) => ThyroidStudyDraft) => void;
};

export function ThyroidConclusionPanel({
  styles,
  conclusion,
  recommendations,
  isLandscape,
  openEditor,
  onUpdateForm,
}: ThyroidConclusionPanelProps) {
  return (
    <View style={styles.kidneyPlainSection}>
      <ProtocolOrganHeader title="Заключение" />
      <View style={styles.obpFieldList}>
        <ProtocolFieldRow
          label="Заключение"
          value={conclusion || "Нажмите для ввода"}
          typeLabel="text"
          filled={Boolean(conclusion)}
          compact={isLandscape}
          onPress={() =>
            openEditor({
              title: "Заключение щитовидной железы",
              mode: "text",
              value: conclusion,
              placeholder: "Введите заключение",
              multiline: true,
              onSave: (nextValue) =>
                onUpdateForm((current) => ({
                  ...current,
                  conclusion: nextValue,
                })),
            })
          }
        />
        <ProtocolFieldRow
          label="Рекомендации"
          value={recommendations || "Нажмите для ввода"}
          typeLabel="text"
          filled={Boolean(recommendations)}
          compact={isLandscape}
          onPress={() =>
            openEditor({
              title: "Рекомендации щитовидной железы",
              mode: "text",
              value: recommendations,
              placeholder: "Введите рекомендации",
              multiline: true,
              onSave: (nextValue) =>
                onUpdateForm((current) => ({
                  ...current,
                  recommendations: nextValue,
                })),
            })
          }
        />
      </View>
    </View>
  );
}