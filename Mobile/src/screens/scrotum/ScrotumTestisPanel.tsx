import { useCallback, useMemo, useRef } from "react";
import { View } from "react-native";

import { InlineNumpad } from "../../components/InlineNumpad";
import { ProtocolFieldRow } from "../../components/protocol/ProtocolFieldRow";
import { ProtocolOrganHeader, ProtocolSectionHeader } from "../../components/protocol/ProtocolHeaders";
import { useInlineNumpad } from "../../hooks/useInlineNumpad";
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
  isLandscape?: boolean;
  openEditor: (config: NonNullable<EditorState>) => void;
  onUpdateTestisField: (side: "right" | "left", field: keyof SingleTestisDraft, value: string) => void;
};

/** Поля-селекты (и зависимые text-поля) для сетки 2 колонки */
const SELECT_FIELDS = [
  { key: "location", label: "Расположение", fvKey: "scrotum.location", options: LOCATION_OPTIONS },
  { key: "contour", label: "Контур", fvKey: "scrotum.contour", options: CONTOUR_OPTIONS },
  { key: "capsule", label: "Капсула", fvKey: "scrotum.capsule", options: CAPSULE_OPTIONS },
  { key: "echogenicity", label: "Эхогенность", fvKey: "scrotum.echogenicity", options: ECHOGENICITY_OPTIONS },
  { key: "echotexture", label: "Эхоструктура", fvKey: "scrotum.echotexture", options: ECHOTEXTURE_OPTIONS },
  { key: "mediastinum", label: "Средостение", fvKey: "scrotum.mediastinum", options: MEDIASTINUM_OPTIONS },
  { key: "bloodFlow", label: "Кровоток", fvKey: "scrotum.bloodFlow", options: BLOOD_FLOW_OPTIONS },
  { key: "appendage", label: "Придаток", fvKey: "scrotum.appendage", options: APPENDAGE_OPTIONS },
  { key: "fluidAmount", label: "Кол-во жидкости", fvKey: "scrotum.fluidAmount", options: FLUID_AMOUNT_OPTIONS },
];

const TEXT_FIELDS = [
  { key: "capsuleText", label: "Описание капсулы", showKey: "capsule", matchValue: "изменена", fvKey: "scrotum.capsuleText" },
  { key: "echotextureText", label: "Описание эхоструктуры", showKey: "echotexture", matchValue: "неоднородная", fvKey: "scrotum.echotextureText" },
  { key: "mediastinumText", label: "Описание средостения", showKey: "mediastinum", matchValue: "изменена", fvKey: "scrotum.mediastinumText" },
  { key: "appendageText", label: "Описание придатка", showKey: "appendage", matchValue: "изменен", fvKey: "scrotum.appendageText" },
  { key: "fluidAmountText", label: "Описание жидкости", showKey: "fluidAmount", matchValue: "увеличено", fvKey: "scrotum.fluidAmountText" },
];

