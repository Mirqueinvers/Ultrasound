// src/components/organs/LowerExtremityVeins/LowerExtremityVeinsCommon.tsx
import React from "react";
import { Fieldset } from "@/UI";
import { ResearchSectionCard } from "@/UI/ResearchSectionCard";
import { useFormState, useFieldUpdate } from "@/hooks";
import { DeepVein } from "./DeepVein";
import { SuperficialVein } from "./SuperficialVein";
import type {
  LowerExtremityVeinsProtocol,
  LowerExtremityVeinsCommonProps,
  LowerExtremityVeinsSectionKey,
  DeepVeinProtocol,
  SuperficialVeinProtocol,
} from "@/types/organs/lowerExtremityVeins";
import { defaultLowerExtremityVeinsState } from "@/types";
import { SECTION_KEYS } from "@/domain/sectionKeys";

type DeepVeinKey = "femoral" | "popliteal" | "posteriorTibial" | "anteriorTibial";
type SuperficialVeinKey = "greatSaphenous" | "smallSaphenous";

const DEEP_VEIN_SECTION_KEYS: Record<"right" | "left", Record<DeepVeinKey, LowerExtremityVeinsSectionKey>> = {
  right: {
    femoral: SECTION_KEYS.LEV_RIGHT_FEMORAL,
    popliteal: SECTION_KEYS.LEV_RIGHT_POPLITEAL,
    posteriorTibial: SECTION_KEYS.LEV_RIGHT_TIBIAL,
    anteriorTibial: SECTION_KEYS.LEV_RIGHT_TIBIAL,
  },
  left: {
    femoral: SECTION_KEYS.LEV_LEFT_FEMORAL,
    popliteal: SECTION_KEYS.LEV_LEFT_POPLITEAL,
    posteriorTibial: SECTION_KEYS.LEV_LEFT_TIBIAL,
    anteriorTibial: SECTION_KEYS.LEV_LEFT_TIBIAL,
  },
};

const SUPERFICIAL_VEIN_SECTION_KEYS: Record<"right" | "left", Record<SuperficialVeinKey, LowerExtremityVeinsSectionKey>> = {
  right: {
    greatSaphenous: SECTION_KEYS.LEV_RIGHT_PV,
    smallSaphenous: SECTION_KEYS.LEV_RIGHT_MV,
  },
  left: {
    greatSaphenous: SECTION_KEYS.LEV_LEFT_PV,
    smallSaphenous: SECTION_KEYS.LEV_LEFT_MV,
  },
};

