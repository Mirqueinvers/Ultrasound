import React from "react";

interface EditablePrintHtmlBlockProps {
  value: string;
  onChange?: (value: string) => void;
  editable?: boolean;
  className?: string;
  minHeight?: string;
}

const EditablePrintHtmlBlock: React.FC<EditablePrintHtmlBlockProps> = ({
  value,
  onChange,
  editable = false,
  className = "",
  minHeight = "auto",
}) => {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const isFocusedRef = React.useRef(false);

  React.useLayoutEffect(() => {
    if (!ref.current) {
      return;
    }

    if (!isFocusedRef.current && ref.current.innerHTML !== value) {
      ref.current.innerHTML = value;
    }
  }, [value]);

  const handleInput = () => {
    if (!editable || !ref.current || !onChange) {
      return;
    }

    onChange(ref.current.innerHTML);
  };

  return (
    <div
      ref={ref}
      contentEditable={editable}
      suppressContentEditableWarning
      onFocus={() => {
        isFocusedRef.current = true;
      }}
      onBlur={() => {
        isFocusedRef.current = false;
      }}
      onInput={handleInput}
      className={className}
      style={{ minHeight }}
    />
  );
};

export default EditablePrintHtmlBlock;
