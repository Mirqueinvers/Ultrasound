// src/test/fixtures/printProtocols.ts
// Фикстуры протоколов для снапшот-тестов печати (этап 2.6).
// Данные заполнены так, чтобы печатные компоненты выводили
// осмысленный, стабильный HTML.
import type { ObpProtocol } from "@/types/studyes/obp";
import type { KidneyStudyProtocol } from "@/types/studyes/kidneyStudy";
import type { ThyroidStudyProtocol } from "@/types/studyes/thyroidStudy";
import {
  defaultLiverState,
  defaultGallbladderState,
  defaultPancreasState,
  defaultSpleenState,
  defaultKidneyState,
  defaultUrinaryBladderState,
  defaultThyroidState,
  defaultThyroidLobeState,
} from "@/types/defaultStates";

export const obpProtocolFixture: ObpProtocol = {
  liver: {
    ...defaultLiverState,
    rightLobeAP: "150",
    leftLobeAP: "70",
    rightLobeCCR: "130",
    rightLobeCVR: "130",
    echogenicity: "обычная",
    homogeneity: "однородная",
    contours: "ровные",
    additional: "Дополнительная информация по печени",
    conclusion: "Патологии печени не выявлено",
  },
  gallbladder: {
    ...defaultGallbladderState,
    position: "обычное",
    length: "80",
    width: "30",
    wallThickness: "2",
    shape: "грушевидная",
    contentType: "гомогенное",
    conclusion: "Патологии желчного пузыря не выявлено",
  },
  pancreas: {
    ...defaultPancreasState,
    head: "25",
    body: "15",
    tail: "20",
    echogenicity: "обычная",
    echostructure: "однородная",
    contour: "ровные",
    conclusion: "Патологии поджелудочной железы не выявлено",
  },
  spleen: {
    ...defaultSpleenState,
    position: "обычное",
    length: "110",
    width: "45",
    echogenicity: "обычная",
    echostructure: "однородная",
    contours: "ровные",
    conclusion: "Патологии селезёнки не выявлено",
  },
  freeFluid: "определяется",
  freeFluidDetails: "Свободная жидкость в малом тазу",
  conclusion: "Эхопризнаков патологии органов брюшной полости не выявлено",
  recommendations: "Повторное УЗИ через 6 месяцев",
};

export const kidneyProtocolFixture: KidneyStudyProtocol = {
  rightKidney: {
    ...defaultKidneyState,
    position: "типичное",
    length: "105",
    width: "45",
    thickness: "40",
    parenchymaSize: "15",
    parenchymaEchogenicity: "обычная",
    parenchymaStructure: "однородная",
    pcsSize: "не расширена",
    contour: "ровные",
    additional: "Дополнительно по правой почке",
  },
  leftKidney: {
    ...defaultKidneyState,
    position: "типичное",
    length: "110",
    width: "50",
    thickness: "42",
    parenchymaSize: "16",
    parenchymaEchogenicity: "обычная",
    parenchymaStructure: "однородная",
    pcsSize: "не расширена",
    contour: "ровные",
  },
  urinaryBladder: {
    ...defaultUrinaryBladderState,
    residualStatus: "после мочеиспускания",
    length: "45",
    width: "30",
    depth: "25",
    volume: "30",
    wallThickness: "3",
    contents: "гомогенное",
  },
  conclusion: "Эхопризнаков патологии почек не выявлено",
  recommendations: "Наблюдение в динамике",
};

export const thyroidProtocolFixture: ThyroidStudyProtocol = {
  thyroid: {
    ...defaultThyroidState,
    rightLobe: { ...defaultThyroidLobeState, length: "45", width: "20", depth: "18", volume: "7.0" },
    leftLobe: { ...defaultThyroidLobeState, length: "44", width: "19", depth: "17", volume: "6.5" },
    isthmusSize: "4",
    totalVolume: "13.5",
    echogenicity: "обычная",
    echostructure: "однородная",
    contour: "ровные",
    position: "типичное",
  },
  conclusion: "Эхопризнаков патологии щитовидной железы не выявлено",
  recommendations: "Профилактическое УЗИ 1 раз в год",
};