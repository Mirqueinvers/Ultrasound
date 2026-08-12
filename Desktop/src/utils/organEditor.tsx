/**
 * Типизированный адаптер для редактирования значений по умолчанию органов.
 *
 * Каждый орган имеет собственную структуру protocol и onChange-сигнатуру.
 * Этот модуль приводит все компоненты органов к единому интерфейсу
 * фабрики `(value, onChange) => ReactElement`, где value приходит как unknown
 * (так значение по умолчанию хранится в DefaultValuesContext).
 *
 * Приведение типов локализовано здесь — потребители (DefaultValuesTab)
 * работают с типизированным интерфейсом без `as any`.
 */
import React from "react";

import { Hepat } from "@/features/organs/Hepat";
import { Gallbladder } from "@/features/organs/Gallbladder/Gallbladder";
import { Pancreas } from "@/features/organs/Pancreas";
import { Spleen } from "@/features/organs/Spleen";
import { KidneyCommon } from "@/features/organs/Kidney/KidneyCommon";
import { UrinaryBladder } from "@/features/organs/UrinaryBladder";
import { TestisSide } from "@/features/organs/Testis";
import { Uterus } from "@/features/organs/Uterus";
import { Ovary } from "@/features/organs/Ovary";
import { Prostate } from "@/features/organs/Prostate";
import { ThyroidLobe } from "@/features/organs/Thyroid/ThyroidLobe";
import { BreastSide } from "@/features/organs/Breast/BreastSide";
import { SalivaryGland } from "@/features/organs/SalivaryGlands/SalivaryGland";
import { Artery } from "@/features/organs/BrachioCephalicArteries/Artery";

import type { LiverProtocol } from "@/types";
import type { GallbladderProtocol } from "@/types";
import type { PancreasProtocol } from "@/types";
import type { SpleenProtocol } from "@/types";
import type { KidneyProtocol } from "@/types";
import type { UrinaryBladderProtocol } from "@/types";
import type { SingleTestisProtocol } from "@/types";
import type { UterusProtocol } from "@/types";
import type { OvaryProtocol } from "@/types";
import type { ProstateProtocol } from "@/types";
import type { ThyroidLobeProtocol } from "@/types";
import type { BreastSideProtocol } from "@/types";
import type { SalivaryGlandProtocol } from "@/types";
import type { ArteryProtocol } from "@/types";

/** Единый интерфейс фабрики редактора органа */
export type OrganEditor = (
  value: unknown,
  onChange: (value: unknown) => void,
) => React.ReactElement;

/** Интерфейс простого компонента органа (value/onChange без доп. props) */
type SimpleOrganComponent<T> = React.FC<{
  value?: T;
  onChange?: (value: T) => void;
}>;

/** Интерфейс компонента органа с фиксированным side */
type SideOrganComponent<T> = React.FC<{
  side: "left" | "right";
  value?: T;
  onChange?: (value: T) => void;
}>;

/** Фабрика для органа с простыми value/onChange */
function simpleOrgan<T>(
  Component: SimpleOrganComponent<T>,
): OrganEditor {
  return (value, onChange) => (
    <Component
      value={value as T | undefined}
      onChange={(next) => onChange(next as unknown)}
    />
  );
}

/** Фабрика для органа с фиксированной стороной */
function sideOrgan<T>(
  Component: SideOrganComponent<T>,
  side: "left" | "right",
): OrganEditor {
  return (value, onChange) => (
    <Component
      side={side}
      value={value as T | undefined}
      onChange={(next) => onChange(next as unknown)}
    />
  );
}

/** Адаптер для TestisSide (onChange обязательный, принимает SingleTestisProtocol) */
function testisSideOrgan(side: "left" | "right"): OrganEditor {
  return (value, onChange) => (
    <TestisSide
      side={side}
      value={value as SingleTestisProtocol | null | undefined}
      onChange={(next) => onChange(next as unknown)}
    />
  );
}

/** Адаптер для Artery (доп. props artery + mode="main") */
function arteryOrgan(artery: string): OrganEditor {
  return (value, onChange) => (
    <Artery
      artery={artery}
      mode="main"
      value={value as ArteryProtocol | undefined}
      onChange={(next) => onChange(next as unknown)}
    />
  );
}

