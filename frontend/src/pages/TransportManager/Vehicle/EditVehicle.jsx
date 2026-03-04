import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Truck,
  FileText,
  Package,
  Settings,
  UserCircle,
  Calendar,
  Camera,
  CheckCircle,
  Loader,
  Save,
  AlertCircle,
} from "lucide-react";
import { getVehicleById, updateVehicle } from "../../../api/vehicle";
import { getAllDrivers } from "../../../api/driver";

// Design Tokens from AddVehicle.jsx
const ACCENT_COLOR = "#165E52"; // used for labels/text
const BORDER_COLOR = "#cfece6"; // border color
const BTN_COLOR = "#01251F"; // button bg color
const HEADER_BG = "#e1f4ef"; // header/footer bg
const INPUT_BG = "#ffffff";

// Vehicle types matching backend model
const vehicleTypes = [
  { value: "Truck", label: "Truck" },
  { value: "Van", label: "Van" },
  { value: "Lorry", label: "Lorry" },
  { value: "Pickup Truck", label: "Pickup Truck" },
  { value: "Other", label: "Other" },
];

const statusOptions = [
  { value: "Available", label: "Available" },
  { value: "In Use", label: "In Use" },
  { value: "Maintenance", label: "Maintenance" },
  { value: "Unavailable", label: "Unavailable" },
];

const fuelTypes = [
  { value: "Petrol", label: "Petrol" },
  { value: "Diesel", label: "Diesel" },
  { value: "Electric", label: "Electric" },
  { value: "Hybrid", label: "Hybrid" },
];

// Helper function to format date for input field (YYYY-MM-DD)
const formatDateForInput = (dateString) => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    return date.toISOString().split('T')[0];
  } catch (error) {
    return "";
  }
};

