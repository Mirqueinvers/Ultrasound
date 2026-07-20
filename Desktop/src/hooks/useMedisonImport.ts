import { useEffect, useRef } from "react";
import { parseMedisonXml } from "@/sync/medisonXmlParser";
import type { MedisonParsedData } from "@/sync/medisonTypes";
import type { MedisonMappingRow } from "../../electron/preload";

// ========================
// СТАРЫЕ ФУНКЦИИ МАППИНГА (сохранены для ResearchHeader.tsx)
// ========================

function makeLiverData(medisonLiver: NonNullable<NonNullable<MedisonParsedData["obp"]>["liver"]>, portalVeinDiameter?: string) {
  return {
    rightLobeAP: medisonLiver.length.value.toString(),
    leftLobeAP: medisonLiver.width.value.toString(),
    ...(portalVeinDiameter ? { portalVeinDiameter } : {}),
  };
}

function makeGallbladderData(medisonGb: NonNullable<NonNullable<MedisonParsedData["obp"]>["gallbladder"]>) {
  return {
    length: medisonGb.length.value.toString(),
    width: medisonGb.width.value.toString(),
    wallThickness: medisonGb.wallThickness.value.toString(),
    commonBileDuct: medisonGb.commonBileDuct.value.toString(),
  };
}

function makePancreasData(medisonPanc: NonNullable<NonNullable<MedisonParsedData["obp"]>["pancreas"]>) {
  return {
    head: medisonPanc.head.value.toString(),
    body: medisonPanc.body.value.toString(),
    tail: medisonPanc.tail.value.toString(),
  };
}

function makeSpleenData(medisonSpleen: NonNullable<NonNullable<MedisonParsedData["obp"]>["spleen"]>) {
  return {
    length: medisonSpleen.length.value.toString(),
    width: medisonSpleen.width.value.toString(),
  };
}

function makeKidneySideData(medisonKidney: NonNullable<NonNullable<MedisonParsedData["kidneys"]>["left"]>) {
  return {
    length: medisonKidney.length.value.toString(),
    width: medisonKidney.width.value.toString(),
    parenchymaSize: medisonKidney.parenchymaSize.value.toString(),
  };
}

export function makeObpStudyData(data: NonNullable<MedisonParsedData["obp"]>) {
  const result: Record<string, unknown> = {};

  if (data.liver) {
    result.liver = makeLiverData(data.liver, data.portalVein?.diameter.value.toString());
  }
  if (data.gallbladder) {
    result.gallbladder = makeGallbladderData(data.gallbladder);
  }
  if (data.pancreas) {
    result.pancreas = makePancreasData(data.pancreas);
  }
  if (data.spleen) {
    result.spleen = makeSpleenData(data.spleen);
  }

  return result;
}

export function makeKidneyStudyData(data: NonNullable<MedisonParsedData["kidneys"]>) {
  const result: Record<string, unknown> = {};

  if (data.left) {
    result.leftKidney = makeKidneySideData(data.left);
  }
  if (data.right) {
    result.rightKidney = makeKidneySideData(data.right);
  }

  return result;
}

function makeUterusData(medisonUterus: NonNullable<NonNullable<MedisonParsedData["gyn"]>["uterus"]>) {
  return {
    length: medisonUterus.length.value.toString(),
    width: medisonUterus.width.value.toString(),
    apDimension: medisonUterus.height.value.toString(),
    volume: medisonUterus.volume.value.toString(),
    endometriumSize: medisonUterus.endometriumThickness.value.toString(),
    cervixSize: medisonUterus.cervixWidth.value.toString(),
  };
}

function makeOvaryData(medisonOvary: NonNullable<NonNullable<MedisonParsedData["gyn"]>["rightOvary"]>) {
  return {
    length: medisonOvary.length.value.toString(),
    width: medisonOvary.width.value.toString(),
  };
}

export function makeOmtFemaleStudyData(data: NonNullable<MedisonParsedData["gyn"]>) {
  const result: Record<string, unknown> = {};

  if (data.uterus) {
    result.uterus = makeUterusData(data.uterus);
  }
  if (data.rightOvary) {
    result.rightOvary = makeOvaryData(data.rightOvary);
  }
  if (data.leftOvary) {
    result.leftOvary = makeOvaryData(data.leftOvary);
  }

  return result;
}

