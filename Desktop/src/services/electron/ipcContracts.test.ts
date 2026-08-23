// src/services/electron/ipcContracts.test.ts
// Этап 2.7 — Консистентность IPC-контрактов.
// Type-level тесты с expectTypeOf: защищают от расхождения типов между:
//   - electron/contracts.ts (единый источник)
//   - electron/preload.ts (реэкспорт типов)
//   - src/services/electron/* (адаптеры, которыми пользуются компоненты)
//   - src/types/global.d.ts (декларации window.*API)
// Проверки выполняются на этапе компиляции TypeScript — если что-то
// расходится, тест не соберётся и vitest покажет ошибку.
import { describe, expect, expectTypeOf, it } from "vitest";
import type * as Contracts from "../../../electron/contracts";
import type * as Preload from "../../../electron/preload";
import { authService } from "./auth";
import { patientService } from "./patient";
import { researchService } from "./research";
import { journalService } from "./journal";
import { windowService } from "./window";
import { protocolService } from "./protocol";
import { fileService } from "./file";
import { defaultsService } from "./defaults";
import { mobileHostService } from "./mobileHost";
import { medisonService } from "./medison";
import { importMappingService } from "./importMapping";
import { patientSearchService } from "./patientSearch";
import { databaseService } from "./database";
import { registryService } from "./registry";
import { networkService } from "./network";
import { updateService } from "./update";
import { connectionService } from "./connection";

// ========== Группа A. preload.ts реэкспортирует ровно те же типы, что contracts.ts ==========

describe("IPC-контракты: preload реэкспортирует типы из contracts", () => {
  it("AuthAPI идентичен в preload и contracts", () => {
    expectTypeOf<Preload.AuthAPI>().toEqualTypeOf<Contracts.AuthAPI>();
  });

  it("PatientAPI идентичен в preload и contracts", () => {
    expectTypeOf<Preload.PatientAPI>().toEqualTypeOf<Contracts.PatientAPI>();
  });

  it("ResearchAPI идентичен в preload и contracts", () => {
    expectTypeOf<Preload.ResearchAPI>().toEqualTypeOf<Contracts.ResearchAPI>();
  });

  it("JournalAPI идентичен в preload и contracts", () => {
    expectTypeOf<Preload.JournalAPI>().toEqualTypeOf<Contracts.JournalAPI>();
  });

  it("WindowAPI идентичен в preload и contracts", () => {
    expectTypeOf<Preload.WindowAPI>().toEqualTypeOf<Contracts.WindowAPI>();
  });

  it("MobileHostAPI идентичен в preload и contracts", () => {
    expectTypeOf<Preload.MobileHostAPI>().toEqualTypeOf<Contracts.MobileHostAPI>();
  });

  it("MedisonAPI идентичен в preload и contracts", () => {
    expectTypeOf<Preload.MedisonAPI>().toEqualTypeOf<Contracts.MedisonAPI>();
  });

  it("ImportMappingAPI идентичен в preload и contracts", () => {
    expectTypeOf<Preload.ImportMappingAPI>().toEqualTypeOf<Contracts.ImportMappingAPI>();
  });

  it("ProtocolAPI идентичен в preload и contracts", () => {
    expectTypeOf<Preload.ProtocolAPI>().toEqualTypeOf<Contracts.ProtocolAPI>();
  });

  it("FileAPI идентичен в preload и contracts", () => {
    expectTypeOf<Preload.FileAPI>().toEqualTypeOf<Contracts.FileAPI>();
  });

  it("PatientSearchAPI идентичен в preload и contracts", () => {
    expectTypeOf<Preload.PatientSearchAPI>().toEqualTypeOf<Contracts.PatientSearchAPI>();
  });

  it("DatabaseAPI идентичен в preload и contracts", () => {
    expectTypeOf<Preload.DatabaseAPI>().toEqualTypeOf<Contracts.DatabaseAPI>();
  });

  it("DefaultsAPI идентичен в preload и contracts", () => {
    expectTypeOf<Preload.DefaultsAPI>().toEqualTypeOf<Contracts.DefaultsAPI>();
  });

  it("RegistryAPI идентичен в preload и contracts", () => {
    expectTypeOf<Preload.RegistryAPI>().toEqualTypeOf<Contracts.RegistryAPI>();
  });

  it("NetworkAPI идентичен в preload и contracts", () => {
    expectTypeOf<Preload.NetworkAPI>().toEqualTypeOf<Contracts.NetworkAPI>();
  });

  it("UpdateAPI идентичен в preload и contracts", () => {
    expectTypeOf<Preload.UpdateAPI>().toEqualTypeOf<Contracts.UpdateAPI>();
  });

  it("ConnectionAPI идентичен в preload и contracts", () => {
    expectTypeOf<Preload.ConnectionAPI>().toEqualTypeOf<Contracts.ConnectionAPI>();
  });
});

