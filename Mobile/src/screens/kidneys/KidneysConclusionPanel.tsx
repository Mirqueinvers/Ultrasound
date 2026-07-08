import { View } from "react-native";

import { ProtocolFieldRow } from "../../components/protocol/ProtocolFieldRow";
import { ProtocolOrganHeader } from "../../components/protocol/ProtocolHeaders";
import type { AppStyles } from "../../styles/appStyles";
import { type EditorState } from "./kidneysFieldConfigs";
import type { KidneysProducer } from "./useKidneysDraft";

type KidneysConclusionPanelProps = {
  styles: AppStyles;
  conclusion: string;
  recommendations: string;
  isLandscape?: boolean;
  openEditor: (config: NonNullable<EditorState>) => void;
  onUpdateStudy: (producer: KidneysProducer) => void;
};

export function KidneysConclusionPanel({
  styles,
  conclusion,
  recommendations,
  isLandscape,
  openEditor,
  onUpdateStudy,
}: KidneysConclusionPanelProps) {
  return (
    <View style={styles.obpFieldList}>
      <ProtocolOrganHeader title="Заключение почек" />

      <ProtocolFieldRow
        label="Заключение почек"
        value={conclusion || "Нажмите для ввода"}
        typeLabel="text"
        filled={conclusion.trim().length > 0}
        compact={isLandscape}
        onPress={() =>
          openEditor({
            title: "Заключение почек",
            mode: "text",
            value: conclusion,
            placeholder: "Введите заключение",
            multiline: true,
            onSave: (nextValue) =>
              onUpdateStudy((current) => ({
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
        filled={recommendations.trim().length > 0}
        compact={isLandscape}
        onPress={() =>
          openEditor({
            title: "Рекомендации почек",
            mode: "text",
            value: recommendations,
            placeholder: "Введите рекомендации",
            multiline: true,
            onSave: (nextValue) =>
              onUpdateStudy((current) => ({
                ...current,
                recommendations: nextValue,
              })),
          })
        }
      />
    </View>
  );
}
