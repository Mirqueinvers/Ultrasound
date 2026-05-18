import { Alert, Pressable, Text, View } from "react-native";

import { InlineStat } from "../components/InlineStat";
import { SectionPanel } from "../components/SectionPanel";
import { StatusPill } from "../components/StatusPill";
import { formatDateForMobileDisplay } from "../shared/formatDate";
import { getProtocolManifestByLabel } from "../shared/protocols";
import type { MobileSyncSnapshot } from "../shared/mobileSync";
import type { AppStyles } from "../styles/appStyles";

type SaveState = "idle" | "requested" | "saved";

type SummaryScreenProps = {
  styles: AppStyles;
  snapshot: MobileSyncSnapshot;
  reviewIssues: string[];
  canSaveDraft: boolean;
  saveState: SaveState;
  onRequestDesktopSave: () => void;
  onRequestDesktopPrint: () => void;
  onRequestDesktopClear: () => void;
};

export function SummaryScreen({
  styles,
  snapshot,
  reviewIssues,
  canSaveDraft,
  saveState,
  onRequestDesktopSave,
  onRequestDesktopPrint,
  onRequestDesktopClear,
}: SummaryScreenProps) {
  const isSaved = saveState === "saved";
  const buttonLabel =
    saveState === "requested"
      ? "Sending to desktop..."
      : isSaved
        ? "Saved on desktop"
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
          value={
            formatDateForMobileDisplay(snapshot.header.patientDateOfBirth) || "Not set"
          }
        />
        <InlineStat
          styles={styles}
          label="Study date"
          value={formatDateForMobileDisplay(snapshot.header.researchDate) || "Not set"}
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
            !canSaveDraft ||
            isSaved
          }
          onPress={onRequestDesktopSave}
          style={({ pressed }) => [
            styles.primaryButton,
            styles.saveButton,
            (saveState === "requested" || !canSaveDraft || isSaved) &&
              styles.saveButtonDisabled,
            pressed &&
              saveState !== "requested" &&
              canSaveDraft &&
              !isSaved &&
              styles.buttonPressed,
          ]}
        >
          <Text style={styles.primaryButtonText}>
            {buttonLabel}
          </Text>
        </Pressable>

        {isSaved ? (
          <Pressable
            onPress={onRequestDesktopPrint}
            style={({ pressed }) => [
              styles.printButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.printButtonText}>Print on desktop</Text>
          </Pressable>
        ) : null}

        <Pressable
          onPress={() => {
            Alert.alert(
              "Clear current draft?",
              "All unsaved changes will be cleared on the desktop.",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Clear",
                  style: "destructive",
                  onPress: onRequestDesktopClear,
                },
              ],
            );
          }}
          style={({ pressed }) => [
            styles.clearButton,
            pressed && styles.buttonPressed,
          ]}
        >
          <Text style={styles.clearButtonText}>Clear on desktop</Text>
        </Pressable>

        <Text style={styles.reviewHintText}>
          The desktop host writes the research to the database.
        </Text>
      </View>
    </SectionPanel>
  );
}
