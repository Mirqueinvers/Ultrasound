import { useCallback } from "react";
import type { LayoutChangeEvent } from "react-native";
import { Text, View } from "react-native";

import { ProtocolActionButton } from "../../components/protocol/ProtocolActionButton";
import { ProtocolFieldRow } from "../../components/protocol/ProtocolFieldRow";
import { ProtocolOrganHeader, ProtocolSectionHeader } from "../../components/protocol/ProtocolHeaders";
import type { OvaryDraft, OvaryCystDraft } from "../../shared/omtFemaleDraft";
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

import type { NumpadApi } from "../../components/InlineNumpad";

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
  numpadApi: NumpadApi;
};

const NUMBER_FIELDS = new Set(["length", "width", "thickness"]);

export function OmtFemaleOvaryPanel({
  styles, side, ovary, fv, isVisible, isLandscape, openEditor, onUpdateOvaryField, onAddCyst, onUpdateCyst, onRemoveCyst, numpadApi,
}: OmtFemaleOvaryPanelProps) {
  if (!isVisible) return null;
  const title = side === "right" ? "Правый яичник" : "Левый яичник";
  const isOvaryVisible = isNormalizedMatch(ovary.position, "обычное");
  const showCysts = isNormalizedMatch(ovary.cysts, "определяются");
  const showFormations = isNormalizedMatch(ovary.formations, "определяются");

  const getNumberFieldPress = useCallback(
    (fieldKey: string) => {
      if (!isLandscape) return undefined;
      return () => {
        const fieldView = numpadApi.fieldRefs.current[`ovary-${side}-${fieldKey}`] ?? null;
        numpadApi.openNumpad(
          `ovary-${side}-${fieldKey}`,
          fieldView,
          ovary[fieldKey as keyof OvaryDraft] as string,
          (nextValue) => onUpdateOvaryField(side, fieldKey as keyof OvaryDraft, nextValue),
        );
      };
    },
    [isLandscape, numpadApi, ovary, side, onUpdateOvaryField],
  );

  const getNumberFieldLayout = useCallback(
    (fieldKey: string) => {
      if (!isLandscape) return undefined;
      return (event: LayoutChangeEvent) => numpadApi.handleFieldLayout(`ovary-${side}-${fieldKey}`, event);
    },
    [isLandscape, numpadApi, side],
  );

  const renderNumberField = (label: string, fieldKey: string, value: string, filled: boolean) => {
    if (isLandscape) {
      return (
        <View
          key={fieldKey}
          ref={(el) => { numpadApi.fieldRefs.current[`ovary-${side}-${fieldKey}`] = el; }}
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
        onPress={() => openEditor({ title: `${title}: ${label}`, mode: "number", value, placeholder: "мм", onSave: (v) => onUpdateOvaryField(side, fieldKey as keyof OvaryDraft, v) })} />
    );
  };

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
                {fv["omt_female.ovaryLength"] !== false && renderNumberField("Длина (мм)", "length", ovary.length, Boolean(ovary.length))}
                {fv["omt_female.ovaryWidth"] !== false && renderNumberField("Ширина (мм)", "width", ovary.width, Boolean(ovary.width))}
                {fv["omt_female.ovaryThickness"] !== false && renderNumberField("Толщина (мм)", "thickness", ovary.thickness, Boolean(ovary.thickness))}
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
                    <View
                      key={`cyst-${i}`}
                      ref={(el) => { if (isLandscape) numpadApi.fieldRefs.current[`ovary-${side}-cyst-${i}`] = el; }}
                      onLayout={isLandscape ? (e) => numpadApi.handleFieldLayout(`ovary-${side}-cyst-${i}`, e) : undefined}
                    >
                      <OmtFemaleOvaryCystCard styles={styles} cyst={cyst} index={i}
                        side={side} openEditor={openEditor} onUpdateCyst={onUpdateCyst} onRemoveCyst={onRemoveCyst}
                        numpadApi={numpadApi} />
                    </View>
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