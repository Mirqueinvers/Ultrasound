// src/renderer/components/Statistics.tsx

import React, { useState, useEffect } from "react";
import { BarChart3, Users, FileText, Calendar, DollarSign, Filter } from "lucide-react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface StatisticsData {
  totalPatients: number;
  totalResearches: number;
  totalStudies: number;
  researchesInPeriod: number;
  patientsInPeriod: number;
  studiesInPeriod: number;
  paymentStats: {
    oms: number;
    paid: number;
  };
  studiesByType: { [key: string]: number };
  monthlyResearches: { month: string; count: number }[];
  recentActivity: {
    date: string;
    patientName: string;
    studyType: string;
  }[];
  doctorsStats: {
    doctorName: string;
    patientCount: number;
    researchCount: number;
  }[];
}

const Statistics: React.FC = () => {
  const [stats, setStats] = useState<StatisticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Функция для форматирования даты в локальном времени (без UTC смещения)
  const formatLocalDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const [startDate, setStartDate] = useState(() => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    return formatLocalDate(firstDay);
  });
  const [endDate, setEndDate] = useState(() => {
    const now = new Date();
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return formatLocalDate(lastDay);
  });

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await window.databaseAPI.getStatistics(
        startDate || undefined,
        endDate || undefined
      );

      if (result && result.success && result.data) {
        setStats(result.data);
      } else {
        setError(result?.message || "Ошибка при загрузке статистики");
      }
    } catch (err) {
      setError("Ошибка при загрузке статистики");
      console.error("Statistics loading error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePeriodChange = () => {
    loadStatistics();
  };

  const setCurrentMonth = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    setStartDate(formatLocalDate(firstDay));
    setEndDate(formatLocalDate(lastDay));
    setTimeout(loadStatistics, 100);
  };

  const setLastMonth = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth(), 0);
    setStartDate(formatLocalDate(firstDay));
    setEndDate(formatLocalDate(lastDay));
    setTimeout(loadStatistics, 100);
  };

  const setCurrentYear = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), 0, 1);
    const lastDay = new Date(now.getFullYear(), 11, 31);
    setStartDate(formatLocalDate(firstDay));
    setEndDate(formatLocalDate(lastDay));
    setTimeout(loadStatistics, 100);
  };

  const clearFilter = () => {
    setStartDate("");
    setEndDate("");
    setTimeout(loadStatistics, 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Загрузка статистики...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="text-red-700">{error}</div>
        <button
          onClick={loadStatistics}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Повторить
        </button>
      </div>
    );
  }

  if (!stats) return null;

  const StatCard: React.FC<{
    title: string;
    value: number | string;
    icon: React.ElementType;
    color: string;
    size?: "normal" | "small";
  }> = ({ title, value, icon: Icon, color, size = "normal" }) => {
    const cardClasses =
      size === "small"
        ? "bg-white rounded-lg border border-gray-200 p-3 shadow-sm"
        : "bg-white rounded-lg border border-gray-200 p-6 shadow-sm";

    const valueClasses =
      size === "small"
        ? "text-xl font-bold text-gray-900 mt-1"
        : "text-3xl font-bold text-gray-900 mt-2";

    const iconClasses =
      size === "small" ? "w-4 h-4 text-white" : "w-6 h-6 text-white";

    return (
      <div className={cardClasses}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-600">{title}</p>
            <p className={valueClasses}>{value}</p>
          </div>
          <div className={`p-2 rounded-full ${color}`}>
            <Icon className={iconClasses} />
          </div>
        </div>
      </div>
    );
  };

  const doctorsChartData = {
    labels: stats?.doctorsStats.map((doc) => doc.doctorName) || [],
    datasets: [
      {
        label: "Количество исследований",
        data: stats?.doctorsStats.map((doc) => doc.researchCount) || [],
        backgroundColor: "rgba(59, 130, 246, 0.5)",
        borderColor: "rgba(59, 130, 246, 1)",
        borderWidth: 1,
      },
      {
        label: "Количество пациентов",
        data: stats?.doctorsStats.map((doc) => doc.patientCount) || [],
        backgroundColor: "rgba(16, 185, 129, 0.5)",
        borderColor: "rgba(16, 185, 129, 1)",
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Статистика по врачам",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Статистика</h1>
        <button
          onClick={loadStatistics}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Обновить
        </button>
      </div>

      {/* Фильтр по периоду */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center gap-4 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Период</h3>
        </div>
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Дата начала
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Дата окончания
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handlePeriodChange}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Применить
            </button>
            <button
              onClick={setCurrentMonth}
              className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Текущий месяц
            </button>
            <button
              onClick={setLastMonth}
              className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Прошлый месяц
            </button>
            <button
              onClick={setCurrentYear}
              className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Текущий год
            </button>
          </div>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {startDate && endDate
              ? `Период: с ${formatLocalDate(new Date(startDate))} по ${formatLocalDate(new Date(endDate))}`
              : "Вся статистика"}
          </div>
          {(startDate || endDate) && (
            <button
              onClick={clearFilter}
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              Очистить фильтр
            </button>
          )}
        </div>
      </div>

      {/* Маленькие плашки сверху */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Пациентов за период"
          value={stats.patientsInPeriod}
          icon={Users}
          color="bg-blue-500"
          size="small"
        />
        <StatCard
          title="Исследований за период"
          value={stats.researchesInPeriod}
          icon={FileText}
          color="bg-green-500"
          size="small"
        />
        <StatCard
          title="Протоколов за период"
          value={stats.studiesInPeriod}
          icon={BarChart3}
          color="bg-purple-500"
          size="small"
        />
      </div>

      {/* График по врачам */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Статистика по врачам
        </h3>
        {stats && stats.doctorsStats.length > 0 ? (
          <div className="h-80">
            <Bar data={doctorsChartData} options={chartOptions} />
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            Нет данных по врачам за выбранный период
          </div>
        )}
      </div>

      {/* Статистика по оплате и типы исследований */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Статистика по оплате
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <span className="text-blue-700 font-medium">ОМС</span>
              <span className="text-2xl font-bold text-blue-900">
                {stats.paymentStats.oms}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <span className="text-green-700 font-medium">Платные</span>
              <span className="text-2xl font-bold text-green-900">
                {stats.paymentStats.paid}
              </span>
            </div>
            <div className="text-sm text-gray-600 text-center">
              Всего: {stats.paymentStats.oms + stats.paymentStats.paid} исследований
            </div>
          </div>
        </div>

        {/* Типы исследований */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Типы исследований
          </h3>
          <div className="space-y-3">
            {Object.entries(stats.studiesByType).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <span className="text-gray-700 capitalize">
                  {type.replace(/([A-Z])/g, " $1").trim()}
                </span>
                <span className="font-semibold text-gray-900">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Последняя активность */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Последняя активность
        </h3>
        <div className="space-y-3">
          {stats.recentActivity.slice(0, 10).map((activity, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div>
                <div className="font-medium text-gray-900">
                  {activity.patientName}
                </div>
                <div className="text-sm text-gray-600">
                  {activity.studyType} •{" "}
                  {formatLocalDate(new Date(activity.date))}
                </div>
              </div>
            </div>
          ))}
          {stats.recentActivity.length === 0 && (
            <div className="text-gray-500 text-center py-4">
              Нет данных о последней активности
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Statistics;
