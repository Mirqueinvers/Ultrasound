// src/components/organs/BrachioCephalicArteries/BrachioCephalicCommon.tsx
import React from "react";
import { Fieldset } from "@/UI";
import { ResearchSectionCard } from "@/UI/ResearchSectionCard";
import { useFormState, useFieldUpdate } from "@/hooks";
import { Artery } from "./Artery";
import type {
  BrachioCephalicProtocol,
  BrachioCephalicCommonProps,
} from "@/types/organs/brachioCephalicArteries";
import { defaultBrachioCephalicArteriesState } from "@/types";

export const BrachioCephalicCommon: React.FC<BrachioCephalicCommonProps> = ({
  value,
  onChange,
  sectionRefs,
}) => {
  const legacyValue = value as (BrachioCephalicProtocol & { brachiocephalicTrunk?: BrachioCephalicProtocol["brachiocephalicTrunkRight"] }) | undefined;
  const [form, setForm] = useFormState<BrachioCephalicProtocol>(
    {
      ...defaultBrachioCephalicArteriesState,
      ...(value ?? {}),
      brachiocephalicTrunkRight:
        value?.brachiocephalicTrunkRight ??
        legacyValue?.brachiocephalicTrunk ??
        defaultBrachioCephalicArteriesState.brachiocephalicTrunkRight,
      brachiocephalicTrunkLeft:
        value?.brachiocephalicTrunkLeft ??
        legacyValue?.brachiocephalicTrunk ??
        defaultBrachioCephalicArteriesState.brachiocephalicTrunkLeft,
    }
  );
  const updateField = useFieldUpdate(form, setForm, onChange);

  const handleArteryChange =
    (artery: keyof BrachioCephalicProtocol) =>
    (arteryValue: BrachioCephalicProtocol[keyof BrachioCephalicProtocol]) => {
      const draft = {
        ...form,
        [artery]: arteryValue,
      };
      setForm(draft);
      onChange?.(draft);
    };

  return (
    <div className="flex flex-col gap-6">
      <div ref={sectionRefs?.["БЦА:ОСА правая"]}>
        <ResearchSectionCard
          title="Правая общая сонная артерия"
          headerClassName="bg-sky-500"
        >
          <Artery
            artery="commonCarotidRight"
            value={form.commonCarotidRight}
            onChange={handleArteryChange("commonCarotidRight")}
          />
        </ResearchSectionCard>
      </div>

      <ResearchSectionCard title="Каротидный синус: правая" headerClassName="bg-sky-500">
        <Artery
          artery="commonCarotidRight"
          mode="sinus"
          value={form.commonCarotidRight}
          onChange={handleArteryChange("commonCarotidRight")}
        />
      </ResearchSectionCard>

      <div ref={sectionRefs?.["БЦА:ВСА правая"]}>
        <ResearchSectionCard
          title="Правая внутренняя сонная артерия"
          headerClassName="bg-sky-500"
        >
          <Artery
            artery="internalCarotidRight"
            value={form.internalCarotidRight}
            onChange={handleArteryChange("internalCarotidRight")}
            commonCarotidPsv={form.commonCarotidRight.peakSystolicVelocity}
          />
        </ResearchSectionCard>
      </div>

      <div ref={sectionRefs?.["БЦА:НСА правая"]}>
        <ResearchSectionCard
          title="Правая наружная сонная артерия"
          headerClassName="bg-sky-500"
        >
          <Artery
            artery="externalCarotidRight"
            value={form.externalCarotidRight}
            onChange={handleArteryChange("externalCarotidRight")}
          />
        </ResearchSectionCard>
      </div>

      <div ref={sectionRefs?.["БЦА:позвоночная правая"]}>
        <ResearchSectionCard
          title="Правая позвоночная артерия"
          headerClassName="bg-sky-500"
        >
          <Artery
            artery="vertebralRight"
            value={form.vertebralRight}
            onChange={handleArteryChange("vertebralRight")}
          />
        </ResearchSectionCard>
      </div>

      <div ref={sectionRefs?.["БЦА:подключичная правая"]}>
        <ResearchSectionCard title="Правая подключичная артерия" headerClassName="bg-sky-500">
          <Artery
            artery="subclavianRight"
            value={form.subclavianRight}
            onChange={handleArteryChange("subclavianRight")}
          />
        </ResearchSectionCard>
      </div>

      <ResearchSectionCard title="Брахиоцефальный ствол: справа" headerClassName="bg-sky-500">
        <Artery
          artery="brachiocephalicTrunkRight"
          mode="sinus"
          sinusTitle="Брахиоцефальный ствол"
          value={form.brachiocephalicTrunkRight}
          onChange={handleArteryChange("brachiocephalicTrunkRight")}
        />
      </ResearchSectionCard>

      <div ref={sectionRefs?.["БЦА:ОСА левая"]}>
        <ResearchSectionCard
          title="Левая общая сонная артерия"
          headerClassName="bg-sky-500"
        >
          <Artery
            artery="commonCarotidLeft"
            value={form.commonCarotidLeft}
            onChange={handleArteryChange("commonCarotidLeft")}
          />
        </ResearchSectionCard>
      </div>

      <ResearchSectionCard title="Каротидный синус: левая" headerClassName="bg-sky-500">
        <Artery
          artery="commonCarotidLeft"
          mode="sinus"
          value={form.commonCarotidLeft}
          onChange={handleArteryChange("commonCarotidLeft")}
        />
      </ResearchSectionCard>

      <div ref={sectionRefs?.["БЦА:ВСА левая"]}>
        <ResearchSectionCard
          title="Левая внутренняя сонная артерия"
          headerClassName="bg-sky-500"
        >
          <Artery
            artery="internalCarotidLeft"
            value={form.internalCarotidLeft}
            onChange={handleArteryChange("internalCarotidLeft")}
            commonCarotidPsv={form.commonCarotidLeft.peakSystolicVelocity}
          />
        </ResearchSectionCard>
      </div>

      <div ref={sectionRefs?.["БЦА:НСА левая"]}>
        <ResearchSectionCard
          title="Левая наружная сонная артерия"
          headerClassName="bg-sky-500"
        >
          <Artery
            artery="externalCarotidLeft"
            value={form.externalCarotidLeft}
            onChange={handleArteryChange("externalCarotidLeft")}
          />
        </ResearchSectionCard>
      </div>

      <div ref={sectionRefs?.["БЦА:позвоночная левая"]}>
        <ResearchSectionCard
          title="Левая позвоночная артерия"
          headerClassName="bg-sky-500"
        >
          <Artery
            artery="vertebralLeft"
            value={form.vertebralLeft}
            onChange={handleArteryChange("vertebralLeft")}
          />
        </ResearchSectionCard>
      </div>

      <div ref={sectionRefs?.["БЦА:подключичная левая"]}>
        <ResearchSectionCard title="Левая подключичная артерия" headerClassName="bg-sky-500">
          <Artery
            artery="subclavianLeft"
            value={form.subclavianLeft}
            onChange={handleArteryChange("subclavianLeft")}
          />
        </ResearchSectionCard>
      </div>

      <ResearchSectionCard title="Брахиоцефальный ствол: слева" headerClassName="bg-sky-500">
        <Artery
          artery="brachiocephalicTrunkLeft"
          mode="sinus"
          sinusTitle="Брахиоцефальный ствол"
          value={form.brachiocephalicTrunkLeft}
          onChange={handleArteryChange("brachiocephalicTrunkLeft")}
        />
      </ResearchSectionCard>

      <ResearchSectionCard
        title="Общие находки по исследованию БЦА"
        headerClassName="bg-sky-500"
      >
        <Fieldset title="">
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Общие находки
            </label>
            <textarea
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm transition-all focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              rows={4}
              value={form.overallFindings}
              onChange={(e) => updateField("overallFindings", e.target.value)}
              placeholder="Опишите общие находки по исследованию брахиоцефальных артерий"
            />
          </div>
        </Fieldset>
      </ResearchSectionCard>
    </div>
  );
};

export default BrachioCephalicCommon;
