import { type ReactNode } from "react";
import { Text, View } from "react-native";

type SectionPanelStyles = {
  sectionPanel: object;
  sectionPanelHeader: object;
  sectionPanelTitle: object;
  sectionPanelSubtitle: object;
};

type SectionPanelProps = {
  title: string;
  subtitle: string;
  styles: SectionPanelStyles;
  children: ReactNode;
};

export function SectionPanel({
  title,
  subtitle,
  styles,
  children,
}: SectionPanelProps) {
  return (
    <View style={styles.sectionPanel}>
      <View style={styles.sectionPanelHeader}>
        <Text style={styles.sectionPanelTitle}>{title}</Text>
        <Text style={styles.sectionPanelSubtitle}>{subtitle}</Text>
      </View>
      {children}
    </View>
  );
}
