// src/hooks/organs/useUterus.ts
import { useCallback, useEffect } from "react";
import { useOrganForm } from "../useOrganForm";
import { useOrganVolume } from "../useOrganVolume";
import { useListManager } from "../useListManager";
import { defaultUterusState } from "../../types/defaultStates/organs/uterus";
import type {
  UterusNode,
  UterusProtocol,
} from "../../types/organs/uterus";

const STATUS_NORMAL = "обычное";
const STATUS_SUBTOTAL = "субтотальная гистерэктомия";
const MYOMA_PRESENCE_NONE = "не определяются";
const MYOMA_PRESENCE_PRESENT = "определяются";

const VOLUME_COEFFICIENT = 0.523;

const NODE_DEFAULTS = {
  wallLocation: "задняя",
  layerType: "интрамуральная",
  size1: "",
  size2: "",
  contourClarity: "четкие",
  contourEvenness: "ровные",
  echogenicity: "гипоэхогенный",
  structure: "однородная",
  cavityImpact: "не деформирует",
  bloodFlow: "не изменен",
  comment: "",
};

/**
 * Специфика матки:
 * форма + авто-расчёт объёма + миомы (myomaNodesList) + авто-расчёт дня цикла.
 * Используется компонентом Uterus (стал презентационным).
 */
export const useUterus = (
  value?: UterusProtocol,
  onChange?: (value: UterusProtocol) => void,
) => {
  const { form, setForm, updateField, commit } = useOrganForm({
    value,
    defaults: defaultUterusState,
    organKey: "uterus",
    onChange,
    mergeLists: (v) => ({
      myomaNodesList: v?.myomaNodesList || [],
    }),
  });

  const status = form.uterusStatus || STATUS_NORMAL;
  const isNormal = status === STATUS_NORMAL;
  const isSubtotal = status === STATUS_SUBTOTAL;

  // Авто-расчёт дня цикла от даты последней менструации
  useEffect(() => {
    if (!isNormal || !form.lastMenstruationDate) return;

    const lastMenstruation = new Date(form.lastMenstruationDate);
    const today = new Date();
    const diffTime = today.getTime() - lastMenstruation.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 0 && diffDays.toString() !== form.cycleDay) {
      updateField("cycleDay", diffDays.toString());
    }
    // updateField пересоздаётся на каждый render (useCallback на form)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.lastMenstruationDate, form.cycleDay, isNormal]);

  useOrganVolume({
    length: form.length,
    width: form.width,
    depth: form.apDimension,
    volume: form.volume,
    coefficient: VOLUME_COEFFICIENT,
    enabled: isNormal,
    onVolumeChange: (volume) => {
      // Сохраняем исходное поведение: при невалидных размерах объём не очищаем
      if (volume && volume !== form.volume) {
        commit({ ...form, volume });
      }
    },
  });

  const myomaNodesManager = useListManager(
    form.myomaNodesList,
    form,
    setForm,
    "myomaNodesList",
    onChange,
  );

  const addMyomaNode = useCallback(() => {
    const newNode: UterusNode = {
      number: form.myomaNodesList.length + 1,
      ...NODE_DEFAULTS,
    };
    myomaNodesManager.addItem(newNode);
  }, [form.myomaNodesList.length, myomaNodesManager]);

  const updateMyomaPresence = useCallback(
    (nextValue: string) => {
      const draft: UterusProtocol = { ...form, myomaNodesPresence: nextValue };
      if (nextValue === MYOMA_PRESENCE_NONE) {
        draft.myomaNodesList = [];
      }
      commit(draft);
    },
    [form, commit],
  );

  const removeMyomaNode = useCallback(
    (index: number) => {
      const updatedNodes = form.myomaNodesList
        .filter((_, i) => i !== index)
        .map((node, i) => ({ ...node, number: i + 1 }));
      commit({ ...form, myomaNodesList: updatedNodes });
    },
    [form, commit],
  );

  return {
    form,
    setForm,
    updateField,
    commit,
    status,
    isNormal,
    isSubtotal,
    myomaNodesManager,
    addMyomaNode,
    updateMyomaPresence,
    removeMyomaNode,
  };
};

export const UTERUS_OPTIONS = {
  statusNormal: STATUS_NORMAL,
  statusSubtotal: STATUS_SUBTOTAL,
  myomaNone: MYOMA_PRESENCE_NONE,
  myomaPresent: MYOMA_PRESENCE_PRESENT,
} as const;