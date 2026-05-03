import { StyleSheet, Text, View } from "react-native";
import type { ReactNode } from "react";

import { ProtocolActionButton } from "./ProtocolActionButton";

type ProtocolCardProps = {
  title: string;
  subtitle?: string;
  countText?: string;
  actionLabel?: string;
  actionVariant?: "primary" | "secondary" | "danger";
  titleVariant?: "section" | "organ";
  onActionPress?: () => void;
  children?: ReactNode;
  variant?: "section" | "item";
};

export function ProtocolCard({
  title,
  subtitle,
  countText,
  actionLabel,
  actionVariant = "secondary",
  titleVariant = "section",
  onActionPress,
  children,
  variant = "section",
}: ProtocolCardProps) {
  return (
    <View style={[cardStyles.card, variant === "item" ? cardStyles.itemCard : cardStyles.sectionCard]}>
      <View style={cardStyles.header}>
        <View style={cardStyles.headerText}>
          <Text
            style={[
              cardStyles.title,
              titleVariant === "organ" && cardStyles.titleOrgan,
            ]}
          >
            {title}
          </Text>
          {subtitle ? <Text style={cardStyles.subtitle}>{subtitle}</Text> : null}
          {countText ? <Text style={cardStyles.count}>{countText}</Text> : null}
        </View>

        {actionLabel && onActionPress ? (
          <ProtocolActionButton
            label={actionLabel}
            variant={actionVariant}
            compact
            onPress={onActionPress}
          />
        ) : null}
      </View>

      {children}
    </View>
  );
}

const cardStyles = StyleSheet.create({
  card: {
    gap: 12,
  },
  sectionCard: {
    backgroundColor: "rgba(15, 23, 42, 0.78)",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.14)",
    padding: 14,
  },
  itemCard: {
    backgroundColor: "rgba(15, 23, 42, 0.92)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.14)",
    padding: 14,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 8,
  },
  headerText: {
    gap: 2,
    flex: 1,
  },
  title: {
    color: "#f8fafc",
    fontSize: 15,
    fontWeight: "800",
  },
  titleOrgan: {
    fontSize: 22,
    fontWeight: "900",
    lineHeight: 26,
    letterSpacing: 0.3,
  },
  subtitle: {
    color: "#cbd5e1",
    fontSize: 12,
    lineHeight: 18,
  },
  count: {
    color: "#94a3b8",
    fontSize: 12,
  },
});
