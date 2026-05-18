import { StatusBar } from "expo-status-bar";
import { CameraView } from "expo-camera";
import { useRef, useState } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from "react-native";

import { InlineStat } from "./src/components/InlineStat";
import { HeroCard } from "./src/components/HeroCard";
import { SectionPanel } from "./src/components/SectionPanel";
import { StatusPill } from "./src/components/StatusPill";
import { type TabKey } from "./src/components/TabBar";
import { DraftScreen } from "./src/screens/DraftScreen";
import { LibraryScreen } from "./src/screens/LibraryScreen";
import { SummaryScreen } from "./src/screens/SummaryScreen";
import { styles } from "./src/styles/appStyles";
import { PROTOCOL_MANIFESTS } from "./src/shared/protocols";
import { type MobileSyncWireMessage } from "./src/shared/mobileSync";
import { useMobileConnection } from "./src/hooks/useMobileConnection";
import { useMobileSnapshot } from "./src/hooks/useMobileSnapshot";

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
    setSessionId,
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
    toggleProtocol,
    requestDesktopSave,
    requestDesktopPrint,
    requestDesktopClear,
    resetDraft,
    updateStudyByProtocolId,
    updateHeaderField,
    updateGeneralNote,
    updateSectionNote,
    updateObpLiverField,
    updateObpGallbladderField,
    updateObpGallbladderConcretionsList,
    updateObpGallbladderPolypsList,
    addObpGallbladderConcretion,
    addObpGallbladderPolyp,
    updateObpPancreasField,
    updateObpSpleenField,
    updateObpFreeFluidField,
    updateObpConclusionField,
    updateObpRecommendationsField,
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
          <>
            <HeroCard
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
            />

            <SectionPanel styles={styles} title="Mobile Sync" subtitle="Keep the current study in sync with the desktop host.">
              <InlineStat styles={styles} label="Host" value={hostUrl || "Not connected"} />
              <InlineStat styles={styles} label="WS" value={hostUrl ? `${toWsUrl(hostUrl)}/ws` : "Not connected"} />
              <InlineStat styles={styles} label="Socket" value={socketStatus === "open" ? "open" : "closed"} />
              <InlineStat
                styles={styles}
                label="Session"
                value={snapshot.session.sessionId ? snapshot.session.sessionId.slice(-8) : "No active session"}
              />
              <InlineStat
                styles={styles}
                label="Active protocol"
                value={snapshot.session.activeStudyLabel || "None selected"}
              />
              <InlineStat
                styles={styles}
                label="Save status"
                value={
                  saveState === "requested"
                    ? "Waiting for desktop save"
                    : saveState === "saved"
                      ? "Saved on desktop"
                      : "Idle"
                }
              />
              <Text style={styles.helperText}>
                Connect your phone to the desktop host to sync the current study live.
              </Text>
              {saveState === "saved" ? (
                <Text style={styles.saveSuccessText}>
                  The research has been saved on the desktop.
                </Text>
              ) : null}
            </SectionPanel>
          </>
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
            onSelectProtocol={(manifest) => setFocusedProtocolId(manifest.id)}
            onUpdateHeaderField={updateHeaderField}
            onUpdateGeneralNote={updateGeneralNote}
            onUpdateSectionNote={updateSectionNote}
            onUpdateObpLiverField={updateObpLiverField}
            onUpdateObpGallbladderField={updateObpGallbladderField}
            onUpdateObpGallbladderConcretionsList={updateObpGallbladderConcretionsList}
            onUpdateObpGallbladderPolypsList={updateObpGallbladderPolypsList}
            onAddObpGallbladderConcretion={addObpGallbladderConcretion}
            onAddObpGallbladderPolyp={addObpGallbladderPolyp}
            onUpdateObpPancreasField={updateObpPancreasField}
            onUpdateObpSpleenField={updateObpSpleenField}
            onUpdateObpFreeFluidField={updateObpFreeFluidField}
            onUpdateObpConclusionField={updateObpConclusionField}
            onUpdateObpRecommendationsField={updateObpRecommendationsField}
            onUpdateKidneyStudy={(value) => updateStudyByProtocolId("kidneys", value)}
            onUpdateScrotumStudy={(value) => updateStudyByProtocolId("scrotum", value)}
            onUpdateOmtFemaleStudy={(value) => updateStudyByProtocolId("omt_female", value)}
            onUpdateOmtMaleStudy={(value) => updateStudyByProtocolId("omt_male", value)}
            onUpdateThyroidStudy={(value) => updateStudyByProtocolId("thyroid", value)}
            onUpdateBreastStudy={(value) => updateStudyByProtocolId("breast", value)}
            onUpdateLymphNodesStudy={(value) => updateStudyByProtocolId("lymph_nodes", value)}
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

        <View style={{ height: 110 }} />
      </ScrollView>

      <View style={styles.bottomNav}>
        {([
          ["connect", "Connect"],
          ["library", "Library"],
          ["draft", "Draft"],
          ["summary", "Summary"],
        ] as const).map(([key, label]) => {
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

      {scannerVisible && (
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
      )}
    </SafeAreaView>
  );
}
