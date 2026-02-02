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
    { key: "submandibular" as const, title: "Поднижнечелюстные" },
    { key: "cervical" as const, title: "Шейные" },
    { key: "subclavian" as const, title: "Подключичные" },
    { key: "supraclavicular" as const, title: "Надключичные" },
    { key: "axillary" as const, title: "Подмышечные" },
    { key: "inguinal" as const, title: "Паховые" },
  ];

  return (
    <div className="flex flex-col gap-6">
      {regions.map(({ key, title }) => (
        <div key={key} ref={sectionRefs?.[`Лимфатические узлы:${title}`]}>
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
