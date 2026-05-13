import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  User,
  LogOut,
  Calculator,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const ACCENT_COLOR = "#165E52";

export default function Navbar() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showCalculator, setShowCalculator] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <>
      <nav className="bg-white shadow-md border-b-2" style={{ borderColor: ACCENT_COLOR }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left side - Logo/Title */}
            <div className="flex items-center">
              <h1 className="text-2xl font-bold" style={{ color: ACCENT_COLOR }}>
                {user?.factoryName || "GreenLeaf Tea Factory"}
              </h1>
            </div>

            {/* Right side - Actions */}
            <div className="flex items-center gap-3">
              {/* Notifications */}
              <button
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative"
                title="Notifications"
              >
                <Bell size={22} style={{ color: ACCENT_COLOR }} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* Calculator Button */}
              <button
                onClick={() => setShowCalculator(true)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                title="Calculator"
              >
                <Calculator size={22} style={{ color: ACCENT_COLOR }} />
              </button>

              {/* Profile */}
              <button
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                title="Profile"
              >
                <User size={22} style={{ color: ACCENT_COLOR }} />
              </button>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
                style={{ backgroundColor: ACCENT_COLOR }}
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Calculator Modal */}
      {showCalculator && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-2xl p-6 w-80">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold" style={{ color: ACCENT_COLOR }}>
                Quick Calculator
              </h3>
              <button
                onClick={() => setShowCalculator(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            {/* Calculator Display */}
            <div className="bg-gray-100 p-3 rounded mb-4 text-right text-2xl font-mono">
              <input
                type="text"
                id="calc-display"
                defaultValue="0"
                readOnly
                className="w-full bg-transparent text-right outline-none"
              />
            </div>

            {/* Calculator Buttons */}
            <div className="grid grid-cols-4 gap-2">
              {["7", "8", "9", "/", "4", "5", "6", "*", "1", "2", "3", "-", "0", ".", "=", "+"].map(
                (btn) => (
                  <button
                    key={btn}
                    onClick={() => {
                      const display = document.getElementById("calc-display");
                      if (btn === "=") {
                        try {
                          display.value = eval(display.value);
                        } catch {
                          display.value = "Error";
                        }
                      } else {
                        if (display.value === "0" || display.value === "Error") display.value = "";
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
                  document.getElementById("calc-display").value = "0";
                }}
                className="col-span-4 p-4 rounded-lg font-semibold bg-red-500 text-white hover:bg-red-600 transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}