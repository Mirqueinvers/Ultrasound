import type { AuthAPI } from '../../electron/preload';

declare global {
  interface Window {
    authAPI: AuthAPI;
  }
}

export {};
