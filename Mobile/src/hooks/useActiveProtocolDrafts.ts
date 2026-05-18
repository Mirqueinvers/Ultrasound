import { useMemo } from "react";

import { type MobileStudiesDataMap } from "../protocols/types";
import { createEmptyObpDraft, type ObpDraft } from "../shared/obpDraft";
import { createEmptyKidneyStudyDraft, type KidneyStudyDraft } from "../shared/kidneyDraft";
import { createEmptyScrotumDraft, type ScrotumDraft } from "../shared/scrotumDraft";
import { createEmptyOmtFemaleDraft, type OmtFemaleDraft } from "../shared/omtFemaleDraft";
import { createEmptyOmtMaleDraft, type OmtMaleDraft } from "../shared/omtMaleDraft";
import { createEmptyThyroidStudyDraft, type ThyroidStudyDraft } from "../shared/thyroidDraft";
import { createEmptyBreastStudyDraft, type BreastStudyDraft } from "../shared/breastDraft";
import { createEmptyLymphNodesStudyDraft, type LymphNodesStudyDraft } from "../shared/lymphNodesDraft";
import { getDesktopStudyKey } from "../sync/adapters";
import {
  isObpDraft,
  isKidneyStudyDraft,
  isOmtFemaleDraft,
  isOmtMaleDraft,
  isThyroidStudyDraft,
  isBreastStudyDraft,
  isLymphNodesStudyDraft,
} from "../protocols";

export type ActiveProtocolDrafts = {
  activeObpDraft: ObpDraft;
  activeKidneyDraft: KidneyStudyDraft;
  activeScrotumDraft: ScrotumDraft;
  activeOmtFemaleDraft: OmtFemaleDraft;
  activeOmtMaleDraft: OmtMaleDraft;
  activeThyroidDraft: ThyroidStudyDraft;
  activeBreastDraft: BreastStudyDraft;
  activeLymphNodesDraft: LymphNodesStudyDraft;
};

export function useActiveProtocolDrafts(studiesData: MobileStudiesDataMap): ActiveProtocolDrafts {
  const obpDesktopKey = getDesktopStudyKey("obp");
  const kidneysDesktopKey = getDesktopStudyKey("kidneys");
  const scrotumDesktopKey = getDesktopStudyKey("scrotum");
  const omtFemaleDesktopKey = getDesktopStudyKey("omt_female");
  const omtMaleDesktopKey = getDesktopStudyKey("omt_male");
  const thyroidDesktopKey = getDesktopStudyKey("thyroid");
  const breastDesktopKey = getDesktopStudyKey("breast");
  const lymphNodesDesktopKey = getDesktopStudyKey("lymph_nodes");

  const activeObpDraft = useMemo(
    () =>
      isObpDraft(studiesData[obpDesktopKey])
        ? (studiesData[obpDesktopKey] as ObpDraft)
        : createEmptyObpDraft(),
    [studiesData],
  );

  const activeKidneyDraft = useMemo(
    () =>
      isKidneyStudyDraft(studiesData[kidneysDesktopKey])
        ? (studiesData[kidneysDesktopKey] as KidneyStudyDraft)
        : createEmptyKidneyStudyDraft(),
    [studiesData],
  );

  const activeScrotumDraft = useMemo(
    () => (studiesData[scrotumDesktopKey] as ScrotumDraft | undefined) ?? createEmptyScrotumDraft(),
    [studiesData],
  );

  const activeOmtFemaleDraft = useMemo(
    () =>
      isOmtFemaleDraft(studiesData[omtFemaleDesktopKey])
        ? (studiesData[omtFemaleDesktopKey] as OmtFemaleDraft)
        : createEmptyOmtFemaleDraft(),
    [studiesData],
  );

  const activeOmtMaleDraft = useMemo(
    () =>
      isOmtMaleDraft(studiesData[omtMaleDesktopKey])
        ? (studiesData[omtMaleDesktopKey] as OmtMaleDraft)
        : createEmptyOmtMaleDraft(),
    [studiesData],
  );

  const activeThyroidDraft = useMemo(
    () =>
      isThyroidStudyDraft(studiesData[thyroidDesktopKey])
        ? (studiesData[thyroidDesktopKey] as ThyroidStudyDraft)
        : createEmptyThyroidStudyDraft(),
    [studiesData],
  );

  const activeBreastDraft = useMemo(
    () =>
      isBreastStudyDraft(studiesData[breastDesktopKey])
        ? (studiesData[breastDesktopKey] as BreastStudyDraft)
        : createEmptyBreastStudyDraft(),
    [studiesData],
  );

  const activeLymphNodesDraft = useMemo(
    () =>
      isLymphNodesStudyDraft(studiesData[lymphNodesDesktopKey])
        ? (studiesData[lymphNodesDesktopKey] as LymphNodesStudyDraft)
        : createEmptyLymphNodesStudyDraft(),
    [studiesData],
  );

  return {
    activeObpDraft,
    activeKidneyDraft,
    activeScrotumDraft,
    activeOmtFemaleDraft,
    activeOmtMaleDraft,
    activeThyroidDraft,
    activeBreastDraft,
    activeLymphNodesDraft,
  };
}
