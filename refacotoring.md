# ПЛАН РЕФАКТОРИНГА Ultrasound Desktop

> **ЧИТАЙ МЕНЯ ПЕРЕД НАЧАЛОМ РЕФАКТОРИНГА.**
> Этот файл — единственный источник истины по порядку и объёму работ.
> Агент, выполняющий рефакторинг, обязан следовать шагам строго по порядку
> и не пропускать этапы.

---

## 0. КАК РАБОТАТЬ С ЭТИМ ПЛАНОМ (инструкция агенту)

1. Прочитай этот файл целиком.
2. Ознакомься с ключевыми файлами проекта перед началом (см. раздел «Контекст»).
3. Выполняй шаги **строго по порядку**. Каждый шаг имеет:
   - **Цель** — что должно получиться в итоге.
   - **Действия** — конкретные правки.
   - **Критерий готовности** — как проверить, что шаг завершён.
4. После каждого шага **обязательно**:
   - Запусти `npm run build` (в `Desktop/`) и убедись, что TypeScript компилируется без ошибок.
   - Запусти `npm run lint` и исправь новые ошибки.
5. **НЕЛЬЗЯ** менять бизнес-логику протоколов, названия полей в БД и формат сохранённых данных.
   Рефакторинг — только про структуру кода, типы и переиспользование.
6. **НЕЛЬЗЯ** использовать `any` в новых местах без явного комментария-обоснования.
7. Если после изменения что-то сломалось в рантайме (например, не открывается форма) — остановись и исправь, прежде чем идти дальше.

---

## 1. КОНТЕКСТ ПРОЕКТА

### Структура workspace
```
Ultrasound/
├── Desktop/     ← React 19 + Vite + Electron (основной объект рефакторинга)
├── Mobile/      ← React Native приложение (синхронизация с Desktop)
├── Registry/    ← Electron-приложение регистратуры
├── update-server/
└── refacotoring.md  ← этот файл
```

### Ключевые каталоги Desktop/src
| Путь | Назначение |
|---|---|
| `Desktop/src/services/electron/` | Адаптеры над `window.*API` (IPC-мост) |
| `Desktop/electron/preload.ts` | **Единственный источник** IPC-контрактов |
| `Desktop/src/types/` | Дубли IPC-типов (надо убрать) |
| `Desktop/src/domain/` | Ключи секций и исследований (`sectionKeys`, `studyKeys`) |
| `Desktop/src/researches/` | Реестр рендереров исследований |
| `Desktop/src/features/research/` | Формы исследований (ОБП, почки, щитовидка и т.д.) |
| `Desktop/src/features/organs/` | Компоненты отдельных органов (38 файлов) |
| `Desktop/src/hooks/` | Хуки, включая `useOrganForm` (общий хук форм) |
| `Desktop/src/components/print/` | Печатные представления (43 файла) |
| `Desktop/src/components/hints/`, `directory/` | Подсказки и справочники |
| `Desktop/electron/ipc-handlers.ts` | Монолит IPC-хендлеров (660 строк) |

### Ключевые файлы для чтения перед началом
- `Desktop/electron/preload.ts` — контракты API
- `Desktop/src/types/electron.d.ts` и `Desktop/src/types/window.d.ts` — дубли контрактов
- `Desktop/src/researches/desktopResearchRegistry.ts` — реестр форм
- `Desktop/src/hooks/useOrganForm.ts` — целевой единый паттерн форм
- `Desktop/src/features/research/Obp.tsx` — пример «старого» паттерна формы, который надо перевести
- `Desktop/electron/ipc-handlers.ts` — монолит, который надо разбить
- `Desktop/vite.config.ts` и `Desktop/tsconfig.app.json` — алиасы путей

---

## 2. ОБЩИЕ ПРАВИЛА РЕФАКТОРИНГА

