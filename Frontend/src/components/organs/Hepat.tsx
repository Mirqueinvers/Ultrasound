import React, { useState, useEffect } from "react";
import { RangeIndicator, normalRanges } from "../common/NormalRange";
import { useFieldFocus } from "../hooks/useFieldFocus";
import { Fieldset } from "../common/Fieldset";
import { inputClasses, labelClasses } from "../common/formClasses";

export interface LiverProtocol {
  // Размеры
  rightLobeAP: string;      // мм (ПЗР правая)
  leftLobeAP: string;       // мм (ПЗР левая)

  // Дополнительные размеры (скрытые по умолчанию)
  rightLobeCCR: string;     // мм (ККР правая)
  rightLobeCVR: string;     // мм (КВР правая)
  leftLobeCCR: string;      // мм (ККР левая)
  rightLobeTotal: string;   // мм (ККР + ПЗР правая, авторасчет)
  leftLobeTotal: string;    // мм (ККР + ПЗР левая, авторасчет)

  // Структура
  echogenicity: string;
  homogeneity: string;      // Эхоструктура
  contours: string;
  lowerEdgeAngle: string;
  focalLesionsPresence: string; // определяются / не определяются
  focalLesions: string;         // описание, если определяются

  // Сосуды
  vascularPattern: string;
  portalVeinDiameter: string;   // мм
  ivc: string;

  // Дополнительно
  additional: string;

  // Заключение
  conclusion: string;
}

interface HepatProps {
  value?: LiverProtocol;
  onChange?: (value: LiverProtocol) => void;
}

const defaultState: LiverProtocol = {
  rightLobeAP: "",
  leftLobeAP: "",
  rightLobeCCR: "",
  rightLobeCVR: "",
  leftLobeCCR: "",
  rightLobeTotal: "",
  leftLobeTotal: "",
  echogenicity: "",
  homogeneity: "",
  contours: "",
  lowerEdgeAngle: "",
  focalLesionsPresence: "",
  focalLesions: "",
  vascularPattern: "",
  portalVeinDiameter: "",
  ivc: "",
  additional: "",
  conclusion: "",
};

