// src/types/organs/gallbladder.ts 
export interface Concretion {
  size: string; // мм
  position: string; // шейка / тело / дно
}

export interface Polyp {
  size: string; // мм
  position: string; // шейка / тело / дно
  wall: string;
}

export interface GallbladderProtocol {
  //Положение
  position: string
  // Размеры
  length: string;
  width: string;
  // Стенка
  wallThickness: string;
  // Форма
  shape: string;
  constriction: string;
  // Содержимое
  contentType: string;
  concretions: string;
  concretionsList: Concretion[];
  polyps: string;
  polypsList: Polyp[];
  content: string;
  // Протоки
  cysticDuct: string;
  commonBileDuct: string;
  // Дополнительно
  additional: string;
  // Заключение
  conclusion: string;
}

export interface GallbladderProps {
  value?: GallbladderProtocol;
  onChange?: (value: GallbladderProtocol) => void;
}

// Типы для списков
export interface GallbladderConcretionsProps {
  items: Concretion[];
  onAdd: () => void;
  onUpdate: (index: number, field: keyof Concretion, value: string) => void;
  onRemove: (index: number) => void;
  addLabel?: string;
}

// ← НОВЫЙ ТИП ДЛЯ POLYPS
export interface GallbladderPolypsProps {
  items: Polyp[];
  onAdd: () => void;
  onUpdate: (index: number, field: keyof Polyp, value: string) => void;
  onRemove: (index: number) => void;
  addLabel?: string;
}
