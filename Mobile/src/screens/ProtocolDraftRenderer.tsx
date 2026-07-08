import { useMemo } from "react";
import { Text, View } from "react-native";

import { MobileField } from "../components/MobileField";
import { StatusPill } from "../components/StatusPill";
import { type ProtocolManifest } from "../shared/protocols";
import { createEmptyStudyDraft, type StudyDraft } from "../shared/syncHelpers";
import { getDesktopStudyKey } from "../sync/adapters";
import type { ObpDraftActions } from "../protocols/obp/useObpDraftActions";
import type { ProtocolUpdateHandlers } from "../hooks/useProtocolUpdateHandlers";
import type { AppStyles } from "../styles/appStyles";
import type { MobileStudiesDataMap } from "../protocols/types";
import type { FieldVisibility } from "../settings/fieldVisibility";
import { useActiveProtocolDrafts } from "../hooks/useActiveProtocolDrafts";
import { PROTOCOL_RENDERERS } from "./protocolRenderers";

type ProtocolDraftRendererProps = {
  activeProtocolManifest: ProtocolManifest | null;
  activeSectionId: string | null;
  studiesData: MobileStudiesDataMap;
  styles: AppStyles;
  fieldVisibility: FieldVisibility;
  obpActions: ObpDraftActions;
  protocolUpdateHandlers: ProtocolUpdateHandlers;
  onUpdateGeneralNote: (protocolLabel: string, value: string) => void;
  onUpdateSectionNote: (protocolLabel: string, sectionDesktopKey: string, value: string) => void;
};

export function ProtocolDraftRenderer({
  activeProtocolManifest,
  activeSectionId,
  studiesData,
  styles,
  fieldVisibility,
  obpActions,
  onUpdateGeneralNote,
  onUpdateSectionNote,
  protocolUpdateHandlers,
}: ProtocolDraftRendererProps) {
  const activeDesktopKey = activeProtocolManifest ? getDesktopStudyKey(activeProtocolManifest.id) : "";

  const currentStudyDraft = useMemo<StudyDraft>(
    () =>
      activeDesktopKey
        ? ((studiesData[activeDesktopKey] as StudyDraft | undefined) ?? createEmptyStudyDraft())
        : createEmptyStudyDraft(),
    [activeDesktopKey, studiesData],
  );
  const {
    activeObpDraft,
    activeKidneyDraft,
    activeScrotumDraft,
    activeOmtFemaleDraft,
    activeOmtMaleDraft,
    activeThyroidDraft,
    activeBreastDraft,
    activeLymphNodesDraft,
  } = useActiveProtocolDrafts(studiesData);

  const protocolRenderer = activeProtocolManifest
    ? PROTOCOL_RENDERERS[activeProtocolManifest.id as keyof typeof PROTOCOL_RENDERERS]
    : null;
  const activeSection = activeProtocolManifest
    ? activeProtocolManifest.sections.find((section) => section.id === activeSectionId) ??
      activeProtocolManifest.sections[0] ??
      null
    : null;
  const rendererContext = {
    styles,
    activeSectionId,
    fieldVisibility,
    obpActions,
    protocolUpdateHandlers,
    activeObpDraft,
    activeKidneyDraft,
    activeScrotumDraft,
    activeOmtFemaleDraft,
    activeOmtMaleDraft,
    activeThyroidDraft,
    activeBreastDraft,
    activeLymphNodesDraft,
  } as const;

  if (!activeProtocolManifest) {
    return (
      <View style={styles.emptyProtocolState}>
        <Text style={styles.emptyProtocolTitle}>Активный протокол не выбран</Text>
        <Text style={styles.emptyProtocolText}>
          Выберите протокол из списка, чтобы начать редактирование на телефоне.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.activeProtocolBlock}>
      {protocolRenderer ? (
        (protocolRenderer as (ctx: Record<string, unknown>) => React.ReactNode)(rendererContext)
      ) : activeSection ? (
        <>
          <MobileField
            styles={styles}
            label="Общее примечание"
            value={currentStudyDraft.general}
            onChangeText={(value) => onUpdateGeneralNote(activeProtocolManifest.selectionLabel, value)}
            placeholder="Введите общее примечание"
            multiline
            minHeight={96}
          />

          <View style={styles.sectionCard}>
            <View style={styles.sectionCardHeader}>
              <View>
                <Text style={styles.sectionLabel}>{activeSection.label}</Text>
                <Text style={styles.sectionDesktopKey}>{activeSection.desktopKey}</Text>
              </View>
              <StatusPill styles={styles} tone="neutral">
                раздел
              </StatusPill>
            </View>

            <MobileField
              styles={styles}
              label="Примечание раздела"
              value={currentStudyDraft.sections?.[activeSection.desktopKey] ?? ""}
              onChangeText={(value) =>
                onUpdateSectionNote(activeProtocolManifest.selectionLabel, activeSection.desktopKey, value)
              }
              placeholder={`Введите примечание для "${activeSection.label.toLowerCase()}"`}
              multiline
              minHeight={110}
            />
          </View>
        </>
      ) : (
        <View style={styles.emptyProtocolState}>
          <Text style={styles.emptyProtocolTitle}>Активный раздел не найден</Text>
          <Text style={styles.emptyProtocolText}>
            Выберите раздел в верхней навигации, чтобы начать редактирование на телефоне.
          </Text>
        </View>
      )}
    </View>
  );
}