/** Типизированная карта редакторов органов по ключам секций */
export const ORGAN_EDITORS: Record<string, OrganEditor> = {
  "ОБП:печень": simpleOrgan<LiverProtocol>(Hepat),
  "ОБП:желчный": simpleOrgan<GallbladderProtocol>(Gallbladder),
  "ОБП:поджелудочная": simpleOrgan<PancreasProtocol>(Pancreas),
  "ОБП:селезёнка": simpleOrgan<SpleenProtocol>(Spleen),
  "Почки:правая": sideOrgan<KidneyProtocol>(KidneyCommon as SideOrganComponent<KidneyProtocol>, "right"),
  "Почки:левая": sideOrgan<KidneyProtocol>(KidneyCommon as SideOrganComponent<KidneyProtocol>, "left"),
  "Почки:мочевой пузырь": simpleOrgan<UrinaryBladderProtocol>(UrinaryBladder),
  "Органы мошонки:правое яичко": testisSideOrgan("right"),
  "Органы мошонки:левое яичко": testisSideOrgan("left"),
  "ОМТ (Ж):матка": simpleOrgan<UterusProtocol>(Uterus),
  "ОМТ (Ж):правый яичник": sideOrgan<OvaryProtocol>(Ovary, "right"),
  "ОМТ (Ж):левый яичник": sideOrgan<OvaryProtocol>(Ovary, "left"),
  "ОМТ (Ж):мочевой пузырь": simpleOrgan<UrinaryBladderProtocol>(UrinaryBladder),
  "ОМТ (М):простата": simpleOrgan<ProstateProtocol>(Prostate),
  "ОМТ (М):мочевой пузырь": simpleOrgan<UrinaryBladderProtocol>(UrinaryBladder),
  "Щитовидная железа:правая доля": sideOrgan<ThyroidLobeProtocol>(ThyroidLobe as SideOrganComponent<ThyroidLobeProtocol>, "right"),
  "Щитовидная железа:левая доля": sideOrgan<ThyroidLobeProtocol>(ThyroidLobe as SideOrganComponent<ThyroidLobeProtocol>, "left"),
  "Слюнные железы:околоушная правая": (value, onChange) => (
    <SalivaryGland
      gland="parotidRight"
      value={value as SalivaryGlandProtocol | undefined}
      onChange={(next) => onChange(next as unknown)}
    />
  ),
  "Слюнные железы:околоушная левая": (value, onChange) => (
    <SalivaryGland
      gland="parotidLeft"
      value={value as SalivaryGlandProtocol | undefined}
      onChange={(next) => onChange(next as unknown)}
    />
  ),
  "Слюнные железы:подчелюстная правая": (value, onChange) => (
    <SalivaryGland
      gland="submandibularRight"
      value={value as SalivaryGlandProtocol | undefined}
      onChange={(next) => onChange(next as unknown)}
    />
  ),
  "Слюнные железы:подчелюстная левая": (value, onChange) => (
    <SalivaryGland
      gland="submandibularLeft"
      value={value as SalivaryGlandProtocol | undefined}
      onChange={(next) => onChange(next as unknown)}
    />
  ),
  "Слюнные железы:подъязычная правая": (value, onChange) => (
    <SalivaryGland
      gland="sublingualRight"
      value={value as SalivaryGlandProtocol | undefined}
      onChange={(next) => onChange(next as unknown)}
    />
  ),
  "Слюнные железы:подъязычная левая": (value, onChange) => (
    <SalivaryGland
      gland="sublingualLeft"
      value={value as SalivaryGlandProtocol | undefined}
      onChange={(next) => onChange(next as unknown)}
    />
  ),
  "Молочные железы:правая железа": sideOrgan<BreastSideProtocol>(BreastSide as SideOrganComponent<BreastSideProtocol>, "right"),
  "Молочные железы:левая железа": sideOrgan<BreastSideProtocol>(BreastSide as SideOrganComponent<BreastSideProtocol>, "left"),
  "Мочевой пузырь": simpleOrgan<UrinaryBladderProtocol>(UrinaryBladder),
  "urinary_bladder": simpleOrgan<UrinaryBladderProtocol>(UrinaryBladder),
  "БЦА:ОСА правая": arteryOrgan("commonCarotidRight"),
  "БЦА:ОСА левая": arteryOrgan("commonCarotidLeft"),
  "БЦА:ВСА правая": arteryOrgan("internalCarotidRight"),
  "БЦА:ВСА левая": arteryOrgan("internalCarotidLeft"),
  "БЦА:НСА правая": arteryOrgan("externalCarotidRight"),
  "БЦА:НСА левая": arteryOrgan("externalCarotidLeft"),
  "БЦА:позвоночная правая": arteryOrgan("vertebralRight"),
  "БЦА:позвоночная левая": arteryOrgan("vertebralLeft"),
  "БЦА:подключичная правая": arteryOrgan("subclavianRight"),
  "БЦА:подключичная левая": arteryOrgan("subclavianLeft"),
};