function makeBladderData(medisonBladder: NonNullable<NonNullable<MedisonParsedData["uro"]>["bladder"]>) {
  return {
    length: medisonBladder.length.value.toString(),
    width: medisonBladder.width.value.toString(),
    depth: medisonBladder.height.value.toString(),
    volume: medisonBladder.volume.value.toString(),
    residualLength: medisonBladder.residualLength.value.toString(),
    residualWidth: medisonBladder.residualWidth.value.toString(),
    residualDepth: medisonBladder.residualHeight.value.toString(),
    residualVolume: medisonBladder.residualVolume.value.toString(),
  };
}

export function makeBladderStudyData(data: NonNullable<MedisonParsedData["uro"]>) {
  const result: Record<string, unknown> = {};

  if (data.bladder) {
    result.urinaryBladder = makeBladderData(data.bladder);
  }

  return result;
}

export function makeUrinaryBladderPartial(data: NonNullable<MedisonParsedData["uro"]>): Record<string, unknown> | undefined {
  if (data.bladder) {
    return { urinaryBladder: makeBladderData(data.bladder) };
  }
  return undefined;
}

function makeThyroidLobeData(
  medisonLobe: NonNullable<NonNullable<MedisonParsedData["thyroid"]>["rightLobe"]>,
  masses: { length: number; width: number }[]
) {
  const result: Record<string, unknown> = {
    length: medisonLobe.length.value.toString(),
    width: medisonLobe.width.value.toString(),
    depth: medisonLobe.height.value.toString(),
    volume: medisonLobe.volume.value.toString(),
  };
  if (masses.length > 0) {
    result.volumeFormations = "определяются";
    result.nodesList = masses.map((m, i) => ({
      number: i + 1,
      size1: m.length.toString(),
      size2: m.width.toString(),
    }));
  }
  return result;
}

export function makeThyroidStudyData(data: NonNullable<MedisonParsedData["thyroid"]>) {
  const result: Record<string, unknown> = {};

  const rightMassesFixed = data.rightMasses?.map((m) => ({ length: m.length.value, width: m.width.value })) ?? [];
  const leftMassesFixed = data.leftMasses?.map((m) => ({ length: m.length.value, width: m.width.value })) ?? [];

  const rightLobe = data.rightLobe ? makeThyroidLobeData(data.rightLobe, rightMassesFixed) : null;
  const leftLobe = data.leftLobe ? makeThyroidLobeData(data.leftLobe, leftMassesFixed) : null;

  const rightVol = rightLobe ? parseFloat(rightLobe.volume as string) || 0 : 0;
  const leftVol = leftLobe ? parseFloat(leftLobe.volume as string) || 0 : 0;

  const partialThyroid: Record<string, unknown> = {};

  if (data.rightLobe || data.leftLobe) {
    if (rightLobe) partialThyroid.rightLobe = rightLobe;
    if (leftLobe) partialThyroid.leftLobe = leftLobe;
    if (data.isthmus?.value) partialThyroid.isthmusSize = data.isthmus.value.toString();
    partialThyroid.totalVolume = (rightVol + leftVol).toFixed(2);
  }

  result.thyroid = partialThyroid;
  return result;
}

function makeProstateData(medisonProstate: NonNullable<NonNullable<MedisonParsedData["uro"]>["prostate"]>) {
  const tzValue = medisonProstate.tzLength?.value;
  return {
    length: medisonProstate.length.value.toString(),
    width: medisonProstate.width.value.toString(),
    apDimension: medisonProstate.height.value.toString(),
    volume: medisonProstate.volume.value.toString(),
    ...(tzValue && tzValue > 0
      ? { bladderProtrusion: "выступает", bladderProtrusionMm: tzValue.toString() }
      : {}),
  };
}

export function makeProstateStudyData(data: NonNullable<MedisonParsedData["uro"]>) {
  const result: Record<string, unknown> = {};
  if (data.prostate) {
    result.prostate = makeProstateData(data.prostate);
  }
  return result;
}

function makeBreastSideMasses(masses: NonNullable<NonNullable<MedisonParsedData["breast"]>["rightMasses"]>) {
  if (!masses || masses.length === 0) {
    return { volumeFormations: "не определяются", nodesList: [] };
  }
  return {
    volumeFormations: "определяются",
    nodesList: masses.map((m, i) => ({
      number: i + 1,
      size1: m.length.value.toString(),
      size2: m.height.value.toString(),
      size3: m.width.value.toString(),
      depth: "",
    })),
  };
}

export function makeBreastStudyData(data: NonNullable<MedisonParsedData["breast"]>) {
  const rightSide = data.rightMasses?.length > 0 ? makeBreastSideMasses(data.rightMasses) : null;
  const leftSide = data.leftMasses?.length > 0 ? makeBreastSideMasses(data.leftMasses) : null;

  return {
    breast: {
      rightBreast: rightSide ?? { volumeFormations: "не определяются", nodesList: [] },
      leftBreast: leftSide ?? { volumeFormations: "не определяются", nodesList: [] },
    },
  };
}

