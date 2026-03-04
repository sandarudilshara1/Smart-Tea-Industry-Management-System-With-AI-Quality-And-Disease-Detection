import React, { useState } from "react";
import {
  UserCircle,
  AlertTriangle,
  CheckCircle2,
  Search,
  Plus,
   Truck, // <-- Add this line
} from "lucide-react";

const ACCENT_COLOR = "#165E52"; // Title & highlights
const BUTTON_COLOR = "#172526"; // Buttons

const allVehicles = [
  {
    id: "TRK-001",
    type: "Lorry",
    model: "Tata Ace",
    status: "Available",
    driver: "Mr. Silva",
  },
  {
    id: "TRK-002",
    type: "Pickup Truck",
    model: "Tata Ace",
    status: "In Use",
    driver: "Mr. Perera",
  },
  {
    id: "TRK-003",
    type: "Lorry",
    model: "Tata Ace",
    status: "Maintenance",
    driver: null,
  },
  {
    id: "TRK-004",
    type: "Pickup Truck",
    model: "Tata Ace",
    status: "Available",
    driver: "Mr. Kumar",
  },
  {
    id: "TRK-005",
    type: "Lorry",
    model: "Tata Ace",
    status: "Available",
    driver: "Mr. Fernando",
  },
];

const breakdownVehicles = [
  {
    id: "TRK-002",
    type: "Pickup Truck",
    model: "Tata Ace",
    driver: "Mr. Perera",
    route: "Galle - Neluwa",
    breakdownTime: "2025-07-02 10:30",
  },
  {
    id: "TRK-006",
    type: "Lorry",
    model: "Tata Ace",
    driver: "Mr. Jayasuriya",
    route: "Matara - Neluwa",
    breakdownTime: "2025-07-02 11:15",
  },
];

export default function Emergency() {
  const [searchTerm, setSearchTerm] = useState("");
  const [assignments, setAssignments] = useState({});

  const availableVehicles = allVehicles.filter((v) => v.status === "Available");

  const filteredAvailable = availableVehicles.filter(
    (v) =>
      v.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.driver?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isAssigned = (vehicleId) =>
    Object.values(assignments).includes(vehicleId);

  function handleAssign(brokenId, replacementId) {
    setAssignments((prev) => ({
      ...prev,
      [brokenId]: replacementId,
    }));
  }

  function handleConfirm() {
    alert("Assignments confirmed:\n" + JSON.stringify(assignments, null, 2));
  }

  const allAssigned =
    Object.keys(assignments).length === breakdownVehicles.length;

  return (
    <div className="min-h-screen bg-[#f8fdfc] p-6">
      {/* Header */}
      <div className="bg-white shadow-md border-b border-gray-200 mb-8">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
          <div className="flex items-center gap-3">
       
            <h1 className="text-3xl font-bold" style={{ color: ACCENT_COLOR }}>
              Emergency Vehicle Replacement
            </h1>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-sm border border-[#cfece6] p-4 flex flex-col md:flex-row justify-between gap-4 mb-6">
        <div className="relative w-full md:w-72">
          <input
            type="text"
            placeholder="Search available vehicles or drivers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-4 pr-10 py-2 text-sm border border-[#cfece6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#165E52] focus:border-transparent bg-[#f8fdfc] text-[#165E52]"
            autoComplete="off"
          />
          <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
        </div>
      </div>

      {/* Assign Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {breakdownVehicles.map((broken) => (
          <div
            key={broken.id}
            className="bg-white rounded-xl shadow-md p-6 flex flex-col gap-5 border border-[#cfece6] transition hover:shadow-lg hover:border-[#a9d5c6]"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Truck className="text-[#000000] w-8 h-8" />

                <div>
                  <h2 className="font-bold text-lg text-[#000000]">
                    {broken.id} - {broken.model}
                  </h2>
                  <p className="text-sm text-[##000000] opacity-70">
                    {broken.type}
                  </p>
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="text-[#000000] space-y-1 text-sm font-medium">
              <p>
                <span className="font-semibold">Driver:</span> {broken.driver}
              </p>
              <p>
                <span className="font-semibold">Route:</span> {broken.route}
              </p>
              <p>
                <span className="font-semibold">Breakdown:</span>{" "}
                {broken.breakdownTime}
              </p>
            </div>

            {/* Selector */}
            <div>
              <label className="block text-sm font-semibold text-[#000000] mb-1">
                Assign Replacement Vehicle
              </label>
              <select
                className="w-full border rounded-lg px-3 py-2 bg-[#f8fdfc] border-[#cfece6] focus:outline-none focus:ring-2 focus:ring-[#165E52]"
                value={assignments[broken.id] || ""}
                onChange={(e) => handleAssign(broken.id, e.target.value)}
              >
                <option value="">-- Select Vehicle --</option>
                {filteredAvailable.map((v) => (
                  <option
                    key={v.id}
                    value={v.id}
                    disabled={
                      isAssigned(v.id) && assignments[broken.id] !== v.id
                    }
                  >
                    {v.id} - {v.driver || "No Driver"} ({v.type})
                  </option>
                ))}
              </select>
            </div>

            {/* Confirm Button */}
            <div>
              <button
                onClick={handleConfirm}
                disabled={!allAssigned}
                className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold text-white text-sm transition-colors duration-200 ${
                  allAssigned
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-[#172526] cursor-not-allowed"
                }`}
              >
                <CheckCircle2 size={18} />
                Confirm Assignments
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
