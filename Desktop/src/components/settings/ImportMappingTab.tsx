import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ALL_MEASUREMENTS, STUDY_SCHEMAS } from "@/sync/medisonMappingTypes";
import type { MedisonMappingRow } from "../../../electron/preload";
import "./ImportMappingTab.css";

interface MappingEntry {
  id: number | null;
  measurementId: string;
  measurementLabel: string;
  targetStudyType: string;
  targetField: string;
  transform: string;
  isEnabled: boolean;
}

const STUDY_LABELS: Record<string, string> = {};
STUDY_SCHEMAS.forEach((s) => {
  STUDY_LABELS[s.studyType] = s.label;
});

const MEASUREMENT_LABELS: Record<string, string> = {};
ALL_MEASUREMENTS.forEach((m) => {
  MEASUREMENT_LABELS[m.id] = m.label;
});

const getFieldsForStudy = (studyType: string) => {
  const schema = STUDY_SCHEMAS.find((s) => s.studyType === studyType);
  return schema ? schema.fields : [];
};

const ImportMappingTab: React.FC = () => {
  const { user } = useAuth();
  const [mappings, setMappings] = useState<MappingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<number | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [collapsedStudies, setCollapsedStudies] = useState<Set<string>>(new Set());

  const loadMappings = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const result = await window.importMappingAPI.getMappings(parseInt(user.id));
      if (result.success && result.mappings) {
        // Строим список всех известных measurementId
        const entries: MappingEntry[] = ALL_MEASUREMENTS.map((m) => {
          const dbRow = result.mappings!.find(
            (r: MedisonMappingRow) =>
              r.measurement_id === m.id && r.target_study_type === m.studyType
          );
          return {
            id: dbRow?.id ?? null,
            measurementId: m.id,
            measurementLabel: m.label,
            targetStudyType: m.studyType,
            targetField: dbRow?.target_field ?? "",
            transform: dbRow?.transform ?? "number->string",
            isEnabled: dbRow ? dbRow.is_enabled === 1 : true,
          };
        });
        setMappings(entries);
      } else {
        // Если маппингов нет — сбрасываем на дефолтные
        await handleResetDefaults();
      }
    } catch {
      setMessage({ type: "error", text: "Ошибка загрузки маппингов" });
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadMappings();
  }, [loadMappings]);

  const handleChangeField = async (index: number, field: string) => {
    const updated = [...mappings];
    updated[index] = { ...updated[index], targetField: field };
    setMappings(updated);
  };

  const handleToggle = async (index: number) => {
    const entry = mappings[index];
    const updated = [...mappings];
    updated[index] = { ...entry, isEnabled: !entry.isEnabled };
    setMappings(updated);

    // Автосохранение
    await saveMapping(updated[index]);
  };

  const saveMapping = async (entry: MappingEntry) => {
    if (!user) return;
    setSaving(entry.id);
    try {
      const result = await window.importMappingAPI.upsertMapping({
        userId: parseInt(user.id),
        measurementId: entry.measurementId,
        targetStudyType: entry.targetStudyType,
        targetField: entry.targetField,
        transform: entry.transform,
        isEnabled: entry.isEnabled,
      });
      if (result.success) {
        // Обновляем id в локальном состоянии
        setMappings((prev) =>
          prev.map((m) =>
            m.measurementId === entry.measurementId &&
            m.targetStudyType === entry.targetStudyType
              ? { ...m, id: result.id ?? m.id }
              : m
          )
        );
      }
    } catch {
      setMessage({ type: "error", text: "Ошибка сохранения" });
    } finally {
      setSaving(null);
    }
  };

  const handleSave = async (index: number) => {
    const entry = mappings[index];
    await saveMapping(entry);
    setMessage({ type: "success", text: "Маппинг сохранён" });
    setTimeout(() => setMessage(null), 2000);
  };

  const handleResetDefaults = async () => {
    if (!user) return;
    try {
      const result = await window.importMappingAPI.resetDefaultMappings(parseInt(user.id));
      if (result.success) {
        await loadMappings();
        setMessage({ type: "success", text: "Маппинги сброшены на умолчания" });
      } else {
        setMessage({ type: "error", text: result.message ?? "Ошибка сброса" });
      }
    } catch {
      setMessage({ type: "error", text: "Ошибка сброса маппингов" });
    }
    setTimeout(() => setMessage(null), 2000);
  };

  const toggleCollapse = (studyType: string) => {
    setCollapsedStudies((prev) => {
      const next = new Set(prev);
      if (next.has(studyType)) {
        next.delete(studyType);
      } else {
        next.add(studyType);
      }
      return next;
    });
  };

  // Группируем маппинги по типу исследования
  const grouped = STUDY_SCHEMAS.map((schema) => ({
    ...schema,
    mappings: mappings.filter((m) => m.targetStudyType === schema.studyType),
  }));

  if (loading) {
    return (
      <div className="import-mapping-loading">
        <div className="import-mapping-spinner" />
        <span>Загрузка маппингов...</span>
      </div>
    );
  }

  return (
    <div className="import-mapping-tab">
      <div className="import-mapping-header">
        <h2>Настройка импорта из Medison</h2>
        <p className="import-mapping-desc">
          Укажите, в какие поля протокола должны подставляться значения из XML-отчётов сканера Medison.
        </p>
      </div>

      {message && (
        <div className={`import-mapping-message import-mapping-message--${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="import-mapping-toolbar">
        <button className="import-mapping-btn import-mapping-btn--secondary" onClick={handleResetDefaults}>
          Сбросить на умолчания
        </button>
      </div>

      {grouped.map((group) => (
        <div key={group.studyType} className="import-mapping-group">
          <div
            className="import-mapping-group-header"
            onClick={() => toggleCollapse(group.studyType)}
          >
            <span className={`import-mapping-arrow ${collapsedStudies.has(group.studyType) ? "collapsed" : ""}`}>
              ▶
            </span>
            <h3>{group.label}</h3>
            <span className="import-mapping-count">{group.mappings.length} полей</span>
          </div>

          {!collapsedStudies.has(group.studyType) && (
            <div className="import-mapping-table-wrap">
              <table className="import-mapping-table">
                <thead>
                  <tr>
                    <th className="col-measurement">Измерение XML</th>
                    <th className="col-value">Значение</th>
                    <th className="col-field">Поле протокола</th>
                    <th className="col-transform">Преобразование</th>
                    <th className="col-enabled">Вкл</th>
                    <th className="col-actions"></th>
                  </tr>
                </thead>
                <tbody>
                  {group.mappings.map((entry, idx) => {
                    const globalIdx = mappings.indexOf(entry);
                    const fields = getFieldsForStudy(entry.targetStudyType);
                    return (
                      <tr key={entry.measurementId} className={!entry.isEnabled ? "disabled" : ""}>
                        <td className="col-measurement">
                          <code>{entry.measurementId}</code>
                          <div className="measurement-label">{entry.measurementLabel}</div>
                        </td>
                        <td className="col-value">
                          <span className="value-badge">число → строка</span>
                        </td>
                        <td className="col-field">
                          <select
                            value={entry.targetField}
                            onChange={(e) => handleChangeField(globalIdx, e.target.value)}
                            className="import-mapping-select"
                          >
                            <option value="">— не выбрано —</option>
                            {fields.map((f) => (
                              <option key={f.path} value={f.path}>
                                {f.label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="col-transform">
                          <span className="transform-badge">{entry.transform}</span>
                        </td>
                        <td className="col-enabled">
                          <label className="toggle-switch">
                            <input
                              type="checkbox"
                              checked={entry.isEnabled}
                              onChange={() => handleToggle(globalIdx)}
                            />
                            <span className="toggle-slider" />
                          </label>
                        </td>
                        <td className="col-actions">
                          <button
                            className="import-mapping-btn import-mapping-btn--small"
                            onClick={() => handleSave(globalIdx)}
                            disabled={saving === entry.id}
                          >
                            {saving === entry.id ? "..." : "Сохранить"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ImportMappingTab;