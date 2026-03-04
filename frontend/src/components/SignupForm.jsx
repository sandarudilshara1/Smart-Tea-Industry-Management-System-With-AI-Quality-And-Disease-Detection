import React, { useState } from "react";
import { Eye, EyeOff, User, Mail, Phone, Lock, IdCard, Briefcase } from "lucide-react";
import { register } from "../api/auth";
import { useNavigate } from "react-router-dom";

export default function SignupForm() {
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
    role: "supplier",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { firstName, lastName, nic, contactNo, address, email, password, confirmPassword, role } = formData;

    // Check for empty fields
    if (!firstName || !lastName || !contactNo || !address || !email || !password || !confirmPassword) {
      setError("All fields are required.");
      return;
    }

    // Passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match ❌");
      return;
    }

    // Password length
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    // NIC validation (optional - can be removed if not needed)
    if (nic) {
      const nicPattern = /^(\d{9}[vV]|\d{12})$/;
      if (!nicPattern.test(nic)) {
        setError("NIC must be 12 digits or 9 digits followed by 'V' or 'v'.");
        return;
      }
    }

    // Contact number validation (10 digits)
    const contactPattern = /^\d{10}$/;
    if (!contactPattern.test(contactNo)) {
      setError("Contact number must be exactly 10 digits.");
      return;
    }

    // Email validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      setError("Invalid email format.");
      return;
    }

    setLoading(true);

    try {
      // Call backend registration API
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
        setSuccess("✅ Signup Success! Redirecting to login...");
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


  // const handleChange = (e) => {
  //   setFormData({ ...formData, [e.target.name]: e.target.value });
  //   setError("");
  //   setSuccess("");
  // };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   const { name, nic, contactNo, address, email, password, confirmPassword } =
  //     formData;

  //   if (
  //     !name ||
  //     !nic ||
  //     !contactNo ||
  //     !address ||
  //     !email ||
  //     !password ||
  //     !confirmPassword
  //   ) {
  //     setError("All fields are required.");
  //     return;
  //   }
  //   if (password !== confirmPassword) {
  //     setError("Passwords do not match ❌");
  //     return;
  //   }
  //   if (password.length < 6) {
  //     setError("Password must be at least 6 characters.");
  //     return;
  //   }
  //   try {
  //     // 1. Firebase Signup
  //     const userCredential = await createUserWithEmailAndPassword(
  //       auth,
  //       email,
  //       password
  //     );
  //     const token = await userCredential.user.getIdToken();

  //     // 2. Send token + additional data to backend
  //     await axios.post("http://localhost:8080/api/auth/signup", {
  //       token, // <-- token sent
  //       name, // <-- extra data sent
  //       nic,
  //       contactNo,
  //       address,
  //     });

  //     setSuccess("Signup Success! You can now login.");
  //     setTimeout(() => navigate("/login"), 1500);
  //   } catch (error) {
  //     console.error(error);
  //     setError("Signup failed. Please try again.");
  //   }
  // };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-emerald-100 to-teal-100 flex items-center justify-center p-4 pt-20">
      <div className="w-full max-w-md bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-10 border border-emerald-100">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-emerald-700 mb-2 tracking-tight drop-shadow">
            Create Your Account
          </h2>
          <p className="text-md text-gray-500">
            Sign up to get started with Tea Factory
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* First Name */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">
              First Name
            </label>
            <div className="relative">
              <User
                className="absolute top-3 left-3 text-emerald-400"
                size={20}
              />
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full pl-10 pr-3 py-2 border border-emerald-100 rounded-xl focus:ring-2 focus:ring-emerald-300 focus:outline-none transition"
                placeholder="Enter your first name"
                required
              />
            </div>
          </div>
          {/* Last Name */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">
              Last Name
            </label>
            <div className="relative">
              <User
                className="absolute top-3 left-3 text-emerald-400"
                size={20}
              />
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full pl-10 pr-3 py-2 border border-emerald-100 rounded-xl focus:ring-2 focus:ring-emerald-300 focus:outline-none transition"
                placeholder="Enter your last name"
                required
              />
            </div>
          </div>
          {/* Role Selection */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">
              User Role
            </label>
            <div className="relative">
              <Briefcase
                className="absolute top-3 left-3 text-emerald-400"
                size={20}
              />
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full pl-10 pr-3 py-2 border border-emerald-100 rounded-xl focus:ring-2 focus:ring-emerald-300 focus:outline-none transition"
                required
              >
                <option value="supplier">Supplier</option>
                <option value="driver">Driver</option>
                <option value="inventory_manager">Inventory Manager</option>
                <option value="payment_manager">Payment Manager</option>
                <option value="transport_manager">Transport Manager</option>
                <option value="fertilizer_manager">Fertilizer Manager</option>
                <option value="factory_manager">Factory Manager</option>
                <option value="owner">Owner</option>
              </select>
            </div>
          </div>
          {/* NIC (Optional) */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">
              NIC (Optional)
            </label>
            <div className="relative">
              <IdCard
                className="absolute top-3 left-3 text-emerald-400"
                size={20}
              />
              <input
                type="text"
                name="nic"
                value={formData.nic}
                onChange={handleChange}
                className="w-full pl-10 pr-3 py-2 border border-emerald-100 rounded-xl focus:ring-2 focus:ring-emerald-300 focus:outline-none transition"
                placeholder="Enter your NIC (optional)"
              />
            </div>
          </div>
          {/* Contact No */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">
              Contact Number
            </label>
            <div className="relative">
              <Phone
                className="absolute top-3 left-3 text-emerald-400"
                size={20}
              />
              <input
                type="text"
                name="contactNo"
                value={formData.contactNo}
                onChange={handleChange}
                className="w-full pl-10 pr-3 py-2 border border-emerald-100 rounded-xl focus:ring-2 focus:ring-emerald-300 focus:outline-none transition"
                placeholder="Enter your contact number"
                required
              />
            </div>
          </div>
          {/* Address */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">
              Address
            </label>
            <div className="relative">
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full pl-3 pr-3 py-2 border border-emerald-100 rounded-xl focus:ring-2 focus:ring-emerald-300 focus:outline-none transition"
                placeholder="Enter your address"
                required
              />
            </div>
          </div>
          {/* Email */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">
              Email
            </label>
            <div className="relative">
              <Mail
                className="absolute top-3 left-3 text-emerald-400"
                size={20}
              />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-10 pr-3 py-2 border border-emerald-100 rounded-xl focus:ring-2 focus:ring-emerald-300 focus:outline-none transition"
                placeholder="Enter your email"
                required
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
                className="absolute top-3 left-3 text-emerald-400"
                size={20}
              />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-10 pr-10 py-2 border border-emerald-100 rounded-xl focus:ring-2 focus:ring-emerald-300 focus:outline-none transition"
                placeholder="Create a password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-emerald-500 hover:text-emerald-700"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          {/* Confirm Password */}
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">
              Confirm Password
            </label>
            <div className="relative">
              <Lock
                className="absolute top-3 left-3 text-emerald-400"
                size={20}
              />
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full pl-10 pr-10 py-2 border border-emerald-100 rounded-xl focus:ring-2 focus:ring-emerald-300 focus:outline-none transition"
                placeholder="Re-enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-3 text-emerald-500 hover:text-emerald-700"
                tabIndex={-1}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          {error && (
            <div className="text-red-600 text-center text-sm font-medium">
              {error}
            </div>
          )}
          {success && (
            <div className="text-green-600 text-center text-sm font-medium">
              {success}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-xl font-bold shadow-lg hover:from-emerald-600 hover:to-green-500 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>
        <div className="text-center mt-6">
          <span className="text-gray-600">Already have an account? </span>

          <a
            href="/login"
            className="text-black font-semibold hover:underline"
            style={{ color: "green" }}
          >
            Login
          </a>
        </div>
      </div>
    </div>
  );
}
