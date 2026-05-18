import { Text, View } from "react-native";

import { InlineStat } from "../components/InlineStat";
import { HeroCard } from "../components/HeroCard";
import { SectionPanel } from "../components/SectionPanel";
import type { MobileSyncSnapshot } from "../shared/mobileSync";
import type { AppStyles } from "../styles/appStyles";

type ConnectScreenProps = {
  styles: AppStyles;
  connected: boolean;
  connectionState: "idle" | "checking" | "connecting" | "connected" | "error";
  connectionError: string;
  hostUrl: string;
  pairingCode: string;
  setHostUrl: (value: string) => void;
  setPairingCode: (value: string) => void;
  connectToHost: () => Promise<void>;
  disconnect: () => void;
  openScanner: () => Promise<void>;
  resetDraft: () => void;
  toWsUrl: (httpUrl: string) => string;
  socketStatus: "closed" | "open";
  snapshot: MobileSyncSnapshot;
  saveState: "idle" | "requested" | "saved";
};

export function ConnectScreen({
  styles,
  connected,
  connectionState,
  connectionError,
  hostUrl,
  pairingCode,
  setHostUrl,
  setPairingCode,
  connectToHost,
  disconnect,
  openScanner,
  resetDraft,
  toWsUrl,
  socketStatus,
  snapshot,
  saveState,
}: ConnectScreenProps) {
  return (
    <>
      <HeroCard
        styles={styles}
        connected={connected}
        connectionState={connectionState}
        connectionError={connectionError}
        hostUrl={hostUrl}
        pairingCode={pairingCode}
        setHostUrl={setHostUrl}
        setPairingCode={setPairingCode}
        connectToHost={connectToHost}
        disconnect={disconnect}
        openScanner={openScanner}
        resetDraft={resetDraft}
      />

      <SectionPanel
        styles={styles}
        title="Mobile Sync"
        subtitle="Keep the current study in sync with the desktop host."
      >
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
  );
}
