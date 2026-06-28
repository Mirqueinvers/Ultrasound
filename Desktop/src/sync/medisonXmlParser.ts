import type { MedisonParsedData, MedisonKidneySideData, MedisonUterusData, MedisonOvaryData, MedisonBladderData } from "./medisonTypes";

/**
 * Парсит XML-отчёт из сканера Medison без DOM-парсера.
 * Работает в Node.js окружении Electron.
 */
export function parseMedisonXml(xmlContent: string): MedisonParsedData | null {
  try {
    // Получаем значение из Header по id
    const getHeaderValue = (id: string): string => {
      // <Header id="Name"><h value="КУЗНЕЦОВ, ДМИТРИЙ ЮРЬЕВИЧ" unit=""/></Header>
      const match = xmlContent.match(
        new RegExp(`<Header\\s+id="${id}"[^>]*>.*?<h\\s+value="([^"]*)"`, "s")
      );
      return match ? match[1].trim() : "";
    };

    // Получаем значение измерения из группы
    const getMeasurementValue = (measurementId: string): number | null => {
      // <measurement id="Rad_Liver_L"><m value="156.50" unit="mm"/></measurement>
      const escapedId = measurementId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const match = xmlContent.match(
        new RegExp(
          `<measurement\\s+id="${escapedId}"[^>]*>.*?<m\\s+value="([^"]*)"`,
          "s"
        )
      );
      if (match && match[1].trim() !== "") {
        const parsed = parseFloat(match[1]);
        return isNaN(parsed) ? null : parsed;
      }

      // Если нет <m>, пробуем <m1>
      const match2 = xmlContent.match(
        new RegExp(
          `<measurement\\s+id="${escapedId}"[^>]*>.*?<m1\\s+value="([^"]*)"`,
          "s"
        )
      );
      if (match2 && match2[1].trim() !== "") {
        const parsed = parseFloat(match2[1]);
        return isNaN(parsed) ? null : parsed;
      }

      return null;
    };

    // Определяем есть ли группа в XML
    const hasGroup = (groupId: string): boolean => {
      return xmlContent.includes(`Group id="${groupId}"`);
    };

    // Дата и время исследования
    const examTimeMatch = xmlContent.match(
      /<ExamTime\s+date="([^"]*)"\s+time="([^"]*)"/
    );
    const examDate = examTimeMatch ? examTimeMatch[1] : "";
    const examTime = examTimeMatch ? examTimeMatch[2] : "";

    // ID исследования
    const examId = getHeaderValue("ID");

    // Диагност
    const diagnostician = getHeaderValue("DiagPhys");

    // Данные пациента
    const fullName = getHeaderValue("Name");
    const { lastName, firstName, middleName } = parsePatientName(fullName);
    const dateOfBirthRaw = getHeaderValue("Birthday");
    const dateOfBirth = normalizeDate(dateOfBirthRaw);

    // Определяем есть ли пакет в XML
    const hasPackage = (packageId: string): boolean => {
      return xmlContent.includes(`Package id="${packageId}"`);
    };

    // Парсим измерения
    const obp = hasGroup("Rad_Liver") || hasGroup("Rad_GB") || hasGroup("Rad_Pancreas") || hasGroup("Rad_Spleen") || hasGroup("Rad_MPortalV")
      ? parseObpData(getMeasurementValue)
      : null;

    const kidneys = hasGroup("Rad_Kidney")
      ? parseKidneyData(getMeasurementValue)
      : null;

    const gyn = hasPackage("Gyn")
      ? parseGynData(getMeasurementValue)
      : null;

    const uro = hasPackage("Uro")
      ? parseUroData(getMeasurementValue)
      : null;

    const thyroid = hasPackage("Thyroid")
      ? parseThyroidData(xmlContent, getMeasurementValue)
      : null;

    return {
      patient: {
        fullName,
        lastName,
        firstName,
        middleName,
        dateOfBirth,
      },
      examDate,
      examTime,
      examId,
      diagnostician,
      obp: obp &&
        (obp.liver || obp.gallbladder || obp.pancreas || obp.spleen || obp.portalVein)
        ? obp
        : undefined,
      kidneys: kidneys && (kidneys.left || kidneys.right) ? kidneys : undefined,
      gyn: gyn && (gyn.uterus || gyn.rightOvary || gyn.leftOvary) ? gyn : undefined,
      uro: uro && uro.bladder ? uro : undefined,
      thyroid: thyroid && (thyroid.rightLobe || thyroid.leftLobe) ? thyroid : undefined,
    };
  } catch (err) {
    console.error("Failed to parse Medison XML:", err);
    return null;
  }
}

