import { memo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type ProtocolFieldRowProps = {
  label: string;
  value: string;
  typeLabel: "numpad" | "select" | "text" | "auto";
  filled?: boolean;
  readonly?: boolean;
  onPress?: () => void;
};

function ProtocolFieldRowComponent({
  label,
  value,
  typeLabel,
  filled,
  readonly,
  onPress,
}: ProtocolFieldRowProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={readonly || !onPress}
      style={({ pressed }) => [
        rowStyles.row,
        filled && rowStyles.rowFilled,
        readonly && rowStyles.rowReadonly,
        pressed && !readonly && rowStyles.rowPressed,
      ]}
    >
      <View style={rowStyles.content}>
        <Text style={rowStyles.label}>{label}</Text>
        <Text style={rowStyles.value}>{value || "Нажмите для ввода"}</Text>
      </View>
      <Text style={rowStyles.type}>{typeLabel}</Text>
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
  label: {
    color: "#f8fafc",
    fontSize: 14,
    fontWeight: "800",
  },
  value: {
    color: "#cbd5e1",
    lineHeight: 20,
  },
  type: {
    color: "#7dd3fc",
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1,
    alignSelf: "flex-end",
  },
});
