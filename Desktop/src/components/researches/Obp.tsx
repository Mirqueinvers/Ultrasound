// src/components/researches/Obp.tsx
import React, { useState, useEffect, useCallback } from "react";

import Hepat from "@organs/Hepat";
import Gallbladder from "@/components/organs/Gallbladder/Gallbladder";
import Pancreas from "@organs/Pancreas";
import Spleen from "@organs/Spleen";
import { Conclusion } from "@common";
import { useResearch } from "@contexts";
import { useResearchConclusionAddText } from "@hooks";
import { SelectWithTextarea } from "@/UI";

import type {
  ObpProtocol,
  ObpProps,
  LiverProtocol,
  GallbladderProtocol,
  PancreasProtocol,
  SpleenProtocol,
} from "@/types";
import { defaultObpState } from "@/types";

import type { SectionKey } from "@components/common/OrgNavigation";
import { useRightPanel } from "@contexts/RightPanelContext";

const FREE_FLUID_OPTIONS = [
  { value: "не определяется", label: "не определяется" },
  { value: "определяется", label: "определяется" },
];

interface ObpWithSectionsProps extends ObpProps {
  sectionRefs?: Record<SectionKey, React.RefObject<HTMLDivElement | null>>;
}

export const Obp: React.FC<ObpWithSectionsProps> = ({
  value,
  onChange,
  sectionRefs,
}) => {
  /**
   * Слияние двух массивов узлов по индексу: source-значения имеют приоритет,
   * но только если поле в source не пустое. Аналог ResearchContext.mergeNodeArrays.
   */
  const mergeNodeArrays = useCallback((target: unknown[], source: unknown[]): unknown[] => {
    return target.map((existingNode, i) => {
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
  }, []);

  // Глубокое слияние — мержит вложенные объекты, а не заменяет целиком
  const deepMerge = useCallback((target: unknown, source: unknown): unknown => {
    if (source === null || source === undefined) return target;
    if (target === null || target === undefined) return source;
    if (typeof target !== "object" || typeof source !== "object") return source;
    if (Array.isArray(target) && Array.isArray(source)) {
      // Если оба массива — сливаем по индексу для массивов с полем "number"
      if (source.length > 0 && typeof source[0] === "object" && "number" in (source[0] as Record<string, unknown>)) {
        return mergeNodeArrays(target, source);
      }
      return source;
    }
    if (Array.isArray(target) || Array.isArray(source)) return source;

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
    return result;
  }, [mergeNodeArrays]);

  const initialValue = value ?? defaultObpState;
  const [form, setForm] = useState<ObpProtocol>(initialValue);
  const { setStudyData } = useResearch();
  const { showConclusionSamples, setCurrentOrgan } = useRightPanel();

  useEffect(() => {
    if (value) {
      setForm((prev) => deepMerge(prev, value) as ObpProtocol);
    }
  }, [value, deepMerge]);

  const sync = (updated: ObpProtocol) => {
    setForm(updated);
    setStudyData("ОБП", updated);
    onChange?.(updated);
  };

  const updateLiver = (liverData: LiverProtocol) => {
    sync({ ...form, liver: liverData });
  };

  const updateGallbladder = (gallbladderData: GallbladderProtocol) => {
    sync({ ...form, gallbladder: gallbladderData });
  };

  const updatePancreas = (pancreasData: PancreasProtocol) => {
    sync({ ...form, pancreas: pancreasData });
  };

  const updateSpleen = (spleenData: SpleenProtocol) => {
    sync({ ...form, spleen: spleenData });
  };

  const updateFreeFluidSelect = (val: string) => {
    sync({ ...form, freeFluid: val });
  };

  const updateFreeFluidDetails = (val: string) => {
    sync({ ...form, freeFluidDetails: val });
  };

  const updateConclusion = (conclusionData: {
    conclusion: string;
    recommendations: string;
  }) => {
    sync({
      ...form,
      conclusion: conclusionData.conclusion,
      recommendations: conclusionData.recommendations,
    });
  };

  const handleConclusionFocus = () => {
    showConclusionSamples("obp");
    setCurrentOrgan("obp");
  };

  // Обработка добавления текста образца заключения
  useResearchConclusionAddText('study-obp', 'ОБП', form, setForm, onChange);

  const handleConclusionBlur = () => {
    // если нужно скрывать панель после выхода из поля, раскомментируй
    // hidePanel();
  };



  return (
    <div className="flex flex-col gap-6">
      <div className="text-2xl font-semibold text-center mt-2 mb-4">
        Ультразвуковое исследование органов брюшной полости
      </div>

      <div ref={sectionRefs?.["ОБП:печень"]}>
        <Hepat value={form.liver ?? undefined} onChange={updateLiver} />
      </div>

      <div ref={sectionRefs?.["ОБП:желчный"]}>
        <Gallbladder
          value={form.gallbladder ?? undefined}
          onChange={updateGallbladder}
        />
      </div>

      <div ref={sectionRefs?.["ОБП:поджелудочная"]}>
        <Pancreas
          value={form.pancreas ?? undefined}
          onChange={updatePancreas}
        />
      </div>

      <div ref={sectionRefs?.["ОБП:селезёнка"]}>
        <Spleen value={form.spleen ?? undefined} onChange={updateSpleen} />
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl px-6 py-4">
        <SelectWithTextarea
          label="Свободная жидкость в брюшной полости"
          selectValue={form.freeFluid ?? ""}
          textareaValue={form.freeFluidDetails ?? ""}
          onSelectChange={updateFreeFluidSelect}
          onTextareaChange={updateFreeFluidDetails}
          options={FREE_FLUID_OPTIONS}
          triggerValue="определяется"
          textareaLabel="Описание свободной жидкости"
          rows={3}
        />
      </div>

      <Conclusion
        value={{
          conclusion: form.conclusion,
          recommendations: form.recommendations,
        }}
        onChange={updateConclusion}
        onConclusionFocus={handleConclusionFocus}
        onConclusionBlur={handleConclusionBlur}
      />
    </div>
  );
};

export default Obp;