function parsePatientName(fullName: string): {
  lastName: string;
  firstName: string;
  middleName: string;
} {
  // Формат: "КУЗНЕЦОВ, ДМИТРИЙ ЮРЬЕВИЧ"
  const parts = fullName.split(",").map((s) => s.trim());
  const lastName = parts[0] || "";
  const rest = parts[1] || "";

  const nameParts = rest.split(/\s+/).filter(Boolean);
  const firstName = nameParts[0] || "";
  const middleName = nameParts.slice(1).join(" ") || "";

  return { lastName, firstName, middleName };
}

function normalizeDate(dateStr: string): string {
  // Из DD-MM-YYYY в YYYY-MM-DD
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    const [day, month, year] = parts;
    return `${year}-${month}-${day}`;
  }
  return dateStr;
}

function parseObpData(
  getMeasurementValue: (measurementId: string) => number | null
) {
  const liverLength = getMeasurementValue("Rad_Liver_L");
  const liverWidth = getMeasurementValue("Rad_Liver_W");

  const gbLength = getMeasurementValue("Rad_GB_L");
  const gbWidth = getMeasurementValue("Rad_GB_W");
  const gbWall = getMeasurementValue("Rad_GB_GBW");
  const gbCbd = getMeasurementValue("Rad_GB_CBD");

  const pancHead = getMeasurementValue("Rad_Pancreas_PancHead");
  const pancBody = getMeasurementValue("Rad_Pancreas_PancBody");
  const pancTail = getMeasurementValue("Rad_Pancreas_PancTail");

  const spleenLength = getMeasurementValue("Rad_Spleen_L");
  const spleenWidth = getMeasurementValue("Rad_Spleen_W");

  const portalVDist = getMeasurementValue("Rad_MPortalV_VDist");

  return {
    liver:
      liverLength !== null || liverWidth !== null
        ? {
            length: { value: liverLength ?? 0, unit: "mm" },
            width: { value: liverWidth ?? 0, unit: "mm" },
          }
        : undefined,
    gallbladder:
      gbLength !== null || gbWidth !== null || gbWall !== null || gbCbd !== null
        ? {
            length: { value: gbLength ?? 0, unit: "mm" },
            width: { value: gbWidth ?? 0, unit: "mm" },
            wallThickness: { value: gbWall ?? 0, unit: "mm" },
            commonBileDuct: { value: gbCbd ?? 0, unit: "mm" },
          }
        : undefined,
    pancreas:
      pancHead !== null || pancBody !== null || pancTail !== null
        ? {
            head: { value: pancHead ?? 0, unit: "mm" },
            body: { value: pancBody ?? 0, unit: "mm" },
            tail: { value: pancTail ?? 0, unit: "mm" },
          }
        : undefined,
    spleen:
      spleenLength !== null || spleenWidth !== null
        ? {
            length: { value: spleenLength ?? 0, unit: "mm" },
            width: { value: spleenWidth ?? 0, unit: "mm" },
          }
        : undefined,
    portalVein:
      portalVDist !== null
        ? { diameter: { value: portalVDist, unit: "mm" } }
        : undefined,
  };
}

function parseKidneySideData(
  getMeasurementValue: (measurementId: string) => number | null,
  prefix: string
): MedisonKidneySideData | null {
  const lengthVal = getMeasurementValue(`${prefix}L`);
  const widthVal = getMeasurementValue(`${prefix}W`);
  const heightVal = getMeasurementValue(`${prefix}H`);

  if (lengthVal === null && widthVal === null && heightVal === null)
    return null;

  return {
    length: { value: lengthVal ?? 0, unit: "mm" },
    width: { value: widthVal ?? 0, unit: "mm" },
    parenchymaSize: { value: heightVal ?? 0, unit: "mm" },
  };
}

