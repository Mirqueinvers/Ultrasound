// src/components/print/PrintableProtocol.test.tsx
// Снапшот-тест печати (этап 2.6): PrintableProtocol рендерит протоколы
// ОБП, Почки и Щитовидка. Снапшот ловит любое неожиданное изменение
// HTML при рефакторинге печати (Шаг 4).
import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { screen } from "@testing-library/react";
import PrintableProtocol from "./PrintableProtocol";
import { renderWithPrintProviders } from "@/test/renderWithPrintProviders";
import { SeedPrintContext } from "@/test/SeedPrintContext";
import {
  installWindowMocks,
  resetWindowMocks,
} from "@/test/mocks/electron";
import {
  obpProtocolFixture,
  kidneyProtocolFixture,
  thyroidProtocolFixture,
} from "@/test/fixtures/printProtocols";
import { STUDY_KEYS } from "@/domain/studyKeys";

describe("PrintableProtocol (снапшот печати)", () => {
  beforeEach(() => {
    installWindowMocks();
    localStorage.setItem("userId", "1");
  });

  afterEach(() => {
    resetWindowMocks();
    localStorage.removeItem("userId");
  });

  it("рендерит стабильный HTML-снапшот для ОБП + Почки + Щитовидка", async () => {
    const { container } = renderWithPrintProviders(
      <SeedPrintContext
        seed={(api) => {
          api.setStudyData(STUDY_KEYS.OBP, obpProtocolFixture);
          api.setStudyData(STUDY_KEYS.KIDNEYS, kidneyProtocolFixture);
          api.setStudyData(STUDY_KEYS.THYROID, thyroidProtocolFixture);
          api.setPatientFullName("Иванов Иван Иванович");
          api.setPatientDateOfBirth("1980-01-15");
          api.setResearchDate("2026-01-15");
          api.setOrganization("ГБУЗ №1");
        }}
      >
        <PrintableProtocol />
      </SeedPrintContext>,
    );

    // Явные проверки смыслового содержимого до снапшота,
    // чтобы тест был устойчив даже при пересоздании снапшота.
    // Компоненты печати рендерятся и в скрытом source-контейнере, и в print-root,
    // поэтому элементов может быть несколько. Используем getAllByText.
    await screen.findAllByText(/Эхопризнаков патологии органов брюшной полости не выявлено/);
    expect(screen.getAllByText("ГБУЗ №1").length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Исследование проводил врач Иванов Иван Иванович/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Ультразвуковое исследование почек/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Ультразвуковое исследование щитовидной железы/).length).toBeGreaterThan(0);

    // Снапшот всего контейнера печати
    expect(container).toMatchSnapshot();
  });
});