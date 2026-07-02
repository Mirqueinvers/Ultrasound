import { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  PanResponder,
  Pressable,
  Text,
  View,
} from "react-native";

import { type TabKey } from "./TabBar";
import { BOTTOM_NAV_TABS } from "../navigation/mobileTabs";
import type { AppStyles } from "../styles/appStyles";

const PANEL_WIDTH = 80;
const SWIPE_THRESHOLD = 40;
const SCREEN_WIDTH = Dimensions.get("window").width;

type BottomNavProps = {
  styles: AppStyles;
  activeTab: TabKey;
  setActiveTab: (value: TabKey) => void;
};

export function BottomNav({ styles, activeTab, setActiveTab }: BottomNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  // -PANEL_WIDTH=скрыто, 0=шестерёнка видна
  const slideAnim = useRef(new Animated.Value(-PANEL_WIDTH)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_evt, gestureState) => {
        return Math.abs(gestureState.dx) > 5 && gestureState.dx > 0;
      },
      onPanResponderMove: (_evt, gestureState) => {
        const value = Math.min(Math.max(-PANEL_WIDTH + gestureState.dx, -PANEL_WIDTH), 0);
        slideAnim.setValue(value);
      },
      onPanResponderRelease: (_evt, gestureState) => {
        if (gestureState.dx > SWIPE_THRESHOLD) {
          Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
            friction: 8,
          }).start();
          setIsOpen(true);
        } else {
          Animated.spring(slideAnim, {
            toValue: -PANEL_WIDTH,
            useNativeDriver: true,
            friction: 8,
          }).start();
          setIsOpen(false);
        }
      },
      onPanResponderTerminate: () => {
        Animated.spring(slideAnim, {
          toValue: -PANEL_WIDTH,
          useNativeDriver: true,
          friction: 8,
        }).start();
        setIsOpen(false);
      },
    }),
  ).current;

  const closePanel = () => {
    Animated.spring(slideAnim, {
      toValue: -PANEL_WIDTH,
      useNativeDriver: true,
      friction: 8,
    }).start();
    setIsOpen(false);
  };

  const handleConnectPress = () => {
    setActiveTab("connect");
    closePanel();
  };

  const handleNavPress = (key: TabKey) => {
    setActiveTab(key);
    if (isOpen) closePanel();
  };

  return (
    <View style={{ overflow: "hidden" }} {...panResponder.panHandlers}>
      <Animated.View
        style={{
          flexDirection: "row",
          width: SCREEN_WIDTH + PANEL_WIDTH,
          transform: [{ translateX: slideAnim }],
        }}
      >
        {/* Шестерёнка */}
        <View style={{ width: PANEL_WIDTH, paddingRight: 4, paddingTop: 10, paddingBottom: 14 }}>
          <Pressable
            onPress={handleConnectPress}
            style={({ pressed }) => [
              {
                flex: 1,
                borderRadius: 16,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: activeTab === "connect" ? "#f97316" : "rgba(148, 163, 184, 0.08)",
              },
              pressed && { opacity: 0.86 },
            ]}
          >
            <Text style={{ fontSize: 24, color: activeTab === "connect" ? "#fff7ed" : "#cbd5e1", fontWeight: "800" }}>
              ⚙
            </Text>
          </Pressable>
        </View>

        {/* 3 кнопки — точная ширина экрана, без flex */}
        <View style={{ width: SCREEN_WIDTH, paddingHorizontal: 12, paddingTop: 10, paddingBottom: 14, flexDirection: "row", gap: 8 }}>
          {BOTTOM_NAV_TABS.map(({ key, label }) => {
            const active = activeTab === key;
            return (
              <Pressable
                key={key}
                onPress={() => handleNavPress(key)}
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
      </Animated.View>
    </View>
  );
}