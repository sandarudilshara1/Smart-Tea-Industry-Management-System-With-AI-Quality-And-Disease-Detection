import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  User,
  AlertTriangle,
  CheckCircle,
  X,
  AlertCircle,
} from "lucide-react";
import {
  getCashPaymentsByRoute,
  disburseCash,
} from "../../../api/paymentManager";

const CashDisbursementTerminal = () => {
  const navigate = useNavigate();

  // Color constants to match existing UI theme
  const ACCENT_COLOR = "#165e52";
  const BUTTON_COLOR = "#172526";
  const BORDER_COLOR = "#cfece6";
  const BG_LIGHT_GREEN = "#e1f4ef";

  const [routeData, setRouteData] = useState(null);
  const [monthlyPayments, setMonthlyPayments] = useState([]);
  const [adhocPayments, setAdhocPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [disbursing, setDisbursing] = useState(false);

  // Fetch cash payments for the route
  useEffect(() => {
    const fetchCashPayments = async () => {
      try {
        setLoading(true);
        // TODO: Get routeId from URL params or context
        const routeId = "KD-001"; // Default route for now
        const response = await getCashPaymentsByRoute({
          routeId,
          factoryId: "1",
        });

        setRouteData(response.routeInfo);
        setMonthlyPayments(response.monthlyPayments || []);
        setAdhocPayments(response.adhocPayments || []);
        setError(null);
      } catch (err) {
        console.error("Error fetching cash payments:", err);
        setError("Failed to load cash payments");
      } finally {
        setLoading(false);
      }
    };

    fetchCashPayments();
  }, []);

  // Handle cash disbursement
  const handleDisburseCash = async () => {
    try {
      setDisbursing(true);
      const routeId = "KD-001"; // TODO: Get from route data
      const paymentIds = [...monthlyPayments, ...adhocPayments].map(
        (p) => p.id
      );

      await disburseCash({
        routeId,
        paymentIds,
        disbursedBy: "user123", // TODO: Get from user context
        factoryId: "1",
      });

      alert("Cash disbursed successfully! Receipt has been generated.");
      navigate("/factoryManager/payment/proceed");
    } catch (err) {
      console.error("Error disbursing cash:", err);
      alert("Failed to disburse cash. Please try again.");
    } finally {
      setDisbursing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-md">
        <div className="max-w-4xl mx-auto px-6 py-6 flex items-start justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/factoryManager/payment/proceed")}
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
                Cash Disbursement Terminal
              </h1>
              <p className="text-lg" style={{ color: ACCENT_COLOR }}>
                Driver Collection Point
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div
              className="animate-spin rounded-full h-12 w-12 border-b-2"
              style={{ borderColor: ACCENT_COLOR }}
            ></div>
            <span className="ml-3 text-gray-600">Loading cash payments...</span>
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
            {/* Driver Information Card */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200 mb-6">
              <div className="p-6">
                <div className="flex items-center gap-4">
                  <div
                    className="p-3 rounded-lg"
                    style={{ backgroundColor: BG_LIGHT_GREEN }}
                  >
                    <User size={24} style={{ color: ACCENT_COLOR }} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Driver Route</p>
                    <h3 className="text-xl font-bold text-gray-900">
                      {routeData?.routeId || "N/A"} -{" "}
                      {routeData?.routeName || "Unknown Route"}
                    </h3>
                  </div>
                </div>
                <div
                  className="mt-4 border rounded-lg p-4"
                  style={{
                    backgroundColor: BG_LIGHT_GREEN,
                    borderColor: BORDER_COLOR,
                  }}
                >
                  <p style={{ color: ACCENT_COLOR }}>
                    Driver ID: {routeData?.driverId || "N/A"} • Name:{" "}
                    {routeData?.driverName || "Unknown Driver"}
                  </p>
                </div>
              </div>
            </div>

            {/* Payments Summary Card */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200 mb-6">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">
                  Payments Ready for Collection
                </h3>

                {/* Monthly Payments */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">
                      Monthly Payments
                    </h4>
                    <span className="text-sm text-gray-600">
                      {monthlyPayments.length} suppliers
                    </span>
                  </div>
                  <div className="space-y-2">
                    {monthlyPayments.map((payment, index) => (
                      <div
                        key={payment.id || index}
                        className="flex items-center justify-between bg-gray-50 px-4 py-3 rounded-lg"
                      >
                        <span className="text-gray-900">
                          {payment.supplierName} ({payment.supplierId})
                        </span>
                        <span className="font-medium text-gray-900">
                          Rs.{" "}
                          {payment.amount?.toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }) || "0.00"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Ad-hoc Payments */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">
                      Ad-hoc Payments
                    </h4>
                    <span className="text-sm text-gray-600">
                      {adhocPayments.length} payment
                      {adhocPayments.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {adhocPayments.map((payment, index) => (
                      <div
                        key={payment.id || index}
                        className="border px-4 py-3 rounded-lg"
                        style={{
                          backgroundColor: BG_LIGHT_GREEN,
                          borderColor: BORDER_COLOR,
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-900">
                              {payment.supplierName} ({payment.supplierId})
                            </span>
                            <span
                              className="px-2 py-1 text-xs font-medium rounded-full"
                              style={{
                                backgroundColor: BG_LIGHT_GREEN,
                                color: ACCENT_COLOR,
                              }}
                            >
                              {payment.type}
                            </span>
                          </div>
                          <span className="font-medium text-gray-900">
                            Rs.{" "}
                            {payment.amount?.toLocaleString("en-IN", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }) || "0.00"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total */}
                <div className="border-t border-gray-200 pt-4 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-gray-900">
                      Total Cash to Disburse
                    </span>
                    <span
                      className="text-3xl font-bold"
                      style={{ color: ACCENT_COLOR }}
                    >
                      Rs.{" "}
                      {[...monthlyPayments, ...adhocPayments]
                        .reduce((sum, p) => sum + (p.amount || 0), 0)
                        .toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                    </span>
                  </div>
                </div>

                {/* Warning Box */}
                <div
                  className="border rounded-lg p-4 mb-6"
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
                      <h4
                        className="font-medium mb-2"
                        style={{ color: ACCENT_COLOR }}
                      >
                        Before Disbursing Cash:
                      </h4>
                      <ul
                        className="text-sm space-y-1"
                        style={{ color: ACCENT_COLOR }}
                      >
                        <li>• Verify driver identification</li>
                        <li>
                          • Count cash amount: Rs.{" "}
                          {[...monthlyPayments, ...adhocPayments]
                            .reduce((sum, p) => sum + (p.amount || 0), 0)
                            .toLocaleString("en-IN", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                        </li>
                        <li>• Get driver signature on receipt</li>
                        <li>• Print/save collection receipt for records</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 mb-4">
                  <button
                    className="flex-1 max-w-[80%] px-6 py-3 text-white rounded-lg font-medium transition duration-200 flex items-center justify-center gap-2"
                    style={{ backgroundColor: BUTTON_COLOR }}
                    onClick={handleDisburseCash}
                    disabled={
                      disbursing ||
                      [...monthlyPayments, ...adhocPayments].length === 0
                    }
                    onMouseOver={(e) =>
                      (e.target.style.backgroundColor = "#2a3a3a")
                    }
                    onMouseOut={(e) =>
                      (e.target.style.backgroundColor = BUTTON_COLOR)
                    }
                  >
                    {disbursing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircle size={20} />
                        Disburse Cash & Print Receipt
                      </>
                    )}
                  </button>
                  <button className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition duration-200">
                    Cancel
                  </button>
                </div>
                <p className="text-sm text-gray-500 text-center">
                  All payments will be marked as 'DISBURSED' after confirmation
                </p>
              </div>
            </div>

            {/* Receipt Preview Card */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Receipt Preview
                </h3>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <pre className="text-xs font-mono text-gray-900 whitespace-pre-wrap">
                    {`  ========================================
        TEA FACTORY - CASH DISBURSEMENT
              Collection Receipt
  ========================================
  Date: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}
  Batch ID: CASH-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-001
  Route: ${routeData?.routeId || "N/A"} - ${
                      routeData?.routeName || "Unknown Route"
                    }
  Driver: ${routeData?.driverName || "Unknown Driver"} (${
                      routeData?.driverId || "N/A"
                    })
  ----------------------------------------
  Payment Details:
  Monthly Payments:    Rs. ${monthlyPayments
    .reduce((sum, p) => sum + (p.amount || 0), 0)
    .toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}
  Ad-hoc Payments:     Rs. ${adhocPayments
    .reduce((sum, p) => sum + (p.amount || 0), 0)
    .toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}
  ========================================
  TOTAL AMOUNT:        Rs. ${[...monthlyPayments, ...adhocPayments]
    .reduce((sum, p) => sum + (p.amount || 0), 0)
    .toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}
  ========================================
  
  Driver Signature: _______________
  I acknowledge receipt of the above amount
  
  Manager Signature: _______________
  Authorized by Factory Manager`}
                  </pre>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CashDisbursementTerminal;
