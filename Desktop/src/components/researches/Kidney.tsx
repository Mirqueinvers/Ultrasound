// Frontend/src/components/researches/Kidney.tsx
import React, { useState, useEffect } from "react";

import KidneyCommon from "@organs/Kidney/KidneyCommon";
import UrinaryBladder from "@organs/UrinaryBladder";
import { Conclusion } from "@common";
import { useRightPanel } from "@contexts/RightPanelContext";
import { useResearch } from "@contexts";
import { useResearchConclusionAddText } from "@hooks";

import type {
  KidneyStudyProtocol,
  KidneyStudyProps,
  KidneyProtocol as KidneyCommonProtocol,
  UrinaryBladderProtocol,
} from "@/types";
import { defaultKidneyStudyState } from "@/types";

import type { SectionKey } from "@components/common/OrgNavigation";

interface KidneyWithSectionsProps extends KidneyStudyProps {
  sectionRefs?: Record<SectionKey, React.RefObject<HTMLDivElement | null>>;
}

/**
 * Слияние двух массивов узлов по индексу: source-значения имеют приоритет,
 * но только если поле в source не пустое. Аналог ResearchContext.mergeNodeArrays.
 */
function mergeNodeArrays(target: unknown[], source: unknown[]): unknown[] {
  const merged = target.map((existingNode, i) => {
    const sourceNode = source[i];
    if (!sourceNode || typeof sourceNode !== "object") return existingNode;
    if (typeof existingNode !== "object") return sourceNode;
    const result = { ...(existingNode as Record<string, unknown>) };
    for (const key of Object.keys(sourceNode as Record<string, unknown>)) {
      const sourceVal = (sourceNode as Record<string, unknown>)[key];
      if (sourceVal !== undefined && sourceVal !== null && sourceVal !== "") {
        result[key] = sourceVal;
      }
    }
    return result;
  }).concat(
    source.slice(target.length).map((n) => (typeof n === "object" ? { ...(n as Record<string, unknown>) } : n)),
  );
  return merged;
}

/**
 * Глубокое рекурсивное слияние объектов.
 * - Вложенные объекты сливаются рекурсивно.
 * - Массивы с числовым полем "number" сливаются по индексу.
 * - Остальные значения из source имеют приоритет над target.
 */
function deepMerge(target: unknown, source: unknown): KidneyStudyProtocol {
  if (source === null || source === undefined) return target as unknown as KidneyStudyProtocol;
  if (target === null || target === undefined) return source as unknown as KidneyStudyProtocol;
  if (typeof target !== "object" || typeof source !== "object") return source as unknown as KidneyStudyProtocol;
  if (Array.isArray(target) && Array.isArray(source)) {
    // Если оба массива — сливаем по индексу для массивов с полем "number"
    if (source.length > 0 && typeof source[0] === "object" && "number" in (source[0] as Record<string, unknown>)) {
      return mergeNodeArrays(target, source) as unknown as KidneyStudyProtocol;
    }
    return source as unknown as KidneyStudyProtocol;
  }
  if (Array.isArray(target) || Array.isArray(source)) return source as unknown as KidneyStudyProtocol;

  const result = { ...(target as Record<string, unknown>) };
  for (const key of Object.keys(source as Record<string, unknown>)) {
    const targetVal = (target as Record<string, unknown>)[key];
    const sourceVal = (source as Record<string, unknown>)[key];
    if (
      targetVal !== null && targetVal !== undefined &&
      typeof targetVal === "object" && !Array.isArray(targetVal) &&
      typeof sourceVal === "object" && !Array.isArray(sourceVal)
    ) {
      result[key] = deepMerge(targetVal, sourceVal);
    } else if (sourceVal !== undefined) {
      result[key] = sourceVal;
    }
  }
  return result as unknown as KidneyStudyProtocol;
}

export const Kidney: React.FC<KidneyWithSectionsProps> = ({
  value,
  onChange,
  sectionRefs,
}) => {
  const [form, setForm] = useState<KidneyStudyProtocol>(
    value ?? defaultKidneyStudyState
  );

  // Глубокое слияние — не затирает уже заполненные поля
  useEffect(() => {
    if (value) {
      setForm((prev) => deepMerge(prev, value));
    }
  }, [value]);

  const { setStudyData } = useResearch();
  const { showConclusionSamples, setCurrentOrgan } = useRightPanel();

  const updateRightKidney = (rightKidneyData: KidneyCommonProtocol) => {
    const updated = { ...form, rightKidney: rightKidneyData };
    setForm(updated);
    onChange?.(updated);
    setStudyData("Почки", updated);
  };

  const updateLeftKidney = (leftKidneyData: KidneyCommonProtocol) => {
    const updated = { ...form, leftKidney: leftKidneyData };
    setForm(updated);
    onChange?.(updated);
    setStudyData("Почки", updated);
  };

  const updateUrinaryBladder = (
    urinaryBladderData: UrinaryBladderProtocol
  ) => {
    const updated = {
      ...form,
      urinaryBladder: urinaryBladderData,
    };
    setForm(updated);
    onChange?.(updated);
    setStudyData("Почки", updated);
  };

  const updateConclusion = (conclusionData: {
    conclusion: string;
    recommendations: string;
  }) => {
    const updated = {
      ...form,
      conclusion: conclusionData.conclusion,
      recommendations: conclusionData.recommendations,
    };
    setForm(updated);
    onChange?.(updated);
    setStudyData("Почки", updated);
  };

  const handleConclusionFocus = () => {
    showConclusionSamples("kidneys");
    setCurrentOrgan("kidneys");
  };

  // Обработка добавления текста образца заключения
  useResearchConclusionAddText('study-kidneys', 'Почки', form, setForm, onChange);

  return (
    <div className="flex flex-col gap-6">
      <div className="text-2xl font-semibold text-center mt-2 mb-4">
        Ультразвуковое исследование почек
      </div>

      <div ref={sectionRefs?.["Почки:правая"]}>
        <KidneyCommon
          side="right"
          value={form.rightKidney ?? undefined}
          onChange={updateRightKidney}
        />
      </div>

      <div ref={sectionRefs?.["Почки:левая"]}>
        <KidneyCommon
          side="left"
          value={form.leftKidney ?? undefined}
          onChange={updateLeftKidney}
        />
      </div>

      <div ref={sectionRefs?.["Почки:мочевой пузырь"]}>
        <UrinaryBladder
          value={form.urinaryBladder ?? undefined}
          onChange={updateUrinaryBladder}
        />
      </div>

      <Conclusion
        value={{
          conclusion: form.conclusion,
          recommendations: form.recommendations,
        }}
        onChange={updateConclusion}
        onConclusionFocus={handleConclusionFocus}
      />
    </div>
  );
};

export default Kidney;