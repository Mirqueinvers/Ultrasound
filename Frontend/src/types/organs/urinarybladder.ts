export interface UrinaryBladderProtocol {
  // Размеры до мочеиспускания
  length: string;
  width: string;
  depth: string;
  volume: string; // рассчитывается из length * width * depth * 0.523
  wallThickness: string;

  // Объем остаточной мочи
  residualLength: string;
  residualWidth: string;
  residualDepth: string;
  residualVolume: string; // рассчитывается так же

  // Содержимое
  contents: string;            // однородное / неоднородное
  contentsText: string;        // описание, если неоднородное

  // Дополнительно
  additional: string;
}

export interface UrinaryBladderProps {
  value?: UrinaryBladderProtocol;
  onChange?: (value: UrinaryBladderProtocol) => void;
}