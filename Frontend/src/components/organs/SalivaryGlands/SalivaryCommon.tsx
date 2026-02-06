// src/components/organs/SalivaryGlands/SalivaryCommon.tsx
import React, { useEffect } from "react";
import { Fieldset, ButtonSelect } from "@/UI";
import { ResearchSectionCard } from "@/UI/ResearchSectionCard";
import { useFormState, useFieldUpdate } from "@/hooks";
import { SalivaryGland } from "./SalivaryGland";
import type { 
  SalivaryGlandsProtocol, 
  SalivaryCommonProps 
} from "@/types/organs/salivaryGlands";
import { defaultSalivaryGlandsState } from "@/types";

export const SalivaryCommon: React.FC<SalivaryCommonProps> = ({
  value,
  onChange,
  sectionRefs,
}) => {
  const [form, setForm] = useFormState<SalivaryGlandsProtocol>(
    value ?? defaultSalivaryGlandsState
  );
  const updateField = useFieldUpdate(form, setForm, onChange);

  const handleGlandChange =
    (gland: "parotidRight" | "parotidLeft" | "submandibularRight" | "submandibularLeft") => 
    (value: any) => {
      const draft = {
        ...form,
        [gland]: value,
      };
      setForm(draft);
      onChange?.(draft);
    };

  return (
    <div className="flex flex-col gap-6">
      {/* Правая околоушная слюнная железа */}
      <div ref={sectionRefs?.["Слюнные железы:околоушная правая"]}>
        <ResearchSectionCard
          title="Правая околоушная слюнная железа"
          headerClassName="bg-cyan-500"
        >
          <SalivaryGland
            gland="parotidRight"
            value={form.parotidRight}
            onChange={handleGlandChange("parotidRight")}
          />
        </ResearchSectionCard>
      </div>

      {/* Левая околоушная слюнная железа */}
      <div ref={sectionRefs?.["Слюнные железы:околоушная левая"]}>
        <ResearchSectionCard
          title="Левая околоушная слюнная железа"
          headerClassName="bg-cyan-500"
        >
          <SalivaryGland
            gland="parotidLeft"
            value={form.parotidLeft}
            onChange={handleGlandChange("parotidLeft")}
          />
        </ResearchSectionCard>
      </div>

      {/* Правая подчелюстная слюнная железа */}
      <div ref={sectionRefs?.["Слюнные железы:подчелюстная правая"]}>
        <ResearchSectionCard
          title="Правая подчелюстная слюнная железа"
          headerClassName="bg-cyan-500"
        >
          <SalivaryGland
            gland="submandibularRight"
            value={form.submandibularRight}
            onChange={handleGlandChange("submandibularRight")}
          />
        </ResearchSectionCard>
      </div>

      {/* Левая подчелюстная слюнная железа */}
      <div ref={sectionRefs?.["Слюнные железы:подчелюстная левая"]}>
        <ResearchSectionCard
          title="Левая подчелюстная слюнная железа"
          headerClassName="bg-cyan-500"
        >
          <SalivaryGland
            gland="submandibularLeft"
            value={form.submandibularLeft}
            onChange={handleGlandChange("submandibularLeft")}
          />
        </ResearchSectionCard>
      </div>

      {/* Подъязычные слюнные железы */}
      <div ref={sectionRefs?.["Слюнные железы:подъязычная"]}>
        <ResearchSectionCard
          title="Подъязычные слюнные железы"
          headerClassName="bg-cyan-500"
        >
          <Fieldset title="">
            <div className="space-y-4">
              <ButtonSelect
                label="Подъязычные слюнные железы"
                value={form.sublingual}
                onChange={(val) => updateField("sublingual", val)}
                options={[
                  { value: "обычных размеров, обычной структуры", label: "обычных размеров, обычной структуры" },
                  { value: "увеличены", label: "увеличены" },
                  { value: "асимметрично увеличены", label: "асимметрично увеличены" },
                  { value: "с уплотнениями", label: "с уплотнениями" },
                  { value: "не дифференцируются", label: "не дифференцируются" },
                ]}
              />
            </div>
          </Fieldset>
        </ResearchSectionCard>
      </div>

      {/* Регионарные лимфоузлы и общие находки */}
      <ResearchSectionCard
        title="Регионарные лимфоузлы и общие находки"
        headerClassName="bg-cyan-500"
      >
        <Fieldset title="">
          <div className="space-y-4">
            <ButtonSelect
              label="Регионарные лимфоузлы"
              value={form.lymphNodes}
              onChange={(val) => updateField("lymphNodes", val)}
              options={[
                { value: "не увеличены", label: "не увеличены" },
                { value: "единичные увеличены", label: "единичные увеличены" },
                { value: "множественные увеличены", label: "множественные увеличены" },
                { value: "значительно увеличены", label: "значительно увеличены" },
              ]}
            />

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Общие находки
              </label>
              <textarea
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                rows={4}
                value={form.overallFindings}
                onChange={(e) => updateField("overallFindings", e.target.value)}
                placeholder="Опишите общие находки по исследованию слюнных желез"
              />
            </div>
          </div>
        </Fieldset>
      </ResearchSectionCard>
    </div>
  );
};

export default SalivaryCommon;