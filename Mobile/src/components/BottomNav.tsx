import { Pressable, Text, View } from "react-native";

import { type TabKey } from "./TabBar";
import { MOBILE_TABS } from "../navigation/mobileTabs";
import type { AppStyles } from "../styles/appStyles";

type BottomNavProps = {
  styles: AppStyles;
  activeTab: TabKey;
  setActiveTab: (value: TabKey) => void;
};

export function BottomNav({ styles, activeTab, setActiveTab }: BottomNavProps) {
  return (
    <View style={styles.bottomNav}>
      {MOBILE_TABS.map(({ key, label }) => {
        const active = activeTab === key;
        return (
          <Pressable
            key={key}
            onPress={() => setActiveTab(key)}
            style={({ pressed }) => [
              styles.navItem,
              active && styles.navItemActive,
              pressed && styles.navItemPressed,
            ]}
          >
            <Text style={[styles.navLabel, active && styles.navLabelActive]}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
