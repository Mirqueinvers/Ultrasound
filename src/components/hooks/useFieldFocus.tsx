import { useCallback } from 'react';
import { useRightPanel } from '../contexts/RightPanelContext';
import { customSizeTexts, getCustomText } from '../common/customSizeTexts';

export const useFieldFocus = (organ: string, field?: string) => {
  const { showConclusionSamples, showCustomText } = useRightPanel();
  const isConclusionField = field && field.includes('conclusion');
  
  // Поля размеров для всех органов
  const isSizeField = field && [
    // Печень
    'rightLobeAP', 
    'leftLobeAP', 
    'portalVeinDiameter', 
    'ivc',
    // Желчный пузырь
    'length',
    'width', 
    'wallThickness',
    'cysticDuct',
    'commonBileDuct',
    // Поджелудочная железа
    'head',
    'body',
    'tail',
    'wirsungDuct'
  ].includes(field);
  
  const handleFocus = useCallback(() => {
    if (isConclusionField) {
      showConclusionSamples(organ);
    } else if (isSizeField && field) {
      // Получаем кастомный текст для поля размеров
      const textData = getCustomText(field);
      if (textData) {
        showCustomText(textData.title, textData.content);
      }
    }
  }, [organ, field, isConclusionField, isSizeField, showConclusionSamples, showCustomText]);

  const handleBlur = useCallback(() => {
    // Ничего не делаем при blur
  }, []);

  return { handleFocus, handleBlur };
};