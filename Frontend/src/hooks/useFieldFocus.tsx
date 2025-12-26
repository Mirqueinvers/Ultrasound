import { useCallback } from 'react';
import { useRightPanel } from '../contexts/RightPanelContext';
import { getCustomText } from '../utils/customSizeTexts';

export const useFieldFocus = (organ: string, field?: string) => {
  const { showConclusionSamples, showCustomText } = useRightPanel();
  const isConclusionField = field && field.includes('conclusion');
  
  // Поля размеров для всех органов
  const isSizeField = field && [
    // Печень - основные размеры
    'rightLobeAP', 
    'leftLobeAP', 
    'portalVeinDiameter', 
    'ivc',
    // Печень - дополнительные размеры
    'rightLobeCCR',
    'rightLobeCVR',
    'leftLobeCCR',
    'rightLobeTotal',
    'leftLobeTotal',
    // Желчный пузырь
    'gallbladderLength', // Обновлено
    'gallbladderWidth', // Обновлено
    'wallThickness',
    'cysticDuct',
    'commonBileDuct',
    // Поджелудочная железа
    'head',
    'body',
    'tail',
    'wirsungDuct',
    // Селезенка
    'spleenLength', // Обновлено
    'spleenWidth', // Обновлено
    'splenicVein',
    'splenicArtery'
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