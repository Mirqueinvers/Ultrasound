import React from "react";

interface SizeTextData {
  title: string;
  content: React.ReactNode;
}

export const brachioCephalicArteriesHints: Record<string, SizeTextData> = {
  commonCarotidDiameter: {
    title: "ОСА: диаметр",
    content: (
      <div className="space-y-2">
        <p className="text-xs">Ориентир: 5-8 мм (в зависимости от пола, возраста и конституции)</p>
        <p className="text-xs text-gray-600">Измеряется в В-режиме, без компрессии датчиком.</p>
      </div>
    ),
  },
  commonCarotidKim: {
    title: "ОСА: КИМ",
    content: (
      <div className="space-y-2">
        <p className="text-xs">Ориентир: до 0.9 мм.</p>
        <p className="text-xs text-gray-600">Обычно измеряют по дальней стенке в продольной плоскости.</p>
      </div>
    ),
  },
  commonCarotidPsv: {
    title: "ОСА: пиковая систолическая скорость (ПСС)",
    content: (
      <div className="space-y-2">
        <p className="text-xs">Ориентир: 50-125 см/с.</p>
        <p className="text-xs text-gray-600">Учитывайте угол инсонации и место измерения.</p>
      </div>
    ),
  },
  commonCarotidEdv: {
    title: "ОСА: конечная диастолическая скорость (КДС)",
    content: (
      <div className="space-y-2">
        <p className="text-xs">Ориентир: 10-40 см/с.</p>
        <p className="text-xs text-gray-600">Сопоставляйте с ПСС и RI в том же сегменте.</p>
      </div>
    ),
  },
  sinusKim: {
    title: "Каротидный синус/БЦС: КИМ",
    content: (
      <div className="space-y-2">
        <p className="text-xs">Ориентир: до 0.9 мм.</p>
        <p className="text-xs text-gray-600">При утолщении указывайте максимальное значение в мм.</p>
      </div>
    ),
  },
  internalCarotidDiameter: {
    title: "ВСА: диаметр",
    content: (
      <div className="space-y-2">
        <p className="text-xs">Ориентир: 4-7 мм.</p>
        <p className="text-xs text-gray-600">Измерение выполняется вне зоны выраженного стеноза.</p>
      </div>
    ),
  },
  internalCarotidPsv: {
    title: "ВСА: пиковая систолическая скорость (ПСС)",
    content: (
      <div className="space-y-2">
        <p className="text-xs">Ориентир: до 125 см/с (вне стеноза).</p>
        <p className="text-xs text-gray-600">Рост ПСС может указывать на гемодинамически значимый стеноз.</p>
      </div>
    ),
  },
  internalCarotidEdv: {
    title: "ВСА: конечная диастолическая скорость (КДС)",
    content: (
      <div className="space-y-2">
        <p className="text-xs">Ориентир: 20-40 см/с (вне стеноза).</p>
        <p className="text-xs text-gray-600">Оценивается вместе с ПСС и ICA/CCA ratio.</p>
      </div>
    ),
  },
  externalCarotidPsv: {
    title: "НСА: пиковая систолическая скорость (ПСС)",
    content: (
      <div className="space-y-2">
        <p className="text-xs">Ориентир: обычно 70-140 см/с.</p>
        <p className="text-xs text-gray-600">Нормы вариабельны, важна сопоставимость сторон и спектра.</p>
      </div>
    ),
  },
  externalCarotidEdv: {
    title: "НСА: конечная диастолическая скорость (КДС)",
    content: (
      <div className="space-y-2">
        <p className="text-xs">Ориентир: обычно ниже, чем во ВСА.</p>
        <p className="text-xs text-gray-600">Показатель оценивается в комплексе с ПСС и RI.</p>
      </div>
    ),
  },
  vertebralDiameter: {
    title: "Позвоночная артерия: диаметр",
    content: (
      <div className="space-y-2">
        <p className="text-xs">Ориентир: 2.0-4.0 мм.</p>
        <p className="text-xs text-gray-600">Диаметр менее 2 мм может соответствовать гипоплазии.</p>
      </div>
    ),
  },
  vertebralPsv: {
    title: "Позвоночная артерия: пиковая систолическая скорость (ПСС)",
    content: (
      <div className="space-y-2">
        <p className="text-xs">Ориентир: 20-60 см/с.</p>
        <p className="text-xs text-gray-600">Скорость зависит от сегмента и анатомических вариантов.</p>
      </div>
    ),
  },
  vertebralEdv: {
    title: "Позвоночная артерия: конечная диастолическая скорость (КДС)",
    content: (
      <div className="space-y-2">
        <p className="text-xs">Ориентир: 6-20 см/с.</p>
        <p className="text-xs text-gray-600">Снижение КДС оценивайте в сочетании с направлением потока.</p>
      </div>
    ),
  },
  subclavianKim: {
    title: "Подключичная артерия: КИМ",
    content: (
      <div className="space-y-2">
        <p className="text-xs">Ориентир: до 0.9 мм.</p>
        <p className="text-xs text-gray-600">При утолщении укажите значение в мм.</p>
      </div>
    ),
  },
  subclavianPsv: {
    title: "Подключичная артерия: пиковая систолическая скорость (ПСС)",
    content: (
      <div className="space-y-2">
        <p className="text-xs">Ориентир: 70-150 см/с.</p>
        <p className="text-xs text-gray-600">Локальное повышение ПСС может указывать на стеноз.</p>
      </div>
    ),
  },
};

export type BrachioCephalicArteriesHintKey = keyof typeof brachioCephalicArteriesHints;
