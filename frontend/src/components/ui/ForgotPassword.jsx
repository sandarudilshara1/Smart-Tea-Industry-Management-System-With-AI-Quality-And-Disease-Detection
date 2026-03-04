import React, { useState } from "react";
import { Mail } from "lucide-react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../firebase"; // Adjust if using different path
import { Link } from "react-router-dom";

// Brand Colors
const BUTTON_COLOR = "#172526";
const ACCENT_COLOR = "#165e52";
const BG_COLOR = "#f5faf8";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!email) {
      setError("Please enter your email address");
      return;
    }

    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Password reset link sent to your email.");
      setEmail("");
    } catch (err) {
      console.error(err);
      if (err.code === "auth/user-not-found") {
        setError("No account found with this email.");
      } else if (err.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else if (err.code === "auth/too-many-requests") {
        setError("Too many attempts. Try again later.");
      } else {
        setError("Failed to send reset email. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center"
      style={{ background: BG_COLOR }}
    >
      {/* Container */}
      <div className="flex flex-row w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden bg-white">
        {/* Left: Image */}
        <div className="w-1/2 flex items-center justify-center bg-[#f5faf8]">
          <img
            src="/assets/hi2.jpg"
            alt="Reset Password Illustration"
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
              Forgot Password
            </h2>
            <p className="mb-6 text-gray-500 text-center">
              Enter your email to reset your password
            </p>

            <form onSubmit={handleReset} className="space-y-5">
              {/* Email Field */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1 block">
                  Email
                </label>
                <div className="relative">
                  <Mail
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
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Messages */}
              {message && (
                <div
                  className="text-center text-sm font-medium"
                  style={{ color: ACCENT_COLOR }}
                >
                  {message}
                </div>
              )}
              {error && (
                <div className="text-red-600 text-center text-sm font-medium">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full text-white py-3 rounded-xl font-bold shadow-lg transition focus:outline-none focus:ring-0"
                style={{
                  background: BUTTON_COLOR,
                  boxShadow: "0 4px 24px 0 rgba(22,94,82, 0.08)",
                }}
                disabled={isLoading}
              >
                {isLoading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>

            {/* Back to Login */}
            <div className="text-center mt-6">
              <Link
                to="/login"
                className="text-sm font-medium hover:underline"
                style={{ color: ACCENT_COLOR }}
              >
                ← Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
