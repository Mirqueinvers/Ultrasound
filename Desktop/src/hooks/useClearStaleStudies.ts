import { useEffect } from 'react';
import type { DesktopStudiesDataMap } from '@/researches/types';

/**
 * Очищает устаревшие данные исследований из контекста при смене набора выбранных исследований.
 *
 * Когда пользователь убирает исследование из списка, соответствующие данные
 * удаляются из studiesData, включая исторические ключи для обратной совместимости.
 */
export function useClearStaleStudies(
  selectedStudies: string[],
  studiesData: DesktopStudiesDataMap,
  clearStudyData: (key: string) => void,
) {
  useEffect(() => {
    const allowedDataKeys = new Set(selectedStudies);

    // Поддерживаем исторические ключи для лимфоузлов, чтобы не терять совместимость.
    if (allowedDataKeys.has('Лимфоузлы')) {
      allowedDataKeys.add('Лимфатические узлы');
      allowedDataKeys.add('lymphNodes');
    }

    Object.keys(studiesData).forEach((studyKey) => {
      if (!allowedDataKeys.has(studyKey)) {
        clearStudyData(studyKey);
      }
    });
  }, [selectedStudies, studiesData, clearStudyData]);
}
