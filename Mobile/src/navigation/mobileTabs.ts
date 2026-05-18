import type { TabKey } from "../components/TabBar";

export const MOBILE_TABS: Array<{ key: TabKey; label: string }> = [
  { key: "connect", label: "Подключение" },
  { key: "library", label: "Протоколы" },
  { key: "draft", label: "Черновик" },
  { key: "summary", label: "Итог" },
];
