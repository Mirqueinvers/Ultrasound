import React, { useMemo, useState, useEffect } from "react";
import { Search, X, ChevronDown, ChevronRight, FileText } from "lucide-react";

import { PROTOCOL_SELECTIONS } from "@/protocols";
import { subscribeToCustomSchemas, getCustomSchemas } from "@/constructor/utils/protocolRegistry";
import type { ProtocolSchema } from "@/constructor/schema";

interface LeftSidePanelProps {
  activeSection: string;
  selectedStudy: string;
  onStudySelect: (study: string) => void;
  isMultiSelectMode?: boolean;
  selectedStudies?: string[];
  onToggleStudy?: (study: string) => void;
  selectedDirectoryItem?: string;
  onDirectoryItemSelect?: (item: string) => void;
}

const directoryItems = [
  "TI-RADS",
  "BI-RADS",
  "O-RADS",
  "Размеры щитовидной железы",
  "Нормы ОБП",
  "Нормы почек",
  "Размеры молочных желез",
];

const obpNormsSubItems = [
  "Нормы ОБП:Печень",
  "Нормы ОБП:Желчный пузырь",
  "Нормы ОБП:Поджелудочная железа",
  "Нормы ОБП:Селезенка",
];

const obpNormsLabels: Record<string, string> = {
  "Нормы ОБП:Печень": "Печень",
  "Нормы ОБП:Желчный пузырь": "Желчный пузырь",
  "Нормы ОБП:Поджелудочная железа": "Поджелудочная железа",
  "Нормы ОБП:Селезенка": "Селезенка",
};

function getStudiesList(customSchemas: ProtocolSchema[]): string[] {
  const builtIn = PROTOCOL_SELECTIONS.map((protocol) => protocol.label);
  const custom = customSchemas.map((s) => s.selectionLabel);
  return [...builtIn, ...custom];
}

