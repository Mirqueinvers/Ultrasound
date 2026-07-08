import { useCallback, useState } from "react";
import { Keyboard } from "react-native";
import type { FieldEditorOption } from "../components/FieldEditorModal";

export type FooterContentComponent = (props: {
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

export function useFieldEditor() {
  const [editorState, setEditorState] = useState<EditorState>(null);

  const openEditor = useCallback((config: NonNullable<EditorState>) => {
    Keyboard.dismiss();
    setTimeout(() => {
      setEditorState(config);
    }, 0);
  }, []);

  const saveEditor = useCallback(
    (value: string) => {
      editorState?.onSave(value);
      setEditorState(null);
    },
    [editorState],
  );

  const closeEditor = useCallback(() => {
    setEditorState(null);
  }, []);

  return {
    editorState,
    openEditor,
    saveEditor,
    closeEditor,
  };
}
