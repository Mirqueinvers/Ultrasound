import type { MobileHostStatus } from "../../../electron/preload";

/**
 * Адаптер над window.mobileHostAPI.
 */
export const mobileHostService = {
  getStatus: (): Promise<MobileHostStatus> =>
    window.mobileHostAPI?.getStatus() ?? Promise.resolve({} as MobileHostStatus),
  start: (): Promise<MobileHostStatus> =>
    window.mobileHostAPI?.start() ?? Promise.resolve({} as MobileHostStatus),
  stop: (): Promise<MobileHostStatus> =>
    window.mobileHostAPI?.stop() ?? Promise.resolve({} as MobileHostStatus),
  restart: (): Promise<MobileHostStatus> =>
    window.mobileHostAPI?.restart() ?? Promise.resolve({} as MobileHostStatus),
  setProfile: (profile: { organization?: string | null }): Promise<MobileHostStatus> =>
    window.mobileHostAPI?.setProfile(profile) ?? Promise.resolve({} as MobileHostStatus),
  publishSync: (message: unknown): Promise<MobileHostStatus> =>
    window.mobileHostAPI?.publishSync(message) ?? Promise.resolve({} as MobileHostStatus),
  onSyncMessage: (handler: (message: unknown) => void): (() => void) =>
    window.mobileHostAPI?.onSyncMessage(handler) ?? (() => {}),
};