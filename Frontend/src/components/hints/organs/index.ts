// Индексный файл для подсказок органов

export { liverHints } from './liverHints';
export { kidneyHints } from './kidneyHints';
export { thyroidHints } from './thyroidHints';
export { gallbladderHints } from './gallbladderHints';
export { pancreasHints } from './pancreasHints';
export { spleenHints } from './spleenHints';
export { breastHints } from './breastHints';
export { ovaryHints } from './ovaryHints';
export { prostateHints } from './prostateHints';
export { testisHints } from './testisHints';
export { urinaryBladderHints } from './urinaryBladderHints';
export { uterusHints } from './uterusHints';
export { brachioCephalicArteriesHints } from './brachioCephalicArteriesHints';

// Объединенная карта всех подсказок с уникальными ключами
import { liverHints } from './liverHints';
import { kidneyHints } from './kidneyHints';
import { thyroidHints } from './thyroidHints';
import { gallbladderHints } from './gallbladderHints';
import { pancreasHints } from './pancreasHints';
import { spleenHints } from './spleenHints';
import { breastHints } from './breastHints';
import { ovaryHints } from './ovaryHints';
import { prostateHints } from './prostateHints';
import { testisHints } from './testisHints';
import { urinaryBladderHints } from './urinaryBladderHints';
import { uterusHints } from './uterusHints';
import { brachioCephalicArteriesHints } from './brachioCephalicArteriesHints';

// Создаем уникальные ключи с префиксами органов
export const organHints = {
  // Печень
  ...Object.fromEntries(
    Object.entries(liverHints).map(([key, value]) => [`liver.${key}`, value])
  ),
  
  // Почки
  ...Object.fromEntries(
    Object.entries(kidneyHints).map(([key, value]) => [`kidney.${key}`, value])
  ),
  
  // Щитовидная железа
  ...Object.fromEntries(
    Object.entries(thyroidHints).map(([key, value]) => [`thyroid.${key}`, value])
  ),
  
  // Желчный пузырь
  ...Object.fromEntries(
    Object.entries(gallbladderHints).map(([key, value]) => [`gallbladder.${key}`, value])
  ),
  
  // Поджелудочная железа
  ...Object.fromEntries(
    Object.entries(pancreasHints).map(([key, value]) => [`pancreas.${key}`, value])
  ),
  
  // Селезенка
  ...Object.fromEntries(
    Object.entries(spleenHints).map(([key, value]) => [`spleen.${key}`, value])
  ),
  
  // Молочная железа
  ...Object.fromEntries(
    Object.entries(breastHints).map(([key, value]) => [`breast.${key}`, value])
  ),
  
  // Яичники
  ...Object.fromEntries(
    Object.entries(ovaryHints).map(([key, value]) => [`ovary.${key}`, value])
  ),
  
  // Простата
  ...Object.fromEntries(
    Object.entries(prostateHints).map(([key, value]) => [`prostate.${key}`, value])
  ),
  
  // Яички
  ...Object.fromEntries(
    Object.entries(testisHints).map(([key, value]) => [`testis.${key}`, value])
  ),
  
  // Мочевой пузырь
  ...Object.fromEntries(
    Object.entries(urinaryBladderHints).map(([key, value]) => [`urinaryBladder.${key}`, value])
  ),
  
  // Матка
  ...Object.fromEntries(
    Object.entries(uterusHints).map(([key, value]) => [`uterus.${key}`, value])
  ),
  
  // БЦА
  ...Object.fromEntries(
    Object.entries(brachioCephalicArteriesHints).map(([key, value]) => [`brachioCephalicArteries.${key}`, value])
  )
};

export type OrganHintKey = keyof typeof organHints;
