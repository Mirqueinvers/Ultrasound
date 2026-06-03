import React from "react";

const ObpSpleenNorms: React.FC = () => (
  <div className="mt-6">
    <h3 className="text-lg font-semibold text-slate-700 mb-4">
      Нормы ОБП: Селезенка
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
            <td className="px-4 py-3 border-b">Длина</td>
            <td className="px-4 py-3 border-b">до 120 мм</td>
          </tr>
          <tr>
            <td className="px-4 py-3 border-b">Толщина</td>
            <td className="px-4 py-3 border-b">до 50 мм</td>
          </tr>
          <tr>
            <td className="px-4 py-3 border-b">Ширина</td>
            <td className="px-4 py-3 border-b">60-80 мм</td>
          </tr>
          <tr>
            <td className="px-4 py-3 border-b">Площадь продольного сечения</td>
            <td className="px-4 py-3 border-b">до 40-50 см2</td>
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
            <td className="px-4 py-3">Селезеночная вена</td>
            <td className="px-4 py-3">до 8-10 мм</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
      <p className="text-sm text-slate-600">
        В норме дополнительные очаговые образования и свободная жидкость в брюшной
        полости не определяются.
      </p>
    </div>
  </div>
);

export default ObpSpleenNorms;
