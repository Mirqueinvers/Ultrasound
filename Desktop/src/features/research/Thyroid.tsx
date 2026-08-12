// Frontend/src/components/researches/Thyroid.tsx
import React, { useState } from "react";
import ThyroidCommon from "@organs/Thyroid/ThyroidCommon";
import { Conclusion } from "@common";
import { useResearch } from "@contexts";
import { useRightPanel } from "@contexts/useRightPanel";
import { useResearchConclusionAddText } from "@hooks";
import type {
  ThyroidStudyProtocol,
  ThyroidStudyProps,
  ThyroidProtocol,
  ThyroidLobeProtocol,
} from "@/types";
import { defaultThyroidStudyState } from "@/types";
import { defaultThyroidLobeState } from "@/types/defaultStates/organs/thyroid";
import { useDefaultOrganValues } from "@/utils/defaultsAccess";
import type { SectionKey } from "@/protocols";
import { SECTION_KEYS } from "@/domain/sectionKeys";
import { STUDY_KEYS } from "@/domain/studyKeys";

type ThyroidSectionKey = Extract<
  SectionKey,
  | typeof SECTION_KEYS.THYROID_RIGHT_LOBE
  | typeof SECTION_KEYS.THYROID_LEFT_LOBE
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
  const { isLoaded, getOrganOrDefault } = useDefaultOrganValues();

  const [form, setForm] = useState<ThyroidStudyProtocol>(
    value ?? defaultThyroidStudyState
  );

  // Паттерн «adjust state during render»: применяем пользовательские дефолты,
  // когда они загружены и внешнего value ещё нет (guard — prevIsLoaded).
  const [prevIsLoaded, setPrevIsLoaded] = useState(isLoaded);
  if (isLoaded && !prevIsLoaded && !value) {
    setPrevIsLoaded(true);
    const rightDefault = getOrganOrDefault<ThyroidLobeProtocol>(
      SECTION_KEYS.THYROID_RIGHT_LOBE,
      { ...defaultThyroidLobeState },
    );
    const leftDefault = getOrganOrDefault<ThyroidLobeProtocol>(
      SECTION_KEYS.THYROID_LEFT_LOBE,
      { ...defaultThyroidLobeState },
    );
    setForm({
      ...defaultThyroidStudyState,
      thyroid: {
        rightLobe: rightDefault ?? { ...defaultThyroidLobeState },
        leftLobe: leftDefault ?? { ...defaultThyroidLobeState },
        isthmusSize: "",
        totalVolume: "",
        rightToLeftRatio: "",
        echogenicity: "",
        echostructure: "",
        contour: "",
        symmetry: "",
        position: "",
      },
    });
  }

  /** Глубокое рекурсивное слияние для ThyroidStudyProtocol */
  function deepMergeThyroid(target: ThyroidStudyProtocol, source: ThyroidStudyProtocol): ThyroidStudyProtocol {
    const result: ThyroidStudyProtocol = {
      ...target,
      conclusion: source.conclusion ?? target.conclusion,
      recommendations: source.recommendations ?? target.recommendations,
      thyroid: mergeThyroidData(target.thyroid, source.thyroid),
    };
    return result;
  }

  function mergeThyroidData(
    target: ThyroidProtocol | null,
    source: ThyroidProtocol | null
  ): ThyroidProtocol | null {
    if (!source) return target;
    if (!target) return source;

    const mergedRightLobe = mergeThyroidLobe(target.rightLobe, source.rightLobe);
    const mergedLeftLobe = mergeThyroidLobe(target.leftLobe, source.leftLobe);

    return {
      ...target,
      ...source,
      rightLobe: mergedRightLobe,
      leftLobe: mergedLeftLobe,
    };
  }

  function mergeThyroidLobe(
    target: import("@/types").ThyroidLobeProtocol,
    source: import("@/types").ThyroidLobeProtocol | undefined
  ): import("@/types").ThyroidLobeProtocol {
    if (!source) return target;

    // Мержим простые поля, source имеет приоритет
    const merged = { ...target, ...source };

    // Узлы: глубокое слияние по индексу, чтобы не затирать селекты
    const targetNodes = target.nodesList ?? [];
    const sourceNodes = source.nodesList ?? [];

    if (sourceNodes.length > 0) {
      merged.nodesList = targetNodes.map((existingNode, i) => {
        const sourceNode = sourceNodes[i];
        if (!sourceNode) return existingNode;
        // Мерж: каждое поле source перезаписывает target только если оно не пустое
        return {
          ...existingNode,
          size1: sourceNode.size1 ?? existingNode.size1,
          size2: sourceNode.size2 ?? existingNode.size2,
          echogenicity: sourceNode.echogenicity ?? existingNode.echogenicity,
          echostructure: sourceNode.echostructure ?? existingNode.echostructure,
          contour: sourceNode.contour ?? existingNode.contour,
          echogenicFoci: sourceNode.echogenicFoci ?? existingNode.echogenicFoci,
          orientation: sourceNode.orientation ?? existingNode.orientation,
          bloodFlow: sourceNode.bloodFlow ?? existingNode.bloodFlow,
          comment: sourceNode.comment ?? existingNode.comment,
          tiradsCategory: sourceNode.tiradsCategory ?? existingNode.tiradsCategory,
        };
      });

      // Добавляем новые узлы, которых нет в target
      for (let i = targetNodes.length; i < sourceNodes.length; i++) {
        merged.nodesList.push({ ...sourceNodes[i] });
      }
    }

    return merged;
  }

  // Глубокое слияние при изменении внешнего value (guard — prevValue).
  const [prevValue, setPrevValue] = useState(value);
  if (value !== prevValue) {
    setPrevValue(value);
    if (!value) {
      setForm(defaultThyroidStudyState);
    } else {
      // Глубокое слияние: мержим только те поля, что пришли, не затирая уже заполненные
      setForm((prev) => deepMergeThyroid(prev, value));
    }
  }

  const { setStudyData } = useResearch();
  const { showConclusionSamples, setCurrentOrgan } = useRightPanel();

  const sync = (updated: ThyroidStudyProtocol) => {
    setForm(updated);
    setStudyData(STUDY_KEYS.THYROID, updated);
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

  const handleConclusionFocus = () => {
    showConclusionSamples("thyroid");
    setCurrentOrgan("thyroid");
  };

  useResearchConclusionAddText("study-thyroid", STUDY_KEYS.THYROID, form, setForm, onChange);

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
        onConclusionFocus={handleConclusionFocus}
      />
    </div>
  );
};

export default Thyroid;
