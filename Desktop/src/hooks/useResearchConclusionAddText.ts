import { useEffect } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { useResearch } from '@contexts';
import type { DesktopStudyData } from '@/researches/types';

/**
 * Хук для обработки события `add-conclusion-text` на уровне исследования.
 *
 * Инкапсулирует подписку на глобальное событие, фильтрацию по `studyId`
 * и обновление формы заключения.
 *
 * @param studyId — идентификатор исследования (например 'study-kidneys')
 * @param studyKey — ключ для setStudyData (например "Почки")
 * @param form — текущее состояние формы
 * @param setForm — setState формы
 * @param onChange — колбэк для родителя
 */
export function useResearchConclusionAddText<T extends { conclusion?: string; recommendations?: string }>(
  studyId: string,
  studyKey: string,
  form: T,
  setForm: Dispatch<SetStateAction<T>>,
  onChange?: (data: T) => void,
) {
  const { setStudyData } = useResearch();

  useEffect(() => {
    const handleAddConclusionText = (event: CustomEvent) => {
      const { text, studyId: eventStudyId } = event.detail;

      if (eventStudyId !== studyId) return;

      const currentConclusion = form.conclusion?.trim() ?? '';
      const newConclusion = currentConclusion
        ? `${currentConclusion} ${text}`
        : text;

      const updated = {
        ...form,
        conclusion: newConclusion,
        recommendations: form.recommendations ?? '',
      } as T;

      setForm(updated);
      onChange?.(updated);
      setStudyData(studyKey, updated as unknown as DesktopStudyData);
    };

    window.addEventListener('add-conclusion-text', handleAddConclusionText as EventListener);
    return () => {
      window.removeEventListener('add-conclusion-text', handleAddConclusionText as EventListener);
    };
    // form в зависимостях, чтобы всегда использовать актуальное значение
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studyId, studyKey, form, setForm, onChange, setStudyData]);
}
