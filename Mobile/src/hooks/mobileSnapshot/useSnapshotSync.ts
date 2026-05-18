import { useCallback, useEffect, type RefObject, type SetStateAction } from "react";

import { getProtocolManifestById, type ProtocolId } from "../../shared/protocols";
import { type MobileSyncSnapshot, type MobileSyncWireMessage } from "../../shared/mobileSync";
import { getProtocolIdFromDesktopKey } from "../../sync/adapters";
import { createSyncTimestamp } from "../../shared/mobileSync";
import { applySyncMessage } from "../../shared/syncHelpers";

type SaveState = "idle" | "requested" | "saved";

type UseSnapshotSyncOptions = {
  emitWireMessage: (message: MobileSyncWireMessage) => void;
  setSaveState: (value: SetStateAction<SaveState>) => void;
  setSessionId: (value: SetStateAction<string | null>) => void;
  setFocusedProtocolId: (value: SetStateAction<ProtocolId | null>) => void;
  applyLocalSnapshot: (updater: SetStateAction<MobileSyncSnapshot>) => void;
  wireMessageHandlerRef: RefObject<((message: MobileSyncWireMessage) => void) | null>;
};

export function useSnapshotSync({
  emitWireMessage,
  setSaveState,
  setSessionId,
  setFocusedProtocolId,
  applyLocalSnapshot,
  wireMessageHandlerRef,
}: UseSnapshotSyncOptions) {
  const handleWireMessage = useCallback(
    (message: MobileSyncWireMessage) => {
      applyLocalSnapshot((current) => applySyncMessage(current, message));

      if (message.type === "sync:snapshot") {
        setSessionId(message.state.session.sessionId);
        if (message.state.session.activeStudyLabel) {
          const nextProtocolId = getProtocolIdFromDesktopKey(message.state.session.activeStudyLabel);
          const nextManifest = nextProtocolId ? getProtocolManifestById(nextProtocolId) : null;
          if (nextManifest) {
            setFocusedProtocolId(nextManifest.id);
          }
        }

        return;
      }

      if (message.type === "sync:command") {
        if (message.command === "draft:saved") {
          setSaveState("saved");
          return;
        }

        if (message.command === "draft:print") {
          return;
        }
      }
    },
    [applyLocalSnapshot, setFocusedProtocolId, setSaveState, setSessionId],
  );

  useEffect(() => {
    wireMessageHandlerRef.current = handleWireMessage;
    return () => {
      if (wireMessageHandlerRef.current === handleWireMessage) {
        wireMessageHandlerRef.current = null;
      }
    };
  }, [handleWireMessage, wireMessageHandlerRef]);

  const closeDraftSession = () => {
    emitWireMessage({
      type: "sync:command",
      command: "draft:close",
      origin: "mobile",
      updatedAt: createSyncTimestamp(),
    });

    setSaveState("idle");
  };

  return {
    closeDraftSession,
  };
}
