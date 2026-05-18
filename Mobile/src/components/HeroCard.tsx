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
            {connected ? "Connected" : "Ready to connect"}
          </Text>
          <Text style={styles.heroText}>
            {connected
              ? "Your phone is linked to the desktop host. Start a study or continue editing live."
              : "Scan the QR code on the desktop to connect your phone."}
          </Text>
        </View>
        <View style={styles.heroStatusWrap}>
          <StatusPill styles={styles} tone={connected ? "success" : "accent"}>
            {connectionState === "checking"
              ? "Checking"
              : connected
                ? "Online"
                : "Offline"}
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
        label="Desktop host"
        value={hostUrl}
        onChangeText={setHostUrl}
        placeholder="http://192.168.1.10:38241"
      />

      <MobileField
        styles={styles}
        label="Pairing code"
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
            {connected ? "Reconnect" : "Connect"}
          </Text>
        </Pressable>

        <Pressable
          onPress={disconnect}
          style={({ pressed }) => [
            styles.secondaryButton,
            pressed && styles.buttonPressed,
          ]}
        >
          <Text style={styles.secondaryButtonText}>Disconnect</Text>
        </Pressable>

        <Pressable
          onPress={openScanner}
          style={({ pressed }) => [
            styles.secondaryButton,
            pressed && styles.buttonPressed,
          ]}
        >
          <Text style={styles.secondaryButtonText}>Scan QR</Text>
        </Pressable>

        <Pressable
          onPress={resetDraft}
          style={({ pressed }) => [
            styles.secondaryButton,
            pressed && styles.buttonPressed,
          ]}
        >
          <Text style={styles.secondaryButtonText}>Close session</Text>
        </Pressable>
      </View>
    </View>
  );
}
