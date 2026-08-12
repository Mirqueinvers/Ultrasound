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
import { SECTION_KEYS } from "@/domain/sectionKeys";

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

  const handleGlandChange =
    (gland: SalivaryGlandKey) => (updatedGland: unknown) => {
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
        ref={sectionRefs?.[SECTION_KEYS.SALIVARY_RIGHT_PAROTID]}
        data-section-key={SECTION_KEYS.SALIVARY_RIGHT_PAROTID}
      >
        <ResearchSectionCard
          title="Правая околоушная слюнная железа"
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
        ref={sectionRefs?.[SECTION_KEYS.SALIVARY_LEFT_PAROTID]}
        data-section-key={SECTION_KEYS.SALIVARY_LEFT_PAROTID}
      >
        <ResearchSectionCard
          title="Левая околоушная слюнная железа"
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
        ref={sectionRefs?.[SECTION_KEYS.SALIVARY_RIGHT_SUBMANDIBULAR]}
        data-section-key={SECTION_KEYS.SALIVARY_RIGHT_SUBMANDIBULAR}
      >
        <ResearchSectionCard
          title="Правая подчелюстная слюнная железа"
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
        ref={sectionRefs?.[SECTION_KEYS.SALIVARY_LEFT_SUBMANDIBULAR]}
        data-section-key={SECTION_KEYS.SALIVARY_LEFT_SUBMANDIBULAR}
      >
        <ResearchSectionCard
          title="Левая подчелюстная слюнная железа"
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
        ref={sectionRefs?.[SECTION_KEYS.SALIVARY_RIGHT_SUBLINGUAL]}
        data-section-key={SECTION_KEYS.SALIVARY_RIGHT_SUBLINGUAL}
      >
        <ResearchSectionCard
          title="Правая подъязычная слюнная железа"
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
        ref={sectionRefs?.[SECTION_KEYS.SALIVARY_LEFT_SUBLINGUAL]}
        data-section-key={SECTION_KEYS.SALIVARY_LEFT_SUBLINGUAL}
      >
        <ResearchSectionCard
          title="Левая подъязычная слюнная железа"
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
