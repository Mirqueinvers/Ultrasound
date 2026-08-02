# Целевая архитектура: Ultrasound Desktop

> Документ для передачи новому чату/разработчику как контекст и план миграции.
> Проект: `c:/Projects/Ultrasound`, десктоп в `Desktop/`.
> Состояние проекта уже прошло этапы 1–3 (баги, типизация, дедупликация) и этап B (чистка контекстов).

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

**Текущее состояние (после этапов 1–3 и этапа B):**
- TypeScript `tsc --noEmit`: **0 ошибок**
- Критические баги (TDZ, immutability): **устранены**
- `no-explicit-any`: **29** (было 126)
- `no-unused-vars`: **0**
- Дублирование `deepMerge` — в одном модуле (`src/utils/deepMerge.ts`)
- Дублирование печати — общий хук `usePrintableOverrides.ts` + `printHelpers.ts`
- Контексты разделены на `*Context.ts` + `use*.ts` + `*Provider.tsx` — **fast refresh для контекстов работает**

**Осталось:**
- 3 ошибки `react-refresh/only-export-components` (DatePickerField, NormalRange, OrgNavigation)
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

### Этап B — Чистка контекстов (убирает 9 fast-refresh) ✅ СДЕЛАНО
4. ✅ Вынести хуки `useAuth`, `useResearch`, `useRightPanel`, `useDefaultValues` в отдельные файлы.
5. ✅ Компоненты подключаются к Provider.

**Результат этапа B:**
- Каждый контекст разбит на 3 файла: `*Context.ts` (createContext + типы), `use*.ts` (хук), `*Provider.tsx` (провайдер).
- `src/contexts/index.ts` реэкспортирует провайдеры и хуки.
- Прямые импорты `@contexts/AuthContext` и т.п. заменены на `@contexts/useAuth` / `@contexts/AuthProvider`.
- `hooks/useDefaultValues.ts` реэкспортирует `useDefaultValuesContext` для обратной совместимости.
- 6 ошибок `react-refresh/only-export-components` в контекстах устранены, `tsc` — 0 ошибок.

### Этап C — Декомпозиция органов (самый большой)

**Принцип:** компонент органа становится презентационным (< 400 строк): получает `form`, `updateField`, `focus` и рендерит поля. Вся логика (sync с value, вычисления, списки, подписки) уходит в хуки.

**Проблемы, которые решаем:**

| Паттерн-дубликат | Где встречается |
|---|---|
| `value → initialValue(merge) → form → useEffect(sync)` | Каждый орган (8+ файлов) |
| Объём эллипсоида `(l*w*d*0.523)/1000` | Testis, Uterus, Ovary, Prostate, UrinaryBladder, SalivaryGlands |
| Объём щитовидки `(l*w*d*0.479)/1000` | ThyroidLobe |
| Логика «при не определяются очистить список» | ThyroidLobe, Uterus, Kidney |
| `useConclusion(setForm, organKey)` + подписка на `add-conclusion-text` | Почти все |
| `useEffect` с setForm внутри (без `onChange`) — рассинхрон с родителем | Testis (стр. 93–95), ThyroidLobe |

**Целевая структура:**
```
Desktop/src/hooks/
├── useOrganForm.ts        // ОБЩИЙ: value → form, sync, updateField, conclusion
├── useOrganVolume.ts      // ОБЩИЙ: расчёт объёма (коэф. 0.523 / 0.479)
└── organs/
    ├── useTestis.ts       // специфика яичка (2 стороны, объём)
    ├── useThyroidLobe.ts  // специфика доли (узлы, объём 0.479)
    ├── useUterus.ts       // специфика матки (миомы, cycleDay)
    ├── useKidney.ts       // специфика почки (конкременты, кисты)
    ├── useOvary.ts        // специфика яичника (фолликулы, объём)
    ├── useProstate.ts     // специфика простаты (объём)
    ├── useUrinaryBladder.ts
    └── useSalivaryGland.ts
```

