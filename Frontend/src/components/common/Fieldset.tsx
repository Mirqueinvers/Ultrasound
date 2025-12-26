// Frontend/src/components/common/Fieldset.tsx
import React from "react";
import { fieldsetClasses, legendClasses } from "../../utils/formClasses";

interface FieldsetProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export const Fieldset: React.FC<FieldsetProps> = ({
  title,
  children,
  className = "",
}) => {
  return (
    <fieldset className={`${fieldsetClasses} ${className}`}>
      <legend className={legendClasses}>{title}</legend>
      {children}
    </fieldset>
  );
};
