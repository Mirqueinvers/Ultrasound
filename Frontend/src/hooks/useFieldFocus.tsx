import { useCallback } from 'react';
import { useRightPanel } from '../contexts/RightPanelContext';
import { organHints } from '../components/hints/organs';

export const useFieldFocus = (organ: string, field?: string) => {
  const { showConclusionSamples, showCustomText } = useRightPanel();
  const isConclusionField = field && field.includes('conclusion');
  
  // Поля размеров для всех органов (без префиксов органов)
  const isSizeField = field && [
    // Печень
    'rightLobeAP', 'leftLobeAP', 'rightLobeCCR', 'rightLobeCVR', 
    'leftLobeCCR', 'rightLobeTotal', 'leftLobeTotal', 
    'portalVeinDiameter', 'ivc',
    
    // Почки (общие поля)
    'length', 'width', 'thickness', 'volume',
    
    // Щитовидная железа
    'length', 'width', 'depth', 'volume',
    
    // Желчный пузырь
    'gallbladderLength', 'gallbladderWidth', 'wallThickness', 'cysticDuct', 'commonBileDuct',
    
    // Поджелудочная железа
    'head', 'body', 'tail', 'wirsungDuct',
    
    // Селезенка
    'spleenLength', 'spleenWidth', 'splenicVein', 'splenicArtery',
    
    // Молочная железа (узлы)
    'size1', 'size2', 'depth',
    
    // Яичники
    'length', 'width', 'thickness', 'volume',
    
    // Простата
    'length', 'width', 'apDimension', 'volume',
    
    // Яички
    'length', 'width', 'depth', 'volume',
    
    // Мочевой пузырь
    'length', 'width', 'depth', 'volume', 'wallThickness',
    'residualLength', 'residualWidth', 'residualDepth', 'residualVolume',
    
    // Матка
    'uterusLength', 'uterusWidth', 'uterusApDimension', 'uterusVolume',
    'endometriumSize', 'cervixSize'
  ].includes(field);
  
  const getFieldKey = (organ: string, field: string): string => {
    // Специальная обработка для почек
    if (organ === 'leftKidney' || organ === 'rightKidney') {
      return `kidney.${field}`;
    }
    
    // Специальная обработка для щитовидной железы
    if (organ === 'leftThyroidLobe' || organ === 'rightThyroidLobe') {
      return `thyroid.${field}`;
    }
    
    // Специальная обработка для яичек (правое и левое)
    if (organ === 'leftTestis' || organ === 'rightTestis') {
      return `testis.${field}`;
    }
    
    // Специальная обработка для яичников (левый и правый)
    if (organ === 'leftOvary' || organ === 'rightOvary') {
      return `ovary.${field}`;
    }
    
    // Для остальных органов добавляем префикс органа
    return `${organ}.${field}`;
  };

  const handleFocus = useCallback(() => {
    if (isConclusionField) {
      showConclusionSamples(organ);
    } else if (isSizeField && field) {
      // Получаем подсказку из новой системы
      const hintKey = getFieldKey(organ, field);
      const textData = organHints[hintKey];
      
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