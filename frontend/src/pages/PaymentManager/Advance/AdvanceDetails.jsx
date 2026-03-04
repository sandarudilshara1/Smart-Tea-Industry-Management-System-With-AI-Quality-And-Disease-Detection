import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Check, X, Clock, FileText } from "lucide-react";
import AdvanceChart from "../../../components/charts/AdvanceChart";
import { useAuth } from "../../../contexts/AuthContext";
import {
  getAdvanceDetails,
  approveAdvance,
  rejectAdvance,
} from "../../../api/paymentManager";

export default function AdvanceDetails() {
  const { advanceId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [supplier, setSupplier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal state (must be before any return)
  const [showApproval, setShowApproval] = useState(false);
  const [showRejection, setShowRejection] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [approvedAmount, setApprovedAmount] = useState(0);

  useEffect(() => {
    const fetchAdvanceDetails = async () => {
      try {
        setLoading(true);
        const data = await getAdvanceDetails(advanceId);
        setSupplier(data);
      } catch (err) {
        console.error("Error fetching advance details:", err);
        setError("Failed to load advance details");
      } finally {
        setLoading(false);
      }
    };

    if (advanceId) {
      fetchAdvanceDetails();
    }
  }, [advanceId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#165E52] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading advance details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => navigate("/factoryManager/payment/advance")}
            className="px-4 py-2 bg-[#165E52] text-white rounded-lg hover:bg-[#0f3d35]"
          >
            Back to Advances
          </button>
        </div>
      </div>
    );
  }

  if (!supplier) return null;

  let statusText = "";
  let statusColor = "";

  if (supplier.status === "REQUESTED") {
    statusText = "Pending Review";
    statusColor = "text-yellow-600 bg-yellow-100";
  } else if (supplier.status === "APPROVED") {
    statusText = "Approved";
    statusColor = "text-green-600 bg-green-100";
  } else {
    statusText = "Rejected";
    statusColor = "text-red-600 bg-red-100";
  }

  // Modal close handlers
  const closeApproval = () => {
    setShowApproval(false);
    setApprovedAmount(0);
  };
  const closeRejection = () => {
    setShowRejection(false);
    setRejectionReason("");
  };

  // Handlers for confirm actions
  const handleApprove = async () => {
    const approvalData = {
      approvedByUserId: user?.userId,
      approvedAmount: approvedAmount,
      action: "APPROVE",
    };
    try {
      await approveAdvance(supplier.id, approvalData);
      setShowApproval(false);
      // Navigate back after approval
      navigate("/factoryManager/payment/advance", {
        state: { view: "pending" },
      });
    } catch (error) {
      console.error("Error approving advance:", error);
      // TODO: Show error message to user
    }
  };

  const handleReject = async () => {
    try {
      await rejectAdvance(supplier.id, {
        rejectedByUserId: user?.userId,
        rejectionReason: rejectionReason || "No reason provided",
      });
      setShowRejection(false);
      setRejectionReason(""); // Reset
      // Navigate back after rejection
      navigate("/factoryManager/payment/advance", {
        state: { view: "pending" },
      });
    } catch (error) {
      console.error("Error rejecting advance:", error);
      // TODO: Show error message to user
    }
  };

  const handleBack = () => {
    navigate("/factoryManager/payment/advance");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Approval Modal */}
      {showApproval && (
        <div className="fixed inset-0 flex items-center justify-center z-[1000] backdrop-blur-sm bg-black/20">
          <div className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex justify-between items-center p-6 border-b border-[#e2e8f0]">
              <h2 className="text-xl font-semibold text-[#0f172a]">
                Approve Advance
              </h2>
              {/* <button
                className="text-2xl text-[#64748b] hover:text-[#0f172a]"
                onClick={closeApproval}
              >
                &times;
              </button> */}
            </div>
            <div className="p-6">
              <div className="mb-6 text-[#0f172a] text-base">
                <p className="mb-2 font-semibold text-align-center">
                  Approve advance request for Rs. {supplier.requestedAmount}{" "}
                  <br />
                  from {supplier.supplierName}?
                </p>
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-2">
                    Advance Details
                  </h4>
                  <div className="text-sm text-blue-700 space-y-1">
                    <p>• Purpose: {supplier.purpose}</p>
                    <p>• Payment Method: {supplier.paymentMethod}</p>
                    <div className="flex flex-col">
                      <label className="text-xs font-medium text-blue-800 mb-1">
                        Approved Amount
                      </label>
                      <input
                        type="number"
                        value={approvedAmount}
                        onChange={(e) =>
                          setApprovedAmount(Number(e.target.value))
                        }
                        className="border border-blue-300 rounded px-2 py-1 text-sm"
                        min="0"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-3 justify-end p-6 border-t border-[#e2e8f0]">
              <button
                className="px-5 py-2 rounded-lg bg-[#f1f5f9] text-[#0f172a] font-semibold hover:bg-[#e2e8f0]"
                onClick={closeApproval}
              >
                Cancel
              </button>
              <button
                className="px-5 py-2 rounded-lg bg-[#10b981] text-white font-semibold hover:bg-[#059669]"
                onClick={handleApprove}
              >
                Confirm Approval
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Rejection Modal */}
      {showRejection && (
        <div className="fixed inset-0 flex items-center justify-center z-[1000] backdrop-blur-sm bg-black/20">
          <div className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex justify-between items-center p-6 border-b border-[#e2e8f0]">
              <h2 className="text-xl font-semibold text-[#0f172a]">
                Reject Supplier
              </h2>
              <button
                className="text-2xl text-[#64748b] hover:text-[#0f172a]"
                onClick={closeRejection}
              >
                &times;
              </button>
            </div>
            <div className="p-6">
              <p className="mb-4 text-[#64748b]">
                Are you sure you want to reject this advance request?
              </p>
              <div className="flex flex-col">
                <label className="text-xs font-medium text-[#64748b] mb-1">
                  Reason for Rejection (Optional)
                </label>
                <textarea
                  className="border border-[#e2e8f0] rounded-lg px-3 py-2 text-sm min-h-[80px] resize-y"
                  placeholder="This reason will be visible to the supplier..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                ></textarea>
              </div>
            </div>
            <div className="flex gap-3 justify-end p-6 border-t border-[#e2e8f0]">
              <button
                className="px-5 py-2 rounded-lg bg-[#f1f5f9] text-[#0f172a] font-semibold hover:bg-[#e2e8f0]"
                onClick={closeRejection}
              >
                Cancel
              </button>
              <button
                className="px-5 py-2 rounded-lg bg-[#ef4444] text-white font-semibold hover:bg-[#dc2626]"
                onClick={handleReject}
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Enhanced Header with Quick Stats */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
            <div className="flex items-center space-x-4">
              <div>
                <p className="text-3xl font-bold text-gray-900">
                  {supplier.supplierName}
                </p>
                <div className="flex items-center space-x-4 mt-1">
                  <span className="text-sm text-gray-500">
                    ID: {supplier.id}
                  </span>
                  <span className="text-sm text-gray-500">•</span>
                  {supplier.status === "APPROVED" && supplier.approvedDate && (
                    <>
                      <span className="text-sm text-gray-500">
                        Approved: {supplier.approvedDate}
                      </span>
                      <span className="text-sm text-gray-500">•</span>
                    </>
                  )}
                  {supplier.status === "REQUESTED" && (
                    <>
                      <span className="text-sm text-gray-500">
                        Submitted: {supplier.requestedDate}
                      </span>
                      <span className="text-sm text-gray-500">•</span>
                    </>
                  )}
                  {supplier.status === "REJECTED" && supplier.rejectedDate && (
                    <>
                      <span className="text-sm text-gray-500">
                        Rejected: {supplier.rejectedDate}
                      </span>
                      <span className="text-sm text-gray-500">•</span>
                    </>
                  )}
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColor}`}
                  >
                    {statusText}
                  </span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center space-x-3">
              {supplier.status === "REQUESTED" && (
                <>
                  <button
                    className="inline-flex items-center px-4 py-2 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 transition-colors"
                    onClick={() => {
                      setApprovedAmount(supplier.requestedAmount);
                      setShowApproval(true);
                    }}
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Approve
                  </button>
                  <button
                    className="inline-flex items-center px-4 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition-colors"
                    onClick={() => {
                      if (
                        supplier.eligibilityStatus === "FAIL" &&
                        supplier.eligibilityFailReasons
                      ) {
                        setRejectionReason(
                          supplier.eligibilityFailReasons.join("\n")
                        );
                      }
                      setShowRejection(true);
                    }}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Reject
                  </button>
                </>
              )}
              <button
                onClick={handleBack}
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
          {/* Advance Request Details */}
          <div className="bg-white shadow overflow-hidden mb-6 rounded border border-[#94a3b8]">
            <div className="p-6 pb-0 border-b border-[#cbd5e1] mb-6">
              <h2 className="text-lg font-bold text-[#0f172a] mb-2">
                {supplier.status === "APPROVED"
                  ? "Advance Details"
                  : "Advance Request Details"}
              </h2>
            </div>
            <div className="px-6 pb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Show eligibility only for pending status */}
                {supplier.status === "REQUESTED" && (
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-xs font-medium text-[#64748b] uppercase tracking-wide mb-1">
                      ELIGIBILITY
                    </span>
                    <span
                      className={`text-xl font-bold ${
                        supplier.eligibilityStatus === "PASS"
                          ? "text-[#10b981]"
                          : "text-[#ef4444]"
                      }`}
                    >
                      {supplier.eligibilityStatus}
                    </span>
                    {supplier.eligibilityStatus === "FAIL" &&
                      supplier.eligibilityFailReasons && (
                        <div className="mt-2 text-xs text-red-600">
                          {supplier.eligibilityFailReasons.map(
                            (reason, index) => (
                              <p key={index}>• {reason}</p>
                            )
                          )}
                        </div>
                      )}
                  </div>
                )}

                {/* Other details - adjust grid based on status */}
                <div
                  className={`${
                    supplier.status === "REQUESTED"
                      ? "col-span-2"
                      : "col-span-3"
                  } grid grid-cols-1 md:grid-cols-3 gap-6`}
                >
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-[#64748b] uppercase tracking-wide mb-1">
                      {supplier.status === "APPROVED"
                        ? "GIVEN AMOUNT"
                        : "REQUESTED AMOUNT"}
                    </span>
                    <span className="text-base font-bold text-[#0f172a]">
                      Rs.{" "}
                      {supplier.status === "APPROVED"
                        ? supplier.approvedAmount
                        : supplier.requestedAmount}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-[#64748b] uppercase tracking-wide mb-1">
                      TYPE
                    </span>
                    <span className="text-base font-bold text-[#0f172a] capitalize">
                      {supplier.paymentMethod || "Cash"}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-[#64748b] uppercase tracking-wide mb-1">
                      PURPOSE
                    </span>
                    <span className="text-base font-bold text-[#0f172a]">
                      {supplier.purpose}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-[#64748b] uppercase tracking-wide mb-1">
                      LAST MONTH INCOME
                    </span>
                    <span className="text-base font-bold text-[#0f172a]">
                      Rs. {supplier.lastMonthIncome}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-[#64748b] uppercase tracking-wide mb-1">
                      {supplier.status === "APPROVED"
                        ? "CURRENT MONTH TEA WEIGHT"
                        : "THIS MONTH WEIGHT"}
                    </span>
                    <span className="text-base font-bold text-[#0f172a]">
                      {supplier.thisMonthWeight}Kg
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-[#64748b] uppercase tracking-wide mb-1">
                      EXISTING LOANS
                    </span>
                    <span className="text-base font-bold text-[#0f172a]">
                      Rs. {supplier.loanAmount || "0"}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-[#64748b] uppercase tracking-wide mb-1">
                      FERTILIZER LOANS
                    </span>
                    <span className="text-base font-bold text-[#0f172a]">
                      Rs. {supplier.fertilizerLoan}
                    </span>
                  </div>
                  {supplier.status === "REQUESTED" && (
                    <div className="flex flex-col">
                      <span className="text-xs font-medium text-[#64748b] uppercase tracking-wide mb-1">
                        THIS MONTH INCOME
                      </span>
                      <span className="text-base font-bold text-[#0f172a]">
                        Rs. {supplier.thisMonthIncome}
                      </span>
                    </div>
                  )}
                  {supplier.status === "REJECTED" &&
                    supplier.rejectionReason && (
                      <div className="flex flex-col col-span-3">
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                          Rejection Reason
                        </span>
                        <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
                          {supplier.rejectionReason}
                        </p>
                      </div>
                    )}
                </div>
              </div>
            </div>
          </div>
          {/* Chart and Timeline below Advance Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tea Supply Chart */}
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
            {/* Activity Timeline */}
            <div className="bg-white shadow overflow-hidden rounded border border-[#94a3b8]">
              <div className="p-6 pb-0 border-b border-[#cbd5e1] mb-6">
                <h2 className="text-lg font-bold text-[#0f172a] mb-2">
                  Activity Timeline
                </h2>
              </div>
              <div className="px-6 pb-6">
                <div className="space-y-4">
                  <div className="flex space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <FileText className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        Advance Request Submitted
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(supplier.requestedDate).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}{" "}
                        at 2:30 PM
                      </p>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        Eligibility Assessment
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(supplier.requestedDate).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}{" "}
                        at 2:45 PM
                      </p>
                    </div>
                  </div>

                  {supplier.status === "APPROVED" && supplier.approvedDate && (
                    <div className="flex space-x-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          Advance Approved
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {supplier.approvedDate} at 9:00 AM
                        </p>
                      </div>
                    </div>
                  )}

                  {supplier.status === "REJECTED" && supplier.rejectedDate && (
                    <div className="flex space-x-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                        <X className="w-4 h-4 text-red-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          Advance Rejected
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {supplier.rejectedDate} at 9:00 AM
                        </p>
                      </div>
                    </div>
                  )}

                  {supplier.status === "REQUESTED" && (
                    <div className="flex space-x-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                        <Clock className="w-4 h-4 text-yellow-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          Under Review
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Pending approval decision
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
