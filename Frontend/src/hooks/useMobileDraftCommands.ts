import React from "react";

interface UseMobileDraftCommandsParams {
  isDraftActive: boolean;
  isSaving: boolean;
  mobileSaveRequestAt: string | null;
  mobilePrintRequestAt: string | null;
  mobileClearRequestAt: string | null;
  paymentType: "oms" | "paid";
  saveResearch: (paymentType: "oms" | "paid") => void;
  onPrintRequest: (token: string) => void;
  onClearRequest: () => void;
}

export const useMobileDraftCommands = ({
  isDraftActive,
  isSaving,
  mobileSaveRequestAt,
  mobilePrintRequestAt,
  mobileClearRequestAt,
  paymentType,
  saveResearch,
  onPrintRequest,
  onClearRequest,
}: UseMobileDraftCommandsParams) => {
  const processedMobileSaveRequestAt = React.useRef<string | null>(null);
  const processedMobilePrintRequestAt = React.useRef<string | null>(null);
  const processedMobileClearRequestAt = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (
      !mobileSaveRequestAt ||
      mobileSaveRequestAt === processedMobileSaveRequestAt.current
    ) {
      return;
    }

    if (!isDraftActive || isSaving) {
      return;
    }

    processedMobileSaveRequestAt.current = mobileSaveRequestAt;
    void saveResearch(paymentType);
  }, [isDraftActive, isSaving, mobileSaveRequestAt, paymentType, saveResearch]);

  React.useEffect(() => {
    if (
      !mobilePrintRequestAt ||
      mobilePrintRequestAt === processedMobilePrintRequestAt.current
    ) {
      return;
    }

    if (!isDraftActive) {
      return;
    }

    processedMobilePrintRequestAt.current = mobilePrintRequestAt;
    onPrintRequest(mobilePrintRequestAt);
  }, [isDraftActive, mobilePrintRequestAt, onPrintRequest]);

  React.useEffect(() => {
    if (
      !mobileClearRequestAt ||
      mobileClearRequestAt === processedMobileClearRequestAt.current
    ) {
      return;
    }

    processedMobileClearRequestAt.current = mobileClearRequestAt;
    onClearRequest();
  }, [mobileClearRequestAt, onClearRequest]);
};
