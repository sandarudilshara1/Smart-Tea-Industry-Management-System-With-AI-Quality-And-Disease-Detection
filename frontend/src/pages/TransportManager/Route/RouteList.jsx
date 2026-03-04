import React, { useState } from "react";
import {
  Users,
  Truck,
  Clock,
  Map,
  Edit2,
  UserCircle,
  Search,
  Plus,
  X,
} from "lucide-react";

// Design Tokens
const ACCENT_COLOR = "#165E52"; // Title & highlights
const BUTTON_COLOR = "#172526"; // Buttons
const BORDER_COLOR = "#cfece6";
const HEADER_BG = "#e1f4ef";

const routes = [
  {
    id: "RT-001",
    routeName: "Neluwa – Deniyaya",
    status: "Ongoing",
    driver: "Mr.Perera",
    distance: "25 Km",
    estTime: "1.5h",
    suppliers: 15,
    supply: "520 Kg",
  },
  {
    id: "RT-002",
    routeName: "Neluwa – Lankagama",
    status: "Scheduled",
    driver: "Mr.Kamal",
    distance: "18 Km",
    estTime: "1h",
    suppliers: 12,
    supply: "450 Kg",
  },
  {
    id: "RT-003",
    routeName: "Neluwa – Pitadeniya",
    status: "Completed",
    driver: null,
    distance: "20 Km",
    estTime: "1.2h",
    suppliers: 10,
    supply: "480 Kg",
  },
  {
    id: "RT-004",
    routeName: "Neluwa – Hiniduma",
    status: "Ongoing",
    driver: "Mr.Perera",
    distance: "22 Km",
    estTime: "1.3h",
    suppliers: 14,
    supply: "500 Kg",
  },
  {
    id: "RT-005",
    routeName: "Neluwa – Morawaka",
    status: "Completed",
    driver: "Mr.Kamal",
    distance: "30 Km",
    estTime: "2h",
    suppliers: 16,
    supply: "600 Kg",
  },
  {
    id: "RT-006",
    routeName: "Neluwa – Thawalama",
    status: "Scheduled",
    driver: "Mr.Kamal",
    distance: "19 Km",
    estTime: "1.1h",
    suppliers: 13,
    supply: "470 Kg",
  },
];

// Status badge styles
const statusStyles = {
  Ongoing: "bg-[#e1f4ef] text-[#165E52] border border-[#cfece6]",
  Scheduled: "bg-yellow-100 text-yellow-700 border border-yellow-300",
  Completed: "bg-blue-100 text-blue-700 border border-blue-300",
};

// Dummy driver list for CreateRoutePage
const driversList = [
  {
    id: "1",
    name: "Nimal Perera",
    phone: "0711234567",
    type: "inhouse-driver",
  },
  {
    id: "2",
    name: "Kamal Silva",
    phone: "0779876543",
    type: "inhouse-driver",
  },
];

