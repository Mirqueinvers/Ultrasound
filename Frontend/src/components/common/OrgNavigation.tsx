// Frontend/src/components/common/OrgNavigation.tsx
import React from "react";

export type SectionKey =
  | "ОБП:печень"
  | "ОБП:желчный"
  | "ОБП:поджелудочная"
  | "ОБП:селезёнка"
  | "Почки:правая"
  | "Почки:левая"
  | "Почки:мочевой пузырь"
  | "ОМТ (Ж):матка"
  | "ОМТ (Ж):правый яичник"
  | "ОМТ (Ж):левый яичник"
  | "ОМТ (Ж):мочевой пузырь"
  | "ОМТ (М):простата"
  | "ОМТ (М):мочевой пузырь"
  | "Щитовидная железа:правая доля"
  | "Щитовидная железа:левая доля"
  | "Молочные железы:правая железа"
  | "Молочные железы:левая железа"
  | "Органы мошонки:правое яичко"
  | "Органы мошонки:левое яичко"
  | "Мягкие ткани:основной блок"

export const ORG_LABELS: Record<SectionKey, string> = {
  "ОБП:печень": "Печень",
  "ОБП:желчный": "Желчный пузырь",
  "ОБП:поджелудочная": "Поджелудочная",
  "ОБП:селезёнка": "Селезёнка",
  "Почки:правая": "Почка правая",
  "Почки:левая": "Почка левая",
  "Почки:мочевой пузырь": "Мочевой пузырь",
  "ОМТ (Ж):матка": "Матка",
  "ОМТ (Ж):правый яичник": "Правый яичник",
  "ОМТ (Ж):левый яичник": "Левый яичник",
  "ОМТ (Ж):мочевой пузырь": "Мочевой пузырь",
  "ОМТ (М):простата": "Предстательная железа",
  "ОМТ (М):мочевой пузырь": "Мочевой пузырь",
  "Щитовидная железа:правая доля": "Щитовидка: правая доля",
  "Щитовидная железа:левая доля": "Щитовидка: левая доля",
  "Молочные железы:правая железа": "Грудь: правая",
  "Молочные железы:левая железа": "Грудь: левая",
  "Органы мошонки:правое яичко": "Мошонка: правое яичко",
  "Органы мошонки:левое яичко": "Мошонка: левое яичко",
  "Мягкие ткани:основной блок": "Мягкие ткани",
};


interface OrgNavigationProps {
  availableSectionKeys: SectionKey[];
  scrollToSection: (key: SectionKey) => void;
}

const OrgNavigation: React.FC<OrgNavigationProps> = ({
  availableSectionKeys,
  scrollToSection,
}) => {
  const [isToolbarCollapsed, setIsToolbarCollapsed] =
    React.useState(false);

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
          <span className="text-sm font-bold select-none">
            Навигация
          </span>
        ) : (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
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
                  onClick={(e) => {
                    e.stopPropagation();
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
