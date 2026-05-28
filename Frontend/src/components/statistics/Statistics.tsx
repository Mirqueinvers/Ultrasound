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
import { Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import DatePickerField from "@/components/common/DatePickerField";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
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

  /** Конвертирует "дд.мм.гггг" в "гггг-мм-дд" для отправки в API */
  const ruToIso = (ru: string): string | undefined => {
    if (!ru) return undefined;
    const match = ru.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
    if (!match) return undefined;
    return `${match[3]}-${match[2]}-${match[1]}`;
  };

  /** Форматирует Date в "дд.мм.гггг" для DatePickerField */
  const formatRuDate = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };

  const [startDate, setStartDate] = useState(() => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    return formatRuDate(firstDay);
  });
  const [endDate, setEndDate] = useState(() => {
    const now = new Date();
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return formatRuDate(lastDay);
  });
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [doctorList, setDoctorList] = useState<string[]>([]);

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
        ruToIso(startDate),
        ruToIso(endDate)
      );

      if (result && result.success && result.data) {
        setStats(result.data);
        // Заполняем список врачей из полученных данных
        const doctors = result.data.doctorsStats.map(
          (doc: { doctorName: string }) => doc.doctorName
        );
        setDoctorList(doctors);
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
    setStartDate(formatRuDate(firstDay));
    setEndDate(formatRuDate(lastDay));
    setTimeout(loadStatistics, 100);
  };

  const setLastMonth = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth(), 0);
    setStartDate(formatRuDate(firstDay));
    setEndDate(formatRuDate(lastDay));
    setTimeout(loadStatistics, 100);
  };

  const setCurrentYear = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), 0, 1);
    const lastDay = new Date(now.getFullYear(), 11, 31);
    setStartDate(formatRuDate(firstDay));
    setEndDate(formatRuDate(lastDay));
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

  /** Расчёт баллов по типам исследований */
  const calculateScores = (studiesByType: { [key: string]: number }): number => {
    const SCORE_MAP: Record<string, number> = {
      ОБП: 6,
      омт: 4,
      ОМТ: 4,
      бца: 4.5,
      БЦА: 4.5,
      увнк: 4.5,
      УВНК: 4.5,
    };
    let total = 0;
    for (const [type, count] of Object.entries(studiesByType)) {
      const score = SCORE_MAP[type] ?? 2;
      total += score * count;
    }
    return total;
  };

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

  const DOUGHNUT_COLORS = [
    "rgba(26, 130, 194, 0.85)",
    "rgba(0, 168, 107, 0.85)",
    "rgba(245, 158, 11, 0.85)",
    "rgba(139, 92, 246, 0.85)",
    "rgba(239, 68, 68, 0.85)",
    "rgba(236, 72, 153, 0.85)",
    "rgba(14, 116, 144, 0.85)",
    "rgba(101, 163, 13, 0.85)",
  ];

  const doctorsDoughnutData = {
    labels: stats?.doctorsStats.map((doc) => doc.doctorName) || [],
    datasets: [
      {
        data: stats?.doctorsStats.map((doc) => doc.researchCount) || [],
        backgroundColor: DOUGHNUT_COLORS.slice(0, stats?.doctorsStats.length || 0),
        borderColor: "#ffffff",
        borderWidth: 2,
        hoverOffset: 8,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "55%",
    plugins: {
      legend: {
        position: "right" as const,
        labels: {
          font: {
            family: "Inter, system-ui, sans-serif",
            size: 11,
          },
          padding: 12,
          usePointStyle: true,
          pointStyle: "circle",
        },
      },
      tooltip: {
        callbacks: {
          label: function (context: { label: string; parsed: number; dataset: { data: number[] } }) {
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const pct = total > 0 ? ((context.parsed / total) * 100).toFixed(1) : "0";
            return `${context.label}: ${context.parsed} (${pct}%)`;
          },
        },
      },
    },
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Заголовок — скрыт, кнопка обновления убрана */}

      {/* Фильтр по параметрам */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <Filter className="w-4 h-4 text-slate-400" />
          <h3 className="text-sm font-semibold text-slate-700">Параметры</h3>
        </div>
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5 font-sans">
              Врач
            </label>
            <select
              value={selectedDoctor}
              onChange={(e) => setSelectedDoctor(e.target.value)}
              className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 text-slate-700
                focus:outline-none focus:ring-2 focus:ring-medical-200 focus:border-medical-400 focus:bg-white
                transition-all duration-200 font-sans min-w-[180px]"
            >
              <option value="">Все врачи</option>
              {doctorList.map((doctor) => (
                <option key={doctor} value={doctor}>
                  {doctor}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5 font-sans">
              Дата начала
            </label>
            <DatePickerField
              value={startDate}
              onChange={setStartDate}
              placeholder="дд.мм.гггг"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5 font-sans">
              Дата окончания
            </label>
            <DatePickerField
              value={endDate}
              onChange={setEndDate}
              placeholder="дд.мм.гггг"
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
              ? `Период: с ${startDate} по ${endDate}`
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          title="Баллы"
          value={calculateScores(stats.studiesByType)}
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-72">
              <Bar data={doctorsChartData} options={chartOptions} />
            </div>
            <div className="h-72 flex items-center justify-center">
              <Doughnut data={doctorsDoughnutData} options={doughnutOptions} />
            </div>
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
              Object.entries(stats.studiesByType)
                .sort(([, a], [, b]) => b - a)
                .map(([type, count]) => (
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
                  {activity.date}
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
