/**
 * Общий хук управления переопределениями печатных протоколов.
 *
 * Используется в PrintableProtocol и PrintableSavedProtocol для устранения
 * дублирования логики редактирования HTML-блоков печатной версии.
 */
import React from "react";
import { protocolService } from "@services";
import {
  normalizeEditableText,
  normalizeEditableHtml,
  bodyOverrideKey,
  conclusionOverrideKey,
  recommendationOverrideKey,
  type PrintOverrideMap,
} from "@/utils/printHelpers";

export interface PrintStudyDefinition {
  id: string;
  key: string;
}

interface UsePrintableOverridesOptions {
  /** Актуальные (применённые) переопределения */
  sourceOverrides: PrintOverrideMap;
  /** Обновление актуальных переопределений после сохранения */
  setSourceOverrides: (overrides: PrintOverrideMap) => void;
  /** Построение черновика из базовых переопределений */
  buildDraftOverrides: (base: PrintOverrideMap) => PrintOverrideMap;
  /** Список исследований для протокола */
  studyDefinitions: PrintStudyDefinition[];
  /** ID исследования (если есть) — для сохранения в БД */
  researchId?: number | null;
  /** Колбэк после успешного сохранения */
  onSave?: () => void;
  /** Требовать успешный ответ БД (иначе молча продолжаем с локальным сохранением) */
  requireSaveSuccess?: boolean;
  /** Начальное значение режима редактирования (для контролируемого editMode) */
  initialEditMode?: boolean;
}

/**
 * Возвращает состояние редактирования печатного документа:
 * черновик переопределений, режим редактирования и обработчики.
 */
export function usePrintableOverrides(options: UsePrintableOverridesOptions) {
  const {
    sourceOverrides,
    setSourceOverrides,
    buildDraftOverrides,
    studyDefinitions,
    researchId,
    onSave,
    requireSaveSuccess = false,
    initialEditMode = false,
  } = options;

  const [draftOverrides, setDraftOverrides] = React.useState<PrintOverrideMap>({});
  const [isEditMode, setIsEditMode] = React.useState(initialEditMode);
  const printRootRef = React.useRef<HTMLDivElement | null>(null);
  const editContentRef = React.useRef<HTMLDivElement | null>(null);

  // Вход в режим редактирования: строим черновик из применённых переопределений
  const handleStartEditing = React.useCallback(() => {
    setDraftOverrides(buildDraftOverrides(sourceOverrides));
    setIsEditMode(true);
  }, [buildDraftOverrides, sourceOverrides]);

  // При входе в режим редактирования связываем editContentRef с корнем печати
  React.useEffect(() => {
    if (isEditMode && printRootRef.current) {
      editContentRef.current = printRootRef.current;
    }
  }, [isEditMode]);

  // Сохранение: читаем актуальный HTML из contentEditable блока,
  // дополняем черновиком и сохраняем в БД (если передан researchId)
  const handleSaveOverrides = React.useCallback(async () => {
    const nextOverrides: PrintOverrideMap = {};

    const editRoot = editContentRef.current;
    if (editRoot) {
      const blockElements = editRoot.querySelectorAll<HTMLElement>("[data-block-id]");
      blockElements.forEach((el) => {
        const blockId = el.getAttribute("data-block-id");
        if (blockId) {
          nextOverrides[blockId] = normalizeEditableHtml(el.innerHTML);
        }
      });
    }

    // Для блоков, которые не удалось прочитать из DOM, используем draftOverrides
    studyDefinitions.forEach((definition) => {
      const bodyKey = bodyOverrideKey(definition.id);
      if (!nextOverrides[bodyKey]) {
        nextOverrides[bodyKey] = normalizeEditableHtml(draftOverrides[bodyKey]);
      }
      const conKey = conclusionOverrideKey(definition.key);
      if (!nextOverrides[conKey]) {
        nextOverrides[conKey] = normalizeEditableText(draftOverrides[conKey]);
      }
      const recKey = recommendationOverrideKey(definition.key);
      if (!nextOverrides[recKey]) {
        nextOverrides[recKey] = normalizeEditableText(draftOverrides[recKey]);
      }
    });

    if (researchId) {
      try {
        const result = await protocolService.savePrintOverrides({
          researchId,
          overrides: nextOverrides,
        });
        if (requireSaveSuccess && result && !result.success) {
          window.alert(result.message || "Не удалось сохранить правки печатной версии.");
          return;
        }
      } catch {
        if (requireSaveSuccess) {
          window.alert("Не удалось сохранить правки печатной версии.");
          return;
        }
      }
    }

    setSourceOverrides(nextOverrides);
    setIsEditMode(false);
    onSave?.();
  }, [
    draftOverrides,
    editContentRef,
    onSave,
    requireSaveSuccess,
    researchId,
    setSourceOverrides,
    studyDefinitions,
  ]);

  return {
    draftOverrides,
    setDraftOverrides,
    isEditMode,
    setIsEditMode,
    handleStartEditing,
    handleSaveOverrides,
    printRootRef,
    editContentRef,
  };
}