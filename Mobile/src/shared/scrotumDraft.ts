export interface SingleTestisDraft {
  length: string;
  width: string;
  depth: string;
  volume: string;

  location: string;
  contour: string;

  capsule: string;
  capsuleText: string;

  echogenicity: string;
  echotexture: string;
  echotextureText: string;

  mediastinum: string;
  mediastinumText: string;

  bloodFlow: string;

  appendage: string;
  appendageText: string;

  fluidAmount: string;
  fluidAmountText: string;

  additional: string;
  conclusion: string;
}

export interface ScrotumTestisDraft {
  rightTestis: SingleTestisDraft;
  leftTestis: SingleTestisDraft;
}

export interface ScrotumDraft {
  testis: ScrotumTestisDraft;
  conclusion: string;
  recommendations: string;
}

export function createEmptySingleTestisDraft(): SingleTestisDraft {
  return {
    length: "",
    width: "",
    depth: "",
    volume: "",
    location: "",
    contour: "",
    capsule: "",
    capsuleText: "",
    echogenicity: "",
    echotexture: "",
    echotextureText: "",
    mediastinum: "",
    mediastinumText: "",
    bloodFlow: "",
    appendage: "",
    appendageText: "",
    fluidAmount: "",
    fluidAmountText: "",
    additional: "",
    conclusion: "",
  };
}

export function createEmptyScrotumDraft(): ScrotumDraft {
  return {
    testis: {
      rightTestis: createEmptySingleTestisDraft(),
      leftTestis: createEmptySingleTestisDraft(),
    },
    conclusion: "",
    recommendations: "",
  };
}
