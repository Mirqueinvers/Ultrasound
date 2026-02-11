import React from "react";

const ObpPancreasNorms: React.FC = () => (
  <div className="mt-6">
    <h3 className="text-lg font-semibold text-slate-700 mb-4">
      Нормы ОБП: Поджелудочная железа
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
            <td className="px-4 py-3 border-b">Головка</td>
            <td className="px-4 py-3 border-b">до 30-35 мм</td>
          </tr>
          <tr>
            <td className="px-4 py-3 border-b">Тело</td>
            <td className="px-4 py-3 border-b">до 20-25 мм</td>
          </tr>
          <tr>
            <td className="px-4 py-3 border-b">Хвост</td>
            <td className="px-4 py-3 border-b">до 30 мм</td>
          </tr>
          <tr>
            <td className="px-4 py-3 border-b">Контуры</td>
            <td className="px-4 py-3 border-b">ровные, четкие</td>
          </tr>
          <tr>
            <td className="px-4 py-3 border-b">Эхоструктура</td>
            <td className="px-4 py-3 border-b">однородная, мелкозернистая</td>
          </tr>
          <tr>
            <td className="px-4 py-3 border-b">Эхогенность</td>
            <td className="px-4 py-3 border-b">сопоставима или немного выше печени</td>
          </tr>
          <tr>
            <td className="px-4 py-3">Вирсунгов проток</td>
            <td className="px-4 py-3">до 2 мм</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
      <p className="text-sm text-slate-600">
        В норме очаговые изменения и парапанкреатическая жидкость не визуализируются.
      </p>
    </div>
  </div>
);

export default ObpPancreasNorms;
