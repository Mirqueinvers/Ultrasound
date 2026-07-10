import { useCallback } from "react";
import type { LayoutChangeEvent } from "react-native";
import { Text, View } from "react-native";
import { ProtocolActionButton } from "../../components/protocol/ProtocolActionButton";
import { ProtocolFieldRow } from "../../components/protocol/ProtocolFieldRow";
import { ProtocolOrganHeader, ProtocolSectionHeader } from "../../components/protocol/ProtocolHeaders";
import type { UterusDraft, UterusNodeDraft } from "../../shared/omtFemaleDraft";
import { isNormalizedMatch } from "../../shared/normalizeSelectValue";
import type { AppStyles } from "../../styles/appStyles";
import {
  CERVICAL_CANAL_OPTIONS,
  CERVIX_ECHOSTRUCTURE_OPTIONS,
  ENDOMETRIUM_STRUCTURE_OPTIONS,
  FREE_FLUID_OPTIONS,
  MENOPAUSE_OPTIONS,
  UTERINE_CAVITY_OPTIONS,
  UTERUS_ECHOGENICITY_OPTIONS,
  UTERUS_POSITION_OPTIONS,
  UTERUS_SHAPE_OPTIONS,
  UTERUS_STATUS_OPTIONS,
  UTERUS_STRUCTURE_OPTIONS,
  UTERUS_STUDY_TYPE_OPTIONS,
  YES_NO_OPTIONS,
  type EditorState,
  formatDateDisplay,
  parseDateInput,
  getDateEditorValue,
} from "./omtFemaleFieldConfigs";
import { OmtFemaleMyomaNodeCard } from "./OmtFemaleMyomaNodeCard";

import type { NumpadApi } from "../../components/InlineNumpad";

type OmtFemaleUterusPanelProps = {
  styles: AppStyles;
  uterus: UterusDraft;
  fv: Record<string, boolean>;
  isVisible: boolean;
  isLandscape?: boolean;
  openEditor: (config: NonNullable<EditorState>) => void;
  onUpdateUterusField: (field: keyof UterusDraft, value: string) => void;
  onAddMyomaNode: () => void;
  onUpdateMyomaNode: (index: number, field: keyof UterusNodeDraft, value: string) => void;
  onRemoveMyomaNode: (index: number) => void;
  numpadApi: NumpadApi;
};

const NUMBER_FIELDS = new Set(["length", "width", "apDimension", "endometriumSize", "cervixSize"]);

