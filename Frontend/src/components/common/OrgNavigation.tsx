import React from "react";

import { PROTOCOL_SECTION_LABELS, type SectionKey } from "@/protocols";

export type { SectionKey } from "@/protocols";

export const ORG_LABELS: Record<SectionKey, string> = PROTOCOL_SECTION_LABELS;

interface OrgNavigationProps {
  availableSectionKeys: SectionKey[];
  scrollToSection: (key: SectionKey) => void;
}

const OrgNavigation: React.FC<OrgNavigationProps> = ({
  availableSectionKeys,
  scrollToSection,
}) => {
  const [isToolbarCollapsed, setIsToolbarCollapsed] = React.useState(false);

  if (availableSectionKeys.length === 0) {
    return null;
  }

  return (
    <div className="fixed right-[7%] bottom-[4%] z-30 w-40">
      <div
        className={
          "bg-white text-black shadow-lg transform origin-bottom rounded-2xl " +
          (isToolbarCollapsed
            ? "h-10 flex items-center justify-center cursor-pointer"
            : "p-2 max-h-[70vh] flex flex-col")
        }
        onClick={() => {
          if (isToolbarCollapsed) {
            setIsToolbarCollapsed(false);
          }
        }}
      >
        {isToolbarCollapsed ? (
          <span className="text-sm font-bold select-none">Навигация</span>
        ) : (
          <>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setIsToolbarCollapsed(true);
              }}
              className="flex items-center justify-between px-2 py-1 text-xs font-semibold hover:bg-black/5 rounded-lg mb-1"
            >
              <span>Навигация</span>
              <span>×</span>
            </button>

            <div className="mt-1 overflow-y-auto pr-1">
              {availableSectionKeys.map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    scrollToSection(key);
                  }}
                  className="block w-full text-left px-2 py-1 mb-0.5 text-[11px] rounded-md hover:bg-black/5"
                >
                  {ORG_LABELS[key]}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default OrgNavigation;

