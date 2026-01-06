import React from "react";

interface ResearchSectionCardProps {
  title: string;
  children: React.ReactNode;
  headerClassName?: string; // доп. настройки, если нужно
  className?: string;
}

export const ResearchSectionCard: React.FC<ResearchSectionCardProps> = ({
  title,
  children,
  headerClassName = "bg-sky-700",
  className = "",
}) => (
  <div className={`bg-white border border-slate-200 rounded-2xl shadow-lg overflow-hidden ${className}`}>
    <div className={`${headerClassName} px-6 py-3`}>
      <h3 className="m-0 text-white text-lg font-semibold">{title}</h3>
    </div>
    <div className="px-6 py-5">
      {children}
    </div>
  </div>
);
