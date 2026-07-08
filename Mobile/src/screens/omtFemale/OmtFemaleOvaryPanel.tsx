import { Text, View } from "react-native";

import { ProtocolActionButton } from "../../components/protocol/ProtocolActionButton";
import { ProtocolFieldRow } from "../../components/protocol/ProtocolFieldRow";
import { ProtocolOrganHeader, ProtocolSectionHeader } from "../../components/protocol/ProtocolHeaders";
import type { OvaryDraft } from "../../shared/omtFemaleDraft";
import { isNormalizedMatch } from "../../shared/normalizeSelectValue";
import type { AppStyles } from "../../styles/appStyles";
import {
  OVARY_CONTOUR_OPTIONS,
  OVARY_POSITION_OPTIONS,
  OVARY_SHAPE_OPTIONS,
  YES_NO_OPTIONS,
  type EditorState,
} from "./omtFemaleFieldConfigs";
import { OmtFemaleOvaryCystCard } from "./OmtFemaleOvaryCystCard";

type OmtFemaleOvaryPanelProps = {
  styles: AppStyles;
  side: "left" | "right";
  ovary: OvaryDraft;
  fv: Record<string, boolean>;
  isVisible: boolean;
  isLandscape?: boolean;
  openEditor: (config: NonNullable<EditorState>) => void;
  onUpdateOvaryField: (side: "left" | "right", field: keyof OvaryDraft, value: string) => void;
  onAddCyst: (side: "left" | "right") => void;
  onUpdateCyst: (side: "left" | "right", index: number, first?: string, second?: string) => void;
  onRemoveCyst: (side: "left" | "right", index: number) => void;
};

