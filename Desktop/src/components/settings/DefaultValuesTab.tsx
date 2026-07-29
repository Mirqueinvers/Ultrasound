// src/components/settings/DefaultValuesTab.tsx

import React, { useState, useEffect, useCallback } from "react";
import { Hepat } from "@/components/organs/Hepat";
import { Gallbladder } from "@/components/organs/Gallbladder/Gallbladder";
import { Pancreas } from "@/components/organs/Pancreas";
import { Spleen } from "@/components/organs/Spleen";
import { useDefaultValues } from "@hooks";
import { PROTOCOL_BY_ID, SECTION_KEYS_BY_PROTOCOL } from "@/protocols/catalog";
import { SECTION_BY_KEY } from "@/protocols/catalog";
import type { ProtocolSectionDefinition } from "@/protocols/types";
import { defaultLiverState } from "@/types/defaultStates/organs/liver";
import { defaultGallbladderState } from "@/types/defaultStates/organs/gallbladder";
import { defaultPancreasState } from "@/types/defaultStates/organs/pancreas";
import { defaultSpleenState } from "@/types/defaultStates/organs/spleen";
import "./DefaultValuesTab.css";

const OBP_ID = "obp" as const;
const DEFAULT_STATES: Record<string, Record<string, unknown>> = {
  "ОБП:печень": defaultLiverState as unknown as Record<string, unknown>,
  "ОБП:желчный": defaultGallbladderState as unknown as Record<string, unknown>,
  "ОБП:поджелудочная": defaultPancreasState as unknown as Record<string, unknown>,
  "ОБП:селезёнка": defaultSpleenState as unknown as Record<string, unknown>,
};

const ORGAN_COMPONENTS: Record<
  string,
  React.FC<{ value?: Record<string, unknown>; onChange?: (value: Record<string, unknown>) => void }>
> = {
  "ОБП:печень": ({ value, onChange }) => (
    <Hepat
      value={value as any}
      onChange={onChange as any}
    />
  ),
  "ОБП:желчный": ({ value, onChange }) => (
    <Gallbladder
      value={value as any}
      onChange={onChange as any}
    />
  ),
  "ОБП:поджелудочная": ({ value, onChange }) => (
    <Pancreas
      value={value as any}
      onChange={onChange as any}
    />
  ),
  "ОБП:селезёнка": ({ value, onChange }) => (
    <Spleen
      value={value as any}
      onChange={onChange as any}
    />
  ),
};

const DefaultValuesTab: React.FC = () => {
  const { defaults, isLoaded, saveDefaults, resetDefaults } = useDefaultValues();

  const obpDefinition = PROTOCOL_BY_ID[OBP_ID];
  const sectionKeys = SECTION_KEYS_BY_PROTOCOL[OBP_ID];

  const [selectedSectionKey, setSelectedSectionKey] = useState<string | null>(null);
  const [localValues, setLocalValues] = useState<Record<string, unknown> | null>(null);

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

  // При первом рендере выбираем первую секцию
  useEffect(() => {
    if (sectionKeys.length > 0 && !selectedSectionKey) {
      setSelectedSectionKey(sectionKeys[0]);
    }
  }, [sectionKeys, selectedSectionKey]);

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
    return (
      <div className="defaults-tab">
        <div className="defaults-tab__loading">Загрузка...</div>
      </div>
    );
  }

  if (!obpDefinition) {
    return (
      <div className="defaults-tab">
        <div className="defaults-tab__error">Протокол ОБП не найден</div>
      </div>
    );
  }

  const selectedSectionDef: ProtocolSectionDefinition | undefined = selectedSectionKey
    ? SECTION_BY_KEY[selectedSectionKey]
    : undefined;

  return (
    <div className="defaults-tab">
      {/* Левая колонка — список протоколов */}
      <div className="defaults-tab__protocols">
        <h3 className="defaults-tab__title">Протоколы</h3>
        <div className="defaults-tab__list">
          <div className="defaults-tab__protocol-item defaults-tab__protocol-item--active">
            {obpDefinition.selectionLabel}
          </div>
        </div>
      </div>

      {/* Средняя колонка — секции выбранного протокола */}
      <div className="defaults-tab__sections">
        <h3 className="defaults-tab__title">Секции</h3>
        <div className="defaults-tab__list">
          {sectionKeys.map((sectionKey) => {
            const sectionDef = SECTION_BY_KEY[sectionKey];
            return (
              <button
                key={sectionKey}
                className={`defaults-tab__section-item ${
                  selectedSectionKey === sectionKey ? "defaults-tab__section-item--active" : ""
                }`}
                onClick={() => setSelectedSectionKey(sectionKey)}
              >
                {sectionDef?.label ?? sectionKey}
              </button>
            );
          })}
        </div>
      </div>

      {/* Правая колонка — форма органа */}
      <div className="defaults-tab__editor">
        <div className="defaults-tab__editor-header">
          <h3 className="defaults-tab__title">
            {selectedSectionDef?.label ?? "Выберите секцию"}
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
          {selectedSectionKey && ORGAN_COMPONENTS[selectedSectionKey] ? (
            (() => {
              const Component = ORGAN_COMPONENTS[selectedSectionKey];
              return (
                <Component
                  value={localValues ?? undefined}
                  onChange={handleChange}
                />
              );
            })()
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