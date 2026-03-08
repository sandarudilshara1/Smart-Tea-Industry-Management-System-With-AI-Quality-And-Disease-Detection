import { useState, useEffect } from "react";
import {
  UserCheck,
  MapPin,
  Calendar,
  AlertTriangle,
  Loader,
} from "lucide-react";
import { useAuth } from "../../../contexts/AuthContext";
import { getAllRoutes } from "../../../api/route";

// Design tokens
const ACCENT_COLOR = "#165E52";
const BTN_COLOR = "#01251F";
const BORDER_COLOR = "#cfece6";
const HEADER_BG = "#e1f4ef";

export default function AssignmentModal({
  isOpen,
  onClose,
  onSubmit,
  availableDrivers = [],
  preSelectedDriver = null,
}) {
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    driverId: "",
    route: "",
    date: new Date().toISOString().split("T")[0],
    notes: "",
  });

  const [errors, setErrors] = useState({});
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [routes, setRoutes] = useState([]);
  const [loadingRoutes, setLoadingRoutes] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchRoutes();
    }
    if (preSelectedDriver) {
      setFormData((prev) => ({
        ...prev,
        driverId: preSelectedDriver._id || preSelectedDriver.id,
      }));
    } else {
      setFormData({
        driverId: "",
        route: "",
        date: new Date().toISOString().split("T")[0],
        notes: "",
      });
    }
    setErrors({});
    document.body.style.overflow = isOpen ? "hidden" : "unset";
    return () => (document.body.style.overflow = "unset");
  }, [preSelectedDriver, isOpen]);

  const fetchRoutes = async () => {
    try {
      setLoadingRoutes(true);
      // Use "me" instead of hardcoded factory ID; backend resolves from JWT token
      const response = await getAllRoutes("me", { status: "Active", limit: 100 });
      if (response.success && response.content) {
        console.log('✅ Routes fetched for assignment:', response.content.length);
        setRoutes(Array.isArray(response.content) ? response.content : []);
      } else {
        console.warn('⚠️ Unexpected routes response:', response);
        setRoutes([]);
      }
    } catch (error) {
      console.error('❌ Error fetching routes for assignment:', error);
      setRoutes([]);
    } finally {
      setLoadingRoutes(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.driverId) newErrors.driverId = "Please select a driver";      
    if (!formData.route) newErrors.route = "Please select a route";
    return newErrors;
  };

  const handleInputChange = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setShowConfirmation(true);
  };

  const handleQuickFill = () => {
    // Temporary: Auto-fill form with first available options for testing
    if (availableDrivers.length > 0 && routes.length > 0) {
      const firstDriver = availableDrivers[0];
      const firstRoute = routes[0];
      setFormData({
        driverId: firstDriver._id || firstDriver.id,
        route: firstRoute._id, // Always use _id for route
        date: new Date().toISOString().split("T")[0],
        notes: "Test assignment - Quick Fill",
      });
      setErrors({});
      console.log('⚡ Quick-filled form with first available driver and route');
    } else {
      console.warn('⚠️ Cannot quick fill: drivers:', availableDrivers.length, 'routes:', routes.length);
    }
  };

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      const selectedDriver = availableDrivers.find((d) => (d._id || d.id) === formData.driverId);
      // Route matching: formData.route contains the route _id, so search by _id
      const selectedRoute = routes.find((r) => r._id === formData.route);
      
      if (!selectedRoute) {
        throw new Error('Selected route not found');
      }

      const payload = {
        driverId: formData.driverId,
        route: {
          id: selectedRoute._id,
          name: selectedRoute.routeName,
          number: selectedRoute.routeNumber,
        },
        date: formData.date,
        notes: formData.notes,
      };

      console.log('📤 Submitting route assignment:', payload);
      await onSubmit(payload);
      onClose();
    } catch (err) {
      console.error('❌ Error confirming assignment:', err);
      setErrors({ submit: err.message || 'Failed to confirm assignment' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[1000] backdrop-blur-sm bg-black/30 overflow-hidden">
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl border"     
        style={{ borderColor: BORDER_COLOR }}
      >
        {/* Header */}
        <div
          className="p-6 border-b flex items-center justify-between"
          style={{ borderColor: BORDER_COLOR, backgroundColor: HEADER_BG }}     
        >
          <h2 className="text-xl font-semibold" style={{ color: ACCENT_COLOR }}>
            Assign Route to Driver
          </h2>
          {/* Temporary Quick Fill Button for Testing */}
          <button
            type="button"
            onClick={handleQuickFill}
            disabled={availableDrivers.length === 0 || routes.length === 0 || loadingRoutes}
            className="px-3 py-1.5 rounded text-xs font-medium transition"
            style={{
              backgroundColor: "#f59e0b",
              color: "white",
              opacity: (availableDrivers.length === 0 || routes.length === 0 || loadingRoutes) ? 0.5 : 1,
            }}
            title="Quick fill with test data"
          >
            ⚡ Quick Fill (Test)
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-6">
            {/* Driver */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">  
                Select Driver <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:outline-none"
                style={{ borderColor: BORDER_COLOR }}
                value={formData.driverId}
                onChange={(e) => handleInputChange("driverId", e.target.value)} 
                disabled={Boolean(preSelectedDriver)}
              >
                <option value="">Choose driver...</option>
                {availableDrivers.map((d) => (
                  <option key={d._id || d.id} value={d._id || d.id}>
                    {d.name} — {d.vehicleNo || d.assignedVehicle || 'No vehicle'}
                  </option>
                ))}
              </select>
              {errors.driverId && (
                <p className="text-sm text-red-500">{errors.driverId}</p>       
              )}
            </div>

            {/* Route */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">  
                Select Route <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <select
                  className="w-full pl-10 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:outline-none bg-white"
                  style={{ borderColor: errors.route ? '#ef4444' : BORDER_COLOR }}
                  value={formData.route}
                  onChange={(e) => handleInputChange("route", e.target.value)}  
                  disabled={loadingRoutes || routes.length === 0}
                >
                  <option value="">
                    {loadingRoutes ? '⏳ Loading routes...' : routes.length === 0 ? 'No active routes available' : 'Choose route...'}
                  </option>
                  {routes.map((route) => (
                    <option key={route._id} value={route._id}>
                      {route.routeName} ({route.routeNumber}) - {route.area}
                    </option>
                  ))}
                </select>
                {loadingRoutes && (
                  <Loader className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-gray-400" size={16} />
                )}
              </div>
              {errors.route && (
                <p className="text-sm text-red-500">{errors.route}</p>
              )}
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">  
                Assignment Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="date"
                  className="pl-10 w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:outline-none"
                  style={{ borderColor: BORDER_COLOR }}
                  value={formData.date}
                  onChange={(e) => handleInputChange("date", e.target.value)}   
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">  
                Additional Notes
              </label>
              <textarea
                className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:outline-none"
                style={{ borderColor: BORDER_COLOR }}
                rows={3}
                placeholder="Optional notes..."
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}    
              />
            </div>

            {/* Error Display */}
            {errors.submit && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                <p className="text-sm text-red-600">{errors.submit}</p>
              </div>
            )}
          </div>

          {/* Footer Buttons */}
          <div
            className="flex gap-3 justify-end p-6 border-t"
            style={{ borderColor: BORDER_COLOR, backgroundColor: HEADER_BG }}   
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
              className="px-6 py-2 rounded-lg text-sm font-medium text-white transition"
              style={{
                backgroundColor: BTN_COLOR,
              }}
            >
              Continue
            </button>
          </div>
        </form>
      </div>

      {/* Confirmation Dialog Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div
            className="bg-white rounded-2xl w-full max-w-md shadow-2xl border"  
            style={{ borderColor: BORDER_COLOR }}
          >
            {/* Header */}
            <div
              className="p-6 border-b flex items-center space-x-3"
              style={{ borderColor: BORDER_COLOR, backgroundColor: HEADER_BG }} 
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-100">
                <AlertTriangle className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-base font-semibold" style={{ color: ACCENT_COLOR }}>
                Confirm Assignment
              </h2>
            </div>

            {/* Body */}
            <div className="p-6">
              <p className="text-sm text-gray-800 mb-4">
                Are you sure you want to assign{" "}
                <strong>
                  {
                    availableDrivers.find((d) => (d._id || d.id) === formData.driverId)?.name
                  }
                </strong>{" "}
                to the route <strong>{routes.find((r) => r._id === formData.route)?.routeName || 'Unknown'}</strong> on{" "}
                <strong>{formData.date}</strong>?
              </p>
              {/* Buttons */}
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowConfirmation(false)}
                  className="px-4 py-2 rounded-md text-sm font-medium"
                  style={{
                    backgroundColor: "transparent",
                    border: `2px solid ${BORDER_COLOR}`,
                    color: ACCENT_COLOR,
                  }}
                >
                  Cancel
                </button>

                <button
                  onClick={handleConfirm}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-md text-sm font-medium text-white"
                  style={{
                    backgroundColor: BTN_COLOR,
                    opacity: isSubmitting ? 0.6 : 1,
                  }}
                >
                  {isSubmitting ? "Assigning..." : "Confirm"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
