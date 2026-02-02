// Frontend/src/types/defaultStates/lymphNodesStudy.ts
import type { LymphNodesStudyProtocol } from "../studyes/lymphNodesStudy";
import { defaultLymphNodesState } from "../organs/lymphNodes";

export const defaultLymphNodesStudyState: LymphNodesStudyProtocol = {
  lymphNodes: defaultLymphNodesState,
  conclusion: "",
  recommendations: "",
};
