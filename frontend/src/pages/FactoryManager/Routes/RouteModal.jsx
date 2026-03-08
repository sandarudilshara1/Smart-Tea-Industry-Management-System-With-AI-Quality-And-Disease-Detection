import React, { useEffect, useState } from "react";
import { X, MapPin } from "lucide-react";

// Design Tokens
const ACCENT_COLOR = "#165E52";
const BTN_COLOR = "#01251F";
const BORDER_COLOR = "#cfece6";
const HEADER_BG = "#e1f4ef";
const MODAL_BG = "#ffffff";

const COLLECTION_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function RouteModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  route = null,
  availableDrivers = [],
  availableVehicles = []
}) {
  const [formData, setFormData] = useState({
    routeNumber: "",
    routeName: "",
    area: "",
    description: "",
    driverId: "",
    vehicleId: "",
    collectionDays: [],
    status: "Active"
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (route) {
      setFormData({
        routeNumber: route.routeNumber || "",
        routeName: route.routeName || "",
        area: route.area || "",
        description: route.description || "",
        driverId: route.driverId?._id || route.driverId || "",
        vehicleId: route.vehicleId?._id || route.vehicleId || "",
        collectionDays: route.collectionDays || [],
        status: route.status || "Active"
      });
    } else {
      setFormData({
        routeNumber: "",
        routeName: "",
        area: "",
        description: "",
        driverId: "",
        vehicleId: "",
        collectionDays: [],
        status: "Active"
      });
    }
    setErrors({});
  }, [route, isOpen]);

  // Prevent background scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";
    return () => (document.body.style.overflow = "unset");
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleDayToggle = (day) => {
    setFormData(prev => {
      const days = prev.collectionDays.includes(day)
        ? prev.collectionDays.filter(d => d !== day)
        : [...prev.collectionDays, day];
      return { ...prev, collectionDays: days };
    });
  };

  const handleQuickFill = () => {
    // Temporary: Auto-fill form with test data for quick testing
    const timestamp = Date.now().toString().slice(-4);
    const areas = ['Colombo', 'Kandy', 'Galle', 'Matara', 'Jaffna', 'Nuwara Eliya'];
    const randomArea = areas[Math.floor(Math.random() * areas.length)];
    
    setFormData({
      routeNumber: `RT-${timestamp}`,
      routeName: `Test Route ${timestamp}`,
      area: randomArea,
      description: `Automated test route for ${randomArea} region`,
      driverId: availableDrivers.length > 0 ? availableDrivers[0]._id || availableDrivers[0].id : "",
      vehicleId: availableVehicles.length > 0 ? availableVehicles[0]._id || availableVehicles[0].id : "",
      collectionDays: ['Monday', 'Wednesday', 'Friday'],
      status: "Active"
    });
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.routeNumber.trim()) {
      newErrors.routeNumber = "Route number is required";
    }
    if (!formData.routeName.trim()) {
      newErrors.routeName = "Route name is required";
    }
    if (!formData.area.trim()) {
      newErrors.area = "Area is required";
    }
    if (formData.collectionDays.length === 0) {
      newErrors.collectionDays = "Select at least one collection day";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Route form error:', error);
      setErrors({ submit: error.message || 'Failed to save route' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      {/* Modal Container */}
      <div
        className="rounded-2xl border shadow-2xl flex flex-col w-[600px] max-h-[90vh] overflow-hidden max-w-[95vw]"
        style={{ backgroundColor: MODAL_BG, borderColor: BORDER_COLOR }}
      >
        {/* Header */}
        <div
          className="p-5 flex justify-between items-center border-b"
          style={{ backgroundColor: HEADER_BG, borderColor: BORDER_COLOR }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" 
                 style={{ backgroundColor: '#d1f4e8' }}>
              <MapPin size={20} style={{ color: ACCENT_COLOR }} />
            </div>
            <div>
              <h2 className="text-lg font-semibold" style={{ color: ACCENT_COLOR }}>
                {route ? 'Edit Route' : 'Create New Route'}
              </h2>
              <p className="text-sm text-gray-600">
                {route ? 'Update route information' : 'Enter route details'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Quick Fill Button */}
            {!route && (
              <button
                type="button"
                onClick={handleQuickFill}
                className="px-3 py-1.5 rounded text-xs font-medium transition"
                style={{
                  backgroundColor: "#f59e0b",
                  color: "white",
                }}
                title="Quick fill with test data"
              >
                ⚡ Quick Fill
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-[#dff4ef]"
              style={{ color: ACCENT_COLOR }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Scrollable Form Area */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Route Number */}
          <div>
            <label className="block mb-1 text-sm font-medium" style={{ color: ACCENT_COLOR }}>
              Route Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="routeNumber"
              value={formData.routeNumber}
              onChange={handleChange}
              placeholder="e.g., RT-001"
              className="w-full border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:outline-none"
              style={{ borderColor: errors.routeNumber ? '#ef4444' : BORDER_COLOR }}
            />
            {errors.routeNumber && (
              <p className="text-xs text-red-500 mt-1">{errors.routeNumber}</p>
            )}
          </div>

          {/* Route Name */}
          <div>
            <label className="block mb-1 text-sm font-medium" style={{ color: ACCENT_COLOR }}>
              Route Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="routeName"
              value={formData.routeName}
              onChange={handleChange}
              placeholder="e.g., Colombo - Kandy Highway"
              className="w-full border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:outline-none"
              style={{ borderColor: errors.routeName ? '#ef4444' : BORDER_COLOR }}
            />
            {errors.routeName && (
              <p className="text-xs text-red-500 mt-1">{errors.routeName}</p>
            )}
          </div>

          {/* Area */}
          <div>
            <label className="block mb-1 text-sm font-medium" style={{ color: ACCENT_COLOR }}>
              Area/Region <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="area"
              value={formData.area}
              onChange={handleChange}
              placeholder="e.g., Central Province"
              className="w-full border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:outline-none"
              style={{ borderColor: errors.area ? '#ef4444' : BORDER_COLOR }}
            />
            {errors.area && (
              <p className="text-xs text-red-500 mt-1">{errors.area}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block mb-1 text-sm font-medium" style={{ color: ACCENT_COLOR }}>
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Optional route description..."
              rows={3}
              className="w-full border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:outline-none"
              style={{ borderColor: BORDER_COLOR }}
            />
          </div>

          {/* Collection Days */}
          <div>
            <label className="block mb-2 text-sm font-medium" style={{ color: ACCENT_COLOR }}>
              Collection Days <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {COLLECTION_DAYS.map(day => (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleDayToggle(day)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    formData.collectionDays.includes(day)
                      ? 'text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  style={formData.collectionDays.includes(day) ? {
                    backgroundColor: ACCENT_COLOR
                  } : {}}
                >
                  {day.substring(0, 3)}
                </button>
              ))}
            </div>
            {errors.collectionDays && (
              <p className="text-xs text-red-500 mt-1">{errors.collectionDays}</p>
            )}
          </div>

          {/* Assigned Driver */}
          <div>
            <label className="block mb-1 text-sm font-medium" style={{ color: ACCENT_COLOR }}>
              Assigned Driver (Optional)
            </label>
            <select
              name="driverId"
              value={formData.driverId}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-2 text-sm bg-white focus:ring-2 focus:outline-none"
              style={{ borderColor: BORDER_COLOR }}
            >
              <option value="">No Driver Assigned</option>
              {availableDrivers.map((d) => (
                <option key={d._id || d.id} value={d._id || d.id}>
                  {d.name} {d.licenseNo ? `- ${d.licenseNo}` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Assigned Vehicle */}
          <div>
            <label className="block mb-1 text-sm font-medium" style={{ color: ACCENT_COLOR }}>
              Assigned Vehicle (Optional)
            </label>
            <select
              name="vehicleId"
              value={formData.vehicleId}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-2 text-sm bg-white focus:ring-2 focus:outline-none"
              style={{ borderColor: BORDER_COLOR }}
            >
              <option value="">No Vehicle  Assigned</option>
              {availableVehicles.map((v) => (
                <option key={v._id || v.id} value={v._id || v.id}>
                  {v.vehicleNumber || v.vehicleNo} {v.vehicleType ? `- ${v.vehicleType}` : ''} {v.model ? `(${v.model})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block mb-1 text-sm font-medium" style={{ color: ACCENT_COLOR }}>
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-2 text-sm bg-white focus:ring-2 focus:outline-none"
              style={{ borderColor: BORDER_COLOR }}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          {errors.submit && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}
        </form>

        {/* Footer */}
        <div
          className="p-4 mt-auto flex justify-end gap-3 border-t"
          style={{ backgroundColor: HEADER_BG, borderColor: BORDER_COLOR }}
        >
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 rounded-lg text-sm font-medium transition"
            style={{
              background: "transparent",
              color: ACCENT_COLOR,
              border: `2px solid ${BORDER_COLOR}`,
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-6 py-2 rounded-lg text-sm font-medium text-white transition"
            style={{ 
              backgroundColor: BTN_COLOR,
              opacity: isSubmitting ? 0.6 : 1
            }}
          >
            {isSubmitting ? 'Saving...' : route ? 'Update Route' : 'Create Route'}
          </button>
        </div>
      </div>
    </div>
  );
}
