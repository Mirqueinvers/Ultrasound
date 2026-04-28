import { Pressable, Text, View } from "react-native";

import { InlineStat } from "../components/InlineStat";
import { SectionPanel } from "../components/SectionPanel";
import { StatusPill } from "../components/StatusPill";
import { getProtocolManifestByLabel } from "../shared/protocols";
import type { MobileSyncSnapshot } from "../shared/mobileSync";

type SaveState = "idle" | "requested" | "saved";

type SummaryScreenProps = {
  styles: any;
  snapshot: MobileSyncSnapshot;
  reviewIssues: string[];
  canSaveDraft: boolean;
  saveState: SaveState;
  onRequestDesktopSave: () => void;
};

export function SummaryScreen({
  styles,
  snapshot,
  reviewIssues,
  canSaveDraft,
  saveState,
  onRequestDesktopSave,
}: SummaryScreenProps) {
  const isSaved = saveState === "saved";
  const buttonLabel = saveState === "requested"
    ? "Sending to desktop..."
    : "Save to desktop";

  return (
    <SectionPanel
      styles={styles}
      title="Summary"
      subtitle="Current draft snapshot"
    >
      <View style={styles.summaryCard}>
        <InlineStat
          styles={styles}
          label="Patient"
          value={snapshot.header.patientFullName || "Not set"}
        />
        <InlineStat
          styles={styles}
          label="Date of birth"
          value={snapshot.header.patientDateOfBirth || "Not set"}
        />
        <InlineStat
          styles={styles}
          label="Study date"
          value={snapshot.header.researchDate || "Not set"}
        />
        <InlineStat
          styles={styles}
          label="Organization"
          value={snapshot.header.organization || "Not set"}
        />
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.blockLabel}>Selected studies</Text>
        <View style={styles.summaryList}>
          {snapshot.selection.selectedStudies.length === 0 ? (
            <Text style={styles.emptyState}>No studies selected yet.</Text>
          ) : (
            snapshot.selection.selectedStudies.map((label) => {
              const manifest = getProtocolManifestByLabel(label);
              return (
                <View key={label} style={styles.summaryListItem}>
                  <Text style={styles.summaryListTitle}>{label}</Text>
                  <Text style={styles.summaryListHint}>
                    {manifest?.title ?? "Unknown protocol"}
                  </Text>
                </View>
              );
            })
          )}
        </View>
      </View>

      <View style={styles.reviewCard}>
        <View style={styles.reviewHeader}>
          <View>
            <Text style={styles.blockLabel}>Final review</Text>
            <Text style={styles.reviewTitle}>
              {canSaveDraft ? "Ready to save" : "Needs attention"}
            </Text>
          </View>
          <StatusPill
            styles={styles}
            tone={canSaveDraft ? "success" : "accent"}
          >
            {saveState === "requested"
              ? "Saving..."
              : saveState === "saved"
                ? "Saved"
                : canSaveDraft
                  ? "Check complete"
                  : "Incomplete"}
          </StatusPill>
        </View>

        <View style={styles.reviewList}>
          {reviewIssues.length === 0 ? (
            <Text style={styles.reviewReadyText}>
              Patient and study details are complete. You can send this draft to
              the desktop for saving.
            </Text>
          ) : (
            reviewIssues.map((issue) => (
              <View key={issue} style={styles.reviewIssueRow}>
                <View style={styles.reviewIssueDot} />
                <Text style={styles.reviewIssueText}>{issue}</Text>
              </View>
            ))
          )}
        </View>

        <Pressable
          disabled={
            saveState === "requested" ||
            !canSaveDraft
          }
          onPress={onRequestDesktopSave}
          style={({ pressed }) => [
            styles.primaryButton,
            styles.saveButton,
            (saveState === "requested" || !canSaveDraft) &&
              styles.saveButtonDisabled,
            pressed &&
              saveState !== "requested" &&
              canSaveDraft &&
              styles.buttonPressed,
          ]}
        >
          <Text style={styles.primaryButtonText}>
            {buttonLabel}
          </Text>
        </Pressable>

        <Text style={styles.reviewHintText}>
          The desktop host writes the research to the database.
        </Text>
      </View>
    </SectionPanel>
  );
}
