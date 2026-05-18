import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Modal, Pressable, ScrollView, Text, TextInput, View } from "react-native";

import { fieldEditorModalStyles } from "./FieldEditorModal.styles";
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
    () => options.find((option) => isNormalizedMatch(option.value, draftValue))?.value ?? "",
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
      <View style={fieldEditorModalStyles.overlay}>
        <View style={fieldEditorModalStyles.headerRow}>
          <View style={fieldEditorModalStyles.headerTextWrap}>
            <Text style={fieldEditorModalStyles.title}>{title}</Text>
            <Text style={fieldEditorModalStyles.subtitle}>
              {mode === "number"
                ? "Введите цифровое значение"
                : mode === "select"
                  ? "Выберите вариант"
                  : "Введите текст"}
            </Text>
          </View>

          <Pressable onPress={onCancel} style={fieldEditorModalStyles.closeButton}>
            <Text style={fieldEditorModalStyles.closeButtonText}>Закрыть</Text>
          </Pressable>
        </View>

        <View style={fieldEditorModalStyles.card}>
          <View style={fieldEditorModalStyles.currentValueCard}>
            <Text style={fieldEditorModalStyles.currentValueLabel}>Текущее значение</Text>
            <Text style={fieldEditorModalStyles.currentValueText}>
              {draftValue || placeholder || "Пусто"}
            </Text>
          </View>

          {mode === "number" && (
            <View style={fieldEditorModalStyles.numberPadContainer}>
              {numberPadRows.map((row) => (
                <View key={row.join("-")} style={fieldEditorModalStyles.numberPadRow}>
                  {row.map((key) => {
                    const label = key === "backspace" ? "⌫" : key;
                    return (
                      <Pressable
                        key={key}
                        onPress={() => handleNumberKey(key)}
                        style={({ pressed }) => [
                          fieldEditorModalStyles.numberKeyButton,
                          pressed && fieldEditorModalStyles.numberKeyButtonPressed,
                        ]}
                      >
                        <Text style={fieldEditorModalStyles.numberKeyLabel}>{label}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              ))}
            </View>
          )}

          {mode === "select" && (
            <ScrollView contentContainerStyle={fieldEditorModalStyles.selectList}>
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
                      fieldEditorModalStyles.selectOptionButton,
                      selected
                        ? fieldEditorModalStyles.selectOptionButtonSelected
                        : fieldEditorModalStyles.selectOptionButtonUnselected,
                      pressed && { opacity: 0.88 },
                    ]}
                  >
                    <Text style={fieldEditorModalStyles.selectOptionText}>{option.label}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          )}

          {mode === "text" && (
            <ScrollView contentContainerStyle={fieldEditorModalStyles.textAreaList}>
              <TextInput
                autoFocus
                value={draftValue}
                onChangeText={setDraftValue}
                placeholder={placeholder}
                placeholderTextColor="#64748b"
                multiline={multiline}
                style={[
                  fieldEditorModalStyles.textInput,
                  !multiline && fieldEditorModalStyles.textInputSingleLine,
                ]}
              />
              {footerContent?.({
                value: draftValue,
                setValue: setDraftValue,
                close: onCancel,
              })}
            </ScrollView>
          )}

          {mode !== "select" && (
            <View style={fieldEditorModalStyles.footerRow}>
              <Pressable
                onPress={onCancel}
                style={[fieldEditorModalStyles.footerButton, fieldEditorModalStyles.footerCancelButton]}
              >
                <Text style={fieldEditorModalStyles.footerCancelText}>Отмена</Text>
              </Pressable>

              <Pressable
                onPress={handleSave}
                style={[fieldEditorModalStyles.footerButton, fieldEditorModalStyles.footerSaveButton]}
              >
                <Text style={fieldEditorModalStyles.footerSaveText}>Готово</Text>
              </Pressable>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}
