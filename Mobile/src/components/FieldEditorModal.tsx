import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import { isNormalizedMatch } from "../shared/normalizeSelectValue";

type FieldEditorMode = "number" | "select" | "text";

export type FieldEditorOption = {
  label: string;
  value: string;
};

type FieldEditorModalProps = {
  visible: boolean;
  title: string;
  mode: FieldEditorMode;
  value: string;
  options?: FieldEditorOption[];
  placeholder?: string;
  multiline?: boolean;
  footerContent?: (context: {
    value: string;
    setValue: (nextValue: string) => void;
    close: () => void;
  }) => ReactNode;
  onCancel: () => void;
  onSave: (value: string) => void;
};

const numberPadRows = [["1", "2", "3"], ["4", "5", "6"], ["7", "8", "9"], [",", "0", "backspace"]] as const;

export function FieldEditorModal({
  visible,
  title,
  mode,
  value,
  options = [],
  placeholder,
  multiline = false,
  footerContent,
  onCancel,
  onSave,
}: FieldEditorModalProps) {
  const [draftValue, setDraftValue] = useState(value);

  useEffect(() => {
    if (visible) {
      setDraftValue(value);
    }
  }, [visible, value]);

  const selectedOption = useMemo(
    () =>
      options.find((option) => isNormalizedMatch(option.value, draftValue))?.value ?? "",
    [draftValue, options],
  );

  const handleNumberKey = (key: string) => {
    if (key === "backspace") {
      setDraftValue((current) => current.slice(0, -1));
      return;
    }

    if (key === ",") {
      setDraftValue((current) => {
        if (current.includes(",")) {
          return current;
        }

        return current ? `${current},` : "0,";
      });
      return;
    }

    setDraftValue((current) => `${current}${key}`);
  };

  const handleSave = () => {
    onSave(draftValue.trim());
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(2, 6, 23, 0.96)",
          padding: 16,
          paddingTop: 48,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <View style={{ flex: 1, paddingRight: 12 }}>
            <Text style={{ color: "#f8fafc", fontSize: 22, fontWeight: "800" }}>
              {title}
            </Text>
            <Text style={{ color: "#94a3b8", marginTop: 6 }}>
              {mode === "number"
                ? "Введите цифровое значение"
                : mode === "select"
                  ? "Выберите вариант"
                  : "Введите текст"}
            </Text>
          </View>

          <Pressable
            onPress={onCancel}
            style={{
              paddingHorizontal: 14,
              paddingVertical: 10,
              borderRadius: 16,
              backgroundColor: "rgba(148, 163, 184, 0.16)",
              borderWidth: 1,
              borderColor: "rgba(148, 163, 184, 0.24)",
            }}
          >
            <Text style={{ color: "#e2e8f0", fontWeight: "700" }}>Закрыть</Text>
          </Pressable>
        </View>

        <View
          style={{
            flex: 1,
            borderRadius: 28,
            backgroundColor: "#0f172a",
            borderWidth: 1,
            borderColor: "rgba(148, 163, 184, 0.16)",
            padding: 16,
            gap: 16,
          }}
        >
          <View
            style={{
              padding: 14,
              borderRadius: 20,
              backgroundColor: "rgba(148, 163, 184, 0.08)",
              borderWidth: 1,
              borderColor: "rgba(148, 163, 184, 0.14)",
            }}
          >
            <Text
              style={{
                color: "#7dd3fc",
                fontSize: 11,
                fontWeight: "800",
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              Текущее значение
            </Text>
            <Text
              style={{
                color: "#f8fafc",
                fontSize: 18,
                fontWeight: "700",
                marginTop: 8,
                minHeight: 24,
              }}
            >
              {draftValue || placeholder || "Пусто"}
            </Text>
          </View>

          {mode === "number" && (
            <View style={{ gap: 12 }}>
              {numberPadRows.map((row) => (
                <View key={row.join("-")} style={{ flexDirection: "row", gap: 10 }}>
                  {row.map((key) => {
                    const label = key === "backspace" ? "⌫" : key;
                    return (
                      <Pressable
                        key={key}
                        onPress={() => handleNumberKey(key)}
                        style={({ pressed }) => [
                          {
                            flex: 1,
                            minHeight: 64,
                            borderRadius: 18,
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: "rgba(56, 189, 248, 0.14)",
                            borderWidth: 1,
                            borderColor: "rgba(56, 189, 248, 0.2)",
                          },
                          pressed && { opacity: 0.82, transform: [{ scale: 0.98 }] },
                        ]}
                      >
                        <Text style={{ color: "#e0f2fe", fontSize: 22, fontWeight: "800" }}>
                          {label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              ))}
            </View>
          )}

          {mode === "select" && (
            <ScrollView contentContainerStyle={{ gap: 10, paddingBottom: 8 }}>
              {options.map((option) => {
                const selected = selectedOption === option.value;
                return (
                  <Pressable
                    key={option.value}
                    onPress={() => {
                      setDraftValue(option.value);
                      onSave(option.value);
                      onCancel();
                    }}
                    style={({ pressed }) => [
                      {
                        paddingVertical: 16,
                        paddingHorizontal: 14,
                        borderRadius: 18,
                        borderWidth: 1,
                        borderColor: selected
                          ? "rgba(34, 197, 94, 0.5)"
                          : "rgba(148, 163, 184, 0.16)",
                        backgroundColor: selected
                          ? "rgba(4, 120, 87, 0.18)"
                          : "rgba(148, 163, 184, 0.08)",
                      },
                      pressed && { opacity: 0.88 },
                    ]}
                  >
                    <Text style={{ color: "#f8fafc", fontSize: 16, fontWeight: "700" }}>
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          )}

          {mode === "text" && (
            <ScrollView contentContainerStyle={{ gap: 12, paddingBottom: 8 }}>
              <TextInput
                autoFocus
                value={draftValue}
                onChangeText={setDraftValue}
                placeholder={placeholder}
                placeholderTextColor="#64748b"
                multiline={multiline}
                style={{
                  borderRadius: 20,
                  backgroundColor: "#101a31",
                  color: "#f8fafc",
                  padding: 16,
                  textAlignVertical: multiline ? "top" : "center",
                fontSize: 16,
                minHeight: multiline ? 180 : 64,
              }}
              />
              {footerContent?.({
                value: draftValue,
                setValue: setDraftValue,
                close: onCancel,
              })}
            </ScrollView>
          )}

          {mode !== "select" && (
            <View style={{ flexDirection: "row", gap: 10 }}>
              <Pressable
                onPress={onCancel}
                style={{
                  flex: 1,
                  paddingVertical: 14,
                  borderRadius: 18,
                  backgroundColor: "rgba(148, 163, 184, 0.14)",
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#e2e8f0", fontWeight: "700" }}>Отмена</Text>
              </Pressable>

              <Pressable
                onPress={handleSave}
                style={{
                  flex: 1,
                  paddingVertical: 14,
                  borderRadius: 18,
                  backgroundColor: "#22c55e",
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#04110a", fontWeight: "800" }}>Готово</Text>
              </Pressable>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}
