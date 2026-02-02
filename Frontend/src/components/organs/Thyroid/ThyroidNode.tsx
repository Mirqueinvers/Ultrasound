// src/components/organs/Thyroid/ThyroidNode.tsx
import React, { useMemo, useEffect } from "react";
import { ButtonSelect } from "@/UI";
import type { ThyroidNodeProps } from "@/types/organs/thyroid";

// Маппинг баллов по ACR TI-RADS
const ECHOGENICITY_POINTS: Record<string, number> = {
  анэхогенный: 0,
  "гиперэхогенный": 1,
  "изоэхогенный": 1,
  "гипоэхогенный": 2,
  "выраженно гипоэхогенный": 3,
};

const ECHOSTRUCTURE_POINTS: Record<string, number> = {
  кистозный: 0,
  спонгиозный: 0,
  "кистозно-солидная": 1,
  "преимущественно солидный": 2,
  солидный: 2,
};

const CONTOUR_POINTS: Record<string, number> = {
  "четкий ровный": 0,
  "не четкий": 0,
  "не ровный": 2,
  "экстра-тиреоидальное распространение": 3,
};

const ECHOGENIC_FOCI_POINTS: Record<string, number> = {
  нет: 0,
  "артефакт хвоста кометы": 0,
  макрокальцинаты: 1,
  "периферические кальцинаты": 2,
  микрокальцинаты: 3,
};

// Ориентация в TI-RADS
const ORIENTATION_POINTS: Record<string, number> = {
  горизонтальная: 0,
  вертикальная: 3,
};

const getTiradsCategory = (points: number): string => {
  if (points === 0) return "TI-RADS 1 (доброкачественный)";
  if (points === 2) return "TI-RADS 2 (неподозрительный)";
  if (points === 3) return "TI-RADS 3 (слабо подозрительный)";
  if (points === 4) return "TI-RADS 4a (умеренно подозрительный)";
  if (points === 5) return "TI-RADS 4b (умеренно подозрительный)";
  if (points === 6) return "TI-RADS 4c (умеренно подозрительный)";
  if (points >= 7) return "TI-RADS 5 (высоко подозрительный)";
  return "TI-RADS (неопределенная категория)";
};

export const ThyroidNodeComponent: React.FC<ThyroidNodeProps> = ({
  node,
  onUpdate,
}) => {
  const allSelected =
    node.echogenicity &&
    node.echostructure &&
    node.contour &&
    node.echogenicFoci &&
    node.orientation;

  const { totalPoints, tiradsText, tiradsCategory } = useMemo(() => {
    if (!allSelected) {
      return {
        totalPoints: null as number | null,
        tiradsText: "",
        tiradsCategory: "",
      };
    }

    const pEcho = ECHOGENICITY_POINTS[node.echogenicity] ?? 0;
    const pStruct = ECHOSTRUCTURE_POINTS[node.echostructure] ?? 0;
    const pContour = CONTOUR_POINTS[node.contour] ?? 0;
    const pFoci = ECHOGENIC_FOCI_POINTS[node.echogenicFoci] ?? 0;
    const pOrient = ORIENTATION_POINTS[node.orientation] ?? 0;

    const sum = pEcho + pStruct + pContour + pFoci + pOrient;
    const category = getTiradsCategory(sum);
    const categoryName = category.split(" (")[0];

    return {
      totalPoints: sum,
      tiradsText: `Узел соответствует ${category} (набранные баллы: ${sum}).`,
      tiradsCategory: categoryName,
    };
  }, [
    allSelected,
    node.echogenicity,
    node.echostructure,
    node.contour,
    node.echogenicFoci,
    node.orientation,
  ]);

  // Автоматически обновляем TI-RADS категорию в узле
  useEffect(() => {
    if (tiradsCategory && node.tiradsCategory !== tiradsCategory) {
      onUpdate("tiradsCategory", tiradsCategory);
    }
  }, [tiradsCategory, node.tiradsCategory, onUpdate]);

  return (
    <div className="space-y-4">
      {/* Размеры узла */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Размер 1 (мм)
          </label>
          <input
            type="text"
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            value={node.size1}
            onChange={(e) => onUpdate("size1", e.target.value)}
            placeholder="0.0"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Размер 2 (мм)
          </label>
          <input
            type="text"
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            value={node.size2}
            onChange={(e) => onUpdate("size2", e.target.value)}
            placeholder="0.0"
          />
        </div>
      </div>

      {/* Характеристики */}
      <div className="space-y-3">
        <ButtonSelect
          label="Эхогенность"
          value={node.echogenicity}
          onChange={(val) => onUpdate("echogenicity", val)}
          options={[
            { value: "анэхогенный", label: "анэхогенный" },
            { value: "гиперэхогенный", label: "гиперэхогенный" },
            { value: "изоэхогенный", label: "изоэхогенный" },
            { value: "гипоэхогенный", label: "гипоэхогенный" },
            { value: "выраженно гипоэхогенный", label: "выраженно гипоэхогенный" },
          ]}
        />

        <ButtonSelect
          label="Эхоструктура"
          value={node.echostructure}
          onChange={(val) => onUpdate("echostructure", val)}
          options={[
            { value: "кистозный", label: "кистозный" },
            { value: "спонгиозный", label: "спонгиозный" },
            { value: "кистозно-солидная", label: "кистозно-солидная" },
            { value: "преимущественно солидный", label: "преимущественно солидный" },
            { value: "солидный", label: "солидный" },
          ]}
        />

        <ButtonSelect
          label="Контур"
          value={node.contour}
          onChange={(val) => onUpdate("contour", val)}
          options={[
            { value: "четкий ровный", label: "четкий ровный" },
            { value: "не четкий", label: "не четкий" },
            { value: "не ровный", label: "не ровный" },
            {
              value: "экстра-тиреоидальное распространение",
              label: "экстра-тиреоидальное распространение",
            },
          ]}
        />

        <ButtonSelect
          label="Эхогенные фокусы"
          value={node.echogenicFoci}
          onChange={(val) => onUpdate("echogenicFoci", val)}
          options={[
            { value: "нет", label: "нет" },
            { value: "артефакт хвоста кометы", label: "артефакт хвоста кометы" },
            { value: "макрокальцинаты", label: "макрокальцинаты" },
            {
              value: "периферические кальцинаты",
              label: "периферические кальцинаты",
            },
            { value: "микрокальцинаты", label: "микрокальцинаты" },
          ]}
        />

        <ButtonSelect
          label="Ориентация"
          value={node.orientation}
          onChange={(val) => onUpdate("orientation", val)}
          options={[
            { value: "горизонтальная", label: "горизонтальная" },
            { value: "вертикальная", label: "вертикальная" },
          ]}
        />

        <ButtonSelect
          label="Кровоток"
          value={node.bloodFlow}
          onChange={(val) => onUpdate("bloodFlow", val)}
          options={[
            { value: "не изменен", label: "не изменен" },
            { value: "усилен", label: "усилен" },
            { value: "обеднен", label: "обеднен" },
          ]}
        />

        {allSelected && tiradsText && (
          <p className="text-sm font-semibold text-slate-800 mt-2">
            {tiradsText}
          </p>
        )}
      </div>

      {/* Комментарий */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Комментарий
        </label>
        <textarea
          className="w-full px-4 py-2.5 border border-slate-300 rounded-lg transition-all resize-none focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
          rows={3}
          value={node.comment}
          onChange={(e) => onUpdate("comment", e.target.value)}
          placeholder="Дополнительные заметки..."
        />
      </div>
    </div>
  );
};

export default ThyroidNodeComponent;
