import React, { useState } from "react";
import { Eye, EyeOff, User, Lock } from "lucide-react";
import { login } from "../api/auth";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

import PublicNavbar from "./PublicNavbar";

// COLORS FROM LANDING PAGE
const BG_COLOR = "#0b1a0e"; 
const BOX_BG = "rgba(255,255,255,0.035)";
const BORDER = "rgba(180,210,79,0.2)";
const TEXT_PRIMARY = "#f2f7e8";
const TEXT_SECONDARY = "rgba(214,233,176,0.55)";
const ACCENT = "#b4d24f";

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
          isActive: user.isActive,
          factoryName: user.factoryName || ''
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
      className="min-h-screen w-full flex flex-col font-sans"
      style={{ background: BG_COLOR }}
    >
      <PublicNavbar />
      <div className="flex-grow flex items-center justify-center p-6 pt-24">
        {/* Centered Box with Image and Form Side by Side */}
        <div 
          className="flex flex-col md:flex-row w-full max-w-4xl rounded-3xl overflow-hidden"
          style={{ 
            background: BOX_BG, 
            border: `1px solid ${BORDER}`,
            backdropFilter: "blur(10px)",
            boxShadow: "0 24px 60px rgba(0,0,0,0.35)"
          }}
        >
          {/* Left: Image */}
          <div className="w-full md:w-1/2 relative min-h-[300px]">
            <img
              src="/assets/hi1.jpg"
              alt="Welcome"
              className="w-full h-full object-cover absolute inset-0"
              style={{ opacity: 0.8 }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex items-center p-10">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Welcome back to GreenLeaf.
                </h2>
                <p className="text-white/80 font-medium tracking-wide">
                  Sign in to access your dashboard.
                </p>
              </div>
            </div>
          </div>
          
          {/* Right: Form */}
          <div className="w-full md:w-1/2 p-8 sm:p-12 flex flex-col justify-center">
            <h2
              className="text-2xl font-bold mb-2 tracking-tight"
              style={{ color: TEXT_PRIMARY, fontFamily: "'DM Sans', sans-serif" }}
            >
              Sign In
            </h2>
            <p className="mb-8 text-sm" style={{ color: TEXT_SECONDARY }}>
              Please enter your details to continue.
            </p>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label className="text-sm font-semibold mb-2 block" style={{ color: TEXT_PRIMARY }}>
                  Email
                </label>
                <div className="relative">
                  <User
                    className="absolute top-3.5 left-3.5"
                    size={18}
                    style={{ color: ACCENT }}
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-3 py-3 rounded-xl focus:outline-none transition"
                    placeholder="Enter your email"
                    required
                    style={{ 
                      background: "rgba(255,255,255,0.05)",
                      border: `1px solid ${BORDER}`,
                      color: TEXT_PRIMARY
                    }}
                    onFocus={e => e.target.style.borderColor = ACCENT}
                    onBlur={e => e.target.style.borderColor = BORDER}
                  />
                </div>
              </div>
              {/* Password */}
              <div>
                <label className="text-sm font-semibold mb-2 block" style={{ color: TEXT_PRIMARY }}>
                  Password
                </label>
                <div className="relative">
                  <Lock
                    className="absolute top-3.5 left-3.5"
                    size={18}
                    style={{ color: ACCENT }}
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-11 py-3 rounded-xl focus:outline-none transition"
                    placeholder="Enter your password"
                    required
                    style={{ 
                      background: "rgba(255,255,255,0.05)",
                      border: `1px solid ${BORDER}`,
                      color: TEXT_PRIMARY
                    }}
                    onFocus={e => e.target.style.borderColor = ACCENT}
                    onBlur={e => e.target.style.borderColor = BORDER}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 focus:outline-none"
                    style={{ color: ACCENT }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              
              {error && (
                <div className="text-red-400 text-center text-sm font-medium p-2 bg-red-900/20 rounded-lg border border-red-500/30">
                  {error}
                </div>
              )}
              {loading && (
                <div className="flex flex-col items-center my-2">
                  <span className="relative flex h-6 w-6 mb-1">
                    <span className="animate-spin inline-block w-full h-full rounded-full border-2 border-solid border-t-transparent" style={{ borderColor: ACCENT, borderTopColor: "transparent" }}></span>
                  </span>
                </div>
              )}
              {success && !loading && (
                <div
                  className="text-center text-sm font-medium"
                  style={{ color: ACCENT }}
                >
                  {success}
                </div>
              )}
              <button
                type="submit"
                className="w-full py-3.5 rounded-xl font-bold transition flex items-center justify-center mt-2"
                style={{
                  background: ACCENT,
                  color: "#0b1a0e",
                  opacity: loading ? 0.7 : 1,
                  cursor: loading ? "not-allowed" : "pointer",
                }}
                disabled={loading}
              >
                Sign In
              </button>
            </form>
            <div className="text-center mt-4">
              <a
                href="/forgot-password"
                className="text-sm font-medium"
                style={{ color: ACCENT, textDecoration: "none" }}
              >
                Forgot Password?
              </a>
            </div>
            <div className="text-center mt-6">
              <span style={{ color: TEXT_SECONDARY }}>Don't have an account? </span>
              <a href="/signup" className="font-semibold" style={{ color: ACCENT, textDecoration: "none" }}>
                Sign Up
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
