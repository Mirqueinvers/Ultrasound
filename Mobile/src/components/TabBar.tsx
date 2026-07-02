import { Pressable, Text, View } from "react-native";

type TabBarStyles = {
  tabBar: object;
  tabButton: object;
  tabButtonActive: object;
  tabButtonText: object;
  tabButtonTextActive: object;
  buttonPressed: object;
};

export type TabKey = "settings" | "library" | "draft" | "summary";

type TabBarProps = {
  activeTab: TabKey;
  onChange: (tab: TabKey) => void;
  styles: TabBarStyles;
  tabs: Array<{ key: TabKey; label: string }>;
};

export function TabBar({ activeTab, onChange, tabs, styles }: TabBarProps) {
  return (
    <View style={styles.tabBar}>
      {tabs.map((tab) => {
        const active = tab.key === activeTab;
        return (
          <Pressable
            key={tab.key}
            onPress={() => onChange(tab.key)}
            style={({ pressed }) => [
              styles.tabButton,
              active && styles.tabButtonActive,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={[styles.tabButtonText, active && styles.tabButtonTextActive]}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
