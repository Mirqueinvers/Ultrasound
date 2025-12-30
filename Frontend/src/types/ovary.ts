// Frontend/src/types/ovary.ts
export interface Follicle {
  size: string; // мм
}

export interface OvaryProtocol {
  // Размеры
  length: string;
  width: string;
  thickness: string;
  volume: string;
  // Эхоструктура
  echostructure: string;
  echostructureText: string;
  // Фолликулы
  follicles: string;
  folliclesList: Follicle[];
  dominantFollicle: string;
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
