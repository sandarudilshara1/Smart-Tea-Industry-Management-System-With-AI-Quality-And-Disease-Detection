import React, { useEffect, useMemo, useState, useCallback } from "react";
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
  PENDING: "bg-amber-100 text-amber-800 border-amber-200",
  CONFIRMED: "bg-emerald-100 text-emerald-800 border-emerald-200",
  REJECTED: "bg-red-100 text-red-800 border-red-200",
  RECEIVED: "bg-slate-100 text-slate-800 border-slate-200",
};

export default function LeafInventory() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [activeModal, setActiveModal] = useState(null);

  const [suppliers, setSuppliers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [activeRate, setActiveRate] = useState(null);


  const [requestForm, setRequestForm] = useState({
    supplierId: "",
    requestedKg: "",
    requestedForAt: "",
    pickupLocation: "",
    notes: "",
  });

  const [receiveForm, setReceiveForm] = useState({
    actualReceivedKg: "",
    bagWeight: "",
    waterWeight: "",
    coarseLeafWeight: "",
    notes: "",
  });

  const refreshData = useCallback(async () => {
    try {
      const [suppRes, reqRes, rateRes] = await Promise.all([
        axios.get("/suppliers", { params: { page: 0, limit: 1000, status: "Active" } }),
        getMyLeafSupplyRequests({ page: 0, limit: 50 }),
        axios.get("/tea-rates/active").catch(() => null),
      ]);

      const suppList =
        (Array.isArray(suppRes.data?.content) && suppRes.data.content) ||
        (Array.isArray(suppRes.data?.data) && suppRes.data.data) ||
        [];
      setSuppliers(suppList);

      const reqList = Array.isArray(reqRes?.content) ? reqRes.content : [];
      setRequests(reqList);

      if (rateRes?.data?.success) {
        setActiveRate(rateRes.data.data);
      }
    } catch (e) {
      throw new Error(e?.response?.data?.message || e?.message || "Failed to load data");
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      setError(null);
      try {
        await refreshData();
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    init();

    const interval = setInterval(() => {
      refreshData().catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, [refreshData]);

  const supplierOptions = useMemo(() => {
    return suppliers.map((s) => ({
      id: s._id,
      label: `${s.supplierCode ? `${s.supplierCode} - ` : ""}${s.name}`,
    }));
  }, [suppliers]);

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

  const onRequestSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const kg = Number(requestForm.requestedKg);
    if (!requestForm.supplierId) {
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
        supplierId: requestForm.supplierId,
        requestedKg: kg,
        requestedForAt: requestForm.requestedForAt ? new Date(requestForm.requestedForAt).toISOString() : null,
        pickupLocation: requestForm.pickupLocation || null,
        notes: requestForm.notes || null,
      };

      const res = await createLeafSupplyRequest(payload);
      if (!res?.success) throw new Error(res?.message || "Failed to create request");

      setSuccessMsg("✅ Supply request sent to supplier successfully");
      setRequestForm({ supplierId: "", requestedKg: "", requestedForAt: "", pickupLocation: "", notes: "" });
      await refreshData();
      setActiveModal(null);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (e2) {
      setError(e2?.response?.data?.message || e2?.message || "Failed to create request");
    } finally {
      setSubmitting(false);
    }
  };

  const calculatedReceipt = useMemo(() => {
    const gross = Number(receiveForm.actualReceivedKg) || 0;
    const bag = Number(receiveForm.bagWeight) || 0;
    const water = Number(receiveForm.waterWeight) || 0;
    const coarse = Number(receiveForm.coarseLeafWeight) || 0;
    const net = Math.max(0, gross - bag - water - coarse);
    const rate = activeRate?.defaultRate || 0;
    const amount = net * rate;

    return { net, rate, amount };
  }, [receiveForm, activeRate]);

  const onReceiveSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const kg = Number(receiveForm.actualReceivedKg);
    if (!Number.isFinite(kg) || kg <= 0) {
      setError("Please enter valid received kg");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        actualReceivedKg: kg,
        bagWeight: Number(receiveForm.bagWeight) || 0,
        waterWeight: Number(receiveForm.waterWeight) || 0,
        coarseLeafWeight: Number(receiveForm.coarseLeafWeight) || 0,
        notes: receiveForm.notes || undefined,
      };

      const res = await receiveLeafSupplyRequest(selectedRequest._id, payload);
      if (!res?.success) throw new Error(res?.message || "Failed to receive stock");

      setSuccessMsg(`✅ Successfully received ${kg} kg from ${selectedRequest.supplierId?.name}`);
      setReceiveForm({ actualReceivedKg: "", bagWeight: "", waterWeight: "", coarseLeafWeight: "", notes: "" });
      setSelectedRequest(null);
      setActiveModal(null);
      await refreshData();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || "Failed to receive stock");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b" style={{ borderColor: BORDER_COLOR }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Leaf Inventory</h1>
              <p className="text-gray-600 mt-1">Manage tea leaf supply requests, receipts, and inventory tracking.</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setActiveModal('request')}
                className="px-5 py-2.5 rounded-xl font-bold text-white shadow-lg transition active:scale-[0.98]"
                style={{ backgroundColor: ACCENT_COLOR }}
              >
                + Request Leaves
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl flex items-center gap-3">
            <span className="text-xl">⚠️</span>
            <p className="font-medium">{error}</p>
          </div>
        )}
        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center gap-3">
            <span className="text-xl">✅</span>
            <p className="font-medium">{successMsg}</p>
          </div>
        )}

        {/* Summary Dashboard (Mirroring Fertilizer) */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden" style={{ borderColor: BORDER_COLOR }}>
          <div className="p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold" style={{ color: ACCENT_COLOR }}>
                Supply Summary (Today)
              </h2>
              <p className="text-sm text-gray-500">Real-time overview of leaf collection progress.</p>
            </div>
            <button
              onClick={refreshData}
              className="px-4 py-2 rounded-lg font-bold border text-sm transition hover:bg-gray-50"
              style={{ color: BTN_COLOR, borderColor: BORDER_COLOR }}
            >
              Refresh Data
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead style={{ backgroundColor: BTN_COLOR }}>
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-widest">Supply Category</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-widest">Requested Total</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-widest">Received Total</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-widest">Pending Confirmation</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-white uppercase tracking-widest">Ready for Receipt</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                <tr className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-5 text-sm font-bold text-gray-900 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    Fresh Tea Leaves
                  </td>
                  <td className="px-6 py-5 text-sm text-gray-700 text-right font-medium">
                    {summary.totalRequested.toLocaleString()} <span className="text-xs text-gray-400">kg</span>
                  </td>
                  <td className="px-6 py-5 text-sm text-emerald-600 text-right font-bold">
                    +{summary.totalReceived.toLocaleString()} <span className="text-xs text-emerald-400">kg</span>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold border border-amber-100">
                      {summary.pendingRequests} Requests
                    </span>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100">
                      {summary.confirmedRequests} Confirmed
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Activity Table */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden" style={{ borderColor: BORDER_COLOR }}>
          <div className="p-6 border-b" style={{ borderColor: BORDER_COLOR }}>
            <h2 className="text-lg font-bold text-gray-900">Recent Supply Operations</h2>
            <p className="text-sm text-gray-500">Monitor individual supplier requests and process confirmations.</p>
          </div>

          {loading ? (
            <div className="p-20 text-center">
              <div className="animate-spin h-10 w-10 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-500 font-medium">Synchronizing inventory data...</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="p-20 text-center text-gray-400 italic">No supply requests recorded.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50/80">
                  <tr>
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Supplier Details</th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Requested Qty</th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">Scheduled For</th>
                    <th className="px-6 py-4 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Received Qty</th>
                    <th className="px-6 py-4 text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">Operations</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {requests.map((r) => {
                    const status = String(r.status || "PENDING").toUpperCase();
                    return (
                      <tr key={r._id} className="hover:bg-gray-50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="font-bold text-gray-900">{r.supplierId?.name || "Unknown"}</div>
                          <div className="text-xs text-emerald-600 font-medium">{r.supplierId?.supplierCode || "N/A"}</div>
                        </td>
                        <td className="px-6 py-4 font-semibold text-gray-700">
                          {Number(r.requestedKg || 0).toLocaleString()} <span className="text-xs font-normal">kg</span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {r.requestedForAt ? new Date(r.requestedForAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : "Not Set"}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${STATUS_BADGE[status] || "bg-gray-100 text-gray-600"}`}>
                            {status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-black text-gray-900">
                          {r.actualReceivedKg ? `${Number(r.actualReceivedKg).toLocaleString()} kg` : "—"}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {status === "CONFIRMED" ? (
                            <button
                              onClick={() => {
                                setSelectedRequest(r);
                                const defaultBag = activeRate ? (Number(r.requestedKg) * (activeRate.bagWeightPercentage || 0)) / 100 : 0;
                                setReceiveForm({
                                  actualReceivedKg: r.requestedKg,
                                  bagWeight: defaultBag.toFixed(2),
                                  waterWeight: "0",
                                  coarseLeafWeight: "0",
                                  notes: "",
                                });
                                setActiveModal('receive');
                              }}
                              className="px-4 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold border border-emerald-200 hover:bg-emerald-100 transition active:scale-95"
                            >
                              Receive Stock
                            </button>
                          ) : status === "RECEIVED" ? (
                            <div className="text-emerald-500 flex items-center justify-end gap-1 font-bold text-[10px] uppercase">
                              <span className="text-base">✓</span> Recorded
                            </div>
                          ) : (
                            <span className="text-gray-300 text-xs italic">—</span>
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
      </div>

      {/* Request Modal */}
      {activeModal === 'request' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden relative border border-white/20">
            <div className="p-6 border-b flex items-center justify-between" style={{ borderColor: BORDER_COLOR, background: 'linear-gradient(135deg, #01251F 0%, #165E52 100%)' }}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-2xl shadow-inner">🌱</div>
                <div>
                  <h2 className="text-xl font-black text-white tracking-tight">Request Leaf Supply</h2>
                  <p className="text-xs text-emerald-200 font-medium">New procurement order for supplier</p>
                </div>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-white/60 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <form onSubmit={onRequestSubmit} className="p-8 space-y-6 overflow-y-auto max-h-[calc(90vh-100px)]">
              <div>
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">Target Supplier *</label>
                <select
                  value={requestForm.supplierId}
                  onChange={(e) => setRequestForm((f) => ({ ...f, supplierId: e.target.value }))}
                  className="w-full border-2 rounded-xl px-4 py-3 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 focus:outline-none bg-gray-50 font-bold text-gray-700 transition-all"
                  style={{ borderColor: BORDER_COLOR }}
                  required
                >
                  <option value="">Choose a registered supplier...</option>
                  {supplierOptions.map((s) => (
                    <option key={s.id} value={s.id}>{s.label}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">Quantity (kg) *</label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0.1"
                      step="0.01"
                      value={requestForm.requestedKg}
                      onChange={(e) => setRequestForm((f) => ({ ...f, requestedKg: e.target.value }))}
                      className="w-full border-2 rounded-xl pl-4 pr-12 py-3 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 focus:outline-none font-bold text-gray-900"
                      style={{ borderColor: BORDER_COLOR }}
                      placeholder="0.00"
                      required
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-gray-300">KG</span>
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">Collection Date</label>
                  <input
                    type="datetime-local"
                    value={requestForm.requestedForAt}
                    onChange={(e) => setRequestForm((f) => ({ ...f, requestedForAt: e.target.value }))}
                    className="w-full border-2 rounded-xl px-4 py-3 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 focus:outline-none font-bold text-gray-700"
                    style={{ borderColor: BORDER_COLOR }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">Pickup Point</label>
                <input
                  type="text"
                  value={requestForm.pickupLocation}
                  onChange={(e) => setRequestForm((f) => ({ ...f, pickupLocation: e.target.value }))}
                  className="w-full border-2 rounded-xl px-4 py-3 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 focus:outline-none font-bold"
                  style={{ borderColor: BORDER_COLOR }}
                  placeholder="e.g., Gate 2, Main Road"
                />
              </div>

              <div>
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">Internal Notes</label>
                <textarea
                  value={requestForm.notes}
                  onChange={(e) => setRequestForm((f) => ({ ...f, notes: e.target.value }))}
                  className="w-full border-2 rounded-xl px-4 py-3 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 focus:outline-none min-h-[100px] font-medium"
                  style={{ borderColor: BORDER_COLOR }}
                  placeholder="Add details for the supplier or transport team..."
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="flex-1 px-4 py-3.5 rounded-xl font-black text-gray-500 border-2 transition hover:bg-gray-50 uppercase tracking-widest text-xs"
                  style={{ borderColor: BORDER_COLOR }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-3.5 rounded-xl font-black text-white shadow-xl shadow-emerald-900/20 transition active:scale-[0.98] disabled:opacity-50 uppercase tracking-widest text-xs"
                  style={{ backgroundColor: BTN_COLOR }}
                >
                  {submitting ? "Transmitting..." : "Send Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Receive Modal (New - Like Fertilizer) */}
      {activeModal === 'receive' && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden relative border border-white/20">
            <div className="p-6 border-b flex items-center justify-between" style={{ borderColor: BORDER_COLOR, background: 'linear-gradient(135deg, #01251F 0%, #165E52 100%)' }}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-2xl">📦</div>
                <div>
                  <h2 className="text-xl font-black text-white tracking-tight">Confirm Receipt</h2>
                  <p className="text-xs text-emerald-200 font-medium">Verify incoming leaf weight</p>
                </div>
              </div>
            </div>

            <form onSubmit={onReceiveSubmit} className="p-8 space-y-5 max-h-[80vh] overflow-y-auto">
              <div className="bg-emerald-50 rounded-2xl p-5 text-center border-2 border-emerald-100 border-dashed">
                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-1">Expected Supply</p>
                <p className="text-3xl font-black text-emerald-900">{selectedRequest.requestedKg} <span className="text-xl">kg</span></p>
                <p className="text-xs font-bold text-emerald-700 mt-1">from {selectedRequest.supplierId?.name}</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">Gross Weight (kg) *</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={receiveForm.actualReceivedKg}
                      onChange={(e) => setReceiveForm(f => ({ ...f, actualReceivedKg: e.target.value }))}
                      className="w-full border-2 rounded-xl pl-4 pr-12 py-3 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 focus:outline-none font-black text-xl text-gray-900"
                      style={{ borderColor: BORDER_COLOR }}
                      autoFocus
                      required
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-gray-300">GROSS</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5">Bag Tare</label>
                    <input
                      type="number"
                      step="0.01"
                      value={receiveForm.bagWeight}
                      onChange={(e) => setReceiveForm(f => ({ ...f, bagWeight: e.target.value }))}
                      className="w-full border-2 rounded-lg px-3 py-2 focus:border-emerald-500 focus:outline-none font-bold text-sm"
                      style={{ borderColor: BORDER_COLOR }}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5">Water</label>
                    <input
                      type="number"
                      step="0.01"
                      value={receiveForm.waterWeight}
                      onChange={(e) => setReceiveForm(f => ({ ...f, waterWeight: e.target.value }))}
                      className="w-full border-2 rounded-lg px-3 py-2 focus:border-emerald-500 focus:outline-none font-bold text-sm"
                      style={{ borderColor: BORDER_COLOR }}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5">Coarse</label>
                    <input
                      type="number"
                      step="0.01"
                      value={receiveForm.coarseLeafWeight}
                      onChange={(e) => setReceiveForm(f => ({ ...f, coarseLeafWeight: e.target.value }))}
                      className="w-full border-2 rounded-lg px-3 py-2 focus:border-emerald-500 focus:outline-none font-bold text-sm"
                      style={{ borderColor: BORDER_COLOR }}
                    />
                  </div>
                </div>

                <div className="bg-gray-900 rounded-2xl p-5 text-white shadow-xl">
                  <div className="flex justify-between items-center mb-4 pb-4 border-b border-white/10">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Calculation Summary</span>
                    <span className="text-[10px] px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-md font-bold">LIVE</span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm font-medium">Net Leaf Weight</span>
                      <span className="text-lg font-black text-emerald-400">{calculatedReceipt.net.toFixed(2)} kg</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm font-medium">Current Tea Rate</span>
                      <span className="text-sm font-bold text-white">Rs. {calculatedReceipt.rate.toFixed(2)} / kg</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 mt-2 border-t border-white/10">
                      <span className="text-white text-sm font-black uppercase tracking-wider">Est. Earnings</span>
                      <span className="text-xl font-black text-white">Rs. {calculatedReceipt.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">Internal Notes</label>
                  <input
                    type="text"
                    value={receiveForm.notes}
                    onChange={(e) => setReceiveForm(f => ({ ...f, notes: e.target.value }))}
                    className="w-full border-2 rounded-xl px-4 py-2.5 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 focus:outline-none font-medium text-sm"
                    style={{ borderColor: BORDER_COLOR }}
                    placeholder="e.g., Heavy rain during transport"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => { setActiveModal(null); setSelectedRequest(null); }}
                  className="flex-1 px-4 py-3.5 rounded-xl font-black text-gray-500 border-2 transition hover:bg-gray-50 uppercase tracking-widest text-xs"
                  style={{ borderColor: BORDER_COLOR }}
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-3.5 rounded-xl font-black text-white shadow-xl shadow-emerald-900/20 transition active:scale-[0.98] disabled:opacity-50 uppercase tracking-widest text-xs"
                  style={{ backgroundColor: ACCENT_COLOR }}
                >
                  {submitting ? "Recording..." : "Confirm Receipt"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
