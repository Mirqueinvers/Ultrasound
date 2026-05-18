import { renderObp } from "./renderObp";
import { renderKidneys } from "./renderKidneys";
import { renderScrotum } from "./renderScrotum";
import { renderOmtFemale } from "./renderOmtFemale";
import { renderOmtMale } from "./renderOmtMale";
import { renderThyroid } from "./renderThyroid";
import { renderBreast } from "./renderBreast";
import { renderLymphNodes } from "./renderLymphNodes";

export type { ProtocolRendererContext } from "./types";

export const PROTOCOL_RENDERERS = {
  obp: renderObp,
  kidneys: renderKidneys,
  scrotum: renderScrotum,
  omt_female: renderOmtFemale,
  omt_male: renderOmtMale,
  thyroid: renderThyroid,
  breast: renderBreast,
  lymph_nodes: renderLymphNodes,
} as const;
