import React, { useState } from "react";
import {
  Truck,
  FileText,
  Package,
  Settings,
  UserCircle,
  Calendar,
  Camera,
  CheckCircle,
} from "lucide-react";

// Design Tokens from previous form
const ACCENT_COLOR = "#165E52"; // used for labels/text
const BORDER_COLOR = "#cfece6"; // border color
const BTN_COLOR = "#01251F"; // button bg color
const HEADER_BG = "#e1f4ef"; // header/footer bg
const INPUT_BG = "#ffffff";

// Dummy data for vehicle types and drivers (replace with real data)
const vehicleTypes = [
  { value: "truck", label: "Truck" },
  { value: "van", label: "Van" },
  { value: "lorry", label: "Lorry" },
];
const statusOptions = [
  { value: "Available", label: "Available" },
  { value: "Unavailable", label: "Unavailable" },
];
const drivers = [
  { value: "", label: "Select Driver" },
  { value: "1", label: "Nimal Perera" },
  { value: "2", label: "Kamal Silva" },
];

export default function AddVehicle() {
  const [form, setForm] = useState({
    vehicleNumber: "",
    vehicleType: "",
    capacity: "",
    status: "Available",
    assignedDriver: "",
    lastServiceDate: "",
    vehicleImage: null,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "vehicleImage") {
      setForm({ ...form, vehicleImage: files[0] });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(
      "Vehicle registered successfully!\n" +
        JSON.stringify(
          {
            ...form,
            vehicleImage: form.vehicleImage
              ? form.vehicleImage.name
              : "No image",
          },
          null,
          2
        )
    );
  };

  return (
    <div
      className="max-w-4xl mx-auto my-10 rounded-2xl border shadow-2xl overflow-hidden bg-white"
      style={{ borderColor: BORDER_COLOR }}
    >
      {/* Header */}
      <div
        className="px-8 py-6 border-b"
        style={{ backgroundColor: HEADER_BG, borderColor: BORDER_COLOR }}
      >
        <h2 className="text-2xl font-semibold" style={{ color: ACCENT_COLOR }}>
          Register New Vehicle
        </h2>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8"
      >
        {/* Vehicle Number */}
        <div>
          <label
            htmlFor="vehicleNumber"
            className="block mb-1 text-sm font-medium"
            style={{ color: ACCENT_COLOR }}
          >
            Vehicle Number
          </label>
          <div
            className="flex items-center gap-3 rounded-lg p-3 border"
            style={{ borderColor: BORDER_COLOR, backgroundColor: INPUT_BG }}
          >
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
          <label
            htmlFor="vehicleType"
            className="block mb-1 text-sm font-medium"
            style={{ color: ACCENT_COLOR }}
          >
            Vehicle Type
          </label>
          <div
            className="flex items-center gap-3 rounded-lg p-3 border"
            style={{ borderColor: BORDER_COLOR, backgroundColor: INPUT_BG }}
          >
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
              <option value="" disabled>
                Choose vehicle type
              </option>
              {vehicleTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Capacity */}
        <div>
          <label
            htmlFor="capacity"
            className="block mb-1 text-sm font-medium"
            style={{ color: ACCENT_COLOR }}
          >
            Capacity
          </label>
          <div
            className="flex items-center gap-3 rounded-lg p-3 border"
            style={{ borderColor: BORDER_COLOR, backgroundColor: INPUT_BG }}
          >
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
          <label
            htmlFor="status"
            className="block mb-1 text-sm font-medium"
            style={{ color: ACCENT_COLOR }}
          >
            Status
          </label>
          <div
            className="flex items-center gap-3 rounded-lg p-3 border"
            style={{ borderColor: BORDER_COLOR, backgroundColor: INPUT_BG }}
          >
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
          <label
            htmlFor="assignedDriver"
            className="block mb-1 text-sm font-medium"
            style={{ color: ACCENT_COLOR }}
          >
            Assigned Driver
          </label>
          <div
            className="flex items-center gap-3 rounded-lg p-3 border"
            style={{ borderColor: BORDER_COLOR, backgroundColor: INPUT_BG }}
          >
            <UserCircle className="text-[rgba(22,94,82,0.8)]" size={24} />
            <select
              id="assignedDriver"
              name="assignedDriver"
              value={form.assignedDriver}
              onChange={handleChange}
              className="w-full bg-transparent focus:outline-none text-sm"
              style={{ color: ACCENT_COLOR }}
            >
              {drivers.map((driver) => (
                <option key={driver.value} value={driver.value}>
                  {driver.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Last Service Date */}
        <div>
          <label
            htmlFor="lastServiceDate"
            className="block mb-1 text-sm font-medium"
            style={{ color: ACCENT_COLOR }}
          >
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
              required
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
                {form.vehicleImage.name}
              </p>
            )}
          </div>
        </div>

        {/* Submit Button full width */}
        <div className="md:col-span-2">
          <button
            type="submit"
            className="w-full rounded-lg bg-[#01251F] hover:bg-[#164d44] text-white font-semibold text-lg py-3 flex items-center justify-center gap-2 shadow-lg transition-colors"
          >
            <Truck size={20} />
            Register Vehicle
          </button>
        </div>
      </form>
    </div>
  );
}
