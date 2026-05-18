import { StyleSheet } from "react-native";

export const fieldEditorModalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(2, 6, 23, 0.96)",
    padding: 16,
    paddingTop: 48,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  headerTextWrap: {
    flex: 1,
    paddingRight: 12,
  },
  title: {
    color: "#f8fafc",
    fontSize: 22,
    fontWeight: "800",
  },
  subtitle: {
    color: "#94a3b8",
    marginTop: 6,
  },
  closeButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: "rgba(148, 163, 184, 0.16)",
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.24)",
  },
  closeButtonText: {
    color: "#e2e8f0",
    fontWeight: "700",
  },
  card: {
    flex: 1,
    borderRadius: 28,
    backgroundColor: "#0f172a",
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.16)",
    padding: 16,
    gap: 16,
  },
  currentValueCard: {
    padding: 14,
    borderRadius: 20,
    backgroundColor: "rgba(148, 163, 184, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.14)",
  },
  currentValueLabel: {
    color: "#7dd3fc",
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  currentValueText: {
    color: "#f8fafc",
    fontSize: 18,
    fontWeight: "700",
    marginTop: 8,
    minHeight: 24,
  },
  numberPadContainer: {
    gap: 12,
  },
  numberPadRow: {
    flexDirection: "row",
    gap: 10,
  },
  numberKeyButton: {
    flex: 1,
    minHeight: 64,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(56, 189, 248, 0.14)",
    borderWidth: 1,
    borderColor: "rgba(56, 189, 248, 0.2)",
  },
  numberKeyButtonPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.98 }],
  },
  numberKeyLabel: {
    color: "#e0f2fe",
    fontSize: 22,
    fontWeight: "800",
  },
  selectList: {
    gap: 10,
    paddingBottom: 8,
  },
  selectOptionButton: {
    paddingVertical: 16,
    paddingHorizontal: 14,
    borderRadius: 18,
    borderWidth: 1,
  },
  selectOptionButtonSelected: {
    borderColor: "rgba(34, 197, 94, 0.5)",
    backgroundColor: "rgba(4, 120, 87, 0.18)",
  },
  selectOptionButtonUnselected: {
    borderColor: "rgba(148, 163, 184, 0.16)",
    backgroundColor: "rgba(148, 163, 184, 0.08)",
  },
  selectOptionText: {
    color: "#f8fafc",
    fontSize: 16,
    fontWeight: "700",
  },
  textAreaList: {
    gap: 12,
    paddingBottom: 8,
  },
  textInput: {
    borderRadius: 20,
    backgroundColor: "#101a31",
    color: "#f8fafc",
    padding: 16,
    textAlignVertical: "top",
    fontSize: 16,
    minHeight: 180,
  },
  textInputSingleLine: {
    textAlignVertical: "center",
    minHeight: 64,
  },
  footerRow: {
    flexDirection: "row",
    gap: 10,
  },
  footerButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 18,
    alignItems: "center",
  },
  footerCancelButton: {
    backgroundColor: "rgba(148, 163, 184, 0.14)",
  },
  footerCancelText: {
    color: "#e2e8f0",
    fontWeight: "700",
  },
  footerSaveButton: {
    backgroundColor: "#22c55e",
  },
  footerSaveText: {
    color: "#04110a",
    fontWeight: "800",
  },
});
