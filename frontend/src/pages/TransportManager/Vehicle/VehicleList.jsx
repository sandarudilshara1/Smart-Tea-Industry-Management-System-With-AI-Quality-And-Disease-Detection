import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Truck,
  CheckCircle2,
  Wrench,
  Eye,
  Edit,
  Trash2,
  UserCircle,
  Plus,
} from "lucide-react";

const ACCENT_COLOR = "#165E52"; // Title & highlights
const BUTTON_COLOR = "#172526"; // Buttons

const initialVehicles = [
  {
    id: "TRK-001",
    model: "Tata Ace",
    status: "Available",
    driver: null,
    lastService: "2024-03-15",
    capacity: "200kg",
  },
  {
    id: "TRK-002",
    model: "Tata Ace",
    status: "In Use",
    driver: "Mr.Perera",
    lastService: "2024-06-15",
    capacity: "500kg",
  },
  {
    id: "TRK-003",
    model: "Tata Ace",
    status: "Maintenance",
    driver: null,
    lastService: "2023-06-15",
    capacity: "500kg",
  },
  {
    id: "TRK-004",
    model: "Tata Ace",
    status: "In Use",
    driver: "Mr.Perera",
    lastService: "2024-06-15",
    capacity: "500kg",
  },
];

const statusColors = {
  Available: "bg-[#e1f4ef] text-[#165E52]",
  "In Use": "bg-yellow-100 text-yellow-800",
  Maintenance: "bg-red-100 text-red-700",
};

