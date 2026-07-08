import { View } from "react-native";

import { ProtocolFieldRow } from "../../components/protocol/ProtocolFieldRow";
import { ProtocolOrganHeader } from "../../components/protocol/ProtocolHeaders";
import type { AppStyles } from "../../styles/appStyles";
import { type EditorState } from "./omtMaleFieldConfigs";
import type { OmtMaleDraft } from "../../shared/omtMaleDraft";

type OmtMaleConclusionPanelProps = {
  styles: AppStyles;
  conclusion: string;
  recommendations: string;
  openEditor: (config: NonNullable<EditorState>) => void;
  onUpdateForm: (updater: (current: OmtMaleDraft) => OmtMaleDraft) => void;
};

export function OmtMaleConclusionPanel({
  styles,
  conclusion,
  recommendations,
  openEditor,
  onUpdateForm,
}: OmtMaleConclusionPanelProps) {
  return (
    <View style={styles.kidneyPlainSection}>
      <ProtocolOrganHeader title="Заключение" />
      <View style={styles.obpFieldList}>
        <ProtocolFieldRow label="Заключение" value={conclusion || "Нажмите для ввода"}
          typeLabel="text" filled={Boolean(conclusion)}
          onPress={() => openEditor({ title: "Заключение ОМТ (М)", mode: "text", value: conclusion, placeholder: "Введите заключение", multiline: true, onSave: (v) => onUpdateForm((c) => ({ ...c, conclusion: v })) })}
        />
        <ProtocolFieldRow label="Рекомендации" value={recommendations || "Нажмите для ввода"}
          typeLabel="text" filled={Boolean(recommendations)}
          onPress={() => openEditor({ title: "Рекомендации ОМТ (М)", mode: "text", value: recommendations, placeholder: "Введите рекомендации", multiline: true, onSave: (v) => onUpdateForm((c) => ({ ...c, recommendations: v })) })}
        />
      </View>
    </View>
  );
}
