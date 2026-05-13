import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Search,
  Truck,
} from "lucide-react";

import { getAllVehicles } from "../../../api/vehicle";
import { assignEmergencyReplacement, getEmergencies, updateEmergencyStatus } from "../../../api/emergency";

const ACCENT_COLOR = "#165E52"; // Title & highlights
const BUTTON_COLOR = "#172526"; // Buttons

function formatWhen(value) {
  try {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleString();
  } catch {
    return "—";
  }
}

export default function Emergency() {
  const [searchTerm, setSearchTerm] = useState("");
  const [assignments, setAssignments] = useState({});
  const [notes, setNotes] = useState({});

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [vehicles, setVehicles] = useState([]);
  const [emergencies, setEmergencies] = useState([]);
  const [savingId, setSavingId] = useState(null);
  const [statusSavingId, setStatusSavingId] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const [vehRes, emRes] = await Promise.all([
        getAllVehicles({ isActive: true }),
        getEmergencies({ status: "All" }),
      ]);

      const normalizedVehicles = Array.isArray(vehRes) ? vehRes : (vehRes?.vehicles || []);
      setVehicles(Array.isArray(normalizedVehicles) ? normalizedVehicles : []);

      const emergencyList = emRes?.data?.emergencies || [];
      setEmergencies(Array.isArray(emergencyList) ? emergencyList : []);
    } catch (e) {
      setError(e?.message || "Failed to load emergencies");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openEmergencies = useMemo(() => {
    return (emergencies || []).filter(
      (e) => !["Resolved", "Cancelled"].includes(e.status)
    );
  }, [emergencies]);

  const availableVehicles = useMemo(() => {
    return (vehicles || [])
      .filter((v) => v?.status === "Available")
      .map((v) => ({
        id: v.vehicleNumber,
        type: v.vehicleType,
        model: v.model,
        status: v.status,
        driver: v.assignedDriver || null,
      }));
  }, [vehicles]);

  const filteredAvailable = availableVehicles.filter(
    (v) =>
      v.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.driver || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isAssigned = (vehicleId) =>
    Object.values(assignments).includes(vehicleId);

  function handleAssign(brokenId, replacementId) {
    setAssignments((prev) => ({
      ...prev,
      [brokenId]: replacementId,
    }));
  }

  async function handleAssignReplacement(emergencyId) {
    const replacementVehicleNumber = assignments[emergencyId];
    if (!replacementVehicleNumber) return;

    setSavingId(emergencyId);
    setError("");
    try {
      await assignEmergencyReplacement(emergencyId, {
        replacementVehicleNumber,
        assignmentNote: (notes[emergencyId] || "").trim() || undefined,
      });
      setAssignments((p) => {
        const next = { ...p };
        delete next[emergencyId];
        return next;
      });
      setNotes((p) => {
        const next = { ...p };
        delete next[emergencyId];
        return next;
      });
      await fetchData();
    } catch (e) {
      setError(e?.message || "Failed to assign replacement");
    } finally {
      setSavingId(null);
    }
  }

  async function handleUpdateStatus(emergencyId, status) {
    setStatusSavingId(emergencyId);
    setError("");
    try {
      await updateEmergencyStatus(emergencyId, status);
      await fetchData();
    } catch (e) {
      setError(e?.message || "Failed to update status");
    } finally {
      setStatusSavingId(null);
    }
  }

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

      {error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-6 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      ) : null}

      {loading ? (
        <div className="bg-white rounded-lg shadow-sm border border-[#cfece6] p-6 mb-6 text-[#165E52]">
          Loading emergency reports...
        </div>
      ) : null}

      {/* Assign Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {!loading && openEmergencies.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-[#cfece6] p-8 text-center text-[#165E52] opacity-80 col-span-full">
            No emergency reports.
          </div>
        ) : null}

        {openEmergencies.map((em) => (
          <div
            key={em._id}
            className="bg-white rounded-xl shadow-md p-6 flex flex-col gap-5 border border-[#cfece6] transition hover:shadow-lg hover:border-[#a9d5c6]"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Truck className="text-[#000000] w-8 h-8" />

                <div>
                  <h2 className="font-bold text-lg text-[#000000]">
                    {em.vehicleNumber}
                  </h2>
                  <p className="text-sm text-[#000000] opacity-70">{em.issueType} · {em.severity}</p>
                </div>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full border" style={{ borderColor: "#cfece6", color: ACCENT_COLOR, backgroundColor: "#f8fdfc" }}>
                {em.status}
              </span>
            </div>

            {/* Info */}
            <div className="text-[#000000] space-y-1 text-sm font-medium">
              <p>
                <span className="font-semibold">Driver:</span> {em.driverName}
              </p>
              <p>
                <span className="font-semibold">Route:</span> {em.routeName || em.routeId || "—"}
              </p>
              <p>
                <span className="font-semibold">Reported:</span> {formatWhen(em.createdAt)}
              </p>
              {em.locationText ? (
                <p>
                  <span className="font-semibold">Location:</span> {em.locationText}
                </p>
              ) : null}
              <p className="opacity-80">
                <span className="font-semibold">Details:</span> {em.description}
              </p>
            </div>

            {/* Selector */}
            <div>
              <label className="block text-sm font-semibold text-[#000000] mb-1">
                Assign Replacement Vehicle
              </label>
              <select
                className="w-full border rounded-lg px-3 py-2 bg-[#f8fdfc] border-[#cfece6] focus:outline-none focus:ring-2 focus:ring-[#165E52]"
                value={assignments[em._id] || ""}
                onChange={(e) => handleAssign(em._id, e.target.value)}
                disabled={em.status === "Replacement Assigned"}
              >
                <option value="">-- Select Vehicle --</option>
                {filteredAvailable.map((v) => (
                  <option
                    key={v.id}
                    value={v.id}
                    disabled={
                      isAssigned(v.id) && assignments[em._id] !== v.id
                    }
                  >
                    {v.id} - {v.driver || "No Driver"} ({v.type})
                  </option>
                ))}
              </select>
              {em.replacementVehicleNumber ? (
                <p className="text-xs mt-2" style={{ color: ACCENT_COLOR }}>
                  Assigned replacement: <span className="font-semibold">{em.replacementVehicleNumber}</span>
                </p>
              ) : null}
            </div>

            {/* Note */}
            <div>
              <label className="block text-sm font-semibold text-[#000000] mb-1">
                Assignment Note (optional)
              </label>
              <input
                className="w-full border rounded-lg px-3 py-2 bg-[#f8fdfc] border-[#cfece6] focus:outline-none focus:ring-2 focus:ring-[#165E52]"
                placeholder="e.g., Use spare truck from main yard"
                value={notes[em._id] || ""}
                onChange={(e) => setNotes((p) => ({ ...p, [em._id]: e.target.value }))}
                disabled={savingId === em._id}
              />
            </div>

            {/* Confirm Button */}
            <div>
              <button
                onClick={() => handleAssignReplacement(em._id)}
                disabled={
                  !assignments[em._id] ||
                  em.status === "Replacement Assigned" ||
                  savingId === em._id
                }
                className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold text-white text-sm transition-colors duration-200 ${assignments[em._id] && em.status !== "Replacement Assigned" && savingId !== em._id
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-[#172526] cursor-not-allowed"
                  }`}
              >
                <CheckCircle2 size={18} />
                {savingId === em._id ? "Assigning..." : "Assign Replacement"}
              </button>
            </div>

            {/* Status actions */}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleUpdateStatus(em._id, "Acknowledged")}
                disabled={
                  statusSavingId === em._id ||
                  ["Acknowledged", "Replacement Assigned", "Resolved", "Cancelled"].includes(em.status)
                }
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold border ${["Acknowledged", "Replacement Assigned", "Resolved", "Cancelled"].includes(em.status)
                    ? "bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed"
                    : "bg-white text-[#165E52] border-[#cfece6] hover:bg-[#f8fdfc]"
                  }`}
              >
                {statusSavingId === em._id ? "Saving..." : "Acknowledge"}
              </button>

              <button
                type="button"
                onClick={() => handleUpdateStatus(em._id, "Resolved")}
                disabled={statusSavingId === em._id || ["Resolved", "Cancelled"].includes(em.status)}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold border ${["Resolved", "Cancelled"].includes(em.status)
                    ? "bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed"
                    : "bg-white text-emerald-700 border-[#cfece6] hover:bg-[#f8fdfc]"
                  }`}
              >
                Mark Resolved
              </button>

              <button
                type="button"
                onClick={() => handleUpdateStatus(em._id, "Cancelled")}
                disabled={statusSavingId === em._id || ["Resolved", "Cancelled"].includes(em.status)}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold border ${["Resolved", "Cancelled"].includes(em.status)
                    ? "bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed"
                    : "bg-white text-red-700 border-[#cfece6] hover:bg-[#f8fdfc]"
                  }`}
              >
                Cancel
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
