import React, { useEffect, useState } from "react";
import {
  Users2, Truck, Leaf,
  AlertCircle, Clock, TriangleAlert, MoveRight, Megaphone
} from "lucide-react";
import TeaSupplyChart from "../../components/charts/TeaSupplyChart";
import { useAuth } from "../../contexts/AuthContext";
import { getSupplierCounts, getSupplierRequestsByStatus } from "../../api/supplier";
import { fetchTeaRateRecords } from "../../api/factoryManager";


const ACCENT_COLOR = "#165e52";
const BUTTON_COLOR = "#172526";


export default function FactoryManagerDashboard() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    supplierRequests: 0,
    activeSuppliers: 0,
    driversTotal: 4 ,
    fertilizerStock: "85%",
  });

  useEffect(() => {
    const fetchCounts = async () => {
      const factoryId = user?.factoryId;
      if (!factoryId) return;
      try {
        const counts = await getSupplierCounts(factoryId);
        if (counts?.status === 404 && counts?.message) {
          setDashboardData((prev) => ({
            ...prev,
            activeSuppliers: 0,
            supplierRequests: 0,
          }));
        } else {
          // Prefer counts returned by the counts API
          let pendingCount = counts?.pendingRequestCount ?? 0;
          // Fallback: if pendingRequestCount not provided, call requests-by-status
          if (pendingCount === 0) {
            try {
              const pending = await getSupplierRequestsByStatus(factoryId, "pending");
              pendingCount = Array.isArray(pending) ? pending.length : (pending?.total || 0);
            } catch (e) {
              pendingCount = 0;
            }
          }

          setDashboardData((prev) => ({
            ...prev,
            activeSuppliers: counts?.activeSupplierCount ?? counts?.approved ?? counts?.total ?? 0,
            supplierRequests: pendingCount,
          }));
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.debug('Failed to load supplier counts', err);
      }
    };
    fetchCounts();
  }, [user]);

  // Tea rate chart data
  const [teaRateChartData, setTeaRateChartData] = useState(null);
  useEffect(() => {
    const fetchTeaRates = async () => {
      const factoryUserId = user?.id || user?.userId || user?.uid || null;
      if (!factoryUserId) return;
      try {
            const resp = await fetchTeaRateRecords(user?.uid);
            const records = resp?.data || resp || [];

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
              label: `Supplier Requests`,
              value: dashboardData.supplierRequests,
              icon: <Leaf size={28} color="black" />,
            },
            {
              label: `Active Suppliers `,
              value: dashboardData.activeSuppliers,
             
              icon: <Users2 size={28} color="black" />,
            },
            {
              label: "Total Drivers",
              value: dashboardData.driversTotal,
             
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
                    { label: "Proceed Payment", href: "/factoryManager/payment/proceed", icon: <Megaphone size={20} color="white" /> },
                    { label: "Payments", href: "/factoryManager/payment/main", icon: <Leaf size={20} color="white" /> },
                    { label: "Suppliers", href: "/factoryManager/suppliers", icon: <Users2 size={20} color="white" /> }
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



