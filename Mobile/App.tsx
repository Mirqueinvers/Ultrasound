import { useCallback, useEffect, useRef, useState } from "react";
import { Pressable, SafeAreaView, ScrollView, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";

import { type TabKey } from "./src/components/TabBar";
import { BottomNav } from "./src/components/BottomNav";
import { LandscapeBottomNav } from "./src/components/LandscapeBottomNav";
import { AppHeader } from "./src/components/AppHeader";
import { ScannerOverlay } from "./src/components/ScannerOverlay";
import { ProtocolNav } from "./src/components/ProtocolNav";
import { SwipeableDraftArea } from "./src/components/SwipeableDraftArea";
import { ConnectScreen } from "./src/screens/ConnectScreen";
import { DraftScreen } from "./src/screens/DraftScreen";
import { LibraryScreen } from "./src/screens/LibraryScreen";
import { SummaryScreen } from "./src/screens/SummaryScreen";
import { styles } from "./src/styles/appStyles";
import { PROTOCOL_MANIFESTS, getProtocolManifestByLabel } from "./src/shared/protocols";
import { type MobileSyncWireMessage } from "./src/shared/mobileSync";
import { useMobileConnection } from "./src/hooks/useMobileConnection";
import { useProtocolUpdateHandlers } from "./src/hooks/useProtocolUpdateHandlers";
import { useMobileSnapshot } from "./src/hooks/useMobileSnapshot";
import { useFieldVisibility } from "./src/settings/useFieldVisibility";
import { FieldVisibilitySettings } from "./src/components/FieldVisibilitySettings";
import { useOrientation } from "./src/hooks/useOrientation";

const BOTTOM_SPACER_HEIGHT = 110;

export default function App() {
  const [activeTab, setActiveTab] = useState<TabKey>("connect");
  const [saveState, setSaveState] = useState<"idle" | "requested" | "saved">("idle");
  const [, setSessionId] = useState<string | null>(null);
  const [connectSubTab, setConnectSubTab] = useState<"connect" | "fields">("connect");
  const contentScrollRef = useRef<ScrollView>(null);
  const wireMessageHandlerRef = useRef<((message: MobileSyncWireMessage) => void) | null>(null);
  const { visibility, toggleGroup } = useFieldVisibility();
  const { isLandscape } = useOrientation();

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
  }, [activeTab, activeSectionId, activeProtocolManifest?.id, activeDraftMode, connectSubTab]);

  // Если вкладка "Пациент" скрыта в настройках — автоматически переключаем на первый протокол
  useEffect(() => {
    const showPatientTab = visibility["_general.showPatientTab"] !== false;
    if (!showPatientTab && activeDraftMode === "patient") {
      const firstStudy = snapshot.selection.selectedStudies[0];
      if (firstStudy) {
        const manifest = getProtocolManifestByLabel(firstStudy);
        if (manifest) {
          setFocusedProtocolId(manifest.id);
          setActiveDraftMode("protocol");
        }
      }
    }
  }, [visibility, activeDraftMode, snapshot.selection.selectedStudies]);

  const contentArea = (
    <ScrollView
      ref={contentScrollRef}
      contentContainerStyle={[styles.content, isLandscape && { paddingHorizontal: 10, paddingTop: 2, paddingBottom: 10, gap: 8 }]}
      showsVerticalScrollIndicator={false}
    >
      {activeTab === "connect" && connectSubTab === "fields" && (
        <FieldVisibilitySettings
          styles={styles}
          visibility={visibility}
          onToggle={(id) => toggleGroup(id as any)}
          onClose={() => setConnectSubTab("connect")}
        />
      )}
      {activeTab === "connect" && connectSubTab !== "fields" && (
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
          fieldVisibility={visibility}
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

      <View style={{ height: isLandscape ? 10 : BOTTOM_SPACER_HEIGHT }} />
    </ScrollView>
  );

  const draftContent = activeTab === "draft" && isLandscape && activeDraftMode === "protocol" ? (
    <SwipeableDraftArea
      activeProtocolManifest={activeProtocolManifest}
      activeSectionId={activeSectionId}
      selectedStudies={snapshot.selection.selectedStudies}
      onSelectSection={setActiveSectionId}
      onSelectProtocol={(manifest) => {
        setFocusedProtocolId(manifest.id);
        setActiveDraftMode("protocol");
      }}
    >
      {contentArea}
    </SwipeableDraftArea>
  ) : null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="light" />
        <View style={styles.background}>
          <View style={styles.blobA} />
          <View style={styles.blobB} />
        </View>

        {activeTab === "connect" && (connectionState === "checking" || connectionState === "connecting") && (
          <View style={styles.connectionNotice}>
            <Text style={styles.connectionNoticeText}>
              {connectionState === "checking"
                ? "Проверка рабочего места..."
                : "Подключение к рабочему месту..."}
            </Text>
          </View>
        )}

        {activeTab === "draft" && !isLandscape && (
          <ProtocolNav
            styles={styles}
            visibility={visibility}
            selectedStudies={snapshot.selection.selectedStudies}
            activeProtocolManifest={activeProtocolManifest}
            activeSectionId={activeSectionId}
            activeDraftMode={activeDraftMode}
            setActiveDraftMode={setActiveDraftMode}
            onSelectProtocol={(manifest) => setFocusedProtocolId(manifest.id)}
            onSelectSection={setActiveSectionId}
          />
        )}

        {activeTab === "connect" && (
          <View style={[styles.tabBar, { marginHorizontal: 16, marginBottom: 0, marginTop: 2 }]}>
            <Pressable
              onPress={() => setConnectSubTab("connect")}
              style={({ pressed }) => [
                styles.tabButton,
                connectSubTab === "connect" && styles.tabButtonActive,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={[styles.tabButtonText, connectSubTab === "connect" && styles.tabButtonTextActive]}>
                Подключение
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setConnectSubTab("fields")}
              style={({ pressed }) => [
                styles.tabBar,
                styles.tabButton,
                connectSubTab === "fields" && styles.tabButtonActive,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={[styles.tabButtonText, connectSubTab === "fields" && styles.tabButtonTextActive]}>
                Видимость полей
              </Text>
            </Pressable>
          </View>
        )}

        {isLandscape ? (
          <View style={{ flex: 1 }}>
            {draftContent || contentArea}
            <LandscapeBottomNav
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
          </View>
        ) : (
          <>
            {contentArea}
            <BottomNav
              styles={styles}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
          </>
        )}

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
    </GestureHandlerRootView>
  );
}