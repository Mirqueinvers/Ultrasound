// src/components/organs/Pleural/PleuralSide.tsx
import React, { useEffect } from "react";
import { ButtonSelect, Fieldset, SizeRow } from "@/UI";
import { useFormState, useFieldUpdate } from "@hooks";
import type { PleuralSideProtocol, PleuralSideProps } from "@/types/organs/pleural";
import { defaultPleuralSideState } from "@/types";

const SITTING_METHOD = "sitting";
const LYING_METHOD = "lying";
const ESTIMATED_METHOD = "estimated";

export const PleuralSide: React.FC<PleuralSideProps> = ({ value, onChange }) => {
  const initialValue: PleuralSideProtocol = {
    ...defaultPleuralSideState,
    ...(value || {}),
    volumeMethods: value?.volumeMethods ?? defaultPleuralSideState.volumeMethods,
  };

  const [form, setForm] = useFormState<PleuralSideProtocol>(initialValue);
  const updateField = useFieldUpdate(form, setForm, onChange);

  const isFluidDetected = form.presence === "определяется";
  const hasSittingMethod = form.volumeMethods.includes(SITTING_METHOD);
  const hasLyingMethod = form.volumeMethods.includes(LYING_METHOD);
  const hasEstimatedMethod = form.volumeMethods.includes(ESTIMATED_METHOD);

  const commitForm = (draft: PleuralSideProtocol) => {
    setForm(draft);
    onChange?.(draft);
  };

  const handlePresenceChange = (nextPresence: string) => {
    if (nextPresence === "определяется") {
      updateField("presence", nextPresence);
      return;
    }

    const cleared: PleuralSideProtocol = {
      ...form,
      presence: "не определяется",
      volumeMethods: [],
      sittingBasalDistance: "",
      sittingMaxHeight: "",
      lyingMaxDistance: "",
      volumeSitting: "",
      volumeLying: "",
      volumeEstimated: "",
      content: "",
    };

    commitForm(cleared);
  };

  const toggleMethod = (method: string) => {
    const isActive = form.volumeMethods.includes(method);
    const nextMethods = isActive
      ? form.volumeMethods.filter((m) => m !== method)
      : [...form.volumeMethods, method];

    const draft: PleuralSideProtocol = {
      ...form,
      volumeMethods: nextMethods,
    };

    if (isActive && method === SITTING_METHOD) {
      draft.sittingBasalDistance = "";
      draft.sittingMaxHeight = "";
      draft.volumeSitting = "";
    }

    if (isActive && method === LYING_METHOD) {
      draft.lyingMaxDistance = "";
      draft.volumeLying = "";
    }

    if (isActive && method === ESTIMATED_METHOD) {
      draft.volumeEstimated = "";
    }

    commitForm(draft);
  };

  useEffect(() => {
    if (!isFluidDetected || !hasSittingMethod) return;

    const basalDistance = parseFloat(form.sittingBasalDistance);
    const maxHeight = parseFloat(form.sittingMaxHeight);

    if (!Number.isNaN(basalDistance) && !Number.isNaN(maxHeight)) {
      const calculated = (70 * (basalDistance + maxHeight)).toFixed(1);
      if (calculated !== form.volumeSitting) {
        updateField("volumeSitting", calculated);
      }
      return;
    }

    if (form.volumeSitting) {
      updateField("volumeSitting", "");
    }
  }, [
    form.sittingBasalDistance,
    form.sittingMaxHeight,
    form.volumeSitting,
    isFluidDetected,
    hasSittingMethod,
    updateField,
  ]);

  useEffect(() => {
    if (!isFluidDetected || !hasLyingMethod) return;

    const maxDistance = parseFloat(form.lyingMaxDistance);

    if (!Number.isNaN(maxDistance)) {
      const calculated = (20 * maxDistance).toFixed(1);
      if (calculated !== form.volumeLying) {
        updateField("volumeLying", calculated);
      }
      return;
    }

    if (form.volumeLying) {
      updateField("volumeLying", "");
    }
  }, [
    form.lyingMaxDistance,
    form.volumeLying,
    isFluidDetected,
    hasLyingMethod,
    updateField,
  ]);

  return (
    <div className="space-y-6">
      <Fieldset title="">
        <div className="space-y-5">
          <ButtonSelect
            label="Жидкость"
            value={form.presence}
            onChange={handlePresenceChange}
            options={[
              { value: "не определяется", label: "не определяется" },
              { value: "определяется", label: "определяется" },
            ]}
          />

          {isFluidDetected && (
            <>
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-slate-700">
                  Определение объема
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => toggleMethod(SITTING_METHOD)}
                    className={[
                      "inline-flex items-center justify-center px-3.5 py-1.5 text-sm font-medium rounded-full border transition-all duration-200",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-1",
                      hasSittingMethod
                        ? "bg-sky-500 text-white border-sky-500 shadow-sm shadow-sky-300"
                        : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200 hover:border-slate-300",
                    ].join(" ")}
                  >
                    1. Сидя
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleMethod(LYING_METHOD)}
                    className={[
                      "inline-flex items-center justify-center px-3.5 py-1.5 text-sm font-medium rounded-full border transition-all duration-200",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-1",
                      hasLyingMethod
                        ? "bg-sky-500 text-white border-sky-500 shadow-sm shadow-sky-300"
                        : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200 hover:border-slate-300",
                    ].join(" ")}
                  >
                    2. Лежа
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleMethod(ESTIMATED_METHOD)}
                    className={[
                      "inline-flex items-center justify-center px-3.5 py-1.5 text-sm font-medium rounded-full border transition-all duration-200",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-1",
                      hasEstimatedMethod
                        ? "bg-sky-500 text-white border-sky-500 shadow-sm shadow-sky-300"
                        : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200 hover:border-slate-300",
                    ].join(" ")}
                  >
                    3. На глаз
                  </button>
                </div>
              </div>

              {hasSittingMethod && (
                <Fieldset title="1. Определение объема сидя (70 x (базальное расстояние + максимальная высота выпота))">
                  <div className="space-y-3">
                    <SizeRow
                      label="Базальное расстояние (мм)"
                      value={form.sittingBasalDistance}
                      onChange={(val) => updateField("sittingBasalDistance", val)}
                    />
                    <SizeRow
                      label="Максимальная высота выпота (мм)"
                      value={form.sittingMaxHeight}
                      onChange={(val) => updateField("sittingMaxHeight", val)}
                    />
                    <SizeRow
                      label="Объем сидя (мл)"
                      value={form.volumeSitting}
                      onChange={() => {}}
                      readOnly
                      autoCalculated
                    />
                  </div>
                </Fieldset>
              )}

              {hasLyingMethod && (
                <Fieldset title="2. Определение объема лежа (20 x максимальное расстояние между плевральными листками)">
                  <div className="space-y-3">
                    <SizeRow
                      label="Максимальное расстояние (мм)"
                      value={form.lyingMaxDistance}
                      onChange={(val) => updateField("lyingMaxDistance", val)}
                    />
                    <SizeRow
                      label="Объем лежа (мл)"
                      value={form.volumeLying}
                      onChange={() => {}}
                      readOnly
                      autoCalculated
                    />
                  </div>
                </Fieldset>
              )}

              {hasEstimatedMethod && (
                <Fieldset title="3. Определение объема на глаз">
                  <SizeRow
                    label="Объем на глаз (мл)"
                    value={form.volumeEstimated}
                    onChange={(val) => updateField("volumeEstimated", val)}
                  />
                </Fieldset>
              )}

              <ButtonSelect
                label="Содержимое"
                value={form.content}
                onChange={(val) => updateField("content", val)}
                options={[
                  { value: "анэхогенное", label: "анэхогенное" },
                  {
                    value: "анэхогенное с мелкодисперсной взвесью",
                    label: "анэхогенное с мелкодисперсной взвесью",
                  },
                  { value: "неоднородное", label: "неоднородное" },
                  { value: "эхогенная взвесь", label: "эхогенная взвесь" },
                ]}
              />
            </>
          )}
        </div>
      </Fieldset>
    </div>
  );
};

export default PleuralSide;
