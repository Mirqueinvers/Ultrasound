// src/types/organs/kidney.ts (дополнить существующий файл)
export interface Concrement {
  size: string;
  location: string;
}

export interface Cyst {
  size: string;
  location: string;
}

export interface KidneyProtocol {
  position: string;
  positionText: string;
  length: string;
  width: string;
  thickness: string;
  parenchymaSize: string;
  parenchymaEchogenicity: string;
  parenchymaStructure: string;
  parenchymaConcrements: string;
  parenchymaConcrementslist: Concrement[];
  parenchymaCysts: string;
  parenchymaCystslist: Cyst[];
  parenchymaMultipleCysts: boolean;
  parenchymaMultipleCystsSize: string;
  parenchymaPathologicalFormations: string;
  parenchymaPathologicalFormationsText: string;
  pcsSize: string;
  pcsMicroliths: string;
  pcsMicrolithsSize: string;
  pcsConcrements: string;
  pcsConcrementslist: Concrement[];
  pcsCysts: string;
  pcsCystslist: Cyst[];
  pcsMultipleCysts: boolean;
  pcsMultipleCystsSize: string;
  pcsPathologicalFormations: string;
  pcsPathologicalFormationsText: string;
  sinus: string;
  adrenalArea: string;
  adrenalAreaText: string;
  contour: string;
  additional: string;
}

export interface KidneyCommonProps {
  side: "left" | "right";
  value?: KidneyProtocol;
  onChange?: (value: KidneyProtocol) => void;
}

export interface KidneyConcrementsProps {
  items: Concrement[];
  onAdd: () => void;
  onUpdate: (index: number, field: keyof Concrement, value: string) => void;
  onRemove: (index: number) => void;
  addLabel?: string;
}

// ← НОВЫЙ ТИП ДЛЯ CYSTS (более сложный)
export interface KidneyCystsProps {
  items: Cyst[];
  onAdd: () => void;
  onUpdate: (index: number, field: keyof Cyst, value: string) => void;
  onRemove: (index: number) => void;
  
  // множественные кисты
  multiple: boolean;
  multipleSize: string;
  onToggleMultiple: () => void;
  onChangeMultipleSize: (value: string) => void;
  
  // опциональный текст для кнопки добавления
  addLabel?: string;
}