- Все новые файлы — **TypeScript**, строгий режим (`strict: true` уже включён).
- Используй существующие алиасы: `@/`, `@components`, `@services`, `@hooks`, `@utils`, `@types`.
- Компоненты — только **React 19** (function components + hooks, без классов).
- После каждого шага: `cd Desktop && npm run build` и `npm run lint`.
- **НЕ** используй git-команды и **НЕ** коммить изменения (это запрещено правилами workspace).
- Если правка затрагивает Mobile/Registry — сначала согласуй с этим планом (см. Шаг 9).

---

## 3. ШАГИ РЕФАКТОРИНГА

### ШАГ 1. Единый контракт IPC-типов (фундамент)

**Цель:** убрать тройное дублирование типов API и добиться, чтобы `user.id`, `study_data` и т.п. были строго типизированы.

**Проблема:** интерфейсы `AuthAPI`, `PatientAPI`, `ResearchAPI`, `MobileHostAPI`, `DatabaseAPI`, `ProtocolAPI`, `FileAPI`, `NetworkAPI`, `RegistryAPI`, `UpdateAPI`, `ImportMappingAPI`, `MedisonAPI` описаны в трёх местах:
1. `Desktop/electron/preload.ts`
2. `Desktop/src/types/electron.d.ts`
3. `Desktop/src/types/window.d.ts`

**Действия:**
1. Создай `Desktop/electron/contracts.ts` (или `Desktop/shared/ipc-contracts.ts` — на выбор, но единый файл).
   - Перенеси туда **все** интерфейсы API из `preload.ts`.
   - Замени `any` на конкретные типы:
     - `user?: any` → `user?: AuthUser | null`
     - `study_data: any` → `study_data: unknown` (с приведением на границе)
     - `Promise<any>` в `search/getAll/getById` → конкретные типы `Patient[]`, `Research[]` и т.д.
2. Обнови `Desktop/electron/preload.ts`:
   - Удали дублирующие объявления интерфейсов.
   - Импортируй типы из `contracts.ts`.
   - Сами объекты API (`authAPI`, `patientAPI` и т.д.) оставь в `preload.ts` (или вынеси в `preload-apis.ts` — опционально).
3. Обнови `Desktop/src/types/`:
   - Удали `Desktop/src/types/electron.d.ts` (или сделай из него реэкспорт `export * from "../../electron/contracts"`) — **после** переноса всех нужных типов.
   - Удали дубли из `Desktop/src/types/window.d.ts`; оставь только `declare global { interface Window { ... } }`, который ссылается на типы из `contracts.ts`.
   - Приведи `Desktop/src/types/global.d.ts` к тому же виду (реэкспорт + `declare global`).
4. Поправь `AuthProvider.tsx`: теперь `response.user.id` должен быть типизирован (`number`), убери неявные `any`.
5. Проверь, что `vite.config.ts` и `tsconfig*.json` позволяют импортировать из `electron/` в `src/` (если нужно — добавь алиас `@contracts` → `electron/contracts.ts`).

**Критерий готовности:**
- `grep -r "interface AuthAPI" Desktop/src Desktop/electron` находит определение **только** в `contracts.ts`.
- `npm run build` в `Desktop/` проходит без ошибок.
- `npm run lint` без новых ошибок.
- В `AuthProvider.tsx` нет `any` (проверено поиском `: any` / `as any`).

---

### ШАГ 2. Тестовая страховка (до любых крупных перестроек)

**Цель:** покрыть тестами критичные чистые функции, чтобы рефакторинг форм и парсеров не ломал логику незаметно.

**Действия:**
1. Установи тестовый стек в `Desktop/`:
   - `vitest` + `@testing-library/react` + `@testing-library/jest-dom` + `jsdom` (в devDependencies).
   - Добавь скрипт `"test": "vitest run"` и `"test:watch": "vitest"` в `Desktop/package.json`.
   - Создай `Desktop/vitest.config.ts` (на базе `vite.config.ts`, с теми же алиасами).
2. Напиши unit-тесты для (минимум):
   - `src/utils/deepMerge.ts` — слияние вложенных объектов, массивы, `null`.
   - `src/sync/medisonXmlParser.ts` — парсинг XML-строки в структуру измерений.
   - `src/utils/normalizeSelectValue.ts`.
   - Органных калькуляторов: `src/components/print/organs/Kidney/kidneyHelpers.ts` (расчёт объёмов).
   - `src/utils/defaultsAccess.ts`.
