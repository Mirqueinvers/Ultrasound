// Frontend/src/types/uterus.ts
export interface UterusProtocol {
  // Размеры
  length: string;
  width: string;
  apDimension: string; // ПЗР (передне-задний размер)
  volume: string;
  // Форма матки
  shape: string;
  // Положение
  position: string;
  // Строение миометрия
  myometriumStructure: string;
  myometriumStructureText: string;
  // Эндометрий
  endometriumSize: string;
  // Структура эндометрия
  endometriumStructure: string;
  // Шейка матки
  cervixSize: string;
  // Эхоструктура шейки матки
  cervixEchostructure: string;
  cervixEchostructureText: string;
  // Цервикальный канал
  cervicalCanal: string;
  // Дополнительно
  additional: string;
  // Заключение
  conclusion: string;
}

export interface UterusProps {
  value?: UterusProtocol;
  onChange?: (value: UterusProtocol) => void;
}
