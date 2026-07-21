import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { STUDY_SCHEMAS } from "@/sync/medisonMappingTypes";
import type { MedisonMappingRow } from "../../../electron/preload";
import "./ImportMappingTab.css";

interface MappingEntry {
  id: number | null;
  measurementId: string;
  targetStudyType: string;
  targetField: string;
  transform: string;
  isEnabled: boolean;
  /** Флаг для новых строк, ещё не сохранённых в БД */
  isNew?: boolean;
}

const getFieldsForStudy = (studyType: string) => {
  const schema = STUDY_SCHEMAS.find((s) => s.studyType === studyType);
  return schema ? schema.fields : [];
};

const ImportMappingTab: React.FC = () => {
  const { user } = useAuth();
  const [mappings, setMappings] = useState<MappingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [collapsedStudies, setCollapsedStudies] = useState<Set<string>>(new Set());
  const [hasChanges, setHasChanges] = useState(false);

  // Загружает маппинги из БД
  const loadMappings = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const result = await window.importMappingAPI.getMappings(parseInt(user.id));
      let dbMappings = result.success && result.mappings ? result.mappings : [];

      // Если маппингов нет — сбрасываем на дефолтные
      if (dbMappings.length === 0) {
        await window.importMappingAPI.resetDefaultMappings(parseInt(user.id));
        const retry = await window.importMappingAPI.getMappings(parseInt(user.id));
        dbMappings = retry.success && retry.mappings ? retry.mappings : [];
      }

      const entries: MappingEntry[] = dbMappings.map((r: MedisonMappingRow) => ({
        id: r.id,
        measurementId: r.measurement_id,
        targetStudyType: r.target_study_type,
        targetField: r.target_field,
        transform: r.transform,
        isEnabled: r.is_enabled === 1,
      }));
      setMappings(entries);
      setHasChanges(false);
    } catch {
      setMessage({ type: "error", text: "Ошибка загрузки маппингов" });
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadMappings();
  }, [loadMappings]);

  // Сохраняет одну запись
  const saveMapping = async (entry: MappingEntry): Promise<boolean> => {
    if (!user) return false;
    setSaving(entry.measurementId || "new");
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
              ? { ...m, id: result.id ?? m.id, isNew: false }
              : m
          )
        );
        return true;
      }
      return false;
    } catch {
      setMessage({ type: "error", text: "Ошибка сохранения" });
      return false;
    } finally {
      setSaving(null);
    }
  };

  // Добавить новую строку
  const handleAddRow = () => {
    const newEntry: MappingEntry = {
      id: null,
      measurementId: "",
      targetStudyType: "obp",
      targetField: "",
      transform: "number->string",
      isEnabled: true,
      isNew: true,
    };
    setMappings((prev) => [...prev, newEntry]);
    setHasChanges(true);
  };

  // Удалить строку
  const handleDelete = async (entry: MappingEntry) => {
    if (!user) return;

    if (entry.id) {
      // Уже сохранена в БД — удаляем через API
      const result = await window.importMappingAPI.deleteMapping(entry.id);
      if (!result.success) {
        setMessage({ type: "error", text: "Ошибка удаления" });
        return;
      }
    }

    setMappings((prev) =>
      prev.filter(
        (m) =>
          !(m.measurementId === entry.measurementId && m.targetStudyType === entry.targetStudyType)
      )
    );
    setHasChanges(true);
    setMessage({ type: "success", text: "Запись удалена" });
    setTimeout(() => setMessage(null), 2000);
  };

  // Обновить поле в локальном состоянии
  const updateField = (index: number, field: keyof MappingEntry, value: string | boolean) => {
    setMappings((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
    setHasChanges(true);
  };

  // Сохранить изменения и перезагрузить
  const handleSaveAll = async () => {
    if (!user) return;

    // Сохраняем все строки, у которых есть measurementId
    for (const entry of mappings) {
      if (!entry.measurementId.trim()) continue;
      const ok = await saveMapping(entry);
      if (!ok) return;
    }

    await loadMappings();
    setMessage({ type: "success", text: "Все изменения сохранены" });
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

  // Строки без выбранного типа — в "Прочее"
  const otherMappings = mappings.filter(
    (m) => !STUDY_SCHEMAS.some((s) => s.studyType === m.targetStudyType)
  );
  if (otherMappings.length > 0) {
    grouped.push({
      studyType: "_other",
      label: "Прочее",
      fields: [],
      mappings: otherMappings,
    });
  }

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
          Добавьте соответствия между измерениями в XML-отчёте сканера Medison и полями протокола.
          Поле «Измерение XML» — это атрибут <code>id</code> у тега <code>{'<measurement>'}</code> в XML (например <code>Rad_Liver_L</code>).
          Чтобы узнать ID — откройте любой XML-файл в блокноте.
        </p>
      </div>

      {message && (
        <div className={`import-mapping-message import-mapping-message--${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="import-mapping-toolbar">
        <button className="import-mapping-btn import-mapping-btn--primary" onClick={handleAddRow}>
          + Добавить строку
        </button>
        <button
          className="import-mapping-btn import-mapping-btn--save"
          onClick={handleSaveAll}
          disabled={!hasChanges}
        >
          {saving ? "Сохранение..." : "Сохранить всё"}
        </button>
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
                    <th className="col-measurement">Измерение XML (measurement id)</th>
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
                    const studySchemas = STUDY_SCHEMAS;
                    return (
                      <tr key={`${entry.measurementId}-${entry.targetStudyType}-${idx}`} className={!entry.isEnabled ? "disabled" : ""}>
                        <td className="col-measurement">
                          <input
                            type="text"
                            className="import-mapping-input"
                            value={entry.measurementId}
                            onChange={(e) => updateField(globalIdx, "measurementId", e.target.value)}
                            placeholder="Rad_MyCustom_Value"
                          />
                        </td>
                        <td className="col-field">
                          <div className="import-mapping-field-row">
                            <select
                              value={entry.targetStudyType}
                              onChange={(e) => updateField(globalIdx, "targetStudyType", e.target.value)}
                              className="import-mapping-select import-mapping-select--small"
                            >
                              {studySchemas.map((s) => (
                                <option key={s.studyType} value={s.studyType}>
                                  {s.label}
                                </option>
                              ))}
                            </select>
                            <select
                              value={entry.targetField}
                              onChange={(e) => updateField(globalIdx, "targetField", e.target.value)}
                              className="import-mapping-select"
                            >
                              <option value="">— не выбрано —</option>
                              {fields.map((f) => (
                                <option key={f.path} value={f.path}>
                                  {f.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </td>
                        <td className="col-transform">
                          <select
                            value={entry.transform}
                            onChange={(e) => updateField(globalIdx, "transform", e.target.value)}
                            className="import-mapping-select import-mapping-select--small"
                          >
                            <option value="number->string">число → строка</option>
                            <option value="none">как есть</option>
                          </select>
                        </td>
                        <td className="col-enabled">
                          <label className="toggle-switch">
                            <input
                              type="checkbox"
                              checked={entry.isEnabled}
                              onChange={() => updateField(globalIdx, "isEnabled", !entry.isEnabled)}
                            />
                            <span className="toggle-slider" />
                          </label>
                        </td>
                        <td className="col-actions">
                          <button
                            className="import-mapping-btn import-mapping-btn--danger"
                            onClick={() => handleDelete(entry)}
                            title="Удалить"
                          >
                            🗑
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

      {mappings.length === 0 && (
        <div className="import-mapping-empty">
          <p>Нет настроенных маппингов. Нажмите «+ Добавить строку» чтобы создать новый.</p>
        </div>
      )}
    </div>
  );
};

export default ImportMappingTab;