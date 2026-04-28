import { Text, View } from "react-native";

type InlineStatStyles = {
  inlineStat: object;
  inlineStatLabel: object;
  inlineStatValue: object;
};

type InlineStatProps = {
  label: string;
  value: string;
  styles: InlineStatStyles;
};

export function InlineStat({ label, value, styles }: InlineStatProps) {
  return (
    <View style={styles.inlineStat}>
      <Text style={styles.inlineStatLabel}>{label}</Text>
      <Text style={styles.inlineStatValue}>{value}</Text>
    </View>
  );
}
