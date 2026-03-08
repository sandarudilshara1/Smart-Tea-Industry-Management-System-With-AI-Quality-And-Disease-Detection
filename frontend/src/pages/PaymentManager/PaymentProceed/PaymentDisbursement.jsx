import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  Wallet,
  AlertCircle,
  Download,
  CheckCircle,
} from "lucide-react";
import BankCsvConfirmationModal from "./BankCsvConfirmationModal";
import {
  getBankPaymentsQueue,
  generateBankCsv,
  getCashPaymentsQueue,
} from "../../../api/paymentManager";
import { useAuth } from "../../../contexts/AuthContext";

// Color constants to match existing theme
const ACCENT_COLOR = "#165e52";
const BUTTON_COLOR = "#172526";
const BORDER_COLOR = "#cfece6";
const BG_LIGHT_GREEN = "#e1f4ef";

const PaymentDisbursement = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showCsvModal, setShowCsvModal] = useState(false);
  const [bankPayments, setBankPayments] = useState([]);
  const [cashRoutes, setCashRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const proceedBasePath =
    user?.role === "payment_manager"
      ? "/payment-manager/proceed"
      : "/factoryManager/payment/proceed";

  const getFactoryId = () => user?.factoryId || "1";
  const actorUserId = user?.userId || user?.id || user?._id;

  const normalizeAmount = (payment) =>
    payment?.amount ?? payment?.finalAmount ?? payment?.grossAmount ?? 0;

  const normalizePaymentId = (payment) => payment?.id || payment?._id;

  const normalizeRouteId = (payment) => {
    const route = payment?.routeId;
    if (!route) return "Unknown Route";
    if (typeof route === "string") return route;
    return route.routeId || route._id || "Unknown Route";
  };

  const normalizeRouteName = (payment) => {
    const route = payment?.routeId;
    if (!route || typeof route === "string") return "Unknown Route";
    return route.routeName || route.name || route.routeId || "Unknown Route";
  };

  const groupCashRoutes = (payments = []) => {
    const grouped = new Map();

    payments.forEach((payment) => {
      const key = normalizeRouteId(payment);
      const amount = normalizeAmount(payment);
      if (!grouped.has(key)) {
        grouped.set(key, {
          routeId: key,
          routeName: normalizeRouteName(payment),
          paymentCount: 0,
          totalAmount: 0,
        });
      }

      const current = grouped.get(key);
      current.paymentCount += 1;
      current.totalAmount += amount;
    });

    return Array.from(grouped.values());
  };

  // Fetch bank and cash payment queues
  useEffect(() => {
    const fetchPaymentQueues = async () => {
      try {
        setLoading(true);
        const factoryId = getFactoryId();
        const [bankData, cashData] = await Promise.all([
          getBankPaymentsQueue({ factoryId }),
          getCashPaymentsQueue({ factoryId }),
        ]);

        setBankPayments(bankData?.content || []);
        setCashRoutes(groupCashRoutes(cashData?.content || []));
        setError(null);
      } catch (err) {
        console.error("Error fetching payment queues:", err);
        setError("Failed to load payment queues");
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentQueues();
  }, [user?.factoryId]);

  // Handle CSV generation
  const handleGenerateCsv = async () => {
    try {
      const paymentIds = bankPayments
        .map((payment) => normalizePaymentId(payment))
        .filter(Boolean);

      if (paymentIds.length === 0) {
        throw new Error("No eligible bank payments selected");
      }

      const csvBatch = await generateBankCsv({
        paymentIds,
        factoryId: getFactoryId(),
        generatedBy: actorUserId,
      });

      const batchId = csvBatch?.data?.batchId;
      if (!batchId) {
        throw new Error("CSV generated but batch ID was not returned");
      }

      setShowCsvModal(false);

      // Refresh bank payments queue
      const updatedBankPayments = await getBankPaymentsQueue({
        factoryId: getFactoryId(),
      });

      setBankPayments(updatedBankPayments?.content || []);
      return batchId;
    } catch (err) {
      console.error("Error generating CSV:", err);
      throw err;
    }
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
                Payment Disbursement
              </h1>
              <p className="text-lg" style={{ color: ACCENT_COLOR }}>
                Process Approved Payments
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
              Loading payment queues...
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
            {/* Bank Payments Card */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200 mb-8">
              <div
                className="border-t-4 rounded-t-lg"
                style={{ borderTopColor: ACCENT_COLOR }}
              >
                <div
                  className="px-6 py-4 rounded-t-lg"
                  style={{ backgroundColor: BG_LIGHT_GREEN }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Bank Payments Queue
                      </h3>
                      <p className="text-sm text-gray-600">
                        Generate CSV for bank transfer
                      </p>
                    </div>
                    <div
                      className="p-3 rounded-lg"
                      style={{ backgroundColor: BG_LIGHT_GREEN }}
                    >
                      <FileText size={24} style={{ color: ACCENT_COLOR }} />
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div
                    className="border rounded-lg p-4 mb-6"
                    style={{
                      backgroundColor: BG_LIGHT_GREEN,
                      borderColor: BORDER_COLOR,
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <AlertCircle
                        size={20}
                        className="mt-0.5"
                        style={{ color: ACCENT_COLOR }}
                      />
                      <div>
                        <p
                          className="font-medium"
                          style={{ color: ACCENT_COLOR }}
                        >
                          {bankPayments.length} Bank Payments Ready
                        </p>
                        <p className="text-sm" style={{ color: ACCENT_COLOR }}>
                          Total: Rs.{" "}
                          {bankPayments
                            .reduce(
                              (sum, payment) => sum + normalizeAmount(payment),
                              0
                            )
                            .toLocaleString("en-IN", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}{" "}
                          across{" "}
                          {new Set(bankPayments.map((p) => normalizeRouteId(p))).size}{" "}
                          routes ({bankPayments.length} suppliers)
                        </p>
                      </div>
                    </div>
                  </div>
                  <button
                    className="w-full mb-3 px-6 py-4 text-white rounded-lg font-medium transition duration-200 flex items-center justify-center gap-2"
                    style={{ backgroundColor: BUTTON_COLOR }}
                    onClick={() => setShowCsvModal(true)}
                    disabled={bankPayments.length === 0}
                  >
                    <Download size={20} />
                    Generate Bank CSV File
                  </button>
                  <p className="text-sm text-gray-500 text-center">
                    CSV will include all bank payments from approved monthly
                    calculations
                  </p>
                </div>
              </div>
            </div>

            {/* Cash Payments Card */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200">
              <div
                className="border-t-4 rounded-t-lg"
                style={{ borderTopColor: ACCENT_COLOR }}
              >
                <div
                  className="px-6 py-4 rounded-t-lg"
                  style={{ backgroundColor: BG_LIGHT_GREEN }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Cash Payments Queue
                      </h3>
                      <p className="text-sm text-gray-600">
                        Ready for driver collection
                      </p>
                    </div>
                    <div
                      className="p-3 rounded-lg"
                      style={{ backgroundColor: BG_LIGHT_GREEN }}
                    >
                      <Wallet size={24} style={{ color: ACCENT_COLOR }} />
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {cashRoutes.map((route, index) => (
                      <div
                        key={index}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition duration-200"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-bold text-gray-900">
                            {route.routeId} - {route.routeName}
                          </h4>
                          <span className="text-2xl font-bold text-gray-900">
                            Rs.{" "}
                            {route.totalAmount?.toLocaleString("en-IN", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }) || "0.00"}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">
                          {route.paymentCount || 0} payments
                        </p>
                        <button
                          className="w-full px-4 py-2 text-white rounded-lg font-medium transition duration-200 flex items-center justify-center gap-2"
                          style={{ backgroundColor: BUTTON_COLOR }}
                          onClick={() =>
                            navigate(`${proceedBasePath}/cash-terminal/${route.routeId}`)
                          }
                        >
                          <CheckCircle size={16} />
                          Mark Ready for Driver Collection
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* CSV Confirmation Modal */}
      <BankCsvConfirmationModal
        isOpen={showCsvModal}
        onClose={() => setShowCsvModal(false)}
        onConfirm={handleGenerateCsv}
        payments={bankPayments}
      />
    </div>
  );
};

export default PaymentDisbursement;
