import React, { useCallback } from "react";
import { RefreshCw } from "lucide-react";
import { useResearch } from "@contexts";
import DatePickerField from "./DatePickerField";
import { parseMedisonXml } from "@/sync/medisonXmlParser";
import { makeObpStudyData, makeKidneyStudyData, makeOmtFemaleStudyData, makeBladderStudyData, makeUrinaryBladderPartial, makeThyroidStudyData, makeProstateStudyData } from "@/hooks/useMedisonImport";

/** Конвертирует "гггг-мм-дд" в "дд.мм.гггг" */
const isoToRu = (iso: string): string => {
  if (!iso) return "";
  const match = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return iso;
  return `${match[3]}.${match[2]}.${match[1]}`;
};

/** Конвертирует "дд.мм.гггг" в "гггг-мм-дд" */
const ruToIso = (ru: string): string => {
  if (!ru) return "";
  const match = ru.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (!match) return ru;
  return `${match[3]}-${match[2]}-${match[1]}`;
};

export interface ResearchHeaderProps {
  paymentType: "oms" | "paid";
  setPaymentType: (type: "oms" | "paid") => void;
}

export const ResearchHeader: React.FC<ResearchHeaderProps> = ({ paymentType, setPaymentType }) => {
  const {
    patientFullName,
    setPatientFullName,
    patientDateOfBirth,
    setPatientDateOfBirth,
    researchDate,
    setResearchDate,
    mergeStudyData,
  } = useResearch();

  // Обработчик ручного импорта с флешки
  const handleMedisonImport = useCallback(async () => {
    try {
      const result = await window.medisonAPI?.scanAndRead();
      if (!result?.success || !result.content) {
        console.warn("ResearchHeader: флешка не найдена", result?.message);
        return;
      }

      const parsed = parseMedisonXml(result.content);
      if (!parsed) {
        console.warn("ResearchHeader: не удалось распарсить XML");
        return;
      }

      // Нормализация ФИО и дат
      const name = normalizeFullName(parsed.patient.fullName);
      const dob = normalizeDateOfBirth(parsed.patient.dateOfBirth);
      const researchDateStr = normalizeDateForDesktop(parsed.examDate);

      if (name) setPatientFullName(name);
      else if (parsed.patient.fullName) setPatientFullName(normalizeFullName(parsed.patient.fullName));
      if (dob) setPatientDateOfBirth(dob);
      else if (parsed.patient.dateOfBirth) setPatientDateOfBirth(normalizeDateOfBirth(parsed.patient.dateOfBirth));
      if (researchDateStr) setResearchDate(researchDateStr);
      else if (parsed.examDate) setResearchDate(normalizeDateForDesktop(parsed.examDate));

      // Заполняем данные протоколов
      if (parsed.obp) {
        const obpData = makeObpStudyData(parsed.obp) as unknown as Record<string, unknown>;
        if (Object.keys(obpData).length > 0) {
          mergeStudyData("ОБП", obpData);
        }
      }

      if (parsed.kidneys) {
        const kidneyData = makeKidneyStudyData(parsed.kidneys) as unknown as Record<string, unknown>;
        if (Object.keys(kidneyData).length > 0) {
          mergeStudyData("Почки", kidneyData);
        }
      }

      if (parsed.gyn) {
        const omtFemaleData = makeOmtFemaleStudyData(parsed.gyn) as unknown as Record<string, unknown>;
        if (Object.keys(omtFemaleData).length > 0) {
          mergeStudyData("ОМТ (Ж)", omtFemaleData);
        }
      }

      if (parsed.uro) {
        const bladderData = makeBladderStudyData(parsed.uro) as unknown as Record<string, unknown>;
        if (Object.keys(bladderData).length > 0) {
          mergeStudyData("Мочевой пузырь", bladderData);
        }

        // Также мержим urinaryBladder как подполе в Почки, ОМТ (Ж), ОМТ (М)
        const bladderPartial = makeUrinaryBladderPartial(parsed.uro) as Record<string, unknown> | undefined;
        if (bladderPartial) {
          mergeStudyData("Почки", bladderPartial);
          mergeStudyData("ОМТ (Ж)", bladderPartial);
          mergeStudyData("ОМТ (М)", bladderPartial);
        }
      }

      if (parsed.thyroid) {
        const thyroidData = makeThyroidStudyData(parsed.thyroid) as unknown as Record<string, unknown>;
        if (Object.keys(thyroidData).length > 0) {
          mergeStudyData("Щитовидная железа", thyroidData);
        }
      }

      if (parsed.uro?.prostate) {
        const prostateData = makeProstateStudyData(parsed.uro) as unknown as Record<string, unknown>;
        if (Object.keys(prostateData).length > 0) {
          mergeStudyData("ОМТ (М)", prostateData);
        }
      }

      console.log("ResearchHeader: данные импортированы с флешки");
    } catch (err) {
      console.error("ResearchHeader: ошибка импорта", err);
    }
  }, [setPatientFullName, setPatientDateOfBirth, setResearchDate, mergeStudyData]);

  const fullNameParts = patientFullName.split(" ");
  const lastName = fullNameParts[0] || "";
  const firstName = fullNameParts[1] || "";
  const middleName = fullNameParts[2] || "";

  const capitalizeFirstLetter = (str: string): string => {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const handleLastNameBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const capitalized = capitalizeFirstLetter(e.target.value);
    const parts = patientFullName.split(" ");
    const rest = parts.slice(1).filter(Boolean);
    setPatientFullName([capitalized, ...rest].join(" "));
  };

  const handleFirstNameBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const capitalized = capitalizeFirstLetter(e.target.value);
    const parts = patientFullName.split(" ");
    const last = parts[0] || "";
    const rest = parts.slice(2).filter(Boolean);
    setPatientFullName([last, capitalized, ...rest].join(" "));
  };

  const handleMiddleNameBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const capitalized = capitalizeFirstLetter(e.target.value);
    const parts = patientFullName.split(" ");
    const last = parts[0] || "";
    const first = parts[1] || "";
    setPatientFullName([last, first, capitalized].join(" "));
  };

  const handleLastNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const capitalized = capitalizeFirstLetter(e.target.value);
    const parts = patientFullName.split(" ");
    const rest = parts.slice(1).filter(Boolean);
    setPatientFullName([capitalized, ...rest].join(" "));
  };

  const handleFirstNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const capitalized = capitalizeFirstLetter(e.target.value);
    const parts = patientFullName.split(" ");
    const last = parts[0] || "";
    const rest = parts.slice(2).filter(Boolean);
    setPatientFullName([last, capitalized, ...rest].join(" "));
  };

  const handleMiddleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const capitalized = capitalizeFirstLetter(e.target.value);
    const parts = patientFullName.split(" ");
    const last = parts[0] || "";
    const first = parts[1] || "";
    setPatientFullName([last, first, capitalized].join(" "));
  };

  return (
    <div className="mb-6 rounded-xl border border-slate-200 bg-white">
      {/* Шапка с иконкой и заголовком и кнопкой обновления */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-sky-50 flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-sm font-semibold text-slate-800">
            Данные пациента
          </h2>
        </div>
        <button
          type="button"
          onClick={handleMedisonImport}
          title="Импортировать данные с флешки"
          className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-all"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      <div className="px-5 py-4">
        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          {/* Левая колонка — ФИО */}
          <div className="space-y-3">
            <Field label="Фамилия">
              <input
                type="text"
                value={lastName}
                onChange={handleLastNameChange}
                onBlur={handleLastNameBlur}
                className="w-2/3 px-3 py-2 border-0 border-b-2 border-slate-200 bg-transparent text-sm text-slate-800 transition-all outline-none focus:outline-none focus-visible:outline-none focus:ring-0 focus:border-sky-400 focus:bg-sky-50/30 rounded-t-md"
              />
            </Field>
            <Field label="Имя">
              <input
                type="text"
                value={firstName}
                onChange={handleFirstNameChange}
                onBlur={handleFirstNameBlur}
                className="w-2/3 px-3 py-2 border-0 border-b-2 border-slate-200 bg-transparent text-sm text-slate-800 transition-all outline-none focus:outline-none focus-visible:outline-none focus:ring-0 focus:border-sky-400 focus:bg-sky-50/30 rounded-t-md"
              />
            </Field>
            <Field label="Отчество">
              <input
                type="text"
                value={middleName}
                onChange={handleMiddleNameChange}
                onBlur={handleMiddleNameBlur}
                className="w-2/3 px-3 py-2 border-0 border-b-2 border-slate-200 bg-transparent text-sm text-slate-800 transition-all outline-none focus:outline-none focus-visible:outline-none focus:ring-0 focus:border-sky-400 focus:bg-sky-50/30 rounded-t-md"
              />
            </Field>
          </div>

          {/* Правая колонка — даты + оплата */}
          <div className="space-y-3">
            <Field label="Дата рождения">
              <DatePickerField
                value={patientDateOfBirth}
                onChange={setPatientDateOfBirth}
                placeholder="дд.мм.гггг"
              />
            </Field>
            <Field label="Дата исследования">
              <DatePickerField
                value={isoToRu(researchDate)}
                onChange={(val) => setResearchDate(ruToIso(val))}
                placeholder="дд.мм.гггг"
              />
            </Field>
            <Field label="Тип оплаты">
              <div className="flex gap-1.5 pt-1 max-w-[200px]">
                <button
                  type="button"
                  onClick={() => setPaymentType("oms")}
                  className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                    paymentType === "oms"
                      ? "bg-emerald-500 text-white shadow-sm shadow-emerald-200"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  ОМС
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentType("paid")}
                  className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                    paymentType === "paid"
                      ? "bg-sky-500 text-white shadow-sm shadow-sky-200"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  Платно
                </button>
              </div>
            </Field>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-0.5">
        {label}
      </label>
      {children}
    </div>
  );
};

export default ResearchHeader;

/** Преобразует "КУЗНЕЦОВ, ДМИТРИЙ ЮРЬЕВИЧ" в "Кузнецов Дмитрий Юрьевич" */
function normalizeFullName(name: string): string {
  return name
    .replace(/,/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

/** Преобразует "1990-10-12" в "12.10.1990" */
function normalizeDateOfBirth(dateStr: string): string {
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    const [year, month, day] = parts;
    return `${day}.${month}.${year}`;
  }
  return dateStr;
}

/** Из DD-MM-YYYY в YYYY-MM-DD */
function normalizeDateForDesktop(dateStr: string): string {
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    const [day, month, year] = parts;
    return `${year}-${month}-${day}`;
  }
  return dateStr;
}
