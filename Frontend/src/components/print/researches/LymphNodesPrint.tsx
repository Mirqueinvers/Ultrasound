// Frontend/src/components/print/researches/LymphNodesPrint.tsx
import React from "react";
import { useResearch } from "@contexts";
import LymphNodesPrint from "@/components/print/organs/LymphNodesPrint";
import type { LymphNodesProtocol } from "@types";

export const LymphNodesResearchPrint: React.FC = () => {
  const { studiesData } = useResearch();

  // Пробуем разные варианты ключей и структур данных
  const lymphNodesData = studiesData["Лимфатические узлы"] || 
                        studiesData["Лимфоузлы"] || 
                        studiesData["lymphNodes"];
  
  // Проверяем разные возможные структуры данных
  let lymphNodesProtocol: LymphNodesProtocol | undefined;
  
  if (lymphNodesData) {
    if (lymphNodesData.lymphNodes) {
      // Стандартная структура: { lymphNodes: {...} }
      lymphNodesProtocol = lymphNodesData.lymphNodes as LymphNodesProtocol;
    } else {
      // Альтернативная структура: данные находятся напрямую в объекте
      lymphNodesProtocol = lymphNodesData as LymphNodesProtocol;
    }
  }

  // Проверяем наличие данных исследования и протокола лимфоузлов
  if (!lymphNodesData || !lymphNodesProtocol) {
    return null;
  }

  return (
    <>
      <p className="mt-4 mb-2 text-center text-base font-semibold">
        Ультразвуковое исследование периферических лимфатических узлов
      </p>

      <LymphNodesPrint value={lymphNodesProtocol} />
    </>
  );
};

export default LymphNodesResearchPrint;
