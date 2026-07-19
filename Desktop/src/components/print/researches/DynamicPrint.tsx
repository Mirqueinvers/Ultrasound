import React from "react";
import type {
  PrintTemplate,
  PrintSection,
  PrintFieldValues,
  PrintSelectWithTextarea,
  PrintConditionalField,
  PrintConcretionList,
  PrintPolypList,
  PrintPancreasSizes,
  PrintFreeFluid,
  PrintConclusion,
  PrintRecommendations,
  PrintField,
} from "@/constructor/schema";

interface DynamicPrintProps {
  template: PrintTemplate;
  data: Record<string, any>;
}

// ---- Helpers ─────────────────────────────────────

const getStr = (data: Record<string, any>, key: string): string =>
  data[key]?.toString().trim() ?? "";

const hasVal = (data: Record<string, any>, key: string): boolean =>
  getStr(data, key).length > 0;

const capitalize = (s: string): string =>
  s ? s.charAt(0).toUpperCase() + s.slice(1) : s;

/** 1 -> "1", 2..4 -> "2", 5+ -> "5" */
const countForm = (n: number): "one" | "few" | "many" => {
  if (n === 1) return "one";
  if (n >= 2 && n <= 4) return "few";
  return "many";
};

// ---- Renderers ───────────────────────────────────

const renderFieldValues = (block: PrintFieldValues, data: Record<string, any>): string | null => {
  const parts: string[] = [];
  for (const f of block.fields) {
    const v = getStr(data, f.field);
    if (v) parts.push(f.template.replace("{value}", v.toLowerCase()));
  }
  if (parts.length === 0) return null;
  let result = parts.join(block.separator ?? ", ");
  if (block.suffix) result += block.suffix;
  return result;
};

const renderSelectWithTextarea = (block: PrintSelectWithTextarea, data: Record<string, any>): string | null => {
  const val = getStr(data, block.field);
  if (!val || val !== block.triggerValue) return block.notSelectedText;

  const ta = getStr(data, block.textareaField);
  if (ta) {
    const prefix = block.prefix ?? "";
    return prefix + ta;
  }
  return block.selectedFallbackText ?? (block.notSelectedText);
};

const renderConditional = (block: PrintConditionalField, data: Record<string, any>): string | null => {
  const val = getStr(data, block.field);
  if (!val) return null;
  return block.values[val] ?? null;
};

const renderText = (block: { text: string }): string => block.text;

const renderPancreasSizes = (block: PrintPancreasSizes, data: Record<string, any>): string | null => {
  const sizeParts: string[] = [];
  const noValParts: string[] = [];

  const pushField = (field: string, noVal: string) => {
    const v = getStr(data, field);
    if (v) {
      sizeParts.push(v);
    } else {
      noValParts.push(noVal);
    }
  };

  pushField(block.fields.head, block.templates.noValue);
  pushField(block.fields.body, block.templates.noValue);
  pushField(block.fields.tail, block.templates.noValue);

  const results: string[] = [];

  if (sizeParts.length > 0) {
    const labels = ["головка", "тело", "хвост"];
    const labeled = sizeParts.map((v, i) => `${labels[i]} ${v} мм`);
    results.push(labeled.join(", "));
  }

  if (noValParts.length > 0) {
    // Если все 3 части не видны — просто "визуализация затруднена"
    const unique = [...new Set(noValParts)];
    if (noValParts.length === 3 && unique.length === 1) {
      results.push("визуализация затруднена");
    } else {
      let phrase = "визуализация ";
      if (noValParts.length === 1) {
        phrase += `${noValParts[0]} затруднена`;
      } else if (noValParts.length === 2) {
        phrase += `${noValParts[0]} и ${noValParts[1]} затруднена`;
      } else {
        const last = noValParts[noValParts.length - 1];
        const rest = noValParts.slice(0, -1);
        phrase += `${rest.join(", ")} и ${last} затруднена`;
      }
      results.push(phrase);
    }
  }

  return results.length > 0 ? results.join(", ") + "." : null;
};

