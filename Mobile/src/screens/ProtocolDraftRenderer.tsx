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
import { useActiveProtocolDrafts } from "../hooks/useActiveProtocolDrafts";
import { PROTOCOL_RENDERERS, type ProtocolRendererContext } from "./protocolRenderers";

type ProtocolDraftRendererProps = {
  activeProtocolManifest: ProtocolManifest | null;
  studiesData: MobileStudiesDataMap;
  styles: AppStyles;
  obpActions: ObpDraftActions;
  protocolUpdateHandlers: ProtocolUpdateHandlers;
  onUpdateGeneralNote: (protocolLabel: string, value: string) => void;
  onUpdateSectionNote: (protocolLabel: string, sectionDesktopKey: string, value: string) => void;
};

export function ProtocolDraftRenderer({
  activeProtocolManifest,
  studiesData,
  styles,
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
  const rendererContext: ProtocolRendererContext = {
    styles,
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
  };

  if (!activeProtocolManifest) {
    return (
      <View style={styles.emptyProtocolState}>
        <Text style={styles.emptyProtocolTitle}>No active protocol selected</Text>
        <Text style={styles.emptyProtocolText}>
          Pick a protocol from the library to start editing it on your phone.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.activeProtocolBlock}>
      <View style={styles.activeProtocolHeader}>
        <View>
          <Text style={styles.blockLabel}>Active protocol</Text>
          <Text style={styles.blockTitle}>{activeProtocolManifest.selectionLabel}</Text>
        </View>
        <StatusPill styles={styles} tone="accent">
          {activeProtocolManifest.sections.length} sections
        </StatusPill>
      </View>

      {protocolRenderer ? (
        protocolRenderer(rendererContext)
      ) : (
        <>
          <MobileField
            styles={styles}
            label="General note"
            value={currentStudyDraft.general}
            onChangeText={(value) => onUpdateGeneralNote(activeProtocolManifest.selectionLabel, value)}
            placeholder="Enter a general note"
            multiline
            minHeight={96}
          />

          {activeProtocolManifest.sections.map((section) => (
            <View key={section.id} style={styles.sectionCard}>
              <View style={styles.sectionCardHeader}>
                <View>
                  <Text style={styles.sectionLabel}>{section.label}</Text>
                  <Text style={styles.sectionDesktopKey}>{section.desktopKey}</Text>
                </View>
                <StatusPill styles={styles} tone="neutral">
                  section
                </StatusPill>
              </View>

              <MobileField
                styles={styles}
                label="Section note"
                value={currentStudyDraft.sections?.[section.desktopKey] ?? ""}
                onChangeText={(value) =>
                  onUpdateSectionNote(activeProtocolManifest.selectionLabel, section.desktopKey, value)
                }
                placeholder={`Enter ${section.label.toLowerCase()} note`}
                multiline
                minHeight={110}
              />
            </View>
          ))}
        </>
      )}
    </View>
  );
}
