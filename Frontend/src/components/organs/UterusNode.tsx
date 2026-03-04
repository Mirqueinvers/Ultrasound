import React from "react";
import { ButtonSelect } from "@/UI";
import type { UterusNodeProps } from "@types";

export const UterusNodeComponent: React.FC<UterusNodeProps> = ({
  node,
  onUpdate,
  onRemove: _onRemove,
}) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Размер 1 (мм)
          </label>
          <input
            type="text"
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            value={node.size1}
            onChange={(e) => onUpdate("size1", e.target.value)}
            placeholder="0.0"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Размер 2 (мм)
          </label>
          <input
            type="text"
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            value={node.size2}
            onChange={(e) => onUpdate("size2", e.target.value)}
            placeholder="0.0"
          />
        </div>
      </div>

      <ButtonSelect
        label="По стенке матки"
        value={node.wallLocation}
        onChange={(val) => onUpdate("wallLocation", val)}
        options={[
          { value: "передняя", label: "передняя" },
          { value: "задняя", label: "задняя" },
          { value: "правая боковая", label: "правая боковая" },
          { value: "левая боковая", label: "левая боковая" },
          { value: "дно", label: "дно" },
        ]}
      />

      <ButtonSelect
        label="По слою матки"
        value={node.layerType}
        onChange={(val) => onUpdate("layerType", val)}
        options={[
          { value: "интрамуральная", label: "интрамуральная" },
          { value: "субсерозная", label: "субсерозная" },
          { value: "субмукозная", label: "субмукозная" },
          { value: "интралигаментарная", label: "интралигаментарная" },
          { value: "на ножке", label: "на ножке" },
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ButtonSelect
          label="Контуры: четкость"
          value={node.contourClarity}
          onChange={(val) => onUpdate("contourClarity", val)}
          options={[
            { value: "четкие", label: "четкие" },
            { value: "нечеткие", label: "нечеткие" },
          ]}
        />

        <ButtonSelect
          label="Контуры: ровность"
          value={node.contourEvenness}
          onChange={(val) => onUpdate("contourEvenness", val)}
          options={[
            { value: "ровные", label: "ровные" },
            { value: "неровные", label: "неровные" },
          ]}
        />
      </div>

      <ButtonSelect
        label="Эхогенность"
        value={node.echogenicity}
        onChange={(val) => onUpdate("echogenicity", val)}
        options={[
          { value: "гипоэхогенный", label: "гипоэхогенный" },
          { value: "гиперэхогенный", label: "гиперэхогенный" },
          { value: "изоэхогенный", label: "изоэхогенный" },
          { value: "гетерогенный", label: "гетерогенный" },
        ]}
      />

      <ButtonSelect
        label="Структура"
        value={node.structure}
        onChange={(val) => onUpdate("structure", val)}
        options={[
          { value: "однородная", label: "однородная" },
          { value: "неоднородная", label: "неоднородная" },
        ]}
      />

      <ButtonSelect
        label="Влияние на полость матки"
        value={node.cavityImpact}
        onChange={(val) => onUpdate("cavityImpact", val)}
        options={[
          { value: "не деформирует", label: "не деформирует" },
          { value: "деформирует полость", label: "деформирует полость" },
          { value: "смещает эндометрий", label: "смещает эндометрий" },
        ]}
      />

      <ButtonSelect
        label="Кровоток (ЦДК)"
        value={node.bloodFlow}
        onChange={(val) => onUpdate("bloodFlow", val)}
        options={[
          { value: "не изменен", label: "не изменен" },
          { value: "усилен", label: "усилен" },
          { value: "обеднен", label: "обеднен" },
        ]}
      />

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Комментарий
        </label>
        <textarea
          className="w-full px-4 py-2.5 border border-slate-300 rounded-lg transition-all resize-none focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
          rows={2}
          value={node.comment}
          onChange={(e) => onUpdate("comment", e.target.value)}
          placeholder="Дополнительные заметки..."
        />
      </div>
    </div>
  );
};

export default UterusNodeComponent;
