// Frontend/src/UI/SaveMessageAlert.tsx
import React from "react";

interface SaveMessage {
  type: "success" | "error";
  text: string;
}

interface SaveMessageAlertProps {
  message: SaveMessage | null;
}

export const SaveMessageAlert: React.FC<SaveMessageAlertProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div
      className={`mb-4 px-4 py-3 rounded-lg ${
        message.type === "success"
          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
          : "bg-red-50 text-red-800 border border-red-200"
      }`}
    >
      {message.text}
    </div>
  );
};
