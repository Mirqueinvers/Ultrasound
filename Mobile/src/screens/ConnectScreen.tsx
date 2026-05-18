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
        title="Синхронизация"
        subtitle="Синхронизируйте текущее исследование с рабочим местом."
      >
        <InlineStat styles={styles} label="Хост" value={hostUrl || "Не подключено"} />
        <InlineStat styles={styles} label="WS" value={hostUrl ? `${toWsUrl(hostUrl)}/ws` : "Не подключено"} />
        <InlineStat styles={styles} label="Сокет" value={socketStatus === "open" ? "открыт" : "закрыт"} />
        <InlineStat
          styles={styles}
          label="Сессия"
          value={snapshot.session.sessionId ? snapshot.session.sessionId.slice(-8) : "Нет активной сессии"}
        />
        <InlineStat
          styles={styles}
          label="Активный протокол"
          value={snapshot.session.activeStudyLabel || "Не выбран"}
        />
        <InlineStat
          styles={styles}
          label="Статус сохранения"
          value={
            saveState === "requested"
              ? "Ожидание сохранения на компьютере"
              : saveState === "saved"
                ? "Сохранено на компьютере"
                : "Без действий"
          }
        />
        <Text style={styles.helperText}>
          Подключите телефон к рабочему месту, чтобы синхронизировать текущее исследование.
        </Text>
        {saveState === "saved" ? (
          <Text style={styles.saveSuccessText}>
            Исследование сохранено на компьютере.
          </Text>
        ) : null}
      </SectionPanel>
    </>
  );
}
