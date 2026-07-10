import { Pressable, Text, View } from "react-native";

type SettingsHeaderProps = {
  title: string;
  onBack: () => void;
};

export function SettingsHeader({ title, onBack }: SettingsHeaderProps) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: "rgba(7, 17, 31, 0.85)",
        borderBottomWidth: 1,
        borderBottomColor: "rgba(148, 163, 184, 0.12)",
      }}
    >
      <Pressable
        onPress={onBack}
        style={({ pressed }) => [
          {
            position: "absolute",
            left: 16,
            paddingHorizontal: 8,
            paddingVertical: 6,
            borderRadius: 12,
            backgroundColor: pressed ? "rgba(148, 163, 184, 0.16)" : "transparent",
          },
        ]}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Text style={{ color: "#94a3b8", fontSize: 22, lineHeight: 24, fontWeight: "600" }}>
          ←
        </Text>
      </Pressable>

      <Text
        style={{
          color: "#f8fafc",
          fontSize: 17,
          fontWeight: "800",
        }}
      >
        {title}
      </Text>
    </View>
  );
}