import React, { useState, useEffect } from "react";
import { CalendarDays, Map, UserCircle, Truck, AlertTriangle, Loader } from "lucide-react";
import { useAuth } from "../../../contexts/AuthContext";
import { getAllRoutes } from "../../../api/route";
import { getAllDrivers } from "../../../api/driver";
import { getAllVehicles } from "../../../api/vehicle";

const ACCENT_COLOR = "#165E52";
const BORDER_COLOR = "#cfece6";
const BTN_COLOR = "#01251F";
const BG_INPUT = "#f8fdfc";

export default function RoutePlanningPage() {
  const { user } = useAuth();
  
  const [form, setForm] = useState({
    route: "",
    driver: "",
    vehicle: "",
    vehicleCapacity: "",
    date: new Date().toISOString().split("T")[0],
  });

  const [routes, setRoutes] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Fetch data on component mount
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setErrors({});

      // Fetch routes (Active status only)
      const routesResponse = await getAllRoutes("me", { status: "Active", limit: 100 });
      if (routesResponse.success && routesResponse.content) {
        setRoutes(Array.isArray(routesResponse.content) ? routesResponse.content : []);
        console.log("✅ Routes loaded:", routesResponse.content.length);
      }

      // Fetch available drivers
      const driversResponse = await getAllDrivers({ status: "Available" });
      if (driversResponse.success && driversResponse.data) {
        setDrivers(Array.isArray(driversResponse.data.drivers) ? driversResponse.data.drivers : []);
        console.log("✅ Drivers loaded:", driversResponse.data.drivers.length);
      }

      // Fetch available vehicles
      const vehiclesResponse = await getAllVehicles({ isActive: true });
      if (Array.isArray(vehiclesResponse)) {
        setVehicles(vehiclesResponse);
        console.log("✅ Vehicles loaded:", vehiclesResponse.length);
      }
    } catch (error) {
      console.error("❌ Error fetching data:", error);
      setErrors({
        submit: `Failed to load data: ${error.message || "Unknown error"}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setErrors((prev) => ({ ...prev, [name]: "" }));

    if (name === "vehicle") {
      const selectedVehicle = vehicles.find((v) => v._id === value);
      setForm({
        ...form,
        vehicle: value,
        vehicleCapacity: selectedVehicle ? `${selectedVehicle.capacity || 'N/A'} kg` : "",
      });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.route) newErrors.route = "Please select a route";
    if (!form.driver) newErrors.driver = "Please select a driver";
    if (!form.vehicle) newErrors.vehicle = "Please select a vehicle";
    if (!form.date) newErrors.date = "Please select an assignment date";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    try {
      const selectedRoute = routes.find((r) => r._id === form.route);
      const selectedDriver = drivers.find((d) => d._id === form.driver);
      const selectedVehicle = vehicles.find((v) => v._id === form.vehicle);

      const payload = {
        routeId: form.route,
        routeName: selectedRoute?.routeName,
        driverId: form.driver,
        driverName: selectedDriver?.name,
        vehicleId: form.vehicle,
        vehicleNumber: selectedVehicle?.vehicleNumber,
        vehicleCapacity: selectedVehicle?.capacity,
        assignmentDate: form.date,
      };

      console.log("📤 Submitting route planning:", payload);

      // TODO: Call API to save route planning assignment
      // For now, show success message
      setSuccessMessage(
        `✅ Route "${selectedRoute?.routeName}" assigned to ${selectedDriver?.name} with ${selectedVehicle?.vehicleNumber} on ${form.date}`
      );

      // Reset form
      setTimeout(() => {
        setForm({
          route: "",
          driver: "",
          vehicle: "",
          vehicleCapacity: "",
          date: new Date().toISOString().split("T")[0],
        });
        setSuccessMessage("");
      }, 3000);
    } catch (error) {
      console.error("❌ Error submitting route plan:", error);
      setErrors({
        submit: `Failed to assign route: ${error.message || "Unknown error"}`,
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <Loader className="h-8 w-8 animate-spin text-emerald-600" />
          <p className="text-gray-600">Loading route planning data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center bg-gray-50 overflow-hidden m-6 min-h-screen">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl p-8 overflow-hidden">
        <h2
          className="text-3xl font-bold mb-2 flex items-center gap-3"
          style={{ color: ACCENT_COLOR }}
        >
          <Map size={32} aria-hidden="true" />
          Route Planning
        </h2>
        <p className="text-gray-600 mb-6">Optimize collection routes and assign drivers & vehicles</p>

        {/* Error Message */}
        {errors.submit && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
            <p className="text-red-700">{errors.submit}</p>
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700">{successMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
          {/* Route Selection */}
          <div>
            <label htmlFor="route" className="block mb-2 font-semibold" style={{ color: ACCENT_COLOR }}>
              Select Route <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Map
                className="absolute left-3 top-3"
                size={18}
                style={{ color: ACCENT_COLOR }}
                aria-hidden="true"
              />
              <select
                id="route"
                name="route"
                value={form.route}
                onChange={handleChange}
                disabled={routes.length === 0}
                className="w-full pl-10 pr-3 py-3 rounded-lg border text-sm focus:outline-none focus:ring-2 transition"
                style={{
                  borderColor: errors.route ? "#ef4444" : BORDER_COLOR,
                  backgroundColor: BG_INPUT,
                  color: ACCENT_COLOR,
                  focusRingColor: errors.route ? "#ef4444" : ACCENT_COLOR,
                }}
                aria-required="true"
              >
                <option value="">
                  {routes.length === 0 ? "No active routes available" : "Choose a route..."}
                </option>
                {routes.map((r) => (
                  <option key={r._id} value={r._id}>
                    {r.routeName} ({r.routeNumber}) - {r.area}
                  </option>
                ))}
              </select>
            </div>
            {errors.route && <p className="text-red-500 text-sm mt-1">{errors.route}</p>}
          </div>

          {/* Driver Selection */}
          <div>
            <label htmlFor="driver" className="block mb-2 font-semibold" style={{ color: ACCENT_COLOR }}>
              Choose Driver <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <UserCircle
                className="absolute left-3 top-3"
                size={18}
                style={{ color: ACCENT_COLOR }}
                aria-hidden="true"
              />
              <select
                id="driver"
                name="driver"
                value={form.driver}
                onChange={handleChange}
                disabled={drivers.length === 0}
                className="w-full pl-10 pr-3 py-3 rounded-lg border text-sm focus:outline-none focus:ring-2 transition"
                style={{
                  borderColor: errors.driver ? "#ef4444" : BORDER_COLOR,
                  backgroundColor: BG_INPUT,
                  color: ACCENT_COLOR,
                }}
                aria-required="true"
              >
                <option value="">
                  {drivers.length === 0 ? "No available drivers" : "Choose a driver..."}
                </option>
                {drivers.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name} {d.licenseNo ? `(${d.licenseNo})` : ""}
                  </option>
                ))}
              </select>
            </div>
            {errors.driver && <p className="text-red-500 text-sm mt-1">{errors.driver}</p>}
          </div>

          {/* Vehicle & Capacity Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Vehicle Selection */}
            <div>
              <label htmlFor="vehicle" className="block mb-2 font-semibold" style={{ color: ACCENT_COLOR }}>
                Choose Vehicle <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Truck
                  className="absolute left-3 top-3"
                  size={18}
                  style={{ color: ACCENT_COLOR }}
                  aria-hidden="true"
                />
                <select
                  id="vehicle"
                  name="vehicle"
                  value={form.vehicle}
                  onChange={handleChange}
                  disabled={vehicles.length === 0}
                  className="w-full pl-10 pr-3 py-3 rounded-lg border text-sm focus:outline-none focus:ring-2 transition"
                  style={{
                    borderColor: errors.vehicle ? "#ef4444" : BORDER_COLOR,
                    backgroundColor: BG_INPUT,
                    color: ACCENT_COLOR,
                  }}
                  aria-required="true"
                >
                  <option value="">
                    {vehicles.length === 0 ? "No available vehicles" : "Choose a vehicle..."}
                  </option>
                  {vehicles.map((v) => (
                    <option key={v._id} value={v._id}>
                      {v.vehicleNumber} - {v.vehicleType} ({v.model || "N/A"})
                    </option>
                  ))}
                </select>
              </div>
              {errors.vehicle && <p className="text-red-500 text-sm mt-1">{errors.vehicle}</p>}
            </div>

            {/* Vehicle Capacity (Auto-filled) */}
            <div>
              <label htmlFor="vehicleCapacity" className="block mb-2 font-semibold" style={{ color: ACCENT_COLOR }}>
                Vehicle Capacity
              </label>
              <input
                type="text"
                id="vehicleCapacity"
                name="vehicleCapacity"
                readOnly
                value={form.vehicleCapacity}
                placeholder="Auto-filled from vehicle"
                className="w-full px-4 py-3 rounded-lg border text-sm cursor-not-allowed"
                style={{
                  borderColor: BORDER_COLOR,
                  backgroundColor: "#f0faf7",
                  color: ACCENT_COLOR,
                }}
                aria-readonly="true"
              />
            </div>
          </div>

          {/* Assignment Date */}
          <div>
            <label htmlFor="date" className="block mb-2 font-semibold" style={{ color: ACCENT_COLOR }}>
              Date of Assignment <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <CalendarDays
                className="absolute left-3 top-3"
                size={18}
                style={{ color: ACCENT_COLOR }}
                aria-hidden="true"
              />
              <input
                type="date"
                id="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                disabled={submitting}
                className="w-full pl-10 pr-3 py-3 rounded-lg border text-sm focus:outline-none focus:ring-2 transition"
                style={{
                  borderColor: errors.date ? "#ef4444" : BORDER_COLOR,
                  backgroundColor: BG_INPUT,
                  color: ACCENT_COLOR,
                }}
                aria-required="true"
              />
            </div>
            {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-6">
            <button
              type="submit"
              disabled={submitting || loading}
              className="flex-1 py-3 rounded-lg text-white font-bold text-lg shadow transition hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
              style={{ backgroundColor: BTN_COLOR }}
            >
              {submitting ? (
                <>
                  <Loader className="h-5 w-5 animate-spin" />
                  Assigning...
                </>
              ) : (
                "Assign Route & Vehicle"
              )}
            </button>
            <button
              type="button"
              onClick={fetchAllData}
              disabled={submitting || loading}
              className="px-6 py-3 rounded-lg border text-sm font-medium transition hover:bg-gray-50"
              style={{ borderColor: BORDER_COLOR, color: ACCENT_COLOR }}
            >
              Refresh
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
