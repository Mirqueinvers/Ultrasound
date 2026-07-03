import React, { useCallback, useState } from "react";
import { Keyboard } from "react-native";
import type { FieldEditorOption } from "../../components/FieldEditorModal";

type FooterContentComponent = (props: {
  value: string;
  setValue: (v: string) => void;
  close: () => void;
}) => React.ReactNode;

export type EditorState = {
  title: string;
  mode: "number" | "select" | "text";
  value: string;
  placeholder?: string;
  multiline?: boolean;
  options?: FieldEditorOption[];
  onSave: (value: string) => void;
  footerContent?: FooterContentComponent;
} | null;

export function useObpEditor() {
  const [editorState, setEditorState] = useState<EditorState>(null);

  const openEditor = useCallback((config: NonNullable<EditorState>) => {
    Keyboard.dismiss();
    requestAnimationFrame(() => {
      setEditorState(config);
    });
  }, []);

  const saveEditor = useCallback(
    (value: string) => {
      Keyboard.dismiss();
      editorState?.onSave(value);
      setEditorState(null);
    },
    [editorState],
  );

  const cancelEditor = useCallback(() => {
    setEditorState(null);
  }, []);

  return {
    editorState,
    openEditor,
    saveEditor,
    cancelEditor,
  };
}