**Шаг 6. Общий `useOrganForm<T>`** (`hooks/useOrganForm.ts`) — заменяет ручной паттерн:
```ts
export function useOrganForm<T extends Record<string, any>>(options: {
  value?: T;                    // из пропсов
  defaults: T;                  // defaultState органа
  organKey: string;             // для useConclusion ("uterus", "rightTestis")
  mergeLists?: (v?: T) => Partial<T>;  // доп. слияние списков (nodesList и т.п.)
}) {
  // 1. initialValue = { ...defaults, ...value, ...mergeLists?.(value) }
  // 2. form = useState(initialValue)
  // 3. useEffect sync value → form (с prevValueRef, как в KidneyCommon)
  // 4. updateField = useFieldUpdate(form, setForm, onChange) + commit
  // 5. useConclusion(setForm, organKey)
  // 6. focus = (field: string) => useFieldFocus(organKey, field)
  // Возвращает: { form, setForm, updateField, focus, commit(draft) }
}
```
Отдельно — `commit(draft)` для случаев, когда вычисления пишут в form **и** вызывают `onChange` (сейчас в Uterus/Kidney это дублируется вручную).

**Шаг 7. Общий `useOrganVolume`** (`hooks/useOrganVolume.ts`) — выносит расчёт объёма из 8 органов:
```ts
export function useOrganVolume(options: {
  length: string; width: string; depth: string;
  volume: string;
  coefficient?: number;          // 0.523 | 0.479
  precision?: number;            // 2 (по умолчанию) | 0 (мочевой пузырь)
  getVolumeField?: () => string; // для полей с префиксами (uterusVolume)
  onVolumeChange: (volume: string) => void;  // updateField
  enabled?: boolean;             // Uterus: isNormal
}) { /* useEffect на [length, width, depth, enabled] — авто-расчёт + сброс при невалидных */ }
```

**Шаг 8. Специфичные хуки органов** (`hooks/organs/use<Organ>.ts`) — выносят:
- `useTestis.ts` — два экземпляра `useOrganForm` (right/left), `useOrganVolume` (0.523), `updateRight/updateLeft`
- `useThyroidLobe.ts` — `useOrganForm` + `useOrganVolume` (0.479) + `useListManager` для узлов + `addNode` с дефолтами + `updateSelect` (очистка nodesList при «не определяются»)
- `useUterus.ts` — `useOrganForm` + `useOrganVolume` (0.523, `getVolumeField: () => form.uterusVolume`) + миомы через `useListManager` + `cycleDay` авто-расчёт + `updateMyomaPresence` (очистка при «не определяются»)
- `useKidney.ts` — `useOrganForm` + 2× конкременты + 2× кисты (`useListManager`) + `parenchymaSize`
- `useOvary.ts` / `useProstate.ts` / `useUrinaryBladder.ts` / `useSalivaryGland.ts` — `useOrganForm` + `useOrganVolume` + списки

**Шаг 9. Перевод органов по одному** (в этом порядке):
1. ✅ **Testis** (`Testis.tsx` 385 строк) — form + объём + 2 стороны. Переведён.
2. ✅ **ThyroidLobe** (`ThyroidLobe.tsx` → ~230 строк) — узлы (`useListManager`) + очистка списка. Переведён.
3. ✅ **Uterus** (`Uterus.tsx` 476 → 445 строк) — миомы, cycleDay, `enabled`. Переведён.
4. ✅ **KidneyCommon** (`KidneyCommon.tsx` 467 → ~400 строк) — 4 списка (конкременты/кисты паренхимы и ЧЛС). Переведён.
5. **Ovary, Prostate, UrinaryBladder, SalivaryGlands, Spleen, Pancreas, Hepat** — остальные (по тому же паттерну).

