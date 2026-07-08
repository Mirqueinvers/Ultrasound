import { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import { type TabKey } from "./TabBar";
import { BOTTOM_NAV_TABS } from "../navigation/mobileTabs";

type LandscapeBottomNavProps = {
  activeTab: TabKey;
  setActiveTab: (value: TabKey) => void;
};

const AUTO_CLOSE_DELAY = 3000;
const COLLAPSED_HEIGHT = 6;
const EXPANDED_HEIGHT = 56;

export function LandscapeBottomNav({ activeTab, setActiveTab }: LandscapeBottomNavProps) {
  const [expanded, setExpanded] = useState(false);
  const heightAnim = useRef(new Animated.Value(COLLAPSED_HEIGHT)).current;
  const autoCloseRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const startAutoClose = useCallback(() => {
    if (autoCloseRef.current) clearTimeout(autoCloseRef.current);
    autoCloseRef.current = setTimeout(() => {
      collapse();
    }, AUTO_CLOSE_DELAY);
  }, []);

  const collapse = useCallback(() => {
    Animated.parallel([
      Animated.timing(heightAnim, {
        toValue: COLLAPSED_HEIGHT,
        duration: 200,
        useNativeDriver: false,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: false,
      }),
    ]).start(() => setExpanded(false));
  }, [heightAnim, fadeAnim]);

  const expand = useCallback(() => {
    setExpanded(true);
    Animated.parallel([
      Animated.timing(heightAnim, {
        toValue: EXPANDED_HEIGHT,
        duration: 200,
        useNativeDriver: false,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: false,
      }),
    ]).start();
    startAutoClose();
  }, [heightAnim, fadeAnim, startAutoClose]);

  const handleTabPress = useCallback(
    (key: TabKey) => {
      setActiveTab(key);
      collapse();
    },
    [setActiveTab, collapse],
  );

  const handleCollapsedPress = useCallback(() => {
    if (expanded) {
      collapse();
    } else {
      expand();
    }
  }, [expanded, expand, collapse]);

  // Touch on the collapsed bar
  const chipOpacity = fadeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  useEffect(() => {
    return () => {
      if (autoCloseRef.current) clearTimeout(autoCloseRef.current);
    };
  }, []);

  return (
    <Animated.View
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: heightAnim,
        overflow: "visible",
        zIndex: 100,
      }}
    >
      {/* Collapsed strip — always visible, and extends beyond the animated area */}
      <Pressable
        onPress={handleCollapsedPress}
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: COLLAPSED_HEIGHT + 12, // bigger hit area
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <View
          style={{
            width: 48,
            height: 4,
            borderRadius: 2,
            backgroundColor: "rgba(148, 163, 184, 0.3)",
          }}
        />
      </Pressable>

      {/* Expanded chip panel */}
      {expanded && (
        <Animated.View
          style={{
            position: "absolute",
            bottom: COLLAPSED_HEIGHT,
            left: 0,
            right: 0,
            opacity: chipOpacity,
            backgroundColor: "rgba(15, 23, 42, 0.92)",
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
            paddingVertical: 8,
            paddingHorizontal: 12,
          }}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              flexDirection: "row",
              gap: 8,
              alignItems: "center",
            }}
          >
            {/* Connect tab */}
            <Pressable
              onPress={() => handleTabPress("connect")}
              style={({ pressed }) => [
                chipStyle,
                activeTab === "connect" && chipStyleActive,
                pressed && { opacity: 0.7 },
              ]}
            >
              <Text style={[chipTextStyle, activeTab === "connect" && chipTextStyleActive]}>
                ⚙ Подключение
              </Text>
            </Pressable>

            {BOTTOM_NAV_TABS.map(({ key, label }) => (
              <Pressable
                key={key}
                onPress={() => handleTabPress(key)}
                style={({ pressed }) => [
                  chipStyle,
                  activeTab === key && chipStyleActive,
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Text style={[chipTextStyle, activeTab === key && chipTextStyleActive]}>
                  {label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </Animated.View>
      )}
    </Animated.View>
  );
}

const chipStyle = {
  paddingHorizontal: 14,
  paddingVertical: 6,
  borderRadius: 20,
  backgroundColor: "rgba(148, 163, 184, 0.12)",
} as const;

const chipStyleActive = {
  backgroundColor: "#f97316",
} as const;

const chipTextStyle = {
  fontSize: 13,
  fontWeight: "600" as const,
  color: "#cbd5e1",
} as const;

const chipTextStyleActive = {
  color: "#fff7ed",
} as const;