// CreateRoutePage component as modal content
function CreateRoutePage({ onCancel }) {
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const cleared =
        name === "driverType"
          ? { assignedDriver: "", assignedVehicle: "" }
          : {};
      return { ...prev, [name]: value, ...cleared };
    });
  };

  return (
    <div
      className="flex flex-col w-[540px] max-w-[95vw] rounded-2xl border shadow-2xl overflow-hidden mx-auto bg-white"
      style={{ borderColor: BORDER_COLOR }}
    >
      {/* Header */}
      <div
        className="p-5 flex justify-between items-center border-b"
        style={{ backgroundColor: HEADER_BG, borderColor: BORDER_COLOR }}
      >
        <h2 className="text-lg font-semibold" style={{ color: ACCENT_COLOR }}>
          Create New Route
        </h2>

        {onCancel && (
          <button
            onClick={onCancel}
            className="p-1 rounded hover:bg-[#dff4ef]"
            style={{ color: ACCENT_COLOR }}
            aria-label="Close"
            type="button"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Form content */}
      <form className="p-6 space-y-3" style={{ marginBottom: 0 }}>
        {/* Route Name */}
        <div>
          <label
            className="block mb-1 text-sm font-medium"
            style={{ color: ACCENT_COLOR }}
          >
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

        {/* Start & End Location */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              className="block mb-1 text-sm font-medium"
              style={{ color: ACCENT_COLOR }}
            >
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
          <div>
            <label
              className="block mb-1 text-sm font-medium"
              style={{ color: ACCENT_COLOR }}
            >
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
        </div>

        {/* Distance & Estimated Time */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              className="block mb-1 text-sm font-medium"
              style={{ color: ACCENT_COLOR }}
            >
              Distance (km)
            </label>
            <input
              type="number"
              name="distance"
              value={formData.distance}
              onChange={handleChange}
              placeholder="e.g., 120"
              className="w-full border rounded-lg px-4 py-2 text-sm"
              style={{
                borderColor: BORDER_COLOR,
                background: "#f0faf7",
                color: ACCENT_COLOR,
              }}
            />
          </div>
          <div>
            <label
              className="block mb-1 text-sm font-medium"
              style={{ color: ACCENT_COLOR }}
            >
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
        </div>

        {/* Driver Type */}
        <div>
          <label
            className="block mb-1 text-sm font-medium"
            style={{ color: ACCENT_COLOR }}
          >
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

        {/* Inhouse driver fields */}
        {formData.driverType === "inhouse" && (
          <>
            <div style={{ marginBottom: "0.5rem" }}>
              <label
                className="block mb-1 text-sm font-medium"
                style={{ color: ACCENT_COLOR }}
              >
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
                {driversList.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} - {d.phone}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                className="block mb-1 text-sm font-medium"
                style={{ color: ACCENT_COLOR }}
              >
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
        className="p-4 flex justify-end gap-3 border-t"
        style={{
          backgroundColor: HEADER_BG,
          borderColor: BORDER_COLOR,
          marginTop: 0,
        }}
      >
        <button
          onClick={onCancel}
          className="px-6 py-2 rounded-lg text-sm font-medium"
          style={{
            background: "transparent",
            color: ACCENT_COLOR,
            border: `2px solid ${BORDER_COLOR}`,
          }}
          type="button"
        >
          Cancel
        </button>
        <button
          onClick={() => {
            console.log("Form submitted:", formData);
            alert("Route created! (This is a demo alert)");
          }}
          className="px-6 py-2 rounded-lg text-sm font-medium text-white"
          style={{ backgroundColor: BUTTON_COLOR }}
          type="button"
        >
          Submit
        </button>
      </div>
    </div>
  );
}

export default function RouteDashboard() {
  const [filter, setFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);

  const filteredRoutes = routes.filter((r) => {
    if (filter !== "All" && r.status !== filter) return false;
    if (
      searchTerm &&
      !(
        r.routeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.driver?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        r.id.toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
      return false;
    return true;
  });

  return (
    <div className="min-h-screen p-6 bg-[#f8fdfc]">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white shadow-md border-b border-gray-200 rounded-lg">
          <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <h2 className="text-3xl font-bold" style={{ color: ACCENT_COLOR }}>
              Route Management
            </h2>
            <button
              onClick={() => setShowCreateModal(true)}
              className="text-white font-semibold py-2.5 px-6 rounded-lg shadow-md flex items-center gap-2 transition-colors duration-200"
              style={{ backgroundColor: BUTTON_COLOR }}
              aria-label="Add route"
              type="button"
            >
              <Plus size={20} />
              Add Route
            </button>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white p-5 rounded-lg shadow-sm border border-[#cfece6] flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-1/2">
            <input
              type="text"
              placeholder="Search by route/driver"
              className="w-full pl-4 pr-10 py-2 text-sm border border-[#cfece6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#165E52] focus:border-transparent bg-[#f8fdfc] text-[#165E52]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search routes"
            />
            <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
          </div>
          <select
            className="w-full md:w-auto px-4 py-2 text-sm rounded-lg border border-[#cfece6] bg-[#f8fdfc] focus:outline-none focus:ring-2 focus:ring-[#165E52]"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            aria-label="Filter routes by status"
          >
            <option>All</option>
            <option>Ongoing</option>
            <option>Scheduled</option>
            <option>Completed</option>
          </select>
        </div>

        {/* Route Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRoutes.length === 0 && (
            <div className="col-span-full text-center py-20 text-gray-500 text-lg">
              No routes found.
            </div>
          )}

          {filteredRoutes.map((route) => (
            <div
              key={route.id}
              className="bg-white border border-black rounded-lg shadow-md p-6 flex flex-col relative min-h-[230px] transition hover:shadow-lg hover:border-black"
            >
              {/* Status Badge */}
              <span
                className={`absolute right-5 top-5 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${
                  statusStyles[route.status] || ""
                }`}
              >
                {route.status}
              </span>

              {/* Route Info */}
              <div className="mb-2">
                <h3 className="text-lg font-semibold text-black">
                  {route.routeName}
                </h3>
                <p className="text-sm text-gray-600">Route - {route.id}</p>
              </div>

              {/* Route Meta */}
              <div className="flex flex-col gap-3 text-gray-700 text-sm mb-5">
                <div className="flex items-center gap-2">
                  <Map size={18} className="text-[#165E52]" />
                  <span>Distance</span>
                  <span className="ml-auto font-semibold">
                    {route.distance}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={18} className="text-[#165E52]" />
                  <span>Est. time</span>
                  <span className="ml-auto font-semibold">{route.estTime}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users size={18} className="text-[#165E52]" />
                  <span>Suppliers</span>
                  <span className="ml-auto font-semibold">
                    {route.suppliers}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck size={18} className="text-[#165E52]" />
                  <span>Est. supply</span>
                  <span className="ml-auto font-semibold">{route.supply}</span>
                </div>
              </div>

              {/* Driver & Actions */}
              <div className="flex items-center gap-3 mt-auto pt-3 border-t border-gray-200">
                <UserCircle className="text-gray-400" size={22} />
                <span className="text-sm font-medium text-gray-700">
                  Driver:{" "}
                  {route.driver ? (
                    route.driver
                  ) : (
                    <span className="italic text-gray-400">N/A</span>
                  )}
                </span>
                {route.status === "Ongoing" && (
                  <button className="ml-4 px-3 py-1 bg-[#172526] text-white rounded text-xs font-semibold hover:bg-[#134632] transition">
                    Track
                  </button>
                )}
                <button
                  className="ml-auto hover:bg-[#e1f4ef] p-2 rounded transition"
                  title="Edit Route"
                  aria-label={`Edit route ${route.id}`}
                  type="button"
                >
                  <Edit2 className="text-[#165E52]" size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Route Modal */}
      {showCreateModal && (
        <div
          className="fixed inset-0 bg-gray bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-route-title"
        >
          <CreateRoutePage onCancel={() => setShowCreateModal(false)} />
        </div>
      )}
    </div>
  );
}