3. Напиши тесты на хук-логику (опционально, при наличии времени):
   - `useSaveResearch` (мок `patientService`/`researchService`).
   - `useOrganForm` (мок `useConclusion`).

**Критерий готовности:**
- `npm test` в `Desktop/` выполняется и все тесты зелёные.
- Покрыты файлы из списка выше (минимум 5 файлов).

---

### ШАГ 3. Унификация форм исследований на `useOrganForm`

**Цель:** убрать «adjust state during render» и ручные `useState`+`sync()` из форм, переведя все формы на единый `useOrganForm` + `onChange`.

**Проблема:** в `Obp.tsx` (и ряде других форм) используется паттерн:
```ts
const [form, setForm] = useState(value ?? defaultState);
const [prevIsLoaded, setPrevIsLoaded] = useState(isLoaded);
if (isLoaded && !prevIsLoaded && !value) { /* setForm(...) во время рендера */ }
const [prevValue, setPrevValue] = useState(value);
if (value !== prevValue) { setForm(deepMerge(prev, value)); }
```
В то же время `useOrganForm` уже реализует это корректно.

**Действия:**
1. Изучи `useOrganForm.ts`, его возможности (`form, setForm, updateField, commit, mergeValue`).
2. Пройдись по всем формам в `Desktop/src/features/research/*.tsx` и проверь, какие используют ручной паттерн:
   - `Obp.tsx`, `Kidney.tsx`, `Thyroid.tsx`, `Breast.tsx`, `OmtFemale.tsx`, `OmtMale.tsx`, `Scrotum.tsx`, `SalivaryGlands.tsx`, `BrachioCephalicArteries.tsx`, `LowerExtremityVeins.tsx`, `Pleural.tsx`, `LymphNodes.tsx`, `UrinaryBladderResearch.tsx`, `ChildDispensary.tsx`, `SoftTissue.tsx`.
3. Для каждой формы:
   - Замени ручной `useState`+эффекты на `useOrganForm`.
   - Убери прямые вызовы `useResearch().setStudyData` внутри компонентов органа **внизу дерева** — данные должны идти через `onChange` (вверх) и через реестр (`renderDesktopResearch` передаёт `value`/`onChange`).
   - `sync()` замени на `commit()` из `useOrganForm`.
   - Убедись, что загрузка дефолтов (`useDefaultValues`) происходит в одном месте (провайдер `DefaultValuesProvider`), а формы лишь применяют `defaults` через `mergeLists`/`mergeValue`.
4. `useResearch().setStudyData` оставь **только** на верхнем уровне (в `ResearchWorkspace` / реестре-рендерере), если это необходимо для черновика.

**Критерий готовности:**
- В `Desktop/src/features/research/` не осталось паттерна `if (value !== prevValue)` и `setForm(...)` во время рендера.
- Все формы принимают `value`/`onChange` и работают через реестр.
- `npm run build` и `npm run lint` чисто.
- Вручную проверено в dev-режиме: открыть исследование «ОБП», заполнить поля, сохранить — данные сохраняются и отображаются при повторном открытии.

---

### ШАГ 4. Декомпозиция файлов-монстров

**Цель:** разбить самые большие файлы на читаемые модули. Список целей (по приоритету):

