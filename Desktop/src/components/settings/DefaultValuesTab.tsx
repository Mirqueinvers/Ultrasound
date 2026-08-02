// src/components/settings/DefaultValuesTab.tsx

import React, { useState, useEffect, useCallback } from "react";
import { useDefaultValues } from "@hooks";
import { ORGAN_EDITORS } from "@/utils/organEditor";
import { PROTOCOL_BY_ID, SECTION_KEYS_BY_PROTOCOL } from "@/protocols/catalog";
import { SECTION_BY_KEY } from "@/protocols/catalog";
import type { ProtocolSectionDefinition } from "@/protocols/types";
import { defaultLiverState } from "@/types/defaultStates/organs/liver";
import { defaultGallbladderState } from "@/types/defaultStates/organs/gallbladder";
import { defaultPancreasState } from "@/types/defaultStates/organs/pancreas";
import { defaultSpleenState } from "@/types/defaultStates/organs/spleen";
import { defaultKidneyState } from "@/types/defaultStates/organs/kidney";
import { defaultUrinaryBladderState } from "@/types/defaultStates/organs/urinaryBladder";
import "./DefaultValuesTab.css";

const SUPPORTED_PROTOCOLS = ["obp", "kidneys", "scrotum", "omt_female", "omt_male", "thyroid", "salivary_glands", "brachio_cephalic_arteries", "breast", "urinary_bladder"] as const;

const DEFAULT_STATES: Record<string, Record<string, unknown>> = {
  "ОБП:печень": defaultLiverState as unknown as Record<string, unknown>,
  "ОБП:желчный": defaultGallbladderState as unknown as Record<string, unknown>,
  "ОБП:поджелудочная": defaultPancreasState as unknown as Record<string, unknown>,
  "ОБП:селезёнка": defaultSpleenState as unknown as Record<string, unknown>,
  "Почки:правая": defaultKidneyState as unknown as Record<string, unknown>,
  "Почки:левая": defaultKidneyState as unknown as Record<string, unknown>,
  "Почки:мочевой пузырь": defaultUrinaryBladderState as unknown as Record<string, unknown>,
  "Органы мошонки:правое яичко": {} as Record<string, unknown>,
  "Органы мошонки:левое яичко": {} as Record<string, unknown>,
  "ОМТ (Ж):матка": {} as Record<string, unknown>,
  "ОМТ (Ж):правый яичник": {} as Record<string, unknown>,
  "ОМТ (Ж):левый яичник": {} as Record<string, unknown>,
  "ОМТ (Ж):мочевой пузырь": defaultUrinaryBladderState as unknown as Record<string, unknown>,
  "ОМТ (М):простата": {} as Record<string, unknown>,
  "ОМТ (М):мочевой пузырь": defaultUrinaryBladderState as unknown as Record<string, unknown>,
  "Щитовидная железа:правая доля": {} as Record<string, unknown>,
  "Щитовидная железа:левая доля": {} as Record<string, unknown>,
  "Слюнные железы:околоушная правая": {} as Record<string, unknown>,
  "Слюнные железы:околоушная левая": {} as Record<string, unknown>,
  "Слюнные железы:подчелюстная правая": {} as Record<string, unknown>,
  "Слюнные железы:подчелюстная левая": {} as Record<string, unknown>,
  "Слюнные железы:подъязычная правая": {} as Record<string, unknown>,
  "Слюнные железы:подъязычная левая": {} as Record<string, unknown>,
  "Молочные железы:правая железа": {} as Record<string, unknown>,
  "Молочные железы:левая железа": {} as Record<string, unknown>,
  "Мочевой пузырь": defaultUrinaryBladderState as unknown as Record<string, unknown>,
  "urinary_bladder": defaultUrinaryBladderState as unknown as Record<string, unknown>,
  "БЦА:ОСА правая": {} as Record<string, unknown>,
  "БЦА:ОСА левая": {} as Record<string, unknown>,
  "БЦА:ВСА правая": {} as Record<string, unknown>,
  "БЦА:ВСА левая": {} as Record<string, unknown>,
  "БЦА:НСА правая": {} as Record<string, unknown>,
  "БЦА:НСА левая": {} as Record<string, unknown>,
  "БЦА:позвоночная правая": {} as Record<string, unknown>,
  "БЦА:позвоночная левая": {} as Record<string, unknown>,
  "БЦА:подключичная правая": {} as Record<string, unknown>,
  "БЦА:подключичная левая": {} as Record<string, unknown>,
};

