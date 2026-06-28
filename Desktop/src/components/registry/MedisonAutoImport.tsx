import { useRef } from "react";
import { useMedisonImport } from "@/hooks/useMedisonImport";
import { useResearch } from "@/contexts/ResearchContext";

/**
 * Компонент-обёртка для автоматического импорта данных с флешки.
 * Работает внутри ResearchProvider.
 * При обнаружении нового XML-файла от Medison заполняет:
 * - ФИО пациента, дату рождения, дату исследования
 * - Данные протокола ОБП (liver, gallbladder, pancreas, spleen)
 * - Данные протокола Почки
 */
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return hash.toString();
}

const IMPORTED_KEY = "medison_imported_hash";

export default function MedisonAutoImport() {
  const {
    setPatientFullName,
    setPatientDateOfBirth,
    setResearchDate,
    mergeStudyData,
  } = useResearch();
  // useRef для стабильности callback
  const callbacksRef = useRef({
    setPatientFullName,
    setPatientDateOfBirth,
    setResearchDate,
    mergeStudyData,
  });

  // Обновляем ref при каждом рендере
  callbacksRef.current = {
    setPatientFullName,
    setPatientDateOfBirth,
    setResearchDate,
    mergeStudyData,
  };

  useMedisonImport({
    onDataReady: (data) => {
      // Проверяем по hash содержимого — не импортировали ли этот файл ранее
      const content = (window as any).__medisonLastContent as string | undefined;
      if (content) {
        const hash = simpleHash(content);
        if (sessionStorage.getItem(IMPORTED_KEY) === hash) {
          console.log("MedisonAutoImport: файл уже импортирован ранее, пропускаем");
          return;
        }
        // Запоминаем hash импортированного файла
        sessionStorage.setItem(IMPORTED_KEY, hash);
      }

      const {
        setPatientFullName: setName,
        setPatientDateOfBirth: setDob,
        setResearchDate: setDate,
        mergeStudyData: mergeStudy,
      } = callbacksRef.current;

      // Заполняем данные пациента (только если пусты — не затираем ручной ввод)
      if (data.patientFullName) {
        setName(normalizeFullName(data.patientFullName));
      }
      if (data.patientDateOfBirth) {
        setDob(normalizeDateOfBirth(data.patientDateOfBirth));
      }
      if (data.researchDate) {
        setDate(data.researchDate);
      }

      // Заполняем данные протокола ОБП — только те поля, что пришли из XML
      if (data.obpStudyData) {
        mergeStudy("ОБП", data.obpStudyData);
      }

      // Заполняем данные протокола Почки — только те поля, что пришли из XML
      if (data.kidneyStudyData) {
        mergeStudy("Почки", data.kidneyStudyData);
      }

      // Заполняем данные протокола ОМТ (Ж) — только те поля, что пришли из XML
      if (data.omtFemaleStudyData) {
        mergeStudy("ОМТ (Ж)", data.omtFemaleStudyData);
      }

      // Заполняем данные протокола Мочевой пузырь — только те поля, что пришли из XML
      if (data.bladderStudyData) {
        mergeStudy("Мочевой пузырь", data.bladderStudyData);
      }

      // Также мержим urinaryBladder как подполе в Почки, ОМТ (Ж), ОМТ (М)
      if (data.bladderPartial) {
        mergeStudy("Почки", data.bladderPartial);
        mergeStudy("ОМТ (Ж)", data.bladderPartial);
        mergeStudy("ОМТ (М)", data.bladderPartial);
      }

      console.log("MedisonAutoImport: данные импортированы", data);
    },
  });

  return null; // Не рендерит ничего
}

/**
 * Преобразует "КУЗНЕЦОВ, ДМИТРИЙ ЮРЬЕВИЧ" в "Кузнецов Дмитрий Юрьевич"
 */
function normalizeFullName(name: string): string {
  // Убираем запятую, разбиваем на слова
  return name
    .replace(/,/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

/**
 * Преобразует "1990-10-12" в "12.10.1990"
 */
function normalizeDateOfBirth(dateStr: string): string {
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    const [year, month, day] = parts;
    return `${day}.${month}.${year}`;
  }
  return dateStr;
}