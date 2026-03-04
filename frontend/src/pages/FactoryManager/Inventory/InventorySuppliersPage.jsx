import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";

import InventoryHeader from "./InventoryHeader";
import InventoryFilters from "./InventoryFilters";
import SummaryCards from "./SummaryCards";
import MainContent from "./MainContent";

import {
  routes,
  suppliers,
  monthNames,
  availableYears,
  getAvailableMonths,
} from "./inventoryData";

import { getUnifiedSummary } from "./inventoryUtils";
import { useAuth } from "../../../contexts/AuthContext";
import {
  getInventorySummary,
  getInventoryRouteSuppliers,
} from "../../../api/factoryManagerDashboard";

const ACCENT_COLOR = "#01251F";

export default function InventorySuppliersPage() {
  const { routeId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const selectedRoute =
    location.state?.route || routes.find((route) => route.id === routeId);

  const [viewMode, setViewMode] = useState(location.state?.viewMode || "daily");
  const [selectedDate, setSelectedDate] = useState(
    location.state?.selectedDate || new Date().toISOString().split("T")[0]
  );
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

  const [suppliersData, setSuppliersData] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);

  // Fetch summary data
  useEffect(() => {
    const fetchSummary = async () => {
      if (!user?.factoryId || !routeId) return;

      try {
        const params =
          viewMode === "daily"
            ? { date: selectedDate, routeId }
            : { month: selectedMonth + 1, year: selectedYear, routeId };
        const data = await getInventorySummary(
          user.factoryId,
          viewMode,
          params
        );
        console.log("Fetched Inventory Summary Data for Route:", data);
        // Transform API data to match component expectations
        const transformedData = {
          totalWeight: data.totalGrossWeight || 0,
          totalBags: data.totalBags || 0,
          netWeight: data.totalNetWeight || 0,
        };
        setSummary(transformedData);
      } catch (error) {
        console.error("Failed to fetch inventory summary for route:", error);
        // Fallback to dummy data calculation
        const dummyData = suppliers.filter((s) => s.routeId === routeId);
        setSummary(getUnifiedSummary(dummyData));
      }
    };

    fetchSummary();
  }, [user, routeId, viewMode, selectedDate, selectedMonth, selectedYear]);

  // Fetch suppliers data
  useEffect(() => {
    const fetchSuppliers = async () => {
      if (!user?.factoryId || !routeId) return;

      setLoading(true);
      try {
        const params = {
          page,
          size: 10,
          search: debouncedSearch,
          sortDir: filters.sortOrder === "asc" ? "asc" : "desc",
        };
        if (viewMode === "daily") {
          params.date = selectedDate;
        } else if (viewMode === "monthly") {
          params.month = selectedMonth + 1;
          params.year = selectedYear;
        }
        const data = await getInventoryRouteSuppliers(
          routeId,
          viewMode,
          params
        );
        const mappedData = data.content.map((supplier) => ({
          id: supplier.supplierId,
          supplierName: supplier.supplierName,
          totalWeight: supplier.totalWeight,
          totalBags: supplier.totalBags,
          totalNetWeight: supplier.totalNetWeight,
        }));
        setSuppliersData(mappedData);
        setTotalPages(data.totalPages);
        setTotalElements(data.totalElements);
      } catch (error) {
        console.error("Failed to fetch suppliers data:", error);
        setSuppliersData([]);
        setTotalPages(0);
        setTotalElements(0);
      } finally {
        setLoading(false);
      }
    };

    fetchSuppliers();
  }, [
    user,
    routeId,
    viewMode,
    selectedDate,
    selectedMonth,
    selectedYear,
    page,
    debouncedSearch,
    filters.sortOrder,
  ]);

  const handleViewSupplierDetail = (supplier) => {
    navigate(`/factoryManager/inventory/routes/${routeId}/${supplier.id}`, {
      state: { viewMode, selectedDate, selectedMonth, selectedYear },
    });
  };

  const handleBackToRoutes = () => {
    navigate("/factoryManager/inventory", {
      state: { viewMode, selectedDate, selectedMonth, selectedYear },
    });
  };

  if (!selectedRoute) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Route Not Found
          </h2>
          <button
            onClick={handleBackToRoutes}
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700"
          >
            Back to Routes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <InventoryHeader
        currentView="suppliers"
        selectedRoute={selectedRoute}
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
        onBackToRoutes={handleBackToRoutes}
      />

      <div className="max-w-7xl mx-auto px-6 py-6">
        <SummaryCards summary={summary} currentView="suppliers" />

        <InventoryFilters
          filters={filters}
          onFiltersChange={setFilters}
          currentView="suppliers"
        />

        <MainContent
          currentView="suppliers"
          suppliersData={suppliersData}
          filteredData={suppliersData}
          summary={summary}
          onViewSupplierDetail={handleViewSupplierDetail}
          page={page}
          totalPages={totalPages}
          totalElements={totalElements}
          setPage={setPage}
          loading={loading}
          ACCENT_COLOR={ACCENT_COLOR}
        />
      </div>
    </div>
  );
}
