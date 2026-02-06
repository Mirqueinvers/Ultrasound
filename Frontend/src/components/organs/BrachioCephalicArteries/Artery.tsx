// src/components/organs/BrachioCephalicArteries/Artery.tsx
import React from "react";
import { Fieldset, ButtonSelect } from "@/UI";
import { useFormState, useFieldUpdate } from "@hooks";
import { BrachioCephalicFormation } from "./BrachioCephalicFormation";
import type { 
  ArteryProtocol, 
  ArteryProps,
  BrachioCephalicFormationProps 
} from "@/types/organs/brachioCephalicArteries";
import { defaultArteryState } from "@/types";

export const Artery: React.FC<ArteryProps> = ({
  artery,
  value,
  onChange,
}) => {
  const [form, setForm] = useFormState<ArteryProtocol>(
    value ?? defaultArteryState
  );
  const updateField = useFieldUpdate(form, setForm, onChange);

  const handleAddPlaque = () => {
    const newPlaqueNumber = form.plaquesList.length + 1;
    const newPlaque = {
      number: newPlaqueNumber,
      size: "",
      location: "",
      type: "",
      stenosis: "",
      comment: "",
    };

    const updated = {
      ...form,
      plaquesList: [...form.plaquesList, newPlaque],
    };
    setForm(updated);
    onChange?.(updated);
  };

  const handleUpdatePlaque = (
    index: number,
    field: keyof BrachioCephalicFormationProps["formation"],
    value: string | number
  ) => {
    const updated = {
      ...form,
      plaquesList: form.plaquesList.map((plaque, i) =>
        i === index ? { ...plaque, [field]: value } : plaque
      ),
    };
    setForm(updated);
    onChange?.(updated);
  };

  const handleRemovePlaque = (index: number) => {
    const updated = {
      ...form,
      plaquesList: form.plaquesList.filter((_, i) => i !== index),
    };
    setForm(updated);
    onChange?.(updated);
  };

  const getArteryTitle = (arteryName: string) => {
    switch (arteryName) {
      case "commonCarotidRight":
        return "Правая общая сонная артерия";
      case "commonCarotidLeft":
        return "Левая общая сонная артерия";
      case "internalCarotidRight":
        return "Правая внутренняя сонная артерия";
      case "internalCarotidLeft":
        return "Левая внутренняя сонная артерия";
      case "externalCarotidRight":
        return "Правая наружная сонная артерия";
      case "externalCarotidLeft":
        return "Левая наружная сонная артерия";
      case "vertebralRight":
        return "Правая позвоночная артерия";
      case "vertebralLeft":
        return "Левая позвоночная артерия";
      case "subclavianRight":
        return "Правая подключичная артерия";
      case "subclavianLeft":
        return "Левая подключичная артерия";
      default:
        return arteryName;
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
              { value: "обычного диаметра", label: "обычного диаметра" },
              { value: "расширен", label: "расширен" },
              { value: "сужен", label: "сужен" },
              { value: "значительно расширен", label: "значительно расширен" },
              { value: "значительно сужен", label: "значительно сужен" },
            ]}
          />

          <ButtonSelect
            label="Толщина стенки"
            value={form.wallThickness}
            onChange={(val) => updateField("wallThickness", val)}
            options={[
              { value: "обычная", label: "обычная" },
              { value: "утолщена", label: "утолщена" },
              { value: "значительно утолщена", label: "значительно утолщена" },
              { value: "истончена", label: "истончена" },
            ]}
          />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <ButtonSelect
            label="Толщина интима-медиа"
            value={form.intimaMediaThickness}
            onChange={(val) => updateField("intimaMediaThickness", val)}
            options={[
              { value: "в пределах нормы", label: "в пределах нормы" },
              { value: "утолщена", label: "утолщена" },
              { value: "значительно утолщена", label: "значительно утолщена" },
              { value: "неравномерно утолщена", label: "неравномерно утолщена" },
            ]}
          />

          <ButtonSelect
            label="Скорость кровотока"
            value={form.bloodFlowVelocity}
            onChange={(val) => updateField("bloodFlowVelocity", val)}
            options={[
              { value: "в пределах нормы", label: "в пределах нормы" },
              { value: "повышена", label: "повышена" },
              { value: "снижена", label: "снижена" },
              { value: "значительно повышена", label: "значительно повышена" },
              { value: "значительно снижена", label: "значительно снижена" },
            ]}
          />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <ButtonSelect
            label="Индекс резистентности"
            value={form.resistanceIndex}
            onChange={(val) => updateField("resistanceIndex", val)}
            options={[
              { value: "в пределах нормы", label: "в пределах нормы" },
              { value: "повышен", label: "повышен" },
              { value: "снижен", label: "снижен" },
              { value: "значительно повышен", label: "значительно повышен" },
              { value: "значительно снижен", label: "значительно снижен" },
            ]}
          />

          <ButtonSelect
            label="Пульсационный индекс"
            value={form.pulsatilityIndex}
            onChange={(val) => updateField("pulsatilityIndex", val)}
            options={[
              { value: "в пределах нормы", label: "в пределах нормы" },
              { value: "повышен", label: "повышен" },
              { value: "снижен", label: "снижен" },
              { value: "значительно повышен", label: "значительно повышен" },
              { value: "значительно снижен", label: "значительно снижен" },
            ]}
          />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <ButtonSelect
            label="Стеноз"
            value={form.stenosis}
            onChange={(val) => updateField("stenosis", val)}
            options={[
              { value: "не определяется", label: "не определяется" },
              { value: "до 15%", label: "до 15%" },
              { value: "15-30%", label: "15-30%" },
              { value: "30-50%", label: "30-50%" },
              { value: "50-70%", label: "50-70%" },
              { value: "70-90%", label: "70-90%" },
              { value: "более 90%", label: "более 90%" },
            ]}
          />

          <ButtonSelect
            label="Окклюзия"
            value={form.occlusion}
            onChange={(val) => updateField("occlusion", val)}
            options={[
              { value: "не определяется", label: "не определяется" },
              { value: "частичная окклюзия", label: "частичная окклюзия" },
              { value: "полная окклюзия", label: "полная окклюзия" },
              { value: "субокклюзия", label: "субокклюзия" },
            ]}
          />
        </div>

        <div className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Атеросклеротические бляшки {getArteryTitle(artery)}
            </h3>
            <button
              type="button"
              onClick={handleAddPlaque}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Добавить бляшку
            </button>
          </div>

          {form.plaquesList.length === 0 ? (
            <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
              Бляшки не обнаружены
            </div>
          ) : (
            <div className="space-y-4">
              {form.plaquesList.map((plaque, index) => (
                <BrachioCephalicFormation
                  key={index}
                  formation={plaque}
                  onUpdate={(field, value) =>
                    handleUpdatePlaque(index, field as keyof BrachioCephalicFormationProps["formation"], value)
                  }
                  onRemove={() => handleRemovePlaque(index)}
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

export default Artery;