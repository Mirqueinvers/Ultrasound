import React from "react";

const Tirads: React.FC = () => (

    <div className="mt-6">
      <h3 className="text-lg font-semibold text-slate-700 mb-4">Классификация ACR-TIRADS</h3>
        
      <div className="mb-8">
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-slate-200 rounded-lg">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider border-b">Категория</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider border-b">Характеристика</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider border-b">Количество баллов</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider border-b">Риск злокачественности</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider border-b">Показания к биопсии</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-slate-500 border-b">TIRADS 1</td>
                <td className="px-4 py-3 text-sm text-slate-600 border-b">Нет узлов в щитовидной железе</td>
                <td className="px-4 py-3 text-sm text-slate-600 border-b">0 баллов</td>
                <td className="px-4 py-3 text-sm text-slate-600 border-b">0%</td>
                <td className="px-4 py-3 text-sm text-slate-600 border-b">Не требуется</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-green-600 border-b">TIRADS 2</td>
                <td className="px-4 py-3 text-sm text-slate-600 border-b">Доброкачественные узлы</td>
                <td className="px-4 py-3 text-sm text-slate-600 border-b">1-2 балла</td>
                <td className="px-4 py-3 text-sm text-slate-600 border-b">0-2%</td>
                <td className="px-4 py-3 text-sm text-slate-600 border-b">Не требуется</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-yellow-600 border-b">TIRADS 3</td>
                <td className="px-4 py-3 text-sm text-slate-600 border-b">Сомнительные узлы (вероятно доброкачественные)</td>
                <td className="px-4 py-3 text-sm text-slate-600 border-b">3 балла</td>
                <td className="px-4 py-3 text-sm text-slate-600 border-b">2-5%</td>
                <td className="px-4 py-3 text-sm text-slate-600 border-b">При размере &gt; 25 мм</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-orange-500 border-b">TIRADS 4a</td>
                <td className="px-4 py-3 text-sm text-slate-600 border-b">Умеренно подозрительные узлы</td>
                <td className="px-4 py-3 text-sm text-slate-600 border-b">4 балла</td>
                <td className="px-4 py-3 text-sm text-slate-600 border-b">5-10%</td>
                <td className="px-4 py-3 text-sm text-slate-600 border-b">При размере &gt; 15 мм</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-orange-600 border-b">TIRADS 4b</td>
                <td className="px-4 py-3 text-sm text-slate-600 border-b">Умеренно подозрительные узлы</td>
                <td className="px-4 py-3 text-sm text-slate-600 border-b">5 баллов</td>
                <td className="px-4 py-3 text-sm text-slate-600 border-b">10-20%</td>
                <td className="px-4 py-3 text-sm text-slate-600 border-b">При размере &gt; 15 мм</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-orange-700 border-b">TIRADS 4c</td>
                <td className="px-4 py-3 text-sm text-slate-600 border-b">Умеренно подозрительные узлы</td>
                <td className="px-4 py-3 text-sm text-slate-600 border-b">6 баллов</td>
                <td className="px-4 py-3 text-sm text-slate-600 border-b">20-80%</td>
                <td className="px-4 py-3 text-sm text-slate-600 border-b">При размере &gt; 10 мм</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-red-600">TIRADS 5</td>
                <td className="px-4 py-3 text-sm text-slate-600">Высоко подозрительные узлы</td>
                <td className="px-4 py-3 text-sm text-slate-600">7 и более баллов</td>
                <td className="px-4 py-3 text-sm text-slate-600">26-87%</td>
                <td className="px-4 py-3 text-sm text-slate-600">При размере &gt; 10 мм</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="mb-6">
        <h4 className="text-md font-medium text-slate-600 mb-3">Бальная система ACR TI-RADS</h4>
        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
          <p className="text-sm text-slate-600 mb-3">
            В системе ACR TI-RADS каждый ультразвуковой признак оценивается в баллах, которые затем суммируются для определения категории:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h5 className="text-sm font-medium text-slate-700 mb-2">Структура:</h5>
              <ul className="text-sm text-slate-600 space-y-1">
                <li>• Кистозный или почти полностью кистозный: 0 баллов</li>
                <li>• Спонгиозный: 0 баллов</li>
                <li>• Кистозно-солидный: 1 балл</li>
                <li>• Солидный или почти полностью солидный: 2 балла</li>
              </ul>
            </div>
            <div>
              <h5 className="text-sm font-medium text-slate-700 mb-2">Эхогенность:</h5>
              <ul className="text-sm text-slate-600 space-y-1">
                <li>• Анэхогенный: 0 баллов</li>
                <li>• Гипер- или Изоэхогенный: 1 балл</li>
                <li>• Гипоэхогенный: 2 балла</li>
                <li>• Выраженно гипоэхогенный: 3 балла</li>
              </ul>
            </div>
            <div>
              <h5 className="text-sm font-medium text-slate-700 mb-2">Форма:</h5>
              <ul className="text-sm text-slate-600 space-y-1">
                <li>• Шире, чем выше: 0 баллов</li>
                <li>• Выше, чем шире: 3 балла</li>
              </ul>
            </div>
            <div>
              <h5 className="text-sm font-medium text-slate-700 mb-2">Контуры:</h5>
              <ul className="text-sm text-slate-600 space-y-1">
                <li>• Ровные: 0 баллов</li>
                <li>• Нечеткие: 0 баллов</li>
                <li>• Неровные или дольчатые: 2 балла</li>
                <li>• Экстра-тиреоидальное распространение: 3 балла</li>
              </ul>
            </div>
          </div>
          <div className="mt-4">
            <h5 className="text-sm font-medium text-slate-700 mb-2">Эхогенные включения:</h5>
            <ul className="text-sm text-slate-600 space-y-1">
              <li>• Нет: 0 баллов</li>
              <li>• Артефакт хвоста кометы: 0 баллов</li>
              <li>• Макрокальцинаты: 1 балл</li>
              <li>• Периферические/краевые кальцинаты: 2 балла</li>
              <li>• Микрокальцинаты: 3 балла</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mb-6">
  <h4 className="text-md font-medium text-slate-600 mb-3">Примечания</h4>

  <div className="overflow-x-auto">
    <table className="min-w-full bg-white border border-slate-200 rounded-lg text-sm text-slate-700">
      <thead className="bg-slate-50 font-medium">
        <tr>
          <th className="px-4 py-3 border">Состав</th>
          <th className="px-4 py-3 border">Эхогенность</th>
          <th className="px-4 py-3 border">Положение</th>
          <th className="px-4 py-3 border">Граница</th>
          <th className="px-4 py-3 border">Включения</th>
        </tr>
      </thead>

      <tbody>
        <tr className="align-top">
          <td className="px-4 py-3 border whitespace-pre-line">
      {`Микрокистозный (губчатый):
      преимущественно состоит (>50%) из
      небольших кистозных пространств.
      Не добавлять дополнительные баллы
      следующих категорий.

      Смешанные – кистозные и тканевые:
      назначать баллы для преобладающего
      тканевого компонента.

      Назначьте 2 балла, если состав не
      может быть определен из-за
      кальцификации.`}
                </td>

                <td className="px-4 py-3 border whitespace-pre-line">
      {`Анэхогенный: применяется к кистозным
      или почти полностью кистозным узлам.

      Гиперэхогенная / изоэхогенная /
      гипоэхогенная: в сравнении с
      прилегающей паренхимой.

      Очень гипоэхогенная: более
      гипоэхогенная, чем мышцы.

      Присвойте 1 балл, если эхогенность не
      может быть определена.`}
                </td>

                <td className="px-4 py-3 border whitespace-pre-line">
      {`«Выше, чем шире»: следует оценивать
      на поперечном изображении с
      измерениями, параллельными
      направлению ультразвука (по высоте)
      и перпендикулярно (по ширине).

      Обычно отношение размеров узла
      можно оценить зрительно.`}
                </td>

                <td className="px-4 py-3 border whitespace-pre-line">
      {`Волнистость: Выпуклости в
      прилегающие ткани.

      Неровномерный: острые и иные
      выступы ткани из узла.

      Расширение щитовидной железы:
      очевидное выступание за границу
      железы — злокачественная опухоль.

      Присвойте 0 баллов, если невозможно
      определить границу.`}
                </td>

                <td className="px-4 py-3 border whitespace-pre-line">
      {`Крупные артефакты с «хвостом
      кометы»: V-образные >1 мм, в
      кистозных компонентах.

      Макрокальцинаты: вызывают
      акустическое затенение.

      Периферические: полностью или
      частично вдоль края.

      Точечные эхогенные очаги: могут
      иметь небольшие артефакты с «хвостом
      кометы».`}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>


      <div className="mb-6">
        <h4 className="text-md font-medium text-slate-600 mb-3">Основные ультразвуковые признаки злокачественности</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <h5 className="text-sm font-medium text-red-800 mb-2">Признаки высокого риска:</h5>
            <ul className="text-sm text-red-700 space-y-1">
              <li>• Выраженная гипоэхогенность</li>
              <li>• Микрокальцинаты</li>
              <li>• Неровные, фестончатые контуры</li>
              <li>• Высота больше ширины в поперечном срезе</li>
              <li>• Наличие локальной болезненности при компрессии датчиком</li>
            </ul>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h5 className="text-sm font-medium text-blue-800 mb-2">Признаки доброкачественности:</h5>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Кистозное строение</li>
              <li>• Спонгиозное строение</li>
              <li>• Частично кистозное строение</li>
              <li>• Периферическое кровоснабжение</li>
              <li>• Тонкая эхогенная капсула</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
);

export default Tirads;


