import { StatusBar } from "expo-status-bar";
import { CameraView, useCameraPermissions } from "expo-camera";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useMemo, useRef, useState, type SetStateAction } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import { InlineStat } from "./src/components/InlineStat";
import { HeroCard } from "./src/components/HeroCard";
import { MobileField } from "./src/components/MobileField";
import { SectionPanel } from "./src/components/SectionPanel";
import { StatusPill } from "./src/components/StatusPill";
import { type TabKey } from "./src/components/TabBar";
import { DraftScreen } from "./src/screens/DraftScreen";
import { LibraryScreen } from "./src/screens/LibraryScreen";
import { SummaryScreen } from "./src/screens/SummaryScreen";
import { styles } from "./src/styles/appStyles";
import {
  PROTOCOL_MANIFESTS,
  getProtocolManifestById,
  getProtocolManifestByLabel,
  type ProtocolId,
  type ProtocolManifest,
} from "./src/shared/protocols";
import {
  applySyncMessage,
  createEmptyStudyDraft,
  createInitialMobileSnapshot,
  type StudyDraft,
} from "./src/shared/syncHelpers";
import {
  createEmptyObpDraft,
  createEmptyLiverDraft,
  createEmptyGallbladderConcretionDraft,
  createEmptyGallbladderPolypDraft,
  createEmptyPancreasDraft,
  createEmptySpleenDraft,
  type ObpDraft,
  type LiverDraft,
  type GallbladderDraft,
  type GallbladderConcretionDraft,
  type GallbladderPolypDraft,
  type PancreasDraft,
  type SpleenDraft,
} from "./src/shared/obpDraft";
import {
  createEmptyKidneyConcrementDraft,
  createEmptyKidneyCystDraft,
  createEmptyKidneyDraft,
  createEmptyKidneyStudyDraft,
  createEmptyUrinaryBladderDraft,
  type KidneyDraft,
  type KidneyStudyDraft,
  type KidneyConcrementDraft,
  type KidneyCystDraft,
  type UrinaryBladderDraft,
} from "./src/shared/kidneyDraft";
import {
  createEmptyOmtFemaleDraft,
  type OmtFemaleDraft,
} from "./src/shared/omtFemaleDraft";
import {
  createEmptyOmtMaleDraft,
  type OmtMaleDraft,
  type ProstateDraft,
} from "./src/shared/omtMaleDraft";
import {
  createEmptyThyroidStudyDraft,
  type ThyroidStudyDraft,
} from "./src/shared/thyroidDraft";
import {
  createEmptyBreastStudyDraft,
  createEmptyBreastSideDraft,
  createEmptyBreastNodeDraft,
  type BreastStudyDraft,
  type BreastProtocolDraft,
  type BreastSideDraft,
  type BreastNodeDraft,
} from "./src/shared/breastDraft";
import {
  createEmptyLymphNodesStudyDraft,
  normalizeLymphNodesStudyDraft,
  type LymphNodesStudyDraft,
} from "./src/shared/lymphNodesDraft";
import {
  createEmptyScrotumDraft,
  createEmptySingleTestisDraft,
  type ScrotumDraft,
  type SingleTestisDraft,
} from "./src/shared/scrotumDraft";
import {
  createSyncTimestamp,
  type MobileSyncSnapshot,
  type MobileSyncWireMessage,
} from "./src/shared/mobileSync";

