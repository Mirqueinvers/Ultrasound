// Frontend/src/types/gallbladder.ts
export interface Concretion {
  size: string; // мм
  position: string; // проксимальная треть / средняя треть / дистальная треть
}

export interface Polyp {
  size: string; // мм
  position: string; // проксимальная треть / средняя треть / дистальная треть
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
