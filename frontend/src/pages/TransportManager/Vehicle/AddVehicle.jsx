import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
} from "lucide-react";
import { createVehicle } from "../../../api/vehicle";
import { getAllDrivers } from "../../../api/driver";

// Design Tokens from previous form
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

export default function AddVehicle() {
  const navigate = useNavigate();
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);
  
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
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const driversData = await getAllDrivers({ status: 'Active' });
      console.log('Drivers fetched:', driversData);
      // Ensure driversData is an array
      setDrivers(Array.isArray(driversData) ? driversData : []);
    } catch (error) {
      console.error('Error fetching drivers:', error);
      showNotification('Failed to load drivers', 'error');
      setDrivers([]); // Set empty array on error
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
      // Check auth before submitting
      const token = localStorage.getItem('authToken');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      console.log('Current user:', user);
      console.log('Has token:', !!token);
      
      const vehicleData = {
        ...form,
        manufacturingYear: form.manufacturingYear ? parseInt(form.manufacturingYear) : undefined,
        mileage: form.mileage ? parseFloat(form.mileage) : undefined,
      };

      // Remove empty fields
      Object.keys(vehicleData).forEach(key => {
        if (vehicleData[key] === "" || vehicleData[key] === null) {
          delete vehicleData[key];
        }
      });

      console.log('Submitting vehicle data:', vehicleData);
      const result = await createVehicle(vehicleData);
      console.log('Vehicle created successfully:', result);
      showNotification('Vehicle registered successfully!', 'success');
      
      setTimeout(() => {
        navigate('/transportManager/vehicle');
      }, 1500);
    } catch (error) {
      console.error('Error creating vehicle:', error);
      console.error('Error details:', error.response?.data);
      
      let errorMessage = 'Failed to register vehicle';
      if (error.response?.status === 401) {
        errorMessage = 'Please login to continue';
      } else if (error.response?.status === 403) {
        errorMessage = 'You do not have permission to add vehicles';
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
          Register New Vehicle
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8">
        {/* Vehicle Number */}
        <div>
          <label htmlFor="vehicleNumber" className="block mb-1 text-sm font-medium" style={{ color: ACCENT_COLOR }}>
            Vehicle Number *
          </label>
          <div className="flex items-center gap-3 rounded-lg p-3 border" style={{ borderColor: BORDER_COLOR, backgroundColor: INPUT_BG }}>
            <FileText className="text-[rgba(22,94,82,0.8)]" size={24} />
            <input
              id="vehicleNumber"
              type="text"
              name="vehicleNumber"
              value={form.vehicleNumber}
              onChange={handleChange}
              placeholder="Vehicle Number (e.g., TRK-001)"
              required
              className="w-full bg-transparent focus:outline-none text-sm"
              style={{ color: ACCENT_COLOR }}
            />
          </div>
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
            Status
          </label>
          <div className="flex items-center gap-3 rounded-lg p-3 border" style={{ borderColor: BORDER_COLOR, backgroundColor: INPUT_BG }}>
            <Settings className="text-[rgba(22,94,82,0.8)]" size={24} />
            <select
              id="status"
              name="status"
              value={form.status}
              onChange={handleChange}
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
              disabled={loading}
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

        {/* Last Service Date */}
        <div>
          <label htmlFor="lastServiceDate" className="block mb-1 text-sm font-medium" style={{ color: ACCENT_COLOR }}>
            Last Service Date
          </label>
          <div
            className="flex items-center gap-3 rounded-lg p-3 border"
            style={{ borderColor: BORDER_COLOR, backgroundColor: INPUT_BG }}
          >
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

        {/* Vehicle Image */}
        <div>
          <label
            htmlFor="vehicleImage"
            className="block mb-1 text-sm font-medium"
            style={{ color: ACCENT_COLOR }}
          >
            Vehicle Image
          </label>
          <div
            className="rounded-lg p-3 border"
            style={{ borderColor: BORDER_COLOR, backgroundColor: INPUT_BG }}
          >
            <label
              className="flex items-center gap-2 text-sm font-medium cursor-pointer"
              style={{ color: ACCENT_COLOR }}
            >
              <Camera className="text-[rgba(22,94,82,0.8)]" size={20} />
              Upload Vehicle Image
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
              <p
                className="mt-1 text-sm text-green-600 flex items-center gap-1"
                style={{ color: "#165E52" }}
              >
                <CheckCircle size={14} />
                Image uploaded
              </p>
            )}
          </div>
        </div>

        {/* Submit Button full width */}
        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-[#01251F] hover:bg-[#164d44] disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold text-lg py-3 flex items-center justify-center gap-2 shadow-lg transition-colors"
          >
            {submitting ? (
              <>
                <Loader className="animate-spin" size={20} />
                Registering...
              </>
            ) : (
              <>
                <Truck size={20} />
                Register Vehicle
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
