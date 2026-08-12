// src/components/researches/Obp.tsx
import React, { useState } from "react";

import Hepat from "@organs/Hepat";
import Gallbladder from "@/features/organs/Gallbladder/Gallbladder";
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
import { useDefaultValues } from "@hooks";

import type { SectionKey } from "@/protocols";
import { useRightPanel } from "@contexts/useRightPanel";
import { deepMerge } from "@/utils/deepMerge";
import { SECTION_KEYS } from "@/domain/sectionKeys";
import { STUDY_KEYS } from "@/domain/studyKeys";

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
  const { defaults, isLoaded } = useDefaultValues();

  const [form, setForm] = useState<ObpProtocol>(value ?? defaultObpState);

  // Паттерн «adjust state during render»: применяем пользовательские дефолты,
  // когда они загружены и внешнего value ещё нет (guard — prevIsLoaded).
  const [prevIsLoaded, setPrevIsLoaded] = useState(isLoaded);
  if (isLoaded && !prevIsLoaded && !value) {
    setPrevIsLoaded(true);
    const merged: ObpProtocol = {
      ...defaultObpState,
      liver: (defaults[SECTION_KEYS.OBP_LIVER] as unknown as LiverProtocol) ?? null,
      gallbladder: (defaults[SECTION_KEYS.OBP_GALLBLADDER] as unknown as GallbladderProtocol) ?? null,
      pancreas: (defaults[SECTION_KEYS.OBP_PANCREAS] as unknown as PancreasProtocol) ?? null,
      spleen: (defaults[SECTION_KEYS.OBP_SPLEEN] as unknown as SpleenProtocol) ?? null,
    };
    setForm(merged);
  }

  // Глубокое слияние при изменении внешнего value (guard — prevValue).
  const [prevValue, setPrevValue] = useState(value);
  if (value !== prevValue) {
    setPrevValue(value);
    if (value) {
      setForm((prev) => deepMerge(prev, value) as ObpProtocol);
    }
  }

  const { setStudyData } = useResearch();
  const { showConclusionSamples, setCurrentOrgan } = useRightPanel();

  const sync = (updated: ObpProtocol) => {
    setForm(updated);
    setStudyData(STUDY_KEYS.OBP, updated);
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
  useResearchConclusionAddText("study-obp", STUDY_KEYS.OBP, form, setForm, onChange);

  const handleConclusionBlur = () => {
    // если нужно скрывать панель после выхода из поля, раскомментируй
    // hidePanel();
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="text-2xl font-semibold text-center mt-2 mb-4">
        Ультразвуковое исследование органов брюшной полости
      </div>

      <div ref={sectionRefs?.[SECTION_KEYS.OBP_LIVER]}>
        <Hepat value={form.liver ?? undefined} onChange={updateLiver} />
      </div>

      <div ref={sectionRefs?.[SECTION_KEYS.OBP_GALLBLADDER]}>
        <Gallbladder
          value={form.gallbladder ?? undefined}
          onChange={updateGallbladder}
        />
      </div>

      <div ref={sectionRefs?.[SECTION_KEYS.OBP_PANCREAS]}>
        <Pancreas
          value={form.pancreas ?? undefined}
          onChange={updatePancreas}
        />
      </div>

      <div ref={sectionRefs?.[SECTION_KEYS.OBP_SPLEEN]}>
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
