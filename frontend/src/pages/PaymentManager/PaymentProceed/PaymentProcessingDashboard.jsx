import {
  AlertTriangle,
  BarChart3,
  Calendar,
  Clock,
  Download,
  FileText,
  History,
  Wallet
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getCashPaymentsQueue,
  getDashboardStatistics,
} from "../../../api/paymentManager";

// Color constants to match existing theme
const ACCENT_COLOR = "#165e52";
const BUTTON_COLOR = "#172526";
const BORDER_COLOR = "#cfece6";
const BG_LIGHT_GREEN = "#e1f4ef";

const PaymentProcessingDashboard = () => {
  const navigate = useNavigate();
  const [dashboardStats, setDashboardStats] = useState(null);
  const [cashRoutes, setCashRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get current month and year
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1; // getMonth() returns 0-11, so add 1
  const currentYear = currentDate.getFullYear();
  const currentMonthName = currentDate.toLocaleString("default", {
    month: "long",
  });

  // Fetch dashboard statistics and cash routes
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [stats, cashData] = await Promise.all([
          getDashboardStatistics({
            month: currentMonth,
            year: currentYear,
            factoryId: "1",
          }),
          getCashPaymentsQueue({ factoryId: "1" }),
        ]);

        setDashboardStats(stats);
        // cashData may be an array or object depending on API response
        const cashArray = Array.isArray(cashData)
          ? cashData
          : typeof cashData === "object" && cashData !== null
            ? Object.values(cashData)
            : [];
        setCashRoutes(cashArray);
        setError(null);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data");
        setDashboardStats(null);
        setCashRoutes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [currentMonth, currentYear]);

  const quickStats = [
    {
      title: "Pending Monthly",
      amount: dashboardStats
        ? `Rs. ${dashboardStats.monthlyPendingCount || 0}`
        : "Rs. 0",
      icon: <Calendar size={24} />,
      color: "accent",
    },
    {
      title: "Pending Ad-hoc",
      amount: dashboardStats
        ? `Rs. ${dashboardStats.adhocApprovedSum || 0}`
        : "Rs. 0",
      icon: <Clock size={24} />,
      color: "accent",
    },
    {
      title: "Cash Ready",
      amount: dashboardStats
        ? `Rs. ${dashboardStats.cashReadySum || 0}`
        : "Rs. 0",
      icon: <Wallet size={24} />,
      color: "accent",
    },
    {
      title: "Bank Queue",
      amount: dashboardStats
        ? `Rs. ${dashboardStats.bankQueueSum || 0}`
        : "Rs. 0",
      icon: <FileText size={24} />,
      color: "accent",
    },
  ];

  const quickLinks = [
    { title: "Payment History", icon: <History size={20} />, color: "accent" },
    {
      title: "Bank CSV History",
      icon: <Download size={20} />,
      color: "accent",
    },
    { title: "Reports", icon: <BarChart3 size={20} />, color: "accent" },
  ];

  const getColorClasses = () => {
    return `bg-[${BG_LIGHT_GREEN}] border-[${BORDER_COLOR}] text-[${ACCENT_COLOR}]`;
  };

  const getButtonClasses = () => {
    return `bg-[${BUTTON_COLOR}] hover:opacity-90 text-white`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-start justify-between">
          <div className="flex items-center gap-4">
            <h1
              className="text-3xl font-bold mb-1"
              style={{ color: ACCENT_COLOR }}
            >
              Payment Processing Center
            </h1>
            <p className="text-lg" style={{ color: ACCENT_COLOR }}>
              {currentMonthName} {currentYear} - Manager Actions
            </p>
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
            <span className="ml-3 text-gray-600">Loading dashboard...</span>
          </div>
        ) : (
          <>
            {/* Quick Stats Cards - Factory Manager dashboard style */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {quickStats.map((stat, index) => (
                <div
                  key={index}
                  className="bg-white p-6 rounded-lg shadow-md border border-black transition duration-200 hover:shadow-lg hover:border-[#cfece6]"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-black">{stat.title}</p>
                      <p className="text-2xl font-bold text-black">{stat.amount}</p>
                    </div>
                    <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center">
                      {stat.icon}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Action Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Monthly Payments Processing */}
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Monthly Payments
                  </h3>
                  <span
                    className="px-3 py-1 text-sm font-medium rounded-full"
                    style={{
                      backgroundColor: BG_LIGHT_GREEN,
                      color: ACCENT_COLOR,
                    }}
                  >
                    {dashboardStats?.monthlyPendingCount || 0} Pending
                  </span>
                </div>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Routes:</span>
                    <span className="font-medium">
                      {dashboardStats?.totalRoutes || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Suppliers:</span>
                    <span className="font-medium">
                      {dashboardStats?.totalSuppliers || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="text-gray-600">Total Amount:</span>
                    <span className="text-2xl font-bold text-gray-900">
                      Rs.{" "}
                      {(
                        dashboardStats?.monthlyPendingSum || 0
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>
                <button
                  className={`w-full py-3 px-4 rounded-lg font-medium transition duration-200 ${getButtonClasses(
                    "primary"
                  )}`}
                  onClick={() =>
                    navigate("/factoryManager/payment/proceed/monthly")
                  }
                >
                  Review & Approve Monthly Payments
                </button>
              </div>

              {/* Pending Ad-hoc Payments */}
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Pending Ad-hoc Payments
                  </h3>
                  <span
                    className="px-3 py-1 text-sm font-medium rounded-full"
                    style={{
                      backgroundColor: BG_LIGHT_GREEN,
                      color: ACCENT_COLOR,
                    }}
                  >
                    {dashboardStats?.adhocPendingCount || 0} Pending
                  </span>
                </div>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bank Payments:</span>
                    <span className="font-medium">
                      {dashboardStats?.adhocBankCount || 0} (
                      {dashboardStats?.adhocBankSum
                        ? `Rs. ${dashboardStats.adhocBankSum.toLocaleString()}`
                        : "Rs. 0"}
                      )
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cash Payments:</span>
                    <span className="font-medium">
                      {dashboardStats?.adhocCashCount || 0} (
                      {dashboardStats?.adhocCashSum
                        ? `Rs. ${dashboardStats.adhocCashSum.toLocaleString()}`
                        : "Rs. 0"}
                      )
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="text-gray-600">Total Amount:</span>
                    <span className="text-2xl font-bold text-gray-900">
                      Rs.{" "}
                      {(dashboardStats?.adhocPendingSum || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
                <button
                  className={`w-full py-3 px-4 rounded-lg font-medium transition duration-200 ${getButtonClasses(
                    "warning"
                  )}`}
                  onClick={() =>
                    navigate("/factoryManager/payment/proceed/adhoc")
                  }
                >
                  Process Ad-hoc Payments
                </button>
              </div>
            </div>

            {/* Cash Disbursement Queue */}
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: BG_LIGHT_GREEN }}
                >
                  <Wallet size={24} style={{ color: ACCENT_COLOR }} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Cash Disbursement Queue
                </h3>
              </div>
              <div className="space-y-4">
                {cashRoutes.map((route, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 rounded-lg border"
                    style={{
                      backgroundColor: BG_LIGHT_GREEN,
                      borderColor: BORDER_COLOR,
                    }}
                  >
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {route.routeId} - {route.routeName}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {route.paymentCount || 0} payments • Rs.{" "}
                        {(route.totalAmount || 0).toLocaleString()}
                      </p>
                    </div>
                    <button
                      className="px-4 py-2 text-white rounded-lg font-medium transition duration-200"
                      style={{ backgroundColor: BUTTON_COLOR }}
                    >
                      Disburse Cash
                    </button>
                  </div>
                ))}
                {cashRoutes.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No cash payments ready for disbursement
                  </div>
                )}
              </div>
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {quickLinks.map((link, index) => (
                <div
                  key={index}
                  className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition duration-200 cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-3 rounded-lg ${getColorClasses(link.color).split(" ")[0]
                        } bg-opacity-20`}
                    >
                      {link.icon}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {link.title}
                      </h4>
                      <p className="text-sm text-gray-600">Click to view</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentProcessingDashboard;
