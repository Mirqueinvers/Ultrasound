import { Pressable, StyleSheet, Text } from "react-native";

type ProtocolActionButtonProps = {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "danger";
  compact?: boolean;
};

export function ProtocolActionButton({
  label,
  onPress,
  variant = "primary",
  compact = false,
}: ProtocolActionButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        buttonStyles.base,
        variant === "primary" && buttonStyles.primary,
        variant === "secondary" && buttonStyles.secondary,
        variant === "danger" && buttonStyles.danger,
        compact && buttonStyles.compact,
        pressed && buttonStyles.pressed,
      ]}
    >
      <Text
        style={[
          buttonStyles.label,
          variant === "primary" && buttonStyles.labelPrimary,
          variant === "secondary" && buttonStyles.labelSecondary,
          variant === "danger" && buttonStyles.labelDanger,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const buttonStyles = StyleSheet.create({
  base: {
    borderRadius: 16,
    paddingVertical: 11,
    paddingHorizontal: 14,
    alignSelf: "flex-start",
    borderWidth: 1,
  },
  compact: {
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.99 }],
  },
  primary: {
    backgroundColor: "#0ea5e9",
    borderColor: "#38bdf8",
  },
  secondary: {
    backgroundColor: "rgba(15, 23, 42, 0.92)",
    borderColor: "rgba(148, 163, 184, 0.14)",
  },
  danger: {
    backgroundColor: "rgba(127, 29, 29, 0.7)",
    borderColor: "rgba(248, 113, 113, 0.45)",
  },
  label: {
    fontSize: 13,
    fontWeight: "800",
  },
  labelPrimary: {
    color: "#f8fafc",
  },
  labelSecondary: {
    color: "#e2e8f0",
  },
  labelDanger: {
    color: "#fecaca",
  },
});

