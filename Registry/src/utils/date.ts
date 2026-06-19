export function formatDate(dateStr: string): string {
  if (/^\d{2}\.\d{2}\.\d{4}$/.test(dateStr)) return dateStr;
  const [y, m, d] = dateStr.split("-");
  return `${d}.${m}.${y}`;
}

export function toApiDate(dateStr: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
  const [d, m, y] = dateStr.split(".");
  return `${y}-${m}-${d}`;
}

export function calculateAge(dateOfBirth: string): string {
  const birth = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return `${age} ${getAgeWord(age)}`;
}

function getAgeWord(age: number): string {
  if (age % 10 === 1 && age % 100 !== 11) return "год";
  if (age % 10 >= 2 && age % 10 <= 4 && (age % 100 < 10 || age % 100 >= 20)) return "года";
  return "лет";
}

export function getDayOfWeek(dateStr: string): number {
  const [d, m, y] = dateStr.split(".");
  const date = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
  return date.getDay() === 0 ? 7 : date.getDay(); // Пн=1, Вс=7
}

export function getDaysInMonth(month: number, year: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function getFirstDayOfMonth(month: number, year: number): number {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1; // Пн=0, Вс=6
}

export function getTodayString(): string {
  const today = new Date();
  const dd = String(today.getDate()).padStart(2, "0");
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const yyyy = today.getFullYear();
  return `${dd}.${mm}.${yyyy}`;
}