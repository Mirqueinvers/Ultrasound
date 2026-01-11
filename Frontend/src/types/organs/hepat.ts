// Frontend/src/types/hepat.ts
export interface LiverProtocol {
  // Размеры
  rightLobeAP: string; // мм (ПЗР правая)
  leftLobeAP: string; // мм (ПЗР левая)
  // Дополнительные размеры (скрытые по умолчанию)
  rightLobeCCR: string; // мм (ККР правая)
  rightLobeCVR: string; // мм (КВР правая)
  leftLobeCCR: string; // мм (ККР левая)
  rightLobeTotal: string; // мм (ККР + ПЗР правая, авторасчет)
  leftLobeTotal: string; // мм (ККР + ПЗР левая, авторасчет)
  // Структура
  echogenicity: string;
  homogeneity: string; // Эхоструктура
  contours: string;
  lowerEdgeAngle: string;
  focalLesionsPresence: string; // определяются / не определяются
  focalLesions: string; // описание, если определяются
  // Сосуды
  vascularPattern: string;
  portalVeinDiameter: string; // мм
  ivc: string;
  // Дополнительно
  additional: string;
  // Заключение
  conclusion: string;
}

export interface HepatProps {
  value?: LiverProtocol;
  onChange?: (value: LiverProtocol) => void;
}
