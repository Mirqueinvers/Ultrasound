// Frontend/src/components/researches/LymphNodes.tsx
import React, { useEffect, useState } from "react";
import LymphNodesCommon from "@organs/LymphNodes/LymphNodesCommon";
import { Conclusion } from "@common";
import { useResearch } from "@contexts";
import { useRightPanel } from "@contexts/useRightPanel";
import { useResearchConclusionAddText } from "@hooks";
import type {
  LymphNodesStudyProtocol,
  LymphNodesStudyProps,
  LymphNodesProtocol,
} from "@/types";
import { defaultLymphNodesStudyState } from "@/types";
import type { SectionKey } from "@components/common/OrgNavigation";
import { STUDY_KEYS } from "@/domain/studyKeys";

interface LymphNodesWithSectionsProps extends LymphNodesStudyProps {
  sectionRefs?: Record<SectionKey, React.RefObject<HTMLDivElement | null>>;
}

export const LymphNodes: React.FC<LymphNodesWithSectionsProps> = ({
  value,
  onChange,
  sectionRefs,
}) => {
  const [form, setForm] = useState<LymphNodesStudyProtocol>(
    value ?? defaultLymphNodesStudyState,
  );

  useEffect(() => {
    setForm(value ?? defaultLymphNodesStudyState);
  }, [value]);

  const { setStudyData } = useResearch();
  const { showConclusionSamples, setCurrentOrgan } = useRightPanel();

  const sync = (updated: LymphNodesStudyProtocol) => {
    setForm(updated);
    setStudyData(STUDY_KEYS.LYMPH_NODES, updated);
    onChange?.(updated);
  };

  const updateLymphNodes = (lymphNodesData: LymphNodesProtocol) => {
    sync({ ...form, lymphNodes: lymphNodesData });
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
    showConclusionSamples("lymphNodes");
    setCurrentOrgan("lymphNodes");
  };

  useResearchConclusionAddText("study-lymphNodes", STUDY_KEYS.LYMPH_NODES, form, setForm, onChange);

  return (
    <div className="flex flex-col gap-6">
      <div className="text-2xl font-semibold text-center mt-2 mb-4">
        Ультразвуковое исследование периферических лимфатических узлов
      </div>

      <LymphNodesCommon
        value={form.lymphNodes ?? undefined}
        onChange={updateLymphNodes}
        sectionRefs={sectionRefs}
      />

      <Conclusion
        value={{
          conclusion: form.conclusion,
          recommendations: form.recommendations,
        }}
        onChange={updateConclusion}
        onConclusionFocus={handleConclusionFocus}
      />
    </div>
  );
};

export default LymphNodes;