const initialHostUrl = "http://192.168.1.10:38241";
const lastHostStorageKey = "ultrasound-mobile:last-host-url";
const lastCodeStorageKey = "ultrasound-mobile:last-pairing-code";
function normalizeHostUrl(value: string): string {
  const trimmed = value.trim().replace(/\/+$/, "");
  if (!trimmed) {
    return "";
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  return `http://${trimmed}`;
}

function toWsUrl(httpUrl: string): string {
  return httpUrl.replace(/^http/i, "ws");
}

function parseMobileSyncPayload(raw: string): { host: string; code: string } | null {
  try {
    const url = new URL(raw);

    if (url.protocol !== "ultrasound-mobile:" || url.hostname !== "connect") {
      return null;
    }

    const host = url.searchParams.get("host") ?? "";
    const code = url.searchParams.get("code") ?? "";

    if (!host || !code) {
      return null;
    }

    return { host, code };
  } catch {
    return null;
  }
}

type MobileStudyData =
  | StudyDraft
  | ObpDraft
  | KidneyStudyDraft
  | ScrotumDraft
  | OmtFemaleDraft
  | OmtMaleDraft
  | ThyroidStudyDraft
  | BreastStudyDraft
  | LymphNodesStudyDraft;

function isObpDraft(value: unknown): value is ObpDraft {
  return Boolean(
    value &&
      typeof value === "object" &&
      "liver" in value &&
      "freeFluid" in value &&
      "conclusion" in value &&
      "recommendations" in value,
  );
}

function normalizeObpDraft(value: unknown): ObpDraft {
  const base = createEmptyObpDraft();
  const source = value && typeof value === "object" ? (value as Partial<ObpDraft>) : {};

  return {
    ...base,
    ...source,
    liver: {
      ...base.liver,
      ...(source.liver ?? {}),
    },
    gallbladder: {
      ...base.gallbladder,
      ...(source.gallbladder ?? {}),
    },
    pancreas: {
      ...base.pancreas,
      ...(source.pancreas ?? {}),
    },
    spleen: {
      ...base.spleen,
      ...(source.spleen ?? {}),
    },
  };
}

function normalizeKidneyDraft(value: unknown): KidneyStudyDraft {
  const base = createEmptyKidneyStudyDraft();
  const source = value && typeof value === "object" ? (value as Partial<KidneyStudyDraft>) : {};

  const normalizeKidneySide = (kidney: unknown): KidneyDraft => {
    const sourceKidney =
      kidney && typeof kidney === "object" ? (kidney as Partial<KidneyDraft>) : {};

    return {
      ...createEmptyKidneyDraft(),
      ...sourceKidney,
      parenchymaConcrementslist: sourceKidney.parenchymaConcrementslist ?? [],
      parenchymaCystslist: sourceKidney.parenchymaCystslist ?? [],
      pcsConcrementslist: sourceKidney.pcsConcrementslist ?? [],
      pcsCystslist: sourceKidney.pcsCystslist ?? [],
    };
  };

  const normalizeBladder = (bladder: unknown): UrinaryBladderDraft => {
    const sourceBladder =
      bladder && typeof bladder === "object" ? (bladder as Partial<UrinaryBladderDraft>) : {};

    return {
      ...createEmptyUrinaryBladderDraft(),
      ...sourceBladder,
    };
  };

  return {
    ...base,
    ...source,
    rightKidney: normalizeKidneySide(source.rightKidney ?? {}),
    leftKidney: normalizeKidneySide(source.leftKidney ?? {}),
    urinaryBladder: normalizeBladder(source.urinaryBladder ?? {}),
  };
}

function normalizeOmtFemaleDraft(value: unknown): OmtFemaleDraft {
  const base = createEmptyOmtFemaleDraft();
  const source = value && typeof value === "object" ? (value as Partial<OmtFemaleDraft>) : {};

  const normalizeUterusNode = (node: unknown) => {
    const sourceNode = node && typeof node === "object" ? (node as Partial<OmtFemaleDraft["uterus"]["myomaNodesList"][number]>) : {};
    return {
      number: typeof sourceNode.number === "number" ? sourceNode.number : 1,
      wallLocation: sourceNode.wallLocation ?? "",
      layerType: sourceNode.layerType ?? "",
      size1: sourceNode.size1 ?? "",
      size2: sourceNode.size2 ?? "",
      contourClarity: sourceNode.contourClarity ?? "",
      contourEvenness: sourceNode.contourEvenness ?? "",
      echogenicity: sourceNode.echogenicity ?? "",
      structure: sourceNode.structure ?? "",
      cavityImpact: sourceNode.cavityImpact ?? "",
      bloodFlow: sourceNode.bloodFlow ?? "",
      comment: sourceNode.comment ?? "",
    };
  };

  const normalizeOvary = (ovary: unknown): OmtFemaleDraft["leftOvary"] => {
    const sourceOvary = ovary && typeof ovary === "object" ? (ovary as Partial<OmtFemaleDraft["leftOvary"]>) : {};

    return {
      ...createEmptyOmtFemaleDraft().leftOvary,
      ...sourceOvary,
      cystsList: sourceOvary.cystsList?.length
        ? sourceOvary.cystsList.map((item) => ({
            size: item.size ?? "",
          }))
        : [],
    };
  };

  const normalizeBladder = (
    bladder: unknown,
  ): OmtFemaleDraft["urinaryBladder"] => {
    const sourceBladder =
      bladder && typeof bladder === "object" ? (bladder as Partial<OmtFemaleDraft["urinaryBladder"]>) : {};

    return {
      ...createEmptyOmtFemaleDraft().urinaryBladder,
      ...sourceBladder,
    };
  };

  const uterusSource =
    source.uterus && typeof source.uterus === "object"
      ? (source.uterus as Partial<OmtFemaleDraft["uterus"]>)
      : {};

  return {
    ...base,
    ...source,
    uterus: {
      ...base.uterus,
      ...uterusSource,
      myomaNodesList: uterusSource.myomaNodesList?.length
        ? uterusSource.myomaNodesList.map((node) => normalizeUterusNode(node))
        : [],
    },
    leftOvary: normalizeOvary(source.leftOvary),
    rightOvary: normalizeOvary(source.rightOvary),
    urinaryBladder: normalizeBladder(source.urinaryBladder),
  };
}

function normalizeProstateDraft(value: unknown): ProstateDraft {
  const base = createEmptyOmtMaleDraft().prostate;
  const source = value && typeof value === "object" ? (value as Partial<ProstateDraft>) : {};

  return {
    ...base,
    ...source,
  };
}

function normalizeOmtMaleDraft(value: unknown): OmtMaleDraft {
  const base = createEmptyOmtMaleDraft();
  const source = value && typeof value === "object" ? (value as Partial<OmtMaleDraft>) : {};

  const normalizeBladder = (
    bladder: unknown,
  ): OmtMaleDraft["urinaryBladder"] => {
    const sourceBladder =
      bladder && typeof bladder === "object" ? (bladder as Partial<OmtMaleDraft["urinaryBladder"]>) : {};

    return {
      ...createEmptyOmtMaleDraft().urinaryBladder,
      ...sourceBladder,
    };
  };

  return {
    ...base,
    ...source,
    prostate: normalizeProstateDraft(source.prostate),
    urinaryBladder: normalizeBladder(source.urinaryBladder),
  };
}

function normalizeThyroidDraft(value: unknown): ThyroidStudyDraft {
  const base = createEmptyThyroidStudyDraft();
  const source = value && typeof value === "object" ? (value as Partial<ThyroidStudyDraft>) : {};

  const normalizeNode = (node: unknown) => {
    const sourceNode =
      node && typeof node === "object"
        ? (node as Partial<ThyroidStudyDraft["thyroid"]["rightLobe"]["nodesList"][number]>)
        : {};

    return {
      ...createEmptyThyroidStudyDraft().thyroid.rightLobe.nodesList[0] ?? undefined,
      number: typeof sourceNode.number === "number" ? sourceNode.number : 1,
      size1: sourceNode.size1 ?? "",
      size2: sourceNode.size2 ?? "",
      echogenicity: sourceNode.echogenicity ?? "изоэхогенный",
      echostructure: sourceNode.echostructure ?? "однородная",
      contour: sourceNode.contour ?? "четкий ровный",
      echogenicFoci: sourceNode.echogenicFoci ?? "",
      orientation: sourceNode.orientation ?? "горизонтальная",
      bloodFlow: sourceNode.bloodFlow ?? "не изменен",
      comment: sourceNode.comment ?? "",
      tiradsCategory: sourceNode.tiradsCategory ?? "",
    };
  };

  const normalizeLobe = (
    lobe: unknown,
  ): ThyroidStudyDraft["thyroid"]["rightLobe"] => {
    const sourceLobe =
      lobe && typeof lobe === "object"
        ? (lobe as Partial<ThyroidStudyDraft["thyroid"]["rightLobe"]>)
        : {};

    return {
      ...base.thyroid.rightLobe,
      ...sourceLobe,
      nodesList: sourceLobe.nodesList?.length
        ? sourceLobe.nodesList.map((node) => normalizeNode(node))
        : [],
    };
  };

  const thyroidSource =
    source.thyroid && typeof source.thyroid === "object"
      ? (source.thyroid as Partial<ThyroidStudyDraft["thyroid"]>)
      : {};

  return {
    ...base,
    ...source,
    thyroid: {
      ...base.thyroid,
      ...thyroidSource,
      rightLobe: normalizeLobe(thyroidSource.rightLobe),
      leftLobe: normalizeLobe(thyroidSource.leftLobe),
    },
  };
}

function normalizeBreastStudyDraft(value: unknown): BreastStudyDraft {
  const base = createEmptyBreastStudyDraft();
  const source = value && typeof value === "object" ? (value as Partial<BreastStudyDraft>) : {};

  const normalizeNode = (node: unknown): BreastNodeDraft => {
    const sourceNode =
      node && typeof node === "object" ? (node as Partial<BreastNodeDraft>) : {};

    return {
      ...createEmptyBreastNodeDraft(),
      ...sourceNode,
      number: typeof sourceNode.number === "number" ? sourceNode.number : 1,
      size1: sourceNode.size1 ?? "",
      size2: sourceNode.size2 ?? "",
      depth: sourceNode.depth ?? "",
      direction: sourceNode.direction ?? "",
      echogenicity: sourceNode.echogenicity ?? "средняя",
      echostructure: sourceNode.echostructure ?? "однородная",
      contour: sourceNode.contour ?? "четкий ровный",
      orientation: sourceNode.orientation ?? "горизонтальная",
      bloodFlow: sourceNode.bloodFlow ?? "не изменен",
      comment: sourceNode.comment ?? "",
    };
  };

  const normalizeSide = (side: unknown): BreastSideDraft => {
    const sourceSide =
      side && typeof side === "object" ? (side as Partial<BreastSideDraft>) : {};

    return {
      ...createEmptyBreastSideDraft(),
      ...sourceSide,
      nodesList: Array.isArray(sourceSide.nodesList)
        ? sourceSide.nodesList.map((node) => normalizeNode(node))
        : [],
    };
  };

  const breastSource =
    source.breast && typeof source.breast === "object"
      ? (source.breast as Partial<BreastProtocolDraft>)
      : {};

  return {
    ...base,
    ...source,
    breast: {
      ...base.breast,
      ...breastSource,
      rightBreast: normalizeSide(breastSource.rightBreast),
      leftBreast: normalizeSide(breastSource.leftBreast),
    },
    conclusion: typeof source.conclusion === "string" ? source.conclusion : base.conclusion,
    recommendations:
      typeof source.recommendations === "string" ? source.recommendations : base.recommendations,
  };
}

function normalizeSingleTestisDraft(value: unknown): SingleTestisDraft {
  const base = createEmptySingleTestisDraft();
  const source = value && typeof value === "object" ? (value as Partial<SingleTestisDraft>) : {};

  return {
    ...base,
    ...source,
  };
}

function normalizeScrotumDraft(value: unknown): ScrotumDraft {
  const base = createEmptyScrotumDraft();
  const source = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  const testisSource =
    source.testis && typeof source.testis === "object"
      ? (source.testis as Partial<{ rightTestis: unknown; leftTestis: unknown }>)
      : (source as Partial<{ rightTestis: unknown; leftTestis: unknown }>);

  return {
    ...base,
    conclusion: typeof source.conclusion === "string" ? source.conclusion : base.conclusion,
    recommendations:
      typeof source.recommendations === "string" ? source.recommendations : base.recommendations,
    testis: {
      rightTestis: normalizeSingleTestisDraft(testisSource.rightTestis ?? {}),
      leftTestis: normalizeSingleTestisDraft(testisSource.leftTestis ?? {}),
    },
  };
}

function buildStudiesData(
  snapshot: MobileSyncSnapshot,
): Record<string, MobileStudyData> {
  const result: Record<string, MobileStudyData> = {};

  Object.entries(snapshot.studiesData).forEach(([studyType, value]) => {
    if (value && typeof value === "object") {
      if (studyType === "ОБП") {
        result[studyType] = normalizeObpDraft(value);
        return;
      }

      if (studyType === "Почки") {
        result[studyType] = normalizeKidneyDraft(value);
        return;
      };

      if (studyType === "ОМТ (Ж)") {
        result[studyType] = normalizeOmtFemaleDraft(value);
        return;
      }

      if (studyType === "Органы мошонки") {
        result[studyType] = normalizeScrotumDraft(value);
        return;
      }

      if (studyType === "ОМТ (М)") {
        result[studyType] = normalizeOmtMaleDraft(value);
        return;
      }

      if (studyType === "Щитовидная железа") {
        result[studyType] = normalizeThyroidDraft(value);
        return;
      }

      if (studyType === "Молочные железы") {
        result[studyType] = normalizeBreastStudyDraft(value);
        return;
      }

      if (studyType === "Лимфоузлы" || studyType === "Лимфатические узлы") {
        result[studyType] = normalizeLymphNodesStudyDraft(value);
        return;
      }
      const draft = value as Partial<StudyDraft>;
      result[studyType] = {
        general: draft.general ?? "",
        sections: draft.sections ?? {},
      };
      return;
    }

    if (studyType === "ОБП") {
      result[studyType] = createEmptyObpDraft();
      return;
    }

    if (studyType === "Почки") {
      result[studyType] = createEmptyKidneyStudyDraft();
      return;
    }

    if (studyType === "ОМТ (Ж)") {
      result[studyType] = createEmptyOmtFemaleDraft();
      return;
    }

    if (studyType === "Органы мошонки") {
      result[studyType] = createEmptyScrotumDraft();
      return;
    }

    if (studyType === "ОМТ (М)") {
      result[studyType] = createEmptyOmtMaleDraft();
      return;
    }

    if (studyType === "Щитовидная железа") {
      result[studyType] = createEmptyThyroidStudyDraft();
      return;
    }

    if (studyType === "Молочные железы") {
      result[studyType] = createEmptyBreastStudyDraft();
      return;
    }

    if (studyType === "Лимфоузлы" || studyType === "Лимфатические узлы") {
      result[studyType] = createEmptyLymphNodesStudyDraft();
      return;
    }
  });


  return result;
}

function getDraftReviewIssues(snapshot: MobileSyncSnapshot): string[] {
  const issues: string[] = [];

  if (!snapshot.header.patientFullName.trim()) {
    issues.push("Patient full name");
  }

  if (!snapshot.header.patientDateOfBirth.trim()) {
    issues.push("Date of birth");
  }

  if (!snapshot.header.researchDate.trim()) {
    issues.push("Study date");
  }

  if (snapshot.selection.selectedStudies.length === 0) {
    issues.push("Select at least one protocol");
  }

  return issues;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<TabKey>("connect");
  const [hostUrlInput, setHostUrlInput] = useState(initialHostUrl);
  const [pairingCode, setPairingCode] = useState("");
  const [connectionState, setConnectionState] = useState<
    "idle" | "checking" | "connecting" | "connected" | "error"
  >("idle");
  const [connectionError, setConnectionError] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [socketStatus, setSocketStatus] = useState<"closed" | "open">("closed");
  const [snapshot, setSnapshot] = useState<MobileSyncSnapshot>(
    createInitialMobileSnapshot(),
  );
  const [focusedProtocolId, setFocusedProtocolId] = useState<ProtocolId | null>(null);
  const [scannerVisible, setScannerVisible] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "requested" | "saved">("idle");
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();

  const socketRef = useRef<WebSocket | null>(null);
  const qrScanHandledRef = useRef(false);

  const hostUrl = normalizeHostUrl(hostUrlInput);
  const connected = connectionState === "connected" && socketStatus === "open";
  const markDraftDirty = () => {
    setSaveState((current) => (current === "saved" ? "idle" : current));
  };

  const selectedProtocolManifests = useMemo(() => {
    return snapshot.selection.selectedStudies
      .map((label) => getProtocolManifestByLabel(label))
      .filter((manifest): manifest is ProtocolManifest => Boolean(manifest));
  }, [snapshot.selection.selectedStudies]);

  const activeProtocolManifest = useMemo(() => {
    if (focusedProtocolId) {
      const focused = getProtocolManifestById(focusedProtocolId);
      if (focused) {
        return focused;
      }
    }

    return selectedProtocolManifests[0] ?? null;
  }, [focusedProtocolId, selectedProtocolManifests]);

  useEffect(() => {
    if (snapshot.selection.selectedStudies.length === 0) {
      if (focusedProtocolId !== null) {
        setFocusedProtocolId(null);
      }
      return;
    }

    if (!focusedProtocolId) {
      return;
    }

    const focused = getProtocolManifestById(focusedProtocolId);
    if (
      !focused ||
      !snapshot.selection.selectedStudies.includes(focused.selectionLabel)
    ) {
      const nextSelected = snapshot.selection.selectedStudies[0];
      const nextManifest = nextSelected
        ? getProtocolManifestByLabel(nextSelected)
        : null;
      setFocusedProtocolId(nextManifest?.id ?? null);
    }
  }, [focusedProtocolId, snapshot.selection.selectedStudies]);

  const reviewIssues = useMemo(() => getDraftReviewIssues(snapshot), [snapshot]);
  const canSaveDraft = connected && snapshot.session.isDraftActive && reviewIssues.length === 0;

  const studiesData = useMemo(
    () => buildStudiesData(snapshot),
    [snapshot.studiesData],
  );

  const createEmptyStudyValueForLabel = (label: string): MobileStudyData => {
    if (label === "ОБП") {
      return createEmptyObpDraft();
    }

    if (label === "ОБП??") {
      return createEmptyKidneyStudyDraft();
    }

    if (label === "ОБП (?)") {
      return createEmptyOmtFemaleDraft();
    }

    if (label === "ОБП (?)") {
      return createEmptyOmtMaleDraft();
    }

    if (label === "ОБПОБП?? ОБПОБП") {
      return createEmptyBreastStudyDraft();
    }

    if (label === "ОБПОБПОБП") {
      return createEmptyLymphNodesStudyDraft();
    }

    return createEmptyStudyDraft();
  };




  useEffect(() => {
    let cancelled = false;

    const hydrateConnection = async () => {
      try {
        const [storedHostUrl, storedPairingCode] = await Promise.all([
          AsyncStorage.getItem(lastHostStorageKey),
          AsyncStorage.getItem(lastCodeStorageKey),
        ]);

        if (cancelled) {
          return;
        }

        if (storedHostUrl) {
          setHostUrlInput(storedHostUrl);
        }

        if (storedPairingCode) {
          setPairingCode(storedPairingCode);
        }

        if (storedHostUrl && storedPairingCode) {
          await connectToHost({
            hostUrl: storedHostUrl,
            pairingCode: storedPairingCode,
          });
        }
      } catch {
        // Best-effort hydration only.
      }
    };

    void hydrateConnection();

    return () => {
      cancelled = true;
    };
  }, []);

  const emitWireMessage = (message: MobileSyncWireMessage) => {
    const socket = socketRef.current;

    if (!socket || socket.readyState !== WebSocket.OPEN) {
      return;
    }

    socket.send(JSON.stringify(message));
  };

  const requestDraftSession = (studyLabel?: string) => {
    const socket = socketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      setConnectionError("Connect to the desktop host first.");
      return;
    }

    emitWireMessage({
      type: "sync:command",
      command: "draft:create",
      studyLabel: studyLabel?.trim() || undefined,
      origin: "mobile",
      updatedAt: createSyncTimestamp(),
    });

    setSaveState("idle");
  };

  const closeDraftSession = () => {
    const socket = socketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      setConnectionError("Connect to the desktop host first.");
      return;
    }

    emitWireMessage({
      type: "sync:command",
      command: "draft:close",
      origin: "mobile",
      updatedAt: createSyncTimestamp(),
    });

    setSaveState("idle");
  };

  const applyLocalSnapshot = (updater: SetStateAction<MobileSyncSnapshot>) => {
    setSnapshot(updater);
  };

  const sendSelectionPatch = (
    patch: Partial<MobileSyncSnapshot["selection"]>,
  ) => {
    setSnapshot((current) => ({
      ...current,
      selection: {
        ...current.selection,
        ...patch,
      },
    }));
    markDraftDirty();

    emitWireMessage({
      type: "sync:update",
      fragment: "selection",
      data: patch,
      origin: "mobile",
      updatedAt: createSyncTimestamp(),
    });
  };

  const sendHeaderPatch = (
    patch: Partial<MobileSyncSnapshot["header"]>,
  ) => {
    setSnapshot((current) => ({
      ...current,
      header: {
        ...current.header,
        ...patch,
      },
    }));
    markDraftDirty();

    emitWireMessage({
      type: "sync:update",
      fragment: "header",
      data: patch,
      origin: "mobile",
      updatedAt: createSyncTimestamp(),
    });
  };

  const sendStudiesPatch = (
    message:
      | {
          mode: "replace";
          studiesData: Record<string, unknown>;
        }
      | {
          mode: "set";
          studyType: string;
          value: unknown;
        }
      | {
          mode: "remove";
          studyType: string;
        },
  ) => {
    setSnapshot((current) => {
      if (message.mode === "replace") {
        return {
          ...current,
          studiesData: { ...message.studiesData },
        };
      }

      if (message.mode === "set") {
        return {
          ...current,
          studiesData: {
            ...current.studiesData,
            [message.studyType]: message.value,
          },
        };
      }

      const nextStudiesData = { ...current.studiesData };
      delete nextStudiesData[message.studyType];
      return {
        ...current,
        studiesData: nextStudiesData,
      };
    });
    markDraftDirty();

    emitWireMessage({
      type: "sync:update",
      fragment: "studiesData",
      data: message,
      origin: "mobile",
      updatedAt: createSyncTimestamp(),
    });
  };

  const connectToHost = async (override?: {
    hostUrl?: string;
    pairingCode?: string;
  }) => {
    const resolvedHostUrl = normalizeHostUrl(override?.hostUrl ?? hostUrlInput);
    const resolvedPairingCode = (override?.pairingCode ?? pairingCode).trim();

    if (!resolvedHostUrl || !resolvedPairingCode) {
      setConnectionError("Unable to parse the host URL.");
      return;
    }

    setConnectionState("checking");
    setConnectionError("");

    try {
      const healthResponse = await fetch(`${resolvedHostUrl}/health`);
      const healthJson = (await healthResponse.json()) as {
        success?: boolean;
        status?: { sessionId?: string | null };
        message?: string;
      };

      if (!healthJson.success) {
        throw new Error(healthJson.message || "Host health check failed.");
      }

      const pairResponse = await fetch(`${resolvedHostUrl}/pair`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: resolvedPairingCode }),
      });

      const pairJson = (await pairResponse.json()) as {
        success?: boolean;
        sessionId?: string;
        message?: string;
      };

      if (!pairJson.success) {
        throw new Error(pairJson.message || "Pairing failed.");
      }

      setConnectionState("connecting");

      const wsUrl = `${toWsUrl(resolvedHostUrl)}/ws?code=${encodeURIComponent(
        resolvedPairingCode,
      )}`;
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;

      setHostUrlInput(resolvedHostUrl);
      setPairingCode(resolvedPairingCode);

      socket.onopen = () => {
        setSocketStatus("open");
        setConnectionState("connected");
        setSessionId(pairJson.sessionId ?? healthJson.status?.sessionId ?? null);
        setActiveTab("library");

        void Promise.all([
          AsyncStorage.setItem(lastHostStorageKey, resolvedHostUrl),
          AsyncStorage.setItem(lastCodeStorageKey, resolvedPairingCode),
        ]);

        setSaveState("idle");

        socket.send(
          JSON.stringify({
            type: "sync:requestState",
            origin: "mobile",
            updatedAt: createSyncTimestamp(),
          }),
        );
      };

      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(String(event.data)) as MobileSyncWireMessage;
          applyLocalSnapshot((current) => applySyncMessage(current, message));

          if (message.type === "sync:snapshot") {
            setSessionId(message.state.session.sessionId);
            if (message.state.session.activeStudyLabel) {
              const nextManifest = getProtocolManifestByLabel(
                message.state.session.activeStudyLabel,
              );
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
        } catch {
          // Ignore malformed payloads for now.
        }
      };

      socket.onerror = () => {
        setConnectionState("error");
        setConnectionError("Failed to connect to the desktop host.");
      };

      socket.onclose = () => {
        setSocketStatus("closed");
        setConnectionState((current) =>
          current === "connected" ? "idle" : current,
        );
      };
    } catch (error) {
      setConnectionState("error");
      setSocketStatus("closed");
      setConnectionError(
        error instanceof Error ? error.message : "Failed to connect to the desktop host."
      );
    }
  };

  const disconnect = () => {
    socketRef.current?.close();
    socketRef.current = null;
    setSocketStatus("closed");
    setConnectionState("idle");
    setSessionId(null);
    setSaveState("idle");
  };

  const openScanner = async () => {
    setConnectionError("");
    setActiveTab("connect");
    qrScanHandledRef.current = false;

    if (!cameraPermission?.granted) {
      const permission = await requestCameraPermission();
      if (!permission.granted) {
        setConnectionError("Allow camera access to scan the QR code.");
        return;
      }
    }

    setScannerVisible(true);
  };

  const closeScanner = () => {
    setScannerVisible(false);
    qrScanHandledRef.current = false;
  };

  const handleQrScanned = async (payload: string) => {
    if (qrScanHandledRef.current) {
      return;
    }

    const parsed = parseMobileSyncPayload(payload);

    if (!parsed) {
      setConnectionError("This QR code does not look like Ultrasound Mobile.");
      return;
    }

    qrScanHandledRef.current = true;
    setScannerVisible(false);
    setHostUrlInput(parsed.host);
    setPairingCode(parsed.code);
    await connectToHost({
      hostUrl: parsed.host,
      pairingCode: parsed.code,
    });
  };

  const toggleProtocol = (manifest: ProtocolManifest) => {
    const label = manifest.selectionLabel;
    const isSelected = snapshot.selection.selectedStudies.includes(label);
    const nextSelectedStudies = isSelected
      ? snapshot.selection.selectedStudies.filter((study) => study !== label)
      : [...snapshot.selection.selectedStudies, label];
    const nextFocusLabel = isSelected
      ? nextSelectedStudies[0] ?? ""
      : label;

    setSaveState("idle");

    if (!snapshot.session.isDraftActive) {
      requestDraftSession(label);
    }

    sendSelectionPatch({
      selectedStudy: nextSelectedStudies[nextSelectedStudies.length - 1] ?? "",
      selectedStudies: nextSelectedStudies,
      isMultiSelectMode: nextSelectedStudies.length > 1,
    });

    if (isSelected) {
      sendStudiesPatch({
        mode: "remove",
        studyType: label,
      });
    } else if (!studiesData[label]) {
      sendStudiesPatch({
        mode: "set",
        studyType: label,
        value: createEmptyStudyValueForLabel(label),
      });
    }

    if (nextSelectedStudies.length === 0) {
      setFocusedProtocolId(null);
      return;
    }

    const nextFocusedManifest = getProtocolManifestByLabel(nextFocusLabel);
    setFocusedProtocolId(nextFocusedManifest?.id ?? null);
  };

  const updateSectionNote = (
    protocolLabel: string,
    sectionDesktopKey: string,
    value: string,
  ) => {
    const currentDraft =
      (studiesData[protocolLabel] as StudyDraft | undefined) ?? createEmptyStudyDraft();
    const nextDraft: StudyDraft = {
      general: currentDraft.general,
      sections: {
        ...currentDraft.sections,
        [sectionDesktopKey]: value,
      },
    };

    sendStudiesPatch({
      mode: "set",
      studyType: protocolLabel,
      value: nextDraft,
    });
  };

  const updateGeneralNote = (protocolLabel: string, value: string) => {
    const currentDraft =
      (studiesData[protocolLabel] as StudyDraft | undefined) ?? createEmptyStudyDraft();
    const nextDraft: StudyDraft = {
      general: value,
      sections: {
        ...currentDraft.sections,
      },
    };

    sendStudiesPatch({
      mode: "set",
      studyType: protocolLabel,
      value: nextDraft,
    });
  };

  const updateHeaderField = (
    key: keyof MobileSyncSnapshot["header"],
    value: string,
  ) => {
    sendHeaderPatch({ [key]: value } as Partial<MobileSyncSnapshot["header"]>);
  };

  const resetDraft = () => {
    const nextSnapshot = createInitialMobileSnapshot();
    applyLocalSnapshot(nextSnapshot);
    setSessionId(null);
    closeDraftSession();
    setFocusedProtocolId(null);
    setActiveTab("connect");
    setSaveState("idle");
  };

  const requestDesktopSave = () => {
    if (!connected) {
      setConnectionError("Connect to the desktop host first.");
      return;
    }

    if (!canSaveDraft) {
      setConnectionError("Fill in the required fields before saving.");
      return;
    }

    setConnectionError("");
    setSaveState("requested");
    emitWireMessage({
      type: "sync:command",
      command: "draft:save",
      origin: "mobile",
      updatedAt: createSyncTimestamp(),
    });
  };

  const requestDesktopPrint = () => {
    if (!connected) {
      setConnectionError("Connect to the desktop host first.");
      return;
    }

    if (saveState !== "saved") {
      setConnectionError("Save the draft on the desktop first.");
      return;
    }

    setConnectionError("");
    emitWireMessage({
      type: "sync:command",
      command: "draft:print",
      origin: "mobile",
      updatedAt: createSyncTimestamp(),
    });
  };

  const requestDesktopClear = () => {
    if (!connected) {
      setConnectionError("Connect to the desktop host first.");
      return;
    }

    setConnectionError("");
    setSaveState("idle");
    emitWireMessage({
      type: "sync:command",
      command: "draft:clear",
      origin: "mobile",
      updatedAt: createSyncTimestamp(),
    });
  };

  const updateObpLiverField = (
    field: keyof LiverDraft,
    value: string,
  ) => {
    const currentObp = normalizeObpDraft(studiesData["ОБП"]);
    const nextLiver: LiverDraft = {
      ...currentObp.liver,
      [field]: value,
    };

    if (field === "rightLobeAP" || field === "rightLobeCCR") {
      const ap =
        parseFloat(field === "rightLobeAP" ? value : currentObp.liver.rightLobeAP) || 0;
      const ccr =
        parseFloat(field === "rightLobeCCR" ? value : currentObp.liver.rightLobeCCR) || 0;
      nextLiver.rightLobeTotal = ap > 0 && ccr > 0 ? (ccr + ap).toString() : "";
    }

    if (field === "leftLobeAP" || field === "leftLobeCCR") {
      const ap =
        parseFloat(field === "leftLobeAP" ? value : currentObp.liver.leftLobeAP) || 0;
      const ccr =
        parseFloat(field === "leftLobeCCR" ? value : currentObp.liver.leftLobeCCR) || 0;
      nextLiver.leftLobeTotal = ap > 0 && ccr > 0 ? (ccr + ap).toString() : "";
    }

    const nextObp: ObpDraft = {
      ...currentObp,
      liver: nextLiver,
    };

    sendStudiesPatch({
      mode: "set",
      studyType: "ОБП",
      value: nextObp,
    });
  };

  const updateObpGallbladderField = (
    field: keyof GallbladderDraft,
    value: string,
  ) => {
    const currentObp = normalizeObpDraft(studiesData["ОБП"]);
    const nextGallbladder: GallbladderDraft = {
      ...currentObp.gallbladder,
      [field]: value,
    };

    const nextObp: ObpDraft = {
      ...currentObp,
      gallbladder: nextGallbladder,
    };

    sendStudiesPatch({
      mode: "set",
      studyType: "ОБП",
      value: nextObp,
    });
  };

  const updateObpPancreasField = (field: keyof PancreasDraft, value: string) => {
    const currentObp = normalizeObpDraft(studiesData["ОБП"]);
    const nextObp: ObpDraft = {
      ...currentObp,
      pancreas: {
        ...currentObp.pancreas,
        [field]: value,
      },
    };

    sendStudiesPatch({
      mode: "set",
      studyType: "ОБП",
      value: nextObp,
    });
  };

  const updateObpSpleenField = (field: keyof SpleenDraft, value: string) => {
    const currentObp = normalizeObpDraft(studiesData["ОБП"]);
    const nextObp: ObpDraft = {
      ...currentObp,
      spleen: {
        ...currentObp.spleen,
        [field]: value,
      },
    };

    sendStudiesPatch({
      mode: "set",
      studyType: "ОБП",
      value: nextObp,
    });
  };

  const updateObpFreeFluidField = (field: "freeFluid" | "freeFluidDetails", value: string) => {
    const currentObp = normalizeObpDraft(studiesData["ОБП"]);
    const nextObp: ObpDraft = {
      ...currentObp,
      [field]: value,
    };

    sendStudiesPatch({
      mode: "set",
      studyType: "ОБП",
      value: nextObp,
    });
  };

  const updateObpConclusionField = (value: string) => {
    const currentObp = normalizeObpDraft(studiesData["ОБП"]);
    const nextObp: ObpDraft = {
      ...currentObp,
      conclusion: value,
    };

    sendStudiesPatch({
      mode: "set",
      studyType: "ОБП",
      value: nextObp,
    });
  };

  const updateObpRecommendationsField = (value: string) => {
    const currentObp = normalizeObpDraft(studiesData["ОБП"]);
    const nextObp: ObpDraft = {
      ...currentObp,
      recommendations: value,
    };

    sendStudiesPatch({
      mode: "set",
      studyType: "ОБП",
      value: nextObp,
    });
  };

  const updateKidneyStudy = (value: KidneyStudyDraft) => {
    sendStudiesPatch({
      mode: "set",
      studyType: "Почки",
      value: normalizeKidneyDraft(value),
    });
  };

  const updateOmtFemaleStudy = (value: OmtFemaleDraft) => {
    sendStudiesPatch({
      mode: "set",
      studyType: "ОМТ (Ж)",
      value: normalizeOmtFemaleDraft(value),
    });
  };

  const updateScrotumStudy = (value: ScrotumDraft) => {
    sendStudiesPatch({
      mode: "set",
      studyType: "Органы мошонки",
      value: normalizeScrotumDraft(value),
    });
  };

  const updateOmtMaleStudy = (value: OmtMaleDraft) => {
    sendStudiesPatch({
      mode: "set",
      studyType: "ОМТ (М)",
      value: normalizeOmtMaleDraft(value),
    });
  };

  const updateThyroidStudy = (value: ThyroidStudyDraft) => {
    sendStudiesPatch({
      mode: "set",
      studyType: "Щитовидная железа",
      value: normalizeThyroidDraft(value),
    });
  };

  const updateBreastStudy = (value: BreastStudyDraft) => {
    sendStudiesPatch({
      mode: "set",
      studyType: "Молочные железы",
      value: normalizeBreastStudyDraft(value),
    });
  };

  const updateLymphNodesStudy = (value: LymphNodesStudyDraft) => {
    sendStudiesPatch({
      mode: "set",
      studyType: "Лимфоузлы",
      value: normalizeLymphNodesStudyDraft(value),
    });
  };

  const updateObpGallbladderConcretionsList = (
    nextList: GallbladderConcretionDraft[],
  ) => {
    const currentObp = normalizeObpDraft(studiesData["ОБП"]);
    const nextObp: ObpDraft = {
      ...currentObp,
      gallbladder: {
        ...currentObp.gallbladder,
        concretionsList: nextList,
      },
    };

    sendStudiesPatch({
      mode: "set",
      studyType: "ОБП",
      value: nextObp,
    });
  };

  const updateObpGallbladderPolypsList = (
    nextList: GallbladderPolypDraft[],
  ) => {
    const currentObp = normalizeObpDraft(studiesData["ОБП"]);
    const nextObp: ObpDraft = {
      ...currentObp,
      gallbladder: {
        ...currentObp.gallbladder,
        polypsList: nextList,
      },
    };

    sendStudiesPatch({
      mode: "set",
      studyType: "ОБП",
      value: nextObp,
    });
  };

  const addObpGallbladderConcretion = () => {
    const currentObp = normalizeObpDraft(studiesData["ОБП"]);
    updateObpGallbladderConcretionsList([
      ...currentObp.gallbladder.concretionsList,
      createEmptyGallbladderConcretionDraft(),
    ]);
  };

  const addObpGallbladderPolyp = () => {
    const currentObp = normalizeObpDraft(studiesData["ОБП"]);
    updateObpGallbladderPolypsList([
      ...currentObp.gallbladder.polypsList,
      createEmptyGallbladderPolypDraft(),
    ]);
  };


  useEffect(() => {
    return () => {
      socketRef.current?.close();
    };
  }, []);

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
            onUpdateObpGallbladderConcretionsList={
              updateObpGallbladderConcretionsList
            }
            onUpdateObpGallbladderPolypsList={updateObpGallbladderPolypsList}
            onAddObpGallbladderConcretion={addObpGallbladderConcretion}
            onAddObpGallbladderPolyp={addObpGallbladderPolyp}
            onUpdateObpPancreasField={updateObpPancreasField}
            onUpdateObpSpleenField={updateObpSpleenField}
            onUpdateObpFreeFluidField={updateObpFreeFluidField}
            onUpdateObpConclusionField={updateObpConclusionField}
            onUpdateObpRecommendationsField={updateObpRecommendationsField}
            onUpdateKidneyStudy={updateKidneyStudy}
            onUpdateScrotumStudy={updateScrotumStudy}
            onUpdateOmtFemaleStudy={updateOmtFemaleStudy}
            onUpdateOmtMaleStudy={updateOmtMaleStudy}
            onUpdateThyroidStudy={updateThyroidStudy}
            onUpdateBreastStudy={updateBreastStudy}
            onUpdateLymphNodesStudy={updateLymphNodesStudy}
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

