import { View } from "react-native";

import { ProtocolFieldRow } from "../../components/protocol/ProtocolFieldRow";
import { ProtocolOrganHeader } from "../../components/protocol/ProtocolHeaders";
import type { AppStyles } from "../../styles/appStyles";
import { type EditorState } from "./breastFieldConfigs";

type BreastConclusionPanelProps = {
  styles: AppStyles;
  conclusion: string;
  recommendations: string;
  openEditor: (config: NonNullable<EditorState>) => void;
  onUpdateConclusion: (value: string) => void;
  onUpdateRecommendations: (value: string) => void;
};

export function BreastConclusionPanel({
  styles,
  conclusion,
  recommendations,
  openEditor,
  onUpdateConclusion,
  onUpdateRecommendations,
}: BreastConclusionPanelProps) {
  return (
    <View style={styles.kidneyPlainSection}>
      <ProtocolOrganHeader title="Заключение" />
      <View style={styles.obpFieldList}>
        <ProtocolFieldRow
          label="Заключение"
          value={conclusion || "Нажмите для ввода"}
          typeLabel="text"
          filled={Boolean(conclusion?.trim())}
          onPress={() =>
            openEditor({
              title: "Заключение молочных желез",
              mode: "text",
              value: conclusion,
              placeholder: "Введите заключение",
              multiline: true,
              onSave: onUpdateConclusion,
            })
          }
        />
        <ProtocolFieldRow
          label="Рекомендации"
          value={recommendations || "Нажмите для ввода"}
          typeLabel="text"
          filled={Boolean(recommendations?.trim())}
          onPress={() =>
            openEditor({
              title: "Рекомендации молочных желез",
              mode: "text",
              value: recommendations,
              placeholder: "Введите рекомендации",
              multiline: true,
              onSave: onUpdateRecommendations,
            })
          }
        />
      </View>
    </View>
  );
}
