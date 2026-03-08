import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  AlertTriangle,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import {
  getPendingAdhocPayments,
  approveAdhocPayment,
  generateBankCsv,
  downloadBankCsv,
} from "../../../api/paymentManager";
import { useAuth } from "../../../contexts/AuthContext";

// Color constants to match existing theme
const ACCENT_COLOR = "#165e52";
const BUTTON_COLOR = "#172526";
const BORDER_COLOR = "#cfece6";
const BG_LIGHT_GREEN = "#e1f4ef";

const AdhocPaymentProcessing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bankPayments, setBankPayments] = useState([]);
  const [cashPayments, setCashPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPayments, setSelectedPayments] = useState([]);
  const [processingCsv, setProcessingCsv] = useState(false);

  const factoryId = user?.factoryId || "1";
  const approverId = user?.userId || user?.id || user?._id;

  const paymentMethodValue = (payment) =>
    String(payment?.paymentMethod || "").toLowerCase();

  const paymentAmount = (payment) =>
    payment?.amount ?? payment?.finalAmount ?? payment?.grossAmount ?? 0;

  const paymentId = (payment) => payment?.id || payment?._id;
  const supplierName = (payment) =>
    payment?.supplierName || payment?.supplierId?.name || "Unknown Supplier";
  const supplierCode = (payment) =>
    payment?.supplierCode || payment?.supplierId?.supplierCode || "N/A";
  const routeLabel = (payment) =>
    payment?.routeCode ||
    payment?.routeId?.routeId ||
    payment?.routeId?.name ||
    payment?.routeId ||
    "N/A";

  const proceedBasePath =
    user?.role === "payment_manager"
      ? "/payment-manager/proceed"
      : "/factoryManager/payment/proceed";

  // Fetch pending adhoc payments
  useEffect(() => {
    const fetchAdhocPayments = async () => {
      try {
        setLoading(true);
        const response = await getPendingAdhocPayments({ factoryId });
        const payments = response?.content || [];

        // Separate bank and cash payments
        const bank = payments.filter((payment) => paymentMethodValue(payment) === "bank");
        const cash = payments.filter((payment) => paymentMethodValue(payment) === "cash");

        setBankPayments(bank);
        setCashPayments(cash);
        setError(null);
      } catch (err) {
        console.error("Error fetching adhoc payments:", err);
        setError("Failed to load adhoc payments");
      } finally {
        setLoading(false);
      }
    };

    fetchAdhocPayments();
  }, [factoryId]);

  // Handle payment approval
  const handleApprovePayment = async (paymentId) => {
    try {
      await approveAdhocPayment(paymentId, {
        approvedBy: approverId,
      });

      // Refresh the payments list
      const response = await getPendingAdhocPayments({ factoryId });
      const payments = response?.content || [];
      const bank = payments.filter((payment) => paymentMethodValue(payment) === "bank");
      const cash = payments.filter((payment) => paymentMethodValue(payment) === "cash");

      setBankPayments(bank);
      setCashPayments(cash);
      alert("Payment approved successfully!");
    } catch (err) {
      console.error("Error approving payment:", err);
      alert("Failed to approve payment. Please try again.");
    }
  };

  // Handle CSV generation for selected bank payments
  const handleGenerateCsv = () => {
    if (selectedPayments.length === 0 || processingCsv) return;

    const run = async () => {
      try {
        setProcessingCsv(true);
        const batch = await generateBankCsv({
          factoryId,
          paymentIds: selectedPayments,
          generatedBy: approverId,
        });

        const batchId = batch?.data?.batchId;
        if (!batchId) {
          throw new Error("Batch ID is missing from CSV generation response");
        }

        const blob = await downloadBankCsv(batchId);
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `adhoc-bank-payments-${batchId}.csv`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);

        alert(`CSV generated for ${selectedPayments.length} selected payments`);
        setSelectedPayments([]);
      } catch (err) {
        console.error("CSV generation failed:", err);
        alert("Failed to generate CSV. Please try again.");
      } finally {
        setProcessingCsv(false);
      }
    };

    run();
  };

  // Handle payment selection
  const handlePaymentSelect = (paymentId) => {
    setSelectedPayments((prev) =>
      prev.includes(paymentId)
        ? prev.filter((id) => id !== paymentId)
        : [...prev, paymentId]
    );
  };

  const getTypeBadgeColor = () => {
    return `text-xs font-medium rounded-full`;
  };

  const getMethodColor = () => {
    return `text-sm`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-start justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(proceedBasePath)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition duration-200"
            >
              <ArrowLeft size={20} />
              <span className="font-medium">Back to Dashboard</span>
            </button>
            <div>
              <h1
                className="text-2xl font-bold mb-1"
                style={{ color: ACCENT_COLOR }}
              >
                Ad-hoc Payment Processing
              </h1>
              <p className="text-lg" style={{ color: ACCENT_COLOR }}>
                Loans & Advances Awaiting Disbursement
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div
              className="animate-spin rounded-full h-12 w-12 border-b-2"
              style={{ borderColor: ACCENT_COLOR }}
            ></div>
            <span className="ml-3 text-gray-600">
              Loading adhoc payments...
            </span>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <div className="flex items-center gap-3">
              <AlertCircle size={20} className="text-red-500" />
              <div>
                <p className="font-medium text-red-800">Error Loading Data</p>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Bank Payment Queue */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200 mb-8">
              <div
                className="px-6 py-4 rounded-t-lg"
                style={{ backgroundColor: BG_LIGHT_GREEN }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Bank Payment Queue
                    </h3>
                    <p className="text-sm text-gray-600">
                      Approved loans ready for bank transfer
                    </p>
                  </div>
                  <span
                    className="px-3 py-1 text-sm font-medium rounded-full"
                    style={{
                      backgroundColor: BG_LIGHT_GREEN,
                      color: ACCENT_COLOR,
                    }}
                  >
                    {bankPayments.length} Payments
                  </span>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4 mb-6">
                  {bankPayments.map((payment, index) => (
                    <div
                      key={paymentId(payment) || index}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition duration-200"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={selectedPayments.includes(paymentId(payment))}
                            onChange={() => handlePaymentSelect(paymentId(payment))}
                            className="w-4 h-4"
                            style={{ accentColor: ACCENT_COLOR }}
                          />
                          <div>
                            <h4 className="font-bold text-gray-900 mb-1">
                              {supplierName(payment)}
                            </h4>
                            <p className="text-sm text-gray-600 mb-2">
                              {supplierCode(payment)} • {routeLabel(payment)}
                            </p>
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2 py-1 ${getTypeBadgeColor()}`}
                                style={{
                                  backgroundColor: BG_LIGHT_GREEN,
                                  color: ACCENT_COLOR,
                                }}
                              >
                                {payment.type}
                              </span>
                              <span className="text-xs text-gray-500">
                                Approved:{" "}
                                {new Date(
                                  payment.approvedDate
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-gray-900 mb-1">
                            Rs.{" "}
                            {paymentAmount(payment)?.toLocaleString("en-IN", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }) || "0.00"}
                          </p>
                          <p
                            className={`${getMethodColor()}`}
                            style={{ color: ACCENT_COLOR }}
                          >
                            {paymentMethodValue(payment) === "bank"
                              ? "Bank Transfer"
                              : "Cash Collection"}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  className="w-full mb-3 px-6 py-3 text-white rounded-lg font-medium transition duration-200 flex items-center justify-center gap-2"
                  style={{ backgroundColor: BUTTON_COLOR }}
                  onClick={handleGenerateCsv}
                  disabled={selectedPayments.length === 0 || processingCsv}
                >
                  <Download size={20} />
                  {processingCsv ? "Generating CSV..." : "Generate CSV for Selected"} (Rs.{" "}
                  {bankPayments
                    .filter((p) => selectedPayments.includes(paymentId(p)))
                    .reduce((sum, p) => sum + paymentAmount(p), 0)
                    .toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  )
                </button>
                <p className="text-sm text-gray-500 text-center">
                  You can batch multiple payments or process individually
                </p>
              </div>
            </div>

            {/* Cash Payment Queue */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200">
              <div
                className="px-6 py-4 rounded-t-lg"
                style={{ backgroundColor: BG_LIGHT_GREEN }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Cash Payment Queue
                    </h3>
                    <p className="text-sm text-gray-600">
                      Ready for driver collection
                    </p>
                  </div>
                  <span
                    className="px-3 py-1 text-sm font-medium rounded-full"
                    style={{
                      backgroundColor: BG_LIGHT_GREEN,
                      color: ACCENT_COLOR,
                    }}
                  >
                    {cashPayments.length} Payments
                  </span>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4 mb-4">
                  {cashPayments.map((payment, index) => (
                    <div
                      key={paymentId(payment) || index}
                      className="border rounded-lg p-4"
                      style={{
                        backgroundColor: BG_LIGHT_GREEN,
                        borderColor: BORDER_COLOR,
                      }}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="font-bold text-gray-900 mb-1">
                            {supplierName(payment)}
                          </h4>
                          <p className="text-sm text-gray-600 mb-2">
                            {supplierCode(payment)} • {routeLabel(payment)}
                          </p>
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-1 ${getTypeBadgeColor()}`}
                              style={{
                                backgroundColor: BG_LIGHT_GREEN,
                                color: ACCENT_COLOR,
                              }}
                            >
                              {payment.type}
                            </span>
                            <span className="text-xs text-gray-500">
                              Approved:{" "}
                              {new Date(
                                payment.approvedDate
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-gray-900 mb-1">
                            Rs.{" "}
                            {paymentAmount(payment)?.toLocaleString("en-IN", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }) || "0.00"}
                          </p>
                          <p
                            className={`${getMethodColor()}`}
                            style={{ color: ACCENT_COLOR }}
                          >
                            {paymentMethodValue(payment) === "bank"
                              ? "Bank Transfer"
                              : "Cash Collection"}
                          </p>
                        </div>
                      </div>
                      <button
                        className="w-full px-4 py-2 text-white rounded-lg font-medium transition duration-200 flex items-center justify-center gap-2"
                        style={{ backgroundColor: BUTTON_COLOR }}
                        onClick={() => handleApprovePayment(paymentId(payment))}
                      >
                        <CheckCircle size={16} />
                        Add to Collection Queue
                      </button>
                    </div>
                  ))}
                </div>
                <div
                  className="border rounded-lg p-4"
                  style={{
                    backgroundColor: BG_LIGHT_GREEN,
                    borderColor: BORDER_COLOR,
                  }}
                >
                  <div className="flex items-start gap-3">
                    <AlertTriangle
                      size={20}
                      className="mt-0.5"
                      style={{ color: ACCENT_COLOR }}
                    />
                    <div>
                      <p className="text-sm" style={{ color: ACCENT_COLOR }}>
                        Cash will be disbursed when driver arrives at factory.
                        Payment will remain in queue until collection.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdhocPaymentProcessing;
