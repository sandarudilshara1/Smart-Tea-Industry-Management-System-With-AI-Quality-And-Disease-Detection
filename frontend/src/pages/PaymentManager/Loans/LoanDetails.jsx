import React, { useState, useEffect } from "react";
import {
  CheckCircle,
  AlertCircle,
  Clock,
  Check,
  X,
  DollarSign,
  FileText,
} from "lucide-react";
import AdvanceChart from "../../../components/charts/AdvanceChart";

export default function LoanDetails({ loan, onBack, onApprove, onReject }) {
  // Modal states for pending loans
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  // Approval modal state - editable fields
  const [approvedAmount, setApprovedAmount] = useState(loan.totalLoan);
  const [approvedDuration, setApprovedDuration] = useState(loan.duration);
  const [calculatedInstallment, setCalculatedInstallment] = useState(
    loan.monthlyInstallment
  );
  const [approvalNotes, setApprovalNotes] = useState("");

  // Sample past loans data
  const SAMPLE_PAST_LOANS = [
    {
      id: "L-2024-001",
      amount: 75000,
      duration: 3,
      startDate: "2024-03-15",
      endDate: "2024-06-15",
      status: "completed",
    },
    {
      id: "L-2023-005",
      amount: 50000,
      duration: 2,
      startDate: "2023-11-10",
      endDate: "2024-01-10",
      status: "completed",
    },
    {
      id: "L-2023-002",
      amount: 100000,
      duration: 4,
      startDate: "2023-06-20",
      endDate: "2023-10-20",
      status: "completed",
    },
  ];

  // Calculate monthly installment using diminishing balance method with 1.25% monthly interest
  const calculateMonthlyInstallment = (principal, duration) => {
    const monthlyInterestRate = 0.0125; // 1.25% per month

    // EMI formula: P * [r(1+r)^n] / [(1+r)^n - 1]
    // Where P = Principal, r = monthly interest rate, n = number of months
    const r = monthlyInterestRate;
    const n = duration;

    if (r === 0) return Math.ceil(principal / n); // If no interest

    const numerator = principal * r * Math.pow(1 + r, n);
    const denominator = Math.pow(1 + r, n) - 1;

    return Math.ceil(numerator / denominator);
  };

  // Reset approval form to original values when modal opens
  const resetApprovalForm = () => {
    setApprovedAmount(loan.totalLoan);
    setApprovedDuration(loan.duration);
    setCalculatedInstallment(loan.monthlyInstallment);
    setApprovalNotes("");
  };

  // Update calculated installment when amount or duration changes
  useEffect(() => {
    setCalculatedInstallment(
      calculateMonthlyInstallment(approvedAmount, approvedDuration)
    );
  }, [approvedAmount, approvedDuration]);

  if (!loan) return null;

  const getStatusIcon = (status) => {
    switch (status) {
      case "paid":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case "overdue":
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      case "defaulted":
        return <AlertCircle className="w-4 h-4 text-red-800" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const calculateProgress = () => {
    return (loan.paidInstallments / loan.totalInstallments) * 100;
  };

  // Helper function to calculate overdue amount and next payment details
  const getOverdueDetails = () => {
    if (loan.status !== "overdue") return null;

    const overduePayments =
      loan.repaymentLog?.filter(
        (payment) =>
          payment.status === "overdue" || payment.status === "pending"
      ) || [];

    const totalOverdueAmount = overduePayments.reduce(
      (sum, payment) => sum + payment.amount,
      0
    );

    // Calculate next payment date (assuming monthly payments)
    const nextPaymentDate = new Date();
    nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
    nextPaymentDate.setDate(15); // Assuming 15th of each month

    const nextPaymentAmount = loan.monthlyInstallment + totalOverdueAmount;

    return {
      overdueAmount: totalOverdueAmount,
      nextPaymentDate: nextPaymentDate,
      nextPaymentAmount: nextPaymentAmount,
      overduePayments: overduePayments,
    };
  };

  // Handlers for pending loan approval/rejection
  const handleApproveLoan = () => {
    const totalRepayment = calculatedInstallment * approvedDuration;
    const totalInterest = Math.max(0, totalRepayment - approvedAmount);

    if (onApprove) {
      onApprove(loan.id, {
        approvedAmount: approvedAmount,
        duration: approvedDuration,
        monthlyInstallment: calculatedInstallment,
        interestRate: 1.25, // 1.25% per month
        totalRepayment: totalRepayment,
        totalInterest: totalInterest,
        calculationMethod: "diminishing_balance",
        approvalNotes: approvalNotes,
      });
    }
    setShowApprovalModal(false);
    onBack();
  };

  const handleRejectLoan = () => {
    if (onReject) {
      onReject(loan.id, rejectionReason);
    }
    setShowRejectionModal(false);
    setRejectionReason("");
    onBack();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Loan Approval Modal */}
      {showApprovalModal && (
        <div className="fixed inset-0 flex items-center justify-center z-[1000] backdrop-blur-sm bg-black/20">
          <div className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex justify-between items-center p-6 border-b border-[#e2e8f0]">
              <h2 className="text-xl font-semibold text-[#0f172a]">
                Approve Loan Application from {loan.supplierName}
              </h2>
            </div>
            <div className="p-6">
              <div className="mb-6 text-[#0f172a] text-base">
                <div className="space-y-4 mb-4">
                  {/* Loan Amount and Duration in one row */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Loan Amount Input - Left */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Approved Loan Amount (Rs)
                      </label>
                      <input
                        type="number"
                        value={approvedAmount}
                        onChange={(e) =>
                          setApprovedAmount(Number(e.target.value))
                        }
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter approved amount"
                        min="1000"
                        max="500000"
                        step="1000"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Requested: Rs. {loan.totalLoan.toLocaleString()}
                      </p>
                    </div>

                    {/* Duration Selection - Right */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Loan Duration
                      </label>
                      <select
                        value={approvedDuration}
                        onChange={(e) =>
                          setApprovedDuration(Number(e.target.value))
                        }
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value={1}>1 Month</option>
                        <option value={2}>2 Months</option>
                        <option value={3}>3 Months</option>
                        <option value={4}>4 Months</option>
                        <option value={5}>5 Months</option>
                        <option value={6}>6 Months</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        Requested: {loan.duration} months
                      </p>
                    </div>
                  </div>

                  {/* Approval Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Approval Notes (Optional)
                    </label>
                    <textarea
                      value={approvalNotes}
                      onChange={(e) => setApprovalNotes(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                      placeholder="Add any notes about this approval decision..."
                    />
                  </div>
                </div>

                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-2">
                    Final Loan Terms
                  </h4>
                  <div className="grid grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="text-sm text-blue-700 space-y-1">
                      <p>
                        • Total Amount: Rs. {approvedAmount.toLocaleString()}
                      </p>
                      <p>• Duration: {approvedDuration} months</p>
                      <p>• Interest Rate: 1.25% per month</p>
                    </div>

                    {/* Right Column */}
                    <div className="text-sm text-blue-700 space-y-1">
                      <p>
                        • Monthly Installment: Rs.{" "}
                        {calculatedInstallment.toLocaleString()}
                      </p>
                      <p>
                        • Total Repayment: Rs.{" "}
                        {(
                          calculatedInstallment * approvedDuration
                        ).toLocaleString()}
                      </p>
                      <p>
                        • Total Interest: Rs.{" "}
                        {Math.max(
                          0,
                          calculatedInstallment * approvedDuration -
                            approvedAmount
                        ).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-3 justify-end p-6 border-t border-[#e2e8f0]">
              <button
                className="px-5 py-2 rounded-lg bg-[#f1f5f9] text-[#0f172a] font-semibold hover:bg-[#e2e8f0]"
                onClick={() => setShowApprovalModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-5 py-2 rounded-lg bg-[#10b981] text-white font-semibold hover:bg-[#059669]"
                onClick={handleApproveLoan}
              >
                Confirm Approval
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loan Rejection Modal */}
      {showRejectionModal && (
        <div className="fixed inset-0 flex items-center justify-center z-[1000] backdrop-blur-sm bg-black/20">
          <div className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex justify-between items-center p-6 border-b border-red-200 bg-red-50">
              <h2 className="text-xl font-semibold text-red-800">
                Reject Loan Application from {loan.supplierName}
              </h2>
            </div>
            <div className="p-6">
              <p className="mb-4 text-[#64748b]">
                Are you sure you want to reject this loan application?
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rejection Notes (Optional)
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Add any notes about this rejection decision..."
                />
              </div>
            </div>
            <div className="flex gap-3 justify-end p-6 border-t border-[#e2e8f0]">
              <button
                className="px-5 py-2 rounded-lg bg-[#f1f5f9] text-[#0f172a] font-semibold hover:bg-[#e2e8f0]"
                onClick={() => setShowRejectionModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-5 py-2 rounded-lg bg-[#ef4444] text-white font-semibold hover:bg-[#dc2626]"
                onClick={handleRejectLoan}
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Recording Modal */}

      {/* Enhanced Header with Quick Stats */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
            <div className="flex items-center space-x-4">
              <div>
                <p className="text-3xl font-bold text-gray-900">
                  {loan.supplierName}
                </p>
                <div className="flex items-center space-x-4 mt-1">
                  <span className="text-sm text-gray-500">
                    ID: {loan.supplierId}
                  </span>
                  <span className="text-sm text-gray-500">•</span>
                  {loan.status === "pending" && (
                    <>
                      <span className="text-sm text-gray-500">
                        Submitted:{" "}
                        {new Date(loan.requestDate).toLocaleDateString()}
                      </span>
                      <span className="text-sm text-gray-500">•</span>
                    </>
                  )}
                  {loan.status !== "pending" && (
                    <>
                      <span className="text-sm text-gray-500">
                        Started: {new Date(loan.startDate).toLocaleDateString()}
                      </span>
                      <span className="text-sm text-gray-500">•</span>
                    </>
                  )}
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      loan.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : loan.status === "active"
                        ? "bg-green-100 text-green-800"
                        : loan.status === "completed"
                        ? "bg-blue-100 text-blue-800"
                        : loan.status === "overdue"
                        ? "bg-orange-100 text-orange-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {loan.status === "pending"
                      ? "Pending Review"
                      : loan.status === "active"
                      ? "Active"
                      : loan.status === "completed"
                      ? "Completed"
                      : loan.status === "overdue"
                      ? "Overdue (Payment Pending)"
                      : "Defaulted"}
                  </span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center space-x-3">
              {loan.status === "pending" && (
                <>
                  <button
                    className="inline-flex items-center px-4 py-2 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 transition-colors"
                    onClick={() => {
                      resetApprovalForm();
                      setShowApprovalModal(true);
                    }}
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Approve
                  </button>
                  <button
                    className="inline-flex items-center px-4 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition-colors"
                    onClick={() => setShowRejectionModal(true)}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Reject
                  </button>
                </>
              )}

              <button
                onClick={onBack}
                className="px-6 py-3 rounded-xl text-sm font-semibold bg-[#f1f5f9] text-[#000] border-none hover:bg-[#e2e8f0] ml-2"
              >
                ← Back
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="space-y-6">
          {loan.status === "pending" ? (
            <div>
              {/* Pending Loan Request Details */}
              <div className="bg-white shadow overflow-hidden mb-6 rounded border border-[#94a3b8]">
                <div className="p-6 pb-0 border-b border-[#cbd5e1] mb-6">
                  <h2 className="text-lg font-bold text-[#0f172a] mb-2">
                    Loan Request Details
                  </h2>
                </div>
                <div className="px-6 pb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left Column */}
                    <div className="space-y-6">
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-[#64748b] uppercase tracking-wide mb-1">
                          REQUESTED AMOUNT
                        </span>
                        <span className="text-base font-bold text-[#0f172a]">
                          Rs. {loan.totalLoan.toLocaleString()}
                        </span>
                      </div>
                       <div className="flex flex-col">
                         <span className="text-xs font-medium text-[#64748b] uppercase tracking-wide mb-1">
                           EXISTING ADVANCE
                         </span>
                         <span className="text-base font-bold text-[#0f172a]">
                           Rs. {loan.advance ? loan.advance.toLocaleString() : "0"}
                         </span>
                       </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-[#64748b] uppercase tracking-wide mb-1">
                          DURATION
                        </span>
                        <span className="text-base font-bold text-[#0f172a]">
                          {loan.duration} months
                        </span>
                      </div>
                      
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-[#64748b] uppercase tracking-wide mb-1">
                          EXISTING LOANS
                        </span>
                        <span className="text-base font-bold text-[#0f172a]">
                          Rs. {loan.existingLoans || 0}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-[#64748b] uppercase tracking-wide mb-1">
                          LAST MONTH INCOME
                        </span>
                        <span className="text-base font-bold text-[#0f172a]">
                          Rs.{" "}
                          {loan.lastMonthIncome
                            ? loan.lastMonthIncome.toLocaleString()
                            : "85,000"}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-[#64748b] uppercase tracking-wide mb-1">
                          SPECIAL NOTES
                        </span>
                        <span className="text-base font-bold text-[#0f172a]">
                          {loan.specialNotes || "No special notes provided"}
                        </span>
                      </div>
                       <div className="flex flex-col">
                         <span className="text-xs font-medium text-[#64748b] uppercase tracking-wide mb-1">
                           FERTILIZER PAYMENT
                         </span>
                         <span className="text-base font-bold text-[#0f172a]">
                           Rs. {loan.fertilizerPayment ? loan.fertilizerPayment.toLocaleString() : "0"}
                         </span>
                       </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Past Loan Details for Pending Loans */}
              <div className="bg-white shadow overflow-hidden rounded border border-[#94a3b8] mb-6">
                <div className="p-6 pb-0 border-b border-[#cbd5e1] mb-6">
                  <h2 className="text-lg font-bold text-[#0f172a] mb-2">
                    Past Loan History
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-[#cbd5e1]">
                    <thead className="bg-[#f8fafc]">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#64748b] uppercase tracking-wider">
                          Loan ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#64748b] uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#64748b] uppercase tracking-wider">
                          Duration
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#64748b] uppercase tracking-wider">
                          Start Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#64748b] uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#64748b] uppercase tracking-wider">
                          Completion
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-[#cbd5e1]">
                      {SAMPLE_PAST_LOANS.map((pastLoan) => (
                        <tr key={pastLoan.id} className="hover:bg-[#f8fafc]">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-[#3b82f6]">
                              {pastLoan.id}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-[#0f172a]">
                              Rs. {pastLoan.amount.toLocaleString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-[#0f172a]">
                              {pastLoan.duration} months
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-[#0f172a]">
                              {new Date(pastLoan.startDate).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                }
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-[#dcfce7] text-[#166534]">
                              {pastLoan.status === "completed"
                                ? "Completed"
                                : pastLoan.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-[#0f172a]">
                              {pastLoan.endDate
                                ? new Date(pastLoan.endDate).toLocaleDateString(
                                    "en-US",
                                    {
                                      year: "numeric",
                                      month: "short",
                                      day: "numeric",
                                    }
                                  )
                                : "-"}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Summary row */}
                <div className="bg-[#f8fafc] px-6 py-4 border-t border-[#cbd5e1]">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-[#64748b]">
                      Total Past Loans:{" "}
                      <span className="font-medium text-[#0f172a]">3</span>
                    </span>
                    <span className="text-[#64748b]">
                      Total Amount Borrowed:{" "}
                      <span className="font-medium text-[#0f172a]">
                        Rs. 2,25,000
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Tea Supply Chart - Left Half */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-white shadow overflow-hidden rounded border border-[#94a3b8]">
                  <div className="p-6 pb-0 border-b border-[#cbd5e1] mb-6">
                    <h2 className="text-lg font-bold text-[#0f172a] mb-2">
                      Tea Supply Analytics
                    </h2>
                  </div>
                  <div className="px-6 pb-6">
                    <AdvanceChart />
                  </div>
                </div>
                {/* Empty right column */}
                <div></div>
              </div>
            </div>
          ) : (
            /* Active/Completed/Overdue/Defaulted Loan Details - Clean Layout */
            <div>
              {/* Loan Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div className="bg-white shadow overflow-hidden rounded border border-[#94a3b8] p-6">
                  <div className="flex items-center">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <DollarSign className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-[#64748b]">
                        Total Loan
                      </p>
                      <p className="text-2xl font-bold text-[#0f172a]">
                        Rs. {loan.totalLoan.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white shadow overflow-hidden rounded border border-[#94a3b8] p-6">
                  <div className="flex items-center">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-[#64748b]">
                        Paid Amount
                      </p>
                      <p className="text-2xl font-bold text-[#10b981]">
                        Rs.{" "}
                        {(
                          loan.totalLoan - loan.remainingBalance
                        ).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white shadow overflow-hidden rounded border border-[#94a3b8] p-6">
                  <div className="flex items-center">
                    <div className="p-3 bg-orange-100 rounded-lg">
                      <Clock className="w-6 h-6 text-orange-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-[#64748b]">
                        Remaining
                      </p>
                      <p className="text-2xl font-bold text-[#f59e0b]">
                        Rs. {loan.remainingBalance.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Overdue Amount Card - Show only for overdue loans */}
                {loan.status === "overdue" && getOverdueDetails() && (
                  <div className="bg-white shadow overflow-hidden rounded border border-[#94a3b8] p-6">
                    <div className="flex items-center">
                      <div className="p-3 bg-red-100 rounded-lg">
                        <AlertCircle className="w-6 h-6 text-red-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-[#64748b]">
                          Overdue Amount
                        </p>
                        <p className="text-2xl font-bold text-[#ef4444]">
                          Rs.{" "}
                          {getOverdueDetails().overdueAmount.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Overdue Payment Notice - Show only for overdue loans */}
              {loan.status === "overdue" && getOverdueDetails() && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
                  <div className="flex items-start">
                    <AlertCircle className="w-6 h-6 text-red-600 mt-1 mr-3" />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-red-800 mb-2">
                        Overdue Payment Notice
                      </h3>
                      <div className="text-red-700 space-y-2">
                        <p>
                          <strong>Overdue Amount:</strong> Rs.{" "}
                          {getOverdueDetails().overdueAmount.toLocaleString()}
                        </p>
                        <p>
                          <strong>Next Payment Due:</strong>{" "}
                          {getOverdueDetails().nextPaymentDate.toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )}
                        </p>
                        <p>
                          <strong>Total Next Payment:</strong> Rs.{" "}
                          {getOverdueDetails().nextPaymentAmount.toLocaleString()}
                          <span className="text-sm ml-2">
                            (Regular: Rs.{" "}
                            {getOverdueDetails().nextPaymentAmount -
                              getOverdueDetails().overdueAmount}{" "}
                            + Overdue: Rs.{" "}
                            {getOverdueDetails().overdueAmount.toLocaleString()}
                            )
                          </span>
                        </p>
                        <div className="mt-3 text-sm">
                          <p className="font-medium">
                            📋 Note: Overdue amount will be added to the next
                            month's payment. Please ensure payment is made by
                            the due date to avoid further penalties.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Progress */}
              <div className="bg-white shadow overflow-hidden rounded border border-[#94a3b8] mb-6">
                <div className="p-6 pb-0 border-b border-[#cbd5e1] mb-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-bold text-[#0f172a] mb-2">
                      Payment Progress
                    </h2>
                    <span className="text-sm font-medium text-[#64748b] capitalize">
                      {loan.paymentStatus}
                    </span>
                  </div>
                </div>
                <div className="px-6 pb-6">
                  <div className="w-full bg-[#e2e8f0] rounded-full h-3 mb-2">
                    <div
                      className="bg-[#3b82f6] h-3 rounded-full transition-all duration-300"
                      style={{ width: `${calculateProgress()}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-sm text-[#64748b]">
                    <span>
                      Rs.{" "}
                      {(
                        loan.totalLoan - loan.remainingBalance
                      ).toLocaleString()}{" "}
                      paid
                    </span>
                    <span>Rs. {loan.totalLoan.toLocaleString()} total</span>
                  </div>
                </div>
              </div>

              {/* Loan Details */}
              <div className="bg-white shadow overflow-hidden rounded border border-[#94a3b8] mb-6">
                <div className="p-6 pb-0 border-b border-[#cbd5e1] mb-6">
                  <h2 className="text-lg font-bold text-[#0f172a] mb-2">
                    Loan Details
                  </h2>
                </div>
                <div className="px-6 pb-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex flex-col">
                      <span className="text-xs font-medium text-[#64748b] uppercase tracking-wide mb-1">
                        DURATION
                      </span>
                      <span className="text-base font-bold text-[#0f172a]">
                        {loan.duration} months
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-medium text-[#64748b] uppercase tracking-wide mb-1">
                        MONTHLY INSTALLMENT
                      </span>
                      <span className="text-base font-bold text-[#0f172a]">
                        Rs. {loan.monthlyInstallment.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-medium text-[#64748b] uppercase tracking-wide mb-1">
                        SUPPLIER ID
                      </span>
                      <span className="text-base font-bold text-[#0f172a]">
                        {loan.supplierId}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Repayment Log */}
              <div className="bg-white shadow overflow-hidden rounded border border-[#94a3b8] mb-6">
                <div className="p-6 pb-0 border-b border-[#cbd5e1] mb-6">
                  <h2 className="text-lg font-bold text-[#0f172a] mb-2">
                    Repayment Log
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-[#cbd5e1]">
                    <thead className="bg-[#f8fafc]">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#64748b] uppercase tracking-wider">
                          Payment Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#64748b] uppercase tracking-wider">
                          Due Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#64748b] uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#64748b] uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#64748b] uppercase tracking-wider">
                          Days Overdue
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#64748b] uppercase tracking-wider">
                          Notes
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-[#cbd5e1]">
                      {loan.repaymentLog.map((payment) => {
                        const dueDate = payment.dueDate
                          ? new Date(payment.dueDate)
                          : null;
                        const paymentDate = payment.date
                          ? new Date(payment.date)
                          : null;
                        const currentDate = new Date();

                        let daysOverdue = 0;
                        if (dueDate && payment.status === "overdue") {
                          daysOverdue = Math.floor(
                            (currentDate - dueDate) / (1000 * 60 * 60 * 24)
                          );
                        }

                        return (
                          <tr key={payment.id} className="hover:bg-[#f8fafc]">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-[#0f172a]">
                                {paymentDate
                                  ? paymentDate.toLocaleDateString("en-US", {
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric",
                                    })
                                  : "-"}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-[#0f172a]">
                                {dueDate
                                  ? dueDate.toLocaleDateString("en-US", {
                                      year: "numeric",
                                      month: "short",
                                      day: "numeric",
                                    })
                                  : "-"}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-[#0f172a]">
                                Rs. {payment.amount.toLocaleString()}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                {getStatusIcon(payment.status)}
                                <span
                                  className={`ml-2 text-sm font-medium capitalize ${
                                    payment.status === "overdue"
                                      ? "text-red-600"
                                      : payment.status === "paid"
                                      ? "text-green-600"
                                      : "text-[#0f172a]"
                                  }`}
                                >
                                  {payment.status}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-[#0f172a]">
                                {payment.status === "overdue" &&
                                daysOverdue > 0 ? (
                                  <span className="text-red-600 font-medium">
                                    {daysOverdue} days
                                  </span>
                                ) : (
                                  "-"
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-[#64748b] max-w-xs truncate">
                                {payment.status === "overdue"
                                  ? `Will be added to next month's payment. ${
                                      payment.notes || ""
                                    }`
                                  : payment.notes || "-"}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {loan.repaymentLog.length === 0 && (
                  <div className="text-center py-12">
                    <div className="text-[#64748b]">
                      <FileText className="w-12 h-12 mx-auto mb-4 text-[#cbd5e1]" />
                      <p className="text-lg font-medium">
                        No payments recorded yet
                      </p>
                      <p className="text-sm">
                        Payment history will appear here once recorded
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Past Loan Details */}
              <div className="bg-white shadow overflow-hidden rounded border border-[#94a3b8] mb-6">
                <div className="p-6 pb-0 border-b border-[#cbd5e1] mb-6">
                  <h2 className="text-lg font-bold text-[#0f172a] mb-2">
                    Past Loan History
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-[#cbd5e1]">
                    <thead className="bg-[#f8fafc]">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#64748b] uppercase tracking-wider">
                          Loan ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#64748b] uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#64748b] uppercase tracking-wider">
                          Duration
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#64748b] uppercase tracking-wider">
                          Start Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#64748b] uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#64748b] uppercase tracking-wider">
                          Completion
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-[#cbd5e1]">
                      {SAMPLE_PAST_LOANS.map((pastLoan) => (
                        <tr key={pastLoan.id} className="hover:bg-[#f8fafc]">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-[#3b82f6]">
                              {pastLoan.id}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-[#0f172a]">
                              Rs. {pastLoan.amount.toLocaleString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-[#0f172a]">
                              {pastLoan.duration} months
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-[#0f172a]">
                              {new Date(pastLoan.startDate).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                }
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-[#dcfce7] text-[#166534]">
                              {pastLoan.status === "completed"
                                ? "Completed"
                                : pastLoan.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-[#0f172a]">
                              {pastLoan.endDate
                                ? new Date(pastLoan.endDate).toLocaleDateString(
                                    "en-US",
                                    {
                                      year: "numeric",
                                      month: "short",
                                      day: "numeric",
                                    }
                                  )
                                : "-"}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Summary row */}
                <div className="bg-[#f8fafc] px-6 py-4 border-t border-[#cbd5e1]">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-[#64748b]">
                      Total Past Loans:{" "}
                      <span className="font-medium text-[#0f172a]">3</span>
                    </span>
                    <span className="text-[#64748b]">
                      Total Amount Borrowed:{" "}
                      <span className="font-medium text-[#0f172a]">
                        Rs. 2,25,000
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