export function makeTestisStudyData(data: NonNullable<MedisonParsedData["testis"]>) {
  return {
    testis: {
      rightTestis: data.right
        ? {
            length: data.right.length.value.toString(),
            width: data.right.width.value.toString(),
            depth: data.right.height.value.toString(),
            volume: data.right.volume.value.toString(),
          }
        : null,
      leftTestis: data.left
        ? {
            length: data.left.length.value.toString(),
            width: data.left.width.value.toString(),
            depth: data.left.height.value.toString(),
            volume: data.left.volume.value.toString(),
          }
        : null,
    },
  };
}

// ========================
// НОВЫЙ КОНФИГУРИРУЕМЫЙ МАППИНГ
// ========================

function normalizeDateForDesktop(dateStr: string): string {
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    const [day, month, year] = parts;
    return `${year}-${month}-${day}`;
  }
  return dateStr;
}

interface UseMedisonImportOptions {
  onDataReady: (data: {
    patientFullName: string;
    patientDateOfBirth: string;
    researchDate: string;
    obpStudyData?: Record<string, unknown>;
    kidneyStudyData?: Record<string, unknown>;
    omtFemaleStudyData?: Record<string, unknown>;
    bladderStudyData?: Record<string, unknown>;
    bladderPartial?: Record<string, unknown>;
    thyroidStudyData?: Record<string, unknown>;
    prostateStudyData?: Record<string, unknown>;
    breastStudyData?: Record<string, unknown>;
    testisStudyData?: Record<string, unknown>;
  }) => void;
  onXmlContent?: string;
  userId?: number;
}

/**
 * Хук для автоматического импорта XML-отчётов Medison с флешки.
 * Использует конфигурацию маппингов из БД (таблица medison_mappings).
 */
export function useMedisonImport({ onDataReady, userId }: UseMedisonImportOptions) {
  const cleanupRef = useRef<(() => void) | null>(null);
  const mappingsRef = useRef<MedisonMappingRow[]>([]);

  // Загружаем маппинги
  useEffect(() => {
    if (!userId) return;

    window.importMappingAPI
      .getMappings(userId)
      .then((result) => {
        if (result.success && result.mappings) {
          mappingsRef.current = result.mappings;
        }
      })
      .catch(console.error);
  }, [userId]);

  useEffect(() => {
    window.medisonAPI?.startWatching().catch(console.error);

    const unsubscribe = window.medisonAPI?.onXmlFound(({ content }) => {
      const parsed = parseMedisonXml(content);
      if (!parsed) {
        console.warn("useMedisonImport: failed to parse XML");
        return;
      }

      const researchDate = normalizeDateForDesktop(parsed.examDate);
      const patientDateOfBirth = parsed.patient.dateOfBirth;

      // Используем старые функции для маппинга
      const data: Parameters<UseMedisonImportOptions["onDataReady"]>[0] = {
        patientFullName: parsed.patient.fullName,
        patientDateOfBirth,
        researchDate,
      };

      if (parsed.obp) {
        data.obpStudyData = makeObpStudyData(parsed.obp) as unknown as Record<string, unknown>;
      }
      if (parsed.kidneys) {
        data.kidneyStudyData = makeKidneyStudyData(parsed.kidneys) as unknown as Record<string, unknown>;
      }
      if (parsed.gyn) {
        data.omtFemaleStudyData = makeOmtFemaleStudyData(parsed.gyn) as unknown as Record<string, unknown>;
      }
      if (parsed.uro) {
        data.bladderStudyData = makeBladderStudyData(parsed.uro) as unknown as Record<string, unknown>;
        data.prostateStudyData = makeProstateStudyData(parsed.uro) as unknown as Record<string, unknown>;
        data.bladderPartial = makeUrinaryBladderPartial(parsed.uro);
      }
      if (parsed.thyroid) {
        data.thyroidStudyData = makeThyroidStudyData(parsed.thyroid) as unknown as Record<string, unknown>;
      }
      if (parsed.breast) {
        data.breastStudyData = makeBreastStudyData(parsed.breast) as unknown as Record<string, unknown>;
      }
      if (parsed.testis) {
        data.testisStudyData = makeTestisStudyData(parsed.testis) as unknown as Record<string, unknown>;
      }

      onDataReady(data);
    });

    cleanupRef.current = unsubscribe || null;

    return () => {
      unsubscribe?.();
      window.medisonAPI?.stopWatching().catch(console.error);
    };
  }, [onDataReady]);
}