import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { flushSync } from "react-dom";
import { login as loginAPI } from "../../api/auth";

export default function Login() {
  const { setUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Call backend API
      const response = await loginAPI(email, password);
      
      if (response.success) {
        const { user, token } = response.data;
        
        // Store token FIRST so axios interceptor has it for subsequent calls
        localStorage.setItem("authToken", token);

        // Role → route mapping
        const roleMap = {
          owner: "/owner",
          factory_manager: "/factory-manager",
          fertilizer_manager: "/fertilizer-manager",
          inventory_manager: "/inventory-manager",
          payment_manager: "/payment-manager",
          transport_manager: "/transport-manager",
          supplier: "/supplier",
          driver: "/driver"
        };
        const redirectPath = (roleMap[user.role] || "/") + "/dashboard";

        // flushSync ensures React commits the user state update synchronously
        // BEFORE navigate() triggers the dashboard to mount — prevents null user on first load
        flushSync(() => {
          setUser({
            id: user.id,
            email: user.email,
            role: user.role,
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone,
            address: user.address,
            isActive: user.isActive,
            factoryName: user.factoryName || ''
          });
        });

        // Navigate only AFTER user state is committed
        navigate(redirectPath);
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err.response?.data?.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">Welcome Back</h2>
          <p className="text-gray-600 mt-2">Login to Tea Factory Management System</p>
        </div>

        <form onSubmit={handleLogin}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-3 rounded-lg transition duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="text-center mt-6">
          <span className="text-gray-600">Don't have an account? </span>
          <a 
            href="/signup" 
            className="text-green-700 font-semibold hover:underline"
          >
            Sign Up
          </a>
        </div>

        <div className="mt-4 text-center text-sm text-gray-500">
          <p>Test Account: testuser@teafactory.com / test123456</p>
        </div>
      </div>
    </div>
  );
}
