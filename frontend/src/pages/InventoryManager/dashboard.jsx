import React, { useState, useEffect } from "react";
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
  const factoryId = user?.factoryId;

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const data = await getInventoryManagerDashboardSummary(factoryId);
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
    if (!factoryId) return;
    setTripsLoading(true);
    getTodayTrips(factoryId, {
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

  // Example daily targets (replace with real if available)
  const dailyTargets = [
    {
      key: "routes",
      label: "Routes",
      completed: dashboardSummary?.completedRoutes || 0,
      target: dashboardSummary?.totalActiveRoutes || 0,
      percentage:
        dashboardSummary && dashboardSummary.totalActiveRoutes > 0
          ? Math.round(
              (dashboardSummary.completedRoutes /
                dashboardSummary.totalActiveRoutes) *
                100
            )
          : 0,
    },
    {
      key: "bags",
      label: "Bags",
      completed: dashboardSummary?.totalBags || 0,
      target: dashboardSummary?.estimatedTotalBags || 0,
      percentage:
        dashboardSummary && dashboardSummary.estimatedTotalBags > 0
          ? Math.round(
              (dashboardSummary.totalBags /
                dashboardSummary.estimatedTotalBags) *
                100
            )
          : 0,
    },
    {
      key: "suppliers",
      label: "Suppliers",
      completed: dashboardSummary?.completedSuppliers || 0,
      target: dashboardSummary?.todaySuppliers || 0,
      percentage:
        dashboardSummary && dashboardSummary.todaySuppliers > 0
          ? Math.round(
              (dashboardSummary.completedSuppliers /
                dashboardSummary.todaySuppliers) *
                100
            )
          : 0,
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
  const MetricCard = ({ title, value, trend, icon }) => {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 hover:border-gray-200 group">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-2 uppercase tracking-wide">
              {title}
            </p>
            <p className="text-3xl font-bold text-gray-900 leading-tight">
              {value}
            </p>
          </div>
          <div className="flex-shrink-0 ml-4">
            <div className="w-14 h-14 bg-gray-50 rounded-xl flex items-center justify-center group-hover:bg-gray-100 transition-colors duration-200">
              {React.createElement(icon, {
                className: "w-7 h-7 text-gray-700",
              })}
            </div>
          </div>
        </div>
        {trend && (
          <div className="flex items-center pt-2 border-t border-gray-50">
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

      {/* Navigation Tabs */}
      <div className="bg-gray-100 border-b border-gray-200">
        <div className="max-w-8xl mx-auto px-4 py-3">
          <div className="flex gap-2 overflow-x-auto">
            <TabButton
              id="overview"
              label="Overview"
              icon={BarChart3}
              active={activeTab === "overview"}
              onClick={setActiveTab}
            />
            <TabButton
              id="routes"
              label="Active Routes"
              icon={MapPin}
              active={activeTab === "routes"}
              onClick={setActiveTab}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-8xl mx-auto p-4">
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Key Metrics: Cards from API */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <MetricCard
                title="Active Routes"
                value={dashboardSummary?.totalActiveRoutes ?? "-"}
                icon={MapPin}
              />
              <MetricCard
                title="Today's Suppliers"
                value={dashboardSummary?.todaySuppliers ?? "-"}
                icon={User}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <MetricCard
                title="Total Bags"
                value={dashboardSummary?.totalBags ?? "-"}
                icon={Weight}
              />
              <MetricCard
                title="Gross Weight"
                value={dashboardSummary?.totalGrossWeight ?? "-"}
                icon={Scale}
              />
            </div>

            {/* Daily Progress from API */}
            <div
              className="bg-white rounded-lg shadow-md p-6"
              style={{ border: "1px solid #cfece6" }}
            >
              <h3
                className="text-lg font-semibold mb-4"
                style={{ color: "#000000" }}
              >
                Daily Progress
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {dailyTargets.map((data) => (
                  <div key={data.key} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span
                        className="text-sm font-medium"
                        style={{ color: "#222" }}
                      >
                        {data.label}
                      </span>
                      <span className="text-sm text-gray-500">
                        {data.completed}/{data.target}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="h-3 rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(data.percentage, 100)}%`,
                          background:
                            data.percentage >= 80
                              ? "#278756ff"
                              : data.percentage >= 60
                              ? "#32bda3"
                              : data.percentage >= 40
                              ? "#57ce7fff"
                              : "#ef4444",
                        }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-600">
                      {data.percentage}% completed
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Active Routes Tab */}
        {activeTab === "routes" && (
          <div className="space-y-6">
            <div
              className="bg-white rounded-lg shadow-md p-6"
              style={{ border: "1px solid #cfece6" }}
            >
              <div className="flex justify-between items-center mb-4">
                <h3
                  className="text-lg font-semibold"
                  style={{ color: "#165e52" }}
                >
                  Active Routes Monitoring
                </h3>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setTripsPage(0);
                    }}
                    placeholder="Search routes"
                    className="border border-gray-300 rounded px-3 py-2 text-sm w-full max-w-xs focus:outline-none focus:ring-2 focus:ring-emerald-400 ml-4"
                    style={{ minWidth: 180 }}
                  />
                  <button
                    className="bg-gray-100 text-gray-700 px-3 py-2 rounded hover:bg-gray-200 transition-colors flex items-center"
                    title="Refresh"
                    onClick={() => setRefreshTripsFlag((f) => f + 1)}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                </div>
              </div>
              {tripsLoading ? (
                <div className="text-center py-8 text-gray-500">Loading...</div>
              ) : trips.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No trips found for today.
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {trips.map((trip) => (
                      <div
                        key={trip.tripId}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div>
                              <h4 className="font-semibold text-gray-900">
                                {trip.routeName} ({trip.routeCode})
                              </h4>
                              <p className="text-sm text-gray-600">
                                {trip.driverName}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                                trip.tripStatus
                              )}`}
                            >
                              {trip.tripStatus.charAt(0).toUpperCase() +
                                trip.tripStatus.slice(1)}
                            </span>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
                          <div className="text-center">
                            <p className="text-2xl font-bold text-emerald-600">
                              {/* Progress is not provided by API, so show percent of completed suppliers */}
                              {trip.totalSuppliers > 0
                                ? Math.round(
                                    (trip.completedSuppliers /
                                      trip.totalSuppliers) *
                                      100
                                  )
                                : 0}
                              %
                            </p>
                            <p className="text-xs text-gray-600">Progress</p>
                          </div>
                          <div className="text-center">
                            <p className="text-lg font-semibold text-gray-900">
                              {trip.completedSuppliers}/{trip.totalSuppliers}
                            </p>
                            <p className="text-xs text-gray-600">Suppliers</p>
                          </div>
                          <div className="text-center">
                            <p className="text-lg font-semibold text-gray-900">
                              {trip.totalBags}
                            </p>
                            <p className="text-xs text-gray-600">
                              Bags Collected
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-lg font-semibold text-emerald-700">
                              {trip.totalWeight} Kg
                            </p>
                            <p className="text-xs text-gray-600">
                              Total Weight
                            </p>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                          <div
                            className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(
                              trip.totalSuppliers > 0
                                ? Math.round(
                                    (trip.completedSuppliers /
                                      trip.totalSuppliers) *
                                      100
                                  )
                                : 0
                            )}`}
                            style={{
                              width: `${
                                trip.totalSuppliers > 0
                                  ? Math.round(
                                      (trip.completedSuppliers /
                                        trip.totalSuppliers) *
                                        100
                                    )
                                  : 0
                              }%`,
                            }}
                          ></div>
                        </div>
                        <div className="flex justify-between items-center text-sm text-gray-600">
                          <span></span>
                          <span>
                            Last Update: {trip.lastUpdate?.slice(0, 5) ?? "-"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <PaginationControls
                    page={tripsPage}
                    totalPages={tripsTotalPages}
                    totalElements={tripsTotalElements}
                    setPage={setTripsPage}
                  />
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
