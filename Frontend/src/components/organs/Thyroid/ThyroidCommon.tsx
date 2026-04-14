// src/components/organs/Thyroid/ThyroidCommon.tsx
import React, { useEffect } from "react";
import { Fieldset, ButtonSelect } from "@/UI";
import { ResearchSectionCard } from "@/UI/ResearchSectionCard";
import { useFormState, useFieldUpdate } from "@hooks";
import { ThyroidLobe } from "./ThyroidLobe";
import type {
  ThyroidProtocol,
  ThyroidCommonProps,
  ThyroidLobeProtocol,
} from "@/types/organs/thyroid";
import { defaultThyroidState } from "@types";

const RIGHT_LOBE_TITLE = "\u041f\u0440\u0430\u0432\u0430\u044f \u0434\u043e\u043b\u044f";
const LEFT_LOBE_TITLE = "\u041b\u0435\u0432\u0430\u044f \u0434\u043e\u043b\u044f";
const ISTHMUS_TITLE = "\u041f\u0435\u0440\u0435\u0448\u0435\u0435\u043a";
const COMMON_TITLE = "\u041e\u0431\u0449\u0438\u0435 \u043f\u043e\u043a\u0430\u0437\u0430\u0442\u0435\u043b\u0438";
const ISTHMUS_SIZE_LABEL = "\u0420\u0430\u0437\u043c\u0435\u0440 \u043f\u0435\u0440\u0435\u0448\u0435\u0439\u043a\u0430 (\u043c\u043c)";
const SIZE_PLACEHOLDER = "\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u0440\u0430\u0437\u043c\u0435\u0440";
const TOTAL_VOLUME_LABEL = "\u041e\u0431\u0449\u0438\u0439 \u043e\u0431\u044a\u0435\u043c (\u043c\u043b)";
const RIGHT_TO_LEFT_RATIO_LABEL = "\u0421\u043e\u043e\u0442\u043d\u043e\u0448\u0435\u043d\u0438\u0435 \u043f\u0440\u0430\u0432\u043e\u0439 \u043a \u043b\u0435\u0432\u043e\u0439";
const ECHOGENICITY_LABEL = "\u042d\u0445\u043e\u0433\u0435\u043d\u043d\u043e\u0441\u0442\u044c \u0436\u0435\u043b\u0435\u0437\u044b";
const ECHOSTRUCTURE_LABEL = "\u042d\u0445\u043e\u0441\u0442\u0440\u0443\u043a\u0442\u0443\u0440\u0430";
const CONTOUR_LABEL = "\u041a\u043e\u043d\u0442\u0443\u0440";
const SYMMETRY_LABEL = "\u0421\u0438\u043c\u043c\u0435\u0442\u0440\u0438\u0447\u043d\u043e\u0441\u0442\u044c";
const POSITION_LABEL = "\u041f\u043e\u043b\u043e\u0436\u0435\u043d\u0438\u0435";
const ECHOGENICITY_AVERAGE = "\u0441\u0440\u0435\u0434\u043d\u044f\u044f";
const ECHOGENICITY_HIGH = "\u043f\u043e\u0432\u044b\u0448\u0435\u043d\u043d\u0430\u044f";
const ECHOGENICITY_LOW = "\u043f\u043e\u043d\u0438\u0436\u0435\u043d\u043d\u0430\u044f";
const ECHOSTRUCTURE_HOMOGENEOUS = "\u043e\u0434\u043d\u043e\u0440\u043e\u0434\u043d\u0430\u044f";
const ECHOSTRUCTURE_DIFFUSE = "\u0434\u0438\u0444\u0444\u0443\u0437\u043d\u043e-\u043d\u0435\u043e\u0434\u043d\u043e\u0440\u043e\u0434\u043d\u0430\u044f";
const CONTOUR_CLEAR_EVEN = "\u0447\u0435\u0442\u043a\u0438\u0439 \u0440\u043e\u0432\u043d\u044b\u0439";
const CONTOUR_CLEAR_UNEVEN = "\u0447\u0435\u0442\u043a\u0438\u0439 \u043d\u0435 \u0440\u043e\u0432\u043d\u044b\u0439";
const CONTOUR_UNCLEAR = "\u043d\u0435 \u0447\u0435\u0442\u043a\u0438\u0439";
const SYMMETRY_PRESERVED = "\u0441\u043e\u0445\u0440\u0430\u043d\u0435\u043d\u0430";
const SYMMETRY_ASYMMETRIC = "\u0430\u0441\u0441\u0438\u043c\u0435\u0442\u0440\u0438\u0447\u043d\u0430\u044f";
const POSITION_NORMAL = "\u043e\u0431\u044b\u0447\u043d\u043e\u0435";
const POSITION_RIGHT_HEMI = "\u043f\u0440\u0430\u0432\u043e\u0441\u0442\u043e\u0440\u043e\u043d\u043d\u044f\u044f \u0433\u0435\u043c\u0438\u0442\u0438\u0440\u0435\u043e\u0438\u0434\u044d\u043a\u0442\u043e\u043c\u0438\u044f";
const POSITION_LEFT_HEMI = "\u043b\u0435\u0432\u043e\u0441\u0442\u043e\u0440\u043e\u043d\u043d\u044f\u044f \u0433\u0435\u043c\u0438\u0442\u0438\u0440\u0435\u043e\u0438\u0434\u044d\u043a\u0442\u043e\u043c\u0438\u044f";
const POSITION_RESECTION = "\u0440\u0435\u0437\u0435\u043a\u0446\u0438\u044f \u0449\u0438\u0442\u043e\u0432\u0438\u0434\u043d\u043e\u0439 \u0436\u0435\u043b\u0435\u0437\u044b";

