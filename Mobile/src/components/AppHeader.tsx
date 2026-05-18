import { Text, View } from "react-native";

import { StatusPill } from "./StatusPill";
import type { AppStyles } from "../styles/appStyles";

type AppHeaderProps = {
  styles: AppStyles;
  connected: boolean;
  sessionId: string | null;
};

export function AppHeader({ styles, connected, sessionId }: AppHeaderProps) {
  return (
    <View style={styles.chrome}>
      <View>
        <Text style={styles.kicker}>Ultrasound Mobile</Text>
        <Text style={styles.title}>Ultrasound Mobile</Text>
        <Text style={styles.subtitle}>
          Подключитесь к рабочему месту и синхронизируйте исследования прямо с телефона.
        </Text>
      </View>

      <View style={styles.statusRow}>
        <StatusPill styles={styles} tone={connected ? "success" : "neutral"}>
          {connected ? "Подключено" : "Не подключено"}
        </StatusPill>
        <StatusPill styles={styles} tone="accent">
          {sessionId ? `Сессия ${sessionId.slice(-6)}` : "Нет сессии"}
        </StatusPill>
      </View>
    </View>
  );
}
