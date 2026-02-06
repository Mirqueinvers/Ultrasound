// src/components/organs/Pleural/PleuralSide.tsx
import React from "react";
import { Fieldset, ButtonSelect } from "@/UI";
import { useFormState, useFieldUpdate } from "@hooks";
import { PleuralFormation } from "./PleuralFormation";
import type { 
  PleuralSideProtocol, 
  PleuralSideProps,
  PleuralFormationProps 
} from "@/types/organs/pleural";
import { defaultPleuralSideState } from "@/types";

export const PleuralSide: React.FC<PleuralSideProps> = ({
  side,
  value,
  onChange,
}) => {
  const [form, setForm] = useFormState<PleuralSideProtocol>(
    value ?? defaultPleuralSideState
  );
  const updateField = useFieldUpdate(form, setForm, onChange);

  const handleAddFormation = () => {
    const newFormationNumber = form.formationsList.length + 1;
    const newFormation = {
      number: newFormationNumber,
      size1: "",
      size2: "",
      echogenicity: "",
      location: "",
      mobility: "",
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
    field: keyof PleuralFormationProps["formation"],
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

  const sideTitle = side === "right" ? "Правая плевральная полость" : "Левая плевральная полость";

  return (
    <div className="space-y-6">
      <Fieldset title="">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Наличие патологического содержимого
            </label>
            <select
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.presence}
              onChange={(e) => updateField("presence", e.target.value)}
            >
              <option value="отсутствует">отсутствует</option>
              <option value="жидкость">жидкость</option>
              <option value="воздух">воздух</option>
              <option value="жидкость и воздух">жидкость и воздух</option>
              <option value="геморрагическое содержимое">геморрагическое содержимое</option>
              <option value="гнойное содержимое">гнойное содержимое</option>
            </select>
          </div>

          {form.presence !== "отсутствует" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Количество
              </label>
              <input
                type="text"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.amount}
                onChange={(e) => updateField("amount", e.target.value)}
                placeholder="Введите количество"
              />
            </div>
          )}
        </div>

        {form.presence !== "отсутствует" && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Характер содержимого
            </label>
            <select
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={form.character}
              onChange={(e) => updateField("character", e.target.value)}
            >
              <option value="">Выберите характер</option>
              <option value="анэхогенное">анэхогенное</option>
              <option value="гипоэхогенное">гипоэхогенное</option>
              <option value="эхогенное">эхогенное</option>
              <option value="неоднородное">неоднородное</option>
              <option value="с уровнем жидкости">с уровнем жидкости</option>
              <option value="с включениями">с включениями</option>
            </select>
          </div>
        )}

        <div className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Образования {sideTitle}
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
                <PleuralFormation
                  key={index}
                  formation={formation}
                  onUpdate={(field, value) =>
                    handleUpdateFormation(index, field as keyof PleuralFormationProps["formation"], value)
                  }
                  onRemove={() => handleRemoveFormation(index)}
                />
              ))}
            </div>
          )}
        </div>
      </Fieldset>
    </div>
  );
};

export default PleuralSide;