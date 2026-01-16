// /components/print/organs/kidney/kidneyHelpers.ts
import type { KidneyProtocol } from "@types";

export const buildKidneyText = (
  label: string,
  value: KidneyProtocol,
): string | null => {
  const {
    position,
    positionText,
    length,
    width,
    thickness,
    contour,
    parenchymaSize,
    parenchymaEchogenicity,
    parenchymaStructure,
    parenchymaConcrements,
    parenchymaConcrementslist,
    parenchymaCysts,
    parenchymaCystslist,
    parenchymaMultipleCysts,
    parenchymaMultipleCystsSize,
    parenchymaPathologicalFormations,
    parenchymaPathologicalFormationsText,
    pcsSize,
    pcsMicroliths,
    pcsMicrolithsSize,
    pcsConcrements,
    pcsConcrementslist,
    pcsCysts,
    pcsCystslist,
    pcsMultipleCysts,
    pcsMultipleCystsSize,
    pcsPathologicalFormations,
    pcsPathologicalFormationsText,
    sinus,
    adrenalArea,
    adrenalAreaText,
    additional,
  } = value;

  const additionalText = additional?.trim();

    // --- Положение
    let positionSentence = "";
    const positionExtra = positionText?.trim();

    if (position === "обычное") {
    positionSentence = "Определяется в обычном положении.";
    } else if (position === "опущение" || position === "нефроптоз") {
    if (positionExtra && positionExtra.length > 0) {
        const first =
        positionExtra.charAt(0).toUpperCase() + positionExtra.slice(1);
        positionSentence = first.endsWith(".") ? first : `${first}.`;
    }
    } else if (position === "нефрэктомия") {
    if (positionExtra && positionExtra.length > 0) {
        // Нефрэктомия + текст из поля
        const extra =
        positionExtra.charAt(0).toUpperCase() + positionExtra.slice(1);
        positionSentence = `Нефрэктомия. ${extra.endsWith(".") ? extra : extra + "."}`;
    } else {
        positionSentence = "Нефрэктомия.";
    }
    }


  // --- Размеры и паренхима (предложение 1)
  const sizeParts: string[] = [];
  if (length?.trim()) sizeParts.push(`длина ${length} мм`);
  if (width?.trim()) sizeParts.push(`ширина ${width} мм`);
  if (thickness?.trim()) sizeParts.push(`толщина ${thickness} мм`);

  let sizeSentence = "";
  if (sizeParts.length > 0) {
    const base = sizeParts.join(", ");
    if (parenchymaSize?.trim()) {
      sizeSentence = `${base}, толщина паренхимы ${parenchymaSize} мм.`;
    } else {
      sizeSentence = `${base}.`;
    }
  }

  // --- Контур (отдельное предложение) + эхогенность/структура (следующее предложение)
  let contourSentence = "";
  let parenchymaSentence = "";

  if (contour?.trim()) {
    contourSentence = `Контур почки ${contour.toLowerCase()}.`;
  }

  const parenchymaChunks: string[] = [];

  if (parenchymaEchogenicity?.trim()) {
    parenchymaChunks.push(
      `эхогенность паренхимы ${parenchymaEchogenicity.toLowerCase()}`
    );
  }
  if (parenchymaStructure?.trim()) {
    parenchymaChunks.push(
      `структура ${parenchymaStructure.toLowerCase()}`
    );
  }

  if (parenchymaChunks.length > 0) {
    const text = parenchymaChunks.join(", ");
    parenchymaSentence =
      `${text.charAt(0).toUpperCase()}${text.slice(1)}.`;
  }

  // --- Билдеры для конкрементов и кист (используем только при находках)
  const buildConcrementsPhrase = (
    mode: "паренхима" | "чашечно-лоханочная система",
    flag: KidneyProtocol["parenchymaConcrements"] | KidneyProtocol["pcsConcrements"],
    list:
      | KidneyProtocol["parenchymaConcrementslist"]
      | KidneyProtocol["pcsConcrementslist"],
  ): string => {
    if (flag !== "определяются") {
      return "";
    }

    if (!list || list.length === 0) {
      return `конкременты в ${mode} определяются`;
    }

    const valid = list.filter(
      (c) =>
        (c.size && c.size.toString().trim()) ||
        (c.location && c.location.trim()),
    );

    if (valid.length === 0) {
      return `конкременты в ${mode} определяются`;
    }

    const count = valid.length;
    const locations = Array.from(
      new Set(
        valid
          .map((c) => c.location?.trim())
          .filter((p): p is string => !!p),
      ),
    );

    let locText = "";
    if (locations.length === 1) {
      locText = `В области ${locations[0]}`;
    } else if (locations.length === 2) {
      locText = `В области ${locations[0]} и ${locations[1]}`;
    } else if (locations.length >= 3) {
      const last = locations[locations.length - 1];
      const rest = locations.slice(0, -1);
      locText = `В области ${rest.join(", ")} и ${last}`;
    }

    const sizes = valid
      .map((c) => c.size?.toString().trim())
      .filter((s): s is string => !!s);

    let sizeText = "";
    if (sizes.length === 1) {
      sizeText = `размерами до ${sizes[0]} мм`;
    } else if (sizes.length > 1) {
      const last = sizes[sizes.length - 1];
      const rest = sizes.slice(0, -1);
      sizeText = `размерами до ${rest.join(" мм, ")} мм и ${last} мм`;
    }

    const isSingle = count === 1;
    const isFew = count >= 2 && count <= 4;

    let countText = "";
    if (isSingle) {
      countText = "гиперэхогенное образование";
    } else if (isFew) {
      countText = `${count} гиперэхогенных образования`;
    } else {
      countText = `${count} гиперэхогенных образований`;
    }

    const verb = isSingle ? "определяется" : "определяются";

    const tail = [locText, verb, countText, "с акустической тенью", sizeText]
      .filter(Boolean)
      .join(" ");

    return tail.trim();
  };

  const buildCystsPhrase = (
    mode: "паренхиме" | "чашечно-лоханочной системе",
    flag: KidneyProtocol["parenchymaCysts"] | KidneyProtocol["pcsCysts"],
    list: KidneyProtocol["parenchymaCystslist"] | KidneyProtocol["pcsCystslist"],
    multiple: boolean,
    multipleSize: string,
  ): string => {
    if (flag !== "определяются") {
      return "";
    }

    const valid = (list || []).filter(
      (c) =>
        (c.size && c.size.toString().trim()) ||
        (c.location && c.location.trim()),
    );

    if (multiple && multipleSize.trim()) {
      return `определяются множественные кисты в ${mode} размерами до ${multipleSize} мм`;
    }

    if (!multiple && valid.length === 0) {
      return `кисты в ${mode} определяются`;
    }

    if (valid.length === 0) {
      return `кисты в ${mode} определяются`;
    }

    const count = valid.length;
    const locations = Array.from(
      new Set(
        valid
          .map((c) => c.location?.trim())
          .filter((p): p is string => !!p),
      ),
    );

    let locText = "";
    if (locations.length === 1) {
      locText = `В области ${locations[0]}`;
    } else if (locations.length === 2) {
      locText = `В области ${locations[0]} и ${locations[1]}`;
    } else if (locations.length >= 3) {
      const last = locations[locations.length - 1];
      const rest = locations.slice(0, -1);
      locText = `В области ${rest.join(", ")} и ${last}`;
    }

    const sizes = valid
      .map((c) => c.size?.toString().trim())
      .filter((s): s is string => !!s);

    let sizeText = "";
    if (sizes.length === 1) {
      sizeText = `размерами до ${sizes[0]} мм`;
    } else if (sizes.length > 1) {
      const last = sizes[sizes.length - 1];
      const rest = sizes.slice(0, -1);
      sizeText = `размерами до ${rest.join(" мм, ")} мм и ${last} мм`;
    }

    const isSingle = count === 1;
    const verb = isSingle ? "определяется" : "определяются";
    const countPart = isSingle
      ? "анэхогенное образование"
      : `${count} анэхогенных образования`;

    const tail = [locText, verb, countPart, sizeText]
      .filter(Boolean)
      .join(" ");

    return tail.trim();
  };

  // --- Паренхима: выводим кисты/камни/образования только если есть
const parenchymaFindings: string[] = [];

// конкременты в паренхиме (как уже сделано)
const rawParenchymaConcrementsPhrase = buildConcrementsPhrase(
  "паренхима",
  parenchymaConcrements,
  parenchymaConcrementslist,
);

let parenchymaConcrementsPhrase = "";

if (rawParenchymaConcrementsPhrase) {
  const centralVariant = "В области центральной части определяется";
  if (rawParenchymaConcrementsPhrase.startsWith(centralVariant)) {
    const rest = rawParenchymaConcrementsPhrase.slice(centralVariant.length);
    parenchymaConcrementsPhrase =
      `В паренхиме, в центральной части определяется${rest}`;
  } else {
    parenchymaConcrementsPhrase =
      `В паренхиме, ${rawParenchymaConcrementsPhrase.charAt(0).toLowerCase()}${rawParenchymaConcrementsPhrase.slice(1)}`;
  }
}

if (parenchymaConcrementsPhrase) {
  parenchymaFindings.push(parenchymaConcrementsPhrase);
}

// кисты в паренхиме — отдельная логика
let parenchymaCystsPhrase = "";

if (parenchymaCysts === "определяются") {
  if (parenchymaMultipleCysts && parenchymaMultipleCystsSize?.trim()) {
    // множественные — нужная фраза
    parenchymaCystsPhrase =
      `В паренхиме определяются множественные гиперэхогенные образования размерами до ${parenchymaMultipleCystsSize} мм`;
  } else {
    // одиночные / список — оборачиваем результат билдера
    const rawParenchymaCystsPhrase = buildCystsPhrase(
      "паренхиме",
      parenchymaCysts,
      parenchymaCystslist,
      parenchymaMultipleCysts,
      parenchymaMultipleCystsSize || "",
    );

    if (rawParenchymaCystsPhrase) {
      const centralVariantCyst = "В области центральной части определяется";
      if (rawParenchymaCystsPhrase.startsWith(centralVariantCyst)) {
        const rest = rawParenchymaCystsPhrase.slice(centralVariantCyst.length);
        parenchymaCystsPhrase =
          `В паренхиме, в центральной части определяется${rest}`;
      } else {
        parenchymaCystsPhrase =
          `В паренхиме, ${rawParenchymaCystsPhrase.charAt(0).toLowerCase()}${rawParenchymaCystsPhrase.slice(1)}`;
      }
    }
  }
}

if (parenchymaCystsPhrase) {
  parenchymaFindings.push(parenchymaCystsPhrase);
}

// Патологические образования в паренхиме
if (
  parenchymaPathologicalFormations === "определяются" &&
  parenchymaPathologicalFormationsText?.trim()
) {
  const raw = parenchymaPathologicalFormationsText.trim();
  const lower = raw.charAt(0).toLowerCase() + raw.slice(1);

  if (parenchymaFindings.length > 0) {
    const lastIndex = parenchymaFindings.length - 1;
    parenchymaFindings[lastIndex] =
      parenchymaFindings[lastIndex] + `, ${lower}`;
  } else {
    // ни одной фразы про паренхиму нет — создаём только из текста поля
    parenchymaFindings.push(lower);
  }
}



// --- ЧЛС: основное предложение + находки
let pcsSentence = "";
if (pcsSize === "не расширена") {
  pcsSentence = "Чашечно-лоханочная система не расширена.";
} else if (pcsSize === "расширена") {
  pcsSentence = "Чашечно-лоханочная система расширена.";
}

// собираем находки (микролиты, конкременты, кисты, пат. образования)
const pcsFindings: string[] = [];

// микролиты
if (pcsMicroliths === "определяются") {
  if (pcsMicrolithsSize?.trim()) {
    pcsFindings.push(
      `микролиты, размерами до ${pcsMicrolithsSize} мм`,
    );
  } else {
    pcsFindings.push("микролиты");
  }
}

// конкременты ЧЛС
const rawPcsConcrementsPhrase = buildConcrementsPhrase(
  "чашечно-лоханочная система",
  pcsConcrements,
  pcsConcrementslist,
);
if (rawPcsConcrementsPhrase) {
  pcsFindings.push(rawPcsConcrementsPhrase);
}

// кисты ЧЛС
const rawPcsCystsPhrase = buildCystsPhrase(
  "чашечно-лоханочной системе",
  pcsCysts,
  pcsCystslist,
  pcsMultipleCysts,
  pcsMultipleCystsSize || "",
);
if (rawPcsCystsPhrase) {
  pcsFindings.push(rawPcsCystsPhrase);
}

// пат. образования ЧЛС — просто текст из поля
if (
  pcsPathologicalFormations === "определяются" &&
  pcsPathologicalFormationsText?.trim()
) {
  const raw = pcsPathologicalFormationsText.trim();
  const lower = raw.charAt(0).toLowerCase() + raw.slice(1);

  if (pcsFindings.length > 0) {
    const lastIndex = pcsFindings.length - 1;
    pcsFindings[lastIndex] =
      pcsFindings[lastIndex] + `, ${lower}`;
  } else {
    pcsFindings.push(lower);
  }
}

// итоговая фраза для находок ЧЛС
let pcsDetailsSentence = "";
if (pcsFindings.length > 0) {
  const findingsText = pcsFindings.join(". ");
  pcsDetailsSentence =
    `В чашечно-лоханочной системе определяются ${findingsText}.`;
}



  // --- Синус
  let sinusSentence = "";
  if (sinus === "без включений") {
    sinusSentence = "Почечный синус не изменен.";
  } else if (sinus === "с включениями") {
    sinusSentence =
      "Синус повышенной эхогенности, с гиперэхогенными включениями.";
  }

  // --- Область надпочечников
  let adrenalSentence = "";
  if (adrenalArea === "не изменена") {
    adrenalSentence = "Область надпочечников не изменена.";
  } else if (adrenalArea === "изменена") {
    const text = adrenalAreaText?.trim();
    adrenalSentence = text
      ? `${text}.`
      : "Область надпочечников изменена.";
  }

  const hasAnyContent =
    positionSentence ||
    sizeSentence ||
    contourSentence ||
    parenchymaSentence ||
    parenchymaFindings.length > 0 ||
    pcsSentence ||
    pcsDetailsSentence ||
    sinusSentence ||
    adrenalSentence ||
    additionalText;

  if (!hasAnyContent) {
    return null;
  }

  const pieces: string[] = [];

  if (positionSentence) pieces.push(positionSentence);
  if (sizeSentence) pieces.push(sizeSentence);
  if (contourSentence) pieces.push(contourSentence);
  if (parenchymaSentence) pieces.push(parenchymaSentence);
  if (parenchymaFindings.length > 0) {
    pieces.push(parenchymaFindings.join(". ") + ".");
  }
  if (pcsSentence) pieces.push(pcsSentence);
  if (pcsDetailsSentence) pieces.push(pcsDetailsSentence);
  if (sinusSentence) pieces.push(sinusSentence);
  if (adrenalSentence) pieces.push(adrenalSentence);

  if (additionalText) {
    pieces.push(
      additionalText.endsWith(".") ? additionalText : `${additionalText}.`,
    );
  }

  return `${label}: ${pieces.join(" ")}`;
};

