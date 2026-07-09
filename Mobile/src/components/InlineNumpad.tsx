import { useCallback, useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";

type InlineNumpadProps = {
  value: string;
  onValueChange: (value: string) => void;
  onClose: () => void;
};

const NUMPAD_KEYS: Array<Array<{ label: string; key: string }>> = [
  [
    { label: "1", key: "1" },
    { label: "2", key: "2" },
    { label: "3", key: "3" },
  ],
  [
    { label: "4", key: "4" },
    { label: "5", key: "5" },
    { label: "6", key: "6" },
  ],
  [
    { label: "7", key: "7" },
    { label: "8", key: "8" },
    { label: "9", key: "9" },
  ],
  [
    { label: ",", key: "," },
    { label: "0", key: "0" },
    { label: "⌫", key: "backspace" },
  ],
];

export function InlineNumpad({ value, onValueChange, onClose }: InlineNumpadProps) {
  const [draftValue, setDraftValue] = useState(value);

  useEffect(() => {
    setDraftValue(value);
  }, [value]);

  const handleKeyPress = useCallback(
    (key: string) => {
      let next: string;
      if (key === "backspace") {
        next = draftValue.slice(0, -1);
      } else if (key === ",") {
        if (draftValue.includes(",")) {
          return;
        }
        next = draftValue ? `${draftValue},` : "0,";
      } else {
        next = `${draftValue}${key}`;
      }
      setDraftValue(next);
    },
    [draftValue],
  );

  const handleDone = useCallback(() => {
    onValueChange(draftValue);
    onClose();
  }, [draftValue, onValueChange, onClose]);

  return (
    <View style={styles.container}>
      <View style={styles.displayRow}>
        <Text style={styles.displayValue} numberOfLines={1}>
          {draftValue || "—"}
        </Text>
        <Pressable onPress={onClose} style={({ pressed }) => [styles.closeButton, pressed && styles.closeButtonPressed]}>
          <Text style={styles.closeButtonText}>✕</Text>
        </Pressable>
      </View>
      <View style={styles.grid}>
        {NUMPAD_KEYS.map((row) => (
          <View key={row.map((k) => k.key).join("-")} style={styles.row}>
            {row.map(({ label, key }) => (
              <Pressable
                key={key}
                onPress={() => handleKeyPress(key)}
                style={({ pressed }) => [styles.keyButton, pressed && styles.keyButtonPressed]}
              >
                <Text style={styles.keyLabel}>{label}</Text>
              </Pressable>
            ))}
          </View>
        ))}
      </View>
      <Pressable
        onPress={handleDone}
        style={({ pressed }) => [styles.doneButton, pressed && styles.doneButtonPressed]}
      >
        <Text style={styles.doneButtonText}>Готово</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "rgba(15, 23, 42, 0.98)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.25)",
    padding: 8,
    gap: 6,
    minWidth: 200,
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },
  displayRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(2, 6, 23, 0.6)",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 8,
  },
  displayValue: {
    color: "#f8fafc",
    fontSize: 16,
    fontWeight: "700",
    flex: 1,
  },
  closeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(148, 163, 184, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  closeButtonPressed: {
    backgroundColor: "rgba(148, 163, 184, 0.3)",
  },
  closeButtonText: {
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: "800",
  },
  grid: {
    gap: 4,
  },
  row: {
    flexDirection: "row",
    gap: 4,
  },
  keyButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "rgba(148, 163, 184, 0.1)",
    minWidth: 40,
  },
  keyButtonPressed: {
    backgroundColor: "rgba(148, 163, 184, 0.25)",
    transform: [{ scale: 0.94 }],
  },
  keyLabel: {
    color: "#f8fafc",
    fontSize: 18,
    fontWeight: "700",
  },
  doneButton: {
    backgroundColor: "#22c55e",
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  doneButtonPressed: {
    backgroundColor: "#16a34a",
    transform: [{ scale: 0.97 }],
  },
  doneButtonText: {
    color: "#04110a",
    fontSize: 14,
    fontWeight: "800",
  },
});