import React, { useState, useEffect } from "react";
import { RangeIndicator, normalRanges } from "../common/NormalRange";
import { useFieldFocus } from "../hooks/useFieldFocus";
import { Fieldset } from "../common/Fieldset";
import { inputClasses, labelClasses } from "../common/formClasses";

export interface PancreasProtocol {
  // Размеры
  head: string; // мм (головка)
  body: string; // мм (тело)
  tail: string; // мм (хвост)

  // Структура
  echogenicity: string; // Эхогенность
  echostructure: string; // Эхоструктура
  contour: string; // Контур
  pathologicalFormations: string; // Не определяются / Определяются
  pathologicalFormationsText: string; // описание патологических образований

  // Вирсунгов проток
  wirsungDuct: string; // мм (диаметр)

  // Дополнительно
  additional: string;

  // Заключение
  conclusion: string;
}

interface PancreasProps {
  value?: PancreasProtocol;
  onChange?: (value: PancreasProtocol) => void;
}

const defaultState: PancreasProtocol = {
  head: "",
  body: "",
  tail: "",
  echogenicity: "",
  echostructure: "",
  contour: "",
  pathologicalFormations: "Не определяются",
  pathologicalFormationsText: "",
  wirsungDuct: "",
  additional: "",
  conclusion: "",
};

