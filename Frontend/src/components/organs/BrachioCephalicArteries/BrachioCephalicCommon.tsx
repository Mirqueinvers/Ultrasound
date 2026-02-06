// src/components/organs/BrachioCephalicArteries/BrachioCephalicCommon.tsx
import React, { useEffect } from "react";
import { Fieldset, ButtonSelect } from "@/UI";
import { ResearchSectionCard } from "@/UI/ResearchSectionCard";
import { useFormState, useFieldUpdate } from "@/hooks";
import { Artery } from "./Artery";
import type { 
  BrachioCephalicProtocol, 
  BrachioCephalicCommonProps 
} from "@/types/organs/brachioCephalicArteries";
import { defaultBrachioCephalicArteriesState } from "@/types";

export const BrachioCephalicCommon: React.FC<BrachioCephalicCommonProps> = ({
  value,
  onChange,
  sectionRefs,
}) => {
  const [form, setForm] = useFormState<BrachioCephalicProtocol>(
    value ?? defaultBrachioCephalicArteriesState
  );
  const updateField = useFieldUpdate(form, setForm, onChange);

  const handleArteryChange =
    (artery: keyof BrachioCephalicProtocol) => 
    (value: any) => {
      const draft = {
        ...form,
        [artery]: value,
      };
      setForm(draft);
      onChange?.(draft);
    };

  return (
    <div className="flex flex-col gap-6">
      {/* Общие сонные артерии */}
      <div ref={sectionRefs?.["БЦА:ОСА правая"]}>
        <ResearchSectionCard
          title="Правая общая сонная артерия"
          headerClassName="bg-red-500"
        >
          <Artery
            artery="commonCarotidRight"
            value={form.commonCarotidRight}
            onChange={handleArteryChange("commonCarotidRight")}
          />
        </ResearchSectionCard>
      </div>

      <div ref={sectionRefs?.["БЦА:ОСА левая"]}>
        <ResearchSectionCard
          title="Левая общая сонная артерия"
          headerClassName="bg-red-500"
        >
          <Artery
            artery="commonCarotidLeft"
            value={form.commonCarotidLeft}
            onChange={handleArteryChange("commonCarotidLeft")}
          />
        </ResearchSectionCard>
      </div>

      {/* Внутренние сонные артерии */}
      <div ref={sectionRefs?.["БЦА:ВСА правая"]}>
        <ResearchSectionCard
          title="Правая внутренняя сонная артерия"
          headerClassName="bg-red-500"
        >
          <Artery
            artery="internalCarotidRight"
            value={form.internalCarotidRight}
            onChange={handleArteryChange("internalCarotidRight")}
          />
        </ResearchSectionCard>
      </div>

      <div ref={sectionRefs?.["БЦА:ВСА левая"]}>
        <ResearchSectionCard
          title="Левая внутренняя сонная артерия"
          headerClassName="bg-red-500"
        >
          <Artery
            artery="internalCarotidLeft"
            value={form.internalCarotidLeft}
            onChange={handleArteryChange("internalCarotidLeft")}
          />
        </ResearchSectionCard>
      </div>

      {/* Наружные сонные артерии */}
      <div ref={sectionRefs?.["БЦА:НСА правая"]}>
        <ResearchSectionCard
          title="Правая наружная сонная артерия"
          headerClassName="bg-red-500"
        >
          <Artery
            artery="externalCarotidRight"
            value={form.externalCarotidRight}
            onChange={handleArteryChange("externalCarotidRight")}
          />
        </ResearchSectionCard>
      </div>

      <div ref={sectionRefs?.["БЦА:НСА левая"]}>
        <ResearchSectionCard
          title="Левая наружная сонная артерия"
          headerClassName="bg-red-500"
        >
          <Artery
            artery="externalCarotidLeft"
            value={form.externalCarotidLeft}
            onChange={handleArteryChange("externalCarotidLeft")}
          />
        </ResearchSectionCard>
      </div>

      {/* Позвоночные артерии */}
      <div ref={sectionRefs?.["БЦА:позвоночная правая"]}>
        <ResearchSectionCard
          title="Правая позвоночная артерия"
          headerClassName="bg-red-500"
        >
          <Artery
            artery="vertebralRight"
            value={form.vertebralRight}
            onChange={handleArteryChange("vertebralRight")}
          />
        </ResearchSectionCard>
      </div>

      <div ref={sectionRefs?.["БЦА:позвоночная левая"]}>
        <ResearchSectionCard
          title="Левая позвоночная артерия"
          headerClassName="bg-red-500"
        >
          <Artery
            artery="vertebralLeft"
            value={form.vertebralLeft}
            onChange={handleArteryChange("vertebralLeft")}
          />
        </ResearchSectionCard>
      </div>

      {/* Подключичные артерии */}
      <div ref={sectionRefs?.["БЦА:подключичная правая"]}>
        <ResearchSectionCard
          title="Правая подключичная артерия"
          headerClassName="bg-red-500"
        >
          <Artery
            artery="subclavianRight"
            value={form.subclavianRight}
            onChange={handleArteryChange("subclavianRight")}
          />
        </ResearchSectionCard>
      </div>

      <div ref={sectionRefs?.["БЦА:подключичная левая"]}>
        <ResearchSectionCard
          title="Левая подключичная артерия"
          headerClassName="bg-red-500"
        >
          <Artery
            artery="subclavianLeft"
            value={form.subclavianLeft}
            onChange={handleArteryChange("subclavianLeft")}
          />
        </ResearchSectionCard>
      </div>

      {/* Общие находки */}
      <ResearchSectionCard
        title="Общие находки по исследованию БЦА"
        headerClassName="bg-red-500"
      >
        <Fieldset title="">
          <div className="space-y-4">
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Общие находки
              </label>
              <textarea
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                rows={4}
                value={form.overallFindings}
                onChange={(e) => updateField("overallFindings", e.target.value)}
                placeholder="Опишите общие находки по исследованию брахиоцефальных артерий"
              />
            </div>
          </div>
        </Fieldset>
      </ResearchSectionCard>
    </div>
  );
};

export default BrachioCephalicCommon;