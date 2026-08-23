// src/components/print/PrintableSavedProtocol.test.tsx
// Снапшот-тест печати (этап 2.6): PrintableSavedProtocol загружает
// сохранённый протокол через протокол/пациент/исследование сервисы и
// рендерит HTML. Снапшот ловит любое неожиданное изменение разметки
// при рефакторинге печати (Шаг 4).
import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import PrintableSavedProtocol from "./PrintableSavedProtocol";
import {
  renderWithPrintProviders,
} from "@/test/renderWithPrintProviders";
import {
  installWindowMocks,
  resetWindowMocks,
  windowMocks,
  makePatient,
  makeResearch,
} from "@/test/mocks/electron";
import {
  obpProtocolFixture,
  kidneyProtocolFixture,
} from "@/test/fixtures/printProtocols";
import { STUDY_KEYS } from "@/domain/studyKeys";

describe("PrintableSavedProtocol (снапшот печати)", () => {
  beforeEach(() => {
    installWindowMocks();
    localStorage.setItem("userId", "1");

    windowMocks.authAPI.getUser.mockResolvedValue({
      id: "1",
      username: "doctor@example.com",
      name: "Иванов Иван Иванович",
      organization: "ГБУЗ №1",
    });

    windowMocks.protocolAPI.getByResearchId.mockResolvedValue({
      researchId: "1",
      studies: {
        [STUDY_KEYS.OBP]: obpProtocolFixture,
        [STUDY_KEYS.KIDNEYS]: kidneyProtocolFixture,
      },
      printOverrides: {},
    });

    windowMocks.researchAPI.getById.mockResolvedValue(
      makeResearch({
        id: "1",
        patient_id: "1",
        research_date: "2026-01-15T00:00:00",
        doctor_name: "Иванов Иван Иванович",
        organization: "ГБУЗ №1",
      }),
    );

    windowMocks.patientAPI.getById.mockResolvedValue(
      makePatient({
        id: "1",
        last_name: "Иванов",
        first_name: "Иван",
        middle_name: "Иванович",
        date_of_birth: "1980-01-15",
      }),
    );
  });

  afterEach(() => {
    resetWindowMocks();
    localStorage.removeItem("userId");
  });

  it("загружает сохранённый протокол и рендерит стабильный HTML-снапшот", async () => {
    const { container } = renderWithPrintProviders(
      <PrintableSavedProtocol researchId="1" />,
    );

    // Дожидаемся завершения асинхронной загрузки данных и появления печатного HTML.
    await waitFor(() => {
      expect(
        screen.getByText(/Эхопризнаков патологии органов брюшной полости не выявлено/),
      ).toBeInTheDocument();
    });

    expect(screen.getByText("ГБУЗ №1")).toBeInTheDocument();
    expect(screen.getByText(/Исследование проводил врач Иванов Иван Иванович/)).toBeInTheDocument();
    expect(screen.getByText(/Ультразвуковое исследование почек/)).toBeInTheDocument();

    expect(container).toMatchSnapshot();
  });
});