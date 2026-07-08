import { View } from "react-native";

import { ProtocolFieldRow } from "../../components/protocol/ProtocolFieldRow";
import { ProtocolOrganHeader, ProtocolSectionHeader } from "../../components/protocol/ProtocolHeaders";
import type { SingleTestisDraft } from "../../shared/scrotumDraft";
import { isNormalizedMatch } from "../../shared/normalizeSelectValue";
import type { AppStyles } from "../../styles/appStyles";
import {
  APPENDAGE_OPTIONS,
  BLOOD_FLOW_OPTIONS,
  CAPSULE_OPTIONS,
  CONTOUR_OPTIONS,
  ECHOGENICITY_OPTIONS,
  ECHOTEXTURE_OPTIONS,
  FLUID_AMOUNT_OPTIONS,
  LOCATION_OPTIONS,
  MEDIASTINUM_OPTIONS,
  type EditorState,
} from "./scrotumFieldConfigs";

type ScrotumTestisPanelProps = {
  styles: AppStyles;
  side: "right" | "left";
  testis: SingleTestisDraft;
  fv: Record<string, boolean>;
  openEditor: (config: NonNullable<EditorState>) => void;
  onUpdateTestisField: (side: "right" | "left", field: keyof SingleTestisDraft, value: string) => void;
};

