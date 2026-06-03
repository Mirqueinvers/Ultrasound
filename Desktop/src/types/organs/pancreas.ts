// Frontend/src/types/pancreas.ts
export interface PancreasProtocol {
  // Размеры
  head: string;                    // мм (головка)
  body: string;                    // мм (тело)
  tail: string;                    // мм (хвост)

  // Структура
  echogenicity: string;            // Эхогенность
  echostructure: string;           // Эхоструктура
  contour: string;                 // Контур
  pathologicalFormations: string;  // Не определяются / Определяются
  pathologicalFormationsText: string; // описание патологических образований

  // Вирсунгов проток
  wirsungDuct: string;             // мм (диаметр)

  // Дополнительно
  additional: string;

  // Заключение
  conclusion: string;
}

export interface PancreasProps {
  value?: PancreasProtocol;
  onChange?: (value: PancreasProtocol) => void;
}