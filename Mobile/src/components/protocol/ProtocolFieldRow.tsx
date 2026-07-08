import { memo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { isNormalizedMatch } from "../../shared/normalizeSelectValue";

type ProtocolFieldRowProps = {
  label: string;
  value: string;
  typeLabel: "numpad" | "select" | "text" | "auto";
  filled?: boolean;
  readonly?: boolean;
  compact?: boolean;
  onPress?: () => void;
  options?: Array<{ label: string; value: string }>;
  onSelectOption?: (value: string) => void;
};

function ProtocolFieldRowComponent({
  label,
  value,
  typeLabel,
  filled,
  readonly,
  compact,
  onPress,
  options = [],
  onSelectOption,
}: ProtocolFieldRowProps) {
  const showInlineOptions = typeLabel === "select" && options.length > 0;
  const rowState = [
    rowStyles.row,
    compact && rowStyles.rowCompact,
    filled && rowStyles.rowFilled,
    readonly && rowStyles.rowReadonly,
  ];

  const content = (
    <>
      <View style={[rowStyles.content, compact && rowStyles.contentCompact]}>
        <Text style={[rowStyles.label, compact && rowStyles.labelCompact]}>{label}</Text>
        <Text style={[rowStyles.value, compact && rowStyles.valueCompact]}>{value || "Нажмите для ввода"}</Text>
      </View>
      <Text style={[rowStyles.type, compact && rowStyles.typeCompact]}>{typeLabel}</Text>

      {showInlineOptions ? (
        <View style={[rowStyles.optionWrap, compact && rowStyles.optionWrapCompact]}>
          {options.map((option, index) => {
            const active =
              Boolean(value) &&
              (isNormalizedMatch(option.value, value) || isNormalizedMatch(option.label, value));

            return (
              <Pressable
                key={`${option.label}-${index}`}
                disabled={readonly || !onSelectOption}
                onPress={() => onSelectOption?.(option.value)}
                style={({ pressed }) => [
                  compact ? rowStyles.optionChipCompact : rowStyles.optionChip,
                  active ? rowStyles.optionChipActive : rowStyles.optionChipInactive,
                  pressed && !readonly && rowStyles.optionChipPressed,
                ]}
              >
                <Text style={[compact ? rowStyles.optionTextCompact : rowStyles.optionText, active && rowStyles.optionTextActive]}>
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}
    </>
  );

  if (showInlineOptions) {
    return <View style={rowState}>{content}</View>;
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={readonly || !onPress}
      style={({ pressed }) => [...rowState, pressed && !readonly && rowStyles.rowPressed]}
    >
      {content}
    </Pressable>
  );
}

export const ProtocolFieldRow = memo(ProtocolFieldRowComponent);

const rowStyles = StyleSheet.create({
  row: {
    backgroundColor: "rgba(15, 23, 42, 0.92)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.14)",
    padding: 14,
    gap: 8,
  },
  rowCompact: {
    borderRadius: 14,
    padding: 8,
    gap: 4,
  },
  rowFilled: {
    borderColor: "rgba(34, 197, 94, 0.55)",
    backgroundColor: "rgba(4, 120, 87, 0.14)",
  },
  rowReadonly: {
    opacity: 0.78,
    borderColor: "rgba(148, 163, 184, 0.1)",
  },
  rowPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.99 }],
  },
  content: {
    gap: 6,
  },
  contentCompact: {
    flexDirection: "row",
    gap: 6,
    alignItems: "baseline",
  },
  label: {
    color: "#f8fafc",
    fontSize: 14,
    fontWeight: "800",
  },
  labelCompact: {
    fontSize: 12,
    flexShrink: 0,
  },
  value: {
    color: "#cbd5e1",
    lineHeight: 20,
  },
  valueCompact: {
    fontSize: 12,
    lineHeight: 16,
    flex: 1,
  },
  type: {
    color: "#7dd3fc",
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1,
    alignSelf: "flex-end",
  },
  typeCompact: {
    fontSize: 9,
    letterSpacing: 0.5,
    alignSelf: "flex-start",
  },
  optionWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 2,
  },
  optionWrapCompact: {
    gap: 4,
    marginTop: 0,
  },
  optionChip: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 999,
    borderWidth: 1,
  },
  optionChipCompact: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
  },
  optionChipActive: {
    borderColor: "rgba(34, 197, 94, 0.55)",
    backgroundColor: "rgba(4, 120, 87, 0.24)",
  },
  optionChipInactive: {
    borderColor: "rgba(148, 163, 184, 0.16)",
    backgroundColor: "rgba(148, 163, 184, 0.08)",
  },
  optionChipPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },
  optionText: {
    color: "#cbd5e1",
    fontSize: 13,
    fontWeight: "700",
  },
  optionTextCompact: {
    color: "#cbd5e1",
    fontSize: 11,
    fontWeight: "700",
  },
  optionTextActive: {
    color: "#f8fafc",
    fontWeight: "800",
  },
});
