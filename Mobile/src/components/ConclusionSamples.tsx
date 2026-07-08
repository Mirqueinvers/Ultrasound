import { Pressable, Text, View } from "react-native";
import type { AppStyles } from "../styles/appStyles";

type ConclusionSample = {
  title: string;
  value: string;
};

type ConclusionSamplesProps = {
  styles: AppStyles;
  samples: ConclusionSample[];
  currentValue: string;
  setValue: (v: string) => void;
  close: () => void;
};

export function ConclusionSamples({
  styles,
  samples,
  currentValue,
  setValue,
  close,
}: ConclusionSamplesProps) {
  return (
    <View style={styles.obpSampleList}>
      {samples.map((sample) => (
        <Pressable
          key={sample.title}
          onPress={() => {
            const nextValue = currentValue
              ? `${currentValue}${currentValue.endsWith("\n") ? "" : "\n"}${sample.value}`
              : sample.value;
            setValue(nextValue);
          }}
          style={({ pressed }) => [
            styles.obpSampleButton,
            pressed && styles.obpSampleButtonPressed,
          ]}
        >
          <Text style={styles.obpSampleButtonTitle}>{sample.title}</Text>
          <Text style={styles.obpSampleButtonText}>{sample.value}</Text>
        </Pressable>
      ))}

      <Pressable
        onPress={close}
        style={({ pressed }) => [
          styles.secondaryButton,
          {
            alignSelf: "flex-start",
            paddingVertical: 10,
            paddingHorizontal: 14,
          },
          pressed && styles.buttonPressed,
        ]}
      >
        <Text style={styles.secondaryButtonText}>Закрыть</Text>
      </Pressable>
    </View>
  );
}
