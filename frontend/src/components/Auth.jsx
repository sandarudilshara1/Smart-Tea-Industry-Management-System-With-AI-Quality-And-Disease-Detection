import React, { useState } from "react";
import { Eye, EyeOff, User, Lock } from "lucide-react";
import { login } from "../api/auth";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

// COLORS FROM YOUR LANDING PAGE
const BUTTON_COLOR = "#172526"; // dark green for buttons
const ACCENT_COLOR = "#165e52"; // rest of greens (backgrounds/accents)
const BG_COLOR = "#f5faf8"; // subtle background, optional

export default function Auth() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const normalizeRole = (role) => String(role || "").trim().toLowerCase();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    
    try {
      // Use backend login endpoint
      const response = await login(email, password);
      
      if (response.success) {
        const { token, user } = response.data;
        const role = normalizeRole(user.role);
        
        // Save token to localStorage
        localStorage.setItem("authToken", token);
        localStorage.setItem("userId", user.id);
        
        // Set user in context (with correct structure)
        const userData = {
          userId: user.id,
          email: user.email,
          role,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          address: user.address,
          nic: user.nic,
          profileImage: user.profileImage,
          isActive: user.isActive
        };
        
        setUser(userData);
        setLoading(false);

        const roleRouteMap = {
          supplier: "/supplier/dashboard",
          driver: "/driver/dashboard",
          factory_manager: "/factoryManager/dashboard",
          inventory_manager: "/inventoryManager/dashboard",
          fertilizer_manager: "/fertilizerManager/dashboard",
          estate_manager: "/estateManager/dashboard",
          transport_manager: "/transportManager/dashboard",
          owner: "/owner/dashboard",
          payment_manager: "/payment-manager/dashboard",
        };

        navigate(roleRouteMap[role] || "/landing");
      } else {
        setLoading(false);
        setError(response.message || "Login failed");
      }
    } catch (error) {
      setLoading(false);
      console.error("Login error:", error);

      setError(error?.response?.data?.message || "Invalid credentials. Please try again.");
    }
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center"
      style={{ background: BG_COLOR }}
    >
      {/* Centered Box with Image and Form Side by Side */}
      <div className="flex flex-row w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden bg-white">
        {/* Left: Image */}
        <div className="w-1/2 flex items-center justify-center bg-[#f5faf8]">
          <img
            src="/assets/hi1.jpg"
            alt="Welcome"
            className="w-full h-full object-cover"
            style={{
              minHeight: "100%",
              minWidth: "100%",
              background: ACCENT_COLOR,
            }}
          />
        </div>
        {/* Right: Form */}
        <div className="flex flex-col justify-center items-center w-1/2 p-8 bg-white">
          {/* Logo and App Name */}
          <div className="w-full max-w-sm">
            <div className="flex justify-center mb-6">
              <img
                src="/assets/logo2.png"
                alt="GreenLeaf Logo"
                className="w-14 h-14 object-contain"
              />
            </div>
            <h2
              className="text-3xl font-extrabold mb-1 tracking-tight text-center"
              style={{ color: ACCENT_COLOR }}
            >
              Welcome Back
            </h2>
            <p className="mb-6 text-gray-500 text-center">
              Sign in to your dashboard
            </p>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1 block">
                  Email
                </label>
                <div className="relative">
                  <User
                    className="absolute top-3 left-3"
                    size={20}
                    style={{ color: ACCENT_COLOR }}
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-emerald-100 rounded-xl focus:ring-0 bg-[#F5FAF8] focus:outline-none transition"
                    placeholder="Enter your email"
                    required
                    style={{ color: "#222" }}
                  />
                </div>
              </div>
              {/* Password */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1 block">
                  Password
                </label>
                <div className="relative">
                  <Lock
                    className="absolute top-3 left-3"
                    size={20}
                    style={{ color: ACCENT_COLOR }}
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2 border border-emerald-100 rounded-xl focus:ring-0 bg-[#F5FAF8] focus:outline-none transition"
                    placeholder="Enter your password"
                    required
                    style={{ color: "#222" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 focus:outline-none"
                    style={{
                      color: ACCENT_COLOR,
                      boxShadow: showPassword ? "0 0 0 4px #165e52" : "none",
                    }}
                    onFocus={(e) =>
                      (e.currentTarget.style.boxShadow = "0 0 0 4px #165e52")
                    }
                    onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              {error && (
                <div className="text-red-600 text-center text-sm font-medium">
                  {error}
                </div>
              )}
              {loading && (
                <div className="flex flex-col items-center my-2">
                  <span className="relative flex h-6 w-6 mb-1">
                    <span className="animate-spin inline-block w-full h-full rounded-full border-4 border-solid border-emerald-400 border-t-transparent"></span>
                  </span>
                  <span
                    className="text-center text-sm font-medium"
                    style={{ color: ACCENT_COLOR }}
                  >
                    Logging in...
                  </span>
                </div>
              )}
              {success && !loading && (
                <div
                  className="text-center text-sm font-medium"
                  style={{ color: ACCENT_COLOR }}
                >
                  {success}
                </div>
              )}
              <button
                type="submit"
                className="w-full text-white py-3 rounded-xl font-bold shadow-lg transition focus:outline-none focus:ring-0 flex items-center justify-center"
                style={{
                  background: BUTTON_COLOR,
                  boxShadow: "0 4px 24px 0 rgba(22,94,82, 0.08)",
                  opacity: loading ? 0.7 : 1,
                  cursor: loading ? "not-allowed" : "pointer",
                }}
                disabled={loading}
              >
                {"Sign In"}
              </button>
            </form>
            <div className="text-center mt-2">
              <a
                href="/forgot-password"
                className="text-sm hover:underline font-medium"
                style={{ color: ACCENT_COLOR }}
              >
                Forgot Password?
              </a>
            </div>
            <div className="text-center mt-4">
              <span className="text-gray-600">Don't have an account? </span>
              <a href="/signup" className="text-black font-semibold hover:underline" style={{ color: ACCENT_COLOR }}>
                Sign Up
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
