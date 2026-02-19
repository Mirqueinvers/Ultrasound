// src/components/organs/BrachioCephalicArteries/Artery.tsx
import React from "react";
import { Fieldset, ButtonSelect } from "@/UI";
import { useFormState, useFieldUpdate } from "@hooks";
import { useFieldFocus } from "@hooks";
import { Plus, Trash2 } from "lucide-react";
import { BrachioCephalicFormation } from "./BrachioCephalicFormation";
import type {
  ArteryProtocol,
  ArteryProps,
  BrachioCephalicFormationProps,
} from "@/types/organs/brachioCephalicArteries";
import { defaultArteryState } from "@/types";

const parseNumber = (value: string): number | null => {
  const normalized = value.replace(",", ".").trim();
  if (!normalized) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
};

const calculateResistanceIndex = (psv: string, edv: string): string => {
  const psvValue = parseNumber(psv);
  const edvValue = parseNumber(edv);
  if (psvValue === null || edvValue === null || psvValue <= 0) return "";
  return ((psvValue - edvValue) / psvValue).toFixed(2);
};

const calculateIcaCcaRatio = (icaPsv: string, ccaPsv: string): string => {
  const ica = parseNumber(icaPsv);
  const cca = parseNumber(ccaPsv);
  if (ica === null || cca === null || ica <= 0) return "";
  return (cca / ica).toFixed(2);
};

const getNewPlaque = (number: number) => ({
  number,
  localizationSegment: "проксимальный сегмент",
  wall: "по задней",
  thickness: "",
  length: "",
  echostructure: "гипоэхогенная",
  surface: "ровная",
  vesselWidthNormal: "",
  vesselWidthStenosis: "",
  stenosisDegree: "",
  velocityProximal: "",
  velocityStenosis: "",
  velocityDistal: "",
});

const compactInputClass =
  "w-full max-w-sm px-3 py-2 border border-slate-300 rounded-lg text-sm transition-all focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500";

const compactAutoInputClass =
  "w-full max-w-sm px-3 py-2 border border-sky-300 rounded-lg bg-gradient-to-r from-sky-50 to-blue-50 text-sm font-semibold text-sky-900 cursor-not-allowed";

