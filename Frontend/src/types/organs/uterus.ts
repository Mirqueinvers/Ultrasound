// Frontend/src/types/uterus.ts
export interface UterusProtocol {

  uterusStatus: string;
  // Информация об исследовании
  studyType: string;
  lastMenstruationDate: string;
  cycleDay: string;
  menopause: string;
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
  myometriumEchogenicity: string; // Эхогенность
  uterineCavity: string; // Полость матки
  uterineCavityText: string;
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
  cervicalCanalText: string;
  // Свободная жидкость в малом тазу
  freeFluid: string;
  freeFluidText: string;
  // Дополнительно
  additional: string;
  // Заключение
  conclusion: string;
}

export interface UterusProps {
  value?: UterusProtocol;
  onChange?: (value: UterusProtocol) => void;
}
