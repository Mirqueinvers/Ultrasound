import React, { useState, useEffect } from "react";
import {
  BarChart3,
  Users,
  FileText,
  Calendar,
  DollarSign,
  Filter,
  RefreshCw,
  Activity,
  TrendingUp,
  Stethoscope,
} from "lucide-react";
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

      if (!window.databaseAPI) {
        setError("API статистики недоступно. Возможно, приложение запущено не в Electron.");
        return;
      }

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
      <div className="flex items-center justify-center h-64 animate-fade-in">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-medical-400 border-t-transparent rounded-full animate-spin" />
          <div className="text-sm text-slate-500 font-sans">Загрузка статистики...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="animate-fade-in">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse-soft" />
            <div className="text-red-700 font-medium">Ошибка</div>
          </div>
          <div className="text-red-600 text-sm mb-4">{error}</div>
          <button
            onClick={loadStatistics}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-all duration-200 font-sans"
          >
            <RefreshCw size={14} />
            Повторить
          </button>
        </div>
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
        ? "bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-all duration-200"
        : "bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all duration-200";

    const valueClasses =
      size === "small"
        ? "text-xl font-bold text-slate-900 mt-1 font-sans"
        : "text-3xl font-bold text-slate-900 mt-2 font-sans";

    const iconClasses =
      size === "small" ? "w-4 h-4 text-white" : "w-6 h-6 text-white";

    return (
      <div className={cardClasses}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 font-sans">{title}</p>
            <p className={valueClasses}>{value}</p>
          </div>
          <div className={`p-2.5 rounded-xl ${color}`}>
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
        label: "Исследования",
        data: stats?.doctorsStats.map((doc) => doc.researchCount) || [],
        backgroundColor: "rgba(26, 130, 194, 0.6)",
        borderColor: "rgba(26, 130, 194, 1)",
        borderWidth: 1,
        borderRadius: 4,
      },
      {
        label: "Пациенты",
        data: stats?.doctorsStats.map((doc) => doc.patientCount) || [],
        backgroundColor: "rgba(0, 168, 107, 0.6)",
        borderColor: "rgba(0, 168, 107, 1)",
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          font: {
            family: "Inter, system-ui, sans-serif",
            size: 12,
          },
          padding: 16,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          font: {
            family: "Inter, system-ui, sans-serif",
            size: 11,
          },
        },
        grid: {
          color: "rgba(0, 0, 0, 0.06)",
        },
      },
      x: {
        ticks: {
          font: {
            family: "Inter, system-ui, sans-serif",
            size: 11,
          },
        },
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">Статистика</h1>
        <button
          onClick={loadStatistics}
          className="inline-flex items-center gap-2 px-4 py-2 bg-medical-500 text-white text-sm rounded-lg hover:bg-medical-600 transition-all duration-200 font-sans shadow-sm hover:shadow"
        >
          <RefreshCw size={14} />
          Обновить
        </button>
      </div>

      {/* Фильтр по периоду */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <Filter className="w-4 h-4 text-slate-400" />
          <h3 className="text-sm font-semibold text-slate-700">Период</h3>
        </div>
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5 font-sans">
              Дата начала
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-700 placeholder-slate-400
                focus:outline-none focus:ring-2 focus:ring-medical-200 focus:border-medical-400 focus:bg-white
                transition-all duration-200 font-sans"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5 font-sans">
              Дата окончания
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-700 placeholder-slate-400
                focus:outline-none focus:ring-2 focus:ring-medical-200 focus:border-medical-400 focus:bg-white
                transition-all duration-200 font-sans"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handlePeriodChange}
              className="px-4 py-2 bg-medical-500 text-white text-sm rounded-lg hover:bg-medical-600 transition-all duration-200 font-sans shadow-sm hover:shadow"
            >
              Применить
            </button>
            <button
              onClick={setCurrentMonth}
              className="px-3 py-2 bg-slate-100 text-slate-600 text-sm rounded-lg hover:bg-slate-200 hover:text-slate-800 transition-all duration-200 font-sans"
            >
              Текущий месяц
            </button>
            <button
              onClick={setLastMonth}
              className="px-3 py-2 bg-slate-100 text-slate-600 text-sm rounded-lg hover:bg-slate-200 hover:text-slate-800 transition-all duration-200 font-sans"
            >
              Прошлый месяц
            </button>
            <button
              onClick={setCurrentYear}
              className="px-3 py-2 bg-slate-100 text-slate-600 text-sm rounded-lg hover:bg-slate-200 hover:text-slate-800 transition-all duration-200 font-sans"
            >
              Текущий год
            </button>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
          <div className="text-xs text-slate-400 font-sans">
            {startDate && endDate
              ? `Период: с ${formatLocalDate(new Date(startDate))} по ${formatLocalDate(new Date(endDate))}`
              : "Вся статистика"}
          </div>
          {(startDate || endDate) && (
            <button
              onClick={clearFilter}
              className="text-xs text-medical-600 hover:text-medical-800 underline transition-colors font-sans"
            >
              Очистить фильтр
            </button>
          )}
        </div>
      </div>

      {/* Общие показатели */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Всего пациентов"
          value={stats.totalPatients}
          icon={Users}
          color="bg-medical-500"
          size="small"
        />
        <StatCard
          title="Всего исследований"
          value={stats.totalResearches}
          icon={FileText}
          color="bg-clinical-500"
          size="small"
        />
        <StatCard
          title="Всего протоколов"
          value={stats.totalStudies}
          icon={BarChart3}
          color="bg-violet-500"
          size="small"
        />
        <StatCard
          title="За выбранный период"
          value={stats.researchesInPeriod}
          icon={TrendingUp}
          color="bg-amber-500"
          size="small"
        />
      </div>

      {/* График по врачам */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
          <Stethoscope className="w-4 h-4 text-medical-500" />
          Статистика по врачам
        </h3>
        {stats && stats.doctorsStats.length > 0 ? (
          <div className="h-72">
            <Bar data={doctorsChartData} options={chartOptions} />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <BarChart3 size={32} className="text-slate-300 mb-2" />
            <p className="text-sm text-slate-400 font-medium">
              Нет данных по врачам за выбранный период
            </p>
          </div>
        )}
      </div>

      {/* Статистика по оплате и типы исследований */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-medical-500" />
            Статистика по оплате
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-medical-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-medical-500" />
                <span className="text-sm font-medium text-medical-700 font-sans">ОМС</span>
              </div>
              <span className="text-xl font-bold text-medical-900 font-sans">
                {stats.paymentStats.oms}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-clinical-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-clinical-500" />
                <span className="text-sm font-medium text-clinical-700 font-sans">Платные</span>
              </div>
              <span className="text-xl font-bold text-clinical-900 font-sans">
                {stats.paymentStats.paid}
              </span>
            </div>
            <div className="text-xs text-slate-400 text-center pt-2 border-t border-slate-100 font-sans">
              Всего: {stats.paymentStats.oms + stats.paymentStats.paid} исследований
            </div>
          </div>
        </div>

        {/* Типы исследований */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-medical-500" />
            Типы исследований
          </h3>
          <div className="space-y-2">
            {Object.entries(stats.studiesByType).length > 0 ? (
              Object.entries(stats.studiesByType).map(([type, count]) => (
                <div
                  key={type}
                  className="flex items-center justify-between px-3 py-2.5 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <span className="text-sm text-slate-600 font-sans capitalize">
                    {type.replace(/([A-Z])/g, " $1").trim()}
                  </span>
                  <span className="text-sm font-semibold text-slate-900 font-sans">{count}</span>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <FileText size={28} className="text-slate-300 mb-2" />
                <p className="text-sm text-slate-400 font-medium">
                  Нет данных по типам исследований
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Последняя активность */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-medical-500" />
          Последняя активность
        </h3>
        <div className="space-y-2">
          {stats.recentActivity.length > 0 ? (
            stats.recentActivity.slice(0, 10).map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-medical-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-medical-400 shrink-0" />
                  <div>
                    <div className="text-sm font-medium text-slate-800 font-sans">
                      {activity.patientName}
                    </div>
                    <div className="text-xs text-slate-400 font-sans">
                      {activity.studyType}
                    </div>
                  </div>
                </div>
                <div className="text-xs text-slate-400 font-sans shrink-0">
                  {formatLocalDate(new Date(activity.date))}
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Calendar size={28} className="text-slate-300 mb-2" />
              <p className="text-sm text-slate-400 font-medium">
                Нет данных о последней активности
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Statistics;