export function OmtFemaleOvaryPanel({
  styles, side, ovary, fv, isVisible, isLandscape, openEditor, onUpdateOvaryField, onAddCyst, onUpdateCyst, onRemoveCyst,
}: OmtFemaleOvaryPanelProps) {
  if (!isVisible) return null;
  const title = side === "right" ? "Правый яичник" : "Левый яичник";
  const isOvaryVisible = isNormalizedMatch(ovary.position, "обычное");
  const showCysts = isNormalizedMatch(ovary.cysts, "определяются");
  const showFormations = isNormalizedMatch(ovary.formations, "определяются");

  return (
    <View style={styles.kidneyPlainSection}>
      <ProtocolOrganHeader title={title} />
      <View style={styles.obpFieldList}>
        {fv["omt_female.ovaryPosition"] !== false && (
          <ProtocolFieldRow label="Положение" value={ovary.position || "Нажмите для ввода"}
            typeLabel="select" filled={Boolean(ovary.position)} compact={isLandscape} options={OVARY_POSITION_OPTIONS}
            onSelectOption={(v) => onUpdateOvaryField(side, "position", v)} />
        )}

        {isOvaryVisible && (
          <>
            {(fv["omt_female.ovaryLength"] !== false || fv["omt_female.ovaryWidth"] !== false || fv["omt_female.ovaryThickness"] !== false || fv["omt_female.ovaryVolume"] !== false) && (
              <>
                <ProtocolSectionHeader title="Размеры" />
                {fv["omt_female.ovaryLength"] !== false && (
                  <ProtocolFieldRow label="Длина (мм)" value={ovary.length || "Нажмите для ввода"}
                    typeLabel="numpad" filled={Boolean(ovary.length)} compact={isLandscape}
                    onPress={() => openEditor({ title: `${title}: длина`, mode: "number", value: ovary.length, placeholder: "мм", onSave: (v) => onUpdateOvaryField(side, "length", v) })} />
                )}
                {fv["omt_female.ovaryWidth"] !== false && (
                  <ProtocolFieldRow label="Ширина (мм)" value={ovary.width || "Нажмите для ввода"}
                    typeLabel="numpad" filled={Boolean(ovary.width)} compact={isLandscape}
                    onPress={() => openEditor({ title: `${title}: ширина`, mode: "number", value: ovary.width, placeholder: "мм", onSave: (v) => onUpdateOvaryField(side, "width", v) })} />
                )}
                {fv["omt_female.ovaryThickness"] !== false && (
                  <ProtocolFieldRow label="Толщина (мм)" value={ovary.thickness || "Нажмите для ввода"}
                    typeLabel="numpad" filled={Boolean(ovary.thickness)} compact={isLandscape}
                    onPress={() => openEditor({ title: `${title}: толщина`, mode: "number", value: ovary.thickness, placeholder: "мм", onSave: (v) => onUpdateOvaryField(side, "thickness", v) })} />
                )}
                {fv["omt_female.ovaryVolume"] !== false && (
                  <ProtocolFieldRow label="Объем (см³)" value={ovary.volume || "Рассчитывается автоматически"}
                    typeLabel="auto" filled={Boolean(ovary.volume)} readonly compact={isLandscape} />
                )}
              </>
            )}

            {(fv["omt_female.ovaryShape"] !== false || fv["omt_female.ovaryContour"] !== false) && (
              <>
                <ProtocolSectionHeader title="Строение" />
                {fv["omt_female.ovaryShape"] !== false && (
                  <ProtocolFieldRow label="Форма" value={ovary.shape || "Нажмите для ввода"}
                    typeLabel="select" filled={Boolean(ovary.shape)} compact={isLandscape} options={OVARY_SHAPE_OPTIONS}
                    onSelectOption={(v) => onUpdateOvaryField(side, "shape", v)} />
                )}
                {fv["omt_female.ovaryContour"] !== false && (
                  <ProtocolFieldRow label="Контур" value={ovary.contour || "Нажмите для ввода"}
                    typeLabel="select" filled={Boolean(ovary.contour)} compact={isLandscape} options={OVARY_CONTOUR_OPTIONS}
                    onSelectOption={(v) => onUpdateOvaryField(side, "contour", v)} />
                )}
              </>
            )}
          </>
        )}

        {fv["omt_female.ovaryCysts"] !== false && (
          <>
            <ProtocolSectionHeader title="Кисты" />
            <ProtocolFieldRow label="Определение" value={ovary.cysts || "Нажмите для ввода"}
              typeLabel="select" filled={Boolean(ovary.cysts)} compact={isLandscape} options={YES_NO_OPTIONS}
              onSelectOption={(v) => onUpdateOvaryField(side, "cysts", v)} />
            {showCysts && (
              <View style={styles.obpFieldList}>
                {ovary.cystsList.length === 0 ? (
                  <Text style={styles.helperText}>Добавьте хотя бы одну кисту.</Text>
                ) : (
                  ovary.cystsList.map((cyst, i) => (
                    <OmtFemaleOvaryCystCard key={`cyst-${i}`} styles={styles} cyst={cyst} index={i}
                      side={side} openEditor={openEditor} onUpdateCyst={onUpdateCyst} onRemoveCyst={onRemoveCyst} />
                  ))
                )}
                <ProtocolActionButton label="+ Киста" onPress={() => onAddCyst(side)} />
              </View>
            )}
          </>
        )}

        {fv["omt_female.ovaryFormations"] !== false && (
          <>
            <ProtocolSectionHeader title="Образования" />
            <ProtocolFieldRow label="Определение" value={ovary.formations || "Нажмите для ввода"}
              typeLabel="select" filled={Boolean(ovary.formations)} compact={isLandscape} options={YES_NO_OPTIONS}
              onSelectOption={(v) => onUpdateOvaryField(side, "formations", v)} />
            {showFormations && (
              <ProtocolFieldRow label="Описание" value={ovary.formationsText || "Нажмите для ввода"}
                typeLabel="text" filled={Boolean(ovary.formationsText)} compact={isLandscape}
                onPress={() => openEditor({ title: `${title}: описание образований`, mode: "text", value: ovary.formationsText, placeholder: "Введите описание", multiline: true, onSave: (v) => onUpdateOvaryField(side, "formationsText", v) })} />
            )}
          </>
        )}

        {fv["omt_female.ovaryAdditional"] !== false && (
          <>
            <ProtocolSectionHeader title="Дополнительно" />
            <ProtocolFieldRow label="Дополнительно" value={ovary.additional || "Нажмите для ввода"}
              typeLabel="text" filled={Boolean(ovary.additional)} compact={isLandscape}
              onPress={() => openEditor({ title: `${title}: дополнительно`, mode: "text", value: ovary.additional, placeholder: "Введите дополнительное описание", multiline: true, onSave: (v) => onUpdateOvaryField(side, "additional", v) })} />
          </>
        )}
      </View>
    </View>
  );
}