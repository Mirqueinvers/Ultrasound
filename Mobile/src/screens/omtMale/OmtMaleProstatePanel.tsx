import { View } from "react-native";

import { ProtocolFieldRow } from "../../components/protocol/ProtocolFieldRow";
import { ProtocolOrganHeader, ProtocolSectionHeader } from "../../components/protocol/ProtocolHeaders";
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
  openEditor: (config: NonNullable<EditorState>) => void;
  onUpdateProstateField: (field: keyof ProstateDraft, value: string) => void;
};

export function OmtMaleProstatePanel({
  styles,
  prostate,
  fv,
  isVisible,
  openEditor,
  onUpdateProstateField,
}: OmtMaleProstatePanelProps) {
  if (!isVisible) return null;

  const isOrdinaryPosition = isNormalizedMatch(prostate.position, "обычное");
  const showEchotextureText = isNormalizedMatch(prostate.echotexture, "неоднородная");
  const showPathologicLesionsText = isNormalizedMatch(prostate.pathologicLesions, "определяются");
  const showProtrusionMm = isNormalizedMatch(prostate.bladderProtrusion, "выступает");

  return (
    <View style={styles.kidneyPlainSection}>
      <ProtocolOrganHeader title="Простата" />
      <View style={styles.obpFieldList}>
        <ProtocolSectionHeader title="Информация об исследовании" />
        <ProtocolFieldRow
          label="Вид исследования"
          value={prostate.studyType || "Нажмите для ввода"}
          typeLabel="select"
          filled={Boolean(prostate.studyType)}
          options={PROSTATE_STUDY_TYPE_OPTIONS}
          onSelectOption={(nextValue) => onUpdateProstateField("studyType", nextValue)}
        />

        <ProtocolSectionHeader title="Положение" />
        <ProtocolFieldRow
          label="Положение"
          value={prostate.position || "Нажмите для ввода"}
          typeLabel="select"
          filled={Boolean(prostate.position)}
          options={PROSTATE_POSITION_OPTIONS}
          onSelectOption={(nextValue) => onUpdateProstateField("position", nextValue)}
        />

        {isOrdinaryPosition && fv["omt_male.prostate.sizes"] !== false && (
          <>
            <ProtocolSectionHeader title="Размеры" />
            <ProtocolFieldRow
              label="Длина (мм)" value={prostate.length || "Нажмите для ввода"}
              typeLabel="numpad" filled={Boolean(prostate.length)}
              onPress={() => openEditor({ title: "Простата: длина", mode: "number", value: prostate.length, placeholder: "мм", onSave: (v) => onUpdateProstateField("length", v) })}
            />
            <ProtocolFieldRow
              label="Ширина (мм)" value={prostate.width || "Нажмите для ввода"}
              typeLabel="numpad" filled={Boolean(prostate.width)}
              onPress={() => openEditor({ title: "Простата: ширина", mode: "number", value: prostate.width, placeholder: "мм", onSave: (v) => onUpdateProstateField("width", v) })}
            />
            <ProtocolFieldRow
              label="ПЗР (мм)" value={prostate.apDimension || "Нажмите для ввода"}
              typeLabel="numpad" filled={Boolean(prostate.apDimension)}
              onPress={() => openEditor({ title: "Простата: ПЗР", mode: "number", value: prostate.apDimension, placeholder: "мм", onSave: (v) => onUpdateProstateField("apDimension", v) })}
            />
            <ProtocolFieldRow
              label="Объем (см³)" value={prostate.volume || "Рассчитывается автоматически"}
              typeLabel="auto" filled={Boolean(prostate.volume)} readonly
            />
          </>
        )}

        {isOrdinaryPosition && fv["omt_male.prostate.contour"] !== false && (
          <>
            <ProtocolSectionHeader title="Контур" />
            <ProtocolFieldRow label="Контур" value={prostate.contour || "Нажмите для ввода"}
              typeLabel="select" filled={Boolean(prostate.contour)} options={PROSTATE_CONTOUR_OPTIONS}
              onSelectOption={(v) => onUpdateProstateField("contour", v)}
            />
            <ProtocolSectionHeader title="Симметричность" />
            <ProtocolFieldRow label="Симметричность" value={prostate.symmetry || "Нажмите для ввода"}
              typeLabel="select" filled={Boolean(prostate.symmetry)} options={PROSTATE_SYMMETRY_OPTIONS}
              onSelectOption={(v) => onUpdateProstateField("symmetry", v)}
            />
            <ProtocolSectionHeader title="Форма" />
            <ProtocolFieldRow label="Форма" value={prostate.shape || "Нажмите для ввода"}
              typeLabel="select" filled={Boolean(prostate.shape)} options={PROSTATE_SHAPE_OPTIONS}
              onSelectOption={(v) => onUpdateProstateField("shape", v)}
            />
          </>
        )}

        {isOrdinaryPosition && fv["omt_male.prostate.echogenicity"] !== false && (
          <>
            <ProtocolSectionHeader title="Эхогенность" />
            <ProtocolFieldRow label="Эхогенность" value={prostate.echogenicity || "Нажмите для ввода"}
              typeLabel="select" filled={Boolean(prostate.echogenicity)} options={PROSTATE_ECHOGENICITY_OPTIONS}
              onSelectOption={(v) => onUpdateProstateField("echogenicity", v)}
            />
            <ProtocolSectionHeader title="Эхоструктура" />
            <ProtocolFieldRow label="Эхоструктура" value={prostate.echotexture || "Нажмите для ввода"}
              typeLabel="select" filled={Boolean(prostate.echotexture)} options={PROSTATE_ECHOTEXTURE_OPTIONS}
              onSelectOption={(v) => onUpdateProstateField("echotexture", v)}
            />
            {showEchotextureText && (
              <ProtocolFieldRow label="Описание" value={prostate.echotextureText || "Нажмите для ввода"}
                typeLabel="text" filled={Boolean(prostate.echotextureText)}
                onPress={() => openEditor({ title: "Простата: описание эхоструктуры", mode: "text", value: prostate.echotextureText, placeholder: "Введите описание", multiline: true, onSave: (v) => onUpdateProstateField("echotextureText", v) })}
              />
            )}

            <ProtocolSectionHeader title="В просвет мочевого пузыря" />
            <ProtocolFieldRow label="Выпячивание" value={prostate.bladderProtrusion || "Нажмите для ввода"}
              typeLabel="select" filled={Boolean(prostate.bladderProtrusion)} options={PROSTATE_BLAADDER_PROTRUSION_OPTIONS}
              onSelectOption={(v) => onUpdateProstateField("bladderProtrusion", v)}
            />
            {showProtrusionMm && (
              <ProtocolFieldRow label="Выпячивание на (мм)" value={prostate.bladderProtrusionMm || "Нажмите для ввода"}
                typeLabel="numpad" filled={Boolean(prostate.bladderProtrusionMm)}
                onPress={() => openEditor({ title: "Простата: выпячивание на (мм)", mode: "number", value: prostate.bladderProtrusionMm, placeholder: "мм", onSave: (v) => onUpdateProstateField("bladderProtrusionMm", v) })}
              />
            )}

            <ProtocolSectionHeader title="Патологические образования" />
            <ProtocolFieldRow label="Определение" value={prostate.pathologicLesions || "Нажмите для ввода"}
              typeLabel="select" filled={Boolean(prostate.pathologicLesions)} options={YES_NO_OPTIONS}
              onSelectOption={(v) => onUpdateProstateField("pathologicLesions", v)}
            />
            {showPathologicLesionsText && (
              <ProtocolFieldRow label="Описание" value={prostate.pathologicLesionsText || "Нажмите для ввода"}
                typeLabel="text" filled={Boolean(prostate.pathologicLesionsText)}
                onPress={() => openEditor({ title: "Простата: описание патологических образований", mode: "text", value: prostate.pathologicLesionsText, placeholder: "Введите описание", multiline: true, onSave: (v) => onUpdateProstateField("pathologicLesionsText", v) })}
              />
            )}
          </>
        )}

        {fv["omt_male.prostate.additional"] !== false && (
          <>
            <ProtocolSectionHeader title="Дополнительно" />
            <ProtocolFieldRow label="Дополнительно" value={prostate.additional || "Нажмите для ввода"}
              typeLabel="text" filled={Boolean(prostate.additional)}
              onPress={() => openEditor({ title: "Простата: дополнительно", mode: "text", value: prostate.additional, placeholder: "Введите дополнительное описание", multiline: true, onSave: (v) => onUpdateProstateField("additional", v) })}
            />
          </>
        )}
      </View>
    </View>
  );
}