export const Artery: React.FC<ArteryProps & { commonCarotidPsv?: string }> = ({
  artery,
  value,
  onChange,
  commonCarotidPsv = "",
  mode = "main",
  sinusTitle = "Каротидный синус",
}) => {
  const initialValue: ArteryProtocol = {
    ...defaultArteryState,
    ...(value || {}),
    plaquesList: value?.plaquesList || [],
    sinusPlaquesList: value?.sinusPlaquesList || [],
  };

  const [form, setForm] = useFormState<ArteryProtocol>(initialValue);
  const updateField = useFieldUpdate(form, setForm, onChange);

  React.useEffect(() => {
    const nextValue: ArteryProtocol = {
      ...defaultArteryState,
      ...(value || {}),
      plaquesList: value?.plaquesList || [],
      sinusPlaquesList: value?.sinusPlaquesList || [],
    };

    const currentSerialized = JSON.stringify(form);
    const nextSerialized = JSON.stringify(nextValue);
    if (currentSerialized !== nextSerialized) {
      setForm(nextValue);
    }
  }, [value]);

  const isCommonCarotid = artery === "commonCarotidRight" || artery === "commonCarotidLeft";
  const isInternalCarotid = artery === "internalCarotidRight" || artery === "internalCarotidLeft";
  const isExternalCarotid = artery === "externalCarotidRight" || artery === "externalCarotidLeft";
  const isVertebral = artery === "vertebralRight" || artery === "vertebralLeft";
  const isSubclavian = artery === "subclavianRight" || artery === "subclavianLeft";
  const supportsPlaques =
    isCommonCarotid || isInternalCarotid || isExternalCarotid || isVertebral || isSubclavian;

  const diameterField =
    isCommonCarotid
      ? "commonCarotidDiameter"
      : isInternalCarotid
        ? "internalCarotidDiameter"
        : isVertebral
          ? "vertebralDiameter"
          : undefined;
  const kimField =
    mode === "sinus"
      ? "sinusKim"
      : isCommonCarotid
        ? "commonCarotidKim"
        : isSubclavian
          ? "subclavianKim"
          : undefined;
  const psvField =
    isCommonCarotid
      ? "commonCarotidPsv"
      : isInternalCarotid
        ? "internalCarotidPsv"
        : isExternalCarotid
          ? "externalCarotidPsv"
          : isVertebral
            ? "vertebralPsv"
            : isSubclavian
              ? "subclavianPsv"
              : undefined;
  const edvField =
    isCommonCarotid
      ? "commonCarotidEdv"
      : isInternalCarotid
        ? "internalCarotidEdv"
        : isExternalCarotid
          ? "externalCarotidEdv"
          : isVertebral
            ? "vertebralEdv"
            : undefined;

  const diameterFocus = useFieldFocus("brachioCephalicArteries", diameterField);
  const kimFocus = useFieldFocus("brachioCephalicArteries", kimField);
  const psvFocus = useFieldFocus("brachioCephalicArteries", psvField);
  const edvFocus = useFieldFocus("brachioCephalicArteries", edvField);

  React.useEffect(() => {
    if (isSubclavian) return;
    if (mode !== "main") return;
    const calculatedRi = calculateResistanceIndex(
      form.peakSystolicVelocity,
      form.endDiastolicVelocity
    );
    if (calculatedRi !== form.resistanceIndex) {
      const updated = { ...form, resistanceIndex: calculatedRi };
      setForm(updated);
      onChange?.(updated);
    }
  }, [form.peakSystolicVelocity, form.endDiastolicVelocity, mode, isSubclavian]);

  React.useEffect(() => {
    if (mode !== "main" || !isInternalCarotid) return;
    const calculatedRatio = calculateIcaCcaRatio(form.peakSystolicVelocity, commonCarotidPsv);
    if (calculatedRatio !== form.icaCcaRatio) {
      const updated = { ...form, icaCcaRatio: calculatedRatio };
      setForm(updated);
      onChange?.(updated);
    }
  }, [form.peakSystolicVelocity, commonCarotidPsv, isInternalCarotid, mode]);

  const handlePlaquesToggle = (val: string) => {
    const updated = {
      ...form,
      plaques: val,
      plaquesList: val === "определяются" ? form.plaquesList : [],
    };
    setForm(updated);
    onChange?.(updated);
  };

  const handleAddPlaque = () => {
    const updated = {
      ...form,
      plaquesList: [...form.plaquesList, getNewPlaque(form.plaquesList.length + 1)],
    };
    setForm(updated);
    onChange?.(updated);
  };

  const handleUpdatePlaque = (
    index: number,
    field: keyof BrachioCephalicFormationProps["formation"],
    fieldValue: string | number
  ) => {
    const updated = {
      ...form,
      plaquesList: form.plaquesList.map((plaque, i) =>
        i === index ? { ...plaque, [field]: fieldValue } : plaque
      ),
    };
    setForm(updated);
    onChange?.(updated);
  };

  const handleRemovePlaque = (index: number) => {
    const updatedList = form.plaquesList
      .filter((_, i) => i !== index)
      .map((plaque, i) => ({ ...plaque, number: i + 1 }));
    const updated = { ...form, plaquesList: updatedList };
    setForm(updated);
    onChange?.(updated);
  };

  const handleSinusPlaquesToggle = (val: string) => {
    const updated = {
      ...form,
      sinusPlaques: val,
      sinusPlaquesList: val === "определяются" ? form.sinusPlaquesList : [],
    };
    setForm(updated);
    onChange?.(updated);
  };

  const handleAddSinusPlaque = () => {
    const updated = {
      ...form,
      sinusPlaquesList: [
        ...form.sinusPlaquesList,
        getNewPlaque(form.sinusPlaquesList.length + 1),
      ],
    };
    setForm(updated);
    onChange?.(updated);
  };

  const handleUpdateSinusPlaque = (
    index: number,
    field: keyof BrachioCephalicFormationProps["formation"],
    fieldValue: string | number
  ) => {
    const updated = {
      ...form,
      sinusPlaquesList: form.sinusPlaquesList.map((plaque, i) =>
        i === index ? { ...plaque, [field]: fieldValue } : plaque
      ),
    };
    setForm(updated);
    onChange?.(updated);
  };

  const handleRemoveSinusPlaque = (index: number) => {
    const updatedList = form.sinusPlaquesList
      .filter((_, i) => i !== index)
      .map((plaque, i) => ({ ...plaque, number: i + 1 }));
    const updated = { ...form, sinusPlaquesList: updatedList };
    setForm(updated);
    onChange?.(updated);
  };

  const renderPlaqueList = (
    items: ArteryProtocol["plaquesList"],
    onAdd: () => void,
    onRemove: (index: number) => void,
    onUpdate: (
      index: number,
      field: keyof BrachioCephalicFormationProps["formation"],
      fieldValue: string | number
    ) => void,
    emptyText: string
  ) => {
    if (items.length === 0) {
      return (
        <div className="text-center py-8 bg-slate-50 rounded-lg border-2 border-dashed border-slate-300">
          <p className="text-slate-500 text-sm mb-4">{emptyText}</p>
          <button
            type="button"
            onClick={onAdd}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-all shadow-md hover:shadow-lg font-medium"
          >
            <Plus size={18} />
            Добавить бляшку
          </button>
        </div>
      );
    }

    return (
      <>
        {items.map((plaque, index) => (
          <div
            key={index}
            className="bg-gradient-to-br from-white to-slate-50 rounded-xl border border-slate-200 shadow-md overflow-hidden transition-all hover:shadow-lg"
          >
            <div className="bg-sky-500 px-4 py-2 flex items-center justify-between">
              <span className="text-white font-bold text-sm">Бляшка #{plaque.number}</span>
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="text-white hover:bg-white/20 p-1.5 rounded-lg transition-colors"
                title="Удалить бляшку"
              >
                <Trash2 size={16} />
              </button>
            </div>
            <div className="p-4">
              <BrachioCephalicFormation
                formation={plaque}
                onUpdate={(field, fieldValue) => onUpdate(index, field, fieldValue)}
                onRemove={() => onRemove(index)}
              />
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={onAdd}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-dashed border-sky-300 text-sky-600 rounded-xl hover:bg-sky-50 hover:border-sky-400 transition-all font-medium"
        >
          <Plus size={18} />
          Добавить бляшку
        </button>
      </>
    );
  };

  if (mode === "sinus") {
    return (
      <div className="space-y-6">
        <Fieldset title={sinusTitle}>
          <div className="space-y-4">
            <ButtonSelect
              label="Проходимость"
              value={form.sinusPatency}
              onChange={(val) => updateField("sinusPatency", val)}
              options={[
                { value: "проходим", label: "проходим" },
                { value: "сужен", label: "сужен" },
                { value: "резко сужена", label: "резко сужена" },
              ]}
            />

            <ButtonSelect
              label="Поток"
              value={form.sinusFlow}
              onChange={(val) => updateField("sinusFlow", val)}
              options={[
                { value: "ламинарный", label: "ламинарный" },
                { value: "турбулентный", label: "турбулентный" },
              ]}
            />

            <ButtonSelect
              label="Стенка"
              value={form.sinusIntimaMediaThickness}
              onChange={(val) => {
                const updated = {
                  ...form,
                  sinusIntimaMediaThickness: val,
                  sinusIntimaMediaThicknessValue:
                    val === "утолщена" ? form.sinusIntimaMediaThicknessValue : "",
                };
                setForm(updated);
                onChange?.(updated);
              }}
              options={[
                { value: "не утолщена", label: "не утолщена" },
                { value: "утолщена", label: "утолщена" },
              ]}
            />

            {(form.sinusIntimaMediaThickness === "утолщена" ||
              form.sinusIntimaMediaThickness === "утолщен") && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Толщина стенки синуса (мм)
                </label>
                <input
                  type="text"
                  className={compactInputClass}
                  value={form.sinusIntimaMediaThicknessValue}
                  onChange={(e) =>
                    updateField("sinusIntimaMediaThicknessValue", e.target.value)
                  }
                  onFocus={kimFocus.handleFocus}
                  onBlur={kimFocus.handleBlur}
                  placeholder="Введите значение"
                />
              </div>
            )}

            <ButtonSelect
              label="Бляшки"
              value={form.sinusPlaques}
              onChange={handleSinusPlaquesToggle}
              options={[
                { value: "не определяются", label: "не определяются" },
                { value: "определяются", label: "определяются" },
              ]}
            />

            {form.sinusPlaques === "определяются" && (
              <div className="mt-4 space-y-4">
                {renderPlaqueList(
                  form.sinusPlaquesList,
                  handleAddSinusPlaque,
                  handleRemoveSinusPlaque,
                  handleUpdateSinusPlaque,
                  "Бляшки синуса не добавлены"
                )}
              </div>
            )}
          </div>
        </Fieldset>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Fieldset title="">
        {isCommonCarotid && (
          <div className="space-y-4 mb-4">
            <ButtonSelect
              label="Проходимость"
              value={form.patency}
              onChange={(val) => updateField("patency", val)}
              options={[
                { value: "проходима", label: "проходима" },
                { value: "сужена", label: "сужена" },
                { value: "резко сужена", label: "резко сужена" },
              ]}
            />

            <ButtonSelect
              label="Ход сосуда"
              value={form.vesselCourse}
              onChange={(val) => updateField("vesselCourse", val)}
              options={[
                { value: "прямолинейный", label: "прямолинейный" },
                { value: "S-образный", label: "S-образный" },
                { value: "перегиб", label: "перегиб" },
                { value: "петлеобразный", label: "петлеобразный" },
              ]}
            />

            <ButtonSelect
              label="Стенка"
              value={form.commonWallState}
              onChange={(val) => updateField("commonWallState", val)}
              options={[
                { value: "не утолщена", label: "не утолщена" },
                { value: "утолщена", label: "утолщена" },
              ]}
            />

            <div className="space-y-4">
              <ButtonSelect
                label="Бляшки"
                value={form.plaques}
                onChange={handlePlaquesToggle}
                options={[
                  { value: "не определяются", label: "не определяются" },
                  { value: "определяются", label: "определяются" },
                ]}
              />

              {form.plaques === "определяются" && (
                <div className="mt-4 space-y-4">
                  {renderPlaqueList(
                    form.plaquesList,
                    handleAddPlaque,
                    handleRemovePlaque,
                    handleUpdatePlaque,
                    "Бляшки не добавлены"
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">КИМ (мм)</label>
              <input
                type="text"
                className={compactInputClass}
                value={form.intimaMediaThickness}
                onChange={(e) => updateField("intimaMediaThickness", e.target.value)}
                onFocus={kimFocus.handleFocus}
                onBlur={kimFocus.handleBlur}
                placeholder="Введите значение"
              />
            </div>

            <ButtonSelect
              label="Тип кровотока"
              value={form.commonFlowType}
              onChange={(val) => updateField("commonFlowType", val)}
              options={[
                { value: "ламинарный", label: "ламинарный" },
                { value: "турбулентный", label: "турбулентный" },
                { value: "реверсивный", label: "реверсивный" },
                { value: "двунаправленный", label: "двунаправленный" },
              ]}
            />
          </div>
        )}

        {isInternalCarotid && (
          <div className="space-y-4 mb-4">
            <ButtonSelect
              label="Проходимость"
              value={form.patency}
              onChange={(val) => updateField("patency", val)}
              options={[
                { value: "проходима", label: "проходима" },
                { value: "сужена", label: "сужена" },
                { value: "резко сужена", label: "резко сужена" },
              ]}
            />

            <ButtonSelect
              label="Ход сосуда"
              value={form.vesselCourse}
              onChange={(val) => updateField("vesselCourse", val)}
              options={[
                { value: "прямолинейный", label: "прямолинейный" },
                { value: "S-образный", label: "S-образный" },
                { value: "перегиб", label: "перегиб" },
                { value: "петлеобразный", label: "петлеобразный" },
              ]}
            />

            <ButtonSelect
              label="Стенка"
              value={form.intimaMediaThickness}
              onChange={(val) => {
                const updated = {
                  ...form,
                  intimaMediaThickness: val,
                  intimaMediaThicknessValue: val === "утолщена" ? form.intimaMediaThicknessValue : "",
                };
                setForm(updated);
                onChange?.(updated);
              }}
              options={[
                { value: "не утолщена", label: "не утолщена" },
                { value: "утолщена", label: "утолщена" },
              ]}
            />

            <ButtonSelect
              label="Тип кровотока"
              value={form.internalFlowType}
              onChange={(val) => updateField("internalFlowType", val)}
              options={[
                { value: "ламинарный", label: "ламинарный" },
                { value: "турбулентный", label: "турбулентный" },
                { value: "реверсивный", label: "реверсивный" },
                { value: "двунаправленный", label: "двунаправленный" },
              ]}
            />

            {(form.intimaMediaThickness === "утолщена" ||
              form.intimaMediaThickness === "утолщен") && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Толщина стенки ВСА (мм)
                </label>
                <input
                  type="text"
                  className={compactInputClass}
                  value={form.intimaMediaThicknessValue}
                  onChange={(e) => updateField("intimaMediaThicknessValue", e.target.value)}
                  onFocus={kimFocus.handleFocus}
                  onBlur={kimFocus.handleBlur}
                  placeholder="Введите значение"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Диаметр ВСА (мм)</label>
              <input
                type="text"
                className={compactInputClass}
                value={form.diameter}
                onChange={(e) => updateField("diameter", e.target.value)}
                onFocus={diameterFocus.handleFocus}
                onBlur={diameterFocus.handleBlur}
                placeholder="Введите значение"
              />
            </div>
          </div>
        )}

        {isExternalCarotid && (
          <div className="space-y-4 mb-4">
            <ButtonSelect
              label="Проходимость"
              value={form.patency}
              onChange={(val) => updateField("patency", val)}
              options={[
                { value: "проходима", label: "проходима" },
                { value: "сужена", label: "сужена" },
                { value: "резко сужена", label: "резко сужена" },
              ]}
            />

            <ButtonSelect
              label="Ход"
              value={form.vesselCourse}
              onChange={(val) => updateField("vesselCourse", val)}
              options={[
                { value: "прямолинейный", label: "прямолинейный" },
                { value: "S-образный", label: "S-образный" },
              ]}
            />
          </div>
        )}

        {isVertebral && (
          <div className="space-y-4 mb-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Диаметр (мм)
              </label>
              <input
                type="text"
                className={compactInputClass}
                value={form.diameter}
                onChange={(e) => updateField("diameter", e.target.value)}
                onFocus={diameterFocus.handleFocus}
                onBlur={diameterFocus.handleBlur}
                placeholder="Введите значение"
              />
            </div>

            <ButtonSelect
              label="Направление кровотока"
              value={form.flowDirection}
              onChange={(val) => updateField("flowDirection", val)}
              options={[
                { value: "антеградный", label: "антеградный" },
                { value: "ретроградный", label: "ретроградный" },
                { value: "бидирекционный", label: "бидирекционный" },
              ]}
            />
          </div>
        )}

        {isSubclavian && (
          <div className="space-y-4 mb-4">
            <ButtonSelect
              label="Ход сосуда"
              value={form.vesselCourse}
              onChange={(val) => updateField("vesselCourse", val)}
              options={[
                { value: "прямолинейный", label: "прямолинейный" },
                { value: "S-образный", label: "S-образный" },
              ]}
            />

            <ButtonSelect
              label="Поток"
              value={form.flowType}
              onChange={(val) => updateField("flowType", val)}
              options={[
                { value: "магистральный трехфазный", label: "магистральный трехфазный" },
                { value: "магистральный двухфазный", label: "магистральный двухфазный" },
                { value: "монофазный", label: "монофазный" },
                { value: "высокоскоростной турбулентный", label: "высокоскоростной турбулентный" },
              ]}
            />

            <ButtonSelect
              label="Стенка"
              value={form.intimaMediaThickness}
              onChange={(val) => {
                const updated = {
                  ...form,
                  intimaMediaThickness: val,
                  intimaMediaThicknessValue:
                    val === "утолщена" || val === "утолщен"
                      ? form.intimaMediaThicknessValue
                      : "",
                };
                setForm(updated);
                onChange?.(updated);
              }}
              options={[
                { value: "не утолщена", label: "не утолщена" },
                { value: "утолщена", label: "утолщена" },
              ]}
            />

            {(form.intimaMediaThickness === "утолщена" ||
              form.intimaMediaThickness === "утолщен") && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Толщина стенки подключичной артерии (мм)
                </label>
                <input
                  type="text"
                  className={compactInputClass}
                  value={form.intimaMediaThicknessValue}
                  onChange={(e) => updateField("intimaMediaThicknessValue", e.target.value)}
                  onFocus={kimFocus.handleFocus}
                  onBlur={kimFocus.handleBlur}
                  placeholder="Введите значение"
                />
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 mb-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Пиковая систолическая скорость
            </label>
            <input
              type="text"
              className={compactInputClass}
              value={form.peakSystolicVelocity}
              onChange={(e) => updateField("peakSystolicVelocity", e.target.value)}
              onFocus={psvFocus.handleFocus}
              onBlur={psvFocus.handleBlur}
              placeholder="Введите значение"
            />
          </div>

          {!isSubclavian && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Конечная диастолическая скорость
              </label>
              <input
                type="text"
                className={compactInputClass}
                value={form.endDiastolicVelocity}
                onChange={(e) => updateField("endDiastolicVelocity", e.target.value)}
                onFocus={edvFocus.handleFocus}
                onBlur={edvFocus.handleBlur}
                placeholder="Введите значение"
              />
            </div>
          )}
        </div>

        {!isSubclavian && (
          <div className="mb-4">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Индекс резистентности (автоматически)
            </label>
            <input
              type="text"
              className={compactAutoInputClass}
              value={form.resistanceIndex}
              readOnly
              disabled
              placeholder="авто"
            />
          </div>
        )}

        {isInternalCarotid && (
          <div className="mb-4">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              ICA / CCA ratio (автоматически)
            </label>
            <input
              type="text"
              className={compactAutoInputClass}
              value={form.icaCcaRatio}
              readOnly
              disabled
              placeholder="авто"
            />
          </div>
        )}

        {supportsPlaques && !isCommonCarotid && (
          <div className="space-y-4 mb-4">
            <ButtonSelect
              label="Бляшки"
              value={form.plaques}
              onChange={handlePlaquesToggle}
              options={[
                { value: "не определяются", label: "не определяются" },
                { value: "определяются", label: "определяются" },
              ]}
            />

            {form.plaques === "определяются" && (
              <div className="mt-4 space-y-4">
                {renderPlaqueList(
                  form.plaquesList,
                  handleAddPlaque,
                  handleRemovePlaque,
                  handleUpdatePlaque,
                  "Бляшки не добавлены"
                )}
              </div>
            )}
          </div>
        )}
      </Fieldset>
    </div>
  );
};

export default Artery;
