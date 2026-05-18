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
      ? "Отправка на компьютер..."
      : isSaved
        ? "Сохранено на компьютере"
        : "Сохранить на компьютере";

  return (
    <SectionPanel
      styles={styles}
      title="Итог"
      subtitle="Текущее состояние черновика"
    >
      <View style={styles.summaryCard}>
        <InlineStat
          styles={styles}
          label="Пациент"
          value={snapshot.header.patientFullName || "Не указано"}
        />
        <InlineStat
          styles={styles}
          label="Дата рождения"
          value={
            formatDateForMobileDisplay(snapshot.header.patientDateOfBirth) || "Не указано"
          }
        />
        <InlineStat
          styles={styles}
          label="Дата исследования"
          value={formatDateForMobileDisplay(snapshot.header.researchDate) || "Не указано"}
        />
        <InlineStat
          styles={styles}
          label="Организация"
          value={snapshot.header.organization || "Не указано"}
        />
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.blockLabel}>Выбранные исследования</Text>
        <View style={styles.summaryList}>
          {snapshot.selection.selectedStudies.length === 0 ? (
            <Text style={styles.emptyState}>Исследования пока не выбраны</Text>
          ) : (
            snapshot.selection.selectedStudies.map((label) => {
              const manifest = getProtocolManifestByLabel(label);
              return (
                <View key={label} style={styles.summaryListItem}>
                  <Text style={styles.summaryListTitle}>{label}</Text>
                  <Text style={styles.summaryListHint}>
                    {manifest?.title ?? "Неизвестный протокол"}
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
            <Text style={styles.blockLabel}>Финальная проверка</Text>
            <Text style={styles.reviewTitle}>
              {canSaveDraft ? "Готово к сохранению" : "Требует внимания"}
            </Text>
          </View>
          <StatusPill
            styles={styles}
            tone={canSaveDraft ? "success" : "accent"}
          >
            {saveState === "requested"
              ? "Сохранение..."
              : saveState === "saved"
                ? "Сохранено"
                : canSaveDraft
                  ? "Проверка пройдена"
                  : "Не заполнено"}
          </StatusPill>
        </View>

        <View style={styles.reviewList}>
          {reviewIssues.length === 0 ? (
            <Text style={styles.reviewReadyText}>
              Данные пациента и исследования заполнены. Можно отправить черновик
              на компьютер для сохранения.
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
            <Text style={styles.printButtonText}>Печать на компьютере</Text>
          </Pressable>
        ) : null}

        <Pressable
          onPress={() => {
            Alert.alert(
              "Очистить текущий черновик?",
              "Все несохранённые изменения будут очищены на компьютере.",
              [
                { text: "Отмена", style: "cancel" },
                {
                  text: "Очистить",
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
          <Text style={styles.clearButtonText}>Очистить на компьютере</Text>
        </Pressable>

        <Text style={styles.reviewHintText}>
          Рабочее место сохраняет исследование в базу данных.
        </Text>
      </View>
    </SectionPanel>
  );
}
