import { useState } from "react";
import { Bell, User, Calculator, X, CheckCircle, AlertCircle, Info } from "lucide-react";

export default function Navbar() {
  const [showCalculator, setShowCalculator] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const ACCENT_COLOR = "#165E52";

  // Sample notifications
  const notifications = [
    {
      id: 1,
      type: "success",
      title: "Tea Collection Completed",
      message: "Andaradeniya Factory collected 1,500 kg today",
      time: "10 mins ago",
      read: false,
    },
    {
      id: 2,
      type: "warning",
      title: "Low Fertilizer Stock",
      message: "Fertilizer inventory below threshold at Factory B",
      time: "1 hour ago",
      read: false,
    },
    {
      id: 3,
      type: "info",
      title: "New Loan Rate Approved",
      message: "Updated loan rate: 8.5% effective from next month",
      time: "2 hours ago",
      read: true,
    },
    {
      id: 4,
      type: "success",
      title: "Quality Assessment Complete",
      message: "Ruhuna Factory received A+ grade",
      time: "3 hours ago",
      read: true,
    },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type) => {
    switch (type) {
      case "success":
        return <CheckCircle size={20} className="text-green-500" />;
      case "warning":
        return <AlertCircle size={20} className="text-yellow-500" />;
      case "info":
        return <Info size={20} className="text-blue-500" />;
      default:
        return <Bell size={20} style={{ color: ACCENT_COLOR }} />;
    }
  };

  return (
    <>
      <nav className="bg-white shadow-md px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold" style={{ color: ACCENT_COLOR }}>
            Tea Factory Management
          </h2>
        </div>

        <div className="flex items-center gap-4">
          {/* Calculator Button */}
          <button
            onClick={() => {
              setShowCalculator(true);
              setShowNotifications(false);
            }}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Calculator"
          >
            <Calculator size={20} style={{ color: ACCENT_COLOR }} />
          </button>

          {/* Notifications Button */}
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowCalculator(false);
            }}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative"
            title="Notifications"
          >
            <Bell size={20} style={{ color: ACCENT_COLOR }} />
            {unreadCount > 0 && (
              <span
                className="absolute top-1 right-1 w-5 h-5 rounded-full text-white text-xs flex items-center justify-center font-bold"
                style={{ backgroundColor: "#ef4444" }}
              >
                {unreadCount}
              </span>
            )}
          </button>

          {/* Profile Button */}
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <User size={20} style={{ color: ACCENT_COLOR }} />
          </button>
        </div>
      </nav>

      {/* Calculator Modal */}
      {showCalculator && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowCalculator(false)}
        >
          <div
            className="bg-white rounded-lg shadow-2xl p-6 w-80"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold" style={{ color: ACCENT_COLOR }}>
                Calculator
              </h3>
              <button
                onClick={() => setShowCalculator(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="bg-gray-100 p-3 rounded mb-4 text-right text-2xl font-mono">
              <input
                type="text"
                id="navbar-calc-display"
                defaultValue="0"
                readOnly
                className="w-full bg-transparent text-right outline-none"
              />
            </div>

            <div className="grid grid-cols-4 gap-2">
              {["7", "8", "9", "/", "4", "5", "6", "*", "1", "2", "3", "-", "0", ".", "=", "+"].map(
                (btn) => (
                  <button
                    key={btn}
                    onClick={() => {
                      const display = document.getElementById("navbar-calc-display");
                      if (btn === "=") {
                        try {
                          display.value = eval(display.value);
                        } catch {
                          display.value = "Error";
                        }
                      } else {
                        if (display.value === "0" || display.value === "Error") {
                          display.value = "";
                        }
                        display.value += btn;
                      }
                    }}
                    className="p-4 rounded-lg font-semibold hover:opacity-80 transition-opacity"
                    style={{
                      backgroundColor: btn === "=" ? ACCENT_COLOR : "#f3f4f6",
                      color: btn === "=" ? "white" : "#111",
                    }}
                  >
                    {btn}
                  </button>
                )
              )}
              <button
                onClick={() => {
                  document.getElementById("navbar-calc-display").value = "0";
                }}
                className="col-span-4 p-4 rounded-lg font-semibold bg-red-500 text-white hover:bg-red-600 transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Panel */}
      {showNotifications && (
        <div className="fixed top-16 right-6 w-96 bg-white rounded-lg shadow-2xl border-2 z-50" style={{ borderColor: ACCENT_COLOR }}>
          <div className="p-4 border-b" style={{ borderColor: ACCENT_COLOR }}>
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold" style={{ color: ACCENT_COLOR }}>
                Notifications
              </h3>
              <button
                onClick={() => setShowNotifications(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell size={48} className="mx-auto mb-2 opacity-30" />
                <p>No notifications</p>
              </div>
            ) : (
              <div className="divide-y">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                      !notification.read ? "bg-green-50" : ""
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-semibold text-sm text-gray-900">
                            {notification.title}
                          </h4>
                          {!notification.read && (
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: ACCENT_COLOR }}
                            ></span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-1">{notification.message}</p>
                        <span className="text-xs text-gray-400">{notification.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-3 border-t text-center">
              <button
                className="text-sm font-medium hover:underline"
                style={{ color: ACCENT_COLOR }}
              >
                View All Notifications
              </button>
            </div>
          )}
        </div>
      )}

      {/* Click outside to close notifications */}
      {showNotifications && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowNotifications(false)}
        ></div>
      )}
    </>
  );
}