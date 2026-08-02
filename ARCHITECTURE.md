# Целевая архитектура: Ultrasound Desktop

> Документ для передачи новому чату/разработчику как контекст и план миграции.
> Проект: `c:/Projects/Ultrasound`, десктоп в `Desktop/`.
> Состояние проекта уже прошло этапы 1–3 (баги, типизация, дедупликация).

---

## 1. Вводные

**Продукт:** Desktop (Electron + React 19 + Tailwind) — рабочее место врача УЗИ.
Функции: заполнение исследований, печать протоколов, журнал, статистика, реестр записей, импорт с Medison, синхронизация с мобильным приложением.

**Монорепозиторий:**
```
Ultrasound/
├── Desktop/       — Electron + React (главное приложение врача)
├── Mobile/        — React Native / Expo (компаньон)
├── Registry/      — регистратура: запись пациентов, импорт
└── update-server/ — автообновление Desktop
```

**Текущее состояние (после этапов 1–3):**
- TypeScript `tsc --noEmit`: **0 ошибок**
- Критические баги (TDZ, immutability): **устранены**
- `no-explicit-any`: **29** (было 126)
- `no-unused-vars`: **0**
- Дублирование `deepMerge` — в одном модуле (`src/utils/deepMerge.ts`)
- Дублирование печати — общий хук `usePrintableOverrides.ts` + `printHelpers.ts`

**Осталось:**
- 9 ошибок `react-refresh/only-export-components` (контексты)
- 7 ошибок `set-state-in-effect`
- ~24 предупреждения `exhaustive-deps`
- Магические строки-ключи (`"ОБП:печень"`) вместо типизированных констант
- «Божественные» компоненты `Content.tsx` и `AppShell.tsx`
- Прямые вызовы `window.*API` из компонентов (нет слоя-адаптера)
- Компоненты органов 250–860 строк (смешаны UI + логика + вычисления)

---

## 2. Целевая структура слоёв

```
Desktop/src/
├── app/                 // Точка входа, AppShell (только навигация)
├── layout/              // Header, Content, MainLayout, панели
├── components/          // Презентационные UI-компоненты
│   └── <domain>/        // research/organs/print/journal/…
├── features/            // Фичи по доменам (рекомендуется выделить)
│   ├── research/
│   ├── journal/
│   ├── print/
│   ├── registry/
│   ├── settings/
│   └── auth/
├── contexts/            // ContextProviders (5 шт.)
├── hooks/               // Общие хуки (форма, дефолты, печать)
├── services/            // НОВОЕ: слой работы с window.*API
│   ├── electron/        // обёртки preload API
│   ├── sync/            // Medison импорт, mobile sync
│   └── defaults/        // значения по умолчанию
├── domain/              // НОВОЕ: каталог протоколов + типизированные ключи
│   ├── catalog/
│   └── sectionKeys.ts
├── types/               // Типы протоколов + defaultStates
└── utils/               // printHelpers, deepMerge, organEditor, defaultsAccess
```

**Ключевой принцип зависимости:** только вниз:
`UI → features → services → domain`
Никаких прямых вызовов `window.*API` из компонентов, никаких строковых ключей в компонентах.

---

## 3. Ключевые изменения

### 3.1. Типизированные ключи секций (вместо строк)

**Проблема:** строки `"ОБП:печень"`, `"Почки:правая"` раскиданы по коду.

**Решение:** `src/domain/sectionKeys.ts`:
```ts
export const SECTION_KEYS = {
  OBP_LIVER: "ОБП:печень",
  OBP_GALLBLADDER: "ОБП:желчный",
  OBP_PANCREAS: "ОБП:поджелудочная",
  OBP_SPLEEN: "ОБП:селезёнка",
  KIDNEY_RIGHT: "Почки:правая",
  KIDNEY_LEFT: "Почки:левая",
  // ... все секции из protocols/catalog.ts
} as const;
export type SectionKeyValue = (typeof SECTION_KEYS)[keyof typeof SECTION_KEYS];
```

Затем `protocols/catalog.ts` переводится на эти константы, и постепенно компоненты заменяют строки на `SECTION_KEYS.OBP_LIVER`.

### 3.2. Слой services (адаптер electron API)

**Проблема:** `window.protocolAPI.savePrintOverrides(...)` вызывается прямо из компонентов/хуков.

**Решение:** `src/services/electron/*.ts` — тонкие типизированные обёртки:
```ts
// services/electron/research.ts
export const researchService = {
  getById: (id: number) => window.researchAPI.getById(id),
  save: (data: ResearchSaveData) => window.researchAPI.save(data),
};
```
Компоненты импортируют `researchService`, а не трогают `window.*` напрямую.

