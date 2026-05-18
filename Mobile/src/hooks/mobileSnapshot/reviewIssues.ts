import { type MobileSyncSnapshot } from "../../shared/mobileSync";

export function getDraftReviewIssues(snapshot: MobileSyncSnapshot): string[] {
  const issues: string[] = [];

  if (!snapshot.header.patientFullName.trim()) {
    issues.push("Patient full name");
  }

  if (!snapshot.header.patientDateOfBirth.trim()) {
    issues.push("Date of birth");
  }

  if (!snapshot.header.researchDate.trim()) {
    issues.push("Study date");
  }

  if (snapshot.selection.selectedStudies.length === 0) {
    issues.push("Select at least one protocol");
  }

  return issues;
}
