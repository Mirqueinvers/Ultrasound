export const APP_SECTIONS = {
  UZI_PROTOCOLS: "uzi-protocols",
  JOURNAL: "journal",
  SEARCH: "search",
  STATISTICS: "statistics",
  DIRECTORY: "directory",
  REGISTRY: "registry",
  PROFILE: "profile",
  SETTINGS: "settings",
} as const;

export type AppSectionId = (typeof APP_SECTIONS)[keyof typeof APP_SECTIONS];

export const APP_SECTION_IDS: readonly AppSectionId[] = [
  APP_SECTIONS.UZI_PROTOCOLS,
  APP_SECTIONS.JOURNAL,
  APP_SECTIONS.SEARCH,
  APP_SECTIONS.STATISTICS,
  APP_SECTIONS.DIRECTORY,
  APP_SECTIONS.REGISTRY,
  APP_SECTIONS.PROFILE,
  APP_SECTIONS.SETTINGS,
];

export function isAppSectionId(value: string): value is AppSectionId {
  return (APP_SECTION_IDS as readonly string[]).includes(value);
}