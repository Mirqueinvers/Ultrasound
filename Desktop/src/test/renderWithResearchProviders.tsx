// src/test/renderWithResearchProviders.tsx
// Обёртка для смоук-тестов форм исследований (этап 2.5).
// Поднимает все контексты, которые требуют формы: RightPanel, DefaultValues, Research.
import { render } from "@testing-library/react";
import type { ReactElement } from "react";
import { RightPanelProvider } from "@/contexts/RightPanelProvider";
import { DefaultValuesProvider } from "@/contexts/DefaultValuesProvider";
import { ResearchProvider } from "@/contexts/ResearchProvider";

const wrapWithProviders = (ui: ReactElement) => (
  <RightPanelProvider>
    <DefaultValuesProvider>
      <ResearchProvider>{ui}</ResearchProvider>
    </DefaultValuesProvider>
  </RightPanelProvider>
);

/**
 * Рендер формы исследования со всеми необходимыми провайдерами.
 * window.*API моки должны быть установлены заранее (installWindowMocks).
 * `rerender` сохраняет провайдеры — позволяет проверять обновление
 * внешнего `value` через повторный рендер.
 */
export const renderWithResearchProviders = (ui: ReactElement) => {
  const utils = render(wrapWithProviders(ui));
  return {
    ...utils,
    rerender: (nextUi: ReactElement) => utils.rerender(wrapWithProviders(nextUi)),
  };
};