const LeftSidePanel: React.FC<LeftSidePanelProps> = ({
  activeSection,
  selectedStudy,
  onStudySelect,
  isMultiSelectMode = false,
  selectedStudies = [],
  onToggleStudy,
  selectedDirectoryItem = "",
  onDirectoryItemSelect,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isObpNormsExpanded, setIsObpNormsExpanded] = useState(false);
  const [studiesList, setStudiesList] = useState<string[]>(() =>
    getStudiesList(getCustomSchemas())
  );

  useEffect(() => {
    return subscribeToCustomSchemas((schemas) => {
      setStudiesList(getStudiesList(schemas));
    });
  }, []);

  const handleStudyClick = (study: string) => {
    if (isMultiSelectMode && onToggleStudy) {
      onToggleStudy(study);
      return;
    }
    onStudySelect(study);
  };

  const handleItemClick = (item: string) => {
    if (activeSection === "directory" && onDirectoryItemSelect) {
      onDirectoryItemSelect(item);
      return;
    }
    handleStudyClick(item);
  };

  const isStudySelected = (study: string) => {
    if (activeSection === "directory") {
      if (study === "Нормы ОБП") {
        return (
          selectedDirectoryItem === "Нормы ОБП" ||
          selectedDirectoryItem.startsWith("Нормы ОБП:")
        );
      }
      return selectedDirectoryItem === study;
    }
    if (isMultiSelectMode) {
      return selectedStudies.includes(study);
    }
    return selectedStudy === study;
  };

  const filteredStudies = useMemo(() => {
    if (!searchQuery.trim()) return studiesList;
    const query = searchQuery.toLowerCase();
    return studiesList.filter((study) => study.toLowerCase().includes(query));
  }, [searchQuery]);

  const filteredDirectoryItems = useMemo(() => {
    if (!searchQuery.trim()) return directoryItems;
    const query = searchQuery.toLowerCase();
    return directoryItems.filter((item) => {
      if (item.toLowerCase().includes(query)) return true;
      if (item === "Нормы ОБП") {
        return obpNormsSubItems.some((subItem) =>
          obpNormsLabels[subItem].toLowerCase().includes(query)
        );
      }
      return false;
    });
  }, [searchQuery]);

  const filteredObpNormsSubItems = useMemo(() => {
    if (!searchQuery.trim()) return obpNormsSubItems;
    const query = searchQuery.toLowerCase();
    return obpNormsSubItems.filter((subItem) =>
      obpNormsLabels[subItem].toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const clearSearch = () => setSearchQuery("");

  const isUziSection = activeSection === "uzi-protocols";
  const isDirectorySection = activeSection === "directory";
  const showSearch = isUziSection || isDirectorySection;

  const menuItemBase = (selected: boolean) =>
    `relative flex items-center gap-3 px-3 py-2.5 rounded-[8px] text-left transition-all duration-200 text-sm font-sans w-full ${
      selected
        ? "bg-[#e0f2f7] text-[#0e7490] font-medium"
        : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
    }`;

  const iconClass = (selected: boolean) =>
    `shrink-0 transition-colors duration-200 ${
      selected ? "text-[#0e7490]" : "text-slate-400"
    }`;

  return (
    <aside className="w-[15%] rounded-xl sticky top-[104px] max-h-[calc(100vh-104px)] overflow-y-auto flex flex-col">
      {/* Поиск */}
      {showSearch && (
        <div className="px-4 pt-12 pb-2">
          <div className="relative">
            <Search
              size={14}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <input
              type="text"
              placeholder={
                isUziSection ? "Поиск исследований..." : "Поиск в справочнике..."
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-8 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 text-slate-700 placeholder-slate-400
                focus:outline-none focus:ring-2 focus:ring-medical-200 focus:border-medical-400 focus:bg-white
                transition-all duration-200"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={14} />
              </button>
            )}
          </div>
          {searchQuery && (
            <div className="mt-1 text-[11px] text-slate-400">
              {isUziSection
                ? `Найдено: ${filteredStudies.length} из ${studiesList.length}`
                : `Найдено: ${filteredDirectoryItems.length} из ${directoryItems.length}`}
            </div>
          )}
        </div>
      )}

      {/* Список исследований */}
      <nav className="flex-1 overflow-y-auto px-3 py-2">
        {isUziSection && (
          <div className="flex flex-col gap-0.5">
            {filteredStudies.length > 0 ? (
              filteredStudies.map((study) => {
                const selected = isStudySelected(study);

                return (
                  <button
                    key={study}
                    type="button"
                    onClick={() => handleStudyClick(study)}
                    className={menuItemBase(selected)}
                  >
                    <FileText size={15} className={iconClass(selected)} />
                    <span className="flex-1 leading-tight text-left">{study}</span>
                  </button>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                <Search size={32} className="text-slate-300 mb-2" />
                <p className="text-sm text-slate-400 font-medium">
                  Ничего не найдено
                </p>
                <p className="text-xs text-slate-300 mt-1">
                  Попробуйте изменить запрос
                </p>
              </div>
            )}
          </div>
        )}

        {/* Справочник */}
        {isDirectorySection && (
          <div className="flex flex-col gap-0.5">
            {filteredDirectoryItems.length > 0 ? (
              filteredDirectoryItems.map((item) => {
                const selected = isStudySelected(item);
                const isObpNormsItem = item === "Нормы ОБП";
                const showObpSubItems =
                  isObpNormsItem && (isObpNormsExpanded || !!searchQuery.trim());

                return (
                  <div key={item}>
                    <button
                      type="button"
                      onClick={() => {
                        if (isObpNormsItem) {
                          setIsObpNormsExpanded((prev) => !prev);
                        }
                        handleItemClick(item);
                      }}
                      className={menuItemBase(selected)}
                    >
                      <FileText size={15} className={iconClass(selected)} />
                      <span className="flex-1 leading-tight text-left">{item}</span>

                      {isObpNormsItem && (
                        <span className="text-slate-400 shrink-0">
                          {showObpSubItems ? (
                            <ChevronDown size={14} />
                          ) : (
                            <ChevronRight size={14} />
                          )}
                        </span>
                      )}
                    </button>

                    {showObpSubItems && filteredObpNormsSubItems.length > 0 && (
                      <div className="ml-3 mt-0.5 space-y-0.5 border-l-2 border-medical-100 pl-2">
                        {filteredObpNormsSubItems.map((subItem) => {
                          const subItemSelected = selectedDirectoryItem === subItem;

                          return (
                            <button
                              key={subItem}
                              type="button"
                              onClick={() => handleItemClick(subItem)}
                              className={menuItemBase(subItemSelected)}
                            >
                              <FileText size={14} className={iconClass(subItemSelected)} />
                              <span className="leading-tight">
                                {obpNormsLabels[subItem]}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                <Search size={32} className="text-slate-300 mb-2" />
                <p className="text-sm text-slate-400 font-medium">
                  Ничего не найдено
                </p>
                <p className="text-xs text-slate-300 mt-1">
                  Попробуйте изменить запрос
                </p>
              </div>
            )}
          </div>
        )}
      </nav>
    </aside>
  );
};

export default LeftSidePanel;
