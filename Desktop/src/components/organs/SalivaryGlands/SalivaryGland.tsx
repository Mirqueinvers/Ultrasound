// src/components/organs/SalivaryGlands/SalivaryGland.tsx
// Презентационный компонент: вся логика вынесена в hooks/organs/useSalivaryGland.ts
import React from "react";
import { Fieldset, ButtonSelect, SizeRow, SelectWithTextarea } from "@/UI";
import { useSalivaryGland } from "@hooks/organs/useSalivaryGland";
import { LymphNode } from "@/components/organs/LymphNodes/LymphNode";
import type {
  SalivaryGlandProps,
} from "@/types/organs/salivaryGlands";
import { Plus } from "lucide-react";
import { DETECTION_OPTIONS } from "@utils/constants";

export const SalivaryGland: React.FC<SalivaryGlandProps> = ({
  gland,
  showDepth = true,
  value,
  onChange,
}) => {
  const {
    form,
    updateField,
    handleLymphNodesDetectionChange,
    handleAddLymphNode,
    handleUpdateLymphNode,
    handleDeleteLymphNode,
    handleDuctsChange,
  } = useSalivaryGland(showDepth, value, onChange);

  const isParotid = gland === "parotidRight" || gland === "parotidLeft";
  const isSubmandibular =
    gland === "submandibularRight" || gland === "submandibularLeft";
  const shouldShowDuctDiameter = isParotid || isSubmandibular;
  const ductLabel = isParotid ? "Stensen duct (мм)" : "Wharton duct (мм)";

  return (
    <div className="space-y-6">
      <Fieldset title="">
        <div className="space-y-3 mb-4">
          <SizeRow
            label="Длина (мм)"
            value={form.length}
            onChange={(val) => updateField("length", val)}
          />
          <SizeRow
            label="Ширина (мм)"
            value={form.width}
            onChange={(val) => updateField("width", val)}
          />
          {showDepth && (
            <SizeRow
              label="Глубина (мм)"
              value={form.depth}
              onChange={(val) => updateField("depth", val)}
            />
          )}
          {showDepth && (
            <SizeRow
              label="Объем (мл)"
              value={form.volume}
              onChange={(val) => updateField("volume", val)}
              readOnly={true}
              autoCalculated={true}
              customInputClass="w-full px-4 py-2.5 bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-300 rounded-lg font-semibold text-sky-900"
            />
          )}
        </div>

        <div className="space-y-4 mb-4">
          <ButtonSelect
            label="Эхогенность"
            value={form.echogenicity}
            onChange={(val) => updateField("echogenicity", val)}
            options={[
              { value: "средняя", label: "средняя" },
              { value: "повышенная", label: "повышенная" },
              { value: "пониженная", label: "пониженная" },
              { value: "смешанная", label: "смешанная" },
            ]}
          />

          <ButtonSelect
            label="Эхоструктура"
            value={form.echostructure}
            onChange={(val) => updateField("echostructure", val)}
            options={[
              { value: "однородная", label: "однородная" },
              { value: "неоднородная", label: "неоднородная" },
              { value: "диффузно-неоднородная", label: "диффузно-неоднородная" },
            ]}
          />
        </div>

        <div className="space-y-4 mb-4">
          <ButtonSelect
            label="Контур"
            value={form.contour}
            onChange={(val) => updateField("contour", val)}
            options={[
              { value: "четкий, ровный", label: "четкий, ровный" },
              { value: "четкий, не ровный", label: "четкий, не ровный" },
              { value: "не четкий", label: "не четкий" },
            ]}
          />

          <ButtonSelect
            label="Протоки"
            value={form.ducts}
            onChange={handleDuctsChange}
            options={[
              { value: "не расширены", label: "не расширены" },
              { value: "расширены", label: "расширены" },
            ]}
          />
          {shouldShowDuctDiameter && form.ducts === "расширены" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {ductLabel}
              </label>
              <input
                type="text"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={form.ductDiameter}
                onChange={(e) => updateField("ductDiameter", e.target.value)}
                placeholder="Введите значение"
              />
            </div>
          )}
        </div>

        <div className="space-y-4 mb-4">
          <ButtonSelect
            label="Кровоток"
            value={form.bloodFlow}
            onChange={(val) => updateField("bloodFlow", val)}
            options={[
              { value: "не усилен", label: "не усилен" },
              { value: "усилен", label: "усилен" },
              { value: "усилен диффузно", label: "усилен диффузно" },
            ]}
          />
          <SelectWithTextarea
            label="Объемные образования"
            selectValue={form.volumeFormations}
            textareaValue={form.volumeFormationsDescription}
            onSelectChange={(val) => updateField("volumeFormations", val)}
            onTextareaChange={(val) =>
              updateField("volumeFormationsDescription", val)
            }
            options={[...DETECTION_OPTIONS]}
            triggerValue="определяются"
            textareaLabel="Описание объемных образований"
          />
        </div>

        <div className="mb-4">
          <ButtonSelect
            label="Лимфоузлы"
            value={form.lymphNodes.detected}
            onChange={(val) =>
              handleLymphNodesDetectionChange(val as "not_detected" | "detected")
            }
            options={[
              { value: "not_detected", label: "не определяются" },
              { value: "detected", label: "определяются" },
            ]}
          />
        </div>

        {form.lymphNodes.detected === "detected" && (
          <div className="mt-6 space-y-4">
            {form.lymphNodes.nodes.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 rounded-lg border-2 border-dashed border-slate-300">
                <p className="text-slate-500 text-sm mb-4">
                  Лимфоузлы не добавлены
                </p>
                <button
                  type="button"
                  onClick={handleAddLymphNode}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-all shadow-md hover:shadow-lg font-medium"
                >
                  <Plus size={18} />
                  Добавить лимфоузел
                </button>
              </div>
            ) : (
              <>
                {form.lymphNodes.nodes.map((node, index) => (
                  <LymphNode
                    key={node.id}
                    node={node}
                    onUpdate={handleUpdateLymphNode(index)}
                    onDelete={() => handleDeleteLymphNode(index)}
                  />
                ))}

                <button
                  type="button"
                  onClick={handleAddLymphNode}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-dashed border-sky-300 text-sky-600 rounded-xl hover:bg-sky-50 hover:border-sky-400 transition-all font-medium"
                >
                  <Plus size={18} />
                  Добавить лимфоузел
                </button>
              </>
            )}
          </div>
        )}

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Дополнительные находки
          </label>
          <textarea
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={3}
            value={form.additionalFindings}
            onChange={(e) => updateField("additionalFindings", e.target.value)}
            placeholder="Опишите дополнительные находки"
          />
        </div>
      </Fieldset>
    </div>
  );
};

export default SalivaryGland;