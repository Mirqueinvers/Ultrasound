// Frontend/src/components/organs/Thyroid.tsx
import React, { useState } from "react";
import ThyroidCommon from "@organs/Thyroid/ThyroidCommon";
import { Conclusion } from "@common";
import { useResearch } from "@contexts";
import type {
  ThyroidStudyProtocol,
  ThyroidStudyProps,
  ThyroidProtocol,
} from "@/types";
import { defaultThyroidStudyState } from "@/types";
import type { SectionKey } from "@components/common/OrgNavigation";

type ThyroidSectionKey = Extract<
  SectionKey,
  | "Щитовидная железа:правая доля"
  | "Щитовидная железа:левая доля"
>;

interface ThyroidWithSectionsProps extends ThyroidStudyProps {
  sectionRefs?: Record<
    ThyroidSectionKey,
    React.RefObject<HTMLDivElement | null>
  >;
}

export const Thyroid: React.FC<ThyroidWithSectionsProps> = ({
  value,
  onChange,
  sectionRefs,
}) => {
  const [form, setForm] = useState<ThyroidStudyProtocol>(
    value ?? defaultThyroidStudyState
  );

  const { setStudyData } = useResearch();

  const sync = (updated: ThyroidStudyProtocol) => {
    setForm(updated);
    setStudyData("Щитовидная железа", updated);
    onChange?.(updated);
  };

  const updateThyroid = (thyroidData: ThyroidProtocol) => {
    sync({ ...form, thyroid: thyroidData });
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

  return (
    <div className="flex flex-col gap-6">
      <div className="text-2xl font-semibold text-center mt-2 mb-4">
        Ультразвуковое исследование щитовидной железы
      </div>

      <ThyroidCommon
        value={form.thyroid ?? undefined}
        onChange={updateThyroid}
        sectionRefs={sectionRefs}
      />

      <Conclusion
        value={{
          conclusion: form.conclusion,
          recommendations: form.recommendations,
        }}
        onChange={updateConclusion}
      />
    </div>
  );
};

export default Thyroid;
