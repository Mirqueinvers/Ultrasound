import { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  PanResponder,
  Pressable,
  ScrollView,
  Switch,
  Text,
  View,
} from "react-native";

import { VisibilityGroupId, VISIBILITY_GROUPS_BY_PROTOCOL } from "../settings/fieldVisibility";
import type { AppStyles } from "../styles/appStyles";

type FieldVisibilitySettingsProps = {
  styles: AppStyles;
  visibility: Record<string, boolean>;
  onToggle: (groupId: string) => void;
  onClose: () => void;
};

const PANEL_WIDTH = 240;
const SWIPE_THRESHOLD = 80;
const SCREEN_WIDTH = Dimensions.get("window").width;

const PROTOCOL_LABELS: Record<string, string> = {
  obp: "ОБП",
  kidneys: "Почки",
  scrotum: "Органы мошонки",
  omt_female: "ОМТ (Ж)",
  omt_male: "ОМТ (М)",
  thyroid: "Щитовидная железа",
  breast: "Молочные железы",
  lymph_nodes: "Лимфоузлы",
};

export function FieldVisibilitySettings({
  styles,
  visibility,
  onToggle,
  onClose,
}: FieldVisibilitySettingsProps) {
  return (
    <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 8 }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <Text style={{ color: "#f8fafc", fontSize: 18, fontWeight: "800" }}>
          Настройка полей
        </Text>
        <Pressable
          onPress={onClose}
          style={({ pressed }) => [
            {
              backgroundColor: "rgba(148, 163, 184, 0.14)",
              paddingHorizontal: 14,
              paddingVertical: 8,
              borderRadius: 16,
            },
            pressed && { opacity: 0.82 },
          ]}
        >
          <Text style={{ color: "#e2e8f0", fontWeight: "700", fontSize: 13 }}>Готово</Text>
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
        {Object.entries(VISIBILITY_GROUPS_BY_PROTOCOL).map(([protocolKey, groups]) => {
          const groupEntries = Object.entries(groups);
          if (groupEntries.length === 0) {
            return null;
          }

          return (
            <View
              key={protocolKey}
              style={{
                backgroundColor: "rgba(15, 23, 42, 0.6)",
                borderRadius: 20,
                borderWidth: 1,
                borderColor: "rgba(148, 163, 184, 0.12)",
                padding: 12,
                marginBottom: 10,
                gap: 8,
              }}
            >
              <Text
                style={{
                  color: "#7dd3fc",
                  fontSize: 13,
                  fontWeight: "800",
                  textTransform: "uppercase",
                  letterSpacing: 1,
                }}
              >
                {PROTOCOL_LABELS[protocolKey] ?? protocolKey}
              </Text>

              {groupEntries.map(([groupId, label]) => {
                const visible = visibility[groupId] !== false;

                return (
                  <View
                    key={groupId}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      paddingVertical: 6,
                    }}
                  >
                    <Text
                      style={{
                        color: visible ? "#e2e8f0" : "#64748b",
                        fontSize: 13,
                        fontWeight: visible ? "600" : "400",
                        flex: 1,
                        marginRight: 8,
                      }}
                    >
                      {label}
                    </Text>
                    <Switch
                      value={visible}
                      onValueChange={() => onToggle(groupId)}
                      trackColor={{ false: "#334155", true: "rgba(56, 189, 248, 0.4)" }}
                      thumbColor={visible ? "#38bdf8" : "#64748b"}
                    />
                  </View>
                );
              })}
            </View>
          );
        })}

        {/* Отступ снизу для навигации */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}