| Файл | Размер | Как разбивать |
|---|---|---|
| `src/features/organs/BrachioCephalicArteries/Artery.tsx` | 30 КБ | Разделить на под-компоненты: `ArteryCommon.tsx`, `ArterySide.tsx`, `ArterySegments.tsx`, `ArteryConclusion.tsx` (+ мелкие элементы) |
| `src/components/print/PrintableProtocol.tsx` | 24 КБ | Вынести блоки печати в `print/sections/` (по типу блока: header, органы, заключение, подпись) |
| `src/components/print/PrintableSavedProtocol.tsx` | 23 КБ | То же + переиспользовать общие блоки с `PrintableProtocol` |
| `src/components/statistics/Statistics.tsx` | 23 КБ | Разбить на `StatisticsPage`, `StatisticsChart`, `StatisticsTable`, `StatisticsFilters` |
| `src/components/journal/ExportModal.tsx` | 23 КБ | Вынести рендер-фрагменты в `journal/export/` |
| `src/components/registry/RegistryPanel.tsx` | 21 КБ | Разбить на `RegistryPanel`, `RegistryAppointmentList`, `RegistryImportSection`, `RegistryPatientCard` |
| `src/sync/medisonXmlParser.ts` | 21 КБ | Вынести типы измерений и хелперы в `sync/medisonXml/` (папка) |
| `src/protocols/catalog.ts` | 20 КБ | Если это словарь констант — разбить по органам в `protocols/catalog/` + index |
| `src/hooks/useMedisonImport.ts` | 17 КБ | Разбить на несколько хуков: `useMedisonWatch`, `useMedisonMapping`, `useMedisonImportState` |
| `electron/ipc-handlers.ts` | 660 строк | См. Шаг 5 |

**Правила:**
- Не меняй поведение — только переноси код в новые файлы.
- Каждый новый файл — одна ответственность.
- Импорты обновляй через существующие алиасы.

**Критерий готовности:**
- Нет файлов в `src/` и `electron/` больше ~600 строк (~20 КБ), кроме `contracts.ts` и каталогов данных.
- `npm run build` и `npm run lint` чисто.

---

### ШАГ 5. Разбивка монолита `electron/ipc-handlers.ts`

**Цель:** привести `electron/ipc-handlers.ts` к той же структуре, что уже есть в `electron/ipc/`.

**Действия:**
1. В `electron/ipc/` уже лежат: `medisonIpc.ts`, `medisonMappingIpc.ts`, `mobileHostHandlers.ts`, `protocolHandlers.ts`.
2. Создай по аналогии:
   - `electron/ipc/authIpc.ts` — auth:* хендлеры.
   - `electron/ipc/patientIpc.ts` — patient:*.
   - `electron/ipc/researchIpc.ts` — research:*, journal:*, database:getStatistics.
   - `electron/ipc/fileIpc.ts` — file:saveHtml.
   - `electron/ipc/windowIpc.ts` — window:*.
   - `electron/ipc/defaultsIpc.ts` — defaults:*.
   - `electron/ipc/registryIpc.ts` — registry:*.
   - `electron/ipc/networkIpc.ts` — network:sendExport.
3. Каждая функция `setupXxxHandlers()` принимает нужные зависимости (например, `DatabaseManager`).
4. `ipc-handlers.ts` либо удали, либо оставь как реэкспорт-агрегатор, вызывающий все `setup*`.
5. В `main.ts` замени вызовы на новые setUp-функции.
6. Дополнительно: вынеси логику update-серверов из `main.ts` (строки ~88–228) в `electron/update-servers.ts` с функциями `registerUpdateServerHandlers()` и `normalizeServers()`.

**Критерий готовности:**
- `ipc-handlers.ts` не содержит объявлений `ipcMain.handle` (или файл удалён).
- `main.ts` не содержит прямых `ipcMain.handle`.
- `npm run build` и `npm run lint` чисто; приложение запускается (`npm run electron:dev`) и работает авторизация, сохранение исследования, печать.

---

### ШАГ 6. Единый реестр подсказок и справочников

**Цель:** убрать цепочки `if (panelData.organ === "obp") …` из `RightSidePanel.tsx` (сейчас 8 ручных условий).

**Действия:**
1. Создай `src/domain/hintsRegistry.ts` (или `src/researches/hintsRegistry.ts`) с маппингом:
   ```ts
   interface HintsRegistryItem {
     organ: string;
     component: ComponentType<{ onAddText: (text: string) => void }>;
   }
   export const hintsRegistry: HintsRegistryItem[] = [ ... ];
   export const findHintsComponent = (organ: string) => hintsRegistry.find(i => i.organ === organ)?.component;
   ```
