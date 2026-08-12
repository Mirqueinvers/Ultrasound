// src/components/organs/LymphNodes/LymphNodesCommon.tsx

import React, { useState } from "react";
import { LymphNodeRegion } from "./LymphNodeRegion";
import type {
  LymphNodesProtocol,
  LymphNodesCommonProps,
  LymphNodeRegionProtocol,
} from "@/types/organs/lymphNodes";
import { defaultLymphNodesState } from "@/types/organs/lymphNodes";
import { SECTION_KEYS } from "@/domain/sectionKeys";

export const LymphNodesCommon: React.FC<LymphNodesCommonProps> = ({
  value,
  onChange,
  sectionRefs,
}) => {
  const [form, setForm] = useState<LymphNodesProtocol>(
    value ?? defaultLymphNodesState,
  );

  // Синхронизация с внешним value (guard — prevValue).
  const [prevValue, setPrevValue] = useState(value);
  if (value !== prevValue) {
    setPrevValue(value);
    setForm(value ?? defaultLymphNodesState);
  }

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
      sectionKey: SECTION_KEYS.LYMPH_SUBMANDIBULAR,
    },
    {
      key: "cervical" as const,
      title: "Шейные",
      sectionKey: SECTION_KEYS.LYMPH_CERVICAL,
    },
    {
      key: "subclavian" as const,
      title: "Подключичные",
      sectionKey: SECTION_KEYS.LYMPH_SUPRACLAVICULAR,
    },
    {
      key: "supraclavicular" as const,
      title: "Надключичные",
      sectionKey: SECTION_KEYS.LYMPH_SUBCLAVIAN,
    },
    {
      key: "axillary" as const,
      title: "Подмышечные",
      sectionKey: SECTION_KEYS.LYMPH_AXILLARY,
    },
    {
      key: "inguinal" as const,
      title: "Паховые",
      sectionKey: SECTION_KEYS.LYMPH_INGUINAL,
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
