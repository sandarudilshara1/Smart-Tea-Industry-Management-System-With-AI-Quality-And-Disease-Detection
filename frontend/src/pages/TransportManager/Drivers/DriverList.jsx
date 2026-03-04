import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserCircle, Eye, Search, Plus } from "lucide-react"; // Added Plus import

const ACCENT_COLOR = "#165E52"; // Title & highlights
const BUTTON_COLOR = "#172526"; // Buttons

const initialDrivers = [
  {
    id: "DRV-001",
    name: "Kasun Perera",
    email: "kasun.perera@example.com",
    type: "PRIVATE",
    assignedVehicle: "WP-AB-1234",
    phone: "0771234567",
    licenseNo: "B123456",
    nic: "881234567V",
  },
  {
    id: "DRV-002",
    name: "Nadeesha Silva",
    email: "nadeesha.silva@example.com",
    type: "PRIVATE",
    assignedVehicle: "TRK-002",
    phone: "0777654321",
    licenseNo: "C987654",
    nic: "992345678V",
  },
  {
    id: "DRV-003",
    name: "Saman Jayawardena",
    email: "saman.jayawardena@example.com",
    type: "INHOUSE",
    assignedVehicle: null,
    phone: "0761239874",
    licenseNo: "D123789",
    nic: "973462351V",
  },
  {
    id: "DRV-004",
    name: "Saman Jayawardena",
    email: "saman.jayawardena@example.com",
    type: "INHOUSE",
    assignedVehicle: null,
    phone: "0761239874",
    licenseNo: "D123789",
    nic: "973462351V",
  },
];

const typeColor = {
  INHOUSE: "bg-[#e1f4ef] text-[#165E52]",
  PRIVATE: "bg-yellow-100 text-yellow-800",
};

export default function DriversList() {
  const [drivers] = useState(initialDrivers);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [filteredDrivers, setFilteredDrivers] = useState(initialDrivers);
  const navigate = useNavigate();

  useEffect(() => {
    let filtered = drivers;

    if (filterType !== "All") {
      filtered = filtered.filter((d) => d.type === filterType);
    }
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (d) =>
          d.name.toLowerCase().includes(term) ||
          d.email.toLowerCase().includes(term) ||
          (d.assignedVehicle && d.assignedVehicle.toLowerCase().includes(term))
      );
    }
    setFilteredDrivers(filtered);
  }, [searchTerm, filterType, drivers]);

  return (
    <div className="bg-[#f8fdfc] py-6 px-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white shadow-md border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
              {/* Title Section */}
              <div>
                <h1
                  className="text-3xl font-bold"
                  style={{ color: ACCENT_COLOR }}
                >
                  Driver Management
                </h1>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <button
                  onClick={() => navigate("/transportManager/drivers/user")}
                  className="text-white font-semibold py-2.5 px-5 rounded-lg shadow-md transition-colors duration-200 flex items-center gap-2"
                  style={{ backgroundColor: BUTTON_COLOR }}
                >
                  <Plus size={20} />
                  Add Driver
                </button>

                <button
                  onClick={() => navigate("/transportManager/drivers/details")}
                  className="px-5 py-2.5 rounded-lg text-sm font-medium text-white transition-colors duration-200 bg-[#165E52]"
                >
                  View Pending Approvals
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-sm border border-[#cfece6] p-4 flex flex-col md:flex-row justify-between gap-4 mb-6">
          <div className="relative w-full md:w-72">
            <input
              type="text"
              placeholder="Search drivers"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-4 pr-10 py-2 text-sm border border-[#cfece6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#165E52] focus:border-transparent bg-[#f8fdfc] text-[#165E52]"
              autoComplete="off"
            />
            <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full md:w-auto px-4 py-2 text-sm rounded-lg border border-[#cfece6] focus:outline-none focus:ring-2 focus:ring-[#165E52] bg-[#f8fdfc] text-[#165E52]"
          >
            <option value="All">All Types</option>
            <option value="INHOUSE">INHOUSE</option>
            <option value="PRIVATE">PRIVATE</option>
          </select>
        </div>

        {/* Drivers Table */}
        <div className="bg-white rounded-lg shadow-sm border border-[#cfece6] overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-[#01251F] text-white">
                <th className="py-3 px-4 text-left">Driver</th>
                <th className="py-3 px-4 text-left">Email</th>
                <th className="py-3 px-4 text-left">Type</th>
                <th className="py-3 px-4 text-left">Assigned Vehicle</th>
                <th className="py-3 px-4 text-left">Phone</th>
                <th className="py-3 px-4 text-left">License No</th>
                <th className="py-3 px-4 text-left">NIC</th>
                <th className="py-3 px-4 text-left">View</th>
              </tr>
            </thead>
            <tbody>
              {filteredDrivers.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="text-center py-6 text-[#165E52] opacity-80"
                  >
                    No drivers found.
                  </td>
                </tr>
              ) : (
                filteredDrivers.map((d, idx) => (
                  <tr
                    key={d.id}
                    className={`border-b ${
                      idx % 2 === 0 ? "bg-white" : "bg-[#f8fdfc]"
                    } hover:bg-[#e1f4ef] transition-colors`}
                  >
                    <td className="py-3 px-4 flex items-center gap-3 text-[#01251F]">
                     
                      <div>
                        <div className="font-semibold">{d.name}</div>
                        <div className="text-xs text-[#165E52] opacity-70">
                          ID: {d.id}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-[#165E52]">{d.email}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`${
                          typeColor[d.type] || "text-gray-600"
                        } px-3 py-1 rounded-full text-xs font-medium`}
                        style={{
                          backgroundColor:
                            d.type === "INHOUSE"
                              ? "#e1f4ef"
                              : d.type === "PRIVATE"
                              ? "#fff7db"
                              : "transparent",
                        }}
                      >
                        {d.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[#165E52]">
                      {d.assignedVehicle || "-"}
                    </td>
                    <td className="py-3 px-4 text-[#165E52]">
                      {d.phone || "-"}
                    </td>
                    <td className="py-3 px-4 text-[#165E52]">
                      {d.licenseNo || "-"}
                    </td>
                    <td className="py-3 px-4 text-[#165E52]">{d.nic || "-"}</td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() =>
                          navigate(`/transportManager/driver/view/${d.id}`)
                        }
                        className="p-2 rounded-full text-[#165E52] hover:bg-[#e1f4ef] hover:text-[#01251F] transition-colors"
                        title="View Driver"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