const renderConcretionList = (block: PrintConcretionList, data: Record<string, any>): string | null => {
  const trigger = getStr(data, block.trigger.field);
  if (trigger === "Не определяются") return "конкременты не определяются";
  if (trigger !== "Определяются") return null;

  const rawList = data[block.list.field];
  if (!Array.isArray(rawList) || rawList.length === 0) return block.list.emptyText;

  const valid = rawList.filter(
    (c: any) => getStr(c, block.item.sizeField) || getStr(c, block.item.positionField)
  );
  if (valid.length === 0) return block.list.emptyText;

  const count = valid.length;
  const positions = Array.from(
    new Set(valid.map((c: any) => getStr(c, block.item.positionField)).filter(Boolean))
  );

  let posText = "";
  if (positions.length > 0) {
    const prefix = block.templates.positionPrefix;
    if (positions.length === 1) posText = `${prefix}${positions[0]}`;
    else if (positions.length === 2) posText = `${prefix}${positions[0]}${block.templates.positionJoinWord}${positions[1]}`;
    else {
      const last = positions[positions.length - 1];
      const rest = positions.slice(0, -1);
      posText = `${prefix}${rest.join(", ")}${block.templates.positionJoinWord}${last}`;
    }
  }

  const sizes = valid.map((c: any) => getStr(c, block.item.sizeField)).filter(Boolean);
  let sizeText = "";
  const { sizePrefix, sizeUnit, sizeJoinWord } = block.templates;
  if (sizes.length === 1) sizeText = `${sizePrefix}${sizes[0]}${sizeUnit}`;
  else if (sizes.length > 1) {
    const last = sizes[sizes.length - 1];
    const rest = sizes.slice(0, -1);
    sizeText = `${sizePrefix}${rest.join(`${sizeUnit}, `)}${sizeUnit}${sizeJoinWord}${last}${sizeUnit}`;
  }

  if (!posText && !sizeText) return block.list.emptyText;

  const form = countForm(count);
  const label = form === "many" ? block.templates.labels.few : block.templates.labels[form];
  const verb = count === 1 ? "определяется" : "определяются";

  return `${posText} ${verb} ${label} ${block.templates.acoustic} ${sizeText}`.trim();
};

const renderPolypList = (block: PrintPolypList, data: Record<string, any>): string | null => {
  const trigger = getStr(data, block.trigger.field);
  if (trigger === "Не определяются") return "полипы не определяются";
  if (trigger !== "Определяются") return null;

  const rawList = data[block.list.field];
  if (!Array.isArray(rawList) || rawList.length === 0) return block.list.emptyText;

  const valid = rawList.filter(
    (p: any) => getStr(p, block.item.sizeField) || getStr(p, block.item.positionField)
  );
  if (valid.length === 0) return block.list.emptyText;

  const count = valid.length;

  const positions = Array.from(
    new Set(valid.map((p: any) => getStr(p, block.item.positionField)).filter(Boolean))
  );

  const walls = Array.from(
    new Set(valid.map((p: any) => getStr(p, block.item.wallField)).filter(Boolean))
  );

  const sizes = valid.map((p: any) => getStr(p, block.item.sizeField)).filter(Boolean);

  const { positionPrefix, positionJoinWord, wallPrefix, wallJoinWord, wallSingleSuffix, wallBothText } = block.templates;

  let posText = "";
  if (positions.length === 1) posText = `${positionPrefix}${positions[0]}`;
  else if (positions.length === 2) posText = `${positionPrefix}${positions[0]}${positionJoinWord}${positions[1]}`;
  else if (positions.length > 2) {
    const last = positions[positions.length - 1];
    const rest = positions.slice(0, -1);
    posText = `${positionPrefix}${rest.join(", ")}${positionJoinWord}${last}`;
  }

  let wallText = "";
  if (walls.length === 1) wallText = `${wallPrefix}${walls[0]}${wallSingleSuffix}`;
  else if (walls.length === 2) wallText = `, ${wallBothText}`;

  const { sizePrefix, sizeUnit, sizeJoinWord } = block.templates;
  let sizeText = "";
  if (sizes.length === 1) sizeText = `${sizePrefix}${sizes[0]}${sizeUnit}`;
  else if (sizes.length > 1) {
    const last = sizes[sizes.length - 1];
    const rest = sizes.slice(0, -1);
    sizeText = `${sizePrefix}${rest.join(`${sizeUnit}, `)}${sizeUnit}${sizeJoinWord}${last}${sizeUnit}`;
  }

  if (!posText && !sizeText) return block.list.emptyText;

  const form = countForm(count);
  const label = form === "many" ? block.templates.labels.few : block.templates.labels[form];
  const verb = count === 1 ? "определяется" : "определяются";
  const participle = count === 1 ? block.templates.participleSingle : block.templates.participleFew;

  const parts = [`${posText}${wallText}`, `${verb} ${label}`, block.templates.acoustic, participle, sizeText];
  return parts.filter(Boolean).join(", ");
};

const renderFreeFluid = (block: PrintFreeFluid, data: Record<string, any>): string | null => {
  const val = getStr(data, block.field);
  if (!val) return null;

  const details = getStr(data, block.detailsField);
  if (val === "определяется" && details) return details;
  if (val === "определяется") return block.templates.determinedEmpty;
  return block.templates.notDetermined;
};

// ---- Field dispatcher ────────────────────────────

