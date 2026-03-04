import { useState, useMemo, useEffect } from "react";
import { useLocation } from "react-router-dom";
import PaymentHeader from "./PaymentHeader";
import PaymentFilters from "./PaymentFilters";
import PaymentModal from "./PaymentModal";
import SummaryCards from "./SummaryCards";
import MainContent from "./MainContent";
import {
  routes,
  suppliers,
  monthNames,
  availableYears,
  getAvailableMonths,
} from "./paymentData";
import { getPaymentStatistics, getUnifiedSummary } from "./paymentUtils";

export default function PaymentManagement() {
  // Navigation state
  const [currentView, setCurrentView] = useState("routes"); // "routes", "suppliers", "bill"
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  // Month/Year selection state - set to current month/year by default
  const [selectedMonth, setSelectedMonth] = useState(5); // June (0-indexed, so 5 = June)
  const [selectedYear, setSelectedYear] = useState(2025);

  // Payment processing state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showDownloadDialog, setShowDownloadDialog] = useState(false);

  const [filters, setFilters] = useState({
    search: "",
    sortOrder: "",
    status: "All",
    paymentMethod: "All",
  });

  // Filter data based on current view, filters, and selected month/year
  const filteredData = useMemo(() => {
    // Get current data based on view
    let data = [];
    if (currentView === "routes") {
      data = routes;
    } else if (currentView === "suppliers" && selectedRoute) {
      data = suppliers.filter(
        (supplier) => supplier.routeId === selectedRoute.id
      );
    } else if (currentView === "bill" && selectedSupplier) {
      data = selectedSupplier;
    }

    // Apply date filtering based on selected month/year
    if (currentView === "suppliers") {
      data = data.filter((supplier) => {
        if (supplier.paymentDate) {
          const paymentDate = new Date(supplier.paymentDate);
          return (
            paymentDate.getMonth() === selectedMonth &&
            paymentDate.getFullYear() === selectedYear
          );
        }
        return true; // Include suppliers without payment date for now
      });
    }

    // Apply filters
    let filteredResult = [];
    if (currentView === "routes") {
      filteredResult = data.filter(
        (route) =>
          filters.search === "" ||
          route.routeName
            .toLowerCase()
            .includes(filters.search.toLowerCase()) ||
          route.routeNumber.toLowerCase().includes(filters.search.toLowerCase())
      );
    } else if (currentView === "suppliers") {
      filteredResult = data.filter((supplier) => {
        const matchesStatus =
          filters.status === "All" || supplier.status === filters.status;
        const matchesPaymentMethod =
          filters.paymentMethod === "All" ||
          supplier.paymentMethod === filters.paymentMethod;
        const matchesSearch =
          filters.search === "" ||
          supplier.supplierName
            .toLowerCase()
            .includes(filters.search.toLowerCase()) ||
          supplier.id.toLowerCase().includes(filters.search.toLowerCase());

        return matchesStatus && matchesPaymentMethod && matchesSearch;
      });
    } else {
      filteredResult = data;
    }

    // Apply sorting
    if (filters.sortOrder && currentView === "suppliers") {
      filteredResult = [...filteredResult].sort((a, b) => {
        if (filters.sortOrder === "high") {
          return b.finalAmount - a.finalAmount; // High to low
        } else if (filters.sortOrder === "low") {
          return a.finalAmount - b.finalAmount; // Low to high
        }
        return 0;
      });
    } else if (filters.sortOrder && currentView === "routes") {
      filteredResult = [...filteredResult].sort((a, b) => {
        if (filters.sortOrder === "high") {
          return b.totalAmount - a.totalAmount; // High to low
        } else if (filters.sortOrder === "low") {
          return a.totalAmount - b.totalAmount; // Low to high
        }
        return 0;
      });
    }

    return filteredResult;
  }, [
    currentView,
    selectedRoute,
    selectedSupplier,
    filters,
    selectedMonth,
    selectedYear,
  ]);

  // Get current data based on view (for filter summary)
  const getCurrentData = () => {
    if (currentView === "routes") {
      return routes;
    } else if (currentView === "suppliers" && selectedRoute) {
      return suppliers.filter(
        (supplier) => supplier.routeId === selectedRoute.id
      );
    } else if (currentView === "bill" && selectedSupplier) {
      return selectedSupplier;
    }
    return [];
  };

  // Calculate summary statistics based on current view - UNIFIED WITH PAYMENT MODAL
  const summary = useMemo(() => {
    return getUnifiedSummary(
      suppliers,
      routes,
      selectedMonth,
      selectedYear,
      currentView,
      filters,
      selectedRoute // Pass selectedRoute for route-specific calculations
    );
  }, [currentView, selectedMonth, selectedYear, filters, selectedRoute]);

  // Payment processing functions
  const openPaymentModal = () => {
    setShowPaymentModal(true);
  };

  const closePaymentModal = () => {
    setShowPaymentModal(false);
    setShowConfirmation(false); // Reset confirmation when closing modal
    setShowConfirmDialog(false); // Reset dialog when closing modal
    setShowDownloadDialog(false); // Reset download dialog when closing modal
  };

  const handleConfirmPayments = () => {
    setShowConfirmDialog(true);
  };

  const handleConfirmYes = () => {
    setShowConfirmDialog(false);
    setShowConfirmation(true);
  };

  const handleConfirmNo = () => {
    setShowConfirmDialog(false);
  };

  const handleDownloadCSV = () => {
    if (!showConfirmation) return; // Only allow download after payments are confirmed
    setShowDownloadDialog(true);
  };

  const handleDownloadConfirmYes = () => {
    setShowDownloadDialog(false);
    downloadCSV();
  };

  const handleDownloadConfirmNo = () => {
    setShowDownloadDialog(false);
  };

  // Navigation functions
  const viewRoute = (route) => {
    setSelectedRoute(route);
    setCurrentView("suppliers");
    setFilters({
      search: "",
      sortOrder: "",
      status: "All",
      paymentMethod: "All",
    }); // Reset filters
  };

  // If a routeName query param is present, auto-select that route
  const location = useLocation();
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const routeName = params.get("routeName");
    if (routeName) {
      const found = routes.find(r => r.routeName === routeName || r.routeNumber === routeName || r.id === routeName);
      if (found) {
        viewRoute(found);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  const viewSupplierBill = (supplier) => {
    setSelectedSupplier(supplier);
    setCurrentView("bill");
  };

  const handleGoBack = (targetView) => {
    if (targetView === "routes") {
      setCurrentView("routes");
      setSelectedRoute(null);
      setFilters({
        search: "",
        sortOrder: "",
        status: "All",
        paymentMethod: "All",
      });
    } else if (targetView === "suppliers") {
      setCurrentView("suppliers");
      setSelectedSupplier(null);
    }
  };

  const downloadCSV = () => {
    if (currentView !== "suppliers") return;

    const bankPayments = filteredData.filter((s) => s.paymentMethod === "Bank");

    const csvHeaders = [
      "Supplier ID",
      "Supplier Name",
      "Account Number",
      "Bank",
      "Branch",
      "Amount",
      "Reference",
    ];

    const csvData = bankPayments.map((supplier) => [
      supplier.id,
      supplier.supplierName,
      "ACC" + supplier.id.slice(-3) + "001", // Mock account number
      "Commercial Bank",
      "Main Branch",
      supplier.finalAmount.toFixed(2),
      `Payment for Tea Leaves - ${supplier.id}`,
    ]);

    const csvContent = [csvHeaders, ...csvData]
      .map((row) => row.map((field) => `"${field}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `bank_payments_${selectedRoute?.routeNumber || "route"}_${
      new Date().toISOString().split("T")[0]
    }.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      sortOrder: "",
      status: "All",
      paymentMethod: "All",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PaymentHeader
        currentView={currentView}
        selectedRoute={selectedRoute}
        selectedSupplier={selectedSupplier}
        onGoBack={handleGoBack}
        onProceedPayments={openPaymentModal}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        setSelectedMonth={setSelectedMonth}
        setSelectedYear={setSelectedYear}
        monthNames={monthNames}
        availableYears={availableYears}
        getAvailableMonths={getAvailableMonths}
      />
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Summary Cards - show before filters for routes and suppliers views */}
        {currentView !== "bill" && (
          <SummaryCards currentView={currentView} summary={summary} />
        )}

        {/* Filters - show after summary cards */}
        {currentView !== "bill" && (
          <PaymentFilters
            filters={filters}
            setFilters={setFilters}
            currentView={currentView}
            filteredData={filteredData}
            getCurrentData={getCurrentData}
            onClearFilters={clearFilters}
          />
        )}

        {/* Main Content */}
        <MainContent
          currentView={currentView}
          filteredData={filteredData}
          summary={summary}
          getCurrentData={getCurrentData}
          onViewRoute={viewRoute}
          onViewSupplierBill={viewSupplierBill}
          onDownloadCSV={downloadCSV}
          selectedSupplier={selectedSupplier}
          selectedRoute={selectedRoute}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          monthNames={monthNames}
        />

        {/* Payment Modal - always render this at the end */}
        <PaymentModal
          showPaymentModal={showPaymentModal}
          closePaymentModal={closePaymentModal}
          paymentView="summary"
          showConfirmation={showConfirmation}
          showConfirmDialog={showConfirmDialog}
          showDownloadDialog={showDownloadDialog}
          handleConfirmPayments={handleConfirmPayments}
          handleConfirmYes={handleConfirmYes}
          handleConfirmNo={handleConfirmNo}
          handleDownloadCSV={handleDownloadCSV}
          handleDownloadConfirmYes={handleDownloadConfirmYes}
          handleDownloadConfirmNo={handleDownloadConfirmNo}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          monthNames={monthNames}
          stats={getPaymentStatistics(
            suppliers,
            routes,
            selectedMonth,
            selectedYear
          )}
        />
      </div>
    </div>
  );
}
