import React from "react";

interface EditablePrintTextBlockProps {
  value: string;
}

const EditablePrintTextBlock: React.FC<EditablePrintTextBlockProps> = ({ value }) => {
  if (!value.trim()) {
    return null;
  }

  return (
    <div className="space-y-2 text-sm leading-6 text-slate-900">
      {value.split(/\n{2,}/).map((paragraph, index) => (
        <p key={index} className="whitespace-pre-wrap">
          {paragraph}
        </p>
      ))}
    </div>
  );
};

export default EditablePrintTextBlock;