2. Занеси в реестр все подсказки из `components/hints/`: `ObpHints`, `KidneysHints`, `BreastHints`, `ThyroidHints`, `ScrotumHints`, `UrinaryBladderHints`, `OmtFemaleHints`, `OmtMaleHints`.
3. Упрости `RightSidePanel.tsx`: вместо цепочки условий — `const HintsComponent = findHintsComponent(panelData.organ); if (HintsComponent) return <HintsComponent onAddText={addText} />;`.
4. Аналогично проверь справочники `components/directory/` (Birads/Tirads/Orads/Obp*) — если там есть ручные переключения по типу, сведи их в реестр `directoryRegistry.ts`.

**Критерий готовности:**
- В `RightSidePanel.tsx` нет цепочки `panelData.organ === ...`.
- `npm run build` и `npm run lint` чисто.

---

### ШАГ 7. Чистка мёртвого кода и дублей структуры

**Цель:** убрать пустые/паразитные сущности, упростить навигацию.

**Действия:**
1. **Удалить** пустую директорию `Desktop/src/constructor/` (0 файлов).
2. **Переименовать** `Desktop/src/types/studyes/` → `Desktop/src/types/studies/` (опечатка). Обновить импорты в `types/index.ts` и всех, кто импортирует из `@types/studyes/*` (поиск: `studyes`).
3. **Разобраться с дублем секций:** `src/features/{directory,journal,profile,registry,search,settings,statistics}/Section.tsx` оборачивают `src/components/{...}`. Решение: либо удалить обёртки и рендерить `components/*` напрямую из `Content.tsx`, либо оставить обёртки, но перенести в них логику из компонентов. Выбери один вариант и приведи все секции к нему.
4. **Удалить** `Desktop/src/components/print/PrintTestSection.tsx` (10 КБ тестового кода), если он не используется (проверь импорты; если используется — вынеси в `print/dev/`).
5. Проверь неиспользуемые файлы: `src/App.css`, `src/index.css`, `public/` (актуальны ли ассеты — `orads2-2.jpg`, `Orads2.jpg`, `orads3.jpg`, `orads4.jpg`, `orads5.jpg`, `ovaryvasc.jpg`, `us-icon.png`, `react.svg`). Удали неиспользуемые ассеты.
6. Почисти `src/hooks` от неиспользуемых хуков (если найдёшь — убедись поиском по импортам перед удалением).

**Критерий готовности:**
- `find Desktop/src -type d -empty` не показывает `constructor/`.
- Нет упоминаний `studyes` в исходниках.
- `npm run build` и `npm run lint` чисто.
- Приложение открывается, все секции навигации работают.

---

### ШАГ 8. Усиление типизации на границах реестра

**Цель:** снизить использование `any` в `desktopResearchRenderers.tsx` и `desktopResearchRegistry.ts`.

**Действия:**
1. В `desktopResearchRegistry.ts` добавь поле `studyKey` из `STUDY_KEYS` как union-тип ключей исследований.
2. Сделай discriminated-union для `value/onChange`:
   ```ts
   type StudyComponentMap = {
     [K in StudyKey]: ComponentType<{ value: StudyDataByKey[K]; onChange: (v: StudyDataByKey[K]) => void }>;
   };
   ```
   (Тип `StudyDataByKey` — маппинг `studyKey → тип протокола` из `@/types`; возможно, потребуется создать его явно.)
3. Если полный discriminated-union слишком трудоёмок — минимум: убери `any` на границе через `unknown` + приведение в конкретный компонент, с комментарием-обоснованием.

**Критерий готовности:**
- `grep -rn "ComponentType<any>" Desktop/src` — меньше вхождений или 0 (допускается 1–2 с комментарием).
- `npm run build` и `npm run lint` чисто.

---

### ШАГ 9. Вынос общего домена Desktop/Mobile (долгосрочный, опциональный)

**Цель:** единый источник истины для дефолтных состояний и типов медицинских протоколов, используемых и Desktop, и Mobile.

