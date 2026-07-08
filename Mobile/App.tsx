import { useCallback, useEffect, useRef, useState } from "react";
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";

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
import { useFieldVisibility } from "./src/settings/useFieldVisibility";
import { FieldVisibilitySettings } from "./src/components/FieldVisibilitySettings";
import { useOrientation } from "./src/hooks/useOrientation";
import { getProtocolManifestByLabel } from "./src/shared/protocols";
import type { ProtocolManifest } from "./src/shared/protocols";

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

  // --- Навигация по разделам/протоколам (стрелки) ---
  const navigateSection = useCallback((direction: "prev" | "next") => {
    if (!activeProtocolManifest || !activeSectionId) return;

    const sections = activeProtocolManifest.sections;
    const currentIndex = sections.findIndex((s) => s.id === activeSectionId);
    if (currentIndex === -1) return;

    const selectedStudies = snapshot.selection.selectedStudies;
    const currentLabel = activeProtocolManifest.selectionLabel;

    if (direction === "next") {
      if (currentIndex + 1 < sections.length) {
        setActiveSectionId(sections[currentIndex + 1].id);
        return;
      }
      // Последний раздел → следующий протокол
      const labelIndex = selectedStudies.indexOf(currentLabel);
      if (labelIndex === -1 || labelIndex + 1 >= selectedStudies.length) return;
      const nextLabel = selectedStudies[labelIndex + 1];
      const nextManifest = getProtocolManifestByLabel(nextLabel);
      if (!nextManifest) return;
      setFocusedProtocolId(nextManifest.id);
      setActiveDraftMode("protocol");
      if (nextManifest.sections.length > 0) {
        setActiveSectionId(nextManifest.sections[0].id);
      }
    } else {
      if (currentIndex > 0) {
        setActiveSectionId(sections[currentIndex - 1].id);
        return;
      }
      // Первый раздел → предыдущий протокол
      const labelIndex = selectedStudies.indexOf(currentLabel);
      if (labelIndex <= 0) return;
      const prevLabel = selectedStudies[labelIndex - 1];
      const prevManifest = getProtocolManifestByLabel(prevLabel);
      if (!prevManifest) return;
      setFocusedProtocolId(prevManifest.id);
      setActiveDraftMode("protocol");
      if (prevManifest.sections.length > 0) {
        setActiveSectionId(prevManifest.sections[prevManifest.sections.length - 1].id);
      }
    }
  }, [activeProtocolManifest, activeSectionId, snapshot.selection.selectedStudies, setActiveSectionId, setFocusedProtocolId, setActiveDraftMode]);

  const contentArea = (
    <ScrollView
      ref={contentScrollRef}
      contentContainerStyle={[styles.content, isLandscape && { paddingHorizontal: 10, paddingTop: 2, paddingBottom: 10 }]}
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

      <View style={{ height: isLandscape ? 20 : BOTTOM_SPACER_HEIGHT }} />
    </ScrollView>
  );

  // Плавающая плашка с названием + стрелки
  const floatingNav = activeTab === "draft" && activeDraftMode === "protocol" && activeProtocolManifest ? (
    <View style={landscapeStyles.floatingContainer} pointerEvents="box-none">
      {/* Плашка с названием */}
      <View style={landscapeStyles.headerPill}>
        <Text style={landscapeStyles.headerText}>
          {activeProtocolManifest.selectionLabel} → {activeProtocolManifest.sections.find(s => s.id === activeSectionId)?.label ?? activeSectionId}
        </Text>
      </View>
      {/* Стрелки */}
      <Pressable
        onPress={() => navigateSection("prev")}
        style={({ pressed }) => [landscapeStyles.arrowButton, pressed && { opacity: 0.7 }]}
      >
        <Text style={landscapeStyles.arrowText}>◀</Text>
      </Pressable>
      <Pressable
        onPress={() => navigateSection("next")}
        style={({ pressed }) => [landscapeStyles.arrowButton, pressed && { opacity: 0.7 }]}
      >
        <Text style={landscapeStyles.arrowText}>▶</Text>
      </Pressable>
    </View>
  ) : null;

  return (
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
          {contentArea}
          {floatingNav}
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
  );
}

const landscapeStyles = StyleSheet.create({
  floatingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "flex-end",
    pointerEvents: "box-none",
  },
  headerPill: {
    position: "absolute",
    top: 6,
    alignSelf: "center",
    backgroundColor: "rgba(15, 23, 42, 0.75)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.12)",
  },
  headerText: {
    color: "#cbd5e1",
    fontSize: 10,
    fontWeight: "700",
  },
  arrowButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(15, 23, 42, 0.7)",
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.12)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 6,
  },
  arrowText: {
    color: "#f8fafc",
    fontSize: 14,
    fontWeight: "800",
  },
});