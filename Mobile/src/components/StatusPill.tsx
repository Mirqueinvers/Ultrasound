import { type ReactNode } from "react";
import { Text, View } from "react-native";

type StatusPillTone = "neutral" | "accent" | "success";

type StatusPillStyles = {
  pill: object;
  pillAccent: object;
  pillSuccess: object;
  pillText: object;
};

type StatusPillProps = {
  tone: StatusPillTone;
  styles: StatusPillStyles;
  children: ReactNode;
};

export function StatusPill({ tone, styles, children }: StatusPillProps) {
  return (
    <View
      style={[
        styles.pill,
        tone === "accent" && styles.pillAccent,
        tone === "success" && styles.pillSuccess,
      ]}
    >
      <Text style={styles.pillText}>{children}</Text>
    </View>
  );
}
