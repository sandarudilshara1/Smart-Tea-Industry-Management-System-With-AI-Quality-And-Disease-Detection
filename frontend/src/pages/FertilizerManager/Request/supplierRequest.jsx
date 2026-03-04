import React, { useState, useEffect } from "react";
import {
  Check,
  X,
  Clock,
  Package,
  User,
  Calendar,
  Eye,
} from "lucide-react";
import { getAllSupplierFertilizerRequests } from '../../../api/fertilizerManager';

// Theme Constants
const ACCENT_COLOR = "#165E52";

const FertilizerRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectingId, setRejectingId] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedFertilizers, setSelectedFertilizers] = useState([]);

  useEffect(() => {
    // Fetch supplier requests from backend
    const fetchRequests = async () => {
      try {
        const data = await getAllSupplierFertilizerRequests();
        // Map backend response to frontend format
        const mapped = data.map(req => ({
          id: req.id,
          supplierId: req.supplierId,
          supplier: req.supplierName,
          fertilizers: req.items?.map(item => ({
            id: item.id,
            type: item.productName,
            quantity: item.quantity,
            unit: item.unit || 'kg',
            status: item.status,
            rejectReason: item.rejectReason,
          })) || [],
          requestDate: req.requestDate,
          status: req.status,
          notes: req.note,
          rejectReason: req.rejectReason,
        }));
        setRequests(mapped);
      } catch (err) {
        setRequests([]);
      }
    };
    fetchRequests();
  }, []);

  const handleView = (request) => {
    setSelectedRequest(request);
    // Initialize with all fertilizer IDs selected
    setSelectedFertilizers(request.fertilizers.map(f => f.id));
    setShowViewModal(true);
  };

  const closeViewModal = () => {
    setSelectedRequest(null);
    setSelectedFertilizers([]);
    setShowViewModal(false);
  };

  const toggleFertilizerSelection = (fertilizerId) => {
    setSelectedFertilizers((prev) => {
      if (prev.includes(fertilizerId)) {
        return prev.filter((id) => id !== fertilizerId);
      } else {
        return [...prev, fertilizerId];
      }
    });
  };

  const handleApprove = (id) => {
    setRequests((prev) =>
      prev.map((req) => (req.id === id ? { ...req, status: "approved" } : req))
    );
  };

  const handleReject = (id) => {
    setRejectingId(id);
    setRejectReason("");
    setShowRejectModal(true);
  };

  const confirmReject = () => {
    if (!rejectReason.trim()) return;
    setRequests((prev) =>
      prev.map((req) =>
        req.id === rejectingId
          ? { ...req, status: "rejected", rejectReason }
          : req
      )
    );
    setRejectingId(null);
    setRejectReason("");
    setShowRejectModal(false);
  };

  const cancelReject = () => {
    setRejectingId(null);
    setRejectReason("");
    setShowRejectModal(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-[#fefce8] text-[#854d0e] border border-yellow-200";
      case "approved":
        return "bg-[#e1f4ef] text-[#165E52] border border-[#cfece6]";
      case "rejected":
        return "bg-red-100 text-red-800 border border-red-200";
      default:
        return "bg-gray-100 text-gray-900";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "approved":
        return <Check className="w-4 h-4" />;
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "rejected":
        return <X className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const pendingRequests = requests.filter((r) => r.status === "pending");
  const processedRequests = requests.filter((r) => r.status !== "pending");

  // Summary Cards Styled like SupplierSummaryCards
  const summaryCards = [
    {
      type: "pending",
      label: "Pending Requests",
      value: pendingRequests.length,
      icon: <Clock size={30} color="black" />,
      border: "#f59e0b",
      ring: "ring-2 ring-[#f59e0b]/30",
    },
    {
      type: "approved",
      label: "Approved",
      value: requests.filter((r) => r.status === "approved").length,
      icon: <Check size={30} color="black" />,
      border: "#000000",
      ring: "",
    },
    {
      type: "total",
      label: "Total Requests",
      value: requests.length,
      icon: <Package size={30} color="black" />,
      border: "#d1d5db",
      ring: "",
    },
  ];

  // ----------- HEADER DESIGN ADDED BELOW --------------
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">

        {/* Modern Header Design */}
        <div className="bg-white p-5 shadow-md  mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1
              className="text-4xl font-bold mb-2 tracking-tight"
              style={{ color: ACCENT_COLOR }}
            >
              Fertilizer Requests
            </h1>
           
          </div>
          {/* Optionally, you can add a quick action/button to the header */}
          {/* <button
            className="mt-4 sm:mt-0 px-6 py-2 rounded text-white font-medium shadow bg-[#165E52] hover:bg-[#144d45] transition"
          >
            New Request
          </button> */}
        </div>

        {/* ====== Summary Cards Section ====== */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {summaryCards.map((card) => (
            <div
              key={card.label}
              className={`bg-white p-6 rounded-lg shadow-md transition-transform ${
                card.ring ? "hover:scale-[1.01]" : ""
              } ${card.ring}`}
              style={{ border: `1px solid ${card.border}` }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">{card.label}</p>
                  <p className="text-2xl font-bold text-black">{card.value}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                  {card.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* All Requests Table */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold mb-4" style={{ color: ACCENT_COLOR }}>
            Fertilizer Requests
          </h2>
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            {requests.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Package className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                No requests found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Supplier ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Supplier Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Fertilizers
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Request Item
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Request Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {requests.map((r) => (
                      <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {r.supplierId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400" />
                            {r.supplier}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          <div className="flex flex-col gap-1">
                            {r.fertilizers.slice(0, 2).map((fert, idx) => (
                              <span key={idx} className="text-xs">
                                • {fert.type}
                              </span>
                            ))}
                            {r.fertilizers.length > 2 && (
                              <span className="text-xs text-gray-500 italic">
                                +{r.fertilizers.length - 2} more
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          <span className="font-semibold">{r.fertilizers.length}</span> item{r.fertilizers.length !== 1 ? 's' : ''}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            {r.requestDate}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(r.status)}`}>
                            {getStatusIcon(r.status)}
                            {r.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <button
                            onClick={() => handleView(r)}
                            className="bg-[#165E52] text-white hover:bg-[#144d45] px-3 py-1.5 rounded-md text-xs font-medium transition-colors inline-flex items-center gap-1"
                            title="View Request Details"
                          >
                            <Eye className="w-4 h-4" />
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* View Request Modal */}
        {showViewModal && selectedRequest && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-2xl w-full shadow-2xl border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <Package className="w-6 h-6" style={{ color: ACCENT_COLOR }} />
                  Request Details
                </h3>
                <button
                  onClick={closeViewModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Supplier Name */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-500 font-medium mb-2">Supplier Name</p>
                  <p className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <User className="w-5 h-5" style={{ color: ACCENT_COLOR }} />
                    {selectedRequest.supplier}
                  </p>
                </div>

                {/* Request ID */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-500 font-medium mb-2">Request ID</p>
                  <p className="text-lg font-semibold text-gray-900">
                    #{selectedRequest.id.toString().padStart(4, '0')}
                  </p>
                </div>

                {/* Requested Fertilizers */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <p className="text-sm font-semibold text-gray-700 mb-4">
                    Requested Fertilizers ({selectedRequest.fertilizers.length})
                  </p>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {selectedRequest.fertilizers.map((fertilizer) => (
                      <label 
                        key={fertilizer.id}
                        className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors border border-transparent hover:border-[#165E52]"
                      >
                        <input
                          type="checkbox"
                          checked={selectedFertilizers.includes(fertilizer.id)}
                          onChange={() => toggleFertilizerSelection(fertilizer.id)}
                          className="mt-1 w-5 h-5 rounded border-gray-300 text-[#165E52] focus:ring-[#165E52] cursor-pointer"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {fertilizer.type}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Quantity: <span className="font-semibold">{fertilizer.quantity} {fertilizer.unit}</span>
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Additional Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 font-medium mb-1">Request Date</p>
                    <p className="text-sm text-gray-900 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {selectedRequest.requestDate}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 font-medium mb-1">Status</p>
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedRequest.status)}`}>
                      {getStatusIcon(selectedRequest.status)}
                      {selectedRequest.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                {selectedRequest.rejectReason && (
                  <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <p className="text-xs text-red-600 font-medium mb-2">Rejection Reason</p>
                    <p className="text-sm text-gray-700">
                      {selectedRequest.rejectReason}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
                {selectedRequest.status?.toLowerCase() === "pending" && (
                  <>
                    <button
                      onClick={() => {
                        handleReject(selectedRequest.id);
                        closeViewModal();
                      }}
                      className="text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      <X className="w-4 h-4 inline mr-1" />
                      Reject
                    </button>
                    <button
                      onClick={() => {
                        handleApprove(selectedRequest.id);
                        closeViewModal();
                      }}
                      className="px-4 py-2 rounded-md text-sm font-medium bg-[#165E52] text-white hover:bg-[#144d45] transition-colors"
                    >
                      <Check className="w-4 h-4 inline mr-1" />
                      Approve
                    </button>
                  </>
                )}
                <button
                  onClick={closeViewModal}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reject Modal */}
        {showRejectModal && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl border border-[#eee]">
              <h3 className="text-lg font-semibold mb-3 text-red-700 flex items-center gap-2">
                <X className="w-5 h-5" />
                Reject Request
              </h3>
              <label className="block text-sm text-gray-600 mb-1">
                Enter reason
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-red-500"
                rows="3"
              />
              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={cancelReject}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmReject}
                  disabled={!rejectReason.trim()}
                  className={`px-4 py-2 text-white rounded ${
                    rejectReason.trim()
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-red-300 cursor-not-allowed"
                  }`}
                >
                  Confirm Reject
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FertilizerRequestsPage;
