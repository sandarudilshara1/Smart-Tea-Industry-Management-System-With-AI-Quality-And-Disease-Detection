import React, { useState } from "react";
import { Eye, EyeOff, User, Mail, Phone, Lock, IdCard, Briefcase, ChevronRight, ChevronLeft, MapPin, Crown, Factory, Sprout, Scale, CreditCard, Truck, Leaf, Car } from "lucide-react";
import { register } from "../api/auth";
import { useNavigate } from "react-router-dom";
import PublicNavbar from "./PublicNavbar";

// COLORS FROM LANDING PAGE
const BG_COLOR = "#0b1a0e"; 
const BOX_BG = "rgba(255,255,255,0.035)";
const BORDER = "rgba(180,210,79,0.2)";
const TEXT_PRIMARY = "#f2f7e8";
const TEXT_SECONDARY = "rgba(214,233,176,0.55)";
const ACCENT = "#b4d24f";

const ROLES = [
  { id: "owner", label: "Owner", icon: <Crown size={32} /> },
  { id: "factory_manager", label: "Factory Manager", icon: <Factory size={32} /> },
  { id: "inventory_manager", label: "Inventory Manager", icon: <Scale size={32} /> },
  { id: "transport_manager", label: "Transport Manager", icon: <Truck size={32} /> },
  { id: "supplier", label: "Supplier", icon: <Leaf size={32} /> },
  { id: "driver", label: "Driver", icon: <Car size={32} /> },
];

export default function SignupForm() {
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    nic: "",
    contactNo: "",
    address: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "", // Selected in Step 1
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
  };

  const handleRoleSelect = (roleId) => {
    setFormData({ ...formData, role: roleId });
    setError("");
    setStep(2);
  };

  const handleNext = () => {
    setError("");
    if (step === 2) {
      if (!formData.firstName || !formData.lastName || !formData.contactNo || !formData.address) {
        setError("Please fill all required fields.");
        return;
      }
      const contactPattern = /^\d{10}$/;
      if (!contactPattern.test(formData.contactNo)) {
        setError("Contact number must be exactly 10 digits.");
        return;
      }
    }
    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setError("");
    setStep((prev) => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { firstName, lastName, nic, contactNo, address, email, password, confirmPassword, role } = formData;

    // Email validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      setError("Invalid email format.");
      return;
    }

    // Password length
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    // Passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // NIC validation
    if (nic) {
      const nicPattern = /^(\d{9}[vV]|\d{12})$/;
      if (!nicPattern.test(nic)) {
        setError("NIC must be 12 digits or 9 digits followed by 'V' or 'v'.");
        return;
      }
    }

    setLoading(true);

    try {
      const response = await register({
        email,
        password,
        role,
        firstName,
        lastName,
        phone: contactNo,
        address: `${address}${nic ? ' (NIC: ' + nic + ')' : ''}`,
      });

      if (response.success) {
        setSuccess("Account created! Redirecting...");
        setTimeout(() => navigate("/login"), 1500);
      } else {
        setError(response.message || "Signup failed. Please try again.");
      }
    } catch (error) {
      console.error("Registration error:", error);
      setError(error.response?.data?.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full flex flex-col font-sans"
      style={{ background: BG_COLOR }}
    >
      <PublicNavbar />
      
      <div className="flex-grow flex items-center justify-center p-4 pt-24 pb-12">
        <div 
          className="w-full max-w-2xl rounded-3xl p-8 sm:p-12"
          style={{ 
            background: BOX_BG, 
            border: `1px solid ${BORDER}`,
            backdropFilter: "blur(10px)",
            boxShadow: "0 24px 60px rgba(0,0,0,0.35)"
          }}
        >
          <div className="text-center mb-8">
            <h2 
              className="text-3xl font-bold mb-2 tracking-tight"
              style={{ color: TEXT_PRIMARY, fontFamily: "'Playfair Display', serif" }}
            >
              Create Account
            </h2>
            <p className="font-medium" style={{ color: TEXT_SECONDARY }}>
              {step === 1 && "Choose your role to get started"}
              {step === 2 && "Tell us a bit about yourself"}
              {step === 3 && "Set up your login details"}
            </p>
            
            {/* Progress Bar */}
            <div className="flex justify-center mt-6 space-x-2">
              <div className="h-1.5 w-1/3 rounded-full transition-colors duration-300" style={{ background: step >= 1 ? ACCENT : "rgba(255,255,255,0.1)" }}></div>
              <div className="h-1.5 w-1/3 rounded-full transition-colors duration-300" style={{ background: step >= 2 ? ACCENT : "rgba(255,255,255,0.1)" }}></div>
              <div className="h-1.5 w-1/3 rounded-full transition-colors duration-300" style={{ background: step >= 3 ? ACCENT : "rgba(255,255,255,0.1)" }}></div>
            </div>
          </div>
          
          {error && (
            <div className="mb-6 text-red-400 p-3 rounded-lg text-center text-sm font-medium bg-red-900/20 border border-red-500/30">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-6 p-3 rounded-lg text-center text-sm font-medium bg-green-900/20 border border-green-500/30" style={{ color: ACCENT }}>
              {success}
            </div>
          )}

          <form onSubmit={step === 3 ? handleSubmit : (e) => e.preventDefault()} className="space-y-5">
            {step === 1 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {ROLES.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => handleRoleSelect(r.id)}
                      className="flex flex-col items-center justify-center p-4 rounded-xl transition cursor-pointer"
                      style={{
                        background: formData.role === r.id ? `${ACCENT}20` : "rgba(255,255,255,0.03)",
                        border: `1px solid ${formData.role === r.id ? ACCENT : "rgba(255,255,255,0.1)"}`,
                      }}
                      onMouseOver={e => {
                        if (formData.role !== r.id) e.currentTarget.style.borderColor = BORDER;
                      }}
                      onMouseOut={e => {
                        if (formData.role !== r.id) e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                      }}
                    >
                      <div className="mb-3" style={{ color: formData.role === r.id ? ACCENT : TEXT_PRIMARY }}>{r.icon}</div>
                      <span className="text-sm font-semibold text-center" style={{ color: TEXT_PRIMARY }}>{r.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* First Name */}
                  <div>
                    <label className="text-sm font-semibold mb-2 block" style={{ color: TEXT_PRIMARY }}>First Name</label>
                    <div className="relative">
                      <User className="absolute top-3.5 left-3.5" size={18} style={{ color: ACCENT }} />
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        className="w-full pl-11 pr-3 py-3 rounded-xl focus:outline-none transition"
                        placeholder="First name"
                        required
                        style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${BORDER}`, color: TEXT_PRIMARY }}
                        onFocus={e => e.target.style.borderColor = ACCENT}
                        onBlur={e => e.target.style.borderColor = BORDER}
                      />
                    </div>
                  </div>
                  {/* Last Name */}
                  <div>
                    <label className="text-sm font-semibold mb-2 block" style={{ color: TEXT_PRIMARY }}>Last Name</label>
                    <div className="relative">
                      <User className="absolute top-3.5 left-3.5" size={18} style={{ color: ACCENT }} />
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        className="w-full pl-11 pr-3 py-3 rounded-xl focus:outline-none transition"
                        placeholder="Last name"
                        required
                        style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${BORDER}`, color: TEXT_PRIMARY }}
                        onFocus={e => e.target.style.borderColor = ACCENT}
                        onBlur={e => e.target.style.borderColor = BORDER}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Contact No */}
                  <div>
                    <label className="text-sm font-semibold mb-2 block" style={{ color: TEXT_PRIMARY }}>Contact Number</label>
                    <div className="relative">
                      <Phone className="absolute top-3.5 left-3.5" size={18} style={{ color: ACCENT }} />
                      <input
                        type="text"
                        name="contactNo"
                        value={formData.contactNo}
                        onChange={handleChange}
                        className="w-full pl-11 pr-3 py-3 rounded-xl focus:outline-none transition"
                        placeholder="10 digit number"
                        required
                        style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${BORDER}`, color: TEXT_PRIMARY }}
                        onFocus={e => e.target.style.borderColor = ACCENT}
                        onBlur={e => e.target.style.borderColor = BORDER}
                      />
                    </div>
                  </div>
                  {/* NIC (Optional) */}
                  <div>
                    <label className="text-sm font-semibold mb-2 block" style={{ color: TEXT_PRIMARY }}>NIC (Optional)</label>
                    <div className="relative">
                      <IdCard className="absolute top-3.5 left-3.5" size={18} style={{ color: ACCENT }} />
                      <input
                        type="text"
                        name="nic"
                        value={formData.nic}
                        onChange={handleChange}
                        className="w-full pl-11 pr-3 py-3 rounded-xl focus:outline-none transition"
                        placeholder="National ID"
                        style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${BORDER}`, color: TEXT_PRIMARY }}
                        onFocus={e => e.target.style.borderColor = ACCENT}
                        onBlur={e => e.target.style.borderColor = BORDER}
                      />
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="text-sm font-semibold mb-2 block" style={{ color: TEXT_PRIMARY }}>Address</label>
                  <div className="relative">
                    <MapPin className="absolute top-3.5 left-3.5" size={18} style={{ color: ACCENT }} />
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className="w-full pl-11 pr-3 py-3 rounded-xl focus:outline-none transition"
                      placeholder="Enter your address"
                      required
                      style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${BORDER}`, color: TEXT_PRIMARY }}
                      onFocus={e => e.target.style.borderColor = ACCENT}
                      onBlur={e => e.target.style.borderColor = BORDER}
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                {/* Email */}
                <div>
                  <label className="text-sm font-semibold mb-2 block" style={{ color: TEXT_PRIMARY }}>Email Address</label>
                  <div className="relative">
                    <Mail className="absolute top-3.5 left-3.5" size={18} style={{ color: ACCENT }} />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full pl-11 pr-3 py-3 rounded-xl focus:outline-none transition"
                      placeholder="Enter your email"
                      required
                      style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${BORDER}`, color: TEXT_PRIMARY }}
                      onFocus={e => e.target.style.borderColor = ACCENT}
                      onBlur={e => e.target.style.borderColor = BORDER}
                    />
                  </div>
                </div>
                {/* Password */}
                <div>
                  <label className="text-sm font-semibold mb-2 block" style={{ color: TEXT_PRIMARY }}>Password</label>
                  <div className="relative">
                    <Lock className="absolute top-3.5 left-3.5" size={18} style={{ color: ACCENT }} />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full pl-11 pr-11 py-3 rounded-xl focus:outline-none transition"
                      placeholder="Create a password"
                      required
                      style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${BORDER}`, color: TEXT_PRIMARY }}
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
                {/* Confirm Password */}
                <div>
                  <label className="text-sm font-semibold mb-2 block" style={{ color: TEXT_PRIMARY }}>Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute top-3.5 left-3.5" size={18} style={{ color: ACCENT }} />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full pl-11 pr-11 py-3 rounded-xl focus:outline-none transition"
                      placeholder="Re-enter your password"
                      required
                      style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${BORDER}`, color: TEXT_PRIMARY }}
                      onFocus={e => e.target.style.borderColor = ACCENT}
                      onBlur={e => e.target.style.borderColor = BORDER}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 focus:outline-none"
                      style={{ color: ACCENT }}
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {step > 1 && (
              <div className="flex gap-4 pt-4 mt-6">
                <button
                  type="button"
                  onClick={handleBack}
                  className="w-1/3 flex items-center justify-center py-3.5 rounded-xl font-bold transition"
                  style={{ 
                    background: "rgba(255,255,255,0.05)", 
                    color: TEXT_PRIMARY,
                    border: `1px solid rgba(255,255,255,0.1)`
                  }}
                  onMouseOver={e => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}
                  onMouseOut={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
                >
                  <ChevronLeft className="w-5 h-5 mr-1" /> Back
                </button>
                
                {step < 3 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="w-2/3 flex items-center justify-center py-3.5 rounded-xl font-bold transition"
                    style={{ background: ACCENT, color: "#0b1a0e" }}
                  >
                    Next <ChevronRight className="w-5 h-5 ml-1" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-2/3 flex items-center justify-center py-3.5 rounded-xl font-bold transition"
                    style={{ 
                      background: ACCENT, 
                      color: "#0b1a0e",
                      opacity: loading ? 0.7 : 1,
                      cursor: loading ? "not-allowed" : "pointer"
                    }}
                  >
                    {loading ? "Creating..." : "Complete Sign Up"}
                  </button>
                )}
              </div>
            )}
          </form>

          <div className="text-center mt-8">
            <span style={{ color: TEXT_SECONDARY }}>Already have an account? </span>
            <a
              href="/login"
              className="font-semibold"
              style={{ color: ACCENT, textDecoration: "none" }}
            >
              Log in
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