export function ScrotumTestisPanel({
  styles,
  side,
  testis,
  fv,
  isLandscape,
  openEditor,
  onUpdateTestisField,
}: ScrotumTestisPanelProps) {
  const title = side === "right" ? "Правое яичко" : "Левое яичко";

  const showCapsuleText = isNormalizedMatch(testis.capsule, "изменена");
  const showEchotextureText = isNormalizedMatch(testis.echotexture, "неоднородная");
  const showMediastinumText = isNormalizedMatch(testis.mediastinum, "изменена");
  const showAppendageText = isNormalizedMatch(testis.appendage, "изменен");
  const showFluidAmountText = isNormalizedMatch(testis.fluidAmount, "увеличено");

  // ---- Landscape: numpad ----
  const landscapeRef = useRef<View>(null);
  const fieldRefs = useRef<Record<string, View | null>>({});
  const numpad = useInlineNumpad(landscapeRef);

  const handleNumpadChange = useCallback(
    (fieldKey: keyof SingleTestisDraft, nextValue: string) => {
      onUpdateTestisField(side, fieldKey, nextValue);
    },
    [onUpdateTestisField, side],
  );

  const openLandscapeNumpad = useCallback(
    (fieldKey: keyof SingleTestisDraft) => {
      const fieldView = fieldRefs.current[fieldKey] ?? null;
      numpad.openNumpad(fieldKey, fieldView);
    },
    [numpad],
  );

  const renderCompactField = (
    fieldKey: string,
    label: string,
    value: string,
    filled: boolean,
    typeLabel: "numpad" | "select" | "text" | "auto",
    options?: { value: string; label: string }[],
    onSelectOption?: (v: string) => void,
    onPress?: () => void,
    readonly?: boolean,
  ) => (
    <View
      key={fieldKey}
      ref={(el) => {
        if (typeLabel === "numpad") {
          fieldRefs.current[fieldKey] = el;
        }
      }}
      onLayout={typeLabel === "numpad" ? (event) => numpad.handleFieldLayout(fieldKey, event) : undefined}
      style={{ width: "48.5%" }}
    >
      <ProtocolFieldRow
        label={label}
        value={value || "Нажмите для ввода"}
        typeLabel={typeLabel}
        filled={filled}
        readonly={readonly}
        compact={isLandscape}
        onPress={onPress}
        options={options}
        onSelectOption={onSelectOption}
      />
    </View>
  );

  // Собираем все поля для landscape
  const landscapeFields = useMemo(() => {
    const fields: React.ReactNode[] = [];

    // Размеры
    if (fv["scrotum.length"] !== false) {
      fields.push(renderCompactField("length", "Длина (мм)", testis.length, Boolean(testis.length), "numpad", undefined, undefined, () => openLandscapeNumpad("length")));
    }
    if (fv["scrotum.width"] !== false) {
      fields.push(renderCompactField("width", "Ширина (мм)", testis.width, Boolean(testis.width), "numpad", undefined, undefined, () => openLandscapeNumpad("width")));
    }
    if (fv["scrotum.depth"] !== false) {
      fields.push(renderCompactField("depth", "Глубина (мм)", testis.depth, Boolean(testis.depth), "numpad", undefined, undefined, () => openLandscapeNumpad("depth")));
    }
    if (fv["scrotum.volume"] !== false) {
      fields.push(renderCompactField("volume", "Объем (см³)", testis.volume || "Рассчитывается автоматически", Boolean(testis.volume), "auto", undefined, undefined, undefined, true));
    }

    // Селекты
    SELECT_FIELDS.forEach((sf) => {
      if (fv[sf.fvKey] !== false) {
        const value = (testis[sf.key as keyof SingleTestisDraft] as string) || "";
        fields.push(renderCompactField(sf.key, sf.label, value, Boolean(value), "select", sf.options, (v) => onUpdateTestisField(side, sf.key as keyof SingleTestisDraft, v)));
      }
    });

    // Текстовые зависимые поля
    TEXT_FIELDS.forEach((tf) => {
      const showCondition = isNormalizedMatch(testis[tf.showKey as keyof SingleTestisDraft] as string, tf.matchValue);
      if (showCondition && fv[tf.fvKey] !== false) {
        const value = (testis[tf.key as keyof SingleTestisDraft] as string) || "";
        fields.push(renderCompactField(tf.key, tf.label, value, Boolean(value), "text", undefined, undefined, () =>
          openEditor({
            title: `${title}: ${tf.label.toLowerCase()}`,
            mode: "text",
            value: value,
            placeholder: "Введите описание",
            multiline: true,
            onSave: (nextValue) => onUpdateTestisField(side, tf.key as keyof SingleTestisDraft, nextValue),
          })
        ));
      }
    });

    // Дополнительно
    if (fv["scrotum.additional"] !== false) {
      fields.push(renderCompactField("additional", "Дополнительно", testis.additional, Boolean(testis.additional), "text", undefined, undefined, () =>
        openEditor({
          title: `${title}: дополнительно`,
          mode: "text",
          value: testis.additional,
          placeholder: "Введите дополнительное описание",
          multiline: true,
          onSave: (nextValue) => onUpdateTestisField(side, "additional", nextValue),
        })
      ));
    }

    return fields;
  }, [testis, fv, side, title, openLandscapeNumpad, openEditor, onUpdateTestisField]);

  return (
    <View style={styles.kidneyPlainSection}>
      <ProtocolOrganHeader title={title} />

      {isLandscape ? (
        <View ref={landscapeRef} style={{ gap: 8, position: "relative" }}>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
            {landscapeFields}
          </View>

          {/* InlineNumpad */}
          {numpad.activeNumpadField != null && numpad.numpadPosition && (() => {
            const activeFieldKey = numpad.activeNumpadField as keyof SingleTestisDraft;
            const currentValue = typeof testis[activeFieldKey] === "string" ? testis[activeFieldKey] as string : "";
            return (
              <View
                style={{
                  position: "absolute",
                  top: numpad.numpadPosition.top,
                  left: numpad.numpadPosition.left,
                  width: numpad.numpadPosition.width,
                  zIndex: 100,
                }}
              >
                <InlineNumpad
                  value={currentValue}
                  onValueChange={(nextValue) => handleNumpadChange(activeFieldKey, nextValue)}
                  onClose={numpad.closeNumpad}
                />
              </View>
            );
          })()}
        </View>
      ) : (
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
      )}
    </View>
  );
}