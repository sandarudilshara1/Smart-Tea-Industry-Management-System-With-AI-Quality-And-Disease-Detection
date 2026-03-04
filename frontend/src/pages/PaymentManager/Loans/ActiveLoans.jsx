import React, { useState, useEffect, useMemo } from "react";
import { getAllLoans } from "../../../api/loan";
import { Search, Filter, Eye, Calendar, DollarSign, Clock, TrendingUp, ChevronDown } from "lucide-react";
import LoanDetails from "./LoanDetails.jsx";
import { useNavigate } from 'react-router-dom';

// 🎨 Color tokens
const ACCENT_COLOR = "#165E52";
const BORDER_COLOR = "#cfece6";
const BG_LIGHT_GREEN = "#e1f4ef";

export default function ActiveLoans() {
  const navigate = useNavigate();
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    amountRange: "",
    duration: "",
  });

  // Fetch active loans from backend
  useEffect(() => {
    const fetchActiveLoans = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getAllLoans();
        console.log("Received loan data:", data); // Debug log
        // Filter only active/remaining loans and transform data
        const activeLoans = data
          .filter((loan) => loan.status.toLowerCase() === "remaining" || loan.status.toLowerCase() === "active")
          .map((loan) => ({
            id: loan.loanId?.toString() || "",
            loanId: loan.loanId,
            supplierId: loan.supplierId,
            supplierName: `Supplier ${loan.supplierId}`,
            totalLoan: parseFloat(loan.loanAmount),
            monthlyInstallment: parseFloat(loan.monthlyInstalment),
            duration: loan.months,
            status: loan.status.toLowerCase() === "remaining" ? "active" : loan.status.toLowerCase(),
            startDate: loan.date,
            remainingBalance: parseFloat(loan.remainingAmount),
            rateId: loan.rateId,
            // Calculate progress - assuming remaining amount includes interest
            totalLoanWithInterest: parseFloat(loan.monthlyInstalment) * loan.months,
            progress: loan.monthlyInstalment > 0 
              ? Math.max(0, ((parseFloat(loan.monthlyInstalment) * loan.months - parseFloat(loan.remainingAmount)) / (parseFloat(loan.monthlyInstalment) * loan.months)) * 100)
              : 0,
          }));
        console.log("Transformed active loans:", activeLoans); // Debug log
        setLoans(activeLoans);
      } catch (err) {
        console.error("Error fetching active loans:", err);
        setError("Failed to fetch active loans");
      }
      setLoading(false);
    };
    
    fetchActiveLoans();
  }, []);

  // Filter and search functionality
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    if (name === "search") {
      setSearchTerm(value);
    } else {
      setFilters((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const clearFilters = () => {
    setFilters({
      amountRange: "",
      duration: "",
    });
    setSearchTerm("");
  };

  const filteredLoans = useMemo(() => {
    return loans.filter((loan) => {
      const matchesSearch =
        loan.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loan.id.toLowerCase().includes(searchTerm.toLowerCase());

      let matchesAmount = true;
      if (filters.amountRange) {
        switch (filters.amountRange) {
          case "under10k":
            matchesAmount = loan.totalLoan < 10000;
            break;
          case "10k-50k":
            matchesAmount = loan.totalLoan >= 10000 && loan.totalLoan <= 50000;
            break;
          case "above50k":
            matchesAmount = loan.totalLoan > 50000;
            break;
          default:
            matchesAmount = true;
        }
      }

      let matchesDuration = true;
      if (filters.duration) {
        switch (filters.duration) {
          case "short":
            matchesDuration = loan.duration <= 6;
            break;
          case "medium":
            matchesDuration = loan.duration > 6 && loan.duration <= 12;
            break;
          case "long":
            matchesDuration = loan.duration > 12;
            break;
          default:
            matchesDuration = true;
        }
      }

      return matchesSearch && matchesAmount && matchesDuration;
    });
  }, [loans, searchTerm, filters]);

  const totalActiveLoans = loans.length;
  const totalActiveAmount = loans.reduce((sum, loan) => sum + loan.totalLoan, 0);
  const totalAmountWithInterest = loans.reduce((sum, loan) => sum + loan.totalLoanWithInterest, 0);
  const totalRemainingAmount = loans.reduce((sum, loan) => sum + loan.remainingBalance, 0);

  const handleViewDetails = (loan) => {
    setSelectedLoan(loan);
    setShowDetails(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-md border-b" style={{ borderColor: BORDER_COLOR }}>
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                style={{ fontWeight: '500' }}
              >
                &#8592; Back
              </button>
              <div>
                <h1 className="text-3xl font-bold mb-1" style={{ color: ACCENT_COLOR }}>
                  Active Loans
                </h1>
                <div className="text-lg  text-black-200  px-4 py-2 inline-block rounded-lg">
                  {/* Optionally add date or summary info here */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="max-w-7xl mx-auto px-6 pt-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md transition-transform hover:scale-[1.02] border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">Total Active Loans</p>
                <p className="text-2xl font-bold text-black">{totalActiveLoans}</p>
              </div>
              <div className="bg-blue-500 p-3 rounded-full">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md transition-transform hover:scale-[1.02] border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">Original Loan Amount</p>
                <p className="text-2xl font-bold text-black">Rs. {totalActiveAmount.toLocaleString()}</p>
              </div>
              <div className="bg-green-500 p-3 rounded-full">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md transition-transform hover:scale-[1.02] border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium">Total with Interest</p>
                <p className="text-2xl font-bold text-black">Rs. {totalAmountWithInterest.toLocaleString()}</p>
              </div>
              <div className="bg-purple-500 p-3 rounded-full">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md transition-transform hover:scale-[1.02] border border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600 text-sm font-medium">Total Remaining</p>
                <p className="text-2xl font-bold text-black">Rs. {totalRemainingAmount.toLocaleString()}</p>
              </div>
              <div className="bg-orange-500 p-3 rounded-full">
                <Clock className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters - Supplier Style Panel */}
        <div className="bg-white rounded-lg shadow-md border mb-8" style={{ borderColor: BORDER_COLOR }}>
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
                  style={{ backgroundColor: BG_LIGHT_GREEN, color: ACCENT_COLOR, border: `2px solid ${BORDER_COLOR}` }}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                  <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${showFilters ? "rotate-180" : ""}`} />
                </button>
              </div>
            </div>
            {/* Expanded Filters */}
            {showFilters && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg border" style={{ borderColor: BORDER_COLOR }}>
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
                    <option value="short">Short Term (≤6 months)</option>
                    <option value="medium">Medium Term (6-12 months)</option>
                    <option value="long">Long Term (&gt;12 months)</option>
                  </select>
                </div>
                {/* Clear */}
                <div className="flex items-end">
                  <button
                    onClick={clearFilters}
                    className="w-full px-4 py-2 text-sm font-medium rounded-md shadow-sm"
                    style={{ backgroundColor: BG_LIGHT_GREEN, color: ACCENT_COLOR, border: `2px solid ${BORDER_COLOR}` }}
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
          {/* Header Row */}
          <div style={{ backgroundColor: "#01251F", color: "white" }}>
            <div className="grid grid-cols-6 gap-4 p-4 font-medium text-sm text-center">
              <div>Loan ID</div>
              <div>Supplier</div>
              <div>Total Loan</div>
              <div>Total with Interest</div>
              <div>Status</div>
              <div>View</div>
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {filteredLoans.map((loan) => (
              <div
                key={loan.id}
                className="grid grid-cols-6 gap-4 p-4 items-center hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
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
                <div className="text-sm text-gray-900 font-semibold text-center">
                  Rs. {loan.totalLoanWithInterest.toLocaleString()}
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
                    style={{ border: "1.5px solid #165E52", color: "#165E52" }}
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
                  <DollarSign className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  No active loans found
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

        {/* Loan Details Modal */}
        {showDetails && selectedLoan && (
          <LoanDetails
            loan={selectedLoan}
            onClose={() => {
              setShowDetails(false);
              setSelectedLoan(null);
            }}
          />
        )}
      </div>
    </div>
  );
}