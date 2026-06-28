import { useEffect, useRef } from "react";
import { parseMedisonXml } from "@/sync/medisonXmlParser";
import type { MedisonParsedData } from "@/sync/medisonTypes";
import { defaultLiverState } from "@/types/defaultStates/organs/liver";
import { defaultGallbladderState } from "@/types/defaultStates/organs/gallbladder";
import { defaultPancreasState } from "@/types/defaultStates/organs/pancreas";
import { defaultSpleenState } from "@/types/defaultStates/organs/spleen";
import { defaultKidneyState } from "@/types/defaultStates/organs/kidney";
import { defaultUterusState } from "@/types/defaultStates/organs/uterus";
import { defaultOvaryState } from "@/types/defaultStates/organs/ovary";
import { defaultUrinaryBladderState } from "@/types/defaultStates/organs/urinaryBladder";

/**
 * Создаёт полный LiverProtocol с дефолтными значениями, мержа данные из XML.
 * Все остальные поля liver остаются пустыми (не затираются на уровне mergeStudyData/deepMerge).
 */
function makeLiverData(medisonLiver: NonNullable<NonNullable<MedisonParsedData["obp"]>["liver"]>, portalVeinDiameter?: string) {
  return {
    ...defaultLiverState,
    rightLobeAP: medisonLiver.length.value.toString(),
    leftLobeAP: medisonLiver.width.value.toString(),
    ...(portalVeinDiameter ? { portalVeinDiameter } : {}),
  };
}

function makeGallbladderData(medisonGb: NonNullable<NonNullable<MedisonParsedData["obp"]>["gallbladder"]>) {
  return {
    ...defaultGallbladderState,
    length: medisonGb.length.value.toString(),
    width: medisonGb.width.value.toString(),
    wallThickness: medisonGb.wallThickness.value.toString(),
    commonBileDuct: medisonGb.commonBileDuct.value.toString(),
  };
}

function makePancreasData(medisonPanc: NonNullable<NonNullable<MedisonParsedData["obp"]>["pancreas"]>) {
  return {
    ...defaultPancreasState,
    head: medisonPanc.head.value.toString(),
    body: medisonPanc.body.value.toString(),
    tail: medisonPanc.tail.value.toString(),
  };
}

function makeSpleenData(medisonSpleen: NonNullable<NonNullable<MedisonParsedData["obp"]>["spleen"]>) {
  return {
    ...defaultSpleenState,
    length: medisonSpleen.length.value.toString(),
    width: medisonSpleen.width.value.toString(),
  };
}

function makeKidneySideData(medisonKidney: NonNullable<NonNullable<MedisonParsedData["kidneys"]>["left"]>) {
  return {
    ...defaultKidneyState,
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
  return {
    ...defaultUterusState,
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
    ...defaultOvaryState,
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
  return {
    ...defaultUrinaryBladderState,
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