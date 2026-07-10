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
import { SettingsHeader } from "./src/components/SettingsHeader";
import { useOrientation } from "./src/hooks/useOrientation";

const BOTTOM_SPACER_HEIGHT = 110;

export default function App() {
  const [activeTab, setActiveTab] = useState<TabKey>("connect");
  const [saveState, setSaveState] = useState<"idle" | "requested" | "saved">("idle");
  const [, setSessionId] = useState<string | null>(null);
  const [connectSubTab, setConnectSubTab] = useState<"connect" | "fields" | null>(null);
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

  // Контент для вкладок, кроме connect (там своя структура)
  const otherContent = activeTab !== "connect" && (
    <ScrollView
      ref={contentScrollRef}
      contentContainerStyle={[styles.content, isLandscape && { paddingHorizontal: 10, paddingTop: 2, paddingBottom: 10, gap: 8 }]}
      showsVerticalScrollIndicator={false}
    >
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

  // Экран "connect" с меню (connectSubTab === null)
  const connectMenu = activeTab === "connect" && connectSubTab === null && (
    <ScrollView
      ref={contentScrollRef}
      contentContainerStyle={[styles.content, isLandscape && { paddingHorizontal: 10, paddingTop: 2, paddingBottom: 10, gap: 8 }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 40, gap: 14 }}>
        <Text style={{ color: "#f8fafc", fontSize: 26, fontWeight: "800", textAlign: "center", marginBottom: 8 }}>
          Настройки
        </Text>
        <Pressable
          onPress={() => setConnectSubTab("connect")}
          style={({ pressed }) => ({
            backgroundColor: "rgba(15, 23, 42, 0.7)",
            borderRadius: 20,
            borderWidth: 1,
            borderColor: "rgba(148, 163, 184, 0.16)",
            padding: 18,
            alignItems: "center",
            gap: 4,
            opacity: pressed ? 0.85 : 1,
          })}
        >
          <Text style={{ color: "#f8fafc", fontSize: 17, fontWeight: "800" }}>Подключение</Text>
          <Text style={{ color: "#94a3b8", fontSize: 12, textAlign: "center" }}>
            QR-сканер, ручной ввод адреса, статус соединения
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setConnectSubTab("fields")}
          style={({ pressed }) => ({
            backgroundColor: "rgba(15, 23, 42, 0.7)",
            borderRadius: 20,
            borderWidth: 1,
            borderColor: "rgba(148, 163, 184, 0.16)",
            padding: 18,
            alignItems: "center",
            gap: 4,
            opacity: pressed ? 0.85 : 1,
          })}
        >
          <Text style={{ color: "#f8fafc", fontSize: 17, fontWeight: "800" }}>Видимость полей</Text>
          <Text style={{ color: "#94a3b8", fontSize: 12, textAlign: "center" }}>
            Настройка отображения полей для каждого протокола
          </Text>
        </Pressable>
        <View style={{ flex: 1 }} />
      </View>
      <View style={{ height: isLandscape ? 10 : BOTTOM_SPACER_HEIGHT }} />
    </ScrollView>
  );

  // Подраздел connect с фиксированным хедером
  const connectSubContent = activeTab === "connect" && connectSubTab !== null && (
    <View style={{ flex: 1 }}>
      <SettingsHeader
        title={connectSubTab === "connect" ? "Подключение" : "Видимость полей"}
        onBack={() => setConnectSubTab(null)}
      />
      <ScrollView
        ref={contentScrollRef}
        contentContainerStyle={[styles.content, isLandscape && { paddingHorizontal: 10, paddingTop: 2, paddingBottom: 10, gap: 8 }]}
        showsVerticalScrollIndicator={false}
      >
        {connectSubTab === "connect" && (
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
        {connectSubTab === "fields" && (
          <FieldVisibilitySettings
            styles={styles}
            visibility={visibility}
            onToggle={(id) => toggleGroup(id as any)}
          />
        )}
        <View style={{ height: isLandscape ? 10 : BOTTOM_SPACER_HEIGHT }} />
      </ScrollView>
    </View>
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
      {otherContent}
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

        {isLandscape ? (
          <View style={{ flex: 1 }}>
            {draftContent || connectMenu || connectSubContent || otherContent}
            <LandscapeBottomNav
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
          </View>
        ) : (
          <>
            {connectMenu || connectSubContent || otherContent}
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