import {
  AlertCircle,
  Bell,
  Calendar,
  CheckCircle,
  Clock,
  Download,
  Edit3,
  Eye,
  Factory,
  FileSpreadsheet,
  FileText,
  History,
  RefreshCw,
  Search,
  TrendingUp,
  User,
  X,
  XCircle,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import {
  getPendingTeaRates,
  getApprovedTeaRates,
  approveTeaRate,
  adjustTeaRate,
  exportTeaRateReport,
} from "../../../api/owner";

const OwnerDashboard = () => {
  const [activeTab, setActiveTab] = useState("pending");
  const [selectedFactory, setSelectedFactory] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [editingRate, setEditingRate] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showExportModal, setShowExportModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [exportConfig, setExportConfig] = useState({
    format: "pdf",
    reportType: "summary",
    dateRange: "current_month",
    includeCharts: true,
    includePending: true,
    includeApproved: true,
    includeRejected: true,
    factories: "all",
  });

  // State for pending and processed rates - will be populated from API
  const [pendingRates, setPendingRates] = useState([]);
  const [processedRates, setProcessedRates] = useState([]);
  const [approvedRates, setApprovedRates] = useState([]);
  const [factories, setFactories] = useState([]);

  // Function to fetch tea rates (pending) and approved rates from the backend
  const fetchTeaRates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch pending rates
      const data = await getPendingTeaRates();
      // Fetch approved rates
      const approvedData = await getApprovedTeaRates();

      // Transform the backend data to match frontend structure
      const transformedPending = data
        .filter(
          (item) => !item.status || item.status.toLowerCase() === "pending"
        )
        .map((item) => ({
          id: item.teaRateId,
          factoryName: item.factoryName,
          manager: item.userName,
          submittedDate: item.createdAt,
          month: item.month,
          currentRate: parseFloat(item.finalRatePerKg),
          proposedRate: parseFloat(item.monthlyRate),
          finalRate: parseFloat(item.finalRatePerKg),
          nsa: parseFloat(item.nsa),
          gsa: parseFloat(item.gsa),
          totalWeight: parseFloat(item.totalWeight),
          totalPayout: parseFloat(item.totalPayout),
          status: item.status ? item.status.toLowerCase() : "pending",
          urgent: false,
          adjustedRate: item.adjustedRate,
          adjustmentReason: item.adjustmentReason,
        }));

      const transformedApproved = approvedData.map((item) => ({
        id: item.teaRateId,
        factoryName: item.factoryName,
        manager: item.userName,
        submittedDate: item.createdAt,
        month: item.month,
        currentRate: parseFloat(item.finalRatePerKg),
        proposedRate: parseFloat(item.monthlyRate),
        finalRate: parseFloat(item.finalRatePerKg),
        nsa: parseFloat(item.nsa),
        gsa: parseFloat(item.gsa),
        totalWeight: parseFloat(item.totalWeight),
        totalPayout: parseFloat(item.totalPayout),
        status: item.status ? item.status.toLowerCase() : "approved",
        urgent: false,
        adjustedRate: item.adjustedRate,
        adjustmentReason: item.adjustmentReason,
      }));

      setPendingRates(transformedPending);
      setApprovedRates(transformedApproved);

      // Extract unique factories for filter dropdown
      const uniqueFactories = [
        ...new Set([...data, ...approvedData].map((item) => item.factoryName)),
      ];
      setFactories(uniqueFactories);
    } catch (err) {
      setError(`Failed to fetch tea rates: ${err.message}`);
      console.error("Error fetching tea rates:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch data on component mount
  useEffect(() => {
    fetchTeaRates();
  }, [fetchTeaRates]);

  // Refresh data function
  const refreshData = () => {
    fetchTeaRates();
  };

  // Approve or adjust tea rate by calling backend
  const handleApprove = async (rateId, adjustedRate = null, reason = "") => {
    setLoading(true);
    setError(null);
    try {
      let updatedRate;
      if (adjustedRate !== null) {
        updatedRate = await adjustTeaRate(rateId, adjustedRate, reason);
      } else {
        updatedRate = await approveTeaRate(rateId);
        if (!updatedRate.adjustedRate) {
          const orig = pendingRates.find((r) => r.id === rateId);
          if (orig) {
            updatedRate.adjustedRate = orig.proposedRate;
          }
        }
      }
      setPendingRates((prev) => prev.filter((r) => r.id !== rateId));
      setApprovedRates((prev) => [updatedRate, ...prev]);
      setProcessedRates((prev) => [updatedRate, ...prev]);
      setEditingRate(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = () => {
    const reportData = {
      generatedAt: new Date().toISOString(),
      config: exportConfig,
      data: {
        pending: exportConfig.includePending ? filteredRates(pendingRates) : [],
        approved: exportConfig.includeApproved
          ? filteredRates(approvedRates)
          : [],
        processed: [
          ...(exportConfig.includeApproved
            ? processedRates.filter((r) => r.status === "approved")
            : []),
          ...(exportConfig.includeRejected
            ? processedRates.filter((r) => r.status === "rejected")
            : []),
        ],
      },
      summary: {
        totalPendingRates: pendingRates.length,
        totalApprovedRates: approvedRates.length,
        totalRejectedRates: processedRates.filter(
          (r) => r.status === "rejected"
        ).length,
        totalFactories: factories.length,
        avgRateIncrease: 5.2,
        totalPayouts: [...approvedRates, ...processedRates].reduce(
          (sum, rate) => sum + (rate.totalPayout || 0),
          0
        ),
      },
    };

    if (exportConfig.format === "pdf") {
      generatePDFReport(reportData);
    } else if (exportConfig.format === "excel") {
      generateExcelReport(reportData);
    } else if (exportConfig.format === "csv") {
      generateCSVReport(reportData);
    }

    setShowExportModal(false);
  };

  const generatePDFReport = (data) => {
    const reportContent = `
Tea Rate Management Report
Generated on: ${new Date(data.generatedAt).toLocaleString()}

SUMMARY:
- Total Pending Rates: ${data.summary.totalPendingRates}
- Total Approved Rates: ${data.summary.totalApprovedRates}
- Total Rejected Rates: ${data.summary.totalRejectedRates}
- Total Factories: ${data.summary.totalFactories}
- Average Rate Increase: ${data.summary.avgRateIncrease}%
- Total Payouts: Rs. ${data.summary.totalPayouts.toLocaleString()}

PENDING RATES:
${data.data.pending
  .map(
    (rate) =>
      `Factory: ${rate.factoryName}
   Manager: ${rate.manager}
   Month: ${rate.month}
   Current Rate: Rs. ${rate.currentRate}
   Proposed Rate: Rs. ${rate.proposedRate}
   Total Weight: ${rate.totalWeight} kg
   Total Payout: Rs. ${rate.totalPayout.toLocaleString()}
   Status: ${rate.urgent ? "URGENT" : "Normal"}
   ---`
  )
  .join("\n")}

PROCESSED RATES:
${data.data.processed
  .map(
    (rate) =>
      `Factory: ${rate.factoryName}
   Manager: ${rate.manager}
   Month: ${rate.month}
   Original Rate: Rs. ${rate.originalRate}
   Final Rate: Rs. ${rate.finalRate}
   Status: ${rate.status.toUpperCase()}
   ${rate.adjustedBy ? `Adjusted by: ${rate.adjustedBy}` : ""}
   ${rate.reason ? `Reason: ${rate.reason}` : ""}
   ---`
  )
  .join("\n")}
    `;

    const blob = new Blob([reportContent], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tea-rate-report-${
      new Date().toISOString().split("T")[0]
    }.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const generateExcelReport = (data) => {
    const headers = [
      "Factory Name",
      "Manager",
      "Month",
      "Submission Date",
      "Current Rate",
      "Proposed/Final Rate",
      "Total Weight (kg)",
      "Total Payout (Rs.)",
      "Status",
      "Notes",
    ];

    const rows = [];

    data.data.pending.forEach((rate) => {
      rows.push([
        rate.factoryName,
        rate.manager,
        rate.month,
        rate.submittedDate,
        rate.currentRate,
        rate.proposedRate,
        rate.totalWeight,
        rate.totalPayout,
        rate.urgent ? "PENDING (URGENT)" : "PENDING",
        rate.urgent ? "Requires immediate attention" : "",
      ]);
    });

    data.data.processed.forEach((rate) => {
      rows.push([
        rate.factoryName,
        rate.manager,
        rate.month,
        rate.submittedDate,
        rate.originalRate,
        rate.finalRate,
        "", // weight not available in processed data
        rate.totalPayout || 0,
        rate.status.toUpperCase(),
        rate.reason ||
          (rate.adjustedBy ? `Adjusted by ${rate.adjustedBy}` : ""),
      ]);
    });

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tea-rate-report-${
      new Date().toISOString().split("T")[0]
    }.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const generateCSVReport = (data) => {
    generateExcelReport(data);
  };

  const ExportModal = () => (
    <div className="fixed inset-0 backdrop-blur-[2px] bg-white/60 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto border border-[#cfece6]">
        <div className="flex justify-between items-center p-6 border-b border-[#cfece6]">
          <h2 className="text-xl font-semibold text-[#165E52]">
            Export Report
          </h2>
          <button
            onClick={() => setShowExportModal(false)}
            className="text-[#165E52] opacity-80 hover:opacity-100"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Report Format */}
          <div>
            <label className="block text-sm font-medium text-[#165E52] mb-3">
              Report Format
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() =>
                  setExportConfig({ ...exportConfig, format: "pdf" })
                }
                className={`p-4 rounded-lg border-2 transition-all ${
                  exportConfig.format === "pdf"
                    ? "border-[#165E52] bg-[#e1f4ef]"
                    : "border-[#cfece6] hover:border-[#165E52]"
                }`}
              >
                <FileText className="w-8 h-8 mx-auto mb-2 text-red-600" />
                <div className="text-sm font-medium text-black">PDF Report</div>
                <div className="text-xs text-[#165E52] opacity-80">
                  Formatted document
                </div>
              </button>
              <button
                onClick={() =>
                  setExportConfig({ ...exportConfig, format: "excel" })
                }
                className={`p-4 rounded-lg border-2 transition-all ${
                  exportConfig.format === "excel"
                    ? "border-[#165E52] bg-[#e1f4ef]"
                    : "border-[#cfece6] hover:border-[#165E52]"
                }`}
              >
                <FileSpreadsheet className="w-8 h-8 mx-auto mb-2 text-green-600" />
                <div className="text-sm font-medium text-black">Excel</div>
                <div className="text-xs text-[#165E52] opacity-80">
                  Spreadsheet format
                </div>
              </button>
              <button
                onClick={() =>
                  setExportConfig({ ...exportConfig, format: "csv" })
                }
                className={`p-4 rounded-lg border-2 transition-all ${
                  exportConfig.format === "csv"
                    ? "border-[#165E52] bg-[#e1f4ef]"
                    : "border-[#cfece6] hover:border-[#165E52]"
                }`}
              >
                <FileText className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                <div className="text-sm font-medium text-black">CSV</div>
                <div className="text-xs text-[#165E52] opacity-80">
                  Raw data
                </div>
              </button>
            </div>
          </div>

          {/* Report Type */}
          <div>
            <label className="block text-sm font-medium text-[#165E52] mb-3">
              Report Type
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="reportType"
                  value="summary"
                  checked={exportConfig.reportType === "summary"}
                  onChange={(e) =>
                    setExportConfig({
                      ...exportConfig,
                      reportType: e.target.value,
                    })
                  }
                  className="mr-3 accent-[#165E52]"
                />
                <div>
                  <div className="font-medium text-black">Summary Report</div>
                  <div className="text-sm text-[#165E52] opacity-80">
                    Key metrics and overview
                  </div>
                </div>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="reportType"
                  value="detailed"
                  checked={exportConfig.reportType === "detailed"}
                  onChange={(e) =>
                    setExportConfig({
                      ...exportConfig,
                      reportType: e.target.value,
                    })
                  }
                  className="mr-3 accent-[#165E52]"
                />
                <div>
                  <div className="font-medium text-black">Detailed Report</div>
                  <div className="text-sm text-[#165E52] opacity-80">
                    Complete data with all fields
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-[#165E52] mb-3">
              Date Range
            </label>
            <div className="min-w-64 w-64">
              <select
                value={exportConfig.dateRange}
                onChange={(e) =>
                  setExportConfig({
                    ...exportConfig,
                    dateRange: e.target.value,
                  })
                }
                className="w-full px-4 py-2 border border-[#cfece6] rounded-lg bg-white text-black focus:ring-2 focus:ring-[#165E52] focus:border-[#165E52] appearance-none shadow-sm"
              >
                <option value="current_month">Current Month</option>
                <option value="last_month">Last Month</option>
                <option value="last_3_months">Last 3 Months</option>
                <option value="last_6_months">Last 6 Months</option>
                <option value="current_year">Current Year</option>
                <option value="all_time">All Time</option>
              </select>
            </div>
          </div>

          {/* Include Data Types */}
          <div>
            <label className="block text-sm font-medium text-[#165E52] mb-3">
              Include Data
            </label>
            <div className="min-w-64 w-64 bg-white rounded-lg p-4 border border-[#cfece6] shadow-sm">
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={exportConfig.includePending}
                    onChange={(e) =>
                      setExportConfig({
                        ...exportConfig,
                        includePending: e.target.checked,
                      })
                    }
                    className="mr-3 accent-[#165E52]"
                  />
                  <span className="text-black">
                    Pending Rates ({pendingRates.length})
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={exportConfig.includeApproved}
                    onChange={(e) =>
                      setExportConfig({
                        ...exportConfig,
                        includeApproved: e.target.checked,
                      })
                    }
                    className="mr-3 accent-green-600"
                  />
                  <span className="text-black">
                    Approved Rates ({approvedRates.length})
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={exportConfig.includeRejected}
                    onChange={(e) =>
                      setExportConfig({
                        ...exportConfig,
                        includeRejected: e.target.checked,
                      })
                    }
                    className="mr-3 accent-red-600"
                  />
                  <span className="text-black">
                    Rejected Rates (
                    {
                      processedRates.filter((r) => r.status === "rejected")
                        .length
                    }
                    )
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Factory Selection */}
          <div>
            <label className="block text-sm font-medium text-[#165E52] mb-3">
              Factories
            </label>
            <div className="min-w-64 w-64">
              <select
                value={exportConfig.factories}
                onChange={(e) =>
                  setExportConfig({
                    ...exportConfig,
                    factories: e.target.value,
                  })
                }
                className="w-full px-4 py-2 border border-[#cfece6] rounded-lg bg-white text-black focus:ring-2 focus:ring-[#165E52] focus:border-[#165E52] appearance-none shadow-sm"
              >
                <option value="all">All Factories</option>
                {factories.map((factory) => (
                  <option
                    key={factory}
                    value={factory}
                    className="bg-white text-black"
                  >
                    {factory}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Additional Options */}
          {exportConfig.format === "pdf" && (
            <div className="min-w-64 w-64 bg-white rounded-lg p-4 border border-[#cfece6] shadow-sm mt-4">
              <label className="block text-sm font-medium text-[#165E52] mb-3">
                Additional Options
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={exportConfig.includeCharts}
                  onChange={(e) =>
                    setExportConfig({
                      ...exportConfig,
                      includeCharts: e.target.checked,
                    })
                  }
                  className="mr-3 accent-purple-600"
                />
                <span className="text-black">Include Charts and Graphs</span>
              </label>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-[#cfece6] bg-[#f8fdfc]">
          <button
            onClick={() => setShowExportModal(false)}
            className="px-4 py-2 text-[#165E52] bg-white border border-[#cfece6] rounded-lg hover:bg-[#e1f4ef]"
          >
            Cancel
          </button>
          <button
            onClick={generateReport}
            className="px-6 py-2 bg-[#01251F] text-white rounded-lg hover:bg-[#01251F] flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Generate Report
          </button>
        </div>
      </div>
    </div>
  );

  const AdjustRateForm = ({ rate, onApprove, onCancel }) => {
    const [adjustedRate, setAdjustedRate] = useState(rate.proposedRate);
    const [reason, setReason] = useState("");
    return (
      <div className="mt-4 p-4 bg-[#e1f4ef] rounded-lg border border-[#cfece6] shadow-sm">
        <h4 className="font-semibold mb-3 text-[#165E52]">Adjust Rate</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#165E52] mb-1">
              Adjusted Rate (Rs.)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={adjustedRate}
              onChange={(e) => setAdjustedRate(e.target.value)}
              className="w-full p-2 border border-[#cfece6] rounded-lg focus:ring-2 focus:ring-[#165E52] focus:border-[#165E52] bg-white text-black"
              placeholder="Enter adjusted rate"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#165E52] mb-1">
              Adjustment Reason
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full p-2 border border-[#cfece6] rounded-lg focus:ring-2 focus:ring-[#165E52] focus:border-[#165E52] bg-white text-black"
              placeholder="Reason for adjustment"
            />
          </div>
        </div>
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => onApprove(Number(adjustedRate), reason)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
          >
            Apply & Approve
          </button>
          <button
            onClick={onCancel}
            className="bg-[#01251F] hover:bg-[#01251F] text-white px-4 py-2 rounded-lg"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  };

  const RateCard = ({ rate, type = "pending" }) => (
    <div
      className={`bg-white rounded-lg shadow-sm border-l-4 ${
        rate.urgent && type === "pending"
          ? "border-red-500"
          : type === "approved"
          ? "border-green-500"
          : rate.status === "approved"
          ? "border-green-500"
          : rate.status === "rejected"
          ? "border-red-500"
          : "border-[#165E52]"
      } border border-[#cfece6] p-6 mb-4`}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Factory className="w-5 h-5 text-[#165E52]" />
            <h3 className="text-lg font-semibold text-black">
              {rate.factoryName}
            </h3>
            {rate.urgent && type === "pending" && (
              <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Urgent
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-[#165E52] opacity-80 mt-1">
            <User className="w-4 h-4" />
            <span>Manager: {rate.manager}</span>
            <span className="mx-2">•</span>
            <Calendar className="w-4 h-4" />
            <span>{rate.month}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-[#165E52] opacity-80">
            Submitted: {new Date(rate.submittedDate).toLocaleString()}
          </div>
          {rate.processedDate && (
            <div className="text-sm text-[#165E52] opacity-80">
              Processed: {new Date(rate.processedDate).toLocaleString()}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="bg-[#f8fdfc] p-3 rounded border border-[#cfece6]">
          <div className="text-sm text-[#165E52] opacity-80">
            Final Rate Per Kg
          </div>
          <div className="text-lg font-semibold text-black">
            Rs. {(rate.currentRate || rate.originalRate || 0).toFixed(2)}
          </div>
        </div>
        <div className="bg-[#f8fdfc] p-3 rounded border border-[#cfece6]">
          <div className="text-sm text-[#165E52] opacity-80">
            {type === "approved" ? "Adjusted Rate (%)" : "Monthly Rate (%)"}
          </div>
          <div className="text-lg font-semibold text-black">
            {type === "approved"
              ? (rate.adjustedRate || 0).toFixed(2)
              : (rate.proposedRate || 0).toFixed(2)}
            %
          </div>
        </div>
        <div className="bg-green-50 p-3 rounded border border-[#cfece6]">
          <div className="text-sm text-[#165E52] opacity-80">Total Weight</div>
          <div className="text-lg font-semibold text-green-600">
            {(rate.totalWeight || 0).toLocaleString()} kg
          </div>
        </div>
        <div className="bg-yellow-50 p-3 rounded border border-[#cfece6]">
          <div className="text-sm text-[#165E52] opacity-80">Total Payout</div>
          <div className="text-lg font-semibold text-yellow-600">
            Rs. {(rate.totalPayout || 0).toLocaleString()}
          </div>
        </div>
      </div>

      {type === "pending" && rate.nsa && rate.gsa && (
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-[#f8fdfc] p-3 rounded border border-[#cfece6]">
            <div className="text-sm text-[#165E52] opacity-80">
              N.S.A (Net Sale Average)
            </div>
            <div className="text-lg font-semibold text-black">
              Rs. {rate.nsa.toFixed(2)}
            </div>
          </div>
          <div className="bg-[#f8fdfc] p-3 rounded border border-[#cfece6]">
            <div className="text-sm text-[#165E52] opacity-80">
              G.S.A (Gross Sale Average)
            </div>
            <div className="text-lg font-semibold text-black">
              Rs. {rate.gsa.toFixed(2)}
            </div>
          </div>
        </div>
      )}

      {/* Removed status banner for approved RateCard */}

      {type === "processed" && rate.status === "rejected" && rate.reason && (
        <div className="bg-red-50 border border-red-200 p-3 rounded mb-4">
          <div className="text-sm text-red-800">
            <strong>Rejection Reason:</strong> {rate.reason}
          </div>
        </div>
      )}

      {type === "processed" && rate.adjustedBy && (
        <div className="bg-[#e1f4ef] border border-[#cfece6] p-3 rounded mb-4">
          <div className="text-sm text-[#165E52]">
            <strong>Rate adjusted by:</strong> {rate.adjustedBy}
            (from Rs. {rate.originalRate} to Rs. {rate.finalRate})
          </div>
        </div>
      )}

      {type === "pending" && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleApprove(rate.id)}
            className="bg-emerald-700 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <CheckCircle className="w-4 h-4" />
            Approve
          </button>
          <button
            onClick={() => setEditingRate(rate.id)}
            className="bg-[#01251F] hover:bg-[#01251F] text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Edit3 className="w-4 h-4" />
            Adjust & Approve
          </button>
          {/* <button className="bg-[#165E52] hover:bg-[#165E52] text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
            <Eye className="w-4 h-4" />
            View Details
          </button> */}
        </div>
      )}

      {editingRate === rate.id && (
        <AdjustRateForm
          rate={rate}
          onApprove={(adjustedRate, reason) => {
            handleApprove(rate.id, adjustedRate, reason);
            setEditingRate(null);
          }}
          onCancel={() => setEditingRate(null)}
        />
      )}
    </div>
  );

  const filteredRates = (rates) => {
    // Defensive guards to avoid calling string methods on null/undefined values
    if (!Array.isArray(rates)) return [];
    const search = (searchTerm || "").toLowerCase();
    return rates.filter((rate) => {
      const factoryName = (rate?.factoryName ?? "").toString();
      const managerName = (rate?.manager ?? "").toString();
      const monthVal = rate?.month;

      const matchesFactory =
        selectedFactory === "all" || factoryName === selectedFactory;
      const matchesMonth =
        selectedMonth === "all" || (typeof monthVal === "string" && monthVal.includes(selectedMonth));
      const factoryMatch = factoryName.toLowerCase().includes(search);
      const managerMatch = managerName.toLowerCase().includes(search);
      const matchesSearch = search === "" || factoryMatch || managerMatch;
      return matchesFactory && matchesMonth && matchesSearch;
    });
  };

  return (
    <div className="min-h-screen bg-[#f8fdfc]">
      {/* Header */}
      <div className="bg-white shadow-sm border-b ">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-[#165E52]">
                Tea Rate Management
              </h1>
              <p className="text-[#165E52] opacity-80 mt-1">
                Owner Dashboard - Rate Approval & Management
              </p>
            </div>
            <div className="flex items-center gap-4">
              {/* Refresh Button */}
              <button
                onClick={refreshData}
                disabled={loading}
                className="bg-[#165E52] hover:bg-[#165E52] text-white px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                />
                {loading ? "Loading..." : "Refresh"}
              </button>
              <button
                onClick={() => setShowExportModal(true)}
                className="bg-[#01251F] hover:bg-[#01251F] text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export Report
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="text-red-800 font-medium">Error</span>
            </div>
            <p className="text-red-700 mt-1">{error}</p>
            <button
              onClick={refreshData}
              className="mt-2 text-red-600 hover:text-red-800 underline"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
          <div className="text-center py-8">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#165E52]" />
            <p className="text-[#165E52] mt-2">Loading tea rates...</p>
          </div>
        </div>
      )}

      {!loading && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-black transition duration-200 hover:shadow-lg hover:border-[#cfece6]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-black">
                    Pending Approvals
                  </p>
                  <p className="text-3xl font-bold text-black">
                    {pendingRates.length}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-black" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-black transition duration-200 hover:shadow-lg hover:border-[#cfece6]  ">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-black">
                    Approved Rates
                  </p>
                  <p className="text-3xl font-bold text-black">
                    {approvedRates.length}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-black" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-black transition duration-200 hover:shadow-lg hover:border-[#cfece6] ">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-black">
                    Total Factories
                  </p>
                  <p className="text-3xl font-bold text-black">
                    {factories.length}
                  </p>
                </div>
                <Factory className="w-8 h-8 text-black" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-black transition duration-200 hover:shadow-lg hover:border-[#cfece6] ">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-black">
                    Total Submissions
                  </p>
                  <p className="text-3xl font-bold text-black">
                    {pendingRates.length + processedRates.length}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-black" />
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white/80 backdrop-blur p-6 rounded-lg shadow-sm border border-[#cfece6] mb-6">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex-1 min-w-64">
                <div className="relative">
                  <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-[#165E52] opacity-80" />
                  <input
                    type="text"
                    placeholder="Search factories or managers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-[#cfece6] rounded-lg bg-white text-black focus:ring-2 focus:ring-[#165E52] focus:border-[#165E52]"
                  />
                </div>
              </div>
              <div className="min-w-64 w-64">
                <select
                  value={selectedFactory}
                  onChange={(e) => setSelectedFactory(e.target.value)}
                  className="w-full px-4 py-2 border border-[#cfece6] rounded-lg bg-white text-black focus:ring-2 focus:ring-[#165E52] focus:border-[#165E52] appearance-none shadow-sm"
                >
                  <option value="all">All Factories</option>
                  {factories.map((factory) => (
                    <option
                      key={factory}
                      value={factory}
                      className="bg-white text-black"
                    >
                      {factory}
                    </option>
                  ))}
                </select>
              </div>
              <div className="min-w-64 w-64">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full px-4 py-2 border border-[#cfece6] rounded-lg bg-white text-black focus:ring-2 focus:ring-[#165E52] focus:border-[#165E52] appearance-none shadow-sm"
                >
                  <option value="all">All Months</option>
                  <option value="July">July 2025</option>
                  <option value="June">June 2025</option>
                  <option value="May">May 2025</option>
                </select>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-sm border border-[#cfece6]">
            <div className="border-b border-[#cfece6]">
              <nav className="flex space-x-8 px-6">
                <button
                  onClick={() => setActiveTab("pending")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "pending"
                      ? "border-[#165E52] text-[#165E52]"
                      : "border-transparent text-[#165E52] opacity-80 hover:opacity-100 hover:border-[#cfece6]"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Pending Approvals
                    <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                      {filteredRates(pendingRates).length}
                    </span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab("approved")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "approved"
                      ? "border-[#165E52] text-[#165E52]"
                      : "border-transparent text-[#165E52] opacity-80 hover:opacity-100 hover:border-[#cfece6]"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Approved Rates
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                      {filteredRates(approvedRates).length}
                    </span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab("history")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === "history"
                      ? "border-[#165E52] text-[#165E52]"
                      : "border-transparent text-[#165E52] opacity-80 hover:opacity-100 hover:border-[#cfece6]"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <History className="w-4 h-4" />
                    Rate History
                  </div>
                </button>
              </nav>
            </div>

            <div className="p-6">
              {activeTab === "pending" && (
                <div>
                  {filteredRates(pendingRates).length === 0 ? (
                    <div className="text-center py-12">
                      <Clock className="w-12 h-12 text-[#cfece6] mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-[#165E52] mb-2">
                        No Pending Rates
                      </h3>
                      <p className="text-[#165E52] opacity-80">
                        All rate submissions have been processed.
                      </p>
                    </div>
                  ) : (
                    <div>
                      <div className="mb-4 flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-[#165E52]">
                          Pending Rate Approvals (
                          {filteredRates(pendingRates).length})
                        </h3>
                      </div>
                      {filteredRates(pendingRates).map((rate) => (
                        <RateCard key={rate.id} rate={rate} type="pending" />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "approved" && (
                <div>
                  {filteredRates(approvedRates).length === 0 ? (
                    <div className="text-center py-12">
                      <CheckCircle className="w-12 h-12 text-[#cfece6] mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-[#165E52] mb-2">
                        No Approved Rates
                      </h3>
                      <p className="text-[#165E52] opacity-80">
                        No rates have been approved yet.
                      </p>
                    </div>
                  ) : (
                    <div>
                      <div className="mb-4 flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-[#165E52]">
                          Recently Approved Rates (
                          {filteredRates(approvedRates).length})
                        </h3>
                      </div>
                      {filteredRates(approvedRates).map((rate) => (
                        <div key={rate.id} className="mb-4">
                          <RateCard rate={rate} type="approved" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "history" && (
                <div>
                  {filteredRates(processedRates).length === 0 ? (
                    <div className="text-center py-12">
                      <History className="w-12 h-12 text-[#cfece6] mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-[#165E52] mb-2">
                        No Rate History
                      </h3>
                      <p className="text-[#165E52] opacity-80">
                        No processed rates found for the selected filters.
                      </p>
                    </div>
                  ) : (
                    <div>
                      <div className="mb-4 flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-[#165E52]">
                          Rate Processing History (
                          {filteredRates(processedRates).length})
                        </h3>
                      </div>
                      {filteredRates(processedRates).map((rate) => (
                        <RateCard key={rate.id} rate={rate} type="processed" />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && <ExportModal />}
    </div>
  );
};

export default OwnerDashboard;
