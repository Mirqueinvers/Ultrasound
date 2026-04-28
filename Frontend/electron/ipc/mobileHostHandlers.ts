import { ipcMain } from "electron";
import { getMobileHostService } from "../mobile-host";

export function setupMobileHostHandlers(): void {
  const mobileHost = getMobileHostService();

  ipcMain.handle("mobile-host:getStatus", async () => mobileHost.getStatus());
  ipcMain.handle("mobile-host:start", async () => mobileHost.start());
  ipcMain.handle("mobile-host:stop", async () => {
    mobileHost.stop();
    return mobileHost.getStatus();
  });
  ipcMain.handle("mobile-host:restart", async () => mobileHost.restart());
  ipcMain.handle(
    "mobile-host:setProfile",
    async (_event, profile: Parameters<typeof mobileHost.setProfile>[0]) =>
      mobileHost.setProfile(profile),
  );
  ipcMain.handle(
    "mobile-host:publishSync",
    async (_event, message: Parameters<typeof mobileHost.publishSyncMessage>[0]) => {
      mobileHost.publishSyncMessage(message);
      return mobileHost.getStatus();
    },
  );
}
