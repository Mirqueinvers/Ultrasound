import { useEffect, useRef } from "react";
import { parseMedisonXml } from "@/sync/medisonXmlParser";
import type { MedisonParsedData } from "@/sync/medisonTypes";

/**
 * Возвращает только те поля печени, которые реально пришли из XML.
 * БЕЗ спреда defaultLiverState — чтобы не затирать уже введённые селекты
 * (echogenicity, homogeneity, contours, focalLesionsPresence и т.д.).
 */
function makeLiverData(medisonLiver: NonNullable<NonNullable<MedisonParsedData["obp"]>["liver"]>, portalVeinDiameter?: string) {
  return {
    rightLobeAP: medisonLiver.length.value.toString(),
    leftLobeAP: medisonLiver.width.value.toString(),
    ...(portalVeinDiameter ? { portalVeinDiameter } : {}),
  };
}

function makeGallbladderData(medisonGb: NonNullable<NonNullable<MedisonParsedData["obp"]>["gallbladder"]>) {
  // БЕЗ спреда дефолтного состояния — не затираем массивы concretionsList/polypsList
  return {
    length: medisonGb.length.value.toString(),
    width: medisonGb.width.value.toString(),
    wallThickness: medisonGb.wallThickness.value.toString(),
    commonBileDuct: medisonGb.commonBileDuct.value.toString(),
  };
}

function makePancreasData(medisonPanc: NonNullable<NonNullable<MedisonParsedData["obp"]>["pancreas"]>) {
  // БЕЗ спреда defaultPancreasState — не затираем echogenicity, echostructure, contour, pathologicalFormations
  return {
    head: medisonPanc.head.value.toString(),
    body: medisonPanc.body.value.toString(),
    tail: medisonPanc.tail.value.toString(),
  };
}

function makeSpleenData(medisonSpleen: NonNullable<NonNullable<MedisonParsedData["obp"]>["spleen"]>) {
  // БЕЗ спреда defaultSpleenState — не затираем остальные поля
  return {
    length: medisonSpleen.length.value.toString(),
    width: medisonSpleen.width.value.toString(),
  };
}

function makeKidneySideData(medisonKidney: NonNullable<NonNullable<MedisonParsedData["kidneys"]>["left"]>) {
  // БЕЗ спреда дефолтного состояния — не затираем массивы concretions/cysts/pcs списки
  return {
    length: medisonKidney.length.value.toString(),
    width: medisonKidney.width.value.toString(),
    parenchymaSize: medisonKidney.parenchymaSize.value.toString(),
  };
}

/**
 * Маппинг данных Medison в ЧАСТИЧНУЮ структуру протокола ОБП.
 * Только те поля/органы, что есть в XML. Ничего не затирает.
 */
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

/**
 * Маппинг данных Medison в ЧАСТИЧНУЮ структуру протокола Почки.
 * Только те поля/органы, что есть в XML.
 */
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
  // БЕЗ спреда дефолтного состояния — не затираем myomaNodesList и другие массивы
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
  // БЕЗ спреда дефолтного состояния — не затираем cystsList и другие массивы
  return {
    length: medisonOvary.length.value.toString(),
    width: medisonOvary.width.value.toString(),
  };
}

/**
 * Маппинг данных гинекологии Medison в ЧАСТИЧНУЮ структуру протокола ОМТ (Ж).
 */
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
  // БЕЗ спреда defaultUrinaryBladderState — не затираем селекты (contents, contentsSize, wall, conclusion и т.д.)
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

/**
 * Маппинг данных урологии Medison в ЧАСТИЧНУЮ структуру протокола Мочевой пузырь.
 */
export function makeBladderStudyData(data: NonNullable<MedisonParsedData["uro"]>) {
  const result: Record<string, unknown> = {};

  if (data.bladder) {
    result.urinaryBladder = makeBladderData(data.bladder);
  }

  return result;
}

/**
 * Возвращает только часть с urinaryBladder для мержа в протоколы,
 * которые содержат мочевой пузырь как подполе (Почки, ОМТ (Ж), ОМТ (М)).
 */
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
  return {
    length: medisonLobe.length.value.toString(),
    width: medisonLobe.width.value.toString(),
    depth: medisonLobe.height.value.toString(),
    volume: medisonLobe.volume.value.toString(),
    ...(masses.length > 0
      ? {
          volumeFormations: "определяются",
          nodesList: masses.map((m, i) => ({
            number: i + 1,
            size1: m.length.toString(),
            size2: m.width.toString(),
          })),
        }
      : {}),
  };
}

