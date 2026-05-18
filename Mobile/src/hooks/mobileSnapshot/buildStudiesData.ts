import { normalizeIncomingStudyData } from "../../sync/adapters";

export function buildStudiesData(snapshot: {
  studiesData: Record<string, unknown>;
}) {
  const result: Record<string, unknown> = {};

  Object.entries(snapshot.studiesData).forEach(([studyType, value]) => {
    result[studyType] = normalizeIncomingStudyData(studyType, value);
  });

  return result;
}
