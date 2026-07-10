import { Pressable, ScrollView, Text, View } from "react-native";
import { type ProtocolId, PROTOCOL_MANIFEST_BY_ID } from "../shared/protocols";

type ProtocolOrderSettingsProps = {
  order: ProtocolId[];
  onMoveUp: (id: ProtocolId) => void;
  onMoveDown: (id: ProtocolId) => void;
};

export function ProtocolOrderSettings({
  order,
  onMoveUp,
  onMoveDown,
}: ProtocolOrderSettingsProps) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
      <View style={{ paddingHorizontal: 16, paddingTop: 8, gap: 8 }}>
        {order.map((id, index) => {
          const manifest = PROTOCOL_MANIFEST_BY_ID[id];
          if (!manifest) return null;

          const isFirst = index === 0;
          const isLast = index === order.length - 1;

          return (
            <View
              key={id}
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "rgba(15, 23, 42, 0.6)",
                borderRadius: 20,
                borderWidth: 1,
                borderColor: "rgba(148, 163, 184, 0.12)",
                padding: 12,
                gap: 10,
              }}
            >
              {/* Порядковый номер */}
              <View
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  backgroundColor: "rgba(56, 189, 248, 0.15)",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ color: "#7dd3fc", fontSize: 12, fontWeight: "800" }}>
                  {index + 1}
                </Text>
              </View>

              {/* Название */}
              <Text
                style={{
                  color: "#f8fafc",
                  fontSize: 14,
                  fontWeight: "700",
                  flex: 1,
                }}
                numberOfLines={1}
              >
                {manifest.selectionLabel}
              </Text>

              {/* Кнопки вверх/вниз */}
              <View style={{ flexDirection: "row", gap: 4 }}>
                <Pressable
                  onPress={() => onMoveUp(id)}
                  disabled={isFirst}
                  style={({ pressed }) => ({
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: isFirst
                      ? "rgba(148, 163, 184, 0.06)"
                      : pressed
                        ? "rgba(56, 189, 248, 0.25)"
                        : "rgba(56, 189, 248, 0.12)",
                    opacity: isFirst ? 0.35 : 1,
                  })}
                >
                  <Text style={{ color: "#7dd3fc", fontSize: 16, fontWeight: "700" }}>
                    ▲
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => onMoveDown(id)}
                  disabled={isLast}
                  style={({ pressed }) => ({
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: isLast
                      ? "rgba(148, 163, 184, 0.06)"
                      : pressed
                        ? "rgba(56, 189, 248, 0.25)"
                        : "rgba(56, 189, 248, 0.12)",
                    opacity: isLast ? 0.35 : 1,
                  })}
                >
                  <Text style={{ color: "#7dd3fc", fontSize: 16, fontWeight: "700" }}>
                    ▼
                  </Text>
                </Pressable>
              </View>
            </View>
          );
        })}

        <View style={{ height: 100 }} />
      </View>
    </ScrollView>
  );
}