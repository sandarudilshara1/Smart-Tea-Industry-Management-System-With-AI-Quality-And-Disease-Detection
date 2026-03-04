import React, { useEffect, useState } from "react";
import { X } from "lucide-react";

// Design Tokens
const ACCENT_COLOR = "#165E52";
const BTN_COLOR = "#01251F";
const BORDER_COLOR = "#cfece6";
const HEADER_BG = "#e1f4ef";
const MODAL_BG = "#ffffff";

// Dummy driver list (REPLACE with prop if needed)
const drivers = [
  { id: "1", name: "Nimal Perera", phone: "0711234567", type: "inhouse-driver" },
  { id: "2", name: "Kamal Silva", phone: "0779876543", type: "inhouse-driver" },
];

export default function RouteModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    routeName: "",
    startLocation: "",
    endLocation: "",
    distance: "",
    estimatedTime: "",
    driverType: "inhouse",
    assignedDriver: "",
    assignedVehicle: "",
  });

  // Prevent background scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";
    return () => (document.body.style.overflow = "unset");
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const cleared = name === "driverType" ? { assignedDriver: "", assignedVehicle: "" } : {};
      return { ...prev, [name]: value, ...cleared };
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      {/* Modal Container */}
      <div
        className="rounded-2xl border shadow-2xl flex flex-col w-[540px] h-[700px] overflow-hidden max-w-[95vw] max-h-[95vh]"
        style={{ backgroundColor: MODAL_BG, borderColor: BORDER_COLOR }}
      >
        {/* Header */}
        <div
          className="p-5 flex justify-between items-center border-b"
          style={{ backgroundColor: HEADER_BG, borderColor: BORDER_COLOR }}
        >
          <h2 className="text-lg font-semibold" style={{ color: ACCENT_COLOR }}>
            Create New Route
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-[#dff4ef]"
            style={{ color: ACCENT_COLOR }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Form Area */}
        <form className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Route Name */}
          <div>
            <label className="block mb-1 text-sm font-medium" style={{ color: ACCENT_COLOR }}>
              Route Name
            </label>
            <input
              type="text"
              name="routeName"
              value={formData.routeName}
              onChange={handleChange}
              placeholder="e.g., Colombo - Kandy"
              className="w-full border rounded-lg px-4 py-2 text-sm"
              style={{ borderColor: BORDER_COLOR }}
            />
          </div>

          {/* Start Location */}
          <div>
            <label className="block mb-1 text-sm font-medium" style={{ color: ACCENT_COLOR }}>
              Start Location
            </label>
            <input
              type="text"
              name="startLocation"
              value={formData.startLocation}
              onChange={handleChange}
              placeholder="e.g., Colombo"
              className="w-full border rounded-lg px-4 py-2 text-sm"
              style={{ borderColor: BORDER_COLOR }}
            />
          </div>

          {/* End Location */}
          <div>
            <label className="block mb-1 text-sm font-medium" style={{ color: ACCENT_COLOR }}>
              End Location
            </label>
            <input
              type="text"
              name="endLocation"
              value={formData.endLocation}
              onChange={handleChange}
              placeholder="e.g., Kandy"
              className="w-full border rounded-lg px-4 py-2 text-sm"
              style={{ borderColor: BORDER_COLOR }}
            />
          </div>

          {/* Distance */}
          <div>
            <label className="block mb-1 text-sm font-medium" style={{ color: ACCENT_COLOR }}>
              Distance (km)
            </label>
            <input
              type="number"
              name="distance"
              value={formData.distance}
              onChange={handleChange}
              placeholder="e.g., 120"
              className="w-full border rounded-lg px-4 py-2 text-sm"
              style={{ borderColor: BORDER_COLOR, background: "#f0faf7", color: ACCENT_COLOR }}
            />
          </div>

          {/* Estimated Time */}
          <div>
            <label className="block mb-1 text-sm font-medium" style={{ color: ACCENT_COLOR }}>
              Estimated Time
            </label>
            <input
              type="text"
              name="estimatedTime"
              value={formData.estimatedTime}
              onChange={handleChange}
              placeholder="e.g., 3.5 hours"
              className="w-full border rounded-lg px-4 py-2 text-sm"
              style={{ borderColor: BORDER_COLOR }}
            />
          </div>

          {/* Driver Type */}
          <div>
            <label className="block mb-1 text-sm font-medium" style={{ color: ACCENT_COLOR }}>
              Driver Type
            </label>
            <select
              name="driverType"
              value={formData.driverType}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-2 text-sm bg-white"
              style={{ borderColor: BORDER_COLOR }}
            >
              <option value="inhouse">Inhouse Driver</option>
              <option value="private">Private Driver</option>
            </select>
          </div>

          {/* Only Visible When Driver Type is Inhouse */}
          {formData.driverType === "inhouse" && (
            <>
              {/* Assigned Inhouse Driver */}
              <div>
                <label className="block mb-1 text-sm font-medium" style={{ color: ACCENT_COLOR }}>
                  Assigned Inhouse Driver
                </label>
                <select
                  name="assignedDriver"
                  value={formData.assignedDriver}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-4 py-2 text-sm bg-white"
                  style={{ borderColor: BORDER_COLOR }}
                >
                  <option value="">Select Driver</option>
                  {drivers.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} - {d.phone}
                    </option>
                  ))}
                </select>
              </div>

              {/* Assigned Inhouse Vehicle */}
              <div>
                <label className="block mb-1 text-sm font-medium" style={{ color: ACCENT_COLOR }}>
                  Assigned Inhouse Vehicle
                </label>
                <input
                  type="text"
                  name="assignedVehicle"
                  value={formData.assignedVehicle}
                  onChange={handleChange}
                  placeholder="e.g., AB-1234"
                  className="w-full border rounded-lg px-4 py-2 text-sm"
                  style={{ borderColor: BORDER_COLOR }}
                />
              </div>
            </>
          )}
        </form>

        {/* Footer */}
        <div
          className="p-4 mt-auto flex justify-end gap-3 border-t"
          style={{ backgroundColor: HEADER_BG, borderColor: BORDER_COLOR }}
        >
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg text-sm font-medium"
            style={{
              background: "transparent",
              color: ACCENT_COLOR,
              border: `2px solid ${BORDER_COLOR}`,
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => {
              console.log("Form submitted:", formData);
              onClose();
            }}
            className="px-6 py-2 rounded-lg text-sm font-medium text-white"
            style={{ backgroundColor: BTN_COLOR }}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