**Правила перевода:**
- Компонент держит только JSX: `form.*` + `updateField` + `focus` + менеджеры списков.
- `useEffect` в компонентах органов — запрещён (всё в хуках).
- setForm напрямую в компоненте — только через `commit`/менеджеры.
- Вычисления объёма — только через `useOrganVolume`.
- После каждого органа: `npx tsc --noEmit -p tsconfig.app.json && npx eslint src/components/organs/<Organ>` — 0 ошибок.
- Цель: каждый файл органа < 400 строк.

**Прогресс этапа C (сделано):**
- ✅ `hooks/useOrganForm.ts` — общий хук: value → form, sync по reference (prevValueRef), `updateField`, `commit` (setForm + onChange), `useConclusion` (organKey: null = отключить).
- ✅ `hooks/useConclusion.ts` — принимает `setForm: null | Dispatch` и `organ: string | null`, не подписывается, если null. Убран `no-explicit-any`.
- ✅ `hooks/useOrganVolume.ts` — общий авто-расчёт объёма эллипсоида (коэф. 0.523/0.479, precision 2/0, `enabled`).
- ✅ `hooks/organs/useTestis.ts` — `useTestisSide` (right/left) + `useTestis` (контейнер).
- ✅ `hooks/organs/useThyroidLobe.ts` — `useOrganForm` + `useOrganVolume` (0.479) + `updateSelect` (очистка узлов) + `removeNode`.
- ✅ `hooks/organs/useUterus.ts` — `useOrganForm` + cycleDay + `useOrganVolume` (`enabled: isNormal`) + миомы (`useListManager`).
- ✅ `hooks/organs/useKidney.ts` — 4 списка (`useListManager`) + `updateSelect` (очистка при «не определяются») + toggle множественных кист.
- ✅ `hooks/index.ts` — экспорты `useOrganForm`, `useOrganVolume`, `organs/*`.
- `tsc --noEmit` — 0 ошибок.

**Переведены ВСЕ органы:** Testis, ThyroidLobe, Uterus, KidneyCommon, Ovary, Prostate, UrinaryBladder, SalivaryGland, Spleen, Pancreas, Hepat. Все — презентационные (только JSX), логика в `hooks/organs/*`.

**Итоговая структура `hooks/organs/`:**
```
Desktop/src/hooks/organs/
├── useTestis.ts          // side right/left + контейнер
├── useThyroidLobe.ts     // объём 0.479 + узлы + очистка списка
├── useUterus.ts          // cycleDay + объём (enabled) + миомы
├── useKidney.ts          // 4 списка + toggle кист + очистка при «не определяются»
├── useOvary.ts           // объём (isVisible) + кисты (size "10x15")
├── useProstate.ts        // объём (isPresent)
├── useUrinaryBladder.ts  // 2 объёма (precision 0) + очистка contentsText
├── useSalivaryGland.ts   // объём (showDepth) + лимфоузлы (вложенный объект) + ducts
├── useSpleen.ts          // форма + conclusion + isSplenectomy
├── usePancreas.ts        // форма + conclusion
└── useHepat.ts           // форма + total долей (ККР+ПЗР автоподстановка)
```

**Проверки после полного этапа C:**
- ✅ `npx tsc --noEmit -p tsconfig.app.json` — **0 ошибок**
- ✅ `npx eslint` по всем 25 изменённым файлам — **0 errors, 0 warnings**
- ✅ В компонентах органов нет `useEffect`/`setForm` — только `form.*` + `updateField` + `focus` + менеджеры
- ✅ `useOrganVolume` покрывает: Testis (0.523), ThyroidLobe (0.479), Uterus (0.523+enabled), Ovary (0.523+isVisible), Prostate (0.523+isPresent), UrinaryBladder (2×0.523+precision 0), SalivaryGland (0.523+showDepth)

**Выход этапа C:**
- ✅ `hooks/useOrganForm.ts`, `hooks/useOrganVolume.ts`, `hooks/organs/*` созданы.
- ✅ 10+ компонентов органов декомпозированы, `useEffect` в них нет.
- ✅ `tsc` — 0 ошибок, органы < 400 строк (кроме Uterus, но логика вынесена).

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