import { Pressable, Text, View } from "react-native";

import { MobileField } from "./MobileField";
import { StatusPill } from "./StatusPill";
import type { AppStyles } from "../styles/appStyles";

type HeroCardProps = {
  styles: AppStyles;
  connected: boolean;
  connectionState: "idle" | "checking" | "connecting" | "connected" | "error";
  connectionError: string;
  hostUrl: string;
  pairingCode: string;
  setHostUrl: (value: string) => void;
  setPairingCode: (value: string) => void;
  connectToHost: () => Promise<void>;
  openScanner: () => Promise<void>;
  disconnect: () => void;
  resetDraft: () => void;
};

export function HeroCard({
  styles,
  connected,
  connectionState,
  connectionError,
  hostUrl,
  pairingCode,
  setHostUrl,
  setPairingCode,
  connectToHost,
  openScanner,
  disconnect,
  resetDraft,
}: HeroCardProps) {
  return (
    <View style={styles.heroCard}>
      <View style={styles.heroHeader}>
        <View style={styles.heroHeaderCopy}>
          <Text style={styles.heroTitle}>
            {connected ? "Подключено" : "Готов к подключению"}
          </Text>
          <Text style={styles.heroText}>
            {connected
              ? "Телефон подключён к рабочему месту. Начните исследование или продолжайте редактирование."
              : "Отсканируйте QR-код на компьютере, чтобы подключить телефон."}
          </Text>
        </View>
        <View style={styles.heroStatusWrap}>
          <StatusPill styles={styles} tone={connected ? "success" : "accent"}>
            {connectionState === "checking"
              ? "Проверка"
              : connected
                ? "Онлайн"
                : "Нет связи"}
          </StatusPill>
        </View>
      </View>

      {connectionError ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{connectionError}</Text>
        </View>
      ) : null}

      <MobileField
        styles={styles}
        label="Рабочее место"
        value={hostUrl}
        onChangeText={setHostUrl}
        placeholder="http://192.168.1.10:38241"
      />

      <MobileField
        styles={styles}
        label="Код сопряжения"
        value={pairingCode}
        onChangeText={setPairingCode}
        placeholder="123456"
      />

      <View style={styles.heroActions}>
        <Pressable
          onPress={connectToHost}
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && styles.buttonPressed,
          ]}
        >
          <Text style={styles.primaryButtonText}>
            {connected ? "Подключиться заново" : "Подключиться"}
          </Text>
        </Pressable>

        <Pressable
          onPress={disconnect}
          style={({ pressed }) => [
            styles.secondaryButton,
            pressed && styles.buttonPressed,
          ]}
        >
          <Text style={styles.secondaryButtonText}>Отключиться</Text>
        </Pressable>

        <Pressable
          onPress={openScanner}
          style={({ pressed }) => [
            styles.secondaryButton,
            pressed && styles.buttonPressed,
          ]}
        >
          <Text style={styles.secondaryButtonText}>Сканировать QR</Text>
        </Pressable>

        <Pressable
          onPress={resetDraft}
          style={({ pressed }) => [
            styles.secondaryButton,
            pressed && styles.buttonPressed,
          ]}
        >
          <Text style={styles.secondaryButtonText}>Закрыть сессию</Text>
        </Pressable>
      </View>
    </View>
  );
}
