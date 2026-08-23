// src/test/renderWithPrintProviders.tsx
// Обёртка для снапшот-тестов печати (этап 2.6).
// Поднимает все контексты, которые требуют печатные компоненты:
// Auth (useAuth), RightPanel, DefaultValues, Research (useResearch).
import { render } from "@testing-library/react";
import type { ReactElement } from "react";
import { AuthProvider } from "@/contexts/AuthProvider";
import { RightPanelProvider } from "@/contexts/RightPanelProvider";
import { DefaultValuesProvider } from "@/contexts/DefaultValuesProvider";
import { ResearchProvider } from "@/contexts/ResearchProvider";

const wrapWithProviders = (ui: ReactElement) => (
  <AuthProvider>
    <RightPanelProvider>
      <DefaultValuesProvider>
        <ResearchProvider>{ui}</ResearchProvider>
      </DefaultValuesProvider>
    </RightPanelProvider>
  </AuthProvider>
);

/**
 * Рендер печатного компонента со всеми необходимыми провайдерами.
 * window.*API моки должны быть установлены заранее (installWindowMocks).
 * Для стабильного снапшота перед рендером должен быть установлен
 * localStorage.setItem("userId", "1"), чтобы AuthProvider подгрузил
 * пользователя и в печать попал ФИО врача.
 */
export const renderWithPrintProviders = (ui: ReactElement) => {
  const utils = render(wrapWithProviders(ui));
  return {
    ...utils,
    rerender: (nextUi: ReactElement) => utils.rerender(wrapWithProviders(nextUi)),
  };
};