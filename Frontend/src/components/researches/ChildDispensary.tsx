// Frontend/src/components/researches/ChildDispensary.tsx
import React, { useState } from "react";
import Hepat from "@organs/Hepat";
import Gallbladder from "@/components/organs/Gallbladder/Gallbladder";
import Pancreas from "@organs/Pancreas";
import Spleen from "@organs/Spleen";
import KidneyCommon from "@organs/Kidney/KidneyCommon";
import { Conclusion } from "@common";
import { ButtonSelect } from "@/UI";
import { useResearch } from "@contexts";

import type {
  ChildDispensaryProtocol,
  ChildDispensaryProps,
  LiverProtocol,
  GallbladderProtocol,
  PancreasProtocol,
  SpleenProtocol,
  KidneyProtocol,
} from "@types";
import { defaultChildDispensaryState } from "@types";

export const ChildDispensary: React.FC<ChildDispensaryProps> = ({
  value,
  onChange,
}) => {
  const [form, setForm] = useState<ChildDispensaryProtocol>(
    value ?? defaultChildDispensaryState
  );

  const { setStudyData } = useResearch();

  const sync = (updated: ChildDispensaryProtocol) => {
    setForm(updated);
    setStudyData("Детская диспансеризация", updated);
    onChange?.(updated);
  };

  const updateField = (field: keyof ChildDispensaryProtocol, value: any) => {
    sync({ ...form, [field]: value });
  };

  const updateLiverStatus = (status: string) => {
    const updated: ChildDispensaryProtocol = {
      ...form,
      liverStatus: status,
      liver: status === "без патологии" ? null : form.liver,
    };
    sync(updated);
  };

  const updateGallbladderStatus = (status: string) => {
    const updated: ChildDispensaryProtocol = {
      ...form,
      gallbladderStatus: status,
      gallbladder: status === "без патологии" ? null : form.gallbladder,
    };
    sync(updated);
  };

  const updatePancreasStatus = (status: string) => {
    const updated: ChildDispensaryProtocol = {
      ...form,
      pancreasStatus: status,
      pancreas: status === "без патологии" ? null : form.pancreas,
    };
    sync(updated);
  };

  const updateSpleenStatus = (status: string) => {
    const updated: ChildDispensaryProtocol = {
      ...form,
      spleenStatus: status,
      spleen: status === "без патологии" ? null : form.spleen,
    };
    sync(updated);
  };

  const updateKidneysStatus = (status: string) => {
    const updated: ChildDispensaryProtocol = {
      ...form,
      kidneysStatus: status,
      rightKidney: status === "без патологии" ? null : form.rightKidney,
      leftKidney: status === "без патологии" ? null : form.leftKidney,
    };
    sync(updated);
  };

  const updateConclusion = (conclusionData: {
    conclusion: string;
    recommendations: string;
  }) => {
    sync({
      ...form,
      conclusion: conclusionData.conclusion,
      recommendations: conclusionData.recommendations,
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="text-2xl font-semibold text-center mt-2 mb-4">
        Детская диспансеризация
      </div>

      {/* Печень */}
      <div className="border border-slate-200 rounded-lg p-5 bg-slate-50">
        <h3 className="text-lg font-semibold text-slate-700 mb-4">Печень</h3>
        <ButtonSelect
          label=""
          value={form.liverStatus}
          onChange={updateLiverStatus}
          options={[
            { value: "без патологии", label: "без патологии" },
            { value: "патология", label: "патология" },
          ]}
        />
        {form.liverStatus === "патология" && (
          <div className="mt-4">
            <Hepat
              value={form.liver ?? undefined}
              onChange={(data: LiverProtocol) => updateField("liver", data)}
            />
          </div>
        )}
      </div>

      {/* Желчный пузырь */}
      <div className="border border-slate-200 rounded-lg p-5 bg-slate-50">
        <h3 className="text-lg font-semibold text-slate-700 mb-4">
          Желчный пузырь
        </h3>
        <ButtonSelect
          label=""
          value={form.gallbladderStatus}
          onChange={updateGallbladderStatus}
          options={[
            { value: "без патологии", label: "без патологии" },
            { value: "патология", label: "патология" },
          ]}
        />
        {form.gallbladderStatus === "патология" && (
          <div className="mt-4">
            <Gallbladder
              value={form.gallbladder ?? undefined}
              onChange={(data: GallbladderProtocol) =>
                updateField("gallbladder", data)
              }
            />
          </div>
        )}
      </div>

      {/* Поджелудочная железа */}
      <div className="border border-slate-200 rounded-lg p-5 bg-slate-50">
        <h3 className="text-lg font-semibold text-slate-700 mb-4">
          Поджелудочная железа
        </h3>
        <ButtonSelect
          label=""
          value={form.pancreasStatus}
          onChange={updatePancreasStatus}
          options={[
            { value: "без патологии", label: "без патологии" },
            { value: "патология", label: "патология" },
          ]}
        />
        {form.pancreasStatus === "патология" && (
          <div className="mt-4">
            <Pancreas
              value={form.pancreas ?? undefined}
              onChange={(data: PancreasProtocol) =>
                updateField("pancreas", data)
              }
            />
          </div>
        )}
      </div>

      {/* Селезенка */}
      <div className="border border-slate-200 rounded-lg p-5 bg-slate-50">
        <h3 className="text-lg font-semibold text-slate-700 mb-4">Селезенка</h3>
        <ButtonSelect
          label=""
          value={form.spleenStatus}
          onChange={updateSpleenStatus}
          options={[
            { value: "без патологии", label: "без патологии" },
            { value: "патология", label: "патология" },
          ]}
        />
        {form.spleenStatus === "патология" && (
          <div className="mt-4">
            <Spleen
              value={form.spleen ?? undefined}
              onChange={(data: SpleenProtocol) => updateField("spleen", data)}
            />
          </div>
        )}
      </div>

      {/* Почки */}
      <div className="border border-slate-200 rounded-lg p-5 bg-slate-50">
        <h3 className="text-lg font-semibold text-slate-700 mb-4">Почки</h3>
        <ButtonSelect
          label=""
          value={form.kidneysStatus}
          onChange={updateKidneysStatus}
          options={[
            { value: "без патологии", label: "без патологии" },
            { value: "патология", label: "патология" },
          ]}
        />
        {form.kidneysStatus === "патология" && (
          <div className="mt-4 flex flex-col gap-6">
            <div className="border border-slate-300 rounded-lg p-4 bg-white">
              <KidneyCommon
                side="right"
                value={form.rightKidney ?? undefined}
                onChange={(data: KidneyProtocol) =>
                  updateField("rightKidney", data)
                }
              />
            </div>
            <div className="border border-slate-300 rounded-lg p-4 bg-white">
              <KidneyCommon
                side="left"
                value={form.leftKidney ?? undefined}
                onChange={(data: KidneyProtocol) =>
                  updateField("leftKidney", data)
                }
              />
            </div>
          </div>
        )}
      </div>

      <Conclusion
        value={{
          conclusion: form.conclusion || "",
          recommendations: form.recommendations || "",
        }}
        onChange={updateConclusion}
      />
    </div>
  );
};

export default ChildDispensary;