export const Hepat: React.FC<HepatProps> = ({ value, onChange }) => {
  const [form, setForm] = useState<LiverProtocol>(value ?? defaultState);

  const conclusionFocus = useFieldFocus("liver", "conclusion");
  const rightLobeFocus = useFieldFocus("liver", "rightLobeAP");
  const leftLobeFocus = useFieldFocus("liver", "leftLobeAP");
  const portalVeinFocus = useFieldFocus("liver", "portalVeinDiameter");
  const ivcFocus = useFieldFocus("liver", "ivc");

  // дополнительные поля
  const rightLobeCCRFocus = useFieldFocus("liver", "rightLobeCCR");
  const rightLobeCVRFocus = useFieldFocus("liver", "rightLobeCVR");
  const leftLobeCCRFocus = useFieldFocus("liver", "leftLobeCCR");
  const rightLobeTotalFocus = useFieldFocus("liver", "rightLobeTotal");
  const leftLobeTotalFocus = useFieldFocus("liver", "leftLobeTotal");

  const updateField = (field: keyof LiverProtocol, val: string) => {
    const updated: LiverProtocol = { ...form, [field]: val };

    // авторасчет сумм (ККР + ПЗР), только когда оба значения есть
    if (field === "rightLobeAP" || field === "rightLobeCCR") {
      const ap =
        parseFloat(field === "rightLobeAP" ? val : form.rightLobeAP) || 0;
      const ccr =
        parseFloat(field === "rightLobeCCR" ? val : form.rightLobeCCR) || 0;

      updated.rightLobeTotal = ap > 0 && ccr > 0 ? (ccr + ap).toString() : "";
    }

    if (field === "leftLobeAP" || field === "leftLobeCCR") {
      const ap =
        parseFloat(field === "leftLobeAP" ? val : form.leftLobeAP) || 0;
      const ccr =
        parseFloat(field === "leftLobeCCR" ? val : form.leftLobeCCR) || 0;

      updated.leftLobeTotal = ap > 0 && ccr > 0 ? (ccr + ap).toString() : "";
    }

    setForm(updated);
    onChange?.(updated);
  };

  // значения для логики показа доп. полей
  const rightLobeAPValue = parseFloat(form.rightLobeAP) || 0;
  const leftLobeAPValue = parseFloat(form.leftLobeAP) || 0;
  const rightLobeCCRValue = parseFloat(form.rightLobeCCR) || 0;
  const rightLobeCVRValue = parseFloat(form.rightLobeCVR) || 0;
  const rightLobeTotalValue = parseFloat(form.rightLobeTotal) || 0;
  const leftLobeCCRValue = parseFloat(form.leftLobeCCR) || 0;
  const leftLobeTotalValue = parseFloat(form.leftLobeTotal) || 0;

  const normalRightLobeAP = 125;
  const normalLeftLobeAP = 90;
  const normalRightLobeCCR = 140;
  const normalRightLobeCVR = 150;
  const normalRightLobeTotal = 260;
  const normalLeftLobeCCR = 100;
  const normalLeftLobeTotal = 160;

  const showRightLobeAdditional =
    rightLobeAPValue > normalRightLobeAP ||
    rightLobeCCRValue > normalRightLobeCCR ||
    rightLobeCVRValue > normalRightLobeCVR ||
    rightLobeTotalValue > normalRightLobeTotal;

  const showLeftLobeAdditional =
    leftLobeAPValue > normalLeftLobeAP ||
    leftLobeCCRValue > normalLeftLobeCCR ||
    leftLobeTotalValue > normalLeftLobeTotal;

  const showFocalTextarea = form.focalLesionsPresence === "определяются";

  const handleConclusionFocus = () => {
    conclusionFocus.handleFocus();
  };

  const handleConclusionBlur = () => {
    conclusionFocus.handleBlur();
  };

  // обработчик добавления текста в заключение для печени
  useEffect(() => {
    const handleAddText = (event: CustomEvent) => {
      const { text, organ } = event.detail;

      if (organ === "liver") {
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

  return (
    <div className="flex flex-col gap-4">
      <h3 className="m-0 mb-4 text-slate-700 text-lg font-semibold">Печень</h3>

      {/* Размеры */}
      <Fieldset title="Размеры">
        <div className="flex items-center gap-4">
          <label className={labelClasses}>
            Правая доля, ПЗР (мм)
            <input
              type="text"
              className={inputClasses}
              value={form.rightLobeAP}
              onChange={e => updateField("rightLobeAP", e.target.value)}
              onFocus={rightLobeFocus.handleFocus}
              onBlur={rightLobeFocus.handleBlur}
            />
          </label>
          <RangeIndicator
            value={form.rightLobeAP}
            normalRange={normalRanges.liver.rightLobeAP}
          />
        </div>

        <div className="flex items-center gap-4">
          <label className={labelClasses}>
            Левая доля, ПЗР (мм)
            <input
              type="text"
              className={inputClasses}
              value={form.leftLobeAP}
              onChange={e => updateField("leftLobeAP", e.target.value)}
              onFocus={leftLobeFocus.handleFocus}
              onBlur={leftLobeFocus.handleBlur}
            />
          </label>
          <RangeIndicator
            value={form.leftLobeAP}
            normalRange={normalRanges.liver.leftLobeAP}
          />
        </div>

        {/* Дополнительные размеры правой доли */}
        {showRightLobeAdditional && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <h5 className="text-xs font-semibold text-yellow-800 mb-3">
              ⚠️ ПЗР правой доли превышает норму — дополнительные измерения:
            </h5>

            <div className="flex items-center gap-4 mb-3">
              <label className="block text-xs font-medium text-gray-700 w-1/3">
                Правая доля, ККР (мм)
                <input
                  type="text"
                  className={inputClasses}
                  value={form.rightLobeCCR}
                  onChange={e => updateField("rightLobeCCR", e.target.value)}
                  onFocus={rightLobeCCRFocus.handleFocus}
                  onBlur={rightLobeCCRFocus.handleBlur}
                />
              </label>
              <RangeIndicator
                value={form.rightLobeCCR}
                normalRange={normalRanges.liver.rightLobeCCR}
              />
            </div>

            <div className="flex items-center gap-4 mb-3">
              <label className="block text-xs font-medium text-gray-700 w-1/3">
                Правая доля, КВР (мм)
                <input
                  type="text"
                  className={inputClasses}
                  value={form.rightLobeCVR}
                  onChange={e => updateField("rightLobeCVR", e.target.value)}
                  onFocus={rightLobeCVRFocus.handleFocus}
                  onBlur={rightLobeCVRFocus.handleBlur}
                />
              </label>
              <RangeIndicator
                value={form.rightLobeCVR}
                normalRange={normalRanges.liver.rightLobeCVR}
              />
            </div>

            <div className="flex items-center gap-4">
              <label className="block text-xs font-medium text-gray-700 w-1/3">
                Правая доля, ККР + ПЗР (мм)
                <input
                  type="text"
                  className={inputClasses + " bg-gray-100"}
                  value={form.rightLobeTotal}
                  readOnly
                  onFocus={rightLobeTotalFocus.handleFocus}
                  onBlur={rightLobeTotalFocus.handleBlur}
                />
              </label>
              <RangeIndicator
                value={form.rightLobeTotal}
                normalRange={normalRanges.liver.rightLobeTotal}
              />
            </div>
          </div>
        )}

        {/* Дополнительные размеры левой доли */}
        {showLeftLobeAdditional && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <h5 className="text-xs font-semibold text-yellow-800 mb-3">
              ⚠️ ПЗР левой доли превышает норму — дополнительные измерения:
            </h5>

            <div className="flex items-center gap-4 mb-3">
              <label className="block text-xs font-medium text-gray-700 w-1/3">
                Левая доля, ККР (мм)
                <input
                  type="text"
                  className={inputClasses}
                  value={form.leftLobeCCR}
                  onChange={e => updateField("leftLobeCCR", e.target.value)}
                  onFocus={leftLobeCCRFocus.handleFocus}
                  onBlur={leftLobeCCRFocus.handleBlur}
                />
              </label>
              <RangeIndicator
                value={form.leftLobeCCR}
                normalRange={normalRanges.liver.leftLobeCCR}
              />
            </div>

            <div className="flex items-center gap-4">
              <label className="block text-xs font-medium text-gray-700 w-1/3">
                Левая доля, ККР + ПЗР (мм)
                <input
                  type="text"
                  className={inputClasses + " bg-gray-100"}
                  value={form.leftLobeTotal}
                  readOnly
                  onFocus={leftLobeTotalFocus.handleFocus}
                  onBlur={leftLobeTotalFocus.handleBlur}
                />
              </label>
              <RangeIndicator
                value={form.leftLobeTotal}
                normalRange={normalRanges.liver.leftLobeTotal}
              />
            </div>
          </div>
        )}
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
              value={form.homogeneity}
              onChange={e => updateField("homogeneity", e.target.value)}
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
              value={form.contours}
              onChange={e => updateField("contours", e.target.value)}
            >
              <option value="" />
              <option value="ровные">четкий, ровный</option>
              <option value="неровные">четкий, неровный</option>
              <option value="бугристые">бугристый</option>
            </select>
          </label>
        </div>

        <div>
          <label className={labelClasses}>
            Угол нижнего края
            <select
              className={inputClasses}
              value={form.lowerEdgeAngle}
              onChange={e => updateField("lowerEdgeAngle", e.target.value)}
            >
              <option value="" />
              <option value="заострён">заострён</option>
              <option value="закруглён">закруглён</option>
            </select>
          </label>
        </div>

        <div>
          <label className={labelClasses}>
            Патологические образования
            <select
              className={inputClasses}
              value={form.focalLesionsPresence}
              onChange={e => {
                const val = e.target.value;
                const updated: LiverProtocol = {
                  ...form,
                  focalLesionsPresence: val,
                };
                if (val === "не определяются") {
                  updated.focalLesions = "";
                }
                setForm(updated);
                onChange?.(updated);
              }}
            >
              <option value="" />
              <option value="определяются">определяются</option>
              <option value="не определяются">не определяются</option>
            </select>
          </label>
        </div>

        {showFocalTextarea && (
          <div>
            <label className={labelClasses}>
              Описание патологических образований
              <textarea
                rows={3}
                className={inputClasses + " resize-y"}
                value={form.focalLesions}
                onChange={e => updateField("focalLesions", e.target.value)}
              />
            </label>
          </div>
        )}
      </Fieldset>

      {/* Сосуды */}
      <Fieldset title="Сосуды">
        <div>
          <label className={labelClasses}>
            Сосудистый рисунок
            <select
              className={inputClasses}
              value={form.vascularPattern}
              onChange={e => updateField("vascularPattern", e.target.value)}
            >
              <option value="" />
              <option value="не изменен">не изменен</option>
              <option value="обеднен">обеднен</option>
              <option value="усилен">усилен</option>
            </select>
          </label>
        </div>

        <div className="flex items-center gap-4">
          <label className={labelClasses}>
            Воротная вена, диаметр (мм)
            <input
              type="text"
              className={inputClasses}
              value={form.portalVeinDiameter}
              onChange={e => updateField("portalVeinDiameter", e.target.value)}
              onFocus={portalVeinFocus.handleFocus}
              onBlur={portalVeinFocus.handleBlur}
            />
          </label>
          <RangeIndicator
            value={form.portalVeinDiameter}
            normalRange={normalRanges.liver.portalVeinDiameter}
          />
        </div>

        <div className="flex items-center gap-4">
          <label className={labelClasses}>
            Нижняя полая вена, диаметр (мм)
            <input
              type="text"
              className={inputClasses}
              value={form.ivc}
              onChange={e => updateField("ivc", e.target.value)}
              onFocus={ivcFocus.handleFocus}
              onBlur={ivcFocus.handleBlur}
            />
          </label>
          <RangeIndicator
            value={form.ivc}
            normalRange={normalRanges.liver.ivc}
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

export default Hepat;
