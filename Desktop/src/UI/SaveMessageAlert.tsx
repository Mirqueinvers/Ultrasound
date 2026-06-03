import React, { useEffect } from "react";

interface SaveMessage {
  type: "success" | "error";
  text: string;
}

interface SaveMessageAlertProps {
  message: SaveMessage | null;
  onClose?: () => void;
}

export const SaveMessageAlert: React.FC<SaveMessageAlertProps> = ({
  message,
  onClose,
}) => {
  useEffect(() => {
    if (!message) return;

    const timer = setTimeout(() => {
      onClose?.();
    }, 3000);

    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div className="fixed top-4 left-1/2 z-50 -translate-x-1/2 transform mt-10">
      <div
        className={`px-4 py-3 rounded-lg shadow-md max-w-md text-center ${
          message.type === "success"
            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
            : "bg-red-50 text-red-800 border border-red-200"
        }`}
      >
        {message.text}
      </div>
    </div>
  );
};
