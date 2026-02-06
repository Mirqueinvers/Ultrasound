// src/components/organs/LowerExtremityVeins/DeepVein.tsx
import React from "react";
import { Fieldset, ButtonSelect } from "@/UI";
import { useFormState, useFieldUpdate } from "@hooks";
import { VenousThrombusComponent } from "./VenousThrombus";
import type { 
  DeepVeinProtocol, 
  DeepVeinProps,
  VenousThrombus 
} from "@/types/organs/lowerExtremityVeins";
import { defaultDeepVeinState, defaultVenousThrombus } from "@/types";

export const DeepVein: React.FC<DeepVeinProps> = ({
  vein,
  side,
  value,
  onChange,
}) => {
  const [form, setForm] = useFormState<DeepVeinProtocol>(
    value ?? defaultDeepVeinState
  );
  const updateField = useFieldUpdate(form, setForm, onChange);

  const updateValveField = (field: keyof DeepVeinProtocol["valves"], value: string) => {
    const updated = {
      ...form,
      valves: {
        ...form.valves,
        [field]: value,
      },
    };
    setForm(updated);
    onChange?.(updated);
  };

  const handleAddThrombus = () => {
    const newThrombus: VenousThrombus = {
      ...defaultVenousThrombus,
      number: form.thrombus ? 2 : 1,
    };

    const updated = {
      ...form,
      thrombus: newThrombus,
    };
    setForm(updated);
    onChange?.(updated);
  };

  const handleUpdateThrombus = (field: keyof VenousThrombus, value: string | number) => {
    if (!form.thrombus) return;
    
    const updated = {
      ...form,
      thrombus: { ...form.thrombus, [field]: value },
    };
    setForm(updated);
    onChange?.(updated);
  };

  const handleRemoveThrombus = () => {
    const updated = {
      ...form,
      thrombus: null,
    };
    setForm(updated);
    onChange?.(updated);
  };

  const getVeinTitle = (veinName: string, side: "right" | "left") => {
    const sideText = side === "right" ? "правая" : "левая";
    switch (veinName) {
      case "femoral":
        return `${sideText} бедренная вена`;
      case "popliteal":
        return `${sideText} подколенная вена`;
      case "posteriorTibial":
        return `${sideText} задняя большеберцовая вена`;
      case "anteriorTibial":
        return `${sideText} передняя большеберцовая вена`;
      default:
        return veinName;
    }
  };

  return (
    <div className="space-y-6">
      <Fieldset title="">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <ButtonSelect
            label="Диаметр"
            value={form.diameter}
            onChange={(val) => updateField("diameter", val)}
            options={[
              { value: "обычный", label: "обычный" },
              { value: "расширен", label: "расширен" },
              { value: "сужен", label: "сужен" },
              { value: "значительно расширен", label: "значительно расширен" },
            ]}
          />

          <ButtonSelect
            label="Компрессируемость"
            value={form.compressibility}
            onChange={(val) => updateField("compressibility", val)}
            options={[
              { value: "полная", label: "полная" },
              { value: "частичная", label: "частичная" },
              { value: "отсутствует", label: "отсутствует" },
            ]}
          />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <ButtonSelect
            label="Стенка"
            value={form.wall}
            onChange={(val) => updateField("wall", val)}
            options={[
              { value: "обычная", label: "обычная" },
              { value: "утолщена", label: "утолщена" },
              { value: "неровная", label: "неровная" },
              { value: "кальцинирована", label: "кальцинирована" },
            ]}
          />

          <ButtonSelect
            label="Просвет"
            value={form.lumen}
            onChange={(val) => updateField("lumen", val)}
            options={[
              { value: "свободен", label: "свободен" },
              { value: "частично обтурирован", label: "частично обтурирован" },
              { value: "полностью обтурирован", label: "полностью обтурирован" },
            ]}
          />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <ButtonSelect
            label="Кровоток"
            value={form.flow}
            onChange={(val) => updateField("flow", val)}
            options={[
              { value: "сохранен", label: "сохранен" },
              { value: "ослаблен", label: "ослаблен" },
              { value: "отсутствует", label: "отсутствует" },
              { value: "ретроградный", label: "ретроградный" },
            ]}
          />

          <ButtonSelect
            label="Дыхательная фазность"
            value={form.respiratoryPhasing}
            onChange={(val) => updateField("respiratoryPhasing", val)}
            options={[
              { value: "сохранена", label: "сохранена" },
              { value: "снижена", label: "снижена" },
              { value: "отсутствует", label: "отсутствует" },
            ]}
          />
        </div>

        {/* Клапаны */}
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 mb-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Клапаны</h4>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <ButtonSelect
              label="Недостаточность"
              value={form.valves.insufficiency}
              onChange={(val) => updateValveField("insufficiency", val)}
              options={[
                { value: "не определяется", label: "не определяется" },
                { value: "легкая", label: "легкая" },
                { value: "умеренная", label: "умеренная" },
                { value: "выраженная", label: "выраженная" },
              ]}
            />

            <ButtonSelect
              label="Рефлюкс"
              value={form.valves.reflux}
              onChange={(val) => updateValveField("reflux", val)}
              options={[
                { value: "не определяется", label: "не определяется" },
                { value: "до 0.5 сек", label: "до 0.5 сек" },
                { value: "0.5-1 сек", label: "0.5-1 сек" },
                { value: "более 1 сек", label: "более 1 сек" },
              ]}
            />
          </div>

          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Длительность рефлюкса (сек)
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.valves.duration}
              onChange={(e) => updateValveField("duration", e.target.value)}
              placeholder="Например: 0.8"
            />
          </div>

          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Комментарий по клапанам
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={2}
              value={form.valves.comment}
              onChange={(e) => updateValveField("comment", e.target.value)}
              placeholder="Дополнительные комментарии по клапанам"
            />
          </div>
        </div>

        {/* Тромбы */}
        <div className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Тромбы {getVeinTitle(vein, side)}
            </h3>
            <button
              type="button"
              onClick={handleAddThrombus}
              disabled={!!form.thrombus}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Добавить тромб
            </button>
          </div>

          {!form.thrombus ? (
            <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
              Тромбы не обнаружены
            </div>
          ) : (
            <VenousThrombusComponent
              thrombus={form.thrombus}
              onUpdate={handleUpdateThrombus}
              onRemove={handleRemoveThrombus}
            />
          )}
        </div>

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

export default DeepVein;