// src/types/organs/lymphNodes.ts

export interface LymphNodeProtocol {
  id: string;
  side: "left" | "right";
  echogenicity: string;
  echostructure: string;
  shape: string;
  contour: string;
  bloodFlow: string;
  size1: string;
  size2: string;
}

export interface LymphNodeRegionProtocol {
  detected: "not_detected" | "detected";
  nodes: LymphNodeProtocol[];
}

export interface LymphNodesProtocol {
  submandibular: LymphNodeRegionProtocol;
  cervical: LymphNodeRegionProtocol;
  subclavian: LymphNodeRegionProtocol;
  supraclavicular: LymphNodeRegionProtocol;
  axillary: LymphNodeRegionProtocol;
  inguinal: LymphNodeRegionProtocol;
}

export interface LymphNodesCommonProps {
  value?: LymphNodesProtocol;
  onChange?: (value: LymphNodesProtocol) => void;
  sectionRefs?: Record<string, React.RefObject<HTMLDivElement | null>>;
}

export interface LymphNodeRegionProps {
  title: string;
  value: LymphNodeRegionProtocol;
  onChange: (value: LymphNodeRegionProtocol) => void;
}

export interface LymphNodeProps {
  node: LymphNodeProtocol;
  onUpdate: (field: keyof LymphNodeProtocol, value: string) => void;
  onDelete: () => void;
}

export const defaultLymphNodeState: LymphNodeProtocol = {
  id: "",
  side: "right",
  echogenicity: "",
  echostructure: "",
  shape: "",
  contour: "",
  bloodFlow: "",
  size1: "",
  size2: "",
};

export const defaultLymphNodeRegionState: LymphNodeRegionProtocol = {
  detected: "not_detected",
  nodes: [],
};

export const defaultLymphNodesState: LymphNodesProtocol = {
  submandibular: defaultLymphNodeRegionState,
  cervical: defaultLymphNodeRegionState,
  subclavian: defaultLymphNodeRegionState,
  supraclavicular: defaultLymphNodeRegionState,
  axillary: defaultLymphNodeRegionState,
  inguinal: defaultLymphNodeRegionState,
};