function parseKidneyData(
  getMeasurementValue: (measurementId: string) => number | null
) {
  const left = parseKidneySideData(getMeasurementValue, "Rad_Kidney_L");
  const right = parseKidneySideData(getMeasurementValue, "Rad_Kidney_R");

  if (!left && !right) return null;

  return {
    left: left ?? {
      length: { value: 0, unit: "mm" },
      width: { value: 0, unit: "mm" },
      parenchymaSize: { value: 0, unit: "mm" },
    },
    right: right ?? {
      length: { value: 0, unit: "mm" },
      width: { value: 0, unit: "mm" },
      parenchymaSize: { value: 0, unit: "mm" },
    },
  };
}

function parseUterusData(
  getMeasurementValue: (measurementId: string) => number | null
): MedisonUterusData | null {
  const lengthVal = getMeasurementValue("GYN_UTERUS_LENGTH");
  const heightVal = getMeasurementValue("GYN_UTERUS_HEIGHT");
  const widthVal = getMeasurementValue("GYN_UTERUS_WIDTH");
  const volVal = getMeasurementValue("GYN_UTERUS_VOL");
  const endoVal = getMeasurementValue("GYN_UTERUS_EndoTh");
  const cervixVal = getMeasurementValue("GYN_UTERUS_CervixW");

  if (lengthVal === null && heightVal === null && widthVal === null && volVal === null && endoVal === null && cervixVal === null)
    return null;

  return {
    length: { value: lengthVal ?? 0, unit: "mm" },
    height: { value: heightVal ?? 0, unit: "mm" },
    width: { value: widthVal ?? 0, unit: "mm" },
    volume: { value: volVal ?? 0, unit: "ml" },
    endometriumThickness: { value: endoVal ?? 0, unit: "mm" },
    cervixWidth: { value: cervixVal ?? 0, unit: "mm" },
  };
}

function parseOvaryData(
  getMeasurementValue: (measurementId: string) => number | null,
  prefix: string
): MedisonOvaryData | null {
  const lengthVal = getMeasurementValue(`${prefix}_LENGTH`);
  const widthVal = getMeasurementValue(`${prefix}_WIDTH`);

  if (lengthVal === null && widthVal === null) return null;

  return {
    length: { value: lengthVal ?? 0, unit: "mm" },
    width: { value: widthVal ?? 0, unit: "mm" },
  };
}

function parseGynData(
  getMeasurementValue: (measurementId: string) => number | null
) {
  const uterus = parseUterusData(getMeasurementValue);
  const rightOvary = parseOvaryData(getMeasurementValue, "GYN_RtOvary");
  const leftOvary = parseOvaryData(getMeasurementValue, "GYN_LtOvary");

  return {
    uterus: uterus ?? undefined,
    rightOvary: rightOvary ?? undefined,
    leftOvary: leftOvary ?? undefined,
  };
}

function parseBladderData(
  getMeasurementValue: (measurementId: string) => number | null
): MedisonBladderData | null {
  const lengthVal = getMeasurementValue("Uro_Bladder_Length");
  const heightVal = getMeasurementValue("Uro_Bladder_Height");
  const widthVal = getMeasurementValue("Uro_Bladder_Width");
  const volVal = getMeasurementValue("Uro_Bladder_Volume");
  const resLengthVal = getMeasurementValue("Uro_ResVol_PostLength");
  const resHeightVal = getMeasurementValue("Uro_ResVol_PostHeight");
  const resWidthVal = getMeasurementValue("Uro_ResVol_PostWidth");
  const resVolVal = getMeasurementValue("Uro_ResVol_PostVolume");

  if (lengthVal === null && heightVal === null && widthVal === null && volVal === null &&
      resLengthVal === null && resHeightVal === null && resWidthVal === null && resVolVal === null)
    return null;

  return {
    length: { value: lengthVal ?? 0, unit: "mm" },
    height: { value: heightVal ?? 0, unit: "mm" },
    width: { value: widthVal ?? 0, unit: "mm" },
    volume: { value: volVal ?? 0, unit: "ml" },
    residualLength: { value: resLengthVal ?? 0, unit: "mm" },
    residualHeight: { value: resHeightVal ?? 0, unit: "mm" },
    residualWidth: { value: resWidthVal ?? 0, unit: "mm" },
    residualVolume: { value: resVolVal ?? 0, unit: "ml" },
  };
}

