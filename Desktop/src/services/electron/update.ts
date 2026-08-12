/**
 * Адаптер над window.updateAPI (автообновление).
 * Тип объявлен локально в UpdateTab; здесь — тонкая типизированная обёртка.
 */
export interface UpdateServerInfo {
  name: string;
  ip: string;
}

export const updateService = {
  check: () => window.updateAPI?.check(),
  download: () => window.updateAPI?.download(),
  install: () => window.updateAPI?.install(),
  getServers: (): Promise<UpdateServerInfo[]> =>
    window.updateAPI?.getServers() ?? Promise.resolve([]),
  saveServers: (servers: UpdateServerInfo[]) =>
    window.updateAPI?.saveServers(servers) ?? Promise.resolve({ success: false }),
  getActiveServer: (): Promise<string> =>
    window.updateAPI?.getActiveServer() ?? Promise.resolve(""),
  setActiveServer: (ip: string) =>
    window.updateAPI?.setActiveServer(ip) ?? Promise.resolve({ success: false }),
  onUpdateAvailable: (handler: (info: { version: string }) => void) =>
    window.updateAPI?.onUpdateAvailable(handler) ?? (() => {}),
  onUpdateNotAvailable: (handler: (info: { version: string }) => void) =>
    window.updateAPI?.onUpdateNotAvailable(handler) ?? (() => {}),
  onDownloadProgress: (
    handler: (progress: {
      percent: number;
      bytesPerSecond: number;
      transferred: number;
      total: number;
    }) => void,
  ) => window.updateAPI?.onDownloadProgress(handler) ?? (() => {}),
  onUpdateDownloaded: (handler: (info: { version: string }) => void) =>
    window.updateAPI?.onUpdateDownloaded(handler) ?? (() => {}),
  onUpdateError: (handler: (error: { message: string }) => void) =>
    window.updateAPI?.onUpdateError(handler) ?? (() => {}),
  isAvailable: () => !!window.updateAPI,
};