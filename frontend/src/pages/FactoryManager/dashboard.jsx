import React, { useEffect, useState } from "react";
import {
  Users2, Truck, Leaf,
  AlertCircle, Clock, TriangleAlert, MoveRight, Megaphone, Bell, BadgeAlert, Award
} from "lucide-react";
import TeaSupplyChart from "../../components/charts/TeaSupplyChart";
import { useAuth } from "../../contexts/AuthContext";
import { fetchTeaRateRecords } from "../../api/factoryManager";
import axios from "../../api/axios";
import { getAllAnnouncements } from "../../api/announcement";


const ACCENT_COLOR = "#165e52";
const BUTTON_COLOR = "#172526";


export default function FactoryManagerDashboard() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    activeSuppliers: 0,
    leafEntriesLast7Days: 0,
    activeTeaRate: null,
    announcements: [],
    topSuppliers: [],
    loading: true,
  });

  const [dashboardError, setDashboardError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchDashboard = async () => {
      setDashboardError(null);
      setDashboardData((prev) => ({ ...prev, loading: true }));

      try {
        const factoryId = user?.factoryId ?? null;

        const now = new Date();
        const endDate = now.toISOString().split("T")[0];
        const start = new Date(now);
        start.setDate(start.getDate() - 6);
        const startDate = start.toISOString().split("T")[0];

        const [
          suppliersRes,
          entriesRes,
          teaRateRes,
          announcementsRes,
          topSuppliersRes,
        ] = await Promise.all([
          axios.get("/suppliers", { params: { status: "Active", page: 0, limit: 1 } }),
          axios.get("/tea-leaf-entries", {
            params: { page: 0, limit: 1, startDate, endDate },
          }),
          axios.get("/tea-rates/active"),
          getAllAnnouncements(factoryId),
          axios.get("/tea-leaf-entries/top-suppliers", { params: { limit: 5 } }),
        ]);

        const activeSuppliers = suppliersRes?.data?.totalElements ?? 0;
        const leafEntriesLast7Days = entriesRes?.data?.totalElements ?? 0;
        const activeTeaRate = teaRateRes?.data?.data?.defaultRate ?? null;

        const announcements =
          announcementsRes?.data?.announcements ||
          announcementsRes?.data?.data?.announcements ||
          [];

        const topSuppliers = topSuppliersRes?.data?.data || [];

        if (!isMounted) return;
        setDashboardData({
          activeSuppliers,
          leafEntriesLast7Days,
          activeTeaRate,
          announcements: Array.isArray(announcements) ? announcements : [],
          topSuppliers: Array.isArray(topSuppliers) ? topSuppliers : [],
          loading: false,
        });
      } catch (err) {
        if (!isMounted) return;
        setDashboardData((prev) => ({ ...prev, loading: false }));
        setDashboardError(
          err?.response?.data?.message || err?.message || "Failed to load dashboard"
        );
      }
    };

    void fetchDashboard();

    return () => {
      isMounted = false;
    };
  }, [user]);

  // Tea rate chart data
  const [teaRateChartData, setTeaRateChartData] = useState(null);
  useEffect(() => {
    const fetchTeaRates = async () => {
      const factoryUserId = user?.id || user?.userId || user?.uid || null;
      if (!factoryUserId) return;
      try {
        const records = await fetchTeaRateRecords(factoryUserId);

        // Map to time-series of rate per kg. Use finalRatePerKg if available, else fallback to monthlyRate or rate
        const sorted = records
          .slice()
          .sort((a, b) => new Date(a.createdAt || a.date || a.month) - new Date(b.createdAt || b.date || b.month));

        const labels = sorted.map((r) => {
          const d = new Date(r.createdAt || r.date || r.month || null);
          if (!isNaN(d)) return d.toLocaleDateString();
          // fallback to month label if present
          return r.monthLabel || r.month || "-";
        });

        const dataPoints = sorted.map((r) => {
          const rate = r.finalRatePerKg ?? r.monthlyRate ?? r.rate ?? null;
          return rate != null ? Number(rate) : null;
        });

        setTeaRateChartData({
          labels,
          datasets: [
            {
              label: "Tea Rate",
              data: dataPoints,
              borderColor: "#10B981",
              backgroundColor: "rgba(16,185,129,0.2)",
              tension: 0.3,
            },
          ],
        });
      } catch (err) {
        // eslint-disable-next-line no-console
        console.debug("Failed to load tea rate records", err);
      }
    };
    fetchTeaRates();
  }, [user]);


  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-md ">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-start justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold  mb-1" style={{ color: ACCENT_COLOR }}>Dashboard Home</h1>
            {/* moved payment buttons to Quick Actions below */}
          </div>
          {/* filters removed intentionally - show static dashboard */}
        </div>
      </div>


      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {[
            {
              label: `Active Suppliers`,
              value: dashboardData.activeSuppliers,
              icon: <Leaf size={28} color="black" />,
            },
            {
              label: "Leaf Entries (Last 7 days)",
              value: dashboardData.leafEntriesLast7Days,
              icon: <Users2 size={28} color="black" />,
            },
            {
              label: "Active Tea Rate (Rs/kg)",
              value: dashboardData.activeTeaRate ?? "-",
              icon: <Truck size={28} color="black" />,
            }
          ].map((card, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-md border border-black transition duration-200 hover:shadow-lg hover:border-[#cfece6]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-black">{card.label}</p>
                  {card.subtitle && <p className="text-xs text-gray-500">{card.subtitle}</p>}
                  <p className="text-2xl font-bold text-black">{card.value}</p>
                </div>
                <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center">
                  {card.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {dashboardData.loading ? (
          <div className="bg-white p-4 rounded-lg shadow-md border border-black mb-6">
            <p className="text-sm text-gray-700">Loading dashboard data...</p>
          </div>
        ) : dashboardError ? (
          <div className="bg-white p-4 rounded-lg shadow-md border border-black mb-6">
            <p className="text-sm text-red-700">{dashboardError}</p>
          </div>
        ) : null}


        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Charts Section */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-black col-span-2 flex flex-col">

            <div className="flex-1 min-h-[350px] flex items-center justify-center">
              <div className="w-full h-full">
                <TeaSupplyChart data={teaRateChartData} period={"daily"} height={320} primaryColor={ACCENT_COLOR} />
              </div>
            </div>
          </div>


          {/* Quick Actions */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-black">
            <h3 className="text-lg font-semibold text-black mb-5">Quick Actions</h3>
            {/* Make buttons constrained inside the panel; allow scroll if overflow */}
            <div className="h-[220px]">
              <div className="flex flex-col gap-3 h-full">
                {[
                  { label: "Tea Quality", href: "/factoryManager/tea-quality", icon: <Award size={20} color="white" /> },
                  { label: "Tea Disease", href: "/factory-manager/tea-disease", icon: <BadgeAlert size={20} color="white" /> },
                  { label: "Announcements", href: "/factoryManager/announcements", icon: <Bell size={20} color="white" /> }
                ].map((action, i) => (
                  <a
                    key={i}
                    href={action.href}
                    className="w-full flex-1 p-4 rounded-md text-white text-base font-semibold flex items-center gap-3 justify-start transition-colors"
                    style={{
                      backgroundColor: BUTTON_COLOR,
                      border: "none",
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <span className="inline-flex items-center justify-center w-6">{action.icon}</span>
                    <span className="flex-1 text-left">{action.label}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Latest announcements + top suppliers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md border border-black">
            <h3 className="text-lg font-semibold text-black mb-4">Latest Announcements</h3>
            {Array.isArray(dashboardData.announcements) && dashboardData.announcements.length > 0 ? (
              <div className="space-y-3">
                {dashboardData.announcements.slice(0, 5).map((a) => (
                  <div key={a._id || `${a.subject}-${a.createdAt}`} className="border border-gray-200 rounded-md p-3">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-black truncate pr-3">{a.subject || "(No subject)"}</div>
                      <div className="text-xs text-gray-600">{a.topic || "general"}</div>
                    </div>
                    <div className="text-sm text-gray-700 mt-1 line-clamp-2">{a.content || ""}</div>
                    <div className="text-xs text-gray-500 mt-2">
                      {a.createdAt ? new Date(a.createdAt).toLocaleString() : ""}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-700">No announcements available.</p>
            )}
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border border-black">
            <h3 className="text-lg font-semibold text-black mb-4">Top Suppliers (by Net Weight)</h3>
            {Array.isArray(dashboardData.topSuppliers) && dashboardData.topSuppliers.length > 0 ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th className="py-2">Supplier</th>
                    <th className="py-2 text-right">Net kg</th>
                    <th className="py-2 text-right">Entries</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.topSuppliers.map((s) => (
                    <tr key={s.supplierId || s.name} className="border-b">
                      <td className="py-2">
                        <div className="font-medium text-black">{s.name || "Unknown"}</div>
                        <div className="text-xs text-gray-600">{s.supplierCode || ""}</div>
                      </td>
                      <td className="py-2 text-right">{Number(s.totalWeight || 0).toLocaleString()}</td>
                      <td className="py-2 text-right">{Number(s.entryCount || 0).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-sm text-gray-700">No supplier summary available.</p>
            )}
          </div>
        </div>


        {/* Bottom Section removed */}
      </div>


      {/* Custom animation for emergency blink */}
      <style>{`
      @keyframes pulseSlow {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.4; }
      }
      .animate-pulse-slow {
        animation: pulseSlow 1.5s infinite;
      }
      `}</style>
    </div>
  );
}



