import React from "react";

const ObpLiverNorms: React.FC = () => (
  <div className="mt-6">
    <h3 className="text-lg font-semibold text-slate-700 mb-4">
      Нормы ОБП: Печень
    </h3>

    <div className="overflow-x-auto mb-6">
      <table className="min-w-full bg-white border border-slate-200 rounded-lg">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider border-b">
              Параметр
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider border-b">
              Норма (взрослые)
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 text-sm text-slate-600">
          <tr>
            <td className="px-4 py-3 border-b">Правая доля (ККР)</td>
            <td className="px-4 py-3 border-b">до 150 мм</td>
          </tr>
          <tr>
            <td className="px-4 py-3 border-b">Левая доля (толщина)</td>
            <td className="px-4 py-3 border-b">до 70 мм</td>
          </tr>
          <tr>
            <td className="px-4 py-3 border-b">Левая доля (КК размер)</td>
            <td className="px-4 py-3 border-b">до 100 мм</td>
          </tr>
          <tr>
            <td className="px-4 py-3 border-b">Контуры</td>
            <td className="px-4 py-3 border-b">ровные, четкие</td>
          </tr>
          <tr>
            <td className="px-4 py-3 border-b">Эхоструктура</td>
            <td className="px-4 py-3 border-b">однородная</td>
          </tr>
          <tr>
            <td className="px-4 py-3 border-b">Эхогенность</td>
            <td className="px-4 py-3 border-b">средняя</td>
          </tr>
          <tr>
            <td className="px-4 py-3 border-b">Портальная вена</td>
            <td className="px-4 py-3 border-b">до 13 мм</td>
          </tr>
          <tr>
            <td className="px-4 py-3">Нижняя полая вена</td>
            <td className="px-4 py-3">до 20 мм</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
      <p className="text-sm text-slate-600">
        Дополнительно при описании нормы: очаговые образования не визуализируются,
        внутрипеченочные желчные протоки не расширены.
      </p>
    </div>
  </div>
);

export default ObpLiverNorms;