function parseUroData(
  getMeasurementValue: (measurementId: string) => number | null
) {
  const bladder = parseBladderData(getMeasurementValue);

  return {
    bladder: bladder ?? undefined,
  };
}

function parseThyroidData(
  xmlContent: string,
  getMeasurementValue: (measurementId: string) => number | null
) {
  const rl = getMeasurementValue("Thyroid_Lobe_RL");
  const rh = getMeasurementValue("Thyroid_Lobe_RH");
  const rw = getMeasurementValue("Thyroid_Lobe_RW");
  const rvol = getMeasurementValue("Thyroid_Lobe_RVol");

  const ll = getMeasurementValue("Thyroid_Lobe_LL");
  const lh = getMeasurementValue("Thyroid_Lobe_LH");
  const lw = getMeasurementValue("Thyroid_Lobe_LW");
  const lvol = getMeasurementValue("Thyroid_Lobe_LVol");

  const isthmus = getMeasurementValue("Thyroid_Lobe_Isthmus");

  // Парсим образования (узлы) — group id="Thyroid_Mass1", Thyroid_Mass2 и т.д.
  // Каждая группа может появляться с laterality="0" (право) и laterality="1" (лево)
  const rightMasses: { length: number; width: number }[] = [];
  const leftMasses: { length: number; width: number }[] = [];

  // Извлекаем все группы Thyroid_Mass с атрибутом laterality
  const massRegex = /<Group\s+id="Thyroid_Mass\d+"[^>]*laterality="([01])"[^>]*>.*?<\/Group>/gs;
  let massMatch: RegExpExecArray | null;
  while ((massMatch = massRegex.exec(xmlContent)) !== null) {
    const laterality = massMatch[1];
    const groupXml = massMatch[0];

    const getGroupMeasurement = (id: string): number | null => {
      const escapedId = id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const m = groupXml.match(
        new RegExp(`<measurement\\s+id="${escapedId}"[^>]*>.*?<m(?:1)?\\s+value="([^"]*)"`, "s")
      );
      if (m && m[1].trim() !== "") {
        const parsed = parseFloat(m[1]);
        return isNaN(parsed) ? null : parsed;
      }
      return null;
    };

    const massL = getGroupMeasurement("Thyroid_Mass1_L") ?? getGroupMeasurement("Thyroid_Mass2_L");
    const massW = getGroupMeasurement("Thyroid_Mass1_W") ?? getGroupMeasurement("Thyroid_Mass2_W");

    if (massL !== null && massW !== null) {
      const mass = { length: massL, width: massW };
      if (laterality === "0") {
        rightMasses.push(mass);
      } else {
        leftMasses.push(mass);
      }
    }
  }

  return {
    rightLobe:
      rl !== null || rh !== null || rw !== null || rvol !== null
        ? {
            length: { value: rl ?? 0, unit: "mm" },
            height: { value: rh ?? 0, unit: "mm" },
            width: { value: rw ?? 0, unit: "mm" },
            volume: { value: rvol ?? 0, unit: "ml" },
          }
        : undefined,
    leftLobe:
      ll !== null || lh !== null || lw !== null || lvol !== null
        ? {
            length: { value: ll ?? 0, unit: "mm" },
            height: { value: lh ?? 0, unit: "mm" },
            width: { value: lw ?? 0, unit: "mm" },
            volume: { value: lvol ?? 0, unit: "ml" },
          }
        : undefined,
    isthmus: { value: isthmus ?? 0, unit: "mm" },
    rightMasses: rightMasses.map((m) => ({
      length: { value: m.length, unit: "mm" },
      width: { value: m.width, unit: "mm" },
    })),
    leftMasses: leftMasses.map((m) => ({
      length: { value: m.length, unit: "mm" },
      width: { value: m.width, unit: "mm" },
    })),
  };
}
