import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getInventoryManagerDashboardSummary,
  getTodayTrips,
} from "../../api/inventoryManager/history";
import PaginationControls from "../../components/ui/PaginationControls";
import {
  MapPin,
  User,
  Scale,
  TrendingUp,
  Weight,
  BarChart3,
  RefreshCw,
  Package,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

// SupplierHeader with custom colors
function SupplierHeader() {
  return (
    <div
      className="bg-white shadow-md border-b"
      style={{ borderColor: "#cfece6" }}
    >
      <div className="max-w-7xl mx-auto px-6 py-4">
        <h1 className="text-3xl font-bold mb-1" style={{ color: "#165e52" }}>
          Dashboard
        </h1>
      </div>
    </div>
  );
}

export default function InventoryManagerDashboard() {
  const navigate = useNavigate();
  const [refreshTripsFlag, setRefreshTripsFlag] = useState(0);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [dashboardSummary, setDashboardSummary] = useState(null);
  const [trips, setTrips] = useState([]);

  const [tripsPage, setTripsPage] = useState(0);
  const [tripsTotalPages, setTripsTotalPages] = useState(1);
  const [tripsTotalElements, setTripsTotalElements] = useState(0);
  const [tripsLoading, setTripsLoading] = useState(false);

  const { user } = useAuth();
  // factoryId is not reliably present in the current auth payload.
  // Backend endpoints treat it as optional, so do not block dashboard loading on it.
  const factoryId = user?.factoryId;

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const data = await getInventoryManagerDashboardSummary();
        setDashboardSummary(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchSummary();
    const interval = setInterval(fetchSummary, 60000);
    return () => clearInterval(interval);
  }, [factoryId]);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);
    return () => clearTimeout(handler);
  }, [search]);

  // Fetch paginated trips for today
  useEffect(() => {
    setTripsLoading(true);
    getTodayTrips({
      page: tripsPage,
      size: 10,
      search: debouncedSearch,
    })
      .then((data) => {
        setTrips(data.content || []);
        setTripsTotalPages(data.totalPages || 1);
        setTripsTotalElements(data.totalElements || 0);
      })
      .catch(() => {
        setTrips([]);
      })
      .finally(() => setTripsLoading(false));
  }, [factoryId, tripsPage, debouncedSearch, refreshTripsFlag]);

  // recentActivities removed

  // Inventory Health Metrics (Replacing Operations Progress)
  const inventoryHealth = [
    {
      key: "supply",
      label: "Leaf Supply Fulfillment",
      completed: dashboardSummary?.completedSuppliers || 0,
      target: dashboardSummary?.totalActiveSuppliers || 0,
      percentage:
        dashboardSummary && dashboardSummary.totalActiveSuppliers > 0
          ? Math.round(
            (dashboardSummary.completedSuppliers /
              dashboardSummary.totalActiveSuppliers) *
            100
          )
          : 0,
      icon: TrendingUp,
      status: "Operational"
    },
    {
      key: "requests",
      label: "Pending Supply Requests",
      completed: dashboardSummary?.pendingLeafRequests || 0,
      target: 20, // Example soft limit/target
      percentage: Math.min(100, Math.round(((dashboardSummary?.pendingLeafRequests || 0) / 20) * 100)),
      icon: RefreshCw,
      status: dashboardSummary?.pendingLeafRequests > 10 ? "High Volume" : "Normal"
    },
    {
      key: "fertilizer",
      label: "Fertilizer Stock Health",
      completed: Math.max(0, (dashboardSummary?.fertilizer?.topCategories?.length || 0) - (dashboardSummary?.fertilizer?.lowStockCount || 0)),
      target: dashboardSummary?.fertilizer?.topCategories?.length || 0,
      percentage:
        dashboardSummary?.fertilizer?.topCategories?.length > 0
          ? Math.round(
            ((dashboardSummary.fertilizer.topCategories.length - dashboardSummary.fertilizer.lowStockCount) /
              dashboardSummary.fertilizer.topCategories.length) *
            100
          )
          : 100,
      icon: Package,
      status: dashboardSummary?.fertilizer?.lowStockCount > 0 ? "Action Required" : "Stocked"
    },
  ];

  // Helper functions for colors
  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "delayed":
        return "bg-red-100 text-red-800 border-red-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return "bg-green-500";
    if (progress >= 50) return "bg-emerald-500";
    if (progress >= 25) return "bg-yellow-500";
    return "bg-red-500";
  };

  // Tab button that uses the deep green style
  const TabButton = ({ id, label, icon, active, onClick }) => (
    <button
      onClick={() => onClick(id)}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium
        transition-all duration-200
        border border-gray-200
        ${active ? "shadow-md" : "hover:bg-[#d0e9e2] hover:text-[#01251F]"}
      `}
      style={
        active
          ? { backgroundColor: "#01251F", color: "#fff" }
          : { backgroundColor: "#fff", color: "#222" }
      }
    >
      {React.createElement(icon, { className: "h-4 w-4" })}
      {label}
    </button>
  );

  // MetricCard with enhanced UI design
  const MetricCard = ({ title, value, trend, icon, color = "gray" }) => {
    const colorClasses = {
      emerald: "bg-emerald-50 text-emerald-700 group-hover:bg-emerald-100",
      blue: "bg-blue-50 text-blue-700 group-hover:bg-blue-100",
      amber: "bg-amber-50 text-amber-700 group-hover:bg-amber-100",
      gray: "bg-gray-50 text-gray-700 group-hover:bg-gray-100",
    };

    return (
      <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 hover:border-gray-200 group">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-500 mb-1 uppercase tracking-wide">
              {title}
            </p>
            <p className="text-3xl font-bold text-gray-900 leading-tight">
              {value}
            </p>
          </div>
          <div className="flex-shrink-0 ml-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors duration-200 ${colorClasses[color] || colorClasses.gray}`}>
              {React.createElement(icon, {
                className: "w-6 h-6",
              })}
            </div>
          </div>
        </div>
        {trend && (
          <div className="flex items-center mt-3 pt-3 border-t border-gray-50">
            <TrendingUp className="w-4 h-4 text-emerald-600 mr-2" />
            <span className="text-sm font-medium text-emerald-600">
              {trend}
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SupplierHeader />

      {/* Navigation Tabs Removed */}


      {/* Main Content */}
      <div className="max-w-8xl mx-auto p-4">
        {/* Overview content remains, activeTab check is now always true for overview */}
        <div className="space-y-6">
          {/* Key Metrics: Cards from API */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Active Routes"
              value={dashboardSummary?.totalActiveRoutes ?? "-"}
              icon={MapPin}
              color="emerald"
            />
            <MetricCard
              title="Target Suppliers"
              value={dashboardSummary?.todaySuppliers ?? "-"}
              icon={User}
              color="blue"
            />
            <MetricCard
              title="Total Bags"
              value={dashboardSummary?.totalBags ?? "-"}
              icon={Weight}
              color="amber"
            />
            <MetricCard
              title="Gross Weight"
              value={`${dashboardSummary?.totalGrossWeight ?? 0} kg`}
              icon={Scale}
              color="gray"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Inventory Health from API */}
            <div
              className="bg-white rounded-xl shadow-sm p-6 border transition-all duration-300 hover:shadow-md"
              style={{ borderColor: "#cfece6" }}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-900">Operational Health & Supply</h3>
                <div className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                  Real-time Status
                </div>
              </div>
              <div className="space-y-6">
                {inventoryHealth.map((data) => (
                   <div key={data.key} className="group">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-gray-50 rounded-lg group-hover:bg-emerald-50 transition-colors">
                          <data.icon className="w-4 h-4 text-gray-500 group-hover:text-emerald-600" />
                        </div>
                        <span className="text-sm font-bold text-gray-700">{data.label}</span>
                      </div>
                      <span className="text-xs font-black text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                        {data.completed} / {data.target}
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden mb-2">
                      <div
                        className="h-full rounded-full transition-all duration-1000 ease-out shadow-sm"
                        style={{
                          width: `${Math.min(data.percentage, 100)}%`,
                          background: `linear-gradient(90deg, #165E52 0%, #32bda3 100%)`,
                        }}
                      ></div>
                    </div>
                    <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-wider">
                      <span className="text-gray-400">{data.status}</span>
                      <span className="text-emerald-600">{data.percentage}% Completed</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Fertilizer Summary */}
            <div
              className="bg-white rounded-xl shadow-sm p-6 border flex flex-col"
              style={{ borderColor: "#cfece6" }}
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold text-gray-900">Fertilizer Status</h3>
                <div className="bg-emerald-50 px-3 py-1 rounded-full text-xs font-bold text-emerald-700 border border-emerald-100">
                  Active Stock
                </div>
              </div>
              
              <div className="flex-1 space-y-4">
                <div className="bg-gray-50 rounded-xl p-4 border border-dashed border-gray-200">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Total Available</p>
                  <p className="text-3xl font-extrabold text-gray-900">
                    {dashboardSummary?.fertilizer?.totalAvailable?.toLocaleString() ?? 0} <span className="text-lg font-medium text-gray-500">kg</span>
                  </p>
                </div>

                <div className="space-y-3">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Top Categories</p>
                  {dashboardSummary?.fertilizer?.topCategories?.length > 0 ? (
                    dashboardSummary.fertilizer.topCategories.map((cat, i) => (
                      <div key={i} className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 font-medium">{cat.categoryName}</span>
                        <span className="text-sm font-bold text-gray-900">{cat.availableKg.toLocaleString()} kg</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-400 italic">No inventory recorded</p>
                  )}
                </div>
              </div>

              <button 
                onClick={() => navigate("/inventoryManager/fertilizer-inventory")}
                className="mt-6 w-full py-2 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-bold hover:bg-emerald-100 transition-colors border border-emerald-200"
              >
                Manage Inventory
              </button>
            </div>
          </div>

          {/* Leaf Management */}
          <div
            className="bg-white rounded-lg shadow-md p-6"
            style={{ border: "1px solid #cfece6" }}
          >
            <h3 className="text-lg font-semibold mb-4" style={{ color: "#000000" }}>
              Leaf Management
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
              <button
                type="button"
                onClick={() => navigate("/inventoryManager/leaf-inventory")}
                className="bg-white border border-gray-200 rounded-xl p-5 text-left hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-gray-700" />
                  </div>
                  <div>
                    <div className="text-base font-semibold text-gray-900">Leaf Inventory</div>
                    <div className="text-sm text-gray-600">Request leaves, track supply status, and receive stock</div>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Fertilizer Management */}
          <div
            className="bg-white rounded-lg shadow-md p-6"
            style={{ border: "1px solid #cfece6" }}
          >
            <h3 className="text-lg font-semibold mb-4" style={{ color: "#000000" }}>
              Fertilizer Management
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => navigate("/inventoryManager/fertilizer-inventory")}
                className="bg-white border border-gray-200 rounded-xl p-5 text-left hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center">
                    <Package className="w-6 h-6 text-gray-700" />
                  </div>
                  <div>
                    <div className="text-base font-semibold text-gray-900">Fertilizer Inventory</div>
                    <div className="text-sm text-gray-600">Receive stock, record usage, view summary</div>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => navigate("/inventoryManager/fertilizer-companies")}
                className="bg-white border border-gray-200 rounded-xl p-5 text-left hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center">
                    <Package className="w-6 h-6 text-gray-700" />
                  </div>
                  <div>
                    <div className="text-base font-semibold text-gray-900">Fertilizer Company Registration</div>
                    <div className="text-sm text-gray-600">Add/edit fertilizer suppliers and categories</div>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