export default function EditVehicle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);
  const [error, setError] = useState(null);
  
  const [form, setForm] = useState({
    vehicleNumber: "",
    vehicleType: "",
    model: "",
    capacity: "",
    status: "Available",
    assignedDriver: "",
    driverId: "",
    lastServiceDate: "",
    nextServiceDate: "",
    insuranceExpiryDate: "",
    registrationNumber: "",
    manufacturingYear: "",
    fuelType: "Diesel",
    mileage: "",
    notes: "",
    vehicleImage: null,
  });

  useEffect(() => {
    fetchVehicleAndDrivers();
  }, [id]);

  const fetchVehicleAndDrivers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch vehicle data and drivers in parallel
      const [vehicleData, driversData] = await Promise.all([
        getVehicleById(id),
        getAllDrivers({ status: 'Active' })
      ]);

      console.log('Vehicle data fetched:', vehicleData);
      console.log('Drivers fetched:', driversData);

      // Format dates for input fields
      const formattedVehicle = {
        vehicleNumber: vehicleData.vehicleNumber || "",
        vehicleType: vehicleData.vehicleType || "",
        model: vehicleData.model || "",
        capacity: vehicleData.capacity || "",
        status: vehicleData.status || "Available",
        assignedDriver: vehicleData.assignedDriver || "",
        driverId: vehicleData.driverId || "",
        lastServiceDate: formatDateForInput(vehicleData.lastServiceDate),
        nextServiceDate: formatDateForInput(vehicleData.nextServiceDate),
        insuranceExpiryDate: formatDateForInput(vehicleData.insuranceExpiryDate),
        registrationNumber: vehicleData.registrationNumber || "",
        manufacturingYear: vehicleData.manufacturingYear ? String(vehicleData.manufacturingYear) : "",
        fuelType: vehicleData.fuelType || "Diesel",
        mileage: vehicleData.mileage ? String(vehicleData.mileage) : "",
        notes: vehicleData.notes || "",
        vehicleImage: vehicleData.vehicleImage || null,
      };

      setForm(formattedVehicle);
      setDrivers(Array.isArray(driversData) ? driversData : []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error.response?.data?.message || error.message || 'Failed to load vehicle data');
      showNotification('Failed to load vehicle data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "vehicleImage") {
      const file = files[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setForm({ ...form, vehicleImage: reader.result });
        };
        reader.readAsDataURL(file);
      }
    } else if (name === "driverId") {
      // When driver is selected, also update assignedDriver name
      const selectedDriver = drivers.find(d => d._id === value);
      setForm({ 
        ...form, 
        driverId: value,
        assignedDriver: selectedDriver ? selectedDriver.name : ""
      });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const vehicleData = {
        ...form,
        manufacturingYear: form.manufacturingYear ? parseInt(form.manufacturingYear) : undefined,
        mileage: form.mileage ? parseFloat(form.mileage) : undefined,
      };

      // Remove fields that should not be sent in update
      delete vehicleData._id;
      delete vehicleData.createdAt;
      delete vehicleData.updatedAt;
      delete vehicleData.__v;

      // Remove empty fields
      Object.keys(vehicleData).forEach(key => {
        if (vehicleData[key] === "" || vehicleData[key] === null) {
          delete vehicleData[key];
        }
      });

      console.log('Updating vehicle with data:', vehicleData);
      const result = await updateVehicle(id, vehicleData);
      console.log('Vehicle updated successfully:', result);
      showNotification('Vehicle updated successfully!', 'success');
      
      setTimeout(() => {
        navigate('/transportManager/vehicle');
      }, 1500);
    } catch (error) {
      console.error('Error updating vehicle:', error);
      console.error('Error details:', error.response?.data);
      
      let errorMessage = 'Failed to update vehicle';
      if (error.response?.status === 401) {
        errorMessage = 'Please login to continue';
      } else if (error.response?.status === 403) {
        errorMessage = 'You do not have permission to update vehicles';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      showNotification(errorMessage, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader className="animate-spin mx-auto mb-4" size={48} style={{ color: ACCENT_COLOR }} />
          <p className="text-lg" style={{ color: ACCENT_COLOR }}>Loading vehicle data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-4xl mx-auto my-10 p-8 bg-white rounded-2xl border shadow-2xl" style={{ borderColor: BORDER_COLOR }}>
        <div className="flex items-center gap-3 text-red-600 mb-4">
          <AlertCircle size={24} />
          <h2 className="text-xl font-semibold">Error Loading Vehicle</h2>
        </div>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={() => navigate('/transportManager/vehicle')}
          className="px-6 py-2 rounded-lg text-white font-semibold"
          style={{ backgroundColor: BTN_COLOR }}
        >
          Back to Vehicles
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto my-10 rounded-2xl border shadow-2xl overflow-hidden bg-white" style={{ borderColor: BORDER_COLOR }}>
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${
          notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white font-medium`}>
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div className="px-8 py-6 border-b" style={{ backgroundColor: HEADER_BG, borderColor: BORDER_COLOR }}>
        <h2 className="text-2xl font-semibold" style={{ color: ACCENT_COLOR }}>
          Edit Vehicle - {form.vehicleNumber}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8">
        {/* Vehicle Number (Read-only) */}
        <div>
          <label htmlFor="vehicleNumber" className="block mb-1 text-sm font-medium" style={{ color: ACCENT_COLOR }}>
            Vehicle Number *
          </label>
          <div className="flex items-center gap-3 rounded-lg p-3 border bg-gray-50" style={{ borderColor: BORDER_COLOR }}>
            <FileText className="text-[rgba(22,94,82,0.8)]" size={24} />
            <input
              id="vehicleNumber"
              type="text"
              name="vehicleNumber"
              value={form.vehicleNumber}
              disabled
              className="w-full bg-transparent focus:outline-none text-sm cursor-not-allowed"
              style={{ color: ACCENT_COLOR }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">Vehicle number cannot be changed</p>
        </div>

        {/* Vehicle Type */}
        <div>
          <label htmlFor="vehicleType" className="block mb-1 text-sm font-medium" style={{ color: ACCENT_COLOR }}>
            Vehicle Type *
          </label>
          <div className="flex items-center gap-3 rounded-lg p-3 border" style={{ borderColor: BORDER_COLOR, backgroundColor: INPUT_BG }}>
            <Truck className="text-[rgba(22,94,82,0.8)]" size={24} />
            <select
              id="vehicleType"
              name="vehicleType"
              value={form.vehicleType}
              onChange={handleChange}
              required
              className="w-full bg-transparent focus:outline-none text-sm"
              style={{ color: ACCENT_COLOR }}
            >
              <option value="" disabled>Choose vehicle type</option>
              {vehicleTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Model */}
        <div>
          <label htmlFor="model" className="block mb-1 text-sm font-medium" style={{ color: ACCENT_COLOR }}>
            Model *
          </label>
          <div className="flex items-center gap-3 rounded-lg p-3 border" style={{ borderColor: BORDER_COLOR, backgroundColor: INPUT_BG }}>
            <Truck className="text-[rgba(22,94,82,0.8)]" size={24} />
            <input
              id="model"
              type="text"
              name="model"
              value={form.model}
              onChange={handleChange}
              placeholder="Vehicle Model (e.g., Tata Ace)"
              required
              className="w-full bg-transparent focus:outline-none text-sm"
              style={{ color: ACCENT_COLOR }}
            />
          </div>
        </div>

        {/* Capacity */}
        <div>
          <label htmlFor="capacity" className="block mb-1 text-sm font-medium" style={{ color: ACCENT_COLOR }}>
            Capacity *
          </label>
          <div className="flex items-center gap-3 rounded-lg p-3 border" style={{ borderColor: BORDER_COLOR, backgroundColor: INPUT_BG }}>
            <Package className="text-[rgba(22,94,82,0.8)]" size={24} />
            <input
              id="capacity"
              type="text"
              name="capacity"
              value={form.capacity}
              onChange={handleChange}
              placeholder="Capacity (e.g., 1000kg)"
              required
              className="w-full bg-transparent focus:outline-none text-sm"
              style={{ color: ACCENT_COLOR }}
            />
          </div>
        </div>

        {/* Status */}
        <div>
          <label htmlFor="status" className="block mb-1 text-sm font-medium" style={{ color: ACCENT_COLOR }}>
            Status *
          </label>
          <div className="flex items-center gap-3 rounded-lg p-3 border" style={{ borderColor: BORDER_COLOR, backgroundColor: INPUT_BG }}>
            <Settings className="text-[rgba(22,94,82,0.8)]" size={24} />
            <select
              id="status"
              name="status"
              value={form.status}
              onChange={handleChange}
              required
              className="w-full bg-transparent focus:outline-none text-sm"
              style={{ color: ACCENT_COLOR }}
            >
              {statusOptions.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Assigned Driver */}
        <div>
          <label htmlFor="driverId" className="block mb-1 text-sm font-medium" style={{ color: ACCENT_COLOR }}>
            Assigned Driver
          </label>
          <div className="flex items-center gap-3 rounded-lg p-3 border" style={{ borderColor: BORDER_COLOR, backgroundColor: INPUT_BG }}>
            <UserCircle className="text-[rgba(22,94,82,0.8)]" size={24} />
            <select
              id="driverId"
              name="driverId"
              value={form.driverId}
              onChange={handleChange}
              className="w-full bg-transparent focus:outline-none text-sm"
              style={{ color: ACCENT_COLOR }}
            >
              <option value="">No Driver</option>
              {Array.isArray(drivers) && drivers.map((driver) => (
                <option key={driver._id} value={driver._id}>
                  {driver.name} - {driver.licenseNumber || 'N/A'}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Registration Number */}
        <div>
          <label htmlFor="registrationNumber" className="block mb-1 text-sm font-medium" style={{ color: ACCENT_COLOR }}>
            Registration Number
          </label>
          <div className="flex items-center gap-3 rounded-lg p-3 border" style={{ borderColor: BORDER_COLOR, backgroundColor: INPUT_BG }}>
            <FileText className="text-[rgba(22,94,82,0.8)]" size={24} />
            <input
              id="registrationNumber"
              type="text"
              name="registrationNumber"
              value={form.registrationNumber}
              onChange={handleChange}
              placeholder="Registration Number"
              className="w-full bg-transparent focus:outline-none text-sm"
              style={{ color: ACCENT_COLOR }}
            />
          </div>
        </div>

        {/* Manufacturing Year */}
        <div>
          <label htmlFor="manufacturingYear" className="block mb-1 text-sm font-medium" style={{ color: ACCENT_COLOR }}>
            Manufacturing Year
          </label>
          <div className="flex items-center gap-3 rounded-lg p-3 border" style={{ borderColor: BORDER_COLOR, backgroundColor: INPUT_BG }}>
            <Calendar className="text-[rgba(22,94,82,0.8)]" size={24} />
            <input
              id="manufacturingYear"
              type="number"
              name="manufacturingYear"
              value={form.manufacturingYear}
              onChange={handleChange}
              placeholder="e.g., 2020"
              min="1900"
              max={new Date().getFullYear() + 1}
              className="w-full bg-transparent focus:outline-none text-sm"
              style={{ color: ACCENT_COLOR }}
            />
          </div>
        </div>

        {/* Fuel Type */}
        <div>
          <label htmlFor="fuelType" className="block mb-1 text-sm font-medium" style={{ color: ACCENT_COLOR }}>
            Fuel Type
          </label>
          <div className="flex items-center gap-3 rounded-lg p-3 border" style={{ borderColor: BORDER_COLOR, backgroundColor: INPUT_BG }}>
            <Settings className="text-[rgba(22,94,82,0.8)]" size={24} />
            <select
              id="fuelType"
              name="fuelType"
              value={form.fuelType}
              onChange={handleChange}
              className="w-full bg-transparent focus:outline-none text-sm"
              style={{ color: ACCENT_COLOR }}
            >
              {fuelTypes.map((fuel) => (
                <option key={fuel.value} value={fuel.value}>
                  {fuel.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Mileage */}
        <div>
          <label htmlFor="mileage" className="block mb-1 text-sm font-medium" style={{ color: ACCENT_COLOR }}>
            Mileage (km)
          </label>
          <div className="flex items-center gap-3 rounded-lg p-3 border" style={{ borderColor: BORDER_COLOR, backgroundColor: INPUT_BG }}>
            <Package className="text-[rgba(22,94,82,0.8)]" size={24} />
            <input
              id="mileage"
              type="number"
              name="mileage"
              value={form.mileage}
              onChange={handleChange}
              placeholder="Current mileage"
              min="0"
              step="0.1"
              className="w-full bg-transparent focus:outline-none text-sm"
              style={{ color: ACCENT_COLOR }}
            />
          </div>
        </div>

        {/* Last Service Date */}
        <div>
          <label htmlFor="lastServiceDate" className="block mb-1 text-sm font-medium" style={{ color: ACCENT_COLOR }}>
            Last Service Date
          </label>
          <div className="flex items-center gap-3 rounded-lg p-3 border" style={{ borderColor: BORDER_COLOR, backgroundColor: INPUT_BG }}>
            <Calendar className="text-[rgba(22,94,82,0.8)]" size={24} />
            <input
              id="lastServiceDate"
              type="date"
              name="lastServiceDate"
              value={form.lastServiceDate}
              onChange={handleChange}
              className="w-full bg-transparent focus:outline-none text-sm"
              style={{ color: ACCENT_COLOR }}
            />
          </div>
        </div>

        {/* Next Service Date */}
        <div>
          <label htmlFor="nextServiceDate" className="block mb-1 text-sm font-medium" style={{ color: ACCENT_COLOR }}>
            Next Service Date
          </label>
          <div className="flex items-center gap-3 rounded-lg p-3 border" style={{ borderColor: BORDER_COLOR, backgroundColor: INPUT_BG }}>
            <Calendar className="text-[rgba(22,94,82,0.8)]" size={24} />
            <input
              id="nextServiceDate"
              type="date"
              name="nextServiceDate"
              value={form.nextServiceDate}
              onChange={handleChange}
              className="w-full bg-transparent focus:outline-none text-sm"
              style={{ color: ACCENT_COLOR }}
            />
          </div>
        </div>

        {/* Insurance Expiry Date */}
        <div>
          <label htmlFor="insuranceExpiryDate" className="block mb-1 text-sm font-medium" style={{ color: ACCENT_COLOR }}>
            Insurance Expiry Date
          </label>
          <div className="flex items-center gap-3 rounded-lg p-3 border" style={{ borderColor: BORDER_COLOR, backgroundColor: INPUT_BG }}>
            <Calendar className="text-[rgba(22,94,82,0.8)]" size={24} />
            <input
              id="insuranceExpiryDate"
              type="date"
              name="insuranceExpiryDate"
              value={form.insuranceExpiryDate}
              onChange={handleChange}
              className="w-full bg-transparent focus:outline-none text-sm"
              style={{ color: ACCENT_COLOR }}
            />
          </div>
        </div>

        {/* Notes - Full Width */}
        <div className="md:col-span-2">
          <label htmlFor="notes" className="block mb-1 text-sm font-medium" style={{ color: ACCENT_COLOR }}>
            Notes
          </label>
          <div className="rounded-lg p-3 border" style={{ borderColor: BORDER_COLOR, backgroundColor: INPUT_BG }}>
            <textarea
              id="notes"
              name="notes"
              value={form.notes}
              onChange={handleChange}
              placeholder="Additional notes about the vehicle (max 500 characters)"
              maxLength={500}
              rows={3}
              className="w-full bg-transparent focus:outline-none text-sm resize-none"
              style={{ color: ACCENT_COLOR }}
            />
            <div className="text-xs text-gray-400 text-right mt-1">
              {form.notes.length}/500 characters
            </div>
          </div>
        </div>

        {/* Vehicle Image */}
        <div className="md:col-span-2">
          <label htmlFor="vehicleImage" className="block mb-1 text-sm font-medium" style={{ color: ACCENT_COLOR }}>
            Vehicle Image
          </label>
          <div className="rounded-lg p-3 border" style={{ borderColor: BORDER_COLOR, backgroundColor: INPUT_BG }}>
            <label className="flex items-center gap-2 text-sm font-medium cursor-pointer" style={{ color: ACCENT_COLOR }}>
              <Camera className="text-[rgba(22,94,82,0.8)]" size={20} />
              Upload New Vehicle Image
              <input
                id="vehicleImage"
                type="file"
                name="vehicleImage"
                accept="image/*"
                onChange={handleChange}
                className="hidden"
              />
            </label>
            {form.vehicleImage && (
              <div className="mt-3">
                <p className="text-sm text-green-600 flex items-center gap-1 mb-2" style={{ color: "#165E52" }}>
                  <CheckCircle size={14} />
                  Image available
                </p>
                <img 
                  src={form.vehicleImage} 
                  alt="Vehicle preview" 
                  className="max-w-xs max-h-48 rounded-lg border" 
                  style={{ borderColor: BORDER_COLOR }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="md:col-span-2 flex gap-4">
          <button
            type="button"
            onClick={() => navigate('/transportManager/vehicle')}
            className="flex-1 rounded-lg bg-gray-400 hover:bg-gray-500 text-white font-semibold text-lg py-3 flex items-center justify-center gap-2 shadow-lg transition-colors"
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 rounded-lg hover:bg-[#164d44] disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold text-lg py-3 flex items-center justify-center gap-2 shadow-lg transition-colors"
            style={{ backgroundColor: submitting ? '#9CA3AF' : BTN_COLOR }}
          >
            {submitting ? (
              <>
                <Loader className="animate-spin" size={20} />
                Updating...
              </>
            ) : (
              <>
                <Save size={20} />
                Update Vehicle
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
