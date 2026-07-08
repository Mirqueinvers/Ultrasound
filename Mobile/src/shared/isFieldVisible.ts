import type { FieldVisibility } from "../settings/fieldVisibility";

export function isFieldVisible(
  field: { visibilityGroup?: string },
  fieldVisibility: FieldVisibility,
): boolean {
  if (!field.visibilityGroup) {
    return true;
  }
  return (fieldVisibility as Record<string, boolean>)[field.visibilityGroup] !== false;
}