const renderPrintField = (field: PrintField, data: Record<string, any>): string | null => {
  switch (field.type) {
    case "fieldValues": return renderFieldValues(field, data);
    case "selectWithTextarea": return renderSelectWithTextarea(field, data);
    case "conditional": return renderConditional(field, data);
    case "text": return renderText(field);
    case "pancreasSizes": return renderPancreasSizes(field, data);
    case "concretionList": return renderConcretionList(field, data);
    case "polypList": return renderPolypList(field, data);
    default: return null;
  }
};

// ---- Section renderer ────────────────────────────

const renderSection = (section: PrintSection, data: Record<string, any>): React.ReactNode => {
  // Проверка specialCondition — холецистэктомия/спленэктомия
  if (section.specialConditionField && section.specialConditionText) {
    const val = getStr(data, section.specialConditionField);
    if (val === section.specialConditionText) {
      const extra = section.specialConditionAdditionalField
        ? getStr(data, section.specialConditionAdditionalField)
        : "";
      const extraText = extra
        ? `, ${extra.charAt(0).toLowerCase()}${extra.slice(1)}`
        : "";
      return (
        <div style={{ fontSize: "14px", lineHeight: 1.5, fontFamily: '"Times New Roman", Times, serif' }}>
          <p style={{ margin: 0 }}>
            <span style={{ fontWeight: 700, fontSize: "16px" }}>{section.label}</span>{" "}
            {section.specialConditionText}{extraText}.
          </p>
        </div>
      );
    }
    // Если значение не совпадает — рендерим как обычно
  }

  // Собираем части в массив строк
  const textParts: string[] = [];

  for (const field of section.fields) {
    const rendered = renderPrintField(field, data);
    if (rendered !== null && rendered.trim().length > 0) textParts.push(rendered.trim());
  }

  if (textParts.length === 0) return null;

  // Если в секции всего одна часть — просто добавляем точку в конце
  // Если несколько — разделяем запятыми, без точек внутри
  let body: string;
  if (textParts.length === 1) {
    body = textParts[0];
  } else {
    body = textParts.join(", ");
  }
  if (section.capitalize && body.length > 0) body = capitalize(body);
  if (!body.endsWith(".")) body += ".";

  return (
    <div style={{ fontSize: "14px", lineHeight: 1.5, fontFamily: '"Times New Roman", Times, serif' }}>
      <p style={{ margin: 0 }}>
        <span style={{ fontWeight: 700, fontSize: "16px" }}>{section.label}</span>{" "}
        {body}
      </p>
    </div>
  );
};

// ---- Top-level blocks ────────────────────────────

const renderTopBlock = (block: any, data: Record<string, any>): React.ReactNode => {
  switch (block.type) {
    case "section": return renderSection(block as PrintSection, data);
    case "freeFluid": {
      const text = renderFreeFluid(block as PrintFreeFluid, data);
      if (!text) return null;
      return (
        <div className="mt-3">
          <span
            className="text-sm text-slate-900 whitespace-pre-wrap"
            style={{ fontFamily: '"Times New Roman", Times, serif' }}
          >
            {text}
          </span>
        </div>
      );
    }
    case "conclusion": {
      const b = block as PrintConclusion;
      const val = getStr(data, b.field);
      if (!val) return null;
      return (
        <div className="mt-3">
          <span
            className="text-sm text-slate-900 font-semibold"
            style={{ fontFamily: '"Times New Roman", Times, serif' }}
          >
            {b.label}:
          </span>{" "}
          <span
            className="text-sm text-slate-900 whitespace-pre-wrap"
            style={{ fontFamily: '"Times New Roman", Times, serif' }}
          >
            {val}
          </span>
        </div>
      );
    }
    case "recommendations": {
      const b = block as PrintRecommendations;
      const val = getStr(data, b.field);
      if (!val) return null;
      return (
        <div className="mt-2">
          <span
            className="text-sm text-slate-900 font-semibold"
            style={{ fontFamily: '"Times New Roman", Times, serif' }}
          >
            {b.label}:
          </span>{" "}
          <span
            className="text-sm text-slate-900 whitespace-pre-wrap"
            style={{ fontFamily: '"Times New Roman", Times, serif' }}
          >
            {val}
          </span>
        </div>
      );
    }
    default:
      return null;
  }
};

// ---- Main Component ─────────────────────────────

export const DynamicPrint: React.FC<DynamicPrintProps> = ({ template, data }) => {
  const hasData = Object.keys(data ?? {}).some((key) => {
    const val = data[key];
    if (Array.isArray(val)) return val.length > 0;
    if (typeof val === "string") return val.trim().length > 0;
    return val != null;
  });

  if (!hasData) return null;

  return (
    <>
      <p className="mt-4 mb-2 text-center text-base font-semibold">
        {template.title}
      </p>

      {template.body.map((block, idx) => (
        <React.Fragment key={idx}>
          {renderTopBlock(block, data)}
        </React.Fragment>
      ))}
    </>
  );
};

export default DynamicPrint;