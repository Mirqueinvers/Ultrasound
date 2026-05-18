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
          <Text style={styles.scannerTitle}>Scan QR</Text>
          <Text style={styles.scannerSubtitle}>
            Use the camera to scan the QR code from the desktop profile.
          </Text>
        </View>
        <Pressable
          onPress={closeScanner}
          style={({ pressed }) => [
            styles.scannerCloseButton,
            pressed && styles.buttonPressed,
          ]}
        >
          <Text style={styles.scannerCloseButtonText}>Close</Text>
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
          <Text style={styles.scannerPermissionTitle}>Camera access needed</Text>
          <Text style={styles.scannerPermissionText}>
            Allow camera access, then scan the QR code again.
          </Text>
          <Pressable
            onPress={async () => {
              const permission = await requestCameraPermission();
              if (!permission.granted) {
                setConnectionError("Camera access is required to scan the QR code.");
              }
            }}
            style={({ pressed }) => [
              styles.primaryButton,
              styles.scannerPermissionButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.primaryButtonText}>Allow camera</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}