function makeBreastSideMasses(masses: NonNullable<NonNullable<MedisonParsedData["breast"]>["rightMasses"]>): {
  volumeFormations: string;
  nodesList: { number: number; size1: string; size2: string; size3: string; depth: string }[];
} {
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

export function makeThyroidStudyData(data: NonNullable<MedisonParsedData["thyroid"]>) {
  const result: Record<string, unknown> = {};

  const rightMassesFixed = data.rightMasses?.map((m) => ({ length: m.length.value, width: m.width.value })) ?? [];
  const leftMassesFixed = data.leftMasses?.map((m) => ({ length: m.length.value, width: m.width.value })) ?? [];

  const rightLobe = data.rightLobe
    ? makeThyroidLobeData(data.rightLobe, rightMassesFixed)
    : null;
  const leftLobe = data.leftLobe
    ? makeThyroidLobeData(data.leftLobe, leftMassesFixed)
    : null;

  const rightVol = rightLobe ? parseFloat(rightLobe.volume as string) || 0 : 0;
  const leftVol = leftLobe ? parseFloat(leftLobe.volume as string) || 0 : 0;

  // Возвращаем только поля из XML, БЕЗ дефолтных пустых значений
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
  onXmlContent?: string; // внешне не используется, добавляем в сигнатуру
}

/**
 * Хук для автоматического импорта XML-отчётов Medison с флешки.
 * При обнаружении нового XML-файла парсит его и вызывает onDataReady
 * для заполнения данных в протоколе.
 */
export function useMedisonImport({ onDataReady }: UseMedisonImportOptions) {
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    // Запускаем мониторинг флешки
    window.medisonAPI?.startWatching().catch(console.error);

    // Подписываемся на новые XML-файлы
    const unsubscribe = window.medisonAPI?.onXmlFound(({ content }) => {
      const parsed = parseMedisonXml(content);
      if (!parsed) {
        console.warn("useMedisonImport: failed to parse XML");
        return;
      }

      // Заполняем данные
      const researchDate = normalizeDateForDesktop(parsed.examDate);
      const patientDateOfBirth = parsed.patient.dateOfBirth;

      let obpStudyData: Record<string, unknown> | undefined;
      let kidneyStudyData: Record<string, unknown> | undefined;
      let omtFemaleStudyData: Record<string, unknown> | undefined;
      let bladderStudyData: Record<string, unknown> | undefined;
      let thyroidStudyData: Record<string, unknown> | undefined;
      let prostateStudyData: Record<string, unknown> | undefined;
      let breastStudyData: Record<string, unknown> | undefined;
      let testisStudyData: Record<string, unknown> | undefined;

      if (parsed.obp) {
        obpStudyData = makeObpStudyData(parsed.obp) as unknown as Record<string, unknown>;
      }

      if (parsed.kidneys) {
        kidneyStudyData = makeKidneyStudyData(parsed.kidneys) as unknown as Record<string, unknown>;
      }

      if (parsed.gyn) {
        omtFemaleStudyData = makeOmtFemaleStudyData(parsed.gyn) as unknown as Record<string, unknown>;
      }

      if (parsed.uro) {
        bladderStudyData = makeBladderStudyData(parsed.uro) as unknown as Record<string, unknown>;
        prostateStudyData = makeProstateStudyData(parsed.uro) as unknown as Record<string, unknown>;
      }

      if (parsed.thyroid) {
        thyroidStudyData = makeThyroidStudyData(parsed.thyroid) as unknown as Record<string, unknown>;
      }

      if (parsed.breast) {
        breastStudyData = makeBreastStudyData(parsed.breast) as unknown as Record<string, unknown>;
      }

      if (parsed.testis) {
        testisStudyData = makeTestisStudyData(parsed.testis) as unknown as Record<string, unknown>;
      }

      const bladderPartial = parsed.uro ? makeUrinaryBladderPartial(parsed.uro) : undefined;

      onDataReady({
        patientFullName: parsed.patient.fullName,
        patientDateOfBirth,
        researchDate,
        obpStudyData,
        kidneyStudyData,
        omtFemaleStudyData,
        bladderStudyData,
        bladderPartial,
        thyroidStudyData,
        prostateStudyData,
        breastStudyData,
        testisStudyData,
        // @ts-expect-error - добавляем content для deduplication
        _xmlContent: content,
      });
    });

    cleanupRef.current = unsubscribe || null;

    return () => {
      unsubscribe?.();
      window.medisonAPI?.stopWatching().catch(console.error);
    };
  }, [onDataReady]);
}

function normalizeDateForDesktop(dateStr: string): string {
  // Из DD-MM-YYYY в YYYY-MM-DD
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    const [day, month, year] = parts;
    return `${year}-${month}-${day}`;
  }
  return dateStr;
}