> ⚠️ Этот шаг — самый рискованный и объёмный. Делать его **только после** всех предыдущих и **отдельным согласованием** с пользователем.

**Действия (предварительный план):**
1. Создай в корне workspace пакет `shared/` (или `packages/domain`):
   - `package.json` с именем `@ultrasound/domain`.
   - `src/defaultStates/` — перенести из `Desktop/src/types/defaultStates/`.
   - `src/organs/` — типы органов.
   - `src/studies/` — типы исследований.
2. Подключи его в `Desktop/package.json` и `Mobile/package.json` (workspace или file-зависимость).
3. Перенеси из `Mobile/src/shared/*Draft.ts` логику дефолтов/расчётов в общий пакет.
4. Обнови импорты в Desktop и Mobile.
5. Сделай сквозную проверку синхронизации черновика с телефона на десктоп.

**Критерий готовности:** `@ultrasound/domain` существует, Desktop и Mobile импортируют из него, синхронизация работает, оба проекта собираются.

---

## 4. ПОРЯДОК И ПРИОРИТЕТЫ (таблица)

| Шаг | Название | Приоритет | Риск |
|---|---|---|---|
| 1 | Единый контракт IPC-типов | Критический | Низкий |
| 2 | Тестовая страховка | Критический | Низкий |
| 3 | Унификация форм на `useOrganForm` | Высокий | Средний |
| 4 | Декомпозиция файлов-монстров | Высокий | Средний |
| 5 | Разбивка `ipc-handlers.ts` | Высокий | Средний |
| 6 | Реестр подсказок/справочников | Средний | Низкий |
| 7 | Чистка мёртвого кода и дублей | Средний | Низкий |
| 8 | Усиление типизации реестра | Средний | Низкий |
| 9 | Общий домен Desktop/Mobile | Низкий (опционально) | Высокий |

---

## 5. ЧЕК-ЛИСТ ФИНАЛЬНОЙ ПРОВЕРКИ

Перед объявлением рефакторинга завершённым проверь:

- [ ] `Desktop/electron/preload.ts` и `Desktop/src/types/` не содержат дублей интерфейсов.
- [ ] `npm run build` в `Desktop/` — без ошибок.
- [ ] `npm run lint` в `Desktop/` — без ошибок (допустимы 0 новых).
- [ ] `npm test` в `Desktop/` — зелёный.
- [ ] Нет файлов `> 600 строк` в `Desktop/src` и `Desktop/electron` (кроме контрактов/данных).
- [ ] В `Desktop/src/features/research/` нет «adjust state during render».
- [ ] `RightSidePanel.tsx` без цепочки `panelData.organ === ...`.
- [ ] Удалены: `src/constructor/`, `PrintTestSection.tsx` (если не используется), опечатка `studyes`.
- [ ] `ipc-handlers.ts` разбит; `main.ts` чистый.
- [ ] Приложение `npm run electron:dev` запускается: авторизация → создание исследования → заполнение формы → сохранение → печать — работают.
- [ ] Мобильная синхронизация не сломана (если тестировалась).

---

## 6. ЗАПРЕТЫ

- ❌ Запрещено менять названия полей в SQLite-схеме (`electron/database/schema.ts`) и формат `study_data` — иначе сломаются сохранённые протоколы.
- ❌ Запрещено менять публичные сигнатуры `window.*API` (имена методов и каналов IPC), не обновив одновременно `preload.ts`, `ipc-хендлеры` и `src/services/*`.
- ❌ Запрещено использовать git-команды.
- ❌ Запрещено добавлять новые зависимости без необходимости и без обновления `package-lock.json`.

---

## 7. ОФОРМЛЕНИЕ РЕЗУЛЬТАТА

После завершения рефакторинга (или каждого крупного шага) отчитайся в формате:

1. Что сделано (по шагам).
2. Какие файлы созданы/изменены/удалены.
3. Результаты `npm run build`, `npm run lint`, `npm test`.
4. Что осталось (если что-то перенесено на потом).

**Агент: начинай с ШАГА 1. Не пропускай шаги.**