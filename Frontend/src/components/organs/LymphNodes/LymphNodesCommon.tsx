// src/components/organs/LymphNodes/LymphNodesCommon.tsx

import React from "react";
import { useFormState } from "@hooks";
import { LymphNodeRegion } from "./LymphNodeRegion";
import type {
  LymphNodesProtocol,
  LymphNodesCommonProps,
  LymphNodeRegionProtocol,
} from "@/types/organs/lymphNodes";
import { defaultLymphNodesState } from "@/types/organs/lymphNodes";

export const LymphNodesCommon: React.FC<LymphNodesCommonProps> = ({
  value,
  onChange,
  sectionRefs,
}) => {
  const [form, setForm] = useFormState<LymphNodesProtocol>(
    value ?? defaultLymphNodesState
  );

  const handleRegionChange =
    (region: keyof LymphNodesProtocol) =>
    (regionValue: LymphNodeRegionProtocol) => {
      const draft = {
        ...form,
        [region]: regionValue,
      };
      setForm(draft);
      onChange?.(draft);
    };

  const regions = [
    {
      key: "submandibular" as const,
      title: "Поднижнечелюстные",
      sectionKey: "Лимфатические узлы:Поднижнечелюстные" as const,
    },
    {
      key: "cervical" as const,
      title: "Шейные",
      sectionKey: "Лимфатические узлы:Шейные" as const,
    },
    {
      key: "subclavian" as const,
      title: "Подключичные",
      sectionKey: "Лимфатические узлы:Подключичные" as const,
    },
    {
      key: "supraclavicular" as const,
      title: "Надключичные",
      sectionKey: "Лимфатические узлы:Надключичные" as const,
    },
    {
      key: "axillary" as const,
      title: "Подмышечные",
      sectionKey: "Лимфатические узлы:Подмышечные" as const,
    },
    {
      key: "inguinal" as const,
      title: "Паховые",
      sectionKey: "Лимфатические узлы:Паховые" as const,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {regions.map(({ key, title, sectionKey }) => (
        <div
          key={key}
          ref={sectionRefs?.[sectionKey]}
          data-section-key={sectionKey}
        >
          <LymphNodeRegion
            title={title}
            value={form[key]}
            onChange={handleRegionChange(key)}
          />
        </div>
      ))}
    </div>
  );
};

export default LymphNodesCommon;