export const Pancreas: React.FC<PancreasProps> = ({ value, onChange }) => {
  const [form, setForm] = useState<PancreasProtocol>(value ?? defaultState);

  // безопасное получение норм
  const pancreasRanges = normalRanges?.pancreas || {
    head: { min: 0, max: 32, unit: "мм" },
    body: { min: 0, max: 21, unit: "мм" },
    tail: { min: 0, max: 30, unit: "мм" },
    wirsungDuct: { min: 0, max: 3, unit: "мм" },
  };

  // фокусы
  const conclusionFocus = useFieldFocus("pancreas", "conclusion");
  const headFocus = useFieldFocus("pancreas", "head");
  const bodyFocus = useFieldFocus("pancreas", "body");
  const tailFocus = useFieldFocus("pancreas", "tail");
  const wirsungDuctFocus = useFieldFocus("pancreas", "wirsungDuct");

  const updateField = (field: keyof PancreasProtocol, val: string) => {
    const updated = { ...form, [field]: val };
    setForm(updated);
    onChange?.(updated);
  };

  // глобальный обработчик добавления текста в заключение только для поджелудочной
  useEffect(() => {
    const handleAddText = (event: CustomEvent) => {
      const { text, organ } = event.detail;

      if (organ === "pancreas") {
        setForm(prev => ({
          ...prev,
          conclusion: prev.conclusion
            ? prev.conclusion +
              (prev.conclusion.endsWith(".") ? " " : ". ") +
              text
            : text,
        }));
      }
    };

    window.addEventListener(
      "add-conclusion-text",
      handleAddText as EventListener,
    );

    return () => {
      window.removeEventListener(
        "add-conclusion-text",
        handleAddText as EventListener,
      );
    };
  }, []);

  const handleConclusionFocus = () => {
    conclusionFocus.handleFocus();
  };

  const handleConclusionBlur = () => {
    conclusionFocus.handleBlur();
  };

  const showPathologicalFormations = form.pathologicalFormations === "Определяются";

  return (
    <div className="flex flex-col gap-4">
      <h3 className="m-0 mb-4 text-slate-700 text-lg font-semibold">
        Поджелудочная железа
      </h3>

      {/* Размеры */}
      <Fieldset title="Размеры">
        <div className="flex items-center gap-4">
          <label className={labelClasses}>
            Головка (мм)
            <input
              type="text"
              className={inputClasses}
              value={form.head}
              onChange={e => updateField("head", e.target.value)}
              onFocus={headFocus.handleFocus}
              onBlur={headFocus.handleBlur}
            />
          </label>
          <RangeIndicator
            value={form.head}
            normalRange={pancreasRanges.head}
            label="Головка"
          />
        </div>

        <div className="flex items-center gap-4">
          <label className={labelClasses}>
            Тело (мм)
            <input
              type="text"
              className={inputClasses}
              value={form.body}
              onChange={e => updateField("body", e.target.value)}
              onFocus={bodyFocus.handleFocus}
              onBlur={bodyFocus.handleBlur}
            />
          </label>
          <RangeIndicator
            value={form.body}
            normalRange={pancreasRanges.body}
            label="Тело"
          />
        </div>

        <div className="flex items-center gap-4">
          <label className={labelClasses}>
            Хвост (мм)
            <input
              type="text"
              className={inputClasses}
              value={form.tail}
              onChange={e => updateField("tail", e.target.value)}
              onFocus={tailFocus.handleFocus}
              onBlur={tailFocus.handleBlur}
            />
          </label>
          <RangeIndicator
            value={form.tail}
            normalRange={pancreasRanges.tail}
            label="Хвост"
          />
        </div>
      </Fieldset>

      {/* Структура */}
      <Fieldset title="Структура">
        <div>
          <label className={labelClasses}>
            Эхогенность
            <select
              className={inputClasses}
              value={form.echogenicity}
              onChange={e => updateField("echogenicity", e.target.value)}
            >
              <option value="" />
              <option value="норма">средняя</option>
              <option value="повышена">повышена</option>
              <option value="снижена">снижена</option>
            </select>
          </label>
        </div>

        <div>
          <label className={labelClasses}>
            Эхоструктура
            <select
              className={inputClasses}
              value={form.echostructure}
              onChange={e => updateField("echostructure", e.target.value)}
            >
              <option value="" />
              <option value="однородная">однородная</option>
              <option value="неоднородная">неоднородная</option>
              <option value="диффузно-неоднородная">
                диффузно-неоднородная
              </option>
            </select>
          </label>
        </div>

        <div>
          <label className={labelClasses}>
            Контур
            <select
              className={inputClasses}
              value={form.contour}
              onChange={e => updateField("contour", e.target.value)}
            >
              <option value="" />
              <option value="четкий, ровный">четкий, ровный</option>
              <option value="четкий, не ровный">четкий, не ровный</option>
              <option value="не четкий">не четкий</option>
              <option value="бугристый">бугристый</option>
            </select>
          </label>
        </div>

        <div>
          <label className={labelClasses}>
            Патологические образования
            <select
              className={inputClasses}
              value={form.pathologicalFormations}
              onChange={e => {
                const val = e.target.value;
                updateField("pathologicalFormations", val);
                if (val === "Не определяются") {
                  updateField("pathologicalFormationsText", "");
                }
              }}
            >
              <option value="" />
              <option value="Не определяются">Не определяются</option>
              <option value="Определяются">Определяются</option>
            </select>
          </label>
        </div>

        {showPathologicalFormations && (
          <div>
            <label className={labelClasses}>
              Описание патологических образований
              <textarea
                rows={3}
                className={inputClasses + " resize-y"}
                value={form.pathologicalFormationsText}
                onChange={e =>
                  updateField("pathologicalFormationsText", e.target.value)
                }
              />
            </label>
          </div>
        )}
      </Fieldset>

      {/* Вирсунгов проток */}
      <Fieldset title="Вирсунгов проток">
        <div className="flex items-center gap-4">
          <label className={labelClasses}>
            Вирсунгов проток (мм)
            <input
              type="text"
              className={inputClasses}
              value={form.wirsungDuct}
              onChange={e => updateField("wirsungDuct", e.target.value)}
              onFocus={wirsungDuctFocus.handleFocus}
              onBlur={wirsungDuctFocus.handleBlur}
            />
          </label>
          <RangeIndicator
            value={form.wirsungDuct}
            normalRange={pancreasRanges.wirsungDuct}
            label="Вирсунгов проток"
          />
        </div>
      </Fieldset>

      {/* Дополнительно */}
      <Fieldset title="Дополнительно">
        <div>
          <textarea
            rows={3}
            className={inputClasses + " resize-y"}
            value={form.additional}
            onChange={e => updateField("additional", e.target.value)}
          />
        </div>
      </Fieldset>

      {/* Заключение */}
      <Fieldset title="Заключение">
        <div>
          <textarea
            rows={4}
            className={inputClasses + " resize-y"}
            value={form.conclusion}
            onChange={e => updateField("conclusion", e.target.value)}
            onFocus={handleConclusionFocus}
            onBlur={handleConclusionBlur}
          />
        </div>
      </Fieldset>
    </div>
  );
};

export default Pancreas;
