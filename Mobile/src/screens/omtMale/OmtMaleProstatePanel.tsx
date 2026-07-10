import { useCallback, useMemo, useRef } from "react";
import { View } from "react-native";

import { InlineNumpad } from "../../components/InlineNumpad";
import { ProtocolFieldRow } from "../../components/protocol/ProtocolFieldRow";
import { ProtocolOrganHeader, ProtocolSectionHeader } from "../../components/protocol/ProtocolHeaders";
import { useInlineNumpad } from "../../hooks/useInlineNumpad";
import type { ProstateDraft } from "../../shared/omtMaleDraft";
import { isNormalizedMatch } from "../../shared/normalizeSelectValue";
import type { AppStyles } from "../../styles/appStyles";
import {
  PROSTATE_BLAADDER_PROTRUSION_OPTIONS,
  PROSTATE_CONTOUR_OPTIONS,
  PROSTATE_ECHOGENICITY_OPTIONS,
  PROSTATE_ECHOTEXTURE_OPTIONS,
  PROSTATE_POSITION_OPTIONS,
  PROSTATE_SHAPE_OPTIONS,
  PROSTATE_STUDY_TYPE_OPTIONS,
  PROSTATE_SYMMETRY_OPTIONS,
  YES_NO_OPTIONS,
  type EditorState,
} from "./omtMaleFieldConfigs";

type OmtMaleProstatePanelProps = {
  styles: AppStyles;
  prostate: ProstateDraft;
  fv: Record<string, boolean>;
  isVisible: boolean;
  isLandscape?: boolean;
  openEditor: (config: NonNullable<EditorState>) => void;
  onUpdateProstateField: (field: keyof ProstateDraft, value: string) => void;
};

export function OmtMaleProstatePanel({
  styles,
  prostate,
  fv,
  isVisible,
  isLandscape,
  openEditor,
  onUpdateProstateField,
}: OmtMaleProstatePanelProps) {
  if (!isVisible) return null;

  const isOrdinaryPosition = isNormalizedMatch(prostate.position, "обычное");
  const showEchotextureText = isNormalizedMatch(prostate.echotexture, "неоднородная");
  const showPathologicLesionsText = isNormalizedMatch(prostate.pathologicLesions, "определяются");
  const showProtrusionMm = isNormalizedMatch(prostate.bladderProtrusion, "выступает");

  // ---- Landscape: numpad ----
  const landscapeRef = useRef<View>(null);
  const fieldRefs = useRef<Record<string, View | null>>({});
  const numpad = useInlineNumpad(landscapeRef);

  const handleNumpadChange = useCallback(
    (fieldKey: keyof ProstateDraft, nextValue: string) => {
      onUpdateProstateField(fieldKey, nextValue);
    },
    [onUpdateProstateField],
  );

  const openLandscapeNumpad = useCallback(
    (fieldKey: keyof ProstateDraft) => {
      const fieldView = fieldRefs.current[fieldKey] ?? null;
      numpad.openNumpad(fieldKey, fieldView);
    },
    [numpad],
  );

  const renderCompactField = (
    fieldKey: keyof ProstateDraft,
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

  // Собираем все поля в один плоский массив для landscape
  const landscapeFields = useMemo(() => {
    const fields: React.ReactNode[] = [];

    if (fv["omt_male.studyType"] !== false) {
      fields.push(renderCompactField(
        "studyType", "Вид исследования", prostate.studyType, Boolean(prostate.studyType), "select",
        PROSTATE_STUDY_TYPE_OPTIONS,
        (v) => onUpdateProstateField("studyType", v),
      ));
    }

    if (fv["omt_male.position"] !== false) {
      fields.push(renderCompactField(
        "position", "Положение", prostate.position, Boolean(prostate.position), "select",
        PROSTATE_POSITION_OPTIONS,
        (v) => onUpdateProstateField("position", v),
      ));
    }

    if (isOrdinaryPosition) {
      // Размеры
      if (fv["omt_male.length"] !== false) {
        fields.push(renderCompactField(
          "length", "Длина (мм)", prostate.length, Boolean(prostate.length), "numpad",
          undefined, undefined,
          () => openLandscapeNumpad("length"),
        ));
      }
      if (fv["omt_male.width"] !== false) {
        fields.push(renderCompactField(
          "width", "Ширина (мм)", prostate.width, Boolean(prostate.width), "numpad",
          undefined, undefined,
          () => openLandscapeNumpad("width"),
        ));
      }
      if (fv["omt_male.apDimension"] !== false) {
        fields.push(renderCompactField(
          "apDimension", "ПЗР (мм)", prostate.apDimension, Boolean(prostate.apDimension), "numpad",
          undefined, undefined,
          () => openLandscapeNumpad("apDimension"),
        ));
      }
      if (fv["omt_male.volume"] !== false) {
        fields.push(renderCompactField(
          "volume", "Объем (см³)", prostate.volume || "Рассчитывается автоматически", Boolean(prostate.volume), "auto",
          undefined, undefined,
          undefined, true,
        ));
      }

      // Контур
      if (fv["omt_male.contour"] !== false) {
        fields.push(renderCompactField(
          "contour", "Контур", prostate.contour, Boolean(prostate.contour), "select",
          PROSTATE_CONTOUR_OPTIONS,
          (v) => onUpdateProstateField("contour", v),
        ));
      }
      // Симметричность
      if (fv["omt_male.symmetry"] !== false) {
        fields.push(renderCompactField(
          "symmetry", "Симметричность", prostate.symmetry, Boolean(prostate.symmetry), "select",
          PROSTATE_SYMMETRY_OPTIONS,
          (v) => onUpdateProstateField("symmetry", v),
        ));
      }
      // Форма
      if (fv["omt_male.shape"] !== false) {
        fields.push(renderCompactField(
          "shape", "Форма", prostate.shape, Boolean(prostate.shape), "select",
          PROSTATE_SHAPE_OPTIONS,
          (v) => onUpdateProstateField("shape", v),
        ));
      }

      // Эхогенность
      if (fv["omt_male.echogenicity"] !== false) {
        fields.push(renderCompactField(
          "echogenicity", "Эхогенность", prostate.echogenicity, Boolean(prostate.echogenicity), "select",
          PROSTATE_ECHOGENICITY_OPTIONS,
          (v) => onUpdateProstateField("echogenicity", v),
        ));
      }
      // Эхоструктура
      if (fv["omt_male.echotexture"] !== false) {
        fields.push(renderCompactField(
          "echotexture", "Эхоструктура", prostate.echotexture, Boolean(prostate.echotexture), "select",
          PROSTATE_ECHOTEXTURE_OPTIONS,
          (v) => onUpdateProstateField("echotexture", v),
        ));
      }
      if (showEchotextureText && fv["omt_male.echotextureText"] !== false) {
        fields.push(renderCompactField(
          "echotextureText", "Описание эхоструктуры", prostate.echotextureText, Boolean(prostate.echotextureText), "text",
          undefined, undefined,
          () => openEditor({ title: "Простата: описание эхоструктуры", mode: "text", value: prostate.echotextureText, placeholder: "Введите описание", multiline: true, onSave: (v) => onUpdateProstateField("echotextureText", v) }),
        ));
      }

      // Выпячивание
      if (fv["omt_male.bladderProtrusion"] !== false) {
        fields.push(renderCompactField(
          "bladderProtrusion", "Выпячивание", prostate.bladderProtrusion, Boolean(prostate.bladderProtrusion), "select",
          PROSTATE_BLAADDER_PROTRUSION_OPTIONS,
          (v) => onUpdateProstateField("bladderProtrusion", v),
        ));
      }
      if (showProtrusionMm && fv["omt_male.bladderProtrusionMm"] !== false) {
        fields.push(renderCompactField(
          "bladderProtrusionMm", "Выпячивание на (мм)", prostate.bladderProtrusionMm, Boolean(prostate.bladderProtrusionMm), "numpad",
          undefined, undefined,
          () => openLandscapeNumpad("bladderProtrusionMm"),
        ));
      }

      // Патологические образования
      if (fv["omt_male.pathologicLesions"] !== false) {
        fields.push(renderCompactField(
          "pathologicLesions", "Патологические образования", prostate.pathologicLesions, Boolean(prostate.pathologicLesions), "select",
          YES_NO_OPTIONS,
          (v) => onUpdateProstateField("pathologicLesions", v),
        ));
      }
      if (showPathologicLesionsText && fv["omt_male.pathologicLesionsText"] !== false) {
        fields.push(renderCompactField(
          "pathologicLesionsText", "Описание пат. образований", prostate.pathologicLesionsText, Boolean(prostate.pathologicLesionsText), "text",
          undefined, undefined,
          () => openEditor({ title: "Простата: описание патологических образований", mode: "text", value: prostate.pathologicLesionsText, placeholder: "Введите описание", multiline: true, onSave: (v) => onUpdateProstateField("pathologicLesionsText", v) }),
        ));
      }
    }

    // Дополнительно
    if (fv["omt_male.additional"] !== false) {
      fields.push(renderCompactField(
        "additional", "Дополнительно", prostate.additional, Boolean(prostate.additional), "text",
        undefined, undefined,
        () => openEditor({ title: "Простата: дополнительно", mode: "text", value: prostate.additional, placeholder: "Введите дополнительное описание", multiline: true, onSave: (v) => onUpdateProstateField("additional", v) }),
      ));
    }

    return fields;
  }, [prostate, fv, isOrdinaryPosition, showEchotextureText, showProtrusionMm, showPathologicLesionsText, openLandscapeNumpad, openEditor, onUpdateProstateField]);

  return (
    <View style={styles.kidneyPlainSection}>
      <ProtocolOrganHeader title="Простата" />

      {isLandscape ? (
        <View ref={landscapeRef} style={{ gap: 8, position: "relative" }}>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
            {landscapeFields}
          </View>

          {/* InlineNumpad */}
          {numpad.activeNumpadField != null && numpad.numpadPosition && (() => {
            const activeFieldKey = numpad.activeNumpadField as keyof ProstateDraft;
            const currentValue = typeof prostate[activeFieldKey] === "string" ? prostate[activeFieldKey] as string : "";
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
          {fv["omt_male.studyType"] !== false && (
            <>
              <ProtocolSectionHeader title="Информация об исследовании" />
              <ProtocolFieldRow
                label="Вид исследования"
                value={prostate.studyType || "Нажмите для ввода"}
                typeLabel="select"
                filled={Boolean(prostate.studyType)}
                options={PROSTATE_STUDY_TYPE_OPTIONS}
                onSelectOption={(nextValue) => onUpdateProstateField("studyType", nextValue)}
              />
            </>
          )}

          {fv["omt_male.position"] !== false && (
            <>
              <ProtocolSectionHeader title="Положение" />
              <ProtocolFieldRow
                label="Положение"
                value={prostate.position || "Нажмите для ввода"}
                typeLabel="select"
                filled={Boolean(prostate.position)}
                options={PROSTATE_POSITION_OPTIONS}
                onSelectOption={(nextValue) => onUpdateProstateField("position", nextValue)}
              />
            </>
          )}

          {isOrdinaryPosition && (fv["omt_male.length"] !== false || fv["omt_male.width"] !== false || fv["omt_male.apDimension"] !== false || fv["omt_male.volume"] !== false) && (
            <>
              <ProtocolSectionHeader title="Размеры" />
              {fv["omt_male.length"] !== false && (
                <ProtocolFieldRow
                  label="Длина (мм)" value={prostate.length || "Нажмите для ввода"}
                  typeLabel="numpad" filled={Boolean(prostate.length)}
                  onPress={() => openEditor({ title: "Простата: длина", mode: "number", value: prostate.length, placeholder: "мм", onSave: (v) => onUpdateProstateField("length", v) })}
                />
              )}
              {fv["omt_male.width"] !== false && (
                <ProtocolFieldRow
                  label="Ширина (мм)" value={prostate.width || "Нажмите для ввода"}
                  typeLabel="numpad" filled={Boolean(prostate.width)}
                  onPress={() => openEditor({ title: "Простата: ширина", mode: "number", value: prostate.width, placeholder: "мм", onSave: (v) => onUpdateProstateField("width", v) })}
                />
              )}
              {fv["omt_male.apDimension"] !== false && (
                <ProtocolFieldRow
                  label="ПЗР (мм)" value={prostate.apDimension || "Нажмите для ввода"}
                  typeLabel="numpad" filled={Boolean(prostate.apDimension)}
                  onPress={() => openEditor({ title: "Простата: ПЗР", mode: "number", value: prostate.apDimension, placeholder: "мм", onSave: (v) => onUpdateProstateField("apDimension", v) })}
                />
              )}
              {fv["omt_male.volume"] !== false && (
                <ProtocolFieldRow
                  label="Объем (см³)" value={prostate.volume || "Рассчитывается автоматически"}
                  typeLabel="auto" filled={Boolean(prostate.volume)} readonly
                />
              )}
            </>
          )}

          {isOrdinaryPosition && (fv["omt_male.contour"] !== false || fv["omt_male.symmetry"] !== false || fv["omt_male.shape"] !== false) && (
            <>
              {fv["omt_male.contour"] !== false && (
                <>
                  <ProtocolSectionHeader title="Контур" />
                  <ProtocolFieldRow label="Контур" value={prostate.contour || "Нажмите для ввода"}
                    typeLabel="select" filled={Boolean(prostate.contour)} options={PROSTATE_CONTOUR_OPTIONS}
                    onSelectOption={(v) => onUpdateProstateField("contour", v)}
                  />
                </>
              )}
              {fv["omt_male.symmetry"] !== false && (
                <>
                  <ProtocolSectionHeader title="Симметричность" />
                  <ProtocolFieldRow label="Симметричность" value={prostate.symmetry || "Нажмите для ввода"}
                    typeLabel="select" filled={Boolean(prostate.symmetry)} options={PROSTATE_SYMMETRY_OPTIONS}
                    onSelectOption={(v) => onUpdateProstateField("symmetry", v)}
                  />
                </>
              )}
              {fv["omt_male.shape"] !== false && (
                <>
                  <ProtocolSectionHeader title="Форма" />
                  <ProtocolFieldRow label="Форма" value={prostate.shape || "Нажмите для ввода"}
                    typeLabel="select" filled={Boolean(prostate.shape)} options={PROSTATE_SHAPE_OPTIONS}
                    onSelectOption={(v) => onUpdateProstateField("shape", v)}
                  />
                </>
              )}
            </>
          )}

          {isOrdinaryPosition && (fv["omt_male.echogenicity"] !== false || fv["omt_male.echotexture"] !== false || fv["omt_male.echotextureText"] !== false || fv["omt_male.bladderProtrusion"] !== false || fv["omt_male.bladderProtrusionMm"] !== false || fv["omt_male.pathologicLesions"] !== false || fv["omt_male.pathologicLesionsText"] !== false) && (
            <>
              {fv["omt_male.echogenicity"] !== false && (
                <>
                  <ProtocolSectionHeader title="Эхогенность" />
                  <ProtocolFieldRow label="Эхогенность" value={prostate.echogenicity || "Нажмите для ввода"}
                    typeLabel="select" filled={Boolean(prostate.echogenicity)} options={PROSTATE_ECHOGENICITY_OPTIONS}
                    onSelectOption={(v) => onUpdateProstateField("echogenicity", v)}
                  />
                </>
              )}
              {(fv["omt_male.echotexture"] !== false || fv["omt_male.echotextureText"] !== false) && (
                <>
                  <ProtocolSectionHeader title="Эхоструктура" />
                  {fv["omt_male.echotexture"] !== false && (
                    <ProtocolFieldRow label="Эхоструктура" value={prostate.echotexture || "Нажмите для ввода"}
                      typeLabel="select" filled={Boolean(prostate.echotexture)} options={PROSTATE_ECHOTEXTURE_OPTIONS}
                      onSelectOption={(v) => onUpdateProstateField("echotexture", v)}
                    />
                  )}
                  {showEchotextureText && fv["omt_male.echotextureText"] !== false && (
                    <ProtocolFieldRow label="Описание" value={prostate.echotextureText || "Нажмите для ввода"}
                      typeLabel="text" filled={Boolean(prostate.echotextureText)}
                      onPress={() => openEditor({ title: "Простата: описание эхоструктуры", mode: "text", value: prostate.echotextureText, placeholder: "Введите описание", multiline: true, onSave: (v) => onUpdateProstateField("echotextureText", v) })}
                    />
                  )}
                </>
              )}

              {(fv["omt_male.bladderProtrusion"] !== false || fv["omt_male.bladderProtrusionMm"] !== false) && (
                <>
                  <ProtocolSectionHeader title="В просвет мочевого пузыря" />
                  {fv["omt_male.bladderProtrusion"] !== false && (
                    <ProtocolFieldRow label="Выпячивание" value={prostate.bladderProtrusion || "Нажмите для ввода"}
                      typeLabel="select" filled={Boolean(prostate.bladderProtrusion)} options={PROSTATE_BLAADDER_PROTRUSION_OPTIONS}
                      onSelectOption={(v) => onUpdateProstateField("bladderProtrusion", v)}
                    />
                  )}
                  {showProtrusionMm && fv["omt_male.bladderProtrusionMm"] !== false && (
                    <ProtocolFieldRow label="Выпячивание на (мм)" value={prostate.bladderProtrusionMm || "Нажмите для ввода"}
                      typeLabel="numpad" filled={Boolean(prostate.bladderProtrusionMm)}
                      onPress={() => openEditor({ title: "Простата: выпячивание на (мм)", mode: "number", value: prostate.bladderProtrusionMm, placeholder: "мм", onSave: (v) => onUpdateProstateField("bladderProtrusionMm", v) })}
                    />
                  )}
                </>
              )}

              {(fv["omt_male.pathologicLesions"] !== false || fv["omt_male.pathologicLesionsText"] !== false) && (
                <>
                  <ProtocolSectionHeader title="Патологические образования" />
                  {fv["omt_male.pathologicLesions"] !== false && (
                    <ProtocolFieldRow label="Определение" value={prostate.pathologicLesions || "Нажмите для ввода"}
                      typeLabel="select" filled={Boolean(prostate.pathologicLesions)} options={YES_NO_OPTIONS}
                      onSelectOption={(v) => onUpdateProstateField("pathologicLesions", v)}
                    />
                  )}
                  {showPathologicLesionsText && fv["omt_male.pathologicLesionsText"] !== false && (
                    <ProtocolFieldRow label="Описание" value={prostate.pathologicLesionsText || "Нажмите для ввода"}
                      typeLabel="text" filled={Boolean(prostate.pathologicLesionsText)}
                      onPress={() => openEditor({ title: "Простата: описание патологических образований", mode: "text", value: prostate.pathologicLesionsText, placeholder: "Введите описание", multiline: true, onSave: (v) => onUpdateProstateField("pathologicLesionsText", v) })}
                    />
                  )}
                </>
              )}
            </>
          )}

          {fv["omt_male.additional"] !== false && (
            <>
              <ProtocolSectionHeader title="Дополнительно" />
              <ProtocolFieldRow label="Дополнительно" value={prostate.additional || "Нажмите для ввода"}
                typeLabel="text" filled={Boolean(prostate.additional)}
                onPress={() => openEditor({ title: "Простата: дополнительно", mode: "text", value: prostate.additional, placeholder: "Введите дополнительное описание", multiline: true, onSave: (v) => onUpdateProstateField("additional", v) })}
              />
            </>
          )}
        </View>
      )}
    </View>
  );
}