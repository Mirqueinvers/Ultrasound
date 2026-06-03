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
  headerClassName = "",
  className = "",
}) => (
  <div className={`rounded-lg border border-slate-200 bg-white overflow-hidden ${className}`}>
    <div className={`flex items-center gap-2 px-4 py-2.5 bg-[#e0f2f7] border-b border-sky-100 ${headerClassName}`}>
      <h3 className="m-0 text-sm font-semibold text-[#0e7490] tracking-wide uppercase">{title}</h3>
    </div>
    <div className="px-4 py-3">
      {children}
    </div>
  </div>
);
