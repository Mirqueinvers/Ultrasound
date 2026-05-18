import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
import { SafeAreaView, ScrollView, Text, View } from "react-native";

import { type TabKey } from "./src/components/TabBar";
import { BottomNav } from "./src/components/BottomNav";
import { AppHeader } from "./src/components/AppHeader";
import { ScannerOverlay } from "./src/components/ScannerOverlay";
import { ProtocolNav } from "./src/components/ProtocolNav";
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

const BOTTOM_SPACER_HEIGHT = 110;

export default function App() {
  const [activeTab, setActiveTab] = useState<TabKey>("connect");
  const [saveState, setSaveState] = useState<"idle" | "requested" | "saved">("idle");
  const [, setSessionId] = useState<string | null>(null);
  const contentScrollRef = useRef<ScrollView>(null);
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
    activeSectionId,
    setActiveSectionId,
    activeDraftMode,
    setActiveDraftMode,
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

  useEffect(() => {
    contentScrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [activeTab, activeSectionId, activeProtocolManifest?.id, activeDraftMode]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.background}>
        <View style={styles.blobA} />
        <View style={styles.blobB} />
      </View>

      {activeTab === "connect" && (
        <>
          <AppHeader styles={styles} />

          {(connectionState === "checking" || connectionState === "connecting") && (
            <View style={styles.connectionNotice}>
              <Text style={styles.connectionNoticeText}>
                {connectionState === "checking"
                  ? "Проверка рабочего места..."
                  : "Подключение к рабочему месту..."}
              </Text>
            </View>
          )}
        </>
      )}

      <ProtocolNav
        styles={styles}
        selectedStudies={snapshot.selection.selectedStudies}
        activeProtocolManifest={activeProtocolManifest}
        activeSectionId={activeSectionId}
        activeDraftMode={activeDraftMode}
        setActiveDraftMode={setActiveDraftMode}
        onSelectProtocol={(manifest) => setFocusedProtocolId(manifest.id)}
        onSelectSection={setActiveSectionId}
      />

      <ScrollView
        ref={contentScrollRef}
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
            activeSectionId={activeSectionId}
            activeDraftMode={activeDraftMode}
            obpActions={obpActions}
            protocolUpdateHandlers={protocolUpdateHandlers}
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

      <BottomNav styles={styles} activeTab={activeTab} setActiveTab={setActiveTab} />

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

