// Frontend/src/types/ovary.ts
export interface OvaryCyst {
  size: string; // формат: "10x15" (мм)
}

export interface OvaryProtocol {
  // Размеры
  length: string;
  width: string;
  thickness: string;
  volume: string;
  // Форма
  shape: string;
  // Контур
  contour: string;
  // Кисты
  cysts: string;
  cystsList: OvaryCyst[];
  // Образования
  formations: string;
  formationsText: string;
  // Дополнительно
  additional: string;
  // Заключение
  conclusion: string;
}

export interface OvaryProps {
  value?: OvaryProtocol;
  onChange?: (value: OvaryProtocol) => void;
  side: 'left' | 'right';
}
