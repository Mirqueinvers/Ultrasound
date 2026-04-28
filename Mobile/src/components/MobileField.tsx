import { Text, TextInput, View } from "react-native";

type MobileFieldStyles = {
  fieldWrap: object;
  fieldLabel: object;
  fieldInput: object;
  fieldInputMultiline: object;
};

type MobileFieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  styles: MobileFieldStyles;
  placeholder?: string;
  multiline?: boolean;
  minHeight?: number;
  editable?: boolean;
};

export function MobileField({
  label,
  value,
  onChangeText,
  styles,
  placeholder,
  multiline = false,
  minHeight = 48,
  editable = true,
}: MobileFieldProps) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#7c8ca5"
        multiline={multiline}
        editable={editable}
        style={[
          styles.fieldInput,
          multiline && styles.fieldInputMultiline,
          !editable && { opacity: 0.82 },
          { minHeight },
        ]}
      />
    </View>
  );
}
