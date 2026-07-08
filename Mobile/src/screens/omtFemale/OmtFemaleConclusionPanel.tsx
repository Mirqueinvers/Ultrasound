import { View } from "react-native";

import { ProtocolFieldRow } from "../../components/protocol/ProtocolFieldRow";
import { ProtocolOrganHeader } from "../../components/protocol/ProtocolHeaders";
import type { AppStyles } from "../../styles/appStyles";
import { type EditorState } from "./omtFemaleFieldConfigs";
import type { OmtFemaleDraft } from "../../shared/omtFemaleDraft";

type OmtFemaleConclusionPanelProps = {
  styles: AppStyles;
  conclusion: string;
  recommendations: string;
  openEditor: (config: NonNullable<EditorState>) => void;
  onUpdateForm: (updater: (current: OmtFemaleDraft) => OmtFemaleDraft) => void;
};

export function OmtFemaleConclusionPanel({
  styles, conclusion, recommendations, openEditor, onUpdateForm,
}: OmtFemaleConclusionPanelProps) {
  return (
    <View style={styles.kidneyPlainSection}>
      <ProtocolOrganHeader title="Заключение" />
      <View style={styles.obpFieldList}>
        <ProtocolFieldRow label="Заключение" value={conclusion || "Нажмите для ввода"} typeLabel="text" filled={Boolean(conclusion)}
          onPress={() => openEditor({ title: "Заключение ОМТ (Ж)", mode: "text", value: conclusion, placeholder: "Введите заключение", multiline: true, onSave: (v) => onUpdateForm((c) => ({ ...c, conclusion: v })) })} />
        <ProtocolFieldRow label="Рекомендации" value={recommendations || "Нажмите для ввода"} typeLabel="text" filled={Boolean(recommendations)}
          onPress={() => openEditor({ title: "Рекомендации ОМТ (Ж)", mode: "text", value: recommendations, placeholder: "Введите рекомендации", multiline: true, onSave: (v) => onUpdateForm((c) => ({ ...c, recommendations: v })) })} />
      </View>
    </View>
  );
}
