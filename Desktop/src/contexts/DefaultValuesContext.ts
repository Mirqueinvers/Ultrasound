import { createContext } from "react";

export type DefaultValuesMap = Record<string, Record<string, unknown>>;

export interface DefaultValuesContextType {
  defaults: DefaultValuesMap;
  isLoaded: boolean;
  error: string | null;
  saveDefaults: (desktopKey: string, values: Record<string, unknown>) => Promise<void>;
  resetDefaults: (desktopKey?: string) => Promise<void>;
  reload: () => Promise<void>;
}

export const DefaultValuesContext = createContext<DefaultValuesContextType | undefined>(undefined);