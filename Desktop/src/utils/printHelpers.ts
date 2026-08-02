/**
 * Общие утилиты для печатных протоколов.
 * Используются в PrintableProtocol и PrintableSavedProtocol.
 */

/** Карта переопределений печатных блоков: ключ блока -> HTML/текст */
export type PrintOverrideMap = Record<string, string>;

/** Нормализует редактируемый текст перед сохранением */
export const normalizeEditableText = (value?: string) =>
  (value ?? "")
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

/** Нормализует редактируемый HTML перед сохранением */
export const normalizeEditableHtml = (value?: string) =>
  (value ?? "").replace(/\r\n/g, "\n").trim();

/** Проверяет, содержит ли HTML видимый контент (не только теги) */
export const hasVisibleHtmlContent = (value?: string) => {
  const html = (value ?? "").trim();
  if (!html) {
    return false;
  }

  if (typeof document === "undefined") {
    return html.replace(/<[^>]+>/g, "").trim().length > 0;
  }

  const template = document.createElement("template");
  template.innerHTML = html;
  return (template.content.textContent ?? "").trim().length > 0;
};

/** Ключ переопределения для тела блока исследования */
export const bodyOverrideKey = (id: string) => `block:${id}`;

/** Ключ переопределения для заключения */
export const conclusionOverrideKey = (key: string) => `conclusion:${key}`;

/** Ключ переопределения для рекомендаций */
export const recommendationOverrideKey = (key: string) => `recommendation:${key}`;