const DefaultValuesTab: React.FC = () => {
  const { defaults, isLoaded, saveDefaults, resetDefaults } = useDefaultValues();

  const [selectedProtocolId, setSelectedProtocolId] = useState<string>("obp");
  const [selectedSectionKey, setSelectedSectionKey] = useState<string | null>(null);
  const [localValues, setLocalValues] = useState<Record<string, unknown> | null>(null);

  const protocolDef = PROTOCOL_BY_ID[selectedProtocolId as keyof typeof PROTOCOL_BY_ID];
  const rawSectionKeys = SECTION_KEYS_BY_PROTOCOL[selectedProtocolId as keyof typeof SECTION_KEYS_BY_PROTOCOL] ?? [];

  // Если у протокола нет секций — используем виртуальную секцию с desktopKey = id протокола
  const sectionKeys = rawSectionKeys.length > 0 ? rawSectionKeys : [selectedProtocolId];

  // При смене секции загружаем её значения
  useEffect(() => {
    if (selectedSectionKey) {
      const saved = defaults[selectedSectionKey];
      const systemDefault = DEFAULT_STATES[selectedSectionKey];
      setLocalValues((saved ?? systemDefault) as Record<string, unknown>);
    } else {
      setLocalValues(null);
    }
  }, [selectedSectionKey, defaults]);

  // При смене протокола выбираем первую секцию
  useEffect(() => {
    if (sectionKeys.length > 0) {
      setSelectedSectionKey(sectionKeys[0]);
    } else {
      setSelectedSectionKey(null);
    }
  }, [selectedProtocolId, sectionKeys]);

  const handleChange = useCallback(
    (newValue: Record<string, unknown>) => {
      setLocalValues(newValue);
      if (selectedSectionKey) {
        saveDefaults(selectedSectionKey, newValue);
      }
    },
    [selectedSectionKey, saveDefaults],
  );

  const handleReset = useCallback(() => {
    if (selectedSectionKey) {
      resetDefaults(selectedSectionKey);
    }
  }, [selectedSectionKey, resetDefaults]);

  if (!isLoaded) {
    return <div className="defaults-tab"><div className="defaults-tab__loading">Загрузка...</div></div>;
  }

  const selectedSectionDef: ProtocolSectionDefinition | undefined = selectedSectionKey
    ? SECTION_BY_KEY[selectedSectionKey]
    : undefined;

  const selectedEditor = selectedSectionKey ? ORGAN_EDITORS[selectedSectionKey] : undefined;

  return (
    <div className="defaults-tab">
      {/* Верхняя панель — протоколы и секции */}
      <div className="defaults-tab__top-bar">
        <div className="defaults-tab__top-group">
          <span className="defaults-tab__top-label">Протоколы</span>
          <div className="defaults-tab__top-items">
            {SUPPORTED_PROTOCOLS.map((pid) => {
              const pdef = PROTOCOL_BY_ID[pid];
              if (!pdef) return null;
              return (
                <button
                  key={pid}
                  className={`defaults-tab__protocol-btn ${
                    selectedProtocolId === pid ? "defaults-tab__protocol-btn--active" : ""
                  }`}
                  onClick={() => setSelectedProtocolId(pid)}
                >
                  {pdef.selectionLabel}
                </button>
              );
            })}
          </div>
        </div>

        <div className="defaults-tab__top-group">
          <span className="defaults-tab__top-label">Секции</span>
          <div className="defaults-tab__top-items">
            {sectionKeys.map((sectionKey) => {
              const sectionDef = SECTION_BY_KEY[sectionKey];
              const label = sectionDef?.label ?? protocolDef?.selectionLabel ?? sectionKey;
              return (
                <button
                  key={sectionKey}
                  className={`defaults-tab__section-btn ${
                    selectedSectionKey === sectionKey ? "defaults-tab__section-btn--active" : ""
                  }`}
                  onClick={() => setSelectedSectionKey(sectionKey)}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Нижняя часть — редактор органа на всю ширину */}
      <div className="defaults-tab__editor">
        <div className="defaults-tab__editor-header">
          <h3 className="defaults-tab__editor-title">
            {selectedSectionDef?.label ?? protocolDef?.selectionLabel ?? "Выберите секцию"}
          </h3>
          <button
            className="defaults-tab__reset-btn"
            onClick={handleReset}
            disabled={!selectedSectionKey}
            title="Сбросить к заводским настройкам"
          >
            Сбросить
          </button>
        </div>
        <div className="defaults-tab__editor-body">
          {selectedSectionKey && selectedEditor ? (
            selectedEditor(
              localValues ?? undefined,
              (newValue) => handleChange(newValue as Record<string, unknown>),
            )
          ) : (
            <div className="defaults-tab__placeholder">
              Выберите секцию для редактирования значений по умолчанию
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DefaultValuesTab;