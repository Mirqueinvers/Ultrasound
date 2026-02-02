// Frontend/src/types/studyes/lymphNodesStudy.ts
import type { LymphNodesProtocol } from '../organs/lymphNodes';

export interface LymphNodesStudyProtocol {
  lymphNodes: LymphNodesProtocol | null;
  conclusion: string;
  recommendations: string;
}

export interface LymphNodesStudyProps {
  value?: LymphNodesStudyProtocol;
  onChange?: (value: LymphNodesStudyProtocol) => void;
}
