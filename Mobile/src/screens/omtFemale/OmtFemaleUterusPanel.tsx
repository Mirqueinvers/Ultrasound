import { Text, View } from "react-native";

import { ProtocolActionButton } from "../../components/protocol/ProtocolActionButton";
import { ProtocolFieldRow } from "../../components/protocol/ProtocolFieldRow";
import { ProtocolOrganHeader, ProtocolSectionHeader } from "../../components/protocol/ProtocolHeaders";
import type { UterusDraft } from "../../shared/omtFemaleDraft";
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

type OmtFemaleUterusPanelProps = {
  styles: AppStyles;
  uterus: UterusDraft;
  fv: Record<string, boolean>;
  isVisible: boolean;
  openEditor: (config: NonNullable<EditorState>) => void;
  onUpdateUterusField: (field: keyof UterusDraft, value: string) => void;
  onAddMyomaNode: () => void;
  onUpdateMyomaNode: (index: number, field: keyof import("../../shared/omtFemaleDraft").UterusNodeDraft, value: string) => void;
  onRemoveMyomaNode: (index: number) => void;
};

export function OmtFemaleUterusPanel({
  styles, uterus, fv, isVisible, openEditor, onUpdateUterusField,
  onAddMyomaNode, onUpdateMyomaNode, onRemoveMyomaNode,
}: OmtFemaleUterusPanelProps) {
  if (!isVisible) return null;

  const showMyomaNodes = isNormalizedMatch(uterus.myomaNodesPresence, "определяются");
  const showMyometriumText = isNormalizedMatch(uterus.myometriumStructure, "неоднородная");
  const showUterineCavityText = isNormalizedMatch(uterus.uterineCavity, "расширена");
  const showCervicalCanalText = isNormalizedMatch(uterus.cervicalCanal, "расширен");
  const showFreeFluidText = isNormalizedMatch(uterus.freeFluid, "определяется");
  const showCervixEchostructureText = isNormalizedMatch(uterus.cervixEchostructure, "неоднородная");

  return (
    <View style={styles.kidneyPlainSection}>
      <ProtocolOrganHeader title="Матка" />
      <View style={styles.obpFieldList}>
        <ProtocolSectionHeader title="Положение" />
        <ProtocolFieldRow label="Положение матки" value={uterus.uterusStatus || "Нажмите для ввода"}
          typeLabel="select" filled={Boolean(uterus.uterusStatus)} options={UTERUS_STATUS_OPTIONS}
          onSelectOption={(v) => onUpdateUterusField("uterusStatus", v)} />

        {fv["omt_female.information"] !== false && (
          <>
            <ProtocolSectionHeader title="Информация об исследовании" />
            <ProtocolFieldRow label="Вид исследования" value={uterus.studyType || "Нажмите для ввода"}
              typeLabel="select" filled={Boolean(uterus.studyType)} options={UTERUS_STUDY_TYPE_OPTIONS}
              onSelectOption={(v) => onUpdateUterusField("studyType", v)} />
            <ProtocolFieldRow label="Дата последней менструации" value={formatDateDisplay(uterus.lastMenstruationDate) || "Нажмите для ввода"}
              typeLabel="numpad" filled={Boolean(uterus.lastMenstruationDate)}
              onPress={() => openEditor({ title: "Дата последней менструации", mode: "number", value: getDateEditorValue(uterus.lastMenstruationDate), placeholder: "дд.мм.гггг", onSave: (v) => onUpdateUterusField("lastMenstruationDate", parseDateInput(v)) })} />
            <ProtocolFieldRow label="День цикла" value={uterus.cycleDay || "Рассчитывается автоматически"}
              typeLabel="auto" filled={Boolean(uterus.cycleDay)} readonly />
            <ProtocolFieldRow label="Менопауза" value={uterus.menopause || "Нажмите для ввода"}
              typeLabel="select" filled={Boolean(uterus.menopause)} options={MENOPAUSE_OPTIONS}
              onSelectOption={(v) => onUpdateUterusField("menopause", v)} />
          </>
        )}

        {fv["omt_female.uterus.sizes"] !== false && (
          <>
            <ProtocolSectionHeader title="Размеры" />
            <ProtocolFieldRow label="Длина (мм)" value={uterus.length || "Нажмите для ввода"}
              typeLabel="numpad" filled={Boolean(uterus.length)}
              onPress={() => openEditor({ title: "Матка: длина", mode: "number", value: uterus.length, placeholder: "мм", onSave: (v) => onUpdateUterusField("length", v) })} />
            <ProtocolFieldRow label="Ширина (мм)" value={uterus.width || "Нажмите для ввода"}
              typeLabel="numpad" filled={Boolean(uterus.width)}
              onPress={() => openEditor({ title: "Матка: ширина", mode: "number", value: uterus.width, placeholder: "мм", onSave: (v) => onUpdateUterusField("width", v) })} />
            <ProtocolFieldRow label="ПЗР (мм)" value={uterus.apDimension || "Нажмите для ввода"}
              typeLabel="numpad" filled={Boolean(uterus.apDimension)}
              onPress={() => openEditor({ title: "Матка: ПЗР", mode: "number", value: uterus.apDimension, placeholder: "мм", onSave: (v) => onUpdateUterusField("apDimension", v) })} />
            <ProtocolFieldRow label="Объем (см³)" value={uterus.volume || "Рассчитывается автоматически"}
              typeLabel="auto" filled={Boolean(uterus.volume)} readonly />
          </>
        )}

        {fv["omt_female.uterus.shape"] !== false && (
          <>
            <ProtocolSectionHeader title="Форма" />
            <ProtocolFieldRow label="Форма" value={uterus.shape || "Нажмите для ввода"}
              typeLabel="select" filled={Boolean(uterus.shape)} options={UTERUS_SHAPE_OPTIONS}
              onSelectOption={(v) => onUpdateUterusField("shape", v)} />
            <ProtocolFieldRow label="Положение" value={uterus.position || "Нажмите для ввода"}
              typeLabel="select" filled={Boolean(uterus.position)} options={UTERUS_POSITION_OPTIONS}
              onSelectOption={(v) => onUpdateUterusField("position", v)} />
          </>
        )}

        {fv["omt_female.uterus.myometrium"] !== false && (
          <>
            <ProtocolSectionHeader title="Строение миометрия" />
            <ProtocolFieldRow label="Структура" value={uterus.myometriumStructure || "Нажмите для ввода"}
              typeLabel="select" filled={Boolean(uterus.myometriumStructure)} options={UTERUS_STRUCTURE_OPTIONS}
              onSelectOption={(v) => onUpdateUterusField("myometriumStructure", v)} />
            {showMyometriumText && (
              <ProtocolFieldRow label="Описание" value={uterus.myometriumStructureText || "Нажмите для ввода"}
                typeLabel="text" filled={Boolean(uterus.myometriumStructureText)}
                onPress={() => openEditor({ title: "Матка: описание строения миометрия", mode: "text", value: uterus.myometriumStructureText, placeholder: "Введите описание", multiline: true, onSave: (v) => onUpdateUterusField("myometriumStructureText", v) })} />
            )}
            <ProtocolFieldRow label="Эхогенность" value={uterus.myometriumEchogenicity || "Нажмите для ввода"}
              typeLabel="select" filled={Boolean(uterus.myometriumEchogenicity)} options={UTERUS_ECHOGENICITY_OPTIONS}
              onSelectOption={(v) => onUpdateUterusField("myometriumEchogenicity", v)} />
          </>
        )}

        {fv["omt_female.uterus.myoma"] !== false && (
          <>
            <ProtocolSectionHeader title="Объемные образования" />
            <ProtocolFieldRow label="Миоматозные узлы" value={uterus.myomaNodesPresence || "Нажмите для ввода"}
              typeLabel="select" filled={Boolean(uterus.myomaNodesPresence)} options={YES_NO_OPTIONS}
              onSelectOption={(v) => onUpdateUterusField("myomaNodesPresence", v)} />
            {showMyomaNodes && (
              <View style={styles.obpFieldList}>
                {uterus.myomaNodesList.length === 0 ? (
                  <Text style={styles.helperText}>Добавьте хотя бы один узел.</Text>
                ) : (
                  uterus.myomaNodesList.map((node, i) => (
                    <OmtFemaleMyomaNodeCard key={`myoma-${i}`} styles={styles} node={node} index={i}
                      openEditor={openEditor} onUpdateNode={onUpdateMyomaNode} onRemoveNode={onRemoveMyomaNode} />
                  ))
                )}
                <ProtocolActionButton label="+ Миоматозный узел" onPress={onAddMyomaNode} />
              </View>
            )}
          </>
        )}

        {fv["omt_female.uterus.endometrium"] !== false && (
          <>
            <ProtocolSectionHeader title="Эндометрий" />
            <ProtocolFieldRow label="Размер (мм)" value={uterus.endometriumSize || "Нажмите для ввода"}
              typeLabel="numpad" filled={Boolean(uterus.endometriumSize)}
              onPress={() => openEditor({ title: "Матка: размер эндометрия", mode: "number", value: uterus.endometriumSize, placeholder: "мм", onSave: (v) => onUpdateUterusField("endometriumSize", v) })} />
            <ProtocolFieldRow label="Структура" value={uterus.endometriumStructure || "Нажмите для ввода"}
              typeLabel="select" filled={Boolean(uterus.endometriumStructure)} options={ENDOMETRIUM_STRUCTURE_OPTIONS}
              onSelectOption={(v) => onUpdateUterusField("endometriumStructure", v)} />
          </>
        )}

        {fv["omt_female.uterus.cervix"] !== false && (
          <>
            <ProtocolSectionHeader title="Шейка матки" />
            <ProtocolFieldRow label="Размер шейки (мм)" value={uterus.cervixSize || "Нажмите для ввода"}
              typeLabel="numpad" filled={Boolean(uterus.cervixSize)}
              onPress={() => openEditor({ title: "Шейка матки: размер", mode: "number", value: uterus.cervixSize, placeholder: "мм", onSave: (v) => onUpdateUterusField("cervixSize", v) })} />
            <ProtocolFieldRow label="Эхоструктура" value={uterus.cervixEchostructure || "Нажмите для ввода"}
              typeLabel="select" filled={Boolean(uterus.cervixEchostructure)} options={CERVIX_ECHOSTRUCTURE_OPTIONS}
              onSelectOption={(v) => onUpdateUterusField("cervixEchostructure", v)} />
            {showCervixEchostructureText && (
              <ProtocolFieldRow label="Описание" value={uterus.cervixEchostructureText || "Нажмите для ввода"}
                typeLabel="text" filled={Boolean(uterus.cervixEchostructureText)}
                onPress={() => openEditor({ title: "Шейка матки: описание эхоструктуры", mode: "text", value: uterus.cervixEchostructureText, placeholder: "Введите описание", multiline: true, onSave: (v) => onUpdateUterusField("cervixEchostructureText", v) })} />
            )}
            <ProtocolFieldRow label="Цервикальный канал" value={uterus.cervicalCanal || "Нажмите для ввода"}
              typeLabel="select" filled={Boolean(uterus.cervicalCanal)} options={CERVICAL_CANAL_OPTIONS}
              onSelectOption={(v) => onUpdateUterusField("cervicalCanal", v)} />
            {showCervicalCanalText && (
              <ProtocolFieldRow label="Описание" value={uterus.cervicalCanalText || "Нажмите для ввода"}
                typeLabel="text" filled={Boolean(uterus.cervicalCanalText)}
                onPress={() => openEditor({ title: "Шейка матки: описание канала", mode: "text", value: uterus.cervicalCanalText, placeholder: "Введите описание", multiline: true, onSave: (v) => onUpdateUterusField("cervicalCanalText", v) })} />
            )}

            <ProtocolSectionHeader title="Свободная жидкость" />
            <ProtocolFieldRow label="Свободная жидкость" value={uterus.freeFluid || "Нажмите для ввода"}
              typeLabel="select" filled={Boolean(uterus.freeFluid)} options={FREE_FLUID_OPTIONS}
              onSelectOption={(v) => onUpdateUterusField("freeFluid", v)} />
            {showFreeFluidText && (
              <ProtocolFieldRow label="Описание" value={uterus.freeFluidText || "Нажмите для ввода"}
                typeLabel="text" filled={Boolean(uterus.freeFluidText)}
                onPress={() => openEditor({ title: "Матка: описание свободной жидкости", mode: "text", value: uterus.freeFluidText, placeholder: "Введите описание", multiline: true, onSave: (v) => onUpdateUterusField("freeFluidText", v) })} />
            )}
          </>
        )}

        {fv["omt_female.uterus.additional"] !== false && (
          <>
            <ProtocolSectionHeader title="Дополнительно" />
            <ProtocolFieldRow label="Дополнительно" value={uterus.additional || "Нажмите для ввода"}
              typeLabel="text" filled={Boolean(uterus.additional)}
              onPress={() => openEditor({ title: "Матка: дополнительно", mode: "text", value: uterus.additional, placeholder: "Введите дополнительное описание", multiline: true, onSave: (v) => onUpdateUterusField("additional", v) })} />
          </>
        )}
      </View>
    </View>
  );
}
