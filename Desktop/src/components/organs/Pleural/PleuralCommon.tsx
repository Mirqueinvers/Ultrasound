// src/components/organs/Pleural/PleuralCommon.tsx
import React from "react";
import { ResearchSectionCard } from "@/UI/ResearchSectionCard";
import { useFormState } from "@hooks";
import { PleuralSide } from "./PleuralSide";
import type {
  PleuralProtocol,
  PleuralCommonProps,
  PleuralSideProtocol,
} from "@/types/organs/pleural";
import { defaultPleuralState } from "@/types";
import { SECTION_KEYS } from "@/domain/sectionKeys";

export const PleuralCommon: React.FC<PleuralCommonProps> = ({
  value,
  onChange,
  sectionRefs,
}) => {
  const [form, setForm] = useFormState<PleuralProtocol>(
    value ?? defaultPleuralState
  );

  const handleSideChange =
    (side: "right" | "left") => (nextValue: PleuralSideProtocol) => {
      const draft = {
        ...form,
        [side === "right" ? "rightSide" : "leftSide"]: nextValue,
      };
      setForm(draft);
      onChange?.(draft);
    };

  return (
    <div className="flex flex-col gap-6">
      <div ref={sectionRefs?.[SECTION_KEYS.PLEURAL_RIGHT]}>
        <ResearchSectionCard
          title="Правая плевральная полость"
          >
          <PleuralSide
            side="right"
            value={form.rightSide}
            onChange={handleSideChange("right")}
          />
        </ResearchSectionCard>
      </div>

      <div ref={sectionRefs?.[SECTION_KEYS.PLEURAL_LEFT]}>
        <ResearchSectionCard
          title="Левая плевральная полость"
          >
          <PleuralSide
            side="left"
            value={form.leftSide}
            onChange={handleSideChange("left")}
          />
        </ResearchSectionCard>
      </div>
    </div>
  );
};

export default PleuralCommon;