export function OmtFemaleUterusPanel({
  styles, uterus, fv, isVisible, isLandscape, openEditor, onUpdateUterusField,
  onAddMyomaNode, onUpdateMyomaNode, onRemoveMyomaNode, numpadApi,
}: OmtFemaleUterusPanelProps) {
  if (!isVisible) return null;

  const showMyomaNodes = isNormalizedMatch(uterus.myomaNodesPresence, "определяются");
  const showMyometriumText = isNormalizedMatch(uterus.myometriumStructure, "неоднородная");
  const showCervicalCanalText = isNormalizedMatch(uterus.cervicalCanal, "расширен");
  const showFreeFluidText = isNormalizedMatch(uterus.freeFluid, "определяется");
  const showCervixEchostructureText = isNormalizedMatch(uterus.cervixEchostructure, "неоднородная");

  const renderFieldRow = (label: string, value: string, typeLabel: "numpad" | "select" | "text" | "auto", filled: boolean, opts?: { onPress?: () => void; readonly?: boolean; options?: any; onSelectOption?: (v: string) => void }) => (
    <ProtocolFieldRow label={label} value={value} typeLabel={typeLabel} filled={filled}
      readonly={opts?.readonly} compact={isLandscape} onPress={opts?.onPress}
      options={opts?.options} onSelectOption={opts?.onSelectOption} />
  );
  const wrap = (el: React.ReactNode) => isLandscape ? <View style={{ width: "48.5%" }}>{el}</View> : el;
  const rowWrap = (label: string, value: string, typeLabel: "numpad" | "select" | "text" | "auto", filled: boolean, opts?: { onPress?: () => void; readonly?: boolean; options?: any; onSelectOption?: (v: string) => void }) => wrap(renderFieldRow(label, value, typeLabel, filled, opts));

  const gridRow = (items: React.ReactNode[]) => isLandscape
    ? <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>{items}</View>
    : <>{items}</>;

  // ---- Landscape: inline numpad handlers ----
  const getNumberFieldPress = useCallback(
    (fieldKey: string) => {
      if (!isLandscape) return undefined;
      return () => {
        const fieldView = numpadApi.fieldRefs.current[fieldKey] ?? null;
        const k = fieldKey as keyof UterusDraft;
        numpadApi.openNumpad(
          fieldKey,
          fieldView,
          uterus[k] as string,
          (nextValue) => onUpdateUterusField(k, nextValue),
        );
      };
    },
    [isLandscape, numpadApi, uterus, onUpdateUterusField],
  );

  const getNumberFieldLayout = useCallback(
    (fieldKey: string) => {
      if (!isLandscape) return undefined;
      return (event: LayoutChangeEvent) => numpadApi.handleFieldLayout(fieldKey, event);
    },
    [isLandscape, numpadApi],
  );

  const renderNumberField = (label: string, fieldKey: string, value: string, filled: boolean) => {
    if (isLandscape) {
      return (
        <View
          key={fieldKey}
          ref={(el) => { numpadApi.fieldRefs.current[fieldKey] = el; }}
          onLayout={getNumberFieldLayout(fieldKey)}
          style={{ width: "48.5%" }}
        >
          <ProtocolFieldRow
            label={label}
            value={value || "Нажмите для ввода"}
            typeLabel="numpad"
            filled={filled}
            compact={true}
            onPress={getNumberFieldPress(fieldKey)}
          />
        </View>
      );
    }
    return (
      <ProtocolFieldRow key={fieldKey} label={label} value={value || "Нажмите для ввода"}
        typeLabel="numpad" filled={filled}
        onPress={() => openEditor({ title: `Матка: ${label}`, mode: "number", value, placeholder: "мм", onSave: (v) => onUpdateUterusField(fieldKey as keyof UterusDraft, v) })} />
    );
  };

  return (
    <View style={styles.kidneyPlainSection}>
      <ProtocolOrganHeader title="Матка" />
      {isLandscape ? (
        <View style={{ gap: 8 }}>
          {fv["omt_female.uterusStatus"] !== false && (
            <>
              <ProtocolSectionHeader title="Положение" />
              {wrap(renderFieldRow("Положение матки", uterus.uterusStatus || "Нажмите для ввода", "select", Boolean(uterus.uterusStatus), { options: UTERUS_STATUS_OPTIONS, onSelectOption: (v) => onUpdateUterusField("uterusStatus", v) }))}
            </>
          )}
          {(fv["omt_female.studyType"] !== false || fv["omt_female.lastMenstruationDate"] !== false || fv["omt_female.cycleDay"] !== false || fv["omt_female.menopause"] !== false) && (
            <>
              <ProtocolSectionHeader title="Информация об исследовании" />
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                {fv["omt_female.studyType"] !== false && rowWrap("Вид исследования", uterus.studyType || "Нажмите для ввода", "select", Boolean(uterus.studyType), { options: UTERUS_STUDY_TYPE_OPTIONS, onSelectOption: (v) => onUpdateUterusField("studyType", v) })}
                {fv["omt_female.lastMenstruationDate"] !== false && rowWrap("Дата последней менструации", formatDateDisplay(uterus.lastMenstruationDate) || "Нажмите для ввода", "numpad", Boolean(uterus.lastMenstruationDate), { onPress: () => openEditor({ title: "Дата последней менструации", mode: "number", value: getDateEditorValue(uterus.lastMenstruationDate), placeholder: "дд.мм.гггг", onSave: (v) => onUpdateUterusField("lastMenstruationDate", parseDateInput(v)) }) })}
                {fv["omt_female.cycleDay"] !== false && rowWrap("День цикла", uterus.cycleDay || "Рассчитывается автоматически", "auto", Boolean(uterus.cycleDay), { readonly: true })}
                {fv["omt_female.menopause"] !== false && rowWrap("Менопауза", uterus.menopause || "Нажмите для ввода", "select", Boolean(uterus.menopause), { options: MENOPAUSE_OPTIONS, onSelectOption: (v) => onUpdateUterusField("menopause", v) })}
              </View>
            </>
          )}
          {(fv["omt_female.length"] !== false || fv["omt_female.width"] !== false || fv["omt_female.apDimension"] !== false || fv["omt_female.volume"] !== false) && (
            <>
              <ProtocolSectionHeader title="Размеры" />
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                {fv["omt_female.length"] !== false && renderNumberField("Длина (мм)", "length", uterus.length, Boolean(uterus.length))}
                {fv["omt_female.width"] !== false && renderNumberField("Ширина (мм)", "width", uterus.width, Boolean(uterus.width))}
                {fv["omt_female.apDimension"] !== false && renderNumberField("ПЗР (мм)", "apDimension", uterus.apDimension, Boolean(uterus.apDimension))}
                {fv["omt_female.volume"] !== false && rowWrap("Объем (см³)", uterus.volume || "Рассчитывается автоматически", "auto", Boolean(uterus.volume), { readonly: true })}
              </View>
            </>
          )}
          {(fv["omt_female.shape"] !== false || fv["omt_female.position"] !== false) && (
            <>
              <ProtocolSectionHeader title="Форма" />
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                {fv["omt_female.shape"] !== false && rowWrap("Форма", uterus.shape || "Нажмите для ввода", "select", Boolean(uterus.shape), { options: UTERUS_SHAPE_OPTIONS, onSelectOption: (v) => onUpdateUterusField("shape", v) })}
                {fv["omt_female.position"] !== false && rowWrap("Положение", uterus.position || "Нажмите для ввода", "select", Boolean(uterus.position), { options: UTERUS_POSITION_OPTIONS, onSelectOption: (v) => onUpdateUterusField("position", v) })}
              </View>
            </>
          )}
          {(fv["omt_female.myometriumStructure"] !== false || fv["omt_female.myometriumStructureText"] !== false || fv["omt_female.myometriumEchogenicity"] !== false) && (
            <>
              <ProtocolSectionHeader title="Строение миометрия" />
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                {fv["omt_female.myometriumStructure"] !== false && rowWrap("Структура", uterus.myometriumStructure || "Нажмите для ввода", "select", Boolean(uterus.myometriumStructure), { options: UTERUS_STRUCTURE_OPTIONS, onSelectOption: (v) => onUpdateUterusField("myometriumStructure", v) })}
                {showMyometriumText && fv["omt_female.myometriumStructureText"] !== false && rowWrap("Описание", uterus.myometriumStructureText || "Нажмите для ввода", "text", Boolean(uterus.myometriumStructureText), { onPress: () => openEditor({ title: "Матка: описание строения миометрия", mode: "text", value: uterus.myometriumStructureText, placeholder: "Введите описание", multiline: true, onSave: (v) => onUpdateUterusField("myometriumStructureText", v) }) })}
                {fv["omt_female.myometriumEchogenicity"] !== false && rowWrap("Эхогенность", uterus.myometriumEchogenicity || "Нажмите для ввода", "select", Boolean(uterus.myometriumEchogenicity), { options: UTERUS_ECHOGENICITY_OPTIONS, onSelectOption: (v) => onUpdateUterusField("myometriumEchogenicity", v) })}
              </View>
            </>
          )}
          {fv["omt_female.myomaNodesPresence"] !== false && (
            <>
              <ProtocolSectionHeader title="Объемные образования" />
              {wrap(renderFieldRow("Миоматозные узлы", uterus.myomaNodesPresence || "Нажмите для ввода", "select", Boolean(uterus.myomaNodesPresence), { options: YES_NO_OPTIONS, onSelectOption: (v) => onUpdateUterusField("myomaNodesPresence", v) }))}
              {showMyomaNodes && (
                <View style={{ gap: 6 }}>
                  {uterus.myomaNodesList.length === 0 ? (
                    <Text style={styles.helperText}>Добавьте хотя бы один узел.</Text>
                  ) : (
                    uterus.myomaNodesList.map((node, i) => (
                      <OmtFemaleMyomaNodeCard key={`myoma-${i}`} styles={styles} node={node} index={i}
                        openEditor={openEditor} onUpdateNode={onUpdateMyomaNode} onRemoveNode={onRemoveMyomaNode}
                        numpadApi={numpadApi} />
                    ))
                  )}
                  <ProtocolActionButton label="+ Миоматозный узел" onPress={onAddMyomaNode} />
                </View>
              )}
            </>
          )}
          {(fv["omt_female.endometriumSize"] !== false || fv["omt_female.endometriumStructure"] !== false) && (
            <>
              <ProtocolSectionHeader title="Эндометрий" />
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                {fv["omt_female.endometriumSize"] !== false && renderNumberField("Размер (мм)", "endometriumSize", uterus.endometriumSize, Boolean(uterus.endometriumSize))}
                {fv["omt_female.endometriumStructure"] !== false && rowWrap("Структура", uterus.endometriumStructure || "Нажмите для ввода", "select", Boolean(uterus.endometriumStructure), { options: ENDOMETRIUM_STRUCTURE_OPTIONS, onSelectOption: (v) => onUpdateUterusField("endometriumStructure", v) })}
              </View>
            </>
          )}
          {(fv["omt_female.cervixSize"] !== false || fv["omt_female.cervixEchostructure"] !== false || fv["omt_female.cervixEchostructureText"] !== false || fv["omt_female.cervicalCanal"] !== false || fv["omt_female.cervicalCanalText"] !== false || fv["omt_female.freeFluid"] !== false || fv["omt_female.freeFluidText"] !== false) && (
            <>
              <ProtocolSectionHeader title="Шейка матки" />
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                {fv["omt_female.cervixSize"] !== false && renderNumberField("Размер шейки (мм)", "cervixSize", uterus.cervixSize, Boolean(uterus.cervixSize))}
                {fv["omt_female.cervixEchostructure"] !== false && rowWrap("Эхоструктура", uterus.cervixEchostructure || "Нажмите для ввода", "select", Boolean(uterus.cervixEchostructure), { options: CERVIX_ECHOSTRUCTURE_OPTIONS, onSelectOption: (v) => onUpdateUterusField("cervixEchostructure", v) })}
                {showCervixEchostructureText && fv["omt_female.cervixEchostructureText"] !== false && rowWrap("Описание", uterus.cervixEchostructureText || "Нажмите для ввода", "text", Boolean(uterus.cervixEchostructureText), { onPress: () => openEditor({ title: "Шейка матки: описание эхоструктуры", mode: "text", value: uterus.cervixEchostructureText, placeholder: "Введите описание", multiline: true, onSave: (v) => onUpdateUterusField("cervixEchostructureText", v) }) })}
                {fv["omt_female.cervicalCanal"] !== false && rowWrap("Цервикальный канал", uterus.cervicalCanal || "Нажмите для ввода", "select", Boolean(uterus.cervicalCanal), { options: CERVICAL_CANAL_OPTIONS, onSelectOption: (v) => onUpdateUterusField("cervicalCanal", v) })}
                {showCervicalCanalText && fv["omt_female.cervicalCanalText"] !== false && rowWrap("Описание", uterus.cervicalCanalText || "Нажмите для ввода", "text", Boolean(uterus.cervicalCanalText), { onPress: () => openEditor({ title: "Шейка матки: описание канала", mode: "text", value: uterus.cervicalCanalText, placeholder: "Введите описание", multiline: true, onSave: (v) => onUpdateUterusField("cervicalCanalText", v) }) })}
              </View>
              <ProtocolSectionHeader title="Свободная жидкость" />
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                {fv["omt_female.freeFluid"] !== false && rowWrap("Свободная жидкость", uterus.freeFluid || "Нажмите для ввода", "select", Boolean(uterus.freeFluid), { options: FREE_FLUID_OPTIONS, onSelectOption: (v) => onUpdateUterusField("freeFluid", v) })}
                {showFreeFluidText && fv["omt_female.freeFluidText"] !== false && rowWrap("Описание", uterus.freeFluidText || "Нажмите для ввода", "text", Boolean(uterus.freeFluidText), { onPress: () => openEditor({ title: "Матка: описание свободной жидкости", mode: "text", value: uterus.freeFluidText, placeholder: "Введите описание", multiline: true, onSave: (v) => onUpdateUterusField("freeFluidText", v) }) })}
              </View>
            </>
          )}
          {fv["omt_female.additional"] !== false && (
            <>
              <ProtocolSectionHeader title="Дополнительно" />
              {wrap(renderFieldRow("Дополнительно", uterus.additional || "Нажмите для ввода", "text", Boolean(uterus.additional), { onPress: () => openEditor({ title: "Матка: дополнительно", mode: "text", value: uterus.additional, placeholder: "Введите дополнительное описание", multiline: true, onSave: (v) => onUpdateUterusField("additional", v) }) }))}
            </>
          )}
        </View>
      ) : (
        <View style={styles.obpFieldList}>
          {fv["omt_female.uterusStatus"] !== false && (
            <>
              <ProtocolSectionHeader title="Положение" />
              {renderFieldRow("Положение матки", uterus.uterusStatus || "Нажмите для ввода", "select", Boolean(uterus.uterusStatus), { options: UTERUS_STATUS_OPTIONS, onSelectOption: (v) => onUpdateUterusField("uterusStatus", v) })}
            </>
          )}
          {(fv["omt_female.studyType"] !== false || fv["omt_female.lastMenstruationDate"] !== false || fv["omt_female.cycleDay"] !== false || fv["omt_female.menopause"] !== false) && (
            <>
              <ProtocolSectionHeader title="Информация об исследовании" />
              {fv["omt_female.studyType"] !== false && renderFieldRow("Вид исследования", uterus.studyType || "Нажмите для ввода", "select", Boolean(uterus.studyType), { options: UTERUS_STUDY_TYPE_OPTIONS, onSelectOption: (v) => onUpdateUterusField("studyType", v) })}
              {fv["omt_female.lastMenstruationDate"] !== false && renderFieldRow("Дата последней менструации", formatDateDisplay(uterus.lastMenstruationDate) || "Нажмите для ввода", "numpad", Boolean(uterus.lastMenstruationDate), { onPress: () => openEditor({ title: "Дата последней менструации", mode: "number", value: getDateEditorValue(uterus.lastMenstruationDate), placeholder: "дд.мм.гггг", onSave: (v) => onUpdateUterusField("lastMenstruationDate", parseDateInput(v)) }) })}
              {fv["omt_female.cycleDay"] !== false && renderFieldRow("День цикла", uterus.cycleDay || "Рассчитывается автоматически", "auto", Boolean(uterus.cycleDay), { readonly: true })}
              {fv["omt_female.menopause"] !== false && renderFieldRow("Менопауза", uterus.menopause || "Нажмите для ввода", "select", Boolean(uterus.menopause), { options: MENOPAUSE_OPTIONS, onSelectOption: (v) => onUpdateUterusField("menopause", v) })}
            </>
          )}
          {(fv["omt_female.length"] !== false || fv["omt_female.width"] !== false || fv["omt_female.apDimension"] !== false || fv["omt_female.volume"] !== false) && (
            <>
              <ProtocolSectionHeader title="Размеры" />
              {fv["omt_female.length"] !== false && renderFieldRow("Длина (мм)", uterus.length || "Нажмите для ввода", "numpad", Boolean(uterus.length), { onPress: () => openEditor({ title: "Матка: длина", mode: "number", value: uterus.length, placeholder: "мм", onSave: (v) => onUpdateUterusField("length", v) }) })}
              {fv["omt_female.width"] !== false && renderFieldRow("Ширина (мм)", uterus.width || "Нажмите для ввода", "numpad", Boolean(uterus.width), { onPress: () => openEditor({ title: "Матка: ширина", mode: "number", value: uterus.width, placeholder: "мм", onSave: (v) => onUpdateUterusField("width", v) }) })}
              {fv["omt_female.apDimension"] !== false && renderFieldRow("ПЗР (мм)", uterus.apDimension || "Нажмите для ввода", "numpad", Boolean(uterus.apDimension), { onPress: () => openEditor({ title: "Матка: ПЗР", mode: "number", value: uterus.apDimension, placeholder: "мм", onSave: (v) => onUpdateUterusField("apDimension", v) }) })}
              {fv["omt_female.volume"] !== false && renderFieldRow("Объем (см³)", uterus.volume || "Рассчитывается автоматически", "auto", Boolean(uterus.volume), { readonly: true })}
            </>
          )}
          {(fv["omt_female.shape"] !== false || fv["omt_female.position"] !== false) && (
            <>
              <ProtocolSectionHeader title="Форма" />
              {fv["omt_female.shape"] !== false && renderFieldRow("Форма", uterus.shape || "Нажмите для ввода", "select", Boolean(uterus.shape), { options: UTERUS_SHAPE_OPTIONS, onSelectOption: (v) => onUpdateUterusField("shape", v) })}
              {fv["omt_female.position"] !== false && renderFieldRow("Положение", uterus.position || "Нажмите для ввода", "select", Boolean(uterus.position), { options: UTERUS_POSITION_OPTIONS, onSelectOption: (v) => onUpdateUterusField("position", v) })}
            </>
          )}
          {(fv["omt_female.myometriumStructure"] !== false || fv["omt_female.myometriumStructureText"] !== false || fv["omt_female.myometriumEchogenicity"] !== false) && (
            <>
              <ProtocolSectionHeader title="Строение миометрия" />
              {fv["omt_female.myometriumStructure"] !== false && renderFieldRow("Структура", uterus.myometriumStructure || "Нажмите для ввода", "select", Boolean(uterus.myometriumStructure), { options: UTERUS_STRUCTURE_OPTIONS, onSelectOption: (v) => onUpdateUterusField("myometriumStructure", v) })}
              {showMyometriumText && fv["omt_female.myometriumStructureText"] !== false && renderFieldRow("Описание", uterus.myometriumStructureText || "Нажмите для ввода", "text", Boolean(uterus.myometriumStructureText), { onPress: () => openEditor({ title: "Матка: описание строения миометрия", mode: "text", value: uterus.myometriumStructureText, placeholder: "Введите описание", multiline: true, onSave: (v) => onUpdateUterusField("myometriumStructureText", v) }) })}
              {fv["omt_female.myometriumEchogenicity"] !== false && renderFieldRow("Эхогенность", uterus.myometriumEchogenicity || "Нажмите для ввода", "select", Boolean(uterus.myometriumEchogenicity), { options: UTERUS_ECHOGENICITY_OPTIONS, onSelectOption: (v) => onUpdateUterusField("myometriumEchogenicity", v) })}
            </>
          )}
          {fv["omt_female.myomaNodesPresence"] !== false && (
            <>
              <ProtocolSectionHeader title="Объемные образования" />
              {renderFieldRow("Миоматозные узлы", uterus.myomaNodesPresence || "Нажмите для ввода", "select", Boolean(uterus.myomaNodesPresence), { options: YES_NO_OPTIONS, onSelectOption: (v) => onUpdateUterusField("myomaNodesPresence", v) })}
              {showMyomaNodes && (
                <View style={styles.obpFieldList}>
                  {uterus.myomaNodesList.length === 0 ? (
                    <Text style={styles.helperText}>Добавьте хотя бы один узел.</Text>
                  ) : (
                    uterus.myomaNodesList.map((node, i) => (
                      <OmtFemaleMyomaNodeCard key={`myoma-${i}`} styles={styles} node={node} index={i}
                        openEditor={openEditor} onUpdateNode={onUpdateMyomaNode} onRemoveNode={onRemoveMyomaNode}
                        numpadApi={numpadApi} />
                    ))
                  )}
                  <ProtocolActionButton label="+ Миоматозный узел" onPress={onAddMyomaNode} />
                </View>
              )}
            </>
          )}
          {(fv["omt_female.endometriumSize"] !== false || fv["omt_female.endometriumStructure"] !== false) && (
            <>
              <ProtocolSectionHeader title="Эндометрий" />
              {fv["omt_female.endometriumSize"] !== false && renderFieldRow("Размер (мм)", uterus.endometriumSize || "Нажмите для ввода", "numpad", Boolean(uterus.endometriumSize), { onPress: () => openEditor({ title: "Матка: размер эндометрия", mode: "number", value: uterus.endometriumSize, placeholder: "мм", onSave: (v) => onUpdateUterusField("endometriumSize", v) }) })}
              {fv["omt_female.endometriumStructure"] !== false && renderFieldRow("Структура", uterus.endometriumStructure || "Нажмите для ввода", "select", Boolean(uterus.endometriumStructure), { options: ENDOMETRIUM_STRUCTURE_OPTIONS, onSelectOption: (v) => onUpdateUterusField("endometriumStructure", v) })}
            </>
          )}
          {(fv["omt_female.cervixSize"] !== false || fv["omt_female.cervixEchostructure"] !== false || fv["omt_female.cervixEchostructureText"] !== false || fv["omt_female.cervicalCanal"] !== false || fv["omt_female.cervicalCanalText"] !== false || fv["omt_female.freeFluid"] !== false || fv["omt_female.freeFluidText"] !== false) && (
            <>
              <ProtocolSectionHeader title="Шейка матки" />
              {fv["omt_female.cervixSize"] !== false && renderFieldRow("Размер шейки (мм)", uterus.cervixSize || "Нажмите для ввода", "numpad", Boolean(uterus.cervixSize), { onPress: () => openEditor({ title: "Шейка матки: размер", mode: "number", value: uterus.cervixSize, placeholder: "мм", onSave: (v) => onUpdateUterusField("cervixSize", v) }) })}
              {fv["omt_female.cervixEchostructure"] !== false && renderFieldRow("Эхоструктура", uterus.cervixEchostructure || "Нажмите для ввода", "select", Boolean(uterus.cervixEchostructure), { options: CERVIX_ECHOSTRUCTURE_OPTIONS, onSelectOption: (v) => onUpdateUterusField("cervixEchostructure", v) })}
              {showCervixEchostructureText && fv["omt_female.cervixEchostructureText"] !== false && renderFieldRow("Описание", uterus.cervixEchostructureText || "Нажмите для ввода", "text", Boolean(uterus.cervixEchostructureText), { onPress: () => openEditor({ title: "Шейка матки: описание эхоструктуры", mode: "text", value: uterus.cervixEchostructureText, placeholder: "Введите описание", multiline: true, onSave: (v) => onUpdateUterusField("cervixEchostructureText", v) }) })}
              {fv["omt_female.cervicalCanal"] !== false && renderFieldRow("Цервикальный канал", uterus.cervicalCanal || "Нажмите для ввода", "select", Boolean(uterus.cervicalCanal), { options: CERVICAL_CANAL_OPTIONS, onSelectOption: (v) => onUpdateUterusField("cervicalCanal", v) })}
              {showCervicalCanalText && fv["omt_female.cervicalCanalText"] !== false && renderFieldRow("Описание", uterus.cervicalCanalText || "Нажмите для ввода", "text", Boolean(uterus.cervicalCanalText), { onPress: () => openEditor({ title: "Шейка матки: описание канала", mode: "text", value: uterus.cervicalCanalText, placeholder: "Введите описание", multiline: true, onSave: (v) => onUpdateUterusField("cervicalCanalText", v) }) })}
              {(fv["omt_female.freeFluid"] !== false || fv["omt_female.freeFluidText"] !== false) && (
                <>
                  <ProtocolSectionHeader title="Свободная жидкость" />
                  {fv["omt_female.freeFluid"] !== false && renderFieldRow("Свободная жидкость", uterus.freeFluid || "Нажмите для ввода", "select", Boolean(uterus.freeFluid), { options: FREE_FLUID_OPTIONS, onSelectOption: (v) => onUpdateUterusField("freeFluid", v) })}
                  {showFreeFluidText && fv["omt_female.freeFluidText"] !== false && renderFieldRow("Описание", uterus.freeFluidText || "Нажмите для ввода", "text", Boolean(uterus.freeFluidText), { onPress: () => openEditor({ title: "Матка: описание свободной жидкости", mode: "text", value: uterus.freeFluidText, placeholder: "Введите описание", multiline: true, onSave: (v) => onUpdateUterusField("freeFluidText", v) }) })}
                </>
              )}
            </>
          )}
          {fv["omt_female.additional"] !== false && (
            <>
              <ProtocolSectionHeader title="Дополнительно" />
              {renderFieldRow("Дополнительно", uterus.additional || "Нажмите для ввода", "text", Boolean(uterus.additional), { onPress: () => openEditor({ title: "Матка: дополнительно", mode: "text", value: uterus.additional, placeholder: "Введите дополнительное описание", multiline: true, onSave: (v) => onUpdateUterusField("additional", v) }) })}
            </>
          )}
        </View>
      )}
    </View>
  );
}