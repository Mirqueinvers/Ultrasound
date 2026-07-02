import { useCallback, useRef } from "react";
import { Animated, Pressable, Text, View, type GestureResponderEvent } from "react-native";

import { type TabKey } from "./TabBar";
import { MOBILE_TABS } from "../navigation/mobileTabs";
import type { AppStyles } from "../styles/appStyles";

type BottomNavProps = {
  styles: AppStyles;
  activeTab: TabKey;
  setActiveTab: (value: TabKey) => void;
};

const HIDDEN_BUTTON_WIDTH = 56;
const SWIPE_THRESHOLD = 30;

export function BottomNav({ styles, activeTab, setActiveTab }: BottomNavProps) {
  const slideAnim = useRef(new Animated.Value(0)).current;
  const hiddenOpacity = useRef(new Animated.Value(0)).current;
  const slideValueRef = useRef(0);
  const isOpenRef = useRef(false);
  const touchStartX = useRef(0);
  const isDragging = useRef(false);

  const snapTo = useCallback(
    (open: boolean) => {
      isOpenRef.current = open;
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: open ? HIDDEN_BUTTON_WIDTH : 0,
          useNativeDriver: true,
          tension: 100,
          friction: 12,
        }),
        Animated.timing(hiddenOpacity, {
          toValue: open ? 1 : 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    },
    [slideAnim, hiddenOpacity],
  );

  const handleTouchStart = useCallback((e: GestureResponderEvent) => {
    touchStartX.current = e.nativeEvent.pageX;
    isDragging.current = false;
  }, []);

  const handleTouchMove = useCallback(
    (e: GestureResponderEvent) => {
      const dx = e.nativeEvent.pageX - touchStartX.current;

      if (Math.abs(dx) > 10) {
        isDragging.current = true;
      }

      if (!isDragging.current) {
        return;
      }

      const currentOffset = isOpenRef.current ? HIDDEN_BUTTON_WIDTH : 0;
      const targetX = currentOffset + dx;
      const clamped = Math.max(0, Math.min(HIDDEN_BUTTON_WIDTH, targetX));
      slideValueRef.current = clamped;
      slideAnim.setValue(clamped);

      const opacityValue = Math.min(1, clamped / HIDDEN_BUTTON_WIDTH);
      hiddenOpacity.setValue(opacityValue);
    },
    [slideAnim, hiddenOpacity],
  );

  const handleTouchEnd = useCallback(() => {
    if (!isDragging.current) {
      return; // It was a tap, not a swipe — let Pressable handle it
    }

    slideValueRef.current > SWIPE_THRESHOLD ? snapTo(true) : snapTo(false);
  }, [snapTo]);

  const handleTabPress = (key: TabKey) => {
    setActiveTab(key);
    if (isOpenRef.current) {
      snapTo(false);
    }
  };

  const handleSettingsPress = () => {
    setActiveTab("settings");
    snapTo(false);
  };

  return (
    <View style={styles.bottomNavWrapper}>
      {/* Hidden settings button — behind the sliding panel */}
      <Animated.View
        style={[
          styles.navItemHidden,
          { opacity: hiddenOpacity },
          activeTab === "settings" && styles.navItemActive,
        ]}
      >
        <Pressable
          onPress={handleSettingsPress}
          style={({ pressed }) => [
            styles.navItemHiddenInner,
            pressed && styles.navItemPressed,
          ]}
        >
          <Text style={[styles.navLabel, activeTab === "settings" && styles.navLabelActive]}>
            ⚙
          </Text>
        </Pressable>
      </Animated.View>

      {/* Sliding panel with 3 main tabs */}
      <Animated.View
        style={[styles.bottomNav, { transform: [{ translateX: slideAnim }] }]}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {MOBILE_TABS.map(({ key, label }) => {
          const active = activeTab === key;
          return (
            <Pressable
              key={key}
              onPress={() => handleTabPress(key)}
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
      </Animated.View>
    </View>
  );
}