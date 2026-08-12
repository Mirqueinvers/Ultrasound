// src/features/research/Obp.test.tsx
// Смоук-тест формы ОБП (этап 2.5): рендер, изменение поля → onChange, применение дефолтов.
import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/react";

import { Obp } from "./Obp";
import { renderWithResearchProviders } from "@/test/renderWithResearchProviders";
import {
  installWindowMocks,
  resetWindowMocks,
  windowMocks,
} from "@/test/mocks/electron";
import { SECTION_KEYS } from "@/domain/sectionKeys";
import { defaultLiverState, type ObpProtocol } from "@/types";

describe("Obp (смоук-тест формы)", () => {
  beforeEach(() => {
    installWindowMocks();
  });

  afterEach(() => {
    resetWindowMocks();
  });

  it("рендерит заголовок и все секции исследования", () => {
    renderWithResearchProviders(<Obp />);

    expect(
      screen.getByText("Ультразвуковое исследование органов брюшной полости")
    ).toBeInTheDocument();

    // Секции органов (ResearchSectionCard)
    expect(screen.getByText("Печень")).toBeInTheDocument();
    expect(screen.getByText("Желчный пузырь")).toBeInTheDocument();
    expect(screen.getByText("Поджелудочная железа")).toBeInTheDocument();
    expect(screen.getByText("Селезенка")).toBeInTheDocument();

    // Блок свободной жидкости и заключение
    expect(
      screen.getByText("Свободная жидкость в брюшной полости")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Заключение и рекомендации")
    ).toBeInTheDocument();
  });

  it("изменение поля вызывает onChange с обновлённым протоколом", () => {
    const handleChange = vi.fn();
    renderWithResearchProviders(<Obp onChange={handleChange} />);

    const rightLobeInput = screen.getByLabelText("Правая доля, ПЗР (мм)");
    fireEvent.change(rightLobeInput, { target: { value: "150" } });

    expect(handleChange).toHaveBeenCalled();
    const lastCall = handleChange.mock.lastCall?.[0] as ObpProtocol;
    expect(lastCall.liver?.rightLobeAP).toBe("150");
  });

  it("применяет пользовательские дефолты после загрузки", async () => {
    windowMocks.defaultsAPI.load.mockResolvedValue({
      success: true,
      data: {
        [SECTION_KEYS.OBP_LIVER]: {
          ...defaultLiverState,
          rightLobeAP: "150",
        },
      },
    });

    renderWithResearchProviders(<Obp />);

    const rightLobeInput = screen.getByLabelText("Правая доля, ПЗР (мм)");
    await waitFor(() => {
      expect(rightLobeInput).toHaveValue("150");
    });
  });
});