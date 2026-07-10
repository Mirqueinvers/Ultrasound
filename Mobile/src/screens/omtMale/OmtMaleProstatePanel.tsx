import { Fragment, useCallback, useMemo, useRef } from "react";
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
  /** Все числовые поля простаты для рендеринга в landscape */
  const numericFields = useMemo(() => {
    const fields: Array<{
      key: keyof ProstateDraft;
      label: string;
      value: string;
      filled: boolean;
      readonly?: boolean;
      visible: boolean;
    }> = [];
    if (fv["omt_male.length"] !== false) {
      fields.push({ key: "length", label: "Длина (мм)", value: prostate.length, filled: Boolean(prostate.length), visible: true });
    }
    if (fv["omt_male.width"] !== false) {
      fields.push({ key: "width", label: "Ширина (мм)", value: prostate.width, filled: Boolean(prostate.width), visible: true });
    }
    if (fv["omt_male.apDimension"] !== false) {
      fields.push({ key: "apDimension", label: "ПЗР (мм)", value: prostate.apDimension, filled: Boolean(prostate.apDimension), visible: true });
    }
    if (fv["omt_male.volume"] !== false) {
      fields.push({ key: "volume", label: "Объем (см³)", value: prostate.volume || "Рассчитывается автоматически", filled: Boolean(prostate.volume), readonly: true, visible: true });
    }
    return fields;
  }, [prostate, fv]);

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

  const renderCompactRow = (
    fieldKey: keyof ProstateDraft,
    label: string,
    value: string,
    filled: boolean,
    readonly?: boolean,
  ) => (
    <View
      key={fieldKey}
      ref={(el) => { fieldRefs.current[fieldKey] = el; }}
      onLayout={(event) => numpad.handleFieldLayout(fieldKey, event)}
      style={{ width: "48.5%" }}
    >
      <ProtocolFieldRow
        label={label}
        value={value || "Нажмите для ввода"}
        typeLabel={readonly ? "auto" : "numpad"}
        filled={filled}
        readonly={readonly}
        compact={isLandscape}
        onPress={readonly ? undefined : () => openLandscapeNumpad(fieldKey)}
      />
    </View>
  );

  return (
    <View style={styles.kidneyPlainSection}>
      <ProtocolOrganHeader title="Простата" />

      {isLandscape ? (
        <View ref={landscapeRef} style={{ gap: 8, position: "relative" }}>
          {(() => {
            // Информация об исследовании + Положение — select'ы
            const hasStudyType = fv["omt_male.studyType"] !== false;
            const hasPosition = fv["omt_male.position"] !== false;
            return (
              <>
                {hasStudyType && (
                  <>
                    <ProtocolSectionHeader title="Информация об исследовании" />
                    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                      <View style={{ width: "48.5%" }}>
                        <ProtocolFieldRow
                          label="Вид исследования"
                          value={prostate.studyType || "Нажмите для ввода"}
                          typeLabel="select"
                          filled={Boolean(prostate.studyType)}
                          compact={isLandscape}
                          options={PROSTATE_STUDY_TYPE_OPTIONS}
                          onSelectOption={(nextValue) => onUpdateProstateField("studyType", nextValue)}
                        />
                      </View>
                    </View>
                  </>
                )}
                {hasPosition && (
                  <>
                    <ProtocolSectionHeader title="Положение" />
                    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                      <View style={{ width: "48.5%" }}>
                        <ProtocolFieldRow
                          label="Положение"
                          value={prostate.position || "Нажмите для ввода"}
                          typeLabel="select"
                          filled={Boolean(prostate.position)}
                          compact={isLandscape}
                          options={PROSTATE_POSITION_OPTIONS}
                          onSelectOption={(nextValue) => onUpdateProstateField("position", nextValue)}
                        />
                      </View>
                    </View>
                  </>
                )}
              </>
            );
          })()}

          {isOrdinaryPosition && numericFields.some((f) => f.visible) && (
            <>
              <ProtocolSectionHeader title="Размеры" />
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                {numericFields.map((f) => renderCompactRow(f.key, f.label, f.value, f.filled, f.readonly))}
              </View>
            </>
          )}

          {/* Контур, симметричность, форма — select'ы */}
          {isOrdinaryPosition && (fv["omt_male.contour"] !== false || fv["omt_male.symmetry"] !== false || fv["omt_male.shape"] !== false) && (() => {
            const rows: React.ReactNode[] = [];
            if (fv["omt_male.contour"] !== false) {
              rows.push(
                <Fragment key="contour">
                  <ProtocolSectionHeader title="Контур" />
                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                    <View style={{ width: "48.5%" }}>
                      <ProtocolFieldRow label="Контур" value={prostate.contour || "Нажмите для ввода"}
                        typeLabel="select" filled={Boolean(prostate.contour)} compact={isLandscape} options={PROSTATE_CONTOUR_OPTIONS}
                        onSelectOption={(v) => onUpdateProstateField("contour", v)}
                      />
                    </View>
                  </View>
                </Fragment>,
              );
            }
            if (fv["omt_male.symmetry"] !== false) {
              rows.push(
                <Fragment key="symmetry">
                  <ProtocolSectionHeader title="Симметричность" />
                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                    <View style={{ width: "48.5%" }}>
                      <ProtocolFieldRow label="Симметричность" value={prostate.symmetry || "Нажмите для ввода"}
                        typeLabel="select" filled={Boolean(prostate.symmetry)} compact={isLandscape} options={PROSTATE_SYMMETRY_OPTIONS}
                        onSelectOption={(v) => onUpdateProstateField("symmetry", v)}
                      />
                    </View>
                  </View>
                </Fragment>,
              );
            }
            if (fv["omt_male.shape"] !== false) {
              rows.push(
                <Fragment key="shape">
                  <ProtocolSectionHeader title="Форма" />
                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                    <View style={{ width: "48.5%" }}>
                      <ProtocolFieldRow label="Форма" value={prostate.shape || "Нажмите для ввода"}
                        typeLabel="select" filled={Boolean(prostate.shape)} compact={isLandscape} options={PROSTATE_SHAPE_OPTIONS}
                        onSelectOption={(v) => onUpdateProstateField("shape", v)}
                      />
                    </View>
                  </View>
                </Fragment>,
              );
            }
            return rows;
          })()}

          {/* Эхогенность, эхоструктура, выпячивание, патологические образования — select + text поля */}
          {isOrdinaryPosition && (fv["omt_male.echogenicity"] !== false || fv["omt_male.echotexture"] !== false || fv["omt_male.echotextureText"] !== false || fv["omt_male.bladderProtrusion"] !== false || fv["omt_male.bladderProtrusionMm"] !== false || fv["omt_male.pathologicLesions"] !== false || fv["omt_male.pathologicLesionsText"] !== false) && (
            <>
              {fv["omt_male.echogenicity"] !== false && (
                <>
                  <ProtocolSectionHeader title="Эхогенность" />
                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                    <View style={{ width: "48.5%" }}>
                      <ProtocolFieldRow label="Эхогенность" value={prostate.echogenicity || "Нажмите для ввода"}
                        typeLabel="select" filled={Boolean(prostate.echogenicity)} compact={isLandscape} options={PROSTATE_ECHOGENICITY_OPTIONS}
                        onSelectOption={(v) => onUpdateProstateField("echogenicity", v)}
                      />
                    </View>
                  </View>
                </>
              )}
              {(fv["omt_male.echotexture"] !== false || fv["omt_male.echotextureText"] !== false) && (
                <>
                  <ProtocolSectionHeader title="Эхоструктура" />
                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                    {fv["omt_male.echotexture"] !== false && (
                      <View style={{ width: "48.5%" }}>
                        <ProtocolFieldRow label="Эхоструктура" value={prostate.echotexture || "Нажмите для ввода"}
                          typeLabel="select" filled={Boolean(prostate.echotexture)} compact={isLandscape} options={PROSTATE_ECHOTEXTURE_OPTIONS}
                          onSelectOption={(v) => onUpdateProstateField("echotexture", v)}
                        />
                      </View>
                    )}
                    {showEchotextureText && fv["omt_male.echotextureText"] !== false && (
                      <View style={{ width: "48.5%" }}>
                        <ProtocolFieldRow label="Описание" value={prostate.echotextureText || "Нажмите для ввода"}
                          typeLabel="text" filled={Boolean(prostate.echotextureText)} compact={isLandscape}
                          onPress={() => openEditor({ title: "Простата: описание эхоструктуры", mode: "text", value: prostate.echotextureText, placeholder: "Введите описание", multiline: true, onSave: (v) => onUpdateProstateField("echotextureText", v) })}
                        />
                      </View>
                    )}
                  </View>
                </>
              )}
              {(fv["omt_male.bladderProtrusion"] !== false || fv["omt_male.bladderProtrusionMm"] !== false) && (
                <>
                  <ProtocolSectionHeader title="В просвет мочевого пузыря" />
                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                    {fv["omt_male.bladderProtrusion"] !== false && (
                      <View style={{ width: "48.5%" }}>
                        <ProtocolFieldRow label="Выпячивание" value={prostate.bladderProtrusion || "Нажмите для ввода"}
                          typeLabel="select" filled={Boolean(prostate.bladderProtrusion)} compact={isLandscape} options={PROSTATE_BLAADDER_PROTRUSION_OPTIONS}
                          onSelectOption={(v) => onUpdateProstateField("bladderProtrusion", v)}
                        />
                      </View>
                    )}
                    {showProtrusionMm && fv["omt_male.bladderProtrusionMm"] !== false && (
                      <View
                        ref={(el) => { fieldRefs.current["bladderProtrusionMm"] = el; }}
                        onLayout={(event) => numpad.handleFieldLayout("bladderProtrusionMm", event)}
                        style={{ width: "48.5%" }}
                      >
                        <ProtocolFieldRow label="Выпячивание на (мм)" value={prostate.bladderProtrusionMm || "Нажмите для ввода"}
                          typeLabel="numpad" filled={Boolean(prostate.bladderProtrusionMm)} compact={isLandscape}
                          onPress={() => openLandscapeNumpad("bladderProtrusionMm")}
                        />
                      </View>
                    )}
                  </View>
                </>
              )}
              {(fv["omt_male.pathologicLesions"] !== false || fv["omt_male.pathologicLesionsText"] !== false) && (
                <>
                  <ProtocolSectionHeader title="Патологические образования" />
                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                    {fv["omt_male.pathologicLesions"] !== false && (
                      <View style={{ width: "48.5%" }}>
                        <ProtocolFieldRow label="Определение" value={prostate.pathologicLesions || "Нажмите для ввода"}
                          typeLabel="select" filled={Boolean(prostate.pathologicLesions)} compact={isLandscape} options={YES_NO_OPTIONS}
                          onSelectOption={(v) => onUpdateProstateField("pathologicLesions", v)}
                        />
                      </View>
                    )}
                    {showPathologicLesionsText && fv["omt_male.pathologicLesionsText"] !== false && (
                      <View style={{ width: "48.5%" }}>
                        <ProtocolFieldRow label="Описание" value={prostate.pathologicLesionsText || "Нажмите для ввода"}
                          typeLabel="text" filled={Boolean(prostate.pathologicLesionsText)} compact={isLandscape}
                          onPress={() => openEditor({ title: "Простата: описание патологических образований", mode: "text", value: prostate.pathologicLesionsText, placeholder: "Введите описание", multiline: true, onSave: (v) => onUpdateProstateField("pathologicLesionsText", v) })}
                        />
                      </View>
                    )}
                  </View>
                </>
              )}
            </>
          )}

          {fv["omt_male.additional"] !== false && (
            <>
              <ProtocolSectionHeader title="Дополнительно" />
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                <View style={{ width: "48.5%" }}>
                  <ProtocolFieldRow label="Дополнительно" value={prostate.additional || "Нажмите для ввода"}
                    typeLabel="text" filled={Boolean(prostate.additional)} compact={isLandscape}
                    onPress={() => openEditor({ title: "Простата: дополнительно", mode: "text", value: prostate.additional, placeholder: "Введите дополнительное описание", multiline: true, onSave: (v) => onUpdateProstateField("additional", v) })}
                  />
                </View>
              </View>
            </>
          )}

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