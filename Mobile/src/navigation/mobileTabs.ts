import type { TabKey } from "../components/TabBar";

/** Все 4 таба — используется в TabBar (на десктопе или других местах) */
export const MOBILE_TABS: Array<{ key: TabKey; label: string }> = [
  { key: "connect", label: "Подключение" },
  { key: "library", label: "Протоколы" },
  { key: "draft", label: "Черновик" },
  { key: "summary", label: "Итог" },
];

/** Только 3 таба для BottomNav */
export const BOTTOM_NAV_TABS: Array<{ key: TabKey; label: string }> = [
  { key: "library", label: "Протоколы" },
  { key: "draft", label: "Черновик" },
  { key: "summary", label: "Итог" },
];