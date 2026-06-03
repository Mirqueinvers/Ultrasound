export interface ProstateProtocol {
  studyType: "трансабдоминальное" | "трансректальное" | "";

  position: string;
  length: string;
  width: string;
  apDimension: string;
  volume: string;

  contour: "четкий ровный" | "четкий не ровный" | "не четкий" | "";
  symmetry: "сохранена" | "ассиметрична" | "";
  shape: "овальная" | "треугольная" | "";

  echogenicity: "средняя" | "повышенная" | "пониженная" | "";

  echotexture:
    | "однородная"
    | "неоднородная"
    | "диффузно-неоднородная"
    | "";
  echotextureText: string;

  bladderProtrusion: "выступает" | "не выступает" | "";
  bladderProtrusionMm: string;

  pathologicLesions: "определяются" | "не определяются" | "";
  pathologicLesionsText: string;

  additional: string;
  conclusion: string;
}

export interface ProstateProps {
  value?: ProstateProtocol;
  onChange?: (value: ProstateProtocol) => void;
}