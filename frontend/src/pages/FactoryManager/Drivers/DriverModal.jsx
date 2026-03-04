import { useState, useEffect } from "react";
import {
  X,
  User,
} from "lucide-react";
import { validateDriver } from "./driverUtils";

// Design tokens
const ACCENT_COLOR = "#165E52";
const BTN_COLOR = "#01251F";
const BORDER_COLOR = "#cfece6";
const HEADER_BG = "#e1f4ef";

export default function DriverModal({ isOpen, onClose, onSubmit, driver = null }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    nic: "",
    phone: "",
    address: "",
    licenseNo: "",
    licenseExpiry: "",
    vehicleNo: "",
    experience: 0,
    emergencyContact: { name: "", phone: "", relationship: "" },
    status: "Available",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (driver) {
      setFormData({
        name: driver.name || "",
        email: driver.email || "",
        nic: driver.nic || "",
        phone: driver.phone || "",
        address: driver.address || "",
        licenseNo: driver.licenseNo || "",
        licenseExpiry: driver.licenseExpiry ? driver.licenseExpiry.split('T')[0] : "",
        vehicleNo: driver.vehicleNo || "",
        experience: driver.experience || 0,
        emergencyContact: driver.emergencyContact || { name: "", phone: "", relationship: "" },
        status: driver.status || "Available",
      });
    } else {
      setFormData({
        name: "",
        email: "",
        nic: "",
        phone: "",
        address: "",
        licenseNo: "",
        licenseExpiry: "",
        vehicleNo: "",
        experience: 0,
        emergencyContact: { name: "", phone: "", relationship: "" },
        status: "Available",
      });
    }

    setErrors({});
    document.body.style.overflow = isOpen ? "hidden" : "unset";
    return () => (document.body.style.overflow = "unset");
  }, [driver, isOpen]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const validation = validateDriver(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      setIsSubmitting(false);
      return;
    }

    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error("Driver form submit error:", error);
      setErrors({ submit: "Failed to save driver. Try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[1000] backdrop-blur-sm bg-black/30">
      <div
        className="w-full max-w-3xl rounded-2xl shadow-2xl bg-white border overflow-hidden"
        style={{ borderColor: BORDER_COLOR }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{ backgroundColor: HEADER_BG, borderColor: BORDER_COLOR }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#e1f4ef]">
              <User className="w-5 h-5" style={{ color: ACCENT_COLOR }} />
            </div>
            <div>
              <h2 className="text-lg font-semibold" style={{ color: ACCENT_COLOR }}>
                {driver ? "Edit Driver" : "Add New Driver"}
              </h2>
              <p className="text-sm text-gray-600">
                {driver ? "Update driver information" : "Enter driver details"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-black transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:outline-none"
                style={{ borderColor: BORDER_COLOR }}
              />
              {errors.name && (
                <p className="text-xs text-red-600 mt-1">{errors.name}</p>
              )}
            </div>

            {/* NIC */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                NIC Number *
              </label>
              <input
                type="text"
                value={formData.nic}
                onChange={(e) => handleInputChange("nic", e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:outline-none"
                style={{ borderColor: BORDER_COLOR }}
              />
              {errors.nic && (
                <p className="text-xs text-red-600 mt-1">{errors.nic}</p>
              )}
            </div>

            {/* Additional Fields */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Number *
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:outline-none"
                style={{ borderColor: BORDER_COLOR }}
                placeholder="+94778886655 or 0778886655"
              />
              {errors.phone && (
                <p className="text-xs text-red-600 mt-1">{errors.phone}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:outline-none"
                style={{ borderColor: BORDER_COLOR }}
                placeholder="driver@example.com"
              />
              {errors.email && (
                <p className="text-xs text-red-600 mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address *
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:outline-none"
                style={{ borderColor: BORDER_COLOR }}
                placeholder="Full address"
              />
              {errors.address && (
                <p className="text-xs text-red-600 mt-1">{errors.address}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                License Number *
              </label>
              <input
                type="text"
                value={formData.licenseNo}
                onChange={(e) => handleInputChange("licenseNo", e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:outline-none"
                style={{ borderColor: BORDER_COLOR }}
                placeholder="License number"
              />
              {errors.licenseNo && (
                <p className="text-xs text-red-600 mt-1">{errors.licenseNo}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                License Expiry Date
              </label>
              <input
                type="date"
                value={formData.licenseExpiry}
                onChange={(e) => handleInputChange("licenseExpiry", e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:outline-none"
                style={{ borderColor: BORDER_COLOR }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vehicle Number
              </label>
              <input
                type="text"
                value={formData.vehicleNo}
                onChange={(e) => handleInputChange("vehicleNo", e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:outline-none"
                style={{ borderColor: BORDER_COLOR }}
                placeholder="e.g., CAB-1234"
              />
            </div>
          </div>

          {/* Footer */}
          <div
            className="flex justify-end gap-3 p-6 border-t"
            style={{ backgroundColor: HEADER_BG, borderColor: BORDER_COLOR }}
          >
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-lg text-sm font-medium transition"
              style={{
                backgroundColor: "transparent",
                color: ACCENT_COLOR,
                border: `2px solid ${BORDER_COLOR}`,
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 rounded-lg text-sm font-medium text-white transition"
              style={{
                backgroundColor: BTN_COLOR,
                opacity: isSubmitting ? 0.6 : 1,
              }}
            >
              {isSubmitting ? "Saving..." : driver ? "Update Driver" : "Add Driver"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
