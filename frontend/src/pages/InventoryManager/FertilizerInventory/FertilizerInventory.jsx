import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  getFertilizerInventorySummary,
  recordFertilizerUsage,
  requestFertilizerStock,
  getFertilizerInventoryTransactions,
  getFertilizerRequests,
  updateFertilizerRequestStatus,
} from "../../../api/inventoryManager/fertilizerInventory";
import {
  getFertilizerCompanyDropdown,
  getFertilizerCategoriesByCompany,
} from "../../../api/fertilizerCompanies";

const ACCENT_COLOR = "#165E52";
const BTN_COLOR = "#01251F";
const BORDER_COLOR = "#cfece6";

export default function FertilizerInventory() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({ totalAvailableKg: 0, categories: [] });
  const [companies, setCompanies] = useState([]);
  const [companyCategories, setCompanyCategories] = useState([]);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [activeModal, setActiveModal] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const [requestForm, setRequestForm] = useState({
    companyId: "",
    categoryName: "",
    kg: "",
    expectedDate: "",
    note: "",
  });

  const [useForm, setUseForm] = useState({
    categoryName: "",
    kg: "",
    purpose: "",
    eventAt: "",
    note: "",
  });

  const categorySuggestions = useMemo(() => {
    const fromSummary = (summary?.categories || []).map((c) => c.categoryName);
    const fromCompany = (companyCategories || []).map((c) => c.name);
    return Array.from(new Set([...fromSummary, ...fromCompany])).filter(Boolean);
  }, [summary, companyCategories]);

  const refreshSummary = useCallback(async () => {
    try {
      const [sumRes, transRes, reqRes] = await Promise.all([
        getFertilizerInventorySummary(),
        getFertilizerInventoryTransactions({ limit: 5 }),
        getFertilizerRequests({ status: 'Pending', limit: 10 }),
      ]);

      if (sumRes?.success) setSummary(sumRes.data);
      if (transRes?.success) setTransactions(transRes.content || []);
      if (reqRes?.success) setRequests(reqRes.content || []);
    } catch (e) {
      throw new Error(e?.message || "Failed to fetch dashboard data");
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      setError(null);
      try {
        await Promise.all([
          refreshSummary(),
          (async () => {
            const list = await getFertilizerCompanyDropdown();
            setCompanies(Array.isArray(list) ? list : []);
          })(),
        ]);
      } catch (e) {
        setError(e?.message || "Failed to load fertilizer inventory");
      } finally {
        setLoading(false);
      }
    };

    init();

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      refreshSummary().catch(() => {});
    }, 30000);

    return () => clearInterval(interval);
  }, [refreshSummary]);

  useEffect(() => {
    const loadCompanyCategories = async () => {
      setCompanyCategories([]);
      if (!requestForm.companyId) return;
      try {
        const cats = await getFertilizerCategoriesByCompany(requestForm.companyId);
        setCompanyCategories(Array.isArray(cats) ? cats : []);
      } catch {
        setCompanyCategories([]);
      }
    };

    loadCompanyCategories();
  }, [requestForm.companyId]);

  const onRequestSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    try {
      const payload = {
        companyId: requestForm.companyId,
        categoryName: requestForm.categoryName,
        kg: Number(requestForm.kg),
        expectedDate: requestForm.expectedDate || null,
        note: requestForm.note || null,
      };

      const res = await requestFertilizerStock(payload);
      if (!res?.success) {
        throw new Error(res?.message || "Failed to request stock");
      }

      setSuccessMsg("Fertilizer requested successfully");
      setRequestForm((f) => ({ ...f, categoryName: "", kg: "", note: "" }));
      setActiveModal(null);
      await refreshSummary();
    } catch (e2) {
      setError(e2?.response?.data?.message || e2?.message || "Failed to request stock");
    }
  };

  const onUseSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    try {
      const payload = {
        categoryName: useForm.categoryName,
        kg: Number(useForm.kg),
        purpose: useForm.purpose,
        eventAt: useForm.eventAt || null,
        note: useForm.note || null,
      };

      const res = await recordFertilizerUsage(payload);
      if (!res?.success) {
        throw new Error(res?.message || "Failed to record usage");
      }

      setSuccessMsg("Usage recorded successfully");
      setUseForm({ categoryName: "", kg: "", purpose: "", eventAt: "", note: "" });
      await refreshSummary();
      setActiveModal(null);
    } catch (e2) {
      setError(e2?.response?.data?.message || e2?.message || "Failed to record usage");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b" style={{ borderColor: BORDER_COLOR }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Fertilizer Inventory</h1>
          <p className="text-gray-600 mt-1">Inventory Manager Dashboard - Request, receive stock, and record usage</p>
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

        {/* Buttons */}
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => setActiveModal('request')}
            className="px-4 py-2 rounded-lg font-medium text-white shadow-sm transition"
            style={{ backgroundColor: ACCENT_COLOR }}
          >
            + Request Order
          </button>
          <button
            onClick={() => setActiveModal('use')}
            className="px-4 py-2 rounded-lg font-medium text-white shadow-sm transition"
            style={{ backgroundColor: BTN_COLOR }}
          >
            Record Usage
          </button>
        </div>

        {/* Summary */}
        <div className="bg-white rounded-lg shadow-sm border" style={{ borderColor: BORDER_COLOR }}>
          <div className="p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold" style={{ color: ACCENT_COLOR }}>
                Available Stock Summary
              </h2>
              <p className="text-sm text-gray-600">Total available: <span className="font-semibold">{Number(summary?.totalAvailableKg || 0).toFixed(2)} kg</span></p>
            </div>
            <button
              type="button"
              onClick={async () => {
                setError(null);
                setSuccessMsg(null);
                try {
                  setLoading(true);
                  await refreshSummary();
                } catch (e) {
                  setError(e?.message || "Failed to refresh summary");
                } finally {
                  setLoading(false);
                }
              }}
              className="px-4 py-2 rounded-lg font-medium border"
              style={{ backgroundColor: "white", color: BTN_COLOR, borderColor: BORDER_COLOR }}
            >
              Refresh
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead style={{ backgroundColor: BTN_COLOR }}>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider">Requested</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider">Received</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider">Used</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider">Available (kg)</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {(summary?.categories || []).map((row) => (
                  <tr key={row.categoryName}>
                    <td className="px-6 py-3 text-sm text-gray-900">{row.categoryName}</td>
                    <td className="px-6 py-3 text-sm text-gray-500 text-right">{Number(row.requestedKg || 0).toFixed(2)}</td>
                    <td className="px-6 py-3 text-sm text-green-600 text-right">+{Number(row.inKg || 0).toFixed(2)}</td>
                    <td className="px-6 py-3 text-sm text-red-600 text-right">-{Number(row.outKg || 0).toFixed(2)}</td>
                    <td className="px-6 py-3 text-sm text-gray-900 text-right font-semibold">
                      {Number(row.availableKg || 0).toFixed(2)}
                    </td>
                  </tr>
                ))}
                {(summary?.categories || []).length === 0 && (
                  <tr>
                    <td className="px-6 py-8 text-sm text-gray-600 text-center" colSpan={5}>
                      No fertilizer transactions yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pending Requests */}
        <div className="bg-white rounded-lg shadow-sm border" style={{ borderColor: BORDER_COLOR }}>
          <div className="p-6 border-b" style={{ borderColor: BORDER_COLOR }}>
            <h2 className="text-lg font-semibold" style={{ color: ACCENT_COLOR }}>
              Pending Requests
            </h2>
            <p className="text-sm text-gray-600">Approve or cancel active requests.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Kg</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {requests.map((req) => (
                  <tr key={req._id}>
                    <td className="px-6 py-3 text-sm text-gray-900">{new Date(req.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-3 text-sm text-gray-900">{req.companyName}</td>
                    <td className="px-6 py-3 text-sm text-gray-900">{req.categoryName}</td>
                    <td className="px-6 py-3 text-sm text-gray-900 text-right font-medium">{req.kg}</td>
                    <td className="px-6 py-3 text-sm text-center">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        {req.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm text-center">
                      <button 
                        onClick={() => {
                          setSelectedRequest(req);
                          setActiveModal('confirm-receive');
                        }}
                        className="text-green-600 hover:text-green-900 font-medium mr-3"
                      >
                        Receive
                      </button>
                      <button 
                         onClick={async () => {
                           try {
                             await updateFertilizerRequestStatus(req._id, 'Cancelled');
                             await refreshSummary();
                             setSuccessMsg('Request marked as Cancelled');
                             setTimeout(() => setSuccessMsg(null), 3000);
                           } catch (err) {
                             setError('Failed to cancel request');
                           }
                        }}
                        className="text-red-600 hover:text-red-900 font-medium"
                      >
                        Cancel
                      </button>
                    </td>
                  </tr>
                ))}
                {requests.length === 0 && (
                  <tr>
                    <td className="px-6 py-8 text-sm text-gray-500 text-center" colSpan={6}>
                      No pending requests at the moment.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-lg shadow-sm border" style={{ borderColor: BORDER_COLOR }}>
          <div className="p-6 border-b" style={{ borderColor: BORDER_COLOR }}>
            <h2 className="text-lg font-semibold" style={{ color: ACCENT_COLOR }}>
              Recent Transactions
            </h2>
            <p className="text-sm text-gray-600">Latest recorded usage and receipts.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Kg</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {transactions.map((tx) => (
                  <tr key={tx._id}>
                    <td className="px-6 py-3 text-sm text-gray-900">{new Date(tx.eventAt).toLocaleString()}</td>
                    <td className="px-6 py-3 text-sm text-center">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${tx.type === 'IN' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-900">{tx.categoryName}</td>
                    <td className="px-6 py-3 text-sm text-gray-900 text-right font-medium">{tx.kg}</td>
                    <td className="px-6 py-3 text-sm text-gray-500">{tx.purpose || tx.note || '-'}</td>
                  </tr>
                ))}
                {transactions.length === 0 && (
                  <tr>
                    <td className="px-6 py-8 text-sm text-gray-500 text-center" colSpan={5}>
                      No recent transactions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <datalist id="fertilizer-category-suggestions">
          {categorySuggestions.map((name) => (
            <option key={name} value={name} />
          ))}
        </datalist>

        {activeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto relative">
              <button
                onClick={() => setActiveModal(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {activeModal === 'request' && (
                <div>
                  <div className="p-6 border-b" style={{ borderColor: BORDER_COLOR }}>
                    <h2 className="text-lg font-semibold" style={{ color: ACCENT_COLOR }}>
                      Request Stock
                    </h2>
                    <p className="text-sm text-gray-600">Request fertilizer from a company.</p>
                  </div>
                  <form onSubmit={onRequestSubmit} className="p-6 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Company *</label>
                      <select
                        value={requestForm.companyId}
                        onChange={(e) => setRequestForm((f) => ({ ...f, companyId: e.target.value }))}
                        className="w-full px-3 py-2 border rounded-lg bg-white"
                        style={{ borderColor: BORDER_COLOR }}
                        required
                      >
                        <option value="">Select company</option>
                        {companies.map((c) => (
                          <option key={c.id || c._id} value={c.id || c._id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category Name *</label>
                      <input
                        list="fertilizer-category-suggestions"
                        value={requestForm.categoryName}
                        onChange={(e) => setRequestForm((f) => ({ ...f, categoryName: e.target.value }))}
                        className="w-full px-3 py-2 border rounded-lg"
                        style={{ borderColor: BORDER_COLOR }}
                        placeholder="e.g., Urea"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Kg *</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={requestForm.kg}
                          onChange={(e) => setRequestForm((f) => ({ ...f, kg: e.target.value }))}
                          className="w-full px-3 py-2 border rounded-lg"
                          style={{ borderColor: BORDER_COLOR }}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Expected Date</label>
                        <input
                          type="date"
                          value={requestForm.expectedDate}
                          onChange={(e) => setRequestForm((f) => ({ ...f, expectedDate: e.target.value }))}
                          className="w-full px-3 py-2 border rounded-lg"
                          style={{ borderColor: BORDER_COLOR }}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Note (optional)</label>
                      <textarea
                        rows={2}
                        value={requestForm.note}
                        onChange={(e) => setRequestForm((f) => ({ ...f, note: e.target.value }))}
                        className="w-full px-3 py-2 border rounded-lg"
                        style={{ borderColor: BORDER_COLOR }}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full px-4 py-2 rounded-lg font-medium text-white transition"
                      style={{ backgroundColor: loading ? '#01251FB3' : BTN_COLOR }}
                    >
                      Request Order
                    </button>
                  </form>
                </div>
              )}

              {activeModal === 'confirm-receive' && selectedRequest && (
                <div>
                  {/* Modal Header */}
                  <div className="p-6 border-b" style={{ borderColor: BORDER_COLOR, background: 'linear-gradient(135deg, #01251F 0%, #165E52 100%)' }}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white bg-opacity-20 flex items-center justify-center text-xl">
                        📦
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-white">Confirm Order Receipt</h2>
                        <p className="text-sm" style={{ color: '#a8d5c9' }}>Review and accept the incoming fertilizer stock</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 space-y-5">
                    {/* Kg highlight card */}
                    <div className="rounded-xl p-5 text-center" style={{ background: '#e1f4ef', border: `2px solid ${BORDER_COLOR}` }}>
                      <p className="text-sm font-medium mb-1" style={{ color: ACCENT_COLOR }}>Quantity to be Added to Inventory</p>
                      <p className="text-5xl font-extrabold" style={{ color: BTN_COLOR }}>{selectedRequest.kg}</p>
                      <p className="text-lg font-semibold mt-1" style={{ color: ACCENT_COLOR }}>kg of {selectedRequest.categoryName}</p>
                    </div>

                    {/* Details */}
                    <div className="rounded-lg overflow-hidden border" style={{ borderColor: BORDER_COLOR }}>
                      <div className="flex justify-between items-center px-4 py-3 text-sm" style={{ background: '#f8fdfb', borderBottom: `1px solid ${BORDER_COLOR}` }}>
                        <span className="text-gray-500 font-medium">Company</span>
                        <span className="text-gray-900 font-semibold">{selectedRequest.companyName}</span>
                      </div>
                      <div className="flex justify-between items-center px-4 py-3 text-sm" style={{ background: '#ffffff', borderBottom: `1px solid ${BORDER_COLOR}` }}>
                        <span className="text-gray-500 font-medium">Category</span>
                        <span className="text-gray-900 font-semibold">{selectedRequest.categoryName}</span>
                      </div>
                      {selectedRequest.expectedDate && (
                        <div className="flex justify-between items-center px-4 py-3 text-sm" style={{ background: '#f8fdfb', borderBottom: `1px solid ${BORDER_COLOR}` }}>
                          <span className="text-gray-500 font-medium">Expected Date</span>
                          <span className="text-gray-900">{new Date(selectedRequest.expectedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center px-4 py-3 text-sm" style={{ background: selectedRequest.expectedDate ? '#ffffff' : '#f8fdfb' }}>
                        <span className="text-gray-500 font-medium">Requested On</span>
                        <span className="text-gray-900">{new Date(selectedRequest.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                      </div>
                      {selectedRequest.note && (
                        <div className="flex justify-between items-center px-4 py-3 text-sm" style={{ background: '#f8fdfb', borderTop: `1px solid ${BORDER_COLOR}` }}>
                          <span className="text-gray-500 font-medium">Note</span>
                          <span className="text-gray-900 italic">{selectedRequest.note}</span>
                        </div>
                      )}
                    </div>

                    {/* Warning note */}
                    <div className="rounded-lg px-4 py-3 text-sm" style={{ background: '#fffbeb', border: '1px solid #fcd34d', color: '#92400e' }}>
                      ⚠️ Confirming will permanently add <strong>{selectedRequest.kg} kg</strong> to available inventory and mark this request as <strong>Received</strong>.
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-1">
                      <button
                        onClick={() => { setActiveModal(null); setSelectedRequest(null); }}
                        className="flex-1 px-4 py-2.5 rounded-lg font-medium border transition"
                        style={{ borderColor: BORDER_COLOR, color: BTN_COLOR, background: 'white' }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={async () => {
                          try {
                            await updateFertilizerRequestStatus(selectedRequest._id, 'Received');
                            await refreshSummary();
                            setSuccessMsg(`✅ ${selectedRequest.kg} kg of ${selectedRequest.categoryName} added to inventory`);
                            setTimeout(() => setSuccessMsg(null), 4000);
                            setActiveModal(null);
                            setSelectedRequest(null);
                          } catch (err) {
                            setError('Failed to receive stock');
                          }
                        }}
                        className="flex-1 px-4 py-2.5 rounded-lg font-medium text-white transition shadow-sm"
                        style={{ backgroundColor: ACCENT_COLOR }}
                      >
                        ✓ Confirm Receipt
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeModal === 'use' && (
                <div>
                  <div className="p-6 border-b" style={{ borderColor: BORDER_COLOR }}>
                    <h2 className="text-lg font-semibold" style={{ color: ACCENT_COLOR }}>
                      Record Usage
                    </h2>
                    <p className="text-sm text-gray-600">Record usage with date/time, kg, and purpose.</p>
                  </div>
                  <form onSubmit={onUseSubmit} className="p-6 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category Name *</label>
                      <input
                        list="fertilizer-category-suggestions"
                        value={useForm.categoryName}
                        onChange={(e) => setUseForm((f) => ({ ...f, categoryName: e.target.value }))}
                        className="w-full px-3 py-2 border rounded-lg"
                        style={{ borderColor: BORDER_COLOR }}
                        placeholder="e.g., Urea"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Kg *</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={useForm.kg}
                          onChange={(e) => setUseForm((f) => ({ ...f, kg: e.target.value }))}
                          className="w-full px-3 py-2 border rounded-lg"
                          style={{ borderColor: BORDER_COLOR }}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date/Time (optional)</label>
                        <input
                          type="datetime-local"
                          value={useForm.eventAt}
                          onChange={(e) => setUseForm((f) => ({ ...f, eventAt: e.target.value }))}
                          className="w-full px-3 py-2 border rounded-lg"
                          style={{ borderColor: BORDER_COLOR }}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Purpose *</label>
                      <input
                        value={useForm.purpose}
                        onChange={(e) => setUseForm((f) => ({ ...f, purpose: e.target.value }))}
                        className="w-full px-3 py-2 border rounded-lg"
                        style={{ borderColor: BORDER_COLOR }}
                        placeholder="e.g., Field application"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Note (optional)</label>
                      <textarea
                        rows={2}
                        value={useForm.note}
                        onChange={(e) => setUseForm((f) => ({ ...f, note: e.target.value }))}
                        className="w-full px-3 py-2 border rounded-lg"
                        style={{ borderColor: BORDER_COLOR }}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full px-4 py-2 rounded-lg font-medium text-white transition"
                      style={{ backgroundColor: loading ? '#01251FB3' : BTN_COLOR }}
                    >
                      Record Usage
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
