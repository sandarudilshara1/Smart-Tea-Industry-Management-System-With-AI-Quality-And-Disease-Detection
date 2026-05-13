import React, { useEffect, useMemo, useState } from "react";
import axios from "../../../api/axios";
import {
  createLeafSupplyRequest,
  getMyLeafSupplyRequests,
  receiveLeafSupplyRequest,
} from "../../../api/leafSupplyRequests";

const ACCENT_COLOR = "#165E52";
const BTN_COLOR = "#01251F";
const BORDER_COLOR = "#cfece6";

const STATUS_BADGE = {
  PENDING: "bg-amber-50 text-amber-800 border-amber-200",
  CONFIRMED: "bg-emerald-50 text-emerald-800 border-emerald-200",
  REJECTED: "bg-red-50 text-red-800 border-red-200",
  RECEIVED: "bg-slate-50 text-slate-800 border-slate-200",
};

function toLocalDateTimeValue(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

export default function LeafInventory() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [activeModal, setActiveModal] = useState(null);

  const [suppliers, setSuppliers] = useState([]);
  const [requests, setRequests] = useState([]);

  const [form, setForm] = useState({
    supplierId: "",
    requestedKg: "",
    requestedForAt: "",
    pickupLocation: "",
    notes: "",
  });

  const [receiveKgById, setReceiveKgById] = useState({});

  const supplierOptions = useMemo(() => {
    const list = Array.isArray(suppliers) ? suppliers : [];
    return list.map((s) => ({
      id: s._id,
      label: `${s.supplierCode ? `${s.supplierCode} - ` : ""}${s.name}`,
    }));
  }, [suppliers]);

  // Calculate summary stats from requests
  const summary = useMemo(() => {
    const totalRequested = requests.reduce((acc, r) => acc + (Number(r.requestedKg) || 0), 0);
    const totalReceived = requests.reduce((acc, r) => acc + (Number(r.actualReceivedKg) || 0), 0);
    const pendingRequests = requests.filter(r => r.status === 'PENDING').length;
    const confirmedRequests = requests.filter(r => r.status === 'CONFIRMED').length;

    return {
      totalRequested,
      totalReceived,
      pendingRequests,
      confirmedRequests
    };
  }, [requests]);

  const loadSuppliers = async () => {
    const res = await axios.get("/suppliers", {
      params: { page: 0, limit: 1000, status: "Active" },
    });

    const list =
      (Array.isArray(res.data?.content) && res.data.content) ||
      (Array.isArray(res.data?.data) && res.data.data) ||
      [];

    setSuppliers(list);
  };

  const loadRequests = async () => {
    const res = await getMyLeafSupplyRequests({ page: 0, limit: 50 });
    const list = Array.isArray(res?.content) ? res.content : [];
    setRequests(list);
  };

  const init = async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([loadSuppliers(), loadRequests()]);
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const kg = Number(form.requestedKg);
    if (!form.supplierId) {
      setError("Please select a supplier");
      return;
    }
    if (!Number.isFinite(kg) || kg <= 0) {
      setError("Requested kg must be greater than 0");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        supplierId: form.supplierId,
        requestedKg: kg,
        requestedForAt: form.requestedForAt ? new Date(form.requestedForAt).toISOString() : null,
        pickupLocation: form.pickupLocation || null,
        notes: form.notes || null,
      };

      const res = await createLeafSupplyRequest(payload);
      if (!res?.success) throw new Error(res?.message || "Failed to create request");

      setSuccessMsg("Request sent to supplier");
      setForm((f) => ({ ...f, supplierId: "", requestedKg: "", requestedForAt: "", pickupLocation: "", notes: "" }));
      await loadRequests();
      setActiveModal(null);
    } catch (e2) {
      setError(e2?.response?.data?.message || e2?.message || "Failed to create request");
    } finally {
      setSubmitting(false);
    }
  };

  const onReceive = async (id, requestedKg) => {
    setError(null);
    setSuccessMsg(null);

    const entered = receiveKgById[id];
    const kg = Number(entered);
    if (!Number.isFinite(kg) || kg <= 0) {
      setError("Please enter received kg");
      return;
    }

    try {
      const res = await receiveLeafSupplyRequest(id, { actualReceivedKg: kg });
      if (!res?.success) throw new Error(res?.message || "Failed to receive stock");

      setSuccessMsg(
        `Received ${kg} kg (requested ${requestedKg} kg). Stock updated.`
      );
      setReceiveKgById((m) => ({ ...m, [id]: "" }));
      await loadRequests();
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || "Failed to receive stock");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b" style={{ borderColor: BORDER_COLOR }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Leaf Inventory</h1>
          <p className="text-gray-600 mt-1">
            Request tea leaves from suppliers, track status, and manage incoming inventory.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
        {successMsg && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
            {successMsg}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => setActiveModal('request')}
            className="px-4 py-2 rounded-lg font-medium text-white shadow-sm transition"
            style={{ backgroundColor: ACCENT_COLOR }}
          >
            + Request Leaves
          </button>
          <button
            onClick={init}
            className="px-4 py-2 rounded-lg font-medium border transition"
            style={{ backgroundColor: "white", color: BTN_COLOR, borderColor: BORDER_COLOR }}
          >
            Refresh Data
          </button>
        </div>

        {/* Inventory Summary (Calculated from requests) */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden" style={{ borderColor: BORDER_COLOR }}>
          <div className="p-6 border-b" style={{ borderColor: BORDER_COLOR }}>
            <h2 className="text-lg font-semibold" style={{ color: ACCENT_COLOR }}>
              Inventory Summary
            </h2>
            <p className="text-sm text-gray-600">Overview of requested and received tea leaf quantities.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead style={{ backgroundColor: BTN_COLOR }}>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider">Requested (kg)</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider">Received (kg)</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">Pending Tasks</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">Confirmed Ready</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-900 font-medium">Fresh Tea Leaves</td>
                  <td className="px-6 py-4 text-sm text-gray-900 text-right">{summary.totalRequested.toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm text-green-600 text-right font-semibold">+{summary.totalReceived.toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm text-amber-600 text-center font-medium">{summary.pendingRequests} Pending</td>
                  <td className="px-6 py-4 text-sm text-emerald-600 text-center font-medium">{summary.confirmedRequests} Confirmed</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Requests table */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden" style={{ borderColor: BORDER_COLOR }}>
          <div className="p-6 border-b" style={{ borderColor: BORDER_COLOR }}>
            <h2 className="text-lg font-semibold" style={{ color: ACCENT_COLOR }}>
              Recent Requests & Receipts
            </h2>
            <p className="text-sm text-gray-600">Monitor status and receive confirmed supplies.</p>
          </div>

          {loading ? (
            <div className="p-12 text-center text-gray-500">
              <div className="animate-spin h-8 w-8 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              Loading leaf inventory data...
            </div>
          ) : requests.length === 0 ? (
            <div className="p-12 text-center text-gray-500">No requests found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Supplier</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Requested</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Schedule</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Received</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {requests.map((r) => {
                    const supplier = r.supplierId;
                    const status = String(r.status || "PENDING").toUpperCase();
                    return (
                      <tr key={r._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="text-sm font-semibold text-gray-900">{supplier?.name || "-"}</div>
                          <div className="text-xs text-gray-500">{supplier?.supplierCode || ""}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                          {Number(r.requestedKg || 0).toLocaleString()} kg
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {r.requestedForAt ? new Date(r.requestedForAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : "-"}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
                              STATUS_BADGE[status] || "bg-gray-50 text-gray-700 border-gray-200"
                            }`}
                          >
                            {status}
                          </span>
                          {status === "REJECTED" && r.rejectionReason && (
                            <div className="text-[10px] text-red-700 mt-1 max-w-[120px] mx-auto line-clamp-1" title={r.rejectionReason}>
                              {r.rejectionReason}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 text-right font-semibold">
                          {r.actualReceivedKg ? `${Number(r.actualReceivedKg).toLocaleString()} kg` : "-"}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {status === "CONFIRMED" ? (
                            <div className="flex items-center justify-end gap-2">
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={receiveKgById[r._id] ?? ""}
                                onChange={(e) =>
                                  setReceiveKgById((m) => ({ ...m, [r._id]: e.target.value }))
                                }
                                className="w-20 border rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                style={{ borderColor: BORDER_COLOR }}
                                placeholder="kg"
                              />
                              <button
                                type="button"
                                onClick={() => onReceive(r._id, r.requestedKg)}
                                className="px-3 py-1.5 rounded-lg text-white text-sm font-medium transition active:scale-95"
                                style={{ backgroundColor: BTN_COLOR }}
                              >
                                Receive
                              </button>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Request Modal */}
        {activeModal === 'request' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden relative">
              {/* Modal Header */}
              <div className="p-6 border-b flex items-center justify-between" style={{ borderColor: BORDER_COLOR, background: 'linear-gradient(135deg, #01251F 0%, #165E52 100%)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-xl">🍃</div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Request Leaf Supply</h2>
                    <p className="text-xs text-emerald-100">Send a pickup request to a supplier</p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveModal(null)}
                  className="text-white/70 hover:text-white transition"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={onSubmit} className="p-6 space-y-5 overflow-y-auto max-h-[calc(90vh-100px)]">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Select Supplier *</label>
                  <select
                    value={form.supplierId}
                    onChange={(e) => setForm((f) => ({ ...f, supplierId: e.target.value }))}
                    className="w-full border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-gray-50"
                    style={{ borderColor: BORDER_COLOR }}
                    required
                  >
                    <option value="">Choose a supplier...</option>
                    {supplierOptions.map((s) => (
                      <option key={s.id} value={s.id}>{s.label}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Requested Quantity (kg) *</label>
                    <input
                      type="number"
                      min="0.1"
                      step="0.01"
                      value={form.requestedKg}
                      onChange={(e) => setForm((f) => ({ ...f, requestedKg: e.target.value }))}
                      className="w-full border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      style={{ borderColor: BORDER_COLOR }}
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Preferred Schedule</label>
                    <input
                      type="datetime-local"
                      value={form.requestedForAt}
                      onChange={(e) => setForm((f) => ({ ...f, requestedForAt: e.target.value }))}
                      className="w-full border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      style={{ borderColor: BORDER_COLOR }}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Pickup Point</label>
                  <input
                    type="text"
                    value={form.pickupLocation}
                    onChange={(e) => setForm((f) => ({ ...f, pickupLocation: e.target.value }))}
                    className="w-full border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    style={{ borderColor: BORDER_COLOR }}
                    placeholder="e.g., Gate 2, Main Road"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Special Instructions</label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                    className="w-full border rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none min-h-[100px]"
                    style={{ borderColor: BORDER_COLOR }}
                    placeholder="Any specific details for the supplier..."
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveModal(null)}
                    className="flex-1 px-4 py-3 rounded-xl font-bold border transition text-gray-600 hover:bg-gray-50"
                    style={{ borderColor: BORDER_COLOR }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-4 py-3 rounded-xl font-bold text-white shadow-lg transition active:scale-[0.98] disabled:opacity-50"
                    style={{ backgroundColor: BTN_COLOR }}
                  >
                    {submitting ? "Processing..." : "Send Request"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
