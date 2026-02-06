import React from "react";

const Birads: React.FC = () => (
  <div className="mt-6">
    <h3 className="text-lg font-semibold text-slate-700 mb-4">Классификация BI-RADS</h3>

    <div className="mb-8">
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-slate-200 rounded-lg">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider border-b">Категория</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider border-b">Краткое описание</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider border-b">Риск злокачественности</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider border-b">Рекомендации</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            <tr>
              <td className="px-4 py-3 text-sm font-medium text-slate-500 border-b">BI-RADS 0</td>
              <td className="px-4 py-3 text-sm text-slate-600 border-b">Исследование неполное, требуется дообследование или сравнение с предыдущими</td>
              <td className="px-4 py-3 text-sm text-slate-600 border-b">Не определена</td>
              <td className="px-4 py-3 text-sm text-slate-600 border-b">Дополнительная визуализация</td>
            </tr>
            <tr>
              <td className="px-4 py-3 text-sm font-medium text-green-600 border-b">BI-RADS 1</td>
              <td className="px-4 py-3 text-sm text-slate-600 border-b">Норма, патологических изменений нет</td>
              <td className="px-4 py-3 text-sm text-slate-600 border-b">≈ 0%</td>
              <td className="px-4 py-3 text-sm text-slate-600 border-b">Рутинный скрининг</td>
            </tr>
            <tr>
              <td className="px-4 py-3 text-sm font-medium text-green-600 border-b">BI-RADS 2</td>
              <td className="px-4 py-3 text-sm text-slate-600 border-b">Доброкачественные находки</td>
              <td className="px-4 py-3 text-sm text-slate-600 border-b">≈ 0%</td>
              <td className="px-4 py-3 text-sm text-slate-600 border-b">Рутинный скрининг</td>
            </tr>
            <tr>
              <td className="px-4 py-3 text-sm font-medium text-yellow-600 border-b">BI-RADS 3</td>
              <td className="px-4 py-3 text-sm text-slate-600 border-b">Вероятно доброкачественные изменения</td>
              <td className="px-4 py-3 text-sm text-slate-600 border-b">≤ 2%</td>
              <td className="px-4 py-3 text-sm text-slate-600 border-b">Краткосрочное наблюдение (обычно 3–6 мес.)</td>
            </tr>
            <tr>
              <td className="px-4 py-3 text-sm font-medium text-orange-500 border-b">BI-RADS 4A</td>
              <td className="px-4 py-3 text-sm text-slate-600 border-b">Низкая степень подозрения</td>
              <td className="px-4 py-3 text-sm text-slate-600 border-b">2–10%</td>
              <td className="px-4 py-3 text-sm text-slate-600 border-b">Биопсия (морфологическая верификация)</td>
            </tr>
            <tr>
              <td className="px-4 py-3 text-sm font-medium text-orange-600 border-b">BI-RADS 4B</td>
              <td className="px-4 py-3 text-sm text-slate-600 border-b">Умеренная степень подозрения</td>
              <td className="px-4 py-3 text-sm text-slate-600 border-b">10–50%</td>
              <td className="px-4 py-3 text-sm text-slate-600 border-b">Биопсия (морфологическая верификация)</td>
            </tr>
            <tr>
              <td className="px-4 py-3 text-sm font-medium text-orange-700 border-b">BI-RADS 4C</td>
              <td className="px-4 py-3 text-sm text-slate-600 border-b">Высокая степень подозрения</td>
              <td className="px-4 py-3 text-sm text-slate-600 border-b">50–95%</td>
              <td className="px-4 py-3 text-sm text-slate-600 border-b">Биопсия (морфологическая верификация)</td>
            </tr>
            <tr>
              <td className="px-4 py-3 text-sm font-medium text-red-600 border-b">BI-RADS 5</td>
              <td className="px-4 py-3 text-sm text-slate-600 border-b">Высокая вероятность рака</td>
              <td className="px-4 py-3 text-sm text-slate-600 border-b">&gt; 95%</td>
              <td className="px-4 py-3 text-sm text-slate-600 border-b">Срочная верификация и лечение</td>
            </tr>
            <tr>
              <td className="px-4 py-3 text-sm font-medium text-red-700">BI-RADS 6</td>
              <td className="px-4 py-3 text-sm text-slate-600">Морфологически подтвержденный рак</td>
              <td className="px-4 py-3 text-sm text-slate-600">Известно</td>
              <td className="px-4 py-3 text-sm text-slate-600">План лечения/стадирование</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div className="mb-6">
      <h4 className="text-md font-medium text-slate-600 mb-3">Ключевые идеи BI-RADS</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
          <h5 className="text-sm font-medium text-slate-700 mb-2">Цель системы</h5>
          <p className="text-sm text-slate-600">
            BI-RADS стандартизирует язык описания маммографии, УЗИ и МРТ молочных желез и
            связывает категорию с дальнейшей тактикой ведения.
          </p>
        </div>
        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
          <h5 className="text-sm font-medium text-slate-700 mb-2">Категории 4A–4C</h5>
          <p className="text-sm text-slate-600">
            Категория 4 делится на подкатегории с разной степенью подозрения, но во всех
            случаях требуется морфологическая верификация.
          </p>
        </div>
      </div>
    </div>
  </div>
);

export default Birads;
