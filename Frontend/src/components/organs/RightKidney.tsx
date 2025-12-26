import React from 'react';

export interface RightKidneyProtocol {
  length: string;
  width: string;
  thickness: string;
  echogenicity: string;
  echostructure: string;
  contours: string;
  pathologicalFormations: string;
  pathologicalFormationsText: string;
  renalSinus: string;
  renalArtery: string;
  renalVein: string;
  additional: string;
  conclusion: string;
}

interface RightKidneyProps {
  value?: RightKidneyProtocol;
  onChange?: (value: RightKidneyProtocol) => void;
}

const RightKidney: React.FC<RightKidneyProps> = ({ value, onChange }) => {
  const handleChange = (field: keyof RightKidneyProtocol, newValue: string) => {
    if (onChange) {
      onChange({
        ...value!,
        [field]: newValue,
      });
    }
  };

  return (
    <div>
      <h3 className="text-lg font-semibold text-slate-800 mb-4">
        Правая почка
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Длина (мм)
          </label>
          <input
            type="text"
            value={value?.length || ''}
            onChange={(e) => handleChange('length', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="100-120"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Ширина (мм)
          </label>
          <input
            type="text"
            value={value?.width || ''}
            onChange={(e) => handleChange('width', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="50-60"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Толщина (мм)
          </label>
          <input
            type="text"
            value={value?.thickness || ''}
            onChange={(e) => handleChange('thickness', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="40-50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Эхогенность
          </label>
          <select
            value={value?.echogenicity || ''}
            onChange={(e) => handleChange('echogenicity', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Выберите</option>
            <option value="нормальная">Нормальная</option>
            <option value="повышенная">Повышенная</option>
            <option value="пониженная">Пониженная</option>
            <option value="неоднородная">Неоднородная</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Эхоструктура
          </label>
          <select
            value={value?.echostructure || ''}
            onChange={(e) => handleChange('echostructure', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Выберите</option>
            <option value="однородная">Однородная</option>
            <option value="неоднородная">Неоднородная</option>
            <option value="смешанная">Смешанная</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Контуры
          </label>
          <select
            value={value?.contours || ''}
            onChange={(e) => handleChange('contours', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Выберите</option>
            <option value="ровные">Ровные</option>
            <option value="неровные">Неровные</option>
            <option value="четкие">Четкие</option>
            <option value="нечеткие">Нечеткие</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Патологические образования
          </label>
          <select
            value={value?.pathologicalFormations || ''}
            onChange={(e) => handleChange('pathologicalFormations', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Не определяются">Не определяются</option>
            <option value="Определяются">Определяются</option>
          </select>
        </div>

        {value?.pathologicalFormations === 'Определяются' && (
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Описание патологических образований
            </label>
            <textarea
              value={value?.pathologicalFormationsText || ''}
              onChange={(e) => handleChange('pathologicalFormationsText', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Описание образований..."
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Почечный синус
          </label>
          <input
            type="text"
            value={value?.renalSinus || ''}
            onChange={(e) => handleChange('renalSinus', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="без особенностей"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Почечная артерия
          </label>
          <input
            type="text"
            value={value?.renalArtery || ''}
            onChange={(e) => handleChange('renalArtery', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="кровоток сохранен"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Почечная вена
          </label>
          <input
            type="text"
            value={value?.renalVein || ''}
            onChange={(e) => handleChange('renalVein', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="кровоток сохранен"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Дополнительные данные
          </label>
          <textarea
            value={value?.additional || ''}
            onChange={(e) => handleChange('additional', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={2}
            placeholder="Дополнительная информация..."
          />
        </div>

        <div className="md:col-span-3">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Заключение
          </label>
          <textarea
            value={value?.conclusion || ''}
            onChange={(e) => handleChange('conclusion', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={2}
            placeholder="Заключение по правой почке..."
          />
        </div>
      </div>
    </div>
  );
};

export default RightKidney;