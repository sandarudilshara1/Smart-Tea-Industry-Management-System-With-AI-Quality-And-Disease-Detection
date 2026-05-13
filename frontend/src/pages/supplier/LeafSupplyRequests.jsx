import React, { useEffect, useState } from "react";
import {
  confirmLeafSupplyRequest,
  getSupplierInboxLeafSupplyRequests,
  rejectLeafSupplyRequest,
} from "../../api/leafSupplyRequests";

const ACCENT_COLOR = "#165E52";
const BTN_COLOR = "#01251F";
const BORDER_COLOR = "#cfece6";

const STATUS_BADGE = {
  PENDING: "bg-amber-50 text-amber-800 border-amber-200",
  CONFIRMED: "bg-emerald-50 text-emerald-800 border-emerald-200",
  REJECTED: "bg-red-50 text-red-800 border-red-200",
  RECEIVED: "bg-slate-50 text-slate-800 border-slate-200",
};

export default function SupplierLeafSupplyRequests() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [requests, setRequests] = useState([]);
  const [rejectReasonById, setRejectReasonById] = useState({});
  const [busyId, setBusyId] = useState(null);

  const loadInbox = async () => {
    const res = await getSupplierInboxLeafSupplyRequests({ page: 0, limit: 100 });
    const list = Array.isArray(res?.content) ? res.content : [];
    setRequests(list);
  };

  const init = async () => {
    setLoading(true);
    setError(null);
    try {
      await loadInbox();
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || "Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    init();
  }, []);

  const onConfirm = async (id) => {
    setBusyId(id);
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await confirmLeafSupplyRequest(id);
      if (!res?.success) throw new Error(res?.message || "Failed to confirm request");
      setSuccessMsg("Request confirmed");
      await loadInbox();
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || "Failed to confirm request");
    } finally {
      setBusyId(null);
    }
  };

  const onReject = async (id) => {
    const reason = String(rejectReasonById[id] || "").trim();
    if (!reason) {
      setError("Please add a rejection reason");
      return;
    }

    setBusyId(id);
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await rejectLeafSupplyRequest(id, reason);
      if (!res?.success) throw new Error(res?.message || "Failed to reject request");
      setSuccessMsg("Request rejected");
      setRejectReasonById((m) => ({ ...m, [id]: "" }));
      await loadInbox();
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || "Failed to reject request");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: "#f0fdf4" }}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: ACCENT_COLOR }}>
              Leaf Supply Inbox
            </h1>
            <p className="text-gray-700 mt-1">
              Confirm or reject incoming tea leaf supply requests from inventory managers.
            </p>
          </div>
          <button
            type="button"
            onClick={loadInbox}
            className="px-4 py-2 rounded-lg border text-sm font-medium"
            style={{ borderColor: BORDER_COLOR, color: ACCENT_COLOR }}
          >
            Refresh
          </button>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-800 rounded-lg p-3">
            {error}
          </div>
        )}
        {successMsg && (
          <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg p-3">
            {successMsg}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md overflow-hidden" style={{ border: `1px solid ${BORDER_COLOR}` }}>
          {loading ? (
            <div className="p-6 text-gray-500">Loading...</div>
          ) : requests.length === 0 ? (
            <div className="p-6 text-gray-500">No requests in inbox.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Inventory Manager</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Requested</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Requested For</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {requests.map((r) => {
                    const status = String(r.status || "PENDING").toUpperCase();
                    const canAct = status === "PENDING";
                    return (
                      <tr key={r._id} className="hover:bg-gray-50 align-top">
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {r.createdBy?.name || r.createdBy?.email || "-"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {Number(r.requestedKg || 0).toLocaleString()} kg
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {r.requestedForAt ? new Date(r.requestedForAt).toLocaleString() : "-"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {r.pickupLocation || "-"}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                              STATUS_BADGE[status] || "bg-gray-50 text-gray-700 border-gray-200"
                            }`}
                          >
                            {status}
                          </span>
                          {status === "REJECTED" && r.rejectionReason && (
                            <div className="text-xs text-red-700 mt-1">{r.rejectionReason}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {canAct ? (
                            <div className="flex flex-col items-end gap-2">
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => onConfirm(r._id)}
                                  disabled={busyId === r._id}
                                  className="px-3 py-1.5 rounded-lg text-white text-sm"
                                  style={{ backgroundColor: BTN_COLOR }}
                                >
                                  {busyId === r._id ? "Saving..." : "Confirm"}
                                </button>
                              </div>
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={rejectReasonById[r._id] || ""}
                                  onChange={(e) =>
                                    setRejectReasonById((m) => ({ ...m, [r._id]: e.target.value }))
                                  }
                                  className="w-56 border rounded-lg px-2 py-1 text-sm focus:outline-none"
                                  style={{ borderColor: BORDER_COLOR }}
                                  placeholder="Rejection reason"
                                />
                                <button
                                  type="button"
                                  onClick={() => onReject(r._id)}
                                  disabled={busyId === r._id}
                                  className="px-3 py-1.5 rounded-lg text-white text-sm bg-red-700"
                                >
                                  {busyId === r._id ? "Saving..." : "Reject"}
                                </button>
                              </div>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">No action</span>
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
    </div>
  );
}
