import React, { useState, useMemo, useEffect } from "react";
import { fetchLoanRequests, createLoanRequest } from "../../../api/factoryManager";
import { Search, Filter, ChevronDown, Eye, ExternalLink } from "lucide-react";
import LoanDetails from "./LoanDetails.jsx";
import { approveLoanRequest } from "../../../api/loan";
import { Users, Clock, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getLoanStats, getFilteredLoans } from "../../../api/paymentManager";

// 🎨 Color tokens
const ACCENT_COLOR = "#165E52";
const BORDER_COLOR = "#cfece6";
const BG_LIGHT_GREEN = "#e1f4ef";



export default function LoanManagement() {
  const navigate = useNavigate();
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [apiLoanStats, setApiLoanStats] = useState({
    completedLoanCount: 0,
    completedLoanTotal: 0,
    approvedLoanCount: 0,
    approvedLoanTotal: 0,
    pendingLoanRequestCount: 0,
    pendingLoanRequestTotal: 0
  });
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  // Default view is active to match the API call with REMAINING status
  const [currentView, setCurrentView] = useState("active");
  const [filters, setFilters] = useState({
    search: "",
    amountRange: "",
    duration: "",
    year: "",
    route: "",
  });

  // Fetch loans from backend based on current view
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Get current month and year
        const date = new Date();
        const currentMonth = date.getMonth() + 1; // JavaScript months are 0-based
        const currentYear = date.getFullYear();
        
        if (currentView === "active") {
          // Call the API with REMAINING status to get active loans
          const activeLoans = await getFilteredLoans(1, "REMAINING", currentMonth, currentYear);
          
          // Format the data to match the expected structure
          const formattedLoans = activeLoans.map(loan => ({
            id: loan.loanId.toString(),
            supplierName: loan.supplierName,
            totalLoan: loan.loanAmount,
            monthlyInstallment: loan.monthlyInstalment,
            duration: loan.months,
            status: "active", // Set status to active for these loans
            requestDate: loan.date,
            remainingBalance: loan.loanAmount, // Assuming the full amount is remaining
            repaymentLog: [],
            route: "",
            startDate: loan.date,
          }));
          
          setLoans(formattedLoans);
        } else if (currentView === "pending") {
          // For pending loans, use fetchLoanRequests
          const data = await fetchLoanRequests();
          
          // Format the data
          const allLoans = data.map((loan) => ({
            id: loan.reqId?.toString() || "",
            supplierName: loan.supplierId ? `Supplier ${loan.supplierId}` : "Unknown",
            totalLoan: loan.amount,
            monthlyInstallment: loan.months ? Math.round(Number(loan.amount) / loan.months) : 0,
            duration: loan.months,
            status: loan.status?.toLowerCase() || "pending",
            requestDate: loan.date,
            remainingBalance: loan.amount,
            repaymentLog: [],
            route: "",
            startDate: loan.date,
          }));
          
          setLoans(allLoans);
        }
      } catch (err) {
        setError("Failed to fetch loan requests: " + err.message);
      }
      setLoading(false);
    };
    fetchData();
  }, [currentView]); // Now depends on currentView to reload data when view changes

  // Date selection state
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  // Month names for display
  const monthNames = [
    "January", "February", "March", "April", "May", "June", "July",
    "August", "September", "October", "November", "December"
  ];

  // Generate available years (current year and previous years)
  const availableYears = Array.from(
    { length: 10 },
    (_, i) => currentDate.getFullYear() - i
  );
  
  // Fetch loan stats from API
  useEffect(() => {
    const fetchLoanStats = async () => {
      try {
        const statsData = await getLoanStats(1, selectedMonth + 1, selectedYear);
        setApiLoanStats(statsData);
      } catch (err) {
        console.error("Failed to fetch loan stats:", err);
      }
    };
    fetchLoanStats();
  }, [selectedMonth, selectedYear]);

  // Generate available months based on selected year
  const getAvailableMonths = (year) => {
    if (year === currentDate.getFullYear()) {
      return Array.from({ length: currentDate.getMonth() + 1 }, (_, i) => i);
    } else {
      return Array.from({ length: 12 }, (_, i) => i);
    }
  };

  // Filter logic remains unchanged ...
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    if (name === "search") setSearchTerm(value);
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      amountRange: "",
      duration: "",
      year: "",
      route: "",
    });
    setSearchTerm("");
  };

  // Filter by view and by selected month/year
  const filterByView = (loans, view) => {
    switch (view) {
      case "pending": return loans.filter((loan) => loan.status === "pending");
      case "active": return loans.filter((loan) => loan.status === "active"); // These are loans with "REMAINING" status from API
      case "completed": return loans.filter((loan) => loan.status === "completed");
      case "overdue": return loans.filter((loan) => loan.status === "overdue");
      case "defaulted": return loans.filter((loan) => loan.status === "defaulted");
      default: return loans;
    }
  };

  const loansBySelectedDate = useMemo(() => {
    return loans.filter((loan) => {
      // ... exact logic unchanged from above
      // (paste here your logic for filtering loans by selected month/year)
      // For brevity, see above provided code block
      // ---
      // Copy filtering logic from your snippet
      const loanStartDate = new Date(loan.startDate);
      if (loan.status === "completed") {
        const hasPaymentInMonth = loan.repaymentLog?.some((payment) => {
          const paymentDate = new Date(payment.date);
          return (
            paymentDate.getMonth() === selectedMonth &&
            paymentDate.getFullYear() === selectedYear
          );
        });
        return hasPaymentInMonth;
      }
      if (loan.status === "pending") {
        const requestDate = new Date(loan.requestDate);
        return (
          requestDate.getMonth() === selectedMonth &&
          requestDate.getFullYear() === selectedYear
        );
      }
      if (
        loan.status === "active" ||
        loan.status === "overdue" ||
        loan.status === "defaulted"
      ) {
        const monthsSinceStart =
          (selectedYear - loanStartDate.getFullYear()) * 12 +
          (selectedMonth - loanStartDate.getMonth());
        return monthsSinceStart >= 0 && monthsSinceStart < loan.duration;
      }
      return false;
    });
  }, [loans, selectedMonth, selectedYear]);

  const filteredLoans = useMemo(() => {
    let viewFilteredLoans = filterByView(loansBySelectedDate, currentView);
    return viewFilteredLoans.filter((loan) => {
      const matchesSearch =
        loan.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loan.id.toLowerCase().includes(searchTerm.toLowerCase());
      // Amount range filter, Duration filter, Year filter (from your original code)
      let matchesAmount = true;
      if (filters.amountRange) {
        switch (filters.amountRange) {
          case "under10k": matchesAmount = loan.totalLoan < 10000; break;
          case "10k-50k": matchesAmount = loan.totalLoan >= 10000 && loan.totalLoan <= 50000; break;
          case "above50k": matchesAmount = loan.totalLoan > 50000; break;
          default: matchesAmount = true;
        }
      }
      let matchesDuration = true;
      if (filters.duration) {
        switch (filters.duration) {
          case "short": matchesDuration = loan.duration <= 3; break;
          case "medium": matchesDuration = loan.duration > 3 && loan.duration <= 6; break;
          case "long": matchesDuration = loan.duration > 6; break;
          default: matchesDuration = true;
        }
      }
      let matchesYear = true;
      if (filters.year && loan.status === "completed") {
        const year = parseInt(filters.year);
        matchesYear = loan.repaymentLog.some((payment) => new Date(payment.date).getFullYear() === year);
      }
      let matchesRoute = true;
      if (filters.route) matchesRoute = loan.route === filters.route;
      return (
        matchesSearch &&
        matchesAmount &&
        matchesDuration &&
        matchesYear &&
        matchesRoute
      );
    });
  }, [loansBySelectedDate, searchTerm, currentView, filters]);

  // Metrics
  const loanStats = useMemo(() => {
    // All summary statistics, see your previous code above for reference.
    // ... [use same calculations]
    const totalLoans = loansBySelectedDate.length;
    const pendingLoans = loansBySelectedDate.filter((loan) => loan.status === "pending").length;
    const activeLoans = loansBySelectedDate.filter((loan) => loan.status === "active").length;
    const completedLoans = loansBySelectedDate.filter((loan) => loan.status === "completed").length;
    const overdueLoans = loansBySelectedDate.filter((loan) => loan.status === "overdue").length;
    const defaultedLoans = loansBySelectedDate.filter((loan) => loan.status === "defaulted").length;
    const totalLoanAmount = loansBySelectedDate.reduce((sum, loan) => sum + loan.totalLoan, 0);
    const totalOutstanding = loansBySelectedDate.reduce((sum, loan) => sum + loan.remainingBalance, 0);
    const pendingLoanAmount = loansBySelectedDate.filter((loan) => loan.status === "pending").reduce((sum, loan) => sum + loan.totalLoan, 0);
    const activeLoanAmount = loansBySelectedDate.filter((loan) => loan.status === "active").reduce((sum, loan) => sum + loan.totalLoan, 0);
    const completedLoanAmount = loansBySelectedDate.filter((loan) => loan.status === "completed").reduce((sum, loan) => sum + loan.totalLoan, 0);
    const overdueLoanAmount = loansBySelectedDate.filter((loan) => loan.status === "overdue").reduce((sum, loan) => sum + loan.totalLoan, 0);
    const defaultedLoanAmount = loansBySelectedDate.filter((loan) => loan.status === "defaulted").reduce((sum, loan) => sum + loan.totalLoan, 0);
    return {
      totalLoans,
      pendingLoans,
      activeLoans,
      completedLoans,
      overdueLoans,
      defaultedLoans,
      totalLoanAmount,
      totalOutstanding,
      pendingLoanAmount,
      activeLoanAmount,
      completedLoanAmount,
      overdueLoanAmount,
      defaultedLoanAmount,
    };
  }, [loansBySelectedDate]);

  // Details handlers
  const handleViewDetails = (loan) => {
    setSelectedLoan(loan);
    setShowDetails(true);
  };
  const handleBackToList = () => { setShowDetails(false); setSelectedLoan(null); };

  // Create loan request (example usage)
  const handleCreateLoan = async (payload) => {
    try {
      setLoading(true);
      await createLoanRequest(payload);
      // Refresh loan list
      const data = await fetchLoanRequests();
      setLoans(
        data.map((loan) => ({
          id: loan.reqId?.toString() || "",
          supplierName: loan.supplierId ? `Supplier ${loan.supplierId}` : "Unknown",
          totalLoan: loan.amount,
          monthlyInstallment: loan.months ? Math.round(Number(loan.amount) / loan.months) : 0,
          duration: loan.months,
          status: loan.status?.toLowerCase() || "pending",
          requestDate: loan.date,
          remainingBalance: loan.amount,
          repaymentLog: [],
          route: "",
          startDate: loan.date,
        }))
      );
    } catch (err) {
      setError("Failed to create loan request");
    }
    setLoading(false);
  };

  // Approval/rejection handlers (to be implemented)
  // Approval handler: call backend API and update UI
  const handleApproveLoan = async (loanId) => {
    try {
      await approveLoanRequest(loanId);
      setLoans((prevLoans) =>
        prevLoans.map((loan) =>
          loan.id === loanId ? { ...loan, status: "approved" } : loan
        )
      );
      // Optionally show notification or refresh data
    } catch (err) {
      setError("Failed to approve loan: " + err);
    }
  };
  const handleRejectLoan = (loanId, reason) => {
    // Implement backend call if needed
  };

  if (showDetails && selectedLoan) {
    return (
      <LoanDetails
        loan={selectedLoan}
        onBack={handleBackToList}
        onApprove={handleApproveLoan}
        onReject={handleRejectLoan}
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#165E52]"></div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg text-red-600">{error}</div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-md border-b" style={{ borderColor: BORDER_COLOR }}>
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-1" style={{ color: ACCENT_COLOR }}>
                Loan Management
              </h1>
              <div className="text-lg  text-black-200  px-4 py-2 inline-block rounded-lg">
                {monthNames[selectedMonth]} {selectedYear}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Month:</label>
                <select
                  value={selectedMonth}
                  onChange={e => setSelectedMonth(parseInt(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-gray-900 font-medium"
                >
                  {getAvailableMonths(selectedYear).map(idx => (
                    <option key={idx} value={idx}>{monthNames[idx]}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Year:</label>
                <select
                  value={selectedYear}
                  onChange={e => {
                    const newYear = parseInt(e.target.value);
                    setSelectedYear(newYear);
                    const availableMonths = getAvailableMonths(newYear);
                    if (!availableMonths.includes(selectedMonth)) {
                      setSelectedMonth(availableMonths[availableMonths.length - 1]);
                    }
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-gray-900 font-medium"
                >
                  {availableYears.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="max-w-7xl mx-auto px-6 pt-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
  {[
    {
      type: "active",
      label: "Active Loans",
      value: apiLoanStats.approvedLoanTotal,
      count: apiLoanStats.approvedLoanCount,
      icon: <Users size={30} color="black" />,
      borderColor: "#165E52",
      ringColor: "ring-[#165E52]/30",
    },
    {
      type: "pending",
      label: "Pending Loans",
      value: apiLoanStats.pendingLoanRequestTotal,
      count: apiLoanStats.pendingLoanRequestCount,
      icon: <Clock size={30} color="black" />,
      borderColor: "#f59e0b",
      ringColor: "ring-[#f59e0b]/30",
    },
    {
      type: "completed",
      label: "Completed Loans",
      value: apiLoanStats.completedLoanTotal,
      count: apiLoanStats.completedLoanCount,
      icon: <Users size={30} color="black" />,
      borderColor: "#1d4ed8", // blue-700
      ringColor: "ring-[#1d4ed8]/30",
    },
  ].map((card) => (
    <div
      key={card.type}
      onClick={async () => {
        setCurrentView(card.type);
        
        // Call the API to fetch loans based on card type
        if (card.type === "active") {
          try {
            setLoading(true);
            // Get current month and year
            const date = new Date();
            const currentMonth = date.getMonth() + 1; // JavaScript months are 0-based
            const currentYear = date.getFullYear();
            
            // Call the API with REMAINING status for active loans
            const activeLoans = await getFilteredLoans(1, "REMAINING", currentMonth, currentYear);
            
            // Format the data to match the expected structure
            const formattedLoans = activeLoans.map(loan => ({
              id: loan.loanId.toString(),
              supplierName: loan.supplierName,
              totalLoan: loan.loanAmount,
              monthlyInstallment: loan.monthlyInstalment,
              duration: loan.months,
              status: "active", // Set status to active for these loans
              requestDate: loan.date,
              remainingBalance: loan.loanAmount, // Assuming the full amount is remaining
              repaymentLog: [],
              route: "",
              startDate: loan.date,
            }));
            
            setLoans(formattedLoans);
          } catch (err) {
            setError("Failed to fetch active loans: " + err.message);
          } finally {
            setLoading(false);
          }
        } else if (card.type === "pending") {
          try {
            setLoading(true);
            // For pending loans, we need to use fetchLoanRequests which includes pending loans
            const data = await fetchLoanRequests();
            
            // Format the data and filter only the pending loans
            const allLoans = data.map((loan) => ({
              id: loan.reqId?.toString() || "",
              supplierName: loan.supplierId ? `Supplier ${loan.supplierId}` : "Unknown",
              totalLoan: loan.amount,
              monthlyInstallment: loan.months ? Math.round(Number(loan.amount) / loan.months) : 0,
              duration: loan.months,
              status: loan.status?.toLowerCase() || "pending",
              requestDate: loan.date,
              remainingBalance: loan.amount,
              repaymentLog: [],
              route: "",
              startDate: loan.date,
            }));
            
            // Use all loans for display, the view filter will handle showing only pending ones
            setLoans(allLoans);
          } catch (err) {
            setError("Failed to fetch pending loans: " + err.message);
          } finally {
            setLoading(false);
          }
        }
      }}
      className={`bg-white p-6 rounded-lg shadow-md cursor-pointer transition-transform hover:scale-[1.02] ${
        currentView === card.type ? `${card.ringColor} ring-2` : ""
      }`}
      style={{
        border: `1px solid ${card.borderColor}`,
      }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-black">{card.label}</p>
          <p className="text-3xl font-bold text-black">
            {card.count}
          </p>
          <p className="text-xs text-gray-600">Rs. {card.value.toLocaleString()}</p>
        </div>
        <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center">
          {card.icon}
        </div>
      </div>
    </div>
  ))}
</div>


        {/* Filters - Supplier Style Panel */}
        <div
          className="bg-white rounded-lg shadow-md border mb-8"
          style={{ borderColor: BORDER_COLOR }}
        >
          <div className="p-4">
            {/* Search & Toggle */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-4">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search by supplier or loan ID..."
                    name="search"
                    value={searchTerm}
                    onChange={handleFilterChange}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#165E52] text-gray-900"
                    style={{ borderColor: BORDER_COLOR }}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors shadow-sm"
                  style={{
                    backgroundColor: BG_LIGHT_GREEN,
                    color: ACCENT_COLOR,
                    border: `2px solid ${BORDER_COLOR}`,
                  }}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                  <ChevronDown
                    className={`h-4 w-4 ml-2 transition-transform ${
                      showFilters ? "rotate-180" : ""
                    }`}
                  />
                </button>
              </div>
            </div>
            {/* Expanded Filters */}
            {showFilters && (
              <div
                className={`grid grid-cols-1 ${currentView === "completed" ? "sm:grid-cols-5" : "sm:grid-cols-4"} gap-4 p-4 bg-gray-50 rounded-lg border`}
                style={{ borderColor: BORDER_COLOR }}
              >
                {/* Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Amount Range</label>
                  <select
                    name="amountRange"
                    value={filters.amountRange}
                    onChange={handleFilterChange}
                    className="w-full p-2 rounded-md text-sm focus:ring-2 focus:ring-[#165E52] text-gray-900"
                    style={{ borderColor: BORDER_COLOR }}
                  >
                    <option value="">All Amounts</option>
                    <option value="under10k">Under Rs. 10,000</option>
                    <option value="10k-50k">Rs. 10,000 - 50,000</option>
                    <option value="above50k">Above Rs. 50,000</option>
                  </select>
                </div>
                {/* Duration */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                  <select
                    name="duration"
                    value={filters.duration}
                    onChange={handleFilterChange}
                    className="w-full p-2 rounded-md text-sm focus:ring-2 focus:ring-[#165E52] text-gray-900"
                    style={{ borderColor: BORDER_COLOR }}
                  >
                    <option value="">All Durations</option>
                    <option value="short">Short Term (≤3 months)</option>
                    <option value="medium">Medium Term (4-6 months)</option>
                    <option value="long">Long Term (&gt;6 months)</option>
                  </select>
                </div>
                {/* Route */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Route</label>
                  <select
                    name="route"
                    value={filters.route}
                    onChange={handleFilterChange}
                    className="w-full p-2 rounded-md text-sm focus:ring-2 focus:ring-[#165E52] text-gray-900"
                    style={{ borderColor: BORDER_COLOR }}
                  >
                    <option value="">All Routes</option>
                    <option value="Route A">Route A</option>
                    <option value="Route B">Route B</option>
                    <option value="Route C">Route C</option>
                    <option value="Route D">Route D</option>
                    <option value="Route E">Route E</option>
                  </select>
                </div>
                {/* Year (for completed only) */}
                {currentView === "completed" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Activity Year</label>
                    <select
                      name="year"
                      value={filters.year}
                      onChange={handleFilterChange}
                      className="w-full p-2 rounded-md text-sm focus:ring-2 focus:ring-[#165E52] text-gray-900"
                      style={{ borderColor: BORDER_COLOR }}
                    >
                      <option value="">All Years</option>
                      {availableYears.map(year => <option key={year} value={year}>{year}</option>)}
                    </select>
                  </div>
                )}
                {/* Clear */}
                <div className="flex items-end">
                  <button
                    onClick={clearFilters}
                    className="w-full px-4 py-2 text-sm font-medium rounded-md shadow-sm"
                    style={{
                      backgroundColor: BG_LIGHT_GREEN,
                      color: ACCENT_COLOR,
                      border: `2px solid ${BORDER_COLOR}`,
                    }}
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Table */}
       {/* Loan Table - Styled like SupplierTable */}
<div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
  {/* Header Row */}
  <div style={{ backgroundColor: "#01251F", color: "white" }}>
    <div className="grid grid-cols-5 gap-4 p-4 font-medium text-sm text-center">
      <div>Loan ID</div>
      <div>Supplier</div>
      <div>Total Loan</div>
      <div>Status</div>
      <div>View</div>
    </div>
  </div>

  <div className="divide-y divide-gray-200">
    {filteredLoans.map((loan) => (
      <div
        key={loan.id}
        className="grid grid-cols-5 gap-4 p-4 items-center hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
      >
        <div className="text-center font-semibold text-green-600 text-sm">
          {loan.id}
        </div>
        <div className="text-sm text-gray-900 font-medium text-center">
          {loan.supplierName}
        </div>
        <div className="text-sm text-gray-900 font-semibold text-center">
          Rs. {loan.totalLoan.toLocaleString()}
        </div>
        <div className="text-sm font-semibold text-center"
          style={{
            color:
              loan.status === "active"
                ? "#16a34a"
                : loan.status === "overdue"
                ? "#ea580c"
                : loan.status === "defaulted"
                ? "#dc2626"
                : "#6b7280",
          }}
        >
          {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
        </div>
        <div className="flex justify-center">
          <button
            onClick={() => handleViewDetails(loan)}
            className="p-2 rounded-full transition-colors"
            title="View Details"
            style={{
              border: "1.5px solid #165E52",
              color: "#165E52",
            }}
          >
            <Eye className="h-4 w-4" />
          </button>
        </div>
      </div>
    ))}

    {/* Empty State */}
    {filteredLoans.length === 0 && (
      <div className="p-12 text-center text-gray-500">
        <div className="bg-gray-100 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
          <Users className="h-10 w-10 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">
          No loans found
        </h3>
        <p className="text-gray-600 text-sm">
          Try adjusting your filters or search...
        </p>
      </div>
    )}
  </div>

  {/* Optional: Pagination Footer (remove if not paginating) */}
  
  <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 text-sm text-gray-600">
    Showing 1–10 of {filteredLoans.length} loans
  </div>
 
</div>


        {/* Footer */}
       
      </div>
    </div>
  );
}
