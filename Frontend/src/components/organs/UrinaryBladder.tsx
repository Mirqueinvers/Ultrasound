import React from 'react';

export interface UrinaryBladderProtocol {
  volume: string;
  wallThickness: string;
  wallStructure: string;
  contents: string;
  ureteralOrifices: string;
  additional: string;
  conclusion: string;
}

interface UrinaryBladderProps {
  value?: UrinaryBladderProtocol;
  onChange?: (value: UrinaryBladderProtocol) => void;
}

const UrinaryBladder: React.FC<UrinaryBladderProps> = ({ value, onChange }) => {
  const handleChange = (field: keyof UrinaryBladderProtocol, newValue: string) => {
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
        Мочевой пузырь
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Объем (мл)
          </label>
          <input
            type="text"
            value={value?.volume || ''}
            onChange={(e) => handleChange('volume', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="200-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Толщина стенки (мм)
          </label>
          <input
            type="text"
            value={value?.wallThickness || ''}
            onChange={(e) => handleChange('wallThickness', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="3-5"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Структура стенки
          </label>
          <select
            value={value?.wallStructure || ''}
            onChange={(e) => handleChange('wallStructure', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Выберите</option>
            <option value="равномерная">Равномерная</option>
            <option value="неравномерная">Неравномерная</option>
            <option value="утолщенная">Утолщенная</option>
            <option value="истонченная">Истонченная</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Содержимое
          </label>
          <select
            value={value?.contents || ''}
            onChange={(e) => handleChange('contents', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Выберите</option>
            <option value="анэхогенное">Анэхогенное</option>
            <option value="гиперэхогенное">Гиперэхогенное</option>
            <option value="с осадком">С осадком</option>
            <option value="с взвесью">Со взвесью</option>
            <option value="пустой">Пустой</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Устья мочеточников
          </label>
          <input
            type="text"
            value={value?.ureteralOrifices || ''}
            onChange={(e) => handleChange('ureteralOrifices', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="визуализируются"
          />
        </div>

        <div className="md:col-span-3">
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
            placeholder="Заключение по мочевому пузырю..."
          />
        </div>
      </div>
    </div>
  );
};

export default UrinaryBladder;