export function ScrotumTestisPanel({
  styles,
  side,
  testis,
  fv,
  openEditor,
  onUpdateTestisField,
}: ScrotumTestisPanelProps) {
  const title = side === "right" ? "Правое яичко" : "Левое яичко";

  const showCapsuleText = isNormalizedMatch(testis.capsule, "изменена");
  const showEchotextureText = isNormalizedMatch(testis.echotexture, "неоднородная");
  const showMediastinumText = isNormalizedMatch(testis.mediastinum, "изменена");
  const showAppendageText = isNormalizedMatch(testis.appendage, "изменен");
  const showFluidAmountText = isNormalizedMatch(testis.fluidAmount, "увеличено");

  return (
    <View style={styles.kidneyPlainSection}>
      <ProtocolOrganHeader title={title} />
      <View style={styles.obpFieldList}>
        <>
          {(fv["scrotum.length"] !== false || fv["scrotum.width"] !== false || fv["scrotum.depth"] !== false || fv["scrotum.volume"] !== false) && (
            <ProtocolSectionHeader title="Размеры" />
          )}
          {fv["scrotum.length"] !== false && (
            <ProtocolFieldRow
              label="Длина (мм)"
              value={testis.length || "Нажмите для ввода"}
              typeLabel="numpad"
              filled={Boolean(testis.length)}
              onPress={() =>
                openEditor({
                  title: `${title}: длина`,
                  mode: "number",
                  value: testis.length,
                  placeholder: "мм",
                  onSave: (nextValue) => onUpdateTestisField(side, "length", nextValue),
                })
              }
            />
          )}
          {fv["scrotum.width"] !== false && (
            <ProtocolFieldRow
              label="Ширина (мм)"
              value={testis.width || "Нажмите для ввода"}
              typeLabel="numpad"
              filled={Boolean(testis.width)}
              onPress={() =>
                openEditor({
                  title: `${title}: ширина`,
                  mode: "number",
                  value: testis.width,
                  placeholder: "мм",
                  onSave: (nextValue) => onUpdateTestisField(side, "width", nextValue),
                })
              }
            />
          )}
          {fv["scrotum.depth"] !== false && (
            <ProtocolFieldRow
              label="Глубина (мм)"
              value={testis.depth || "Нажмите для ввода"}
              typeLabel="numpad"
              filled={Boolean(testis.depth)}
              onPress={() =>
                openEditor({
                  title: `${title}: глубина`,
                  mode: "number",
                  value: testis.depth,
                  placeholder: "мм",
                  onSave: (nextValue) => onUpdateTestisField(side, "depth", nextValue),
                })
              }
            />
          )}
          {fv["scrotum.volume"] !== false && (
            <ProtocolFieldRow
              label="Объем (см³)"
              value={testis.volume || "Рассчитывается автоматически"}
              typeLabel="auto"
              filled={Boolean(testis.volume)}
              readonly
            />
          )}
        </>

        {fv["scrotum.location"] !== false && (
          <>
            <ProtocolSectionHeader title="Расположение" />
            <ProtocolFieldRow
              label="Расположение"
              value={testis.location || "Нажмите для ввода"}
              typeLabel="select"
              filled={Boolean(testis.location)}
              options={LOCATION_OPTIONS}
              onSelectOption={(nextValue) => onUpdateTestisField(side, "location", nextValue)}
            />
          </>
        )}

        {fv["scrotum.contour"] !== false && (
          <>
            <ProtocolSectionHeader title="Контур" />
            <ProtocolFieldRow
              label="Контур"
              value={testis.contour || "Нажмите для ввода"}
              typeLabel="select"
              filled={Boolean(testis.contour)}
              options={CONTOUR_OPTIONS}
              onSelectOption={(nextValue) => onUpdateTestisField(side, "contour", nextValue)}
            />
          </>
        )}

        <>
          {(fv["scrotum.capsule"] !== false || fv["scrotum.capsuleText"] !== false) && (
            <ProtocolSectionHeader title="Капсула" />
          )}
          {fv["scrotum.capsule"] !== false && (
            <ProtocolFieldRow
              label="Капсула"
              value={testis.capsule || "Нажмите для ввода"}
              typeLabel="select"
              filled={Boolean(testis.capsule)}
              options={CAPSULE_OPTIONS}
              onSelectOption={(nextValue) => onUpdateTestisField(side, "capsule", nextValue)}
            />
          )}
          {showCapsuleText && fv["scrotum.capsuleText"] !== false && (
            <ProtocolFieldRow
              label="Описание"
              value={testis.capsuleText || "Нажмите для ввода"}
              typeLabel="text"
              filled={Boolean(testis.capsuleText)}
              onPress={() =>
                openEditor({
                  title: `${title}: описание капсулы`,
                  mode: "text",
                  value: testis.capsuleText,
                  placeholder: "Введите описание",
                  multiline: true,
                  onSave: (nextValue) => onUpdateTestisField(side, "capsuleText", nextValue),
                })
              }
            />
          )}
        </>

        {fv["scrotum.echogenicity"] !== false && (
          <>
            <ProtocolSectionHeader title="Эхогенность" />
            <ProtocolFieldRow
              label="Эхогенность"
              value={testis.echogenicity || "Нажмите для ввода"}
              typeLabel="select"
              filled={Boolean(testis.echogenicity)}
              options={ECHOGENICITY_OPTIONS}
              onSelectOption={(nextValue) => onUpdateTestisField(side, "echogenicity", nextValue)}
            />
          </>
        )}

        <>
          {(fv["scrotum.echotexture"] !== false || fv["scrotum.echotextureText"] !== false) && (
            <ProtocolSectionHeader title="Эхоструктура" />
          )}
          {fv["scrotum.echotexture"] !== false && (
            <ProtocolFieldRow
              label="Эхоструктура"
              value={testis.echotexture || "Нажмите для ввода"}
              typeLabel="select"
              filled={Boolean(testis.echotexture)}
              options={ECHOTEXTURE_OPTIONS}
              onSelectOption={(nextValue) => onUpdateTestisField(side, "echotexture", nextValue)}
            />
          )}
          {showEchotextureText && fv["scrotum.echotextureText"] !== false && (
            <ProtocolFieldRow
              label="Описание"
              value={testis.echotextureText || "Нажмите для ввода"}
              typeLabel="text"
              filled={Boolean(testis.echotextureText)}
              onPress={() =>
                openEditor({
                  title: `${title}: описание эхоструктуры`,
                  mode: "text",
                  value: testis.echotextureText,
                  placeholder: "Введите описание",
                  multiline: true,
                  onSave: (nextValue) => onUpdateTestisField(side, "echotextureText", nextValue),
                })
              }
            />
          )}
        </>

        <>
          {(fv["scrotum.mediastinum"] !== false || fv["scrotum.mediastinumText"] !== false) && (
            <ProtocolSectionHeader title="Структура средостения" />
          )}
          {fv["scrotum.mediastinum"] !== false && (
            <ProtocolFieldRow
              label="Структура средостения"
              value={testis.mediastinum || "Нажмите для ввода"}
              typeLabel="select"
              filled={Boolean(testis.mediastinum)}
              options={MEDIASTINUM_OPTIONS}
              onSelectOption={(nextValue) => onUpdateTestisField(side, "mediastinum", nextValue)}
            />
          )}
          {showMediastinumText && fv["scrotum.mediastinumText"] !== false && (
            <ProtocolFieldRow
              label="Описание"
              value={testis.mediastinumText || "Нажмите для ввода"}
              typeLabel="text"
              filled={Boolean(testis.mediastinumText)}
              onPress={() =>
                openEditor({
                  title: `${title}: описание средостения`,
                  mode: "text",
                  value: testis.mediastinumText,
                  placeholder: "Введите описание",
                  multiline: true,
                  onSave: (nextValue) => onUpdateTestisField(side, "mediastinumText", nextValue),
                })
              }
            />
          )}
        </>

        {fv["scrotum.bloodFlow"] !== false && (
          <>
            <ProtocolSectionHeader title="Кровоток в яичке" />
            <ProtocolFieldRow
              label="Кровоток"
              value={testis.bloodFlow || "Нажмите для ввода"}
              typeLabel="select"
              filled={Boolean(testis.bloodFlow)}
              options={BLOOD_FLOW_OPTIONS}
              onSelectOption={(nextValue) => onUpdateTestisField(side, "bloodFlow", nextValue)}
            />
          </>
        )}

        <>
          {(fv["scrotum.appendage"] !== false || fv["scrotum.appendageText"] !== false) && (
            <ProtocolSectionHeader title="Придаток яичка" />
          )}
          {fv["scrotum.appendage"] !== false && (
            <ProtocolFieldRow
              label="Придаток"
              value={testis.appendage || "Нажмите для ввода"}
              typeLabel="select"
              filled={Boolean(testis.appendage)}
              options={APPENDAGE_OPTIONS}
              onSelectOption={(nextValue) => onUpdateTestisField(side, "appendage", nextValue)}
            />
          )}
          {showAppendageText && fv["scrotum.appendageText"] !== false && (
            <ProtocolFieldRow
              label="Описание"
              value={testis.appendageText || "Нажмите для ввода"}
              typeLabel="text"
              filled={Boolean(testis.appendageText)}
              onPress={() =>
                openEditor({
                  title: `${title}: описание придатка`,
                  mode: "text",
                  value: testis.appendageText,
                  placeholder: "Введите описание",
                  multiline: true,
                  onSave: (nextValue) => onUpdateTestisField(side, "appendageText", nextValue),
                })
              }
            />
          )}
        </>

        <>
          {(fv["scrotum.fluidAmount"] !== false || fv["scrotum.fluidAmountText"] !== false) && (
            <ProtocolSectionHeader title="Количество жидкости в оболочках" />
          )}
          {fv["scrotum.fluidAmount"] !== false && (
            <ProtocolFieldRow
              label="Количество жидкости"
              value={testis.fluidAmount || "Нажмите для ввода"}
              typeLabel="select"
              filled={Boolean(testis.fluidAmount)}
              options={FLUID_AMOUNT_OPTIONS}
              onSelectOption={(nextValue) => onUpdateTestisField(side, "fluidAmount", nextValue)}
            />
          )}
          {showFluidAmountText && fv["scrotum.fluidAmountText"] !== false && (
            <ProtocolFieldRow
              label="Описание"
              value={testis.fluidAmountText || "Нажмите для ввода"}
              typeLabel="text"
              filled={Boolean(testis.fluidAmountText)}
              onPress={() =>
                openEditor({
                  title: `${title}: описание жидкости`,
                  mode: "text",
                  value: testis.fluidAmountText,
                  placeholder: "Введите описание",
                  multiline: true,
                  onSave: (nextValue) => onUpdateTestisField(side, "fluidAmountText", nextValue),
                })
              }
            />
          )}
        </>

        {fv["scrotum.additional"] !== false && (
          <>
            <ProtocolSectionHeader title="Дополнительно" />
            <ProtocolFieldRow
              label="Дополнительно"
              value={testis.additional || "Нажмите для ввода"}
              typeLabel="text"
              filled={Boolean(testis.additional)}
              onPress={() =>
                openEditor({
                  title: `${title}: дополнительно`,
                  mode: "text",
                  value: testis.additional,
                  placeholder: "Введите дополнительное описание",
                  multiline: true,
                  onSave: (nextValue) => onUpdateTestisField(side, "additional", nextValue),
                })
              }
            />
          </>
        )}
      </View>
    </View>
  );
}
