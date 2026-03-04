import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";

import InventoryHeader from "./InventoryHeader";
import MainContent from "./MainContent";

import {
  routes,
  suppliers,
  monthNames,
  availableYears,
  getAvailableMonths,
} from "./inventoryData";

import { getSupplierMonthlySummary } from "../../../api/factoryManagerDashboard";

export default function InventorySupplierDetailPage() {
  const { routeId, supplierId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const selectedRoute = routes.find((route) => route.id === routeId) || {
    id: routeId,
    name: `Route ${routeId}`,
    location: "Unknown",
  };
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

  const [supplierData, setSupplierData] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleBackToRoutes = () => {
    navigate("/factoryManager/inventory", {
      state: { viewMode, selectedDate, selectedMonth, selectedYear },
    });
  };

  const handleBackToSuppliers = () => {
    navigate(`/factoryManager/inventory/routes/${routeId}`, {
      state: {
        route: selectedRoute,
        viewMode,
        selectedDate,
        selectedMonth,
        selectedYear,
      },
    });
  };

  // Fetch supplier data
  useEffect(() => {
    const fetchSupplierData = async () => {
      if (!supplierId) return;

      setLoading(true);
      try {
        const data = await getSupplierMonthlySummary(
          supplierId,
          selectedMonth + 1,
          selectedYear
        );
        // Transform API data to match component expectations
        const transformedData = {
          id: data.supplierId,
          supplierName: data.supplierName,
          contactNumber: data.contactNumber,
          lastDelivery: data.lastDelivery,
          totalNetWeight: data.totalNetWeight,
          totalBags: data.totalBags,
        };
        setSupplierData(transformedData);
        console.log("Fetched Supplier Data:", transformedData);
      } catch (error) {
        console.error("Failed to fetch supplier data:", error);
        // Fallback to hard-coded data
        const fallbackSupplier =
          suppliers.find((s) => s.id === supplierId) || suppliers[0];
        setSupplierData(fallbackSupplier);
      } finally {
        setLoading(false);
      }
    };

    fetchSupplierData();
  }, [supplierId, selectedMonth, selectedYear]);

  const selectedSupplier = supplierData;

  if (!selectedRoute) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Route Not Found
          </h2>
          <div className="space-x-4">
            <button
              onClick={handleBackToRoutes}
              className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition"
            >
              Back to Routes
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading supplier details...</p>
        </div>
      </div>
    );
  }

  if (!selectedSupplier) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Supplier Not Found
          </h2>
          <div className="space-x-4">
            <button
              onClick={handleBackToRoutes}
              className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition"
            >
              Back to Routes
            </button>
            <button
              onClick={handleBackToSuppliers}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition"
            >
              Back to Suppliers
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <InventoryHeader
        currentView="detail"
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
        onBackToSuppliers={handleBackToSuppliers}
      />

      <div className="max-w-7xl mx-auto px-6 py-6">
        <MainContent
          currentView="detail"
          filteredData={[selectedSupplier]}
          selectedSupplier={selectedSupplier}
          selectedRoute={selectedRoute}
          viewMode={viewMode}
          selectedDate={selectedDate}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          monthNames={monthNames}
        />
      </div>
    </div>
  );
}
