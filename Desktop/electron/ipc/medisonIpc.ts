import { ipcMain } from "electron";
import { promises as fs } from "node:fs";
import { existsSync } from "node:fs";
import path from "node:path";
import { readdir } from "node:fs/promises";

// Список дисков для мониторинга (съёмные USB)
const USB_DRIVE_LETTERS = ["D:", "E:", "F:", "G:", "H:", "I:", "J:", "K:", "L:"];

let watchInterval: ReturnType<typeof setInterval> | null = null;
// Храним хеши уже импортированных файлов — никогда не сбрасывается
const importedHashes = new Set<string>();

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return hash.toString();
}

/**
 * Находит имя файла по шаблону даты.
 * Формат: DD-MM-YYYY-XXXX-DD-MM-HH-MM-SS.xml
 */
function isMedisonXmlFile(filename: string): boolean {
  // Проверяем формат: "28-06-2026-0001-06-28-16-15-26.xml"
  return /^\d{2}-\d{2}-\d{4}-\d{4}-\d{2}-\d{2}-\d{2}-\d{2}-\d{2}\.xml$/i.test(filename);
}

function getTimestampFromFilename(filename: string): string {
  // Извлекаем дату+время: "28-06-2026-0001-06-28-16-15-26.xml"
  // Формат: DD-MM-YYYY-NNNN-MM-DD-HH-MM-SS.xml
  // Возвращаем YYYY-MM-DD-HH-MM-SS для сортировки
  const filenameNoExt = filename.replace(/\.xml$/i, "");
  const match = filenameNoExt.match(/^(\d{2})-(\d{2})-(\d{4})-\d{4}-\d{2}-\d{2}-(\d{2})-(\d{2})-(\d{2})$/);
  if (match) {
    const [, day, month, year, hours, minutes, seconds] = match;
    return `${year}-${month}-${day}-${hours}-${minutes}-${seconds}`;
  }
  return "";
}

interface ScannedFile {
  fullPath: string;
  dir: string;
  filename: string;
  timestamp: string; // YYYY-MM-DD-HH-MM-SS
}

async function scanDrive(drive: string): Promise<ScannedFile[]> {
  try {
    const files = await readdir(drive);
    const xmlFiles: ScannedFile[] = [];

    for (const file of files) {
      if (isMedisonXmlFile(file)) {
        xmlFiles.push({
          fullPath: path.join(drive, file),
          dir: drive,
          filename: file,
          timestamp: getTimestampFromFilename(file),
        });
      }
    }

    return xmlFiles;
  } catch {
    // Диск недоступен (нет флешки)
    return [];
  }
}

async function scanAllDrives(): Promise<ScannedFile[]> {
  const results = await Promise.all(
    USB_DRIVE_LETTERS.map((drive) => scanDrive(`${drive}\\`))
  );
  return results.flat();
}

function getNewestFile(files: ScannedFile[]): ScannedFile | null {
  if (files.length === 0) return null;

  // Сортируем по timestamp в имени (новые сверху) и берём первый
  files.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  return files[0];
}

async function readXmlFile(filePath: string): Promise<string> {
  return await fs.readFile(filePath, "utf-8");
}

export function setupMedisonHandlers(
  onXmlFound: (parsedData: unknown) => void
): void {
  // Ручное сканирование и чтение последнего XML с флешки
  ipcMain.handle("medison:scanAndRead", async () => {
    try {
      const allFiles = await scanAllDrives();
      if (allFiles.length === 0) {
        return { success: false, message: "Флешка не найдена" };
      }
      const newest = getNewestFile(allFiles);
      if (!newest) {
        return { success: false, message: "XML-файлы не найдены" };
      }
      const content = await readXmlFile(newest.fullPath);
      const hash = simpleHash(content);
      // Добавляем в Set, чтобы авто-импорт не сработал повторно
      importedHashes.add(hash);
      return { success: true, content, filePath: newest.fullPath, filename: newest.filename };
    } catch (err) {
      console.error("medison:scanAndRead error:", err);
      return { success: false, message: "Ошибка чтения флешки" };
    }
  });

  ipcMain.handle("medison:readXml", async (_, filePath: string) => {
    try {
      if (!existsSync(filePath)) {
        return { success: false, message: "Файл не найден" };
      }
      const content = await readXmlFile(filePath);
      return { success: true, content };
    } catch (err) {
      console.error("medison:readXml error:", err);
      return { success: false, message: "Ошибка чтения файла" };
    }
  });

  // Запуск мониторинга флешки
  ipcMain.handle("medison:startWatching", async () => {
    if (watchInterval) return;

    watchInterval = setInterval(async () => {
      try {
        const allFiles = await scanAllDrives();

        if (allFiles.length === 0) {
          return;
        }

        const newest = getNewestFile(allFiles);
        if (!newest) {
          return;
        }

        const content = await readXmlFile(newest.fullPath);
        const hash = simpleHash(content);
        
        // Если этот файл уже импортировали — пропускаем
        if (importedHashes.has(hash)) {
          return;
        }
        importedHashes.add(hash);

        onXmlFound({
          filePath: newest.fullPath,
          filename: newest.filename,
          content,
        });
      } catch (err) {
        console.error("USB watch error:", err);
      }
    }, 3000);

    return { success: true };
  });

  // Остановка мониторинга
  ipcMain.handle("medison:stopWatching", async () => {
    if (watchInterval) {
      clearInterval(watchInterval);
      watchInterval = null;
    }
    return { success: true };
  });
}