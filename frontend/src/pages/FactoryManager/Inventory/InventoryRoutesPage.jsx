import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import InventoryHeader from "./InventoryHeader";
import InventoryFilters from "./InventoryFilters";
import SummaryCards from "./SummaryCards";
import MainContent from "./MainContent";
import PaginationControls from "../../../components/ui/PaginationControls";
import {
  routes,
  monthNames,
  availableYears,
  getAvailableMonths,
} from "./inventoryData";
import { getInventoryStatistics } from "./inventoryUtils";
import { useAuth } from "../../../contexts/AuthContext";
import {
  getInventorySummary,
  getInventoryRoutes,
} from "../../../api/factoryManagerDashboard";

export default function InventoryRoutesPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // View mode state - daily or monthly
  const [viewMode, setViewMode] = useState(location.state?.viewMode || "daily");

  // Date selection state
  const [selectedDate, setSelectedDate] = useState(
    location.state?.selectedDate || new Date().toISOString().split("T")[0]
  );

  // Month/Year selection state for monthly view
  const [selectedMonth, setSelectedMonth] = useState(
    location.state?.selectedMonth ?? new Date().getMonth()
  );
  const [selectedYear, setSelectedYear] = useState(
    location.state?.selectedYear ?? new Date().getFullYear()
  );

  const [filters, setFilters] = useState({
    search: "",
    sortOrder: "",
    status: "All",
    storageType: "All",
  });

  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(filters.search), 500);
    return () => clearTimeout(timer);
  }, [filters.search]);

  const [summary, setSummary] = useState({});

  // Pagination state
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [routesData, setRoutesData] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);

  // Reset page to 0 when filters change
  useEffect(() => {
    setPage(0);
  }, [filters.search, filters.sortOrder]);

  // Fetch routes data
  useEffect(() => {
    const fetchRoutes = async () => {
      if (!user?.factoryId) return;

      setLoading(true);
      try {
        const params = {
          page,
          size,
          search: debouncedSearch,
          sortDir: filters.sortOrder === "asc" ? "asc" : "desc",
        };

        if (viewMode === "daily") {
          params.date = selectedDate;
        } else if (viewMode === "monthly") {
          params.month = selectedMonth + 1;
          params.year = selectedYear;
        }

        const data = await getInventoryRoutes(user.factoryId, viewMode, params);
        setRoutesData(data.content || []);
        setTotalPages(data.totalPages || 0);
        setTotalElements(data.totalElements || 0);
      } catch (error) {
        console.error("Failed to fetch inventory routes:", error);
        // Fallback to dummy data
        setRoutesData(routes);
        setTotalPages(Math.ceil(routes.length / size));
        setTotalElements(routes.length);
      } finally {
        setLoading(false);
      }
    };

    fetchRoutes();
  }, [
    user,
    viewMode,
    selectedDate,
    selectedMonth,
    selectedYear,
    page,
    size,
    debouncedSearch,
    filters.sortOrder,
  ]);

  // Fetch summary data
  useEffect(() => {
    const fetchSummary = async () => {
      if (!user?.factoryId) return;

      try {
        const params =
          viewMode === "daily"
            ? { date: selectedDate }
            : { month: selectedMonth + 1, year: selectedYear };
        const data = await getInventorySummary(
          user.factoryId,
          viewMode,
          params
        );
        console.log("Fetched Inventory Summary Data:", data);
        // Transform API data to match component expectations
        const transformedData = {
          totalWeight: data.totalGrossWeight || 0,
          totalBags: data.totalBags || 0,
          netWeight: data.totalNetWeight || 0,
        };
        setSummary(transformedData);
      } catch (error) {
        console.error("Failed to fetch inventory summary:", error);
        // Fallback to dummy data calculation
        setSummary(getInventoryStatistics(routes));
      }
    };

    fetchSummary();
  }, [user, viewMode, selectedDate, selectedMonth, selectedYear]);

  const handleViewRoute = (route) => {
    navigate(`/factoryManager/inventory/routes/${route.routeId || route.id}`, {
      state: { route, viewMode, selectedDate, selectedMonth, selectedYear },
    });
  };

  const handleDownloadCSV = () => {
    const csvContent = generateCSV(routesData, "routes");
    downloadCSV(csvContent, `inventory_routes_${Date.now()}.csv`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <InventoryHeader
        currentView="routes"
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        onMonthChange={setSelectedMonth}
        onYearChange={setSelectedYear}
        monthNames={monthNames}
        availableYears={availableYears}
        getAvailableMonths={getAvailableMonths}
      />
      <div className="max-w-7xl mx-auto px-6 py-6">
        <SummaryCards summary={summary} currentView="routes" />

        <InventoryFilters
          filters={filters}
          onFiltersChange={setFilters}
          currentView="routes"
        />

        <MainContent
          currentView="routes"
          filteredData={routesData}
          summary={summary}
          getCurrentData={() => routesData}
          onViewRoute={handleViewRoute}
          onDownloadCSV={handleDownloadCSV}
          viewMode={viewMode}
          selectedDate={selectedDate}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          monthNames={monthNames}
          loading={loading}
        />

        <PaginationControls
          page={page}
          totalPages={totalPages}
          totalElements={totalElements}
          setPage={setPage}
        />
      </div>
    </div>
  );
}

// Helper functions for CSV generation and download
function generateCSV(data, viewType) {
  if (viewType === "routes") {
    const headers = [
      "Route ID",
      "Route Name",
      "Total Weight",
      "Supplier Count",
      "Status",
    ];
    const rows = data.map((route) => [
      route.id,
      route.routeName,
      route.totalWeight,
      route.supplierCount,
      route.status,
    ]);
    return [headers, ...rows].map((row) => row.join(",")).join("\n");
  }
  return "";
}

function downloadCSV(content, filename) {
  const blob = new Blob([content], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
}
