import { type MobileSyncSnapshot } from "../../shared/mobileSync";

export function getDraftReviewIssues(snapshot: MobileSyncSnapshot): string[] {
  const issues: string[] = [];

  if (!snapshot.header.patientFullName.trim()) {
    issues.push("ФИО пациента");
  }

  if (!snapshot.header.patientDateOfBirth.trim()) {
    issues.push("Дата рождения");
  }

  if (!snapshot.header.researchDate.trim()) {
    issues.push("Дата исследования");
  }

  if (snapshot.selection.selectedStudies.length === 0) {
    issues.push("Выберите хотя бы один протокол");
  }

  return issues;
}
