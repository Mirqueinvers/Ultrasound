// src/components/organs/LymphNodes/LymphNodeRegion.tsx

import React from "react";
import { ResearchSectionCard } from "@/UI/ResearchSectionCard";
import { LymphNode } from "./LymphNode";
import { Fieldset, ButtonSelect } from "@/UI";
import type {
  LymphNodeRegionProps,
  LymphNodeProtocol,
} from "@/types/organs/lymphNodes";
import { defaultLymphNodeState } from "@/types/organs/lymphNodes";
import { Plus } from "lucide-react";

export const LymphNodeRegion: React.FC<LymphNodeRegionProps> = ({
  title,
  value,
  onChange,
}) => {
  const handleDetectionChange = (detected: "not_detected" | "detected") => {
    onChange({
      ...value,
      detected,
      nodes: detected === "not_detected" ? [] : value.nodes,
    });
  };

  const handleAddNode = (side: "left" | "right") => {
    const newNode: LymphNodeProtocol = {
      ...defaultLymphNodeState,
      id: `${Date.now()}-${Math.random()}`,
      side,
    };

    onChange({
      ...value,
      nodes: [...value.nodes, newNode],
    });
  };

  const handleUpdateNode = (index: number) => (
    field: keyof LymphNodeProtocol,
    fieldValue: string
  ) => {
    const updatedNodes = [...value.nodes];
    updatedNodes[index] = {
      ...updatedNodes[index],
      [field]: fieldValue,
    };

    onChange({
      ...value,
      nodes: updatedNodes,
    });
  };

  const handleDeleteNode = (index: number) => {
    const updatedNodes = value.nodes.filter((_, i) => i !== index);
    onChange({
      ...value,
      nodes: updatedNodes,
    });
  };

  return (
    <ResearchSectionCard title={title} headerClassName="bg-sky-500">
      <Fieldset title="">
        <ButtonSelect
          label=""
          value={value.detected}
          onChange={(val) =>
            handleDetectionChange(val as "not_detected" | "detected")
          }
          options={[
            { value: "not_detected", label: "не определяются" },
            { value: "detected", label: "определяются" },
          ]}
        />

        {value.detected === "detected" && (
          <div className="mt-6 space-y-4">
            {value.nodes.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 rounded-lg border-2 border-dashed border-slate-300">
                <p className="text-slate-500 text-sm mb-4">
                  Лимфоузлы не добавлены
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    type="button"
                    onClick={() => handleAddNode("right")}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-all shadow-md hover:shadow-lg font-medium"
                  >
                    <Plus size={18} />
                    Добавить справа
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddNode("left")}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-all shadow-md hover:shadow-lg font-medium"
                  >
                    <Plus size={18} />
                    Добавить слева
                  </button>
                </div>
              </div>
            ) : (
              <>
                {value.nodes.map((node, index) => (
                  <LymphNode
                    key={node.id}
                    node={node}
                    onUpdate={handleUpdateNode(index)}
                    onDelete={() => handleDeleteNode(index)}
                  />
                ))}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => handleAddNode("right")}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-dashed border-sky-300 text-sky-600 rounded-xl hover:bg-sky-50 hover:border-sky-400 transition-all font-medium"
                  >
                    <Plus size={18} />
                    Добавить справа
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddNode("left")}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-dashed border-sky-300 text-sky-600 rounded-xl hover:bg-sky-50 hover:border-sky-400 transition-all font-medium"
                  >
                    <Plus size={18} />
                    Добавить слева
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </Fieldset>
    </ResearchSectionCard>
  );
};

export default LymphNodeRegion;