export const LowerExtremityVeinsCommon: React.FC<LowerExtremityVeinsCommonProps> = ({
  value,
  onChange,
  sectionRefs,
}) => {
  const [form, setForm] = useFormState<LowerExtremityVeinsProtocol>(
    value ?? defaultLowerExtremityVeinsState
  );
  const updateField = useFieldUpdate(form, setForm, onChange);

  const handleDeepVeinChange =
    (side: "right" | "left", vein: DeepVeinKey) =>
    (value: DeepVeinProtocol) => {
      const draft = {
        ...form,
        [side === "right" ? "rightDeepVeins" : "leftDeepVeins"]: {
          ...form[side === "right" ? "rightDeepVeins" : "leftDeepVeins"],
          [vein]: value,
        },
      };
      setForm(draft);
      onChange?.(draft);
    };

  const handleSuperficialVeinChange =
    (side: "right" | "left", vein: SuperficialVeinKey) =>
    (value: SuperficialVeinProtocol) => {
      const draft = {
        ...form,
        [side === "right" ? "rightSuperficialVeins" : "leftSuperficialVeins"]: {
          ...form[side === "right" ? "rightSuperficialVeins" : "leftSuperficialVeins"],
          [vein]: value,
        },
      };
      setForm(draft);
      onChange?.(draft);
    };

  return (
    <div className="flex flex-col gap-6">
      {/* Глубокие вены - правая нога */}
      <div ref={sectionRefs?.[DEEP_VEIN_SECTION_KEYS.right.femoral]}>
        <ResearchSectionCard
          title="Глубокие вены правой нижней конечности"
          >
          <div className="space-y-6">
            <DeepVein
              vein="femoral"
              side="right"
              value={form.rightDeepVeins.femoral}
              onChange={handleDeepVeinChange("right", "femoral")}
            />
          </div>
        </ResearchSectionCard>
      </div>

      <div ref={sectionRefs?.[DEEP_VEIN_SECTION_KEYS.right.popliteal]}>
        <ResearchSectionCard
          title=""
          >
          <div className="space-y-6">
            <DeepVein
              vein="popliteal"
              side="right"
              value={form.rightDeepVeins.popliteal}
              onChange={handleDeepVeinChange("right", "popliteal")}
            />
          </div>
        </ResearchSectionCard>
      </div>

      <div ref={sectionRefs?.[DEEP_VEIN_SECTION_KEYS.right.posteriorTibial]}>
        <ResearchSectionCard
          title=""
          >
          <div className="space-y-6">
            <DeepVein
              vein="posteriorTibial"
              side="right"
              value={form.rightDeepVeins.posteriorTibial}
              onChange={handleDeepVeinChange("right", "posteriorTibial")}
            />
          </div>
        </ResearchSectionCard>
      </div>

      {/* Глубокие вены - левая нога */}
      <div ref={sectionRefs?.[DEEP_VEIN_SECTION_KEYS.left.femoral]}>
        <ResearchSectionCard
          title="Глубокие вены левой нижней конечности"
          >
          <div className="space-y-6">
            <DeepVein
              vein="femoral"
              side="left"
              value={form.leftDeepVeins.femoral}
              onChange={handleDeepVeinChange("left", "femoral")}
            />
          </div>
        </ResearchSectionCard>
      </div>

      <div ref={sectionRefs?.[DEEP_VEIN_SECTION_KEYS.left.popliteal]}>
        <ResearchSectionCard
          title=""
          >
          <div className="space-y-6">
            <DeepVein
              vein="popliteal"
              side="left"
              value={form.leftDeepVeins.popliteal}
              onChange={handleDeepVeinChange("left", "popliteal")}
            />
          </div>
        </ResearchSectionCard>
      </div>

      <div ref={sectionRefs?.[DEEP_VEIN_SECTION_KEYS.left.posteriorTibial]}>
        <ResearchSectionCard
          title=""
          >
          <div className="space-y-6">
            <DeepVein
              vein="posteriorTibial"
              side="left"
              value={form.leftDeepVeins.posteriorTibial}
              onChange={handleDeepVeinChange("left", "posteriorTibial")}
            />
          </div>
        </ResearchSectionCard>
      </div>

      {/* Поверхностные вены - правая нога */}
      <div ref={sectionRefs?.[SUPERFICIAL_VEIN_SECTION_KEYS.right.greatSaphenous]}>
        <ResearchSectionCard
          title="Поверхностные вены правой нижней конечности"
          >
          <div className="space-y-6">
            <SuperficialVein
              vein="greatSaphenous"
              side="right"
              value={form.rightSuperficialVeins.greatSaphenous}
              onChange={handleSuperficialVeinChange("right", "greatSaphenous")}
            />
          </div>
        </ResearchSectionCard>
      </div>

      <div ref={sectionRefs?.[SUPERFICIAL_VEIN_SECTION_KEYS.right.smallSaphenous]}>
        <ResearchSectionCard
          title=""
          >
          <div className="space-y-6">
            <SuperficialVein
              vein="smallSaphenous"
              side="right"
              value={form.rightSuperficialVeins.smallSaphenous}
              onChange={handleSuperficialVeinChange("right", "smallSaphenous")}
            />
          </div>
        </ResearchSectionCard>
      </div>

      {/* Поверхностные вены - левая нога */}
      <div ref={sectionRefs?.[SUPERFICIAL_VEIN_SECTION_KEYS.left.greatSaphenous]}>
        <ResearchSectionCard
          title="Поверхностные вены левой нижней конечности"
          >
          <div className="space-y-6">
            <SuperficialVein
              vein="greatSaphenous"
              side="left"
              value={form.leftSuperficialVeins.greatSaphenous}
              onChange={handleSuperficialVeinChange("left", "greatSaphenous")}
            />
          </div>
        </ResearchSectionCard>
      </div>

      <div ref={sectionRefs?.[SUPERFICIAL_VEIN_SECTION_KEYS.left.smallSaphenous]}>
        <ResearchSectionCard
          title=""
          >
          <div className="space-y-6">
            <SuperficialVein
              vein="smallSaphenous"
              side="left"
              value={form.leftSuperficialVeins.smallSaphenous}
              onChange={handleSuperficialVeinChange("left", "smallSaphenous")}
            />
          </div>
        </ResearchSectionCard>
      </div>

      {/* Общие находки */}
      <ResearchSectionCard
        title="Общие находки по исследованию вен нижних конечностей"
        >
        <Fieldset title="">
          <div className="space-y-4">
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Общие находки
              </label>
              <textarea
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                rows={4}
                value={form.overallFindings}
                onChange={(e) => updateField("overallFindings", e.target.value)}
                placeholder="Опишите общие находки по исследованию вен нижних конечностей"
              />
            </div>
          </div>
        </Fieldset>
      </ResearchSectionCard>
    </div>
  );
};

export default LowerExtremityVeinsCommon;
