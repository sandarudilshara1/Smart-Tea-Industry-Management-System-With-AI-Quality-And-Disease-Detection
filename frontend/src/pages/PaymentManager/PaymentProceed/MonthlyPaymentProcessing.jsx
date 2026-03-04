import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  DollarSign,
  CreditCard,
  Wallet,
  CheckCircle,
} from "lucide-react";
import {
  getMonthlyPaymentsForApproval,
  approveMonthlyPayments,
} from "../../../api/paymentManager";

// Color constants to match existing theme
const ACCENT_COLOR = "#165e52";
const BUTTON_COLOR = "#172526";
const BORDER_COLOR = "#cfece6";
const BG_LIGHT_GREEN = "#e1f4ef";

const MonthlyPaymentProcessing = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);
  const [error, setError] = useState(null);

  // Get current month and year
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1; // getMonth() returns 0-11, so add 1
  const currentYear = currentDate.getFullYear();

  // Fetch monthly payments for approval
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        const paymentData = await getMonthlyPaymentsForApproval({
          month: currentMonth,
          year: currentYear,
          factoryId: "1", // TODO: Get from user context
        });
        setPayments(paymentData);
        setError(null);
      } catch (err) {
        console.error("Error fetching monthly payments:", err);
        setError("Failed to load monthly payments");
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [currentMonth, currentYear]);

  // Handle approval of all payments
  const handleApproveAll = async () => {
    try {
      setApproving(true);
      const paymentIds = payments.map((payment) => payment.id);
      await approveMonthlyPayments({
        paymentIds,
        approvedBy: "user123", // TODO: Get from user context
        notes: "Approved from dashboard",
      });

      // Refresh the payments list
      const updatedPayments = await getMonthlyPaymentsForApproval({
        month: currentMonth,
        year: currentYear,
        factoryId: "1",
      });
      setPayments(updatedPayments);

      alert("All monthly payments approved successfully!");
    } catch (err) {
      console.error("Error approving payments:", err);
      alert("Failed to approve payments. Please try again.");
    } finally {
      setApproving(false);
    }
  };

  // Calculate summary data from payments
  const summaryCards = [
    {
      title: "Total Monthly Amount",
      value:
        payments.length > 0
          ? `Rs. ${payments
              .reduce((sum, p) => sum + parseFloat(p.netAmount), 0)
              .toLocaleString()}`
          : "Rs. 0",
      icon: <DollarSign size={24} />,
      color: "accent",
    },
    {
      title: "Bank Payments",
      value:
        payments.length > 0
          ? `Rs. ${payments
              .filter((p) => p.disbursementMethod === "BANK")
              .reduce((sum, p) => sum + parseFloat(p.netAmount), 0)
              .toLocaleString()}`
          : "Rs. 0",
      icon: <CreditCard size={24} />,
      color: "accent",
    },
    {
      title: "Cash Payments",
      value:
        payments.length > 0
          ? `Rs. ${payments
              .filter((p) => p.disbursementMethod === "CASH")
              .reduce((sum, p) => sum + parseFloat(p.netAmount), 0)
              .toLocaleString()}`
          : "Rs. 0",
      icon: <Wallet size={24} />,
      color: "accent",
    },
  ];

  // Group payments by route
  const routeData = payments.reduce((acc, payment) => {
    const existingRoute = acc.find((r) => r.routeId === payment.routeId);
    if (existingRoute) {
      existingRoute.suppliers += 1;
      existingRoute.totalWeight = (
        parseFloat(existingRoute.totalWeight) +
        parseFloat(payment.totalWeight || 0)
      ).toFixed(1);
      existingRoute.grossAmount = (
        parseFloat(existingRoute.grossAmount.replace(/[^\d.-]/g, "")) +
        parseFloat(payment.grossAmount)
      ).toFixed(2);
      existingRoute.netAmount = (
        parseFloat(existingRoute.netAmount.replace(/[^\d.-]/g, "")) +
        parseFloat(payment.netAmount)
      ).toFixed(2);
    } else {
      acc.push({
        routeId: payment.routeId,
        routeName: payment.routeName,
        suppliers: 1,
        totalWeight: `${parseFloat(payment.totalWeight || 0).toFixed(1)} kg`,
        grossAmount: `Rs. ${parseFloat(payment.grossAmount).toLocaleString()}`,
        deductions: `-Rs. ${(
          parseFloat(payment.grossAmount) - parseFloat(payment.netAmount)
        ).toLocaleString()}`,
        netAmount: `Rs. ${parseFloat(payment.netAmount).toLocaleString()}`,
        status: payment.status,
      });
    }
    return acc;
  }, []);

  const getCardClasses = () => {
    return `bg-[${BG_LIGHT_GREEN}] border-[${BORDER_COLOR}]`;
  };

  const getIconClasses = () => {
    return `text-[${ACCENT_COLOR}]`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-start justify-between">
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
                Monthly Payment Processing
              </h1>
              <p className="text-lg" style={{ color: ACCENT_COLOR }}>
                {currentMonth} {currentYear} - Review and Approve
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-3">
              <AlertTriangle size={20} className="text-red-600" />
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div
              className="animate-spin rounded-full h-8 w-8 border-b-2"
              style={{ borderColor: ACCENT_COLOR }}
            ></div>
            <span className="ml-3 text-gray-600">
              Loading monthly payments...
            </span>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {summaryCards.map((card, index) => (
                <div
                  key={index}
                  className={`bg-white p-6 rounded-lg shadow-md border ${getCardClasses(
                    card.color
                  )} transition duration-200 hover:shadow-lg`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-2">
                        {card.title}
                      </p>
                      <p className="text-3xl font-bold text-gray-900">
                        {card.value}
                      </p>
                    </div>
                    <div
                      className={`p-3 rounded-full ${
                        getCardClasses(card.color).split(" ")[0]
                      } bg-opacity-20 ${getIconClasses(card.color)}`}
                    >
                      {card.icon}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Route-wise Breakdown Table */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Route-wise Payment Breakdown
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">
                        Route
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">
                        Suppliers
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">
                        Total Weight
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">
                        Gross Amount
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">
                        Deductions
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">
                        Net Amount
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {routeData.map((row, index) => (
                      <tr
                        key={index}
                        className="border-b border-gray-100 hover:bg-gray-50 transition duration-200"
                      >
                        <td className="py-4 px-4">
                          <div>
                            <div className="font-medium text-gray-900">
                              {row.routeId}
                            </div>
                            <div className="text-sm text-gray-600">
                              {row.routeName}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-gray-900">
                          {row.suppliers}
                        </td>
                        <td className="py-4 px-4 text-gray-900">
                          {row.totalWeight}
                        </td>
                        <td className="py-4 px-4 text-gray-900">
                          {row.grossAmount}
                        </td>
                        <td className="py-4 px-4 text-red-600 font-medium">
                          {row.deductions}
                        </td>
                        <td className="py-4 px-4 font-bold text-gray-900">
                          {row.netAmount}
                        </td>
                        <td className="py-4 px-4">
                          <span
                            className="px-3 py-1 text-xs font-medium rounded-full"
                            style={{
                              backgroundColor: BG_LIGHT_GREEN,
                              color: ACCENT_COLOR,
                            }}
                          >
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Approval Card */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Approve Monthly Payments
              </h3>
              <p className="text-gray-600 mb-6">
                Review the calculations above. Once approved, you can proceed to
                generate bank CSV and prepare cash payments.
              </p>
              <div className="flex gap-4">
                <button
                  className="flex-1 max-w-[70%] px-6 py-3 rounded-lg font-medium transition duration-200 flex items-center justify-center gap-2"
                  style={{ backgroundColor: BUTTON_COLOR, color: "white" }}
                  onClick={handleApproveAll}
                  disabled={approving}
                >
                  {approving ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <CheckCircle size={20} />
                  )}
                  {approving ? "Approving..." : "Approve All Monthly Payments"}
                </button>
                <button className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition duration-200">
                  View Details
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MonthlyPaymentProcessing;
