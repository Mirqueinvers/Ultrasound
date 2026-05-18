import { StatusBar } from "expo-status-bar";
import { useRef, useState } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from "react-native";

import { StatusPill } from "./src/components/StatusPill";
import { type TabKey } from "./src/components/TabBar";
import { ScannerOverlay } from "./src/components/ScannerOverlay";
import { ConnectScreen } from "./src/screens/ConnectScreen";
import { DraftScreen } from "./src/screens/DraftScreen";
import { LibraryScreen } from "./src/screens/LibraryScreen";
import { SummaryScreen } from "./src/screens/SummaryScreen";
import { styles } from "./src/styles/appStyles";
import { PROTOCOL_MANIFESTS } from "./src/shared/protocols";
import { type MobileSyncWireMessage } from "./src/shared/mobileSync";
import { useMobileConnection } from "./src/hooks/useMobileConnection";
import { useProtocolUpdateHandlers } from "./src/hooks/useProtocolUpdateHandlers";
import { useMobileSnapshot } from "./src/hooks/useMobileSnapshot";
import { MOBILE_TABS } from "./src/navigation/mobileTabs";

const BOTTOM_SPACER_HEIGHT = 110;

export default function App() {
  const [activeTab, setActiveTab] = useState<TabKey>("connect");
  const [saveState, setSaveState] = useState<"idle" | "requested" | "saved">("idle");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const wireMessageHandlerRef = useRef<((message: MobileSyncWireMessage) => void) | null>(null);

  const {
    connectionState,
    connectionError,
    socketStatus,
    scannerVisible,
    cameraPermission,
    requestCameraPermission,
    hostUrl,
    pairingCode,
    connected,
    toWsUrl,
    connectToHost,
    disconnect,
    openScanner,
    closeScanner,
    handleQrScanned,
    setHostUrlInput,
    setPairingCode,
    setConnectionError,
    emitWireMessage,
  } = useMobileConnection({
    setActiveTab,
    setSaveState,
    wireMessageHandlerRef,
  });

  const {
    snapshot,
    activeProtocolManifest,
    focusedProtocolId,
    setFocusedProtocolId,
    reviewIssues,
    canSaveDraft,
    studiesData,
    obpActions,
    toggleProtocol,
    requestDesktopSave,
    requestDesktopPrint,
    requestDesktopClear,
    resetDraft,
    updateStudyByProtocolId,
    updateHeaderField,
    updateGeneralNote,
    updateSectionNote,
  } = useMobileSnapshot({
    connected,
    emitWireMessage,
    setActiveTab,
    setSaveState,
    saveState,
    setConnectionError,
    setSessionId,
    wireMessageHandlerRef,
  });

  const protocolUpdateHandlers = useProtocolUpdateHandlers(updateStudyByProtocolId);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.background}>
        <View style={styles.blobA} />
        <View style={styles.blobB} />
      </View>

      <View style={styles.chrome}>
        <View>
          <Text style={styles.kicker}>Ultrasound Mobile</Text>
          <Text style={styles.title}>Ultrasound Mobile</Text>
          <Text style={styles.subtitle}>Connect to the desktop host and sync studies live from your phone.</Text>
        </View>

        <View style={styles.statusRow}>
          <StatusPill styles={styles} tone={connected ? "success" : "neutral"}>
            {connected ? "Connected" : "Not connected"}
          </StatusPill>
          <StatusPill styles={styles} tone="accent">
            {sessionId ? `Session ${sessionId.slice(-6)}` : "No session"}
          </StatusPill>
        </View>
      </View>

      {(connectionState === "checking" || connectionState === "connecting") && (
        <View style={styles.connectionNotice}>
          <Text style={styles.connectionNoticeText}>
            {connectionState === "checking"
              ? "Checking desktop host..."
              : "Connecting to desktop..."}
          </Text>
        </View>
      )}

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === "connect" && (
          <ConnectScreen
            styles={styles}
            connected={connected}
            connectionState={connectionState}
            connectionError={connectionError}
            hostUrl={hostUrl}
            pairingCode={pairingCode}
            setHostUrl={setHostUrlInput}
            setPairingCode={setPairingCode}
            connectToHost={connectToHost}
            disconnect={disconnect}
            openScanner={openScanner}
            resetDraft={resetDraft}
            toWsUrl={toWsUrl}
            socketStatus={socketStatus}
            snapshot={snapshot}
            saveState={saveState}
          />
        )}

        {activeTab === "library" && (
          <LibraryScreen
            styles={styles}
            manifests={PROTOCOL_MANIFESTS}
            selectedStudies={snapshot.selection.selectedStudies}
            focusedProtocolId={focusedProtocolId}
            onToggleProtocol={toggleProtocol}
          />
        )}

        {activeTab === "draft" && (
          <DraftScreen
            styles={styles}
            snapshot={snapshot}
            studiesData={studiesData}
            activeProtocolManifest={activeProtocolManifest}
            obpActions={obpActions}
            protocolUpdateHandlers={protocolUpdateHandlers}
            onSelectProtocol={(manifest) => setFocusedProtocolId(manifest.id)}
            onUpdateHeaderField={updateHeaderField}
            onUpdateGeneralNote={updateGeneralNote}
            onUpdateSectionNote={updateSectionNote}
          />
        )}
        {activeTab === "summary" && (
          <SummaryScreen
            styles={styles}
            snapshot={snapshot}
            reviewIssues={reviewIssues}
            canSaveDraft={canSaveDraft}
            saveState={saveState}
            onRequestDesktopSave={requestDesktopSave}
            onRequestDesktopPrint={requestDesktopPrint}
            onRequestDesktopClear={requestDesktopClear}
          />
        )}

        <View style={{ height: BOTTOM_SPACER_HEIGHT }} />
      </ScrollView>

      <View style={styles.bottomNav}>
        {MOBILE_TABS.map(({ key, label }) => {
          const active = activeTab === key;
          return (
            <Pressable
              key={key}
              onPress={() => setActiveTab(key)}
              style={({ pressed }) => [
                styles.navItem,
                active && styles.navItemActive,
                pressed && styles.navItemPressed,
              ]}
            >
              <Text style={[styles.navLabel, active && styles.navLabelActive]}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <ScannerOverlay
        visible={scannerVisible}
        cameraPermission={cameraPermission}
        requestCameraPermission={requestCameraPermission}
        closeScanner={closeScanner}
        handleQrScanned={handleQrScanned}
        setConnectionError={setConnectionError}
        styles={styles}
      />
    </SafeAreaView>
  );
}
