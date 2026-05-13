import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import * as diseaseAPI from '../../api/diseaseDetection';
import { getMonthlyTeaLeafSummary } from '../../api/owner';
import { useAuth } from '../../contexts/AuthContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import zoomPlugin from "chartjs-plugin-zoom";
import { Line } from "react-chartjs-2";
import {
  Leaf,
  Truck,
  Users,
  DollarSign,
  TrendingUp,
  Calculator,
  MapPin,
  Calendar,
  Award,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  zoomPlugin
);

const ACCENT_COLOR = "#165e52";
const BLACK = "#000000";
const BUTTON_COLOR = "#172526";
const BORDER_COLOR = "#cfece6";

const MONTH_LABELS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const monthlySupplyOptions = {
  responsive: true,
  interaction: { mode: "nearest", intersect: false },
  plugins: {
    legend: { display: true, labels: { color: BUTTON_COLOR } },
    tooltip: {
      enabled: true,
      mode: "index",
      intersect: false,
      backgroundColor: ACCENT_COLOR,
      titleColor: "#fff",
      bodyColor: "#fff",
    },
    zoom: {
      pan: { enabled: true, mode: "x", modifierKey: "ctrl" },
      zoom: { wheel: { enabled: true }, pinch: { enabled: true }, mode: "x" },
    },
  },
  scales: {
    x: { ticks: { color: BUTTON_COLOR }, grid: { color: BORDER_COLOR } },
    y: { beginAtZero: true, ticks: { color: BUTTON_COLOR }, grid: { color: BORDER_COLOR } },
  },
};

