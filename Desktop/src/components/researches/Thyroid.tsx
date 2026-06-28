// Frontend/src/components/researches/Thyroid.tsx
import React, { useState, useEffect, useRef } from "react";
import ThyroidCommon from "@organs/Thyroid/ThyroidCommon";
import { Conclusion } from "@common";
import { useResearch } from "@contexts";
import { useRightPanel } from "@contexts/RightPanelContext";
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

  // ref для отслеживания предыдущего value
  const prevValueRef = useRef(value);

  useEffect(() => {
    if (value === prevValueRef.current) return;
    prevValueRef.current = value;

    if (!value) {
      setForm(defaultThyroidStudyState);
      return;
    }

    // Глубокое слияние: мержим только те поля, что пришли, не затирая уже заполненные
    setForm((prev) => deepMergeThyroid(prev, value));
  }, [value]);

  const { setStudyData } = useResearch();
  const { showConclusionSamples, setCurrentOrgan } = useRightPanel();

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

    // Обновляем размеры из source, но сохраняем существующие селекты
    const merged = { ...target, ...source };

    // Узлы: обновляем size1/size2 из source, но не затираем селекты
    if (source.nodesList && source.nodesList.length > 0) {
      const existingNodes = target.nodesList ?? [];

      if (existingNodes.length === 0) {
        // Если нет существующих узлов — просто используем source (с пустыми селектами)
        merged.nodesList = source.nodesList.map((n, i) => ({
          number: i + 1,
          size1: n.size1 ?? "",
          size2: n.size2 ?? "",
          echogenicity: "",
          echostructure: "",
          contour: "",
          echogenicFoci: "",
          orientation: "",
          bloodFlow: "",
          comment: "",
        }));
      } else {
        // Обновляем существующие узлы — мержим size1/size2, сохраняя селекты
        merged.nodesList = existingNodes.map((existingNode, i) => {
          const sourceNode = source.nodesList[i];
          if (sourceNode) {
            return {
              ...existingNode,
              size1: sourceNode.size1 ?? existingNode.size1,
              size2: sourceNode.size2 ?? existingNode.size2,
            };
          }
          return existingNode;
        });

        // Добавляем новые узлы, которых нет в target
        for (let i = existingNodes.length; i < source.nodesList.length; i++) {
          merged.nodesList.push({
            number: i + 1,
            size1: source.nodesList[i].size1 ?? "",
            size2: source.nodesList[i].size2 ?? "",
            echogenicity: "",
            echostructure: "",
            contour: "",
            echogenicFoci: "",
            orientation: "",
            bloodFlow: "",
            comment: "",
          });
        }
      }
    }

    return merged;
  }

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

  const handleConclusionFocus = () => {
    showConclusionSamples("thyroid");
    setCurrentOrgan("thyroid");
  };

  // Обработчик события добавления текста образца заключения
  useEffect(() => {
    const handleAddConclusionText = (event: CustomEvent) => {
      const { text, studyId } = event.detail;
      
      // Проверяем, что событие относится к данному исследованию
      if (studyId !== 'study-thyroid') return;
      
      const currentConclusion = form.conclusion?.trim() ?? "";
      const newConclusion = currentConclusion 
        ? `${currentConclusion} ${text}`
        : text;
      
      const updated = {
        ...form,
        conclusion: newConclusion,
        recommendations: form.recommendations ?? "",
      };
      setForm(updated);
      onChange?.(updated);
      setStudyData("Щитовидная железа", updated);
    };

    window.addEventListener('add-conclusion-text', handleAddConclusionText as EventListener);
    
    return () => {
      window.removeEventListener('add-conclusion-text', handleAddConclusionText as EventListener);
    };
  }, [form, onChange, setStudyData]);

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
