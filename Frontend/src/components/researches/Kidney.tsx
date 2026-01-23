// Frontend/src/components/researches/Kidney.tsx
import React, { useState } from "react";

import KidneyCommon from "@organs/Kidney/KidneyCommon";
import UrinaryBladder from "@organs/UrinaryBladder";
import { Conclusion } from "@common";

import type {
  KidneyStudyProtocol,
  KidneyStudyProps,
  KidneyProtocol as KidneyCommonProtocol,
  UrinaryBladderProtocol,
} from "@/types";
import { defaultKidneyStudyState } from "@/types";

import type { SectionKey } from "@components/common/OrgNavigation";

interface KidneyWithSectionsProps extends KidneyStudyProps {
  sectionRefs?: Record<SectionKey, React.RefObject<HTMLDivElement | null>>;
}

export const Kidney: React.FC<KidneyWithSectionsProps> = ({
  value,
  onChange,
  sectionRefs,
}) => {
  const [form, setForm] = useState<KidneyStudyProtocol>(
    value ?? defaultKidneyStudyState
  );

  const updateRightKidney = (rightKidneyData: KidneyCommonProtocol) => {
    const updated = { ...form, rightKidney: rightKidneyData };
    setForm(updated);
    onChange?.(updated);
  };

  const updateLeftKidney = (leftKidneyData: KidneyCommonProtocol) => {
    const updated = { ...form, leftKidney: leftKidneyData };
    setForm(updated);
    onChange?.(updated);
  };

  const updateUrinaryBladder = (
    urinaryBladderData: UrinaryBladderProtocol
  ) => {
    const updated = {
      ...form,
      urinaryBladder: urinaryBladderData,
    };
    setForm(updated);
    onChange?.(updated);
  };

  const updateConclusion = (conclusionData: {
    conclusion: string;
    recommendations: string;
  }) => {
    const updated = {
      ...form,
      conclusion: conclusionData.conclusion,
      recommendations: conclusionData.recommendations,
    };
    setForm(updated);
    onChange?.(updated);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="text-2xl font-semibold text-center mt-2 mb-4">
        Ультразвуковое исследование почек
      </div>

      <div ref={sectionRefs?.["Почки:правая"]}>
        <KidneyCommon
          side="right"
          value={form.rightKidney ?? undefined}
          onChange={updateRightKidney}
        />
      </div>

      <div ref={sectionRefs?.["Почки:левая"]}>
        <KidneyCommon
          side="left"
          value={form.leftKidney ?? undefined}
          onChange={updateLeftKidney}
        />
      </div>

      <div ref={sectionRefs?.["Почки:мочевой пузырь"]}>
        <UrinaryBladder
          value={form.urinaryBladder ?? undefined}
          onChange={updateUrinaryBladder}
        />
      </div>

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

export default Kidney;
