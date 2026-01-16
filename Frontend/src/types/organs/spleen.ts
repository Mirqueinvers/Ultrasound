// Frontend/src/types/spleen.ts
export interface SpleenProtocol {
  // Положение
  position: string;
  // Размеры
  length: string; // мм (длина)
  width: string;  // мм (ширина)

  // Структура
  echogenicity: string;              // Эхогенность
  echostructure: string;            // Эхоструктура
  contours: string;                 // Контур
  pathologicalFormations: string;   // Патологические образования
  pathologicalFormationsText: string; // описание, если определяются

  // Сосуды
  splenicVein: string;   // мм (селезеночная вена)
  splenicArtery: string; // мм (селезеночная артерия)

  // Дополнительно
  additional: string;

  // Заключение
  conclusion: string;
}

export interface SpleenProps {
  value?: SpleenProtocol;
  onChange?: (value: SpleenProtocol) => void;
}