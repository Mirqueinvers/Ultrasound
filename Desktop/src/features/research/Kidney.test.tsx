// src/features/research/Kidney.test.tsx
// Смоук-тест формы «Почки» (этап 2.5): рендер, изменение поля → onChange, применение дефолтов.
import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/react";

import { Kidney } from "./Kidney";
import { renderWithResearchProviders } from "@/test/renderWithResearchProviders";
import {
  installWindowMocks,
  resetWindowMocks,
  windowMocks,
} from "@/test/mocks/electron";
import { SECTION_KEYS } from "@/domain/sectionKeys";
import {
  defaultKidneyState,
  defaultKidneyStudyState,
  type KidneyStudyProtocol,
} from "@/types";

describe("Kidney (смоук-тест формы)", () => {
  beforeEach(() => {
    installWindowMocks();
  });

  afterEach(() => {
    resetWindowMocks();
  });

  it("рендерит заголовок и все секции исследования", () => {
    renderWithResearchProviders(<Kidney />);

    expect(
      screen.getByText("Ультразвуковое исследование почек")
    ).toBeInTheDocument();

    // Секции органов (ResearchSectionCard)
    expect(screen.getByText("Правая почка")).toBeInTheDocument();
    expect(screen.getByText("Левая почка")).toBeInTheDocument();
    expect(screen.getByText("Мочевой пузырь")).toBeInTheDocument();

    // Заключение
    expect(
      screen.getByText("Заключение и рекомендации")
    ).toBeInTheDocument();
  });

  it("изменение поля правой почки вызывает onChange с обновлённым протоколом", () => {
    const handleChange = vi.fn();
    renderWithResearchProviders(<Kidney onChange={handleChange} />);

    // Правая почка рендерится первой — берём первый инпут «Длина (мм)».
    const rightKidneyLength = screen.getAllByLabelText("Длина (мм)")[0];
    fireEvent.change(rightKidneyLength, { target: { value: "110" } });

    expect(handleChange).toHaveBeenCalled();
    const lastCall = handleChange.mock.lastCall?.[0] as KidneyStudyProtocol;
    expect(lastCall.rightKidney?.length).toBe("110");
  });

  it("обновляется при изменении внешнего value (rerender)", () => {
    const { rerender } = renderWithResearchProviders(
      <Kidney
        value={{
          ...defaultKidneyStudyState,
          rightKidney: { ...defaultKidneyState, length: "110" },
        }}
      />
    );

    const rightKidneyLength = screen.getAllByLabelText("Длина (мм)")[0];
    expect(rightKidneyLength).toHaveValue("110");

    rerender(
      <Kidney
        value={{
          ...defaultKidneyStudyState,
          rightKidney: { ...defaultKidneyState, length: "118" },
        }}
      />
    );

    expect(screen.getAllByLabelText("Длина (мм)")[0]).toHaveValue("118");
  });

  it("применяет пользовательские дефолты после загрузки", async () => {
    windowMocks.defaultsAPI.load.mockResolvedValue({
      success: true,
      data: {
        [SECTION_KEYS.KIDNEY_RIGHT]: {
          ...defaultKidneyState,
          length: "115",
        },
      },
    });

    renderWithResearchProviders(<Kidney />);

    const rightKidneyLength = screen.getAllByLabelText("Длина (мм)")[0];
    await waitFor(() => {
      expect(rightKidneyLength).toHaveValue("115");
    });
  });
});