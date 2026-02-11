// src/components/organs/SalivaryGlands/SalivaryCommon.tsx
import React from "react";
import { ResearchSectionCard } from "@/UI/ResearchSectionCard";
import { useFormState } from "@/hooks";
import { SalivaryGland } from "./SalivaryGland";
import type {
  SalivaryGlandsProtocol,
  SalivaryCommonProps,
} from "@/types/organs/salivaryGlands";
import { defaultSalivaryGlandsState } from "@/types";

type SalivaryGlandKey =
  | "parotidRight"
  | "parotidLeft"
  | "submandibularRight"
  | "submandibularLeft"
  | "sublingualRight"
  | "sublingualLeft";

export const SalivaryCommon: React.FC<SalivaryCommonProps> = ({
  value,
  onChange,
  sectionRefs,
}) => {
  const [form, setForm] = useFormState<SalivaryGlandsProtocol>(
    value ?? defaultSalivaryGlandsState
  );

  const handleGlandChange = (gland: SalivaryGlandKey) => (updatedGland: any) => {
    const draft = {
      ...form,
      [gland]: updatedGland,
    };
    setForm(draft);
    onChange?.(draft);
  };

  return (
    <div className="flex flex-col gap-6">
      <div
        ref={sectionRefs?.["Слюнные железы:околоушная правая"]}
        data-section-key="Слюнные железы:околоушная правая"
      >
        <ResearchSectionCard
          title="Правая околоушная слюнная железа"
          headerClassName="bg-cyan-500"
        >
          <SalivaryGland
            gland="parotidRight"
            showDepth={true}
            value={form.parotidRight}
            onChange={handleGlandChange("parotidRight")}
          />
        </ResearchSectionCard>
      </div>

      <div
        ref={sectionRefs?.["Слюнные железы:околоушная левая"]}
        data-section-key="Слюнные железы:околоушная левая"
      >
        <ResearchSectionCard
          title="Левая околоушная слюнная железа"
          headerClassName="bg-cyan-500"
        >
          <SalivaryGland
            gland="parotidLeft"
            showDepth={true}
            value={form.parotidLeft}
            onChange={handleGlandChange("parotidLeft")}
          />
        </ResearchSectionCard>
      </div>

      <div
        ref={sectionRefs?.["Слюнные железы:подчелюстная правая"]}
        data-section-key="Слюнные железы:подчелюстная правая"
      >
        <ResearchSectionCard
          title="Правая подчелюстная слюнная железа"
          headerClassName="bg-cyan-500"
        >
          <SalivaryGland
            gland="submandibularRight"
            showDepth={true}
            value={form.submandibularRight}
            onChange={handleGlandChange("submandibularRight")}
          />
        </ResearchSectionCard>
      </div>

      <div
        ref={sectionRefs?.["Слюнные железы:подчелюстная левая"]}
        data-section-key="Слюнные железы:подчелюстная левая"
      >
        <ResearchSectionCard
          title="Левая подчелюстная слюнная железа"
          headerClassName="bg-cyan-500"
        >
          <SalivaryGland
            gland="submandibularLeft"
            showDepth={true}
            value={form.submandibularLeft}
            onChange={handleGlandChange("submandibularLeft")}
          />
        </ResearchSectionCard>
      </div>

      <div
        ref={sectionRefs?.["Слюнные железы:подъязычная правая"]}
        data-section-key="Слюнные железы:подъязычная правая"
      >
        <ResearchSectionCard
          title="Правая подъязычная слюнная железа"
          headerClassName="bg-cyan-500"
        >
          <SalivaryGland
            gland="sublingualRight"
            showDepth={false}
            value={form.sublingualRight}
            onChange={handleGlandChange("sublingualRight")}
          />
        </ResearchSectionCard>
      </div>

      <div
        ref={sectionRefs?.["Слюнные железы:подъязычная левая"]}
        data-section-key="Слюнные железы:подъязычная левая"
      >
        <ResearchSectionCard
          title="Левая подъязычная слюнная железа"
          headerClassName="bg-cyan-500"
        >
          <SalivaryGland
            gland="sublingualLeft"
            showDepth={false}
            value={form.sublingualLeft}
            onChange={handleGlandChange("sublingualLeft")}
          />
        </ResearchSectionCard>
      </div>
    </div>
  );
};

export default SalivaryCommon;
