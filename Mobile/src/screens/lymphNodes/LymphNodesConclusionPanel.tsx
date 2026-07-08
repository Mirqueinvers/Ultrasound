import { View } from "react-native";

import { ProtocolFieldRow } from "../../components/protocol/ProtocolFieldRow";
import { ProtocolOrganHeader } from "../../components/protocol/ProtocolHeaders";
import type { AppStyles } from "../../styles/appStyles";
import { type EditorState } from "./lymphNodesFieldConfigs";
import type { LymphNodesStudyDraft } from "../../shared/lymphNodesDraft";

type LymphNodesConclusionPanelProps = {
  styles: AppStyles;
  conclusion: string;
  recommendations: string;
  openEditor: (config: NonNullable<EditorState>) => void;
  onUpdateForm: (updater: (current: LymphNodesStudyDraft) => LymphNodesStudyDraft) => void;
};

export function LymphNodesConclusionPanel({
  styles,
  conclusion,
  recommendations,
  openEditor,
  onUpdateForm,
}: LymphNodesConclusionPanelProps) {
  return (
    <View style={styles.kidneyPlainSection}>
      <ProtocolOrganHeader title="Заключение" />
      <View style={styles.obpFieldList}>
        <ProtocolFieldRow
          label="Заключение"
          value={conclusion || "Введите заключение"}
          typeLabel="text"
          filled={Boolean(conclusion)}
          onPress={() =>
            openEditor({
              title: "Заключение лимфоузлов",
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
          value={recommendations || "Введите рекомендации"}
          typeLabel="text"
          filled={Boolean(recommendations)}
          onPress={() =>
            openEditor({
              title: "Рекомендации лимфоузлов",
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