### 3.3. Декомпозиция «божественных» компонентов

**`Content.tsx`** → выделить:
- `ResearchWorkspace` — выбор исследований + рендер форм
- `ResearchActions` — сохранение/печать/очистка (часть уже в `UI/ResearchActions.tsx`)
- мобильные команды — в `useMobileDraftCommands` (уже существует)

**`AppShell.tsx`** → только переключение секций (enum `activeSection`), каждая секция — отдельный layout-компонент.

### 3.4. Вынос логики органов в хуки

**Паттерн для каждого органа:**
```ts
// hooks/useOrganForm.ts — общий
export function useOrganForm<T>(
  value: T | undefined,
  onChange: ((v: T) => void) | undefined,
  defaults: T
) { /* состояние формы + sync + updateField */ }

// hooks/useTestis.ts — специфика органа (вычисления объёма, дефолты)
```
Компонент органа становится **презентационным**: получает `form` + `updateField` и рендерит поля. Цель — компонент органа < 400 строк.

### 3.5. Декомпозиция контекстов (9 fast-refresh)

Причина ошибок `react-refresh/only-export-components`: файлы контекстов экспортируют и Provider, и хук (`useAuth`, `useResearch` и т.д.).

**Решение:** вынести каждый хук в отдельный файл (например `contexts/useAuth.ts`), а в файле контекста оставить только Provider + export контекста. Тогда Fast Refresh работает.

---

## 4. План миграции

### Этап A — Фундамент (безопасно, не ломает UI)
1. Создать `domain/sectionKeys.ts` — константы ключей секций.
2. Создать `services/electron/*` — обёртки `window.*API`.
3. Перевести `protocols/catalog.ts` на константы.
**Выход:** `tsc` 0 ошибок, поведение не меняется.

### Этап B — Чистка контекстов (убирает 9 fast-refresh)
4. Вынести хуки `useAuth`, `useResearch`, `useRightPanel`, `useDefaultValues` в отдельные файлы.
5. Компоненты подключаются к Provider.

### Этап C — Декомпозиция органов (самый большой)
6. Создать общий `useOrganForm<T>`.
7. Вынести вычисления (объём, автоподстановки) в хуки.
8. Переводить органы по одному: Testis → Thyroid → Uterus → Kidney → остальные.
9. На каждый орган — `tsc` + проверка.

### Этап D — Рефакторинг Content/AppShell
10. Выделить `ResearchWorkspace`, `JournalSection`, `SettingsSection` и т.д.
11. AppShell — только переключение секций.

### Этап E — Типизированные ключи в компонентах
12. Заменить строки `studiesData["ОБП"]`, `defaults["ОБП:печень"]` на константы из `SECTION_KEYS`.
13. Починить оставшиеся `as any` (29) и `set-state-in-effect` (7).

---

## 5. Критерии «сделано»

- `tsc --noEmit` — 0 ошибок.
- `eslint src` — 0 errors (или осознанные локальные отключения).
- Ни один доменный компонент не вызывает `window.*` напрямую — только через `services/`.
- Магические строки-ключи в компонентах отсутствуют — только константы из `SECTION_KEYS`.
- Компонент органа < 400 строк.
- `react-refresh/only-export-components` — 0.

---

## 6. Полезные файлы-якоря (изученные)

| Файл | Роль |
|---|---|
| `Desktop/src/protocols/catalog.ts` | Каталог 16 протоколов, секции, `desktopKey` |
| `Desktop/src/researches/desktopResearchRegistry.ts` | Реестр «studyKey → компонент» |
| `Desktop/src/utils/deepMerge.ts` | Общий deepMerge/mergeNodeArrays |
| `Desktop/src/utils/printHelpers.ts` | Общие утилиты печати |
| `Desktop/src/hooks/usePrintableOverrides.ts` | Общий хук печатных переопределений |
| `Desktop/src/utils/organEditor.tsx` | Типизированный адаптер органов для DefaultValuesTab |
| `Desktop/src/utils/defaultsAccess.ts` | Типизированный доступ к дефолтам |
| `Desktop/src/contexts/` | 5 контекстов (Auth, Research, DefaultValues, RightPanel) |
| `Desktop/src/hooks/` | ~17 общих хуков |
| `Desktop/src/types/defaultStates/` | Дефолтные состояния органов |

---

## 7. Команды для проверки

```bash
cd Desktop
npx tsc --noEmit -p tsconfig.app.json
npx eslint src