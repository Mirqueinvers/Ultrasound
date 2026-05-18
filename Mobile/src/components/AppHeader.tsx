import { Text, View } from "react-native";

import type { AppStyles } from "../styles/appStyles";

type AppHeaderProps = {
  styles: AppStyles;
};

export function AppHeader({ styles }: AppHeaderProps) {
  return (
    <View style={styles.chrome}>
      <View>
        <Text style={styles.kicker}>Ultrasound Mobile</Text>
        <Text style={styles.title}>Ultrasound Mobile</Text>
        <Text style={styles.subtitle}>
          Подключитесь к рабочему месту и синхронизируйте исследования прямо с телефона.
        </Text>
      </View>
    </View>
  );
}
