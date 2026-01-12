import { app, BrowserWindow, nativeImage } from 'electron';
import path from 'path';
import { setupAuthHandlers } from './ipc-handlers';

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  const iconPath = path.join(__dirname, '..', 'src', 'assets', 'us-icon.png');
  const iconImage = nativeImage.createFromPath(iconPath);

  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,

    // ❗ Полностью убираем системную рамку и шапку
    frame: false,
    titleBarStyle: 'hidden',

    autoHideMenuBar: true,
    backgroundColor: '#f8fafc',
    show: false,

    icon: iconImage,

    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  setupAuthHandlers(mainWindow);

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    // mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