function VehicleHeader({ onAddVehicle }) {
  return (
    <div className="bg-white shadow-md border-b border-gray-200 mb-8">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
          {/* Title Section */}
          <div>
            <h1 className="text-3xl font-bold" style={{ color: ACCENT_COLOR }}>
              Vehicle Management
            </h1>
          </div>

          {/* Action Button */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <button
              onClick={onAddVehicle}
              className="text-white font-semibold py-2.5 px-5 rounded-lg shadow-md transition-colors duration-200 flex items-center gap-2"
              style={{ backgroundColor: BUTTON_COLOR }}
            >
              <Plus size={20} />
              New Vehicle
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function VehicleSummaryCards({ summary }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      {/* Total Vehicles Card */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-black transition-all duration-200 hover:shadow-lg hover:border-black">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-black">Total Vehicles</p>
            <p className="text-2xl font-bold text-black">
              {summary.total || 0}
            </p>
            <p className="text-xs text-neutral-700">
              {summary.available || 0} available
            </p>
          </div>
          <div className="h-12 w-12 bg-neutral-100 rounded-full flex items-center justify-center">
            <Truck className="w-6 h-6 text-black" />
          </div>
        </div>
      </div>

      {/* Available Vehicles Card */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-black transition-all duration-200 hover:shadow-lg hover:border-black">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-black">Available</p>
            <p className="text-2xl font-bold text-black">
              {summary.available || 0}
            </p>
            <p className="text-xs text-neutral-700">Ready to use</p>
          </div>
          <div className="h-12 w-12 bg-neutral-100 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6 text-black" />
          </div>
        </div>
      </div>

      {/* Maintenance Vehicles Card */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-black transition-all duration-200 hover:shadow-lg hover:border-black">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-black">Maintenance</p>
            <p className="text-2xl font-bold text-black">
              {summary.maintenance || 0}
            </p>
            <p className="text-xs text-neutral-700">Under repair</p>
          </div>
          <div className="h-12 w-12 bg-neutral-100 rounded-full flex items-center justify-center">
            <Wrench className="w-6 h-6 text-black" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Vehicle() {
  const [vehicles, setVehicles] = useState(initialVehicles);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filteredVehicles, setFilteredVehicles] = useState(initialVehicles);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState(null);
  const navigate = useNavigate();

  React.useEffect(() => {
    let filtered = vehicles;
    if (filterStatus !== "All") {
      filtered = filtered.filter((v) => v.status === filterStatus);
    }
    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (v) =>
          v.id.toLowerCase().includes(term) ||
          v.model.toLowerCase().includes(term)
      );
    }
    setFilteredVehicles(filtered);
  }, [searchTerm, filterStatus, vehicles]);

  const confirmDelete = () => {
    setVehicles((prev) => prev.filter((v) => v.id !== vehicleToDelete));
    setConfirmModalOpen(false);
    setVehicleToDelete(null);
  };

  const cancelDelete = () => {
    setConfirmModalOpen(false);
    setVehicleToDelete(null);
  };

  // Stats Calculation
  const vehicleStats = {
    total: vehicles.length,
    available: vehicles.filter((v) => v.status === "Available").length,
    inUse: vehicles.filter((v) => v.status === "In Use").length,
    maintenance: vehicles.filter((v) => v.status === "Maintenance").length,
  };

  return (
    <div className="min-h-screen bg-[#f8fdfc] p-6">
      <VehicleHeader
        onAddVehicle={() => navigate("/transportManager/Vehicle/add")}
      />

      <VehicleSummaryCards
        summary={{
          total: vehicleStats.total,
          available: vehicleStats.available,
          maintenance: vehicleStats.maintenance,
        }}
      />

      {/* Search & Filter */}
      <div className="bg-white rounded-lg shadow-sm border border-[#cfece6] p-5 flex flex-col md:flex-row justify-between gap-4 mb-6">
        <input
          type="text"
          placeholder="Search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-56 pl-4 pr-10 py-2 text-sm border border-[#cfece6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#165E52] focus:border-transparent bg-[#f8fdfc] text-[#165E52]"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="w-full md:w-auto px-4 py-2 text-sm rounded-lg border border-[#cfece6] focus:outline-none focus:ring-2 focus:ring-[#165E52] bg-[#f8fdfc] text-[#165E52]"
        >
          <option>All</option>
          <option>Available</option>
          <option>In Use</option>
          <option>Maintenance</option>
        </select>
      </div>

      {/* Vehicles Table */}
      <div className="bg-white rounded-lg shadow-sm border border-[#cfece6] overflow-x-auto">
        <div className="bg-[#01251F] text-white">
          <div className="grid grid-cols-7 gap-4 p-4 font-medium text-center text-sm">
            <div>Vehicle</div>
            <div>Status</div>
            <div>Driver</div>
            <div>Capacity</div>
            <div>Last Service</div>
            <div className="col-span-2">Actions</div>
          </div>
        </div>

        <div className="divide-y divide-[#cfece6]">
          {filteredVehicles.length === 0 ? (
            <div className="p-8 text-center text-[#165E52] opacity-80">
              No vehicles found.
            </div>
          ) : (
            filteredVehicles.map((v, idx) => (
              <div
                key={v.id}
                className={`grid grid-cols-7 gap-4 p-4 items-center ${
                  idx % 2 === 0 ? "bg-white" : "bg-[#f8fdfc]"
                } hover:bg-[#e1f4ef] transition-colors`}
              >
                <div className="flex items-center gap-2 justify-center text-[#165E52] font-semibold text-lg">
                  {/* <span
                    role="img"
                    aria-label="Truck"
                    className="rounded-full bg-[#e1f4ef] p-1 text-2xl"
                  >
                    🚛
                  </span> */}
                  <div>
                    <div>{v.id}</div>
                    <div className="text-xs text-[#165E52] opacity-70">
                      {v.model}
                    </div>
                  </div>
                </div>

                <div
                  className={`font-semibold text-center text-[#165E52] rounded-2xl ${
                    statusColors[v.status] ||
                    "text-gray-500 bg-transparent rounded-full px-2 py-1 text-xs"
                  }`}
                >
                  {v.status}
                </div>

                <div className="text-[#165E52] text-center">
                  {v.driver ? (
                    <span className="flex items-center justify-center gap-2 text-[#165E52] opacity-90">
                      <UserCircle size={20} />
                      {v.driver}
                    </span>
                  ) : (
                    <span className="italic text-gray-400">-</span>
                  )}
                </div>

                <div className="text-[#165E52] text-center">{v.capacity}</div>
                <div className="text-[#165E52] text-center">
                  {v.lastService}
                </div>

                <div className="flex justify-center gap-3 col-span-2">
                  <button
                    onClick={() =>
                      navigate(`/transportManager/Vehicle/view/${v.id}`)
                    }
                    className="p-2 rounded-full text-[#165E52] hover:bg-[#e1f4ef] hover:text-[#01251F] transition-colors"
                    title="View"
                  >
                    <Eye size={18} />
                  </button>
                  <button
                    onClick={() =>
                      navigate(`/transportManager/vehicle/edit/${v.id}`)
                    }
                    className="p-2 rounded-full text-yellow-700 hover:bg-yellow-100 hover:text-yellow-900 transition-colors"
                    title="Edit"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => {
                      setVehicleToDelete(v.id);
                      setConfirmModalOpen(true);
                    }}
                    className="p-2 rounded-full text-red-700 hover:bg-red-100 hover:text-red-900 transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {confirmModalOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-30 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl border border-[#cfece6] max-w-sm w-full p-6 text-center">
            <h3
              className="text-xl font-semibold mb-4"
              style={{ color: ACCENT_COLOR }}
            >
              Confirm Deletion
            </h3>
            <p className="mb-6 text-[#165E52] opacity-80">
              Are you sure you want to remove this vehicle?
            </p>
            <div className="flex justify-center gap-6">
              <button
                onClick={cancelDelete}
                className="px-6 py-2 rounded-lg border border-[#cfece6] text-[#165E52] hover:bg-[#e1f4ef] font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-6 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 font-semibold transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
