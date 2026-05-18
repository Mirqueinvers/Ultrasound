import { CameraView } from "expo-camera";
import { Pressable, Text, View } from "react-native";

type CameraPermissionLike = {
  granted: boolean;
} | null | undefined;

type ScannerOverlayStyles = {
  scannerOverlay: object;
  scannerHeader: object;
  scannerTitle: object;
  scannerSubtitle: object;
  scannerCloseButton: object;
  buttonPressed: object;
  scannerCloseButtonText: object;
  scannerCamera: object;
  scannerPermissionCard: object;
  scannerPermissionTitle: object;
  scannerPermissionText: object;
  primaryButton: object;
  scannerPermissionButton: object;
  primaryButtonText: object;
};

type ScannerOverlayProps = {
  visible: boolean;
  cameraPermission: CameraPermissionLike;
  requestCameraPermission: () => Promise<{ granted: boolean }>;
  closeScanner: () => void;
  handleQrScanned: (payload: string) => Promise<void>;
  setConnectionError: (value: string) => void;
  styles: ScannerOverlayStyles;
};

export function ScannerOverlay({
  visible,
  cameraPermission,
  requestCameraPermission,
  closeScanner,
  handleQrScanned,
  setConnectionError,
  styles,
}: ScannerOverlayProps) {
  if (!visible) {
    return null;
  }

  return (
    <View style={styles.scannerOverlay}>
      <View style={styles.scannerHeader}>
        <View>
          <Text style={styles.scannerTitle}>Сканировать QR</Text>
          <Text style={styles.scannerSubtitle}>
            Используйте камеру, чтобы отсканировать QR-код из профиля на компьютере.
          </Text>
        </View>
        <Pressable
          onPress={closeScanner}
          style={({ pressed }) => [
            styles.scannerCloseButton,
            pressed && styles.buttonPressed,
          ]}
        >
          <Text style={styles.scannerCloseButtonText}>Закрыть</Text>
        </Pressable>
      </View>

      {cameraPermission?.granted ? (
        <CameraView
          style={styles.scannerCamera}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
          onBarcodeScanned={(result) => {
            if (!result.data) {
              return;
            }

            void handleQrScanned(result.data);
          }}
        />
      ) : (
        <View style={styles.scannerPermissionCard}>
          <Text style={styles.scannerPermissionTitle}>Нужен доступ к камере</Text>
          <Text style={styles.scannerPermissionText}>
            Разрешите доступ к камере, затем попробуйте отсканировать QR-код еще раз.
          </Text>
          <Pressable
            onPress={async () => {
              const permission = await requestCameraPermission();
              if (!permission.granted) {
                setConnectionError("Для сканирования QR-кода нужен доступ к камере.");
              }
            }}
            style={({ pressed }) => [
              styles.primaryButton,
              styles.scannerPermissionButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.primaryButtonText}>Разрешить камеру</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}