export default function Dashboard() {
  const { user } = useAuth();

  const [diseaseStats, setDiseaseStats] = useState({ totalScans: 0, diseasesFound: 0, healthyLeaves: 0, avgConfidence: 0 });
  const [loadingStats, setLoadingStats] = useState(true);

  const [chartData, setChartData] = useState(null);
  const [loadingChart, setLoadingChart] = useState(true);

  // Fetch everything on mount — chart data is global (same for all owners)
  useEffect(() => {
    fetchDiseaseStatistics();
    fetchMonthlyChart();
  }, []);

  const fetchMonthlyChart = async () => {
    try {
      setLoadingChart(true);
      const response = await getMonthlyTeaLeafSummary();
      if (response.success && response.data) {
        const weights = response.data.map(m => m.totalWeight);
        setChartData({
          labels: MONTH_LABELS,
          datasets: [{
            label: "Tea Collected (kg)",
            data: weights,
            borderColor: ACCENT_COLOR,
            backgroundColor: "rgba(22, 94, 82, 0.3)",
            fill: true,
            tension: 0.3,
            pointRadius: 5,
            pointHoverRadius: 8,
          }],
        });
      }
    } catch (error) {
      console.error('Error fetching monthly chart data:', error);
    } finally {
      setLoadingChart(false);
    }
  };


  const fetchDiseaseStatistics = async () => {
    try {
      setLoadingStats(true);
      const [dailyResponse, overallResponse] = await Promise.all([
        diseaseAPI.getDailyStatistics(),
        diseaseAPI.getStatistics()
      ]);
      if (dailyResponse.success && dailyResponse.data.daily && dailyResponse.data.daily.totalScans > 0) {
        const daily = dailyResponse.data.daily;
        setDiseaseStats({ totalScans: daily.totalScans || 0, diseasesFound: daily.diseasesFound || 0, healthyLeaves: daily.healthyLeaves || 0, avgConfidence: daily.avgConfidence || 0 });
      } else if (overallResponse.success && overallResponse.data) {
        const overall = overallResponse.data;
        setDiseaseStats({
          totalScans: overall.total || 0, diseasesFound: overall.diseased || 0, healthyLeaves: overall.healthy || 0,
          avgConfidence: overall.byDisease?.reduce((sum, d) => sum + (d.avgConfidence || 0), 0) / (overall.byDisease?.length || 1) || 0
        });
      }
    } catch (error) {
      console.error('Error fetching disease statistics:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-md border-b">
        <div className="max-w-7xl mx-auto px-6 py-6 ">
          <h1
            className="text-3xl font-bold mb-1 text-gray-900"
            // style={{ color: ACCENT_COLOR }}
          >
            Dashboard
          </h1>
          <p className="mt-1 text-base text-gray-600 max-w-2xl">
            Comprehensive reporting system for all your tea factories
          </p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Stats Cards */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {[
            {
              label: "Total Tea Collected",
              value: "2,834",
              icon: <TrendingUp size={28} color="black" />,
            },
            {
              label: "Drivers on Duty",
              value: "31",
              icon: <Users size={28} color="black" />,
            },
            {
              label: "Total Payable Amount",
              value: "1,500,234",
              icon: <DollarSign size={28} color="black" />,
            },
            {
              label: "Avg Rate Change",
              value: "+5.2%",
              icon: <TrendingUp size={28} color="black" />,
            },
          ].map((card, idx) => (
            <div
              key={idx}
              className="bg-white p-6 rounded-lg shadow-md border border-black transition duration-200 hover:shadow-lg hover:border-[#cfece6] flex items-center justify-between"
            >
              <div>
                <p className="text-sm font-medium text-black">{card.label}</p>
                <p className="text-2xl font-bold text-black">{card.value}</p>
              </div>
              <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center">
                {card.icon}
              </div>
            </div>
          ))}
        </section>

        {/* Charts & Top Suppliers */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Monthly Supply Chart */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-black flex flex-col">
            <h3 className="text-lg font-semibold text-black mb-5" style={{ color: ACCENT_COLOR }}>
              Monthly Supply Chart ({new Date().getFullYear()})
            </h3>
            <div className="flex-1 min-h-[320px] flex items-center justify-center">
              {loadingChart ? (
                <div className="text-center text-gray-400">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-emerald-600 mx-auto mb-2"></div>
                  <p className="text-sm">Loading chart data...</p>
                </div>
              ) : chartData ? (
                <Line data={chartData} options={monthlySupplyOptions} />
              ) : (
                <p className="text-gray-400 text-sm text-center">No supply data found for this factory.<br/>Tea leaf entries will appear here once recorded.</p>
              )}
            </div>
          </div>

          {/* Monthly Collection Progress */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-black">
            <h3 className="text-lg font-semibold mb-1" style={{ color: ACCENT_COLOR }}>
              Monthly Collection Progress
            </h3>
            <p className="text-xs text-gray-400 mb-5">{new Date().getFullYear()} — Tea Collected (kg)</p>

            {loadingChart ? (
              <div className="space-y-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="flex justify-between mb-1">
                      <div className="h-3 bg-gray-200 rounded w-8"></div>
                      <div className="h-3 bg-gray-200 rounded w-16"></div>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full"><div className="h-2 bg-gray-200 rounded-full" style={{ width: `${30 + i * 10}%` }}></div></div>
                  </div>
                ))}
              </div>
            ) : chartData ? (() => {
              const weights = chartData.datasets[0].data;
              const maxWeight = Math.max(...weights, 1);
              const totalKg = weights.reduce((a, b) => a + b, 0);
              const bestMonthIdx = weights.indexOf(Math.max(...weights));
              const currentMonth = new Date().getMonth(); // 0-indexed

              return (
                <div>
                  {/* Summary row */}
                  <div className="grid grid-cols-2 gap-3 mb-5">
                    <div className="bg-emerald-50 rounded-xl p-3 text-center">
                      <p className="text-xs text-gray-500 mb-0.5">Total This Year</p>
                      <p className="text-xl font-extrabold" style={{ color: ACCENT_COLOR }}>
                        {totalKg.toLocaleString()} <span className="text-sm font-medium">kg</span>
                      </p>
                    </div>
                    <div className="bg-amber-50 rounded-xl p-3 text-center">
                      <p className="text-xs text-gray-500 mb-0.5">Best Month</p>
                      <p className="text-xl font-extrabold text-amber-600">
                        {MONTH_LABELS[bestMonthIdx]}
                        <span className="text-sm font-medium block text-amber-500">{weights[bestMonthIdx].toLocaleString()} kg</span>
                      </p>
                    </div>
                  </div>

                  {/* Mini bar chart for each month */}
                  <div className="space-y-2">
                    {MONTH_LABELS.map((month, i) => {
                      const pct = maxWeight > 0 ? (weights[i] / maxWeight) * 100 : 0;
                      const isCurrent = i === currentMonth;
                      const isBest = i === bestMonthIdx;
                      return (
                        <div key={month}>
                          <div className="flex justify-between items-center mb-0.5">
                            <span className={`text-xs font-semibold ${isCurrent ? 'text-emerald-600' : 'text-gray-500'}`}>
                              {month} {isCurrent && <span className="ml-1 text-[10px] bg-emerald-100 text-emerald-700 px-1 rounded">Current</span>}
                              {isBest && !isCurrent && <span className="ml-1 text-[10px] bg-amber-100 text-amber-700 px-1 rounded">Best</span>}
                            </span>
                            <span className={`text-xs font-bold ${weights[i] > 0 ? 'text-gray-700' : 'text-gray-300'}`}>
                              {weights[i] > 0 ? `${weights[i].toLocaleString()} kg` : '—'}
                            </span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-2 rounded-full transition-all duration-500"
                              style={{
                                width: `${pct}%`,
                                backgroundColor: isCurrent ? '#165e52' : isBest ? '#d97706' : '#6ee7b7'
                              }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })() : (
              <div className="flex flex-col items-center justify-center h-48 text-center">
                <div className="text-4xl mb-3">📊</div>
                <p className="text-gray-400 text-sm">No data yet for this year.</p>
                <p className="text-gray-300 text-xs mt-1">Progress will appear as tea entries are recorded.</p>
              </div>
            )}
          </div>
        </section>


        {/* Quick Links Section */}
        <section className="bg-white rounded-lg shadow-md p-6 ">
          <h3
            className="text-lg font-semibold text-black mb-5"
            style={{ color: BLACK}}
          >
            Quick Links
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Fertilizer Requests",
                description: "Manage fertilizer distribution requests",
                icon: Leaf,
                to: "/fertilizerManager/request",
              },
              {
                title: "Vehicle Management",
                description: "Track and manage transport vehicles",
                icon: Truck,
                to: "/transportManager/vehicle",
              },
              {
                title: "Price Calculator",
                description: "Calculate tea prices and payments",
                icon: Calculator,
                to: "/payment-manager/tea-rates",
              },
              {
                title: "Route Planning",
                description: "Optimize collection routes",
                icon: MapPin,
                to: "/transportManager/routePlan",
              },
              {
                title: "Schedule Manager",
                description: "Manage collection schedules",
                icon: Calendar,
                to: "/transportManager/routeList",
              },
              {
                title: "Payment System",
                description: "Process supplier payments",
                icon: DollarSign,
                to: "/payment-manager/payments",
              },
            ].map(({ title, description, icon: Icon, iconBg, to }, i) => (
              <Link
                key={title}
                to={to}
                className={`rounded-lg p-5 border ${iconBg} hover:shadow-lg transition-shadow bg-gray-50 flex items-center space-x-4`}
                style={{
                  borderColor: BORDER_COLOR,
                  backgroundColor: "#F0FDF4",
                }}
              >
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center ${iconBg}`}
                >
                  <Icon className="w-6 h-6" style={{ color:BLACK }} />
                </div>
                <div>
                  <h4
                    className="font-semibold text-gray-800"
                    style={{ color: BLACK }}
                  >
                    {title}
                  </h4>
                  <p className="text-sm text-gray-600">{description}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Detection Statistics */}
        <section className="bg-white rounded-lg shadow-md p-6 border border-black">
          <h3
            className="text-lg font-semibold text-black mb-5"
            style={{ color: ACCENT_COLOR }}
          >
            Detection Statistics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-lg shadow-md border border-black transition duration-200 hover:shadow-lg hover:border-[#cfece6] flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-black">Today's Scans</p>
                <p className="text-2xl font-bold text-black">
                  {loadingStats ? (
                    <span className="animate-pulse">...</span>
                  ) : (
                    diseaseStats.totalScans
                  )}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#F0FDF4' }}>
                <TrendingUp size={28} style={{ color: ACCENT_COLOR }} />
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md border border-black transition duration-200 hover:shadow-lg hover:border-[#cfece6] flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-black">Diseases Found</p>
                <p className="text-2xl font-bold text-black">
                  {loadingStats ? (
                    <span className="animate-pulse">...</span>
                  ) : (
                    diseaseStats.diseasesFound
                  )}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#FEF2F2' }}>
                <AlertTriangle size={28} className="text-red-600" />
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md border border-black transition duration-200 hover:shadow-lg hover:border-[#cfece6] flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-black">Healthy Leaves</p>
                <p className="text-2xl font-bold text-black">
                  {loadingStats ? (
                    <span className="animate-pulse">...</span>
                  ) : (
                    diseaseStats.healthyLeaves
                  )}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#F0FDF4' }}>
                <CheckCircle size={28} style={{ color: ACCENT_COLOR }} />
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md border border-black transition duration-200 hover:shadow-lg hover:border-[#cfece6] flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-black">Avg Confidence</p>
                <p className="text-2xl font-bold text-black">
                  {loadingStats ? (
                    <span className="animate-pulse">...</span>
                  ) : (
                    diseaseStats.avgConfidence > 0 ? `${diseaseStats.avgConfidence.toFixed(1)}%` : '0%'
                  )}
                </p>
              </div>
              <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center">
                <Award size={28} style={{ color: ACCENT_COLOR }} />
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
