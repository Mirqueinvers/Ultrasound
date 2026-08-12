// src/test/renderWithResearchProviders.tsx
// Обёртка для смоук-тестов форм исследований (этап 2.5).
// Поднимает все контексты, которые требуют формы: RightPanel, DefaultValues, Research.
import { render } from "@testing-library/react";
import type { ReactElement } from "react";
import { RightPanelProvider } from "@/contexts/RightPanelProvider";
import { DefaultValuesProvider } from "@/contexts/DefaultValuesProvider";
import { ResearchProvider } from "@/contexts/ResearchProvider";

/**
 * Рендер формы исследования со всеми необходимыми провайдерами.
 * window.*API моки должны быть установлены заранее (installWindowMocks).
 */
export const renderWithResearchProviders = (ui: ReactElement) =>
  render(
    <RightPanelProvider>
      <DefaultValuesProvider>
        <ResearchProvider>{ui}</ResearchProvider>
      </DefaultValuesProvider>
    </RightPanelProvider>
  );