import React from "react";
import { ButtonSelect, Fieldset } from "@/UI";
import type { BrachioCephalicFormationProps } from "@/types/organs/brachioCephalicArteries";

const compactInputClass =
  "w-full max-w-sm px-3 py-2 border border-slate-300 rounded-lg text-sm transition-all focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500";

const compactAutoInputClass =
  "w-full max-w-sm px-3 py-2 border border-sky-300 rounded-lg bg-gradient-to-r from-sky-50 to-blue-50 text-sm font-semibold text-sky-900 cursor-not-allowed";

const parseNumber = (value: string): number | null => {
  const normalized = value.replace(",", ".").trim();
  if (!normalized) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
};

export const BrachioCephalicFormation: React.FC<
  BrachioCephalicFormationProps
> = ({ formation, onUpdate }) => {
  React.useEffect(() => {
    const reference = parseNumber(formation.vesselWidthNormal);
    const stenosis = parseNumber(formation.vesselWidthStenosis);

    const calculated =
      reference !== null && stenosis !== null && reference > 0
        ? ((1 - stenosis / reference) * 100).toFixed(1)
        : "";

    if (formation.stenosisDegree !== calculated) {
      onUpdate("stenosisDegree", calculated);
    }
  }, [
    formation.vesselWidthNormal,
    formation.vesselWidthStenosis,
    formation.stenosisDegree,
    onUpdate,
  ]);

  return (
    <div className="space-y-4">
      <Fieldset title="Локализация">
        <div className="space-y-3">
          <ButtonSelect
            label=""
            value={formation.localizationSegment}
            onChange={(val) => onUpdate("localizationSegment", val)}
            options={[
              { value: "проксимальный сегмент", label: "проксимальный сегмент" },
              { value: "средний сегмент", label: "средний сегмент" },
              { value: "дистальный сегмент", label: "дистальный сегмент" },
              { value: "устье", label: "устье" },
            ]}
          />

          <ButtonSelect
            label="Переход?"
            value={formation.transitionTo}
            onChange={(val) => onUpdate("transitionTo", val)}
            options={[
              { value: "ВСА", label: "ВСА" },
              { value: "НСА", label: "НСА" },
              { value: "ОСА", label: "ОСА" },
              { value: "Каротидный синус", label: "Каротидный синус" },
              { value: "Подключичная", label: "Подключичная" },
            ]}
          />
        </div>
      </Fieldset>

      <Fieldset title="Стенка">
        <ButtonSelect
          label=""
          value={formation.wall}
          onChange={(val) => onUpdate("wall", val)}
          options={[
            { value: "по задней", label: "по задней" },
            { value: "по передней", label: "по передней" },
            { value: "медиальная", label: "медиальная" },
            { value: "латеральная", label: "латеральная" },
            { value: "циркулярная", label: "циркулярная" },
            { value: "полуциркулярная", label: "полуциркулярная" },
          ]}
        />
      </Fieldset>

      <Fieldset title="Размеры">
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Толщина
            </label>
            <input
              type="text"
              className={compactInputClass}
              value={formation.thickness}
              onChange={(e) => onUpdate("thickness", e.target.value)}
              placeholder="Введите значение"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Протяженность
            </label>
            <input
              type="text"
              className={compactInputClass}
              value={formation.length}
              onChange={(e) => onUpdate("length", e.target.value)}
              placeholder="Введите значение"
            />
          </div>
        </div>
      </Fieldset>

      <Fieldset title="Эхоструктура">
        <ButtonSelect
          label=""
          value={formation.echostructure}
          onChange={(val) => onUpdate("echostructure", val)}
          options={[
            { value: "гипоэхогенная", label: "гипоэхогенная" },
            { value: "изоэхогенная", label: "изоэхогенная" },
            { value: "гиперэхогенная", label: "гиперэхогенная" },
            { value: "гетерогенная", label: "гетерогенная" },
            { value: "кальцинированная", label: "кальцинированная" },
          ]}
        />
      </Fieldset>

      <Fieldset title="Поверхность">
        <ButtonSelect
          label=""
          value={formation.surface}
          onChange={(val) => onUpdate("surface", val)}
          options={[
            { value: "ровная", label: "ровная" },
            { value: "не ровная", label: "не ровная" },
            { value: "изъязвленная", label: "изъязвленная" },
          ]}
        />
      </Fieldset>

      <Fieldset title="Стеноз">
        <div className="space-y-3">
          <ButtonSelect
            label=""
            value={formation.stenosisMethod}
            onChange={(val) => onUpdate("stenosisMethod", val)}
            options={[
              { value: "NASCET", label: "NASCET" },
              { value: "ECST", label: "ECST" },
            ]}
          />

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Референс
            </label>
            <input
              type="text"
              className={compactInputClass}
              value={formation.vesselWidthNormal}
              onChange={(e) => onUpdate("vesselWidthNormal", e.target.value)}
              placeholder="Введите значение"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Ширина в месте стеноза
            </label>
            <input
              type="text"
              className={compactInputClass}
              value={formation.vesselWidthStenosis}
              onChange={(e) => onUpdate("vesselWidthStenosis", e.target.value)}
              placeholder="Введите значение"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Степень стеноза
            </label>
            <input
              type="text"
              className={compactAutoInputClass}
              value={formation.stenosisDegree}
              readOnly
              disabled
              placeholder="авто"
            />
          </div>
        </div>
      </Fieldset>

      <Fieldset title="Гемодинамика">
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Скорость проксимальнее стеноза
            </label>
            <input
              type="text"
              className={compactInputClass}
              value={formation.velocityProximal}
              onChange={(e) => onUpdate("velocityProximal", e.target.value)}
              placeholder="Введите значение"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Скорость в месте стеноза
            </label>
            <input
              type="text"
              className={compactInputClass}
              value={formation.velocityStenosis}
              onChange={(e) => onUpdate("velocityStenosis", e.target.value)}
              placeholder="Введите значение"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Скорость дистальнее стеноза
            </label>
            <input
              type="text"
              className={compactInputClass}
              value={formation.velocityDistal}
              onChange={(e) => onUpdate("velocityDistal", e.target.value)}
              placeholder="Введите значение"
            />
          </div>
        </div>
      </Fieldset>
    </div>
  );
};

export default BrachioCephalicFormation;
