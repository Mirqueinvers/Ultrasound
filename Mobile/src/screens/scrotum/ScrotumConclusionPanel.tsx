import { View } from "react-native";

import { ProtocolFieldRow } from "../../components/protocol/ProtocolFieldRow";
import { ProtocolOrganHeader } from "../../components/protocol/ProtocolHeaders";
import type { AppStyles } from "../../styles/appStyles";
import { type EditorState } from "./scrotumFieldConfigs";
import type { ScrotumDraft } from "../../shared/scrotumDraft";

type ScrotumConclusionPanelProps = {
  styles: AppStyles;
  conclusion: string;
  recommendations: string;
  openEditor: (config: NonNullable<EditorState>) => void;
  onUpdateForm: (updater: (current: ScrotumDraft) => ScrotumDraft) => void;
};

export function ScrotumConclusionPanel({
  styles,
  conclusion,
  recommendations,
  openEditor,
  onUpdateForm,
}: ScrotumConclusionPanelProps) {
  return (
    <View style={styles.kidneyPlainSection}>
      <ProtocolOrganHeader title="Заключение" />
      <View style={styles.obpFieldList}>
        <ProtocolFieldRow
          label="Заключение"
          value={conclusion || "Нажмите для ввода"}
          typeLabel="text"
          filled={Boolean(conclusion)}
          onPress={() =>
            openEditor({
              title: "Заключение органов мошонки",
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
          onPress={() =>
            openEditor({
              title: "Рекомендации органов мошонки",
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
