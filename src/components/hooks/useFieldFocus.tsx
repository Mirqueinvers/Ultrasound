import { useCallback } from 'react';
import { useRightPanel } from '../contexts/RightPanelContext';

export const useFieldFocus = (organ: string, field?: string) => {
  const { showNormalValues, showConclusionSamples } = useRightPanel();
  const isConclusionField = field && field.includes('conclusion');
  
  const handleFocus = useCallback(() => {
    if (isConclusionField) {
      showConclusionSamples(organ);
    } else {
      showNormalValues(organ, field);
    }
  }, [organ, field, isConclusionField, showNormalValues, showConclusionSamples]);

  const handleBlur = useCallback(() => {
    // Убираем автоматическое скрытие панели
    // Пользователь может сам закрыть панель кнопкой или кликом
  }, []);

  return { handleFocus, handleBlur };
};