// Frontend/src/components/journal/Journal.tsx

import React, { useEffect, useState } from 'react';

interface Patient {
  id: number;
  last_name: string;
  first_name: string;
  middle_name?: string;
  date_of_birth: string;
  created_at: string;
  updated_at: string;
}

interface Research {
  id: number;
  patient_id: number;
  research_date: string;
  payment_type: 'oms' | 'paid';
  doctor_name?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface JournalEntry {
  patient: Patient;
  researches: Research[];
}

declare global {
  interface Window {
    journalAPI: {
      getByDate: (date: string) => Promise<JournalEntry[]>;
    };
  }
}

const formatPatientName = (p: Patient) =>
  `${p.last_name} ${p.first_name}${p.middle_name ? ` ${p.middle_name}` : ''}`;

const Journal: React.FC = () => {
  const [date, setDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedPatientIds, setExpandedPatientIds] = useState<number[]>([]);

  const toggleExpanded = (patientId: number) => {
    setExpandedPatientIds((prev) =>
      prev.includes(patientId)
        ? prev.filter((id) => id !== patientId)
        : [...prev, patientId]
    );
  };

  const loadData = async (d: string) => {
    setLoading(true);
    try {
      const result = await window.journalAPI.getByDate(d);
      setEntries(result);
    } catch (e) {
      console.error('Ошибка загрузки журнала', e);
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(date);
  }, [date]);

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex items-center gap-3">
        <label className="text-sm text-slate-700">Дата:</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="bg-white text-slate-900 text-sm px-3 py-1.5 rounded border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
        />
      </div>

      <div className="flex-1 overflow-auto rounded-lg border border-slate-200 bg-slate-50">
        {loading && (
          <div className="p-4 text-sm text-slate-500">
            Загрузка данных за выбранную дату...
          </div>
        )}

        {!loading && entries.length === 0 && (
          <div className="p-4 text-sm text-slate-500">
            Нет пациентов за эту дату.
          </div>
        )}

        {!loading && entries.length > 0 && (
          <ul className="divide-y divide-slate-200">
            {entries.map(({ patient, researches }) => {
              const isExpanded = expandedPatientIds.includes(patient.id);
              return (
                <li key={patient.id}>
                  <button
                    type="button"
                    onClick={() => toggleExpanded(patient.id)}
                    className="w-full text-left px-4 py-3 flex justify-between items-center hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-slate-900">
                        {formatPatientName(patient)}
                      </span>
                      <span className="text-xs text-slate-500">
                        Дата рождения: {patient.date_of_birth}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-slate-500">
                        Исследований: {researches.length}
                      </span>
                      <span
                        className={`text-xs transition-transform ${
                          isExpanded ? 'rotate-90' : ''
                        }`}
                      >
                        ▶
                      </span>
                    </div>
                  </button>

                  {isExpanded && researches.length > 0 && (
                    <div className="bg-white border-t border-slate-200 px-4 py-3 text-sm">
                      <ul className="space-y-2">
                        {researches.map((r) => (
                          <li
                            key={r.id}
                            className="flex flex-col md:flex-row md:items-center md:justify-between gap-1"
                          >
                            <div className="flex flex-col">
                              <span className="text-slate-900">
                                Врач: {r.doctor_name || '—'}
                              </span>
                              {r.notes && (
                                <span className="text-xs text-slate-500">
                                  Заметки: {r.notes}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-xs text-slate-500">
                              <span>
                                Тип оплаты:{' '}
                                {r.payment_type === 'oms' ? 'ОМС' : 'Платно'}
                              </span>
                              <span>Время: {r.research_date}</span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Journal;
