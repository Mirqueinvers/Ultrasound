// src/features/research/Thyroid.test.tsx
// Смоук-тест формы «Щитовидная железа» (этап 2.5): рендер, изменение поля → onChange, применение дефолтов.
import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/react";

import { Thyroid } from "./Thyroid";
import { renderWithResearchProviders } from "@/test/renderWithResearchProviders";
import {
  installWindowMocks,
  resetWindowMocks,
  windowMocks,
} from "@/test/mocks/electron";
import { SECTION_KEYS } from "@/domain/sectionKeys";
import {
  defaultThyroidLobeState,
  type ThyroidStudyProtocol,
} from "@/types";

describe("Thyroid (смоук-тест формы)", () => {
  beforeEach(() => {
    installWindowMocks();
  });

  afterEach(() => {
    resetWindowMocks();
  });

  it("рендерит заголовок и все секции исследования", () => {
    renderWithResearchProviders(<Thyroid />);

    expect(
      screen.getByText("Ультразвуковое исследование щитовидной железы")
    ).toBeInTheDocument();

    // Секции органов (ResearchSectionCard)
    expect(screen.getByText("Правая доля")).toBeInTheDocument();
    expect(screen.getByText("Левая доля")).toBeInTheDocument();
    expect(screen.getByText("Перешеек")).toBeInTheDocument();
    expect(screen.getByText("Общие показатели")).toBeInTheDocument();

    // Заключение
    expect(
      screen.getByText("Заключение и рекомендации")
    ).toBeInTheDocument();
  });

  it("изменение поля правой доли вызывает onChange с обновлённым протоколом", () => {
    const handleChange = vi.fn();
    renderWithResearchProviders(<Thyroid onChange={handleChange} />);

    // Правая доля рендерится первой — берём первый инпут «Длина (мм)».
    const rightLobeLength = screen.getAllByLabelText("Длина (мм)")[0];
    fireEvent.change(rightLobeLength, { target: { value: "50" } });

    expect(handleChange).toHaveBeenCalled();
    const lastCall = handleChange.mock.lastCall?.[0] as ThyroidStudyProtocol;
    expect(lastCall.thyroid?.rightLobe.length).toBe("50");
  });

  it("применяет пользовательские дефолты после загрузки", async () => {
    windowMocks.defaultsAPI.load.mockResolvedValue({
      success: true,
      data: {
        [SECTION_KEYS.THYROID_RIGHT_LOBE]: {
          ...defaultThyroidLobeState,
          length: "55",
        },
      },
    });

    renderWithResearchProviders(<Thyroid />);

    const rightLobeLength = screen.getAllByLabelText("Длина (мм)")[0];
    await waitFor(() => {
      expect(rightLobeLength).toHaveValue("55");
    });
  });
});