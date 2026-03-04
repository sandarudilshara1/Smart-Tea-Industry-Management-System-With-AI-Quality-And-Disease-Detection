// Payment utility functions

// Download CSV function for bank payments
export const downloadCSV = (filteredData, selectedRoute) => {
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

// Calculate payment statistics for all routes - UNIFIED CALCULATION
export const getPaymentStatistics = (
  suppliers,
  routes,
  selectedMonth,
  selectedYear
) => {
  // Filter suppliers by payment date (same logic as main dashboard)
  const allSuppliers = suppliers.filter((supplier) => {
    if (supplier.paymentDate) {
      const paymentDate = new Date(supplier.paymentDate);
      return (
        paymentDate.getMonth() === selectedMonth &&
        paymentDate.getFullYear() === selectedYear
      );
    }
    return true;
  });

  // Calculate totals using finalAmount (consistent with dashboard summary)
  const totalAmount = allSuppliers.reduce(
    (sum, supplier) => sum + supplier.finalAmount,
    0
  );

  const bankPayments = allSuppliers.filter((s) => s.paymentMethod === "Bank");
  const cashPayments = allSuppliers.filter((s) => s.paymentMethod === "Cash");

  const bankAmount = bankPayments.reduce(
    (sum, supplier) => sum + supplier.finalAmount,
    0
  );
  const cashAmount = cashPayments.reduce(
    (sum, supplier) => sum + supplier.finalAmount,
    0
  );

  // Group bank payments by route
  const bankPaymentsByRoute = routes
    .map((route) => {
      const routeBankPayments = bankPayments.filter(
        (s) => s.routeId === route.id
      );
      return {
        ...route,
        suppliers: routeBankPayments,
        totalAmount: routeBankPayments.reduce(
          (sum, s) => sum + s.finalAmount,
          0
        ),
        supplierCount: routeBankPayments.length,
      };
    })
    .filter((route) => route.suppliers.length > 0);

  // Group cash payments by route
  const cashPaymentsByRoute = routes
    .map((route) => {
      const routeCashPayments = cashPayments.filter(
        (s) => s.routeId === route.id
      );
      return {
        ...route,
        suppliers: routeCashPayments,
        totalAmount: routeCashPayments.reduce(
          (sum, s) => sum + s.finalAmount,
          0
        ),
        supplierCount: routeCashPayments.length,
      };
    })
    .filter((route) => route.suppliers.length > 0);

  return {
    totalAmount,
    bankAmount,
    cashAmount,
    bankPayments: bankPayments.length,
    cashPayments: cashPayments.length,
    bankPaymentsByRoute,
    cashPaymentsByRoute,
    // Additional data for consistency verification
    totalSuppliers: allSuppliers.length,
    allSuppliers, // Include all suppliers for debugging
  };
};

// Calculate summary statistics based on current view
export const calculateSummary = (currentView, filteredData) => {
  if (currentView === "routes") {
    const total = filteredData.reduce(
      (acc, route) => acc + route.totalAmount,
      0
    );
    const routeCount = filteredData.length;
    const supplierCount = filteredData.reduce(
      (acc, route) => acc + route.supplierCount,
      0
    );
    const totalWeight = filteredData.reduce(
      (acc, route) => acc + route.totalWeight,
      0
    );

    return {
      total,
      routeCount,
      supplierCount,
      totalWeight,
      paid: 0,
      pending: 0,
      bankPayments: 0,
      cashPayments: 0,
    };
  } else if (currentView === "suppliers") {
    const total = filteredData.reduce(
      (acc, supplier) => acc + supplier.finalAmount,
      0
    );
    const totalWeight = filteredData.reduce(
      (acc, supplier) => acc + supplier.totalWeight,
      0
    );
    const paid = filteredData
      .filter((s) => s.status === "Paid")
      .reduce((acc, s) => acc + s.finalAmount, 0);
    const pending = filteredData
      .filter((s) => s.status === "Pending")
      .reduce((acc, s) => acc + s.finalAmount, 0);
    const bankPayments = filteredData.filter(
      (s) => s.paymentMethod === "Bank"
    ).length;
    const cashPayments = filteredData.filter(
      (s) => s.paymentMethod === "Cash"
    ).length;

    return { total, totalWeight, paid, pending, bankPayments, cashPayments };
  }
  return { total: 0, paid: 0, pending: 0, bankPayments: 0, cashPayments: 0 };
};

// Filter data based on current view, filters, and selected month/year
export const filterData = (
  currentView,
  routes,
  suppliers,
  selectedRoute,
  selectedSupplier,
  filters,
  selectedMonth,
  selectedYear
) => {
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
        route.routeName.toLowerCase().includes(filters.search.toLowerCase()) ||
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
};

// Get current data based on view (for filter summary)
export const getCurrentData = (
  currentView,
  routes,
  suppliers,
  selectedRoute,
  selectedSupplier
) => {
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

// Unified summary calculation to ensure consistency between dashboard and modal
export const getUnifiedSummary = (
  suppliers,
  routes,
  selectedMonth,
  selectedYear,
  currentView,
  filters = {},
  selectedRoute = null
) => {
  // ALWAYS get the same payment statistics as the modal - this is the source of truth
  const paymentStats = getPaymentStatistics(
    suppliers,
    routes,
    selectedMonth,
    selectedYear
  );

  if (currentView === "routes") {
    // For routes view, still show route-based data but use payment modal totals for consistency
    const filteredRoutes = routes.filter((route) => {
      const matchesSearch =
        !filters.search ||
        route.routeName.toLowerCase().includes(filters.search.toLowerCase()) ||
        route.routeNumber.toLowerCase().includes(filters.search.toLowerCase());
      return matchesSearch;
    });

    // Calculate route-specific stats for display
    const routeCount = filteredRoutes.length;
    const supplierCount = filteredRoutes.reduce(
      (acc, route) => acc + route.supplierCount,
      0
    );
    const totalWeight = filteredRoutes.reduce(
      (acc, route) => acc + route.totalWeight,
      0
    );

    return {
      total: paymentStats.totalAmount, // USE PAYMENT MODAL TOTAL - SOURCE OF TRUTH
      routeCount,
      supplierCount,
      totalWeight,
      paid: 0,
      pending: 0,
      bankPayments: paymentStats.bankPayments, // USE PAYMENT MODAL COUNTS
      cashPayments: paymentStats.cashPayments, // USE PAYMENT MODAL COUNTS
      // Add payment stats for consistency verification
      paymentModalTotal: paymentStats.totalAmount,
      paymentModalBank: paymentStats.bankAmount,
      paymentModalCash: paymentStats.cashAmount,
    };
  } else if (currentView === "suppliers") {
    // For suppliers view, filter by selected route first, then apply additional filters
    let routeSuppliers = paymentStats.allSuppliers;

    // If a route is selected, filter suppliers for that route only
    if (selectedRoute) {
      routeSuppliers = paymentStats.allSuppliers.filter(
        (supplier) => supplier.routeId === selectedRoute.id
      );
    }

    // Apply additional filters if provided
    const filteredSuppliers = routeSuppliers.filter((supplier) => {
      const matchesStatus =
        !filters.status ||
        filters.status === "All" ||
        supplier.status === filters.status;
      const matchesPaymentMethod =
        !filters.paymentMethod ||
        filters.paymentMethod === "All" ||
        supplier.paymentMethod === filters.paymentMethod;
      const matchesSearch =
        !filters.search ||
        supplier.supplierName
          .toLowerCase()
          .includes(filters.search.toLowerCase()) ||
        supplier.id.toLowerCase().includes(filters.search.toLowerCase());

      return matchesStatus && matchesPaymentMethod && matchesSearch;
    });

    // Apply sorting if provided
    let sortedSuppliers = [...filteredSuppliers];
    if (filters.sortOrder) {
      sortedSuppliers.sort((a, b) => {
        if (filters.sortOrder === "high") {
          return b.finalAmount - a.finalAmount;
        } else if (filters.sortOrder === "low") {
          return a.finalAmount - b.finalAmount;
        }
        return 0;
      });
    }

    const total = sortedSuppliers.reduce(
      (acc, supplier) => acc + supplier.finalAmount,
      0
    );
    const totalWeight = sortedSuppliers.reduce(
      (acc, supplier) => acc + supplier.totalWeight,
      0
    );
    const paid = sortedSuppliers
      .filter((s) => s.status === "Paid")
      .reduce((acc, s) => acc + s.finalAmount, 0);
    const pending = sortedSuppliers
      .filter((s) => s.status === "Pending")
      .reduce((acc, s) => acc + s.finalAmount, 0);
    const bankPayments = sortedSuppliers.filter(
      (s) => s.paymentMethod === "Bank"
    ).length;
    const cashPayments = sortedSuppliers.filter(
      (s) => s.paymentMethod === "Cash"
    ).length;

    return {
      total,
      totalWeight,
      paid,
      pending,
      bankPayments,
      cashPayments,
      // Add payment stats for consistency verification
      paymentModalTotal: paymentStats.totalAmount,
      paymentModalBank: paymentStats.bankAmount,
      paymentModalCash: paymentStats.cashAmount,
      filteredSuppliers: sortedSuppliers,
    };
  }

  return {
    total: paymentStats.totalAmount, // ALWAYS use payment modal total
    paid: 0,
    pending: 0,
    bankPayments: paymentStats.bankPayments,
    cashPayments: paymentStats.cashPayments,
    paymentModalTotal: paymentStats.totalAmount,
    paymentModalBank: paymentStats.bankAmount,
    paymentModalCash: paymentStats.cashAmount,
  };
};