const parseVolume = (value: string) => {
  const normalized = value.replace(",", ".").trim();
  if (!normalized) {
    return 0;
  }

  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatComputedValue = (value: number) => {
  if (!Number.isFinite(value) || value <= 0) {
    return "";
  }

  return value.toFixed(2);
};

export const ThyroidCommon: React.FC<ThyroidCommonProps> = ({
  value,
  onChange,
  sectionRefs,
}) => {
  const [form, setForm] = useFormState<ThyroidProtocol>(
    value ?? defaultThyroidState
  );
  const updateField = useFieldUpdate(form, setForm, onChange);

  const rightVolumeValue = parseVolume(form.rightLobe.volume);
  const leftVolumeValue = parseVolume(form.leftLobe.volume);
  const calculatedTotalVolume = rightVolumeValue + leftVolumeValue;
  const calculatedRightToLeftRatio =
    leftVolumeValue > 0 ? rightVolumeValue / leftVolumeValue : 0;

  useEffect(() => {
    const nextTotalVolume = formatComputedValue(calculatedTotalVolume);

    if (form.totalVolume !== nextTotalVolume) {
      const draft = { ...form, totalVolume: nextTotalVolume };
      setForm(draft);
      onChange?.(draft);
    }
  }, [calculatedTotalVolume, form, form.totalVolume, onChange, setForm]);

  useEffect(() => {
    const nextRatio = formatComputedValue(calculatedRightToLeftRatio);

    if (form.rightToLeftRatio !== nextRatio) {
      const draft = { ...form, rightToLeftRatio: nextRatio };
      setForm(draft);
      onChange?.(draft);
    }
  }, [calculatedRightToLeftRatio, form, form.rightToLeftRatio, onChange, setForm]);

  const handleLobeChange =
    (side: "right" | "left") => (lobeValue: ThyroidLobeProtocol) => {
      const draft = {
        ...form,
        [side === "right" ? "rightLobe" : "leftLobe"]: lobeValue,
      };
      setForm(draft);
      onChange?.(draft);
    };

  return (
    <div className="flex flex-col gap-6">
      <div ref={sectionRefs?.["???????????????????? ????????????:???????????? ????????"]}>
        <ResearchSectionCard
          title={RIGHT_LOBE_TITLE}
          headerClassName="bg-sky-500"
        >
          <ThyroidLobe
            side="right"
            value={form.rightLobe}
            onChange={handleLobeChange("right")}
          />
        </ResearchSectionCard>
      </div>

      <div ref={sectionRefs?.["???????????????????? ????????????:?????????? ????????"]}>
        <ResearchSectionCard
          title={LEFT_LOBE_TITLE}
          headerClassName="bg-sky-500"
        >
          <ThyroidLobe
            side="left"
            value={form.leftLobe}
            onChange={handleLobeChange("left")}
          />
        </ResearchSectionCard>
      </div>

      <ResearchSectionCard title={ISTHMUS_TITLE} headerClassName="bg-sky-500">
        <Fieldset title="">
          <div className="max-w-[400px]">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              {ISTHMUS_SIZE_LABEL}
            </label>
            <input
              type="text"
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              value={form.isthmusSize}
              onChange={(e) => updateField("isthmusSize", e.target.value)}
              placeholder={SIZE_PLACEHOLDER}
            />
          </div>
        </Fieldset>
      </ResearchSectionCard>

      <ResearchSectionCard
        title={COMMON_TITLE}
        headerClassName="bg-sky-500"
      >
        <Fieldset title="">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-sky-50 rounded-xl p-4 border border-sky-200">
              <label className="block text-xs font-medium text-sky-700 mb-2">
                {TOTAL_VOLUME_LABEL}
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 bg-white border border-sky-300 rounded-lg text-sky-900 font-semibold"
                value={form.totalVolume}
                readOnly
                disabled
              />
            </div>

            <div className="bg-sky-50 rounded-xl p-4 border border-sky-200">
              <label className="block text-xs font-medium text-sky-700 mb-2">
                {RIGHT_TO_LEFT_RATIO_LABEL}
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 bg-white border border-sky-300 rounded-lg text-sky-900 font-semibold"
                value={form.rightToLeftRatio}
                readOnly
                disabled
              />
            </div>
          </div>

          <div className="space-y-4">
            <ButtonSelect
              label={ECHOGENICITY_LABEL}
              value={form.echogenicity}
              onChange={(val) => updateField("echogenicity", val)}
              options={[
                { value: ECHOGENICITY_AVERAGE, label: ECHOGENICITY_AVERAGE },
                { value: ECHOGENICITY_HIGH, label: ECHOGENICITY_HIGH },
                { value: ECHOGENICITY_LOW, label: ECHOGENICITY_LOW },
              ]}
            />

            <ButtonSelect
              label={ECHOSTRUCTURE_LABEL}
              value={form.echostructure}
              onChange={(val) => updateField("echostructure", val)}
              options={[
                {
                  value: ECHOSTRUCTURE_HOMOGENEOUS,
                  label: ECHOSTRUCTURE_HOMOGENEOUS,
                },
                {
                  value: ECHOSTRUCTURE_DIFFUSE,
                  label: ECHOSTRUCTURE_DIFFUSE,
                },
              ]}
            />

            <ButtonSelect
              label={CONTOUR_LABEL}
              value={form.contour}
              onChange={(val) => updateField("contour", val)}
              options={[
                { value: CONTOUR_CLEAR_EVEN, label: CONTOUR_CLEAR_EVEN },
                { value: CONTOUR_CLEAR_UNEVEN, label: CONTOUR_CLEAR_UNEVEN },
                { value: CONTOUR_UNCLEAR, label: CONTOUR_UNCLEAR },
              ]}
            />

            <ButtonSelect
              label={SYMMETRY_LABEL}
              value={form.symmetry}
              onChange={(val) => updateField("symmetry", val)}
              options={[
                { value: SYMMETRY_PRESERVED, label: SYMMETRY_PRESERVED },
                { value: SYMMETRY_ASYMMETRIC, label: SYMMETRY_ASYMMETRIC },
              ]}
            />

            <ButtonSelect
              label={POSITION_LABEL}
              value={form.position}
              onChange={(val) => updateField("position", val)}
              options={[
                { value: POSITION_NORMAL, label: POSITION_NORMAL },
                { value: POSITION_RIGHT_HEMI, label: POSITION_RIGHT_HEMI },
                { value: POSITION_LEFT_HEMI, label: POSITION_LEFT_HEMI },
                { value: POSITION_RESECTION, label: POSITION_RESECTION },
              ]}
            />
          </div>
        </Fieldset>
      </ResearchSectionCard>
    </div>
  );
};

export default ThyroidCommon;
