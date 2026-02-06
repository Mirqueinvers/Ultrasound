// src/components/organs/SalivaryGlands/SalivaryGland.tsx
import React from "react";
import { Fieldset, ButtonSelect } from "@/UI";
import { useFormState, useFieldUpdate } from "@hooks";
import { SalivaryFormation } from "./SalivaryFormation";
import type { 
  SalivaryGlandProtocol, 
  SalivaryGlandProps,
  SalivaryGlandFormationProps 
} from "@/types/organs/salivaryGlands";
import { defaultSalivaryGlandState } from "@/types";

export const SalivaryGland: React.FC<SalivaryGlandProps> = ({
  gland,
  value,
  onChange,
}) => {
  const [form, setForm] = useFormState<SalivaryGlandProtocol>(
    value ?? defaultSalivaryGlandState
  );
  const updateField = useFieldUpdate(form, setForm, onChange);

  const handleAddFormation = () => {
    const newFormationNumber = form.formationsList.length + 1;
    const newFormation = {
      number: newFormationNumber,
      size1: "",
      size2: "",
      size3: "",
      echogenicity: "",
      location: "",
      shape: "",
      contour: "",
      vascularization: "",
      comment: "",
    };

    const updated = {
      ...form,
      formationsList: [...form.formationsList, newFormation],
    };
    setForm(updated);
    onChange?.(updated);
  };

  const handleUpdateFormation = (
    index: number,
    field: keyof SalivaryGlandFormationProps["formation"],
    value: string | number
  ) => {
    const updated = {
      ...form,
      formationsList: form.formationsList.map((formation, i) =>
        i === index ? { ...formation, [field]: value } : formation
      ),
    };
    setForm(updated);
    onChange?.(updated);
  };

  const handleRemoveFormation = (index: number) => {
    const updated = {
      ...form,
      formationsList: form.formationsList.filter((_, i) => i !== index),
    };
    setForm(updated);
    onChange?.(updated);
  };

  const getGlandTitle = (glandName: string) => {
    switch (glandName) {
      case "parotidRight":
        return "Правая околоушная слюнная железа";
      case "parotidLeft":
        return "Левая околоушная слюнная железа";
      case "submandibularRight":
        return "Правая подчелюстная слюнная железа";
      case "submandibularLeft":
        return "Левая подчелюстная слюнная железа";
      default:
        return glandName;
    }
  };

  return (
    <div className="space-y-6">
      <Fieldset title="">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <ButtonSelect
            label="Размеры"
            value={form.size}
            onChange={(val) => updateField("size", val)}
            options={[
              { value: "обычных размеров", label: "обычных размеров" },
              { value: "увеличена", label: "увеличена" },
              { value: "уменьшена", label: "уменьшена" },
              { value: "значительно увеличена", label: "значительно увеличена" },
            ]}
          />

          <ButtonSelect
            label="Форма"
            value={form.shape}
            onChange={(val) => updateField("shape", val)}
            options={[
              { value: "обычной формы", label: "обычной формы" },
              { value: "деформирована", label: "деформирована" },
              { value: "неправильной формы", label: "неправильной формы" },
            ]}
          />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <ButtonSelect
            label="Контур"
            value={form.contour}
            onChange={(val) => updateField("contour", val)}
            options={[
              { value: "ровный, четкий", label: "ровный, четкий" },
              { value: "неровный", label: "неровный" },
              { value: "нечеткий", label: "нечеткий" },
              { value: "бугристый", label: "бугристый" },
              { value: "ровный нечеткий", label: "ровный нечеткий" },
            ]}
          />

          <ButtonSelect
            label="Эхогенность"
            value={form.echogenicity}
            onChange={(val) => updateField("echogenicity", val)}
            options={[
              { value: "обычная", label: "обычная" },
              { value: "повышенная", label: "повышенная" },
              { value: "пониженная", label: "пониженная" },
              { value: "неоднородная", label: "неоднородная" },
            ]}
          />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <ButtonSelect
            label="Эхоструктура"
            value={form.echostructure}
            onChange={(val) => updateField("echostructure", val)}
            options={[
              { value: "однородная", label: "однородная" },
              { value: "неоднородная", label: "неоднородная" },
              { value: "мелкозернистая", label: "мелкозернистая" },
              { value: "крупнозернистая", label: "крупнозернистая" },
              { value: "с участками неоднородности", label: "с участками неоднородности" },
            ]}
          />

          <ButtonSelect
            label="Васкуляризация"
            value={form.vascularization}
            onChange={(val) => updateField("vascularization", val)}
            options={[
              { value: "обычная", label: "обычная" },
              { value: "усилена", label: "усилена" },
              { value: "ослаблена", label: "ослаблена" },
              { value: "неравномерная", label: "неравномерная" },
            ]}
          />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <ButtonSelect
            label="Протоковая система"
            value={form.ductSystem}
            onChange={(val) => updateField("ductSystem", val)}
            options={[
              { value: "не расширен", label: "не расширен" },
              { value: "расширен", label: "расширен" },
              { value: "значительно расширен", label: "значительно расширен" },
              { value: "деформирован", label: "деформирован" },
              { value: "содержимое эхогенное", label: "содержимое эхогенное" },
            ]}
          />

          <ButtonSelect
            label="Конкременты"
            value={form.stones}
            onChange={(val) => updateField("stones", val)}
            options={[
              { value: "не определяются", label: "не определяются" },
              { value: "определяются единичные", label: "определяются единичные" },
              { value: "определяются множественные", label: "определяются множественные" },
              { value: "конкремент в протоке", label: "конкремент в протоке" },
            ]}
          />
        </div>

        <div className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Образования {getGlandTitle(gland)}
            </h3>
            <button
              type="button"
              onClick={handleAddFormation}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Добавить образование
            </button>
          </div>

          {form.formationsList.length === 0 ? (
            <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
              Образования не обнаружены
            </div>
          ) : (
            <div className="space-y-4">
              {form.formationsList.map((formation, index) => (
                <SalivaryFormation
                  key={index}
                  formation={formation}
                  onUpdate={(field, value) =>
                    handleUpdateFormation(index, field as keyof SalivaryGlandFormationProps["formation"], value)
                  }
                  onRemove={() => handleRemoveFormation(index)}
                />
              ))}
            </div>
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

export default SalivaryGland;