// ========== Группа B. Сервисы (адаптеры) соответствуют контрактам ==========
// toMatchTypeOf (а не toEqualTypeOf), т.к. у части сервисов есть доп. метод isAvailable.

const apiServices = {
  authService,
  patientService,
  researchService,
  journalService,
  windowService,
  mobileHostService,
  medisonService,
  importMappingService,
  protocolService,
  fileService,
  defaultsService,
  registryService,
  networkService,
  patientSearchService,
  databaseService,
  updateService,
  connectionService,
} as const;

describe("IPC-контракты: сервисы соответствуют контрактам", () => {
  it("authService соответствует AuthAPI", () => {
    expectTypeOf(apiServices.authService).toMatchTypeOf<Contracts.AuthAPI>();
  });

  it("patientService соответствует PatientAPI", () => {
    expectTypeOf(apiServices.patientService).toMatchTypeOf<Contracts.PatientAPI>();
  });

  it("researchService соответствует ResearchAPI", () => {
    expectTypeOf(apiServices.researchService).toMatchTypeOf<Contracts.ResearchAPI>();
  });

  it("journalService соответствует JournalAPI", () => {
    expectTypeOf(apiServices.journalService).toMatchTypeOf<Contracts.JournalAPI>();
  });

  it("windowService соответствует WindowAPI", () => {
    expectTypeOf(apiServices.windowService).toMatchTypeOf<Contracts.WindowAPI>();
  });

  it("mobileHostService соответствует MobileHostAPI", () => {
    expectTypeOf(apiServices.mobileHostService).toMatchTypeOf<Contracts.MobileHostAPI>();
  });

  it("medisonService соответствует MedisonAPI", () => {
    expectTypeOf(apiServices.medisonService).toMatchTypeOf<Contracts.MedisonAPI>();
  });

  it("importMappingService соответствует ImportMappingAPI", () => {
    expectTypeOf(apiServices.importMappingService).toMatchTypeOf<Contracts.ImportMappingAPI>();
  });

  it("protocolService соответствует ProtocolAPI", () => {
    expectTypeOf(apiServices.protocolService).toMatchTypeOf<Contracts.ProtocolAPI>();
  });

  it("fileService соответствует FileAPI", () => {
    expectTypeOf(apiServices.fileService).toMatchTypeOf<Contracts.FileAPI>();
  });

  it("defaultsService соответствует DefaultsAPI", () => {
    expectTypeOf(apiServices.defaultsService).toMatchTypeOf<Contracts.DefaultsAPI>();
  });

  it("registryService соответствует RegistryAPI", () => {
    expectTypeOf(apiServices.registryService).toMatchTypeOf<Contracts.RegistryAPI>();
  });

  it("networkService соответствует NetworkAPI", () => {
    expectTypeOf(apiServices.networkService).toMatchTypeOf<Contracts.NetworkAPI>();
  });

  it("patientSearchService соответствует PatientSearchAPI", () => {
    expectTypeOf(apiServices.patientSearchService).toMatchTypeOf<Contracts.PatientSearchAPI>();
  });

  it("databaseService соответствует DatabaseAPI", () => {
    expectTypeOf(apiServices.databaseService).toMatchTypeOf<Contracts.DatabaseAPI>();
  });

  it("updateService соответствует UpdateAPI", () => {
    expectTypeOf(apiServices.updateService).toMatchTypeOf<Contracts.UpdateAPI>();
  });

  it("connectionService соответствует ConnectionAPI", () => {
    expectTypeOf(apiServices.connectionService).toMatchTypeOf<Contracts.ConnectionAPI>();
  });
});

// ========== Группа C. Сигнатуры ключевых методов ==========

describe("IPC-контракты: сигнатуры ключевых методов сервисов", () => {
  it("authService.login принимает { username, password } и возвращает типизированный результат", () => {
    type ExpectedArgs = Parameters<Contracts.AuthAPI["login"]>[0];
    type ExpectedReturn = ReturnType<Contracts.AuthAPI["login"]>;

    expectTypeOf<Parameters<typeof apiServices.authService.login>[0]>().toEqualTypeOf<ExpectedArgs>();
    expectTypeOf<ReturnType<typeof apiServices.authService.login>>().toEqualTypeOf<ExpectedReturn>();
    // Возвращаемый user строго типизирован как AuthUser | null | undefined
    expectTypeOf<Awaited<ExpectedReturn>["user"]>().toEqualTypeOf<
      Contracts.AuthUser | null | undefined
    >();
  });

  it("researchService.addStudy принимает { researchId, studyType, studyData }", () => {
    expectTypeOf<Parameters<typeof apiServices.researchService.addStudy>[0]>().toEqualTypeOf<
      Parameters<Contracts.ResearchAPI["addStudy"]>[0]
    >();
    expectTypeOf<ReturnType<typeof apiServices.researchService.addStudy>>().toEqualTypeOf<
      ReturnType<Contracts.ResearchAPI["addStudy"]>
    >();
  });

  it("patientService.findOrCreate принимает данные пациента и возвращает пациента", () => {
    expectTypeOf<Parameters<typeof apiServices.patientService.findOrCreate>[0]>().toEqualTypeOf<
      Parameters<Contracts.PatientAPI["findOrCreate"]>[0]
    >();
    expectTypeOf<ReturnType<typeof apiServices.patientService.findOrCreate>>().toEqualTypeOf<
      ReturnType<Contracts.PatientAPI["findOrCreate"]>
    >();
  });

  it("protocolService.getByResearchId возвращает SavedProtocol | null", () => {
    expectTypeOf<ReturnType<typeof apiServices.protocolService.getByResearchId>>().toEqualTypeOf<
      ReturnType<Contracts.ProtocolAPI["getByResearchId"]>
    >();
    expectTypeOf<Awaited<ReturnType<typeof apiServices.protocolService.getByResearchId>>>().toEqualTypeOf<
      Contracts.SavedProtocol | null
    >();
  });

  it("databaseService.getStatistics возвращает структуру статистики", () => {
    expectTypeOf<Parameters<typeof apiServices.databaseService.getStatistics>>().toEqualTypeOf<
      Parameters<Contracts.DatabaseAPI["getStatistics"]>
    >();
    expectTypeOf<Awaited<ReturnType<typeof apiServices.databaseService.getStatistics>>>().toEqualTypeOf<
      Awaited<ReturnType<Contracts.DatabaseAPI["getStatistics"]>>
    >();
  });
});

// ========== Группа D. Глобальные декларации window.*API ==========
// Проверяем реальные типы Window из src/types/global.d.ts (без собственного declare global).

describe("IPC-контракты: window.*API в global.d.ts совпадают с contracts", () => {
  it("window.authAPI — это AuthAPI", () => {
    expectTypeOf<Window["authAPI"]>().toEqualTypeOf<Contracts.AuthAPI>();
  });

  it("window.patientAPI — это PatientAPI", () => {
    expectTypeOf<Window["patientAPI"]>().toEqualTypeOf<Contracts.PatientAPI>();
  });

  it("window.researchAPI — это ResearchAPI", () => {
    expectTypeOf<Window["researchAPI"]>().toEqualTypeOf<Contracts.ResearchAPI>();
  });

  it("window.journalAPI — это JournalAPI", () => {
    expectTypeOf<Window["journalAPI"]>().toEqualTypeOf<Contracts.JournalAPI>();
  });

  it("window.windowAPI — это WindowAPI", () => {
    expectTypeOf<Window["windowAPI"]>().toEqualTypeOf<Contracts.WindowAPI>();
  });

  it("window.mobileHostAPI — это MobileHostAPI", () => {
    expectTypeOf<Window["mobileHostAPI"]>().toEqualTypeOf<Contracts.MobileHostAPI>();
  });

  it("window.medisonAPI — это MedisonAPI", () => {
    expectTypeOf<Window["medisonAPI"]>().toEqualTypeOf<Contracts.MedisonAPI>();
  });

  it("window.importMappingAPI — это ImportMappingAPI", () => {
    expectTypeOf<Window["importMappingAPI"]>().toEqualTypeOf<Contracts.ImportMappingAPI>();
  });

  it("window.protocolAPI — это ProtocolAPI", () => {
    expectTypeOf<Window["protocolAPI"]>().toEqualTypeOf<Contracts.ProtocolAPI>();
  });

  it("window.fileAPI — это FileAPI", () => {
    expectTypeOf<Window["fileAPI"]>().toEqualTypeOf<Contracts.FileAPI>();
  });

  it("window.patientSearchAPI — это PatientSearchAPI", () => {
    expectTypeOf<Window["patientSearchAPI"]>().toEqualTypeOf<Contracts.PatientSearchAPI>();
  });

  it("window.databaseAPI — это DatabaseAPI", () => {
    expectTypeOf<Window["databaseAPI"]>().toEqualTypeOf<Contracts.DatabaseAPI>();
  });

  it("window.defaultsAPI — это DefaultsAPI", () => {
    expectTypeOf<Window["defaultsAPI"]>().toEqualTypeOf<Contracts.DefaultsAPI>();
  });

  it("window.registryAPI — это RegistryAPI", () => {
    expectTypeOf<Window["registryAPI"]>().toEqualTypeOf<Contracts.RegistryAPI>();
  });

  it("window.networkAPI — это NetworkAPI", () => {
    expectTypeOf<Window["networkAPI"]>().toEqualTypeOf<Contracts.NetworkAPI>();
  });

  it("window.updateAPI — это UpdateAPI", () => {
    expectTypeOf<Window["updateAPI"]>().toEqualTypeOf<Contracts.UpdateAPI>();
  });

  it("window.connectionAPI — это ConnectionAPI", () => {
    expectTypeOf<Window["connectionAPI"]>().toEqualTypeOf<Contracts.ConnectionAPI>();
  });
});

// ========== Группа E. Доменные типы: preload ≡ contracts ==========

describe("IPC-контракты: доменные типы идентичны в preload и contracts", () => {
  it("AuthUser идентичен", () => {
    expectTypeOf<Preload.AuthUser>().toEqualTypeOf<Contracts.AuthUser>();
  });

  it("Patient идентичен", () => {
    expectTypeOf<Preload.Patient>().toEqualTypeOf<Contracts.Patient>();
  });

  it("Research идентичен", () => {
    expectTypeOf<Preload.Research>().toEqualTypeOf<Contracts.Research>();
  });

  it("JournalEntry идентичен", () => {
    expectTypeOf<Preload.JournalEntry>().toEqualTypeOf<Contracts.JournalEntry>();
  });

  it("SavedProtocol идентичен", () => {
    expectTypeOf<Preload.SavedProtocol>().toEqualTypeOf<Contracts.SavedProtocol>();
  });

  it("ResearchStudy идентичен", () => {
    expectTypeOf<Preload.ResearchStudy>().toEqualTypeOf<Contracts.ResearchStudy>();
  });
});

it("набор проверок собран (sanity: тест реально выполняется)", () => {
  expect(true).toBe(true);
});