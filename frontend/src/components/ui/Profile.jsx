import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { updateProfile, changePassword } from "../../api/auth";
import { User, Mail, Building, Shield, Lock, Eye, EyeOff, Phone, MapPin, IdCard } from "lucide-react";

const ACCENT_COLOR = "#165E52";
const BUTTON_COLOR = "#01251F";
const BORDER_COLOR = "#cfece6";
const BLACK = "#000000ff";

function ProfileHeader() {
  return (
    <div
      className="bg-white shadow-md border-b"
      style={{ borderColor: BORDER_COLOR }}
    >
      <div className="max-w-7xl mx-auto px-6 py-6">
        <h1 className="text-3xl font-bold mb-1" style={{ color: ACCENT_COLOR }}>
          User Profile
        </h1>
        <p className="text-base" style={{ color: BLACK }}>
          Manage your account information and security settings
        </p>
      </div>
    </div>
  );
}

export default function Profile() {
  const [showNoAccess, setShowNoAccess] = useState({
    factoryName: false,
    role: false,
  });
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    factoryName: "",
    role: "",
    address: "",
    nic: "",
    phone: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState({ type: "", text: "" });
  const [isLoading, setIsLoading] = useState(false);

  // Use user data from AuthContext
  const { user, setUser } = useAuth();
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        factoryName: user.factoryName || "Tea Factory", // Default if not in backend
        role: user.role || "",
        address: user.address || "",
        nic: user.nic || "",
        phone: user.phone || "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
    }
  }, [user]);

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [isEditing, setIsEditing] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      setMessage({ type: "", text: "" });

      // Validate password change if attempting to change password
      if (formData.newPassword || formData.confirmPassword || formData.currentPassword) {
        if (!formData.currentPassword) {
          setMessage({ type: "error", text: "Please enter your current password" });
          setIsLoading(false);
          return;
        }
        if (formData.newPassword !== formData.confirmPassword) {
          setMessage({ type: "error", text: "New passwords do not match" });
          setIsLoading(false);
          return;
        }
        if (formData.newPassword.length < 6) {
          setMessage({ type: "error", text: "New password must be at least 6 characters" });
          setIsLoading(false);
          return;
        }

        // Change password
        const passwordResult = await changePassword(
          formData.currentPassword,
          formData.newPassword
        );

        if (!passwordResult.success) {
          setMessage({ type: "error", text: passwordResult.message || "Failed to change password" });
          setIsLoading(false);
          return;
        }
      }

      // Update profile information (excluding password fields)
      const profileData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        address: formData.address,
        nic: formData.nic,
      };

      const result = await updateProfile(profileData);

      if (result.success) {
        // Update local user state
        setUser({ ...user, ...result.data.user });
        setMessage({ type: "success", text: "Profile updated successfully!" });
        setIsEditing(false);
        // Clear password fields
        setFormData(prev => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        }));
      } else {
        setMessage({ type: "error", text: result.message || "Failed to update profile" });
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage({ type: "error", text: error.response?.data?.message || "An error occurred while updating profile" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setMessage({ type: "", text: "" });
    // Reset form to original user data
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        factoryName: user.factoryName || "Tea Factory",
        role: user.role || "",
        address: user.address || "",
        nic: user.nic || "",
        phone: user.phone || "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ProfileHeader />
      <div className="w-full px-6 mt-8">
        {/* Message Display */}
        {message.text && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === "success"
                ? "bg-green-100 text-green-800 border border-green-300"
                : "bg-red-100 text-red-800 border border-red-300"
            }`}
          >
            {message.text}
          </div>
        )}
        
        {/* Single heading for both columns */}
        <h2
          className="text-2xl font-semibold pb-2 border-b-2 mb-8"
          style={{ color: ACCENT_COLOR, borderColor: BORDER_COLOR }}
        >
          {isEditing ? "Edit Personal Information" : "Personal Information"}
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          {/* Personal Information Section (Left) */}
          <div className="space-y-6">
            {/* First Name */}
            <div className="space-y-2">
              <label
                className="flex items-center font-medium"
                style={{ color: ACCENT_COLOR }}
              >
                <User className="w-4 h-4 mr-2" color={ACCENT_COLOR} />
                First Name
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-4 py-3 rounded-lg transition-colors bg-[#e1f4ef] focus:outline-none focus:ring-2 focus:ring-[#165E52] focus:border-[#165E52] disabled:opacity-75"
              />
            </div>
            {/* Last Name */}
            <div className="space-y-2">
              <label
                className="flex items-center font-medium"
                style={{ color: ACCENT_COLOR }}
              >
                <User className="w-4 h-4 mr-2" color={ACCENT_COLOR} />
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-4 py-3 rounded-lg transition-colors bg-[#e1f4ef] focus:outline-none focus:ring-2 focus:ring-[#165E52] focus:border-[#165E52] disabled:opacity-75"
              />
            </div>
            {/* Email */}
            <div className="space-y-2">
              <label
                className="flex items-center font-medium"
                style={{ color: ACCENT_COLOR }}
              >
                <Mail className="w-4 h-4 mr-2" color={ACCENT_COLOR} />
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                readOnly
                className="w-full px-4 py-3 rounded-lg transition-colors bg-[#e1f4ef] opacity-75 cursor-not-allowed"
                title="Email cannot be changed"
              />
            </div>
            {/* Factory Name */}
            <div className="space-y-2">
              <label
                className="flex items-center font-medium"
                style={{ color: ACCENT_COLOR }}
              >
                <Building className="w-4 h-4 mr-2" color={ACCENT_COLOR} />
                Factory Name
              </label>
              <input
                type="text"
                name="factoryName"
                value={formData.factoryName}
                readOnly
                className="w-full px-4 py-3 rounded-lg transition-colors bg-[#e1f4ef] opacity-75 cursor-not-allowed"
                onFocus={() =>
                  setShowNoAccess((prev) => ({ ...prev, factoryName: true }))
                }
                onBlur={() =>
                  setShowNoAccess((prev) => ({ ...prev, factoryName: false }))
                }
              />
              {showNoAccess.factoryName && (
                <div className="text-xs text-red-600 mt-1">
                  You do not have access to edit.
                </div>
              )}
            </div>
            {/* Role */}
            <div className="space-y-2">
              <label
                className="flex items-center font-medium"
                style={{ color: ACCENT_COLOR }}
              >
                <Shield className="w-4 h-4 mr-2" color={ACCENT_COLOR} />
                Role
              </label>
              <input
                type="text"
                name="role"
                value={formData.role.replace(/_/g, ' ').toUpperCase()}
                readOnly
                className="w-full px-4 py-3 rounded-lg transition-colors bg-[#e1f4ef] opacity-75 cursor-not-allowed"
                style={{
                  color: ACCENT_COLOR,
                  fontWeight: 600,
                }}
                onFocus={() =>
                  setShowNoAccess((prev) => ({ ...prev, role: true }))
                }
                onBlur={() =>
                  setShowNoAccess((prev) => ({ ...prev, role: false }))
                }
              />
              {showNoAccess.role && (
                <div className="text-xs text-red-600 mt-1">
                  You do not have access to edit.
                </div>
              )}
            </div>
          </div>
          <div className="space-y-6">
            {/* Address */}
            <div className="space-y-2">
              <label
                className="flex items-center font-medium"
                style={{ color: ACCENT_COLOR }}
              >
                <MapPin className="w-4 h-4 mr-2" color={ACCENT_COLOR} />
                Address
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-4 py-3 rounded-lg transition-colors bg-[#e1f4ef] focus:outline-none focus:ring-2 focus:ring-[#165E52] focus:border-[#165E52] disabled:opacity-75"
              />
            </div>
            {/* NIC */}
            <div className="space-y-2">
              <label
                className="flex items-center font-medium"
                style={{ color: ACCENT_COLOR }}
              >
                <IdCard className="w-4 h-4 mr-2" color={ACCENT_COLOR} />
                NIC
              </label>
              <input
                type="text"
                name="nic"
                value={formData.nic}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-4 py-3 rounded-lg transition-colors bg-[#e1f4ef] focus:outline-none focus:ring-2 focus:ring-[#165E52] focus:border-[#165E52] disabled:opacity-75"
                placeholder="Optional"
              />
            </div>
            {/* Contact Number */}
            <div className="space-y-2">
              <label
                className="flex items-center font-medium"
                style={{ color: ACCENT_COLOR }}
              >
                <Phone className="w-4 h-4 mr-2" color={ACCENT_COLOR} />
                Contact Number
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-4 py-3 rounded-lg transition-colors bg-[#e1f4ef] focus:outline-none focus:ring-2 focus:ring-[#165E52] focus:border-[#165E52] disabled:opacity-75"
              />
            </div>
          </div>
        </div>
        {/* Password Section - only show when editing, below both columns */}
        {isEditing && (
          <div className="space-y-6 mt-8">
            <h2
              className="text-2xl font-semibold pb-2 border-b-2"
              style={{ color: ACCENT_COLOR, borderColor: BORDER_COLOR }}
            >
              Change Password
            </h2>
            {/* Current Password */}
            <div className="space-y-2">
              <label
                className="flex items-center font-medium"
                style={{ color: ACCENT_COLOR }}
              >
                <Lock className="w-4 h-4 mr-2" color={ACCENT_COLOR} />
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.current ? "text" : "password"}
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 pr-12 rounded-lg transition-colors bg-[#e1f4ef] focus:outline-none focus:ring-2 focus:ring-[#165E52] focus:border-[#165E52]"
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("current")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  style={{ color: ACCENT_COLOR }}
                  disabled={!isEditing}
                >
                  {showPasswords.current ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
            {/* New Password */}
            <div className="space-y-2">
              <label
                className="flex items-center font-medium"
                style={{ color: ACCENT_COLOR }}
              >
                <Lock className="w-4 h-4 mr-2" color={ACCENT_COLOR} />
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.new ? "text" : "password"}
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 pr-12 rounded-lg transition-colors bg-[#e1f4ef] focus:outline-none focus:ring-2 focus:ring-[#165E52] focus:border-[#165E52]"
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("new")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  style={{ color: ACCENT_COLOR }}
                  disabled={!isEditing}
                >
                  {showPasswords.new ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
            {/* Confirm Password */}
            <div className="space-y-2">
              <label
                className="flex items-center font-medium"
                style={{ color: ACCENT_COLOR }}
              >
                <Lock className="w-4 h-4 mr-2" color={ACCENT_COLOR} />
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-3 pr-12 rounded-lg transition-colors bg-[#e1f4ef] focus:outline-none focus:ring-2 focus:ring-[#165E52] focus:border-[#165E52]"
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("confirm")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  style={{ color: ACCENT_COLOR }}
                  disabled={!isEditing}
                >
                  {showPasswords.confirm ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Action Buttons */}
        <div
          className="flex justify-end space-x-4 mt-8 pt-6"
          style={{ borderTop: `1px solid ${BORDER_COLOR}` }}
        >
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              style={{
                background: BUTTON_COLOR,
                color: "#fff",
                fontWeight: 500,
              }}
              className="px-6 py-3 rounded-lg transition-colors hover:opacity-90"
            >
              Edit Profile
            </button>
          ) : (
            <>
              <button
                onClick={handleCancel}
                disabled={isLoading}
                style={{
                  background: "#ccc",
                  color: "#333",
                  fontWeight: 500,
                }}
                className="px-6 py-3 rounded-lg transition-colors hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isLoading}
                style={{
                  background: BUTTON_COLOR,
                  color: "#fff",
                  fontWeight: 500,
                }}
                className="px-6 py-3 rounded-lg transition-colors hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
