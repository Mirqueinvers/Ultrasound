// src/components/organs/LowerExtremityVeins/SuperficialVein.tsx
import React from "react";
import { Fieldset, ButtonSelect } from "@/UI";
import { useFormState, useFieldUpdate } from "@hooks";
import { VenousThrombusComponent } from "./VenousThrombus";
import type { 
  SuperficialVeinProtocol, 
  SuperficialVeinProps,
  VenousThrombus 
} from "@/types/organs/lowerExtremityVeins";
import { defaultSuperficialVeinState, defaultVenousThrombus } from "@/types";

export const SuperficialVein: React.FC<SuperficialVeinProps> = ({
  vein,
  side,
  value,
  onChange,
}) => {
  const [form, setForm] = useFormState<SuperficialVeinProtocol>(
    value ?? defaultSuperficialVeinState
  );
  const updateField = useFieldUpdate(form, setForm, onChange);

  const updateValveField = (field: keyof SuperficialVeinProtocol["valves"], value: string) => {
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
      number: form.thrombosis ? 2 : 1,
    };

    const updated = {
      ...form,
      thrombosis: newThrombus,
    };
    setForm(updated);
    onChange?.(updated);
  };

  const handleUpdateThrombus = (field: keyof VenousThrombus, value: string | number) => {
    if (!form.thrombosis) return;
    
    const updated = {
      ...form,
      thrombosis: { ...form.thrombosis, [field]: value },
    };
    setForm(updated);
    onChange?.(updated);
  };

  const handleRemoveThrombus = () => {
    const updated = {
      ...form,
      thrombosis: null,
    };
    setForm(updated);
    onChange?.(updated);
  };

  const getVeinTitle = (veinName: string, side: "right" | "left") => {
    const sideText = side === "right" ? "правая" : "левая";
    switch (veinName) {
      case "greatSaphenous":
        return `${sideText} большая подкожная вена (БПВ)`;
      case "smallSaphenous":
        return `${sideText} малая подкожная вена (МПВ)`;
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
              { value: "значительно расширен", label: "значительно расширен" },
              { value: "варикозно изменен", label: "варикозно изменен" },
            ]}
          />

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
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
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
        </div>

        <div className="mb-4">
          <ButtonSelect
            label="Перфорантные вены"
            value={form.perforators}
            onChange={(val) => updateField("perforators", val)}
            options={[
              { value: "не изменены", label: "не изменены" },
              { value: "расширены", label: "расширены" },
              { value: "с рефлюксом", label: "с рефлюксом" },
              { value: "несостоятельные", label: "несостоятельные" },
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

        {/* Тромбоз */}
        <div className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Тромбоз {getVeinTitle(vein, side)}
            </h3>
            <button
              type="button"
              onClick={handleAddThrombus}
              disabled={!!form.thrombosis}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Добавить тромбоз
            </button>
          </div>

          {!form.thrombosis ? (
            <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
              Тромбоз не обнаружен
            </div>
          ) : (
            <VenousThrombusComponent
              thrombus={form.thrombosis}
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

export default SuperficialVein;