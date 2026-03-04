import { X } from "lucide-react";
import { useState } from "react";
import { getStatusColor, formatDate } from "./fertilizerUtils";

export default function FertilizerRequestModal({ request, isOpen, onClose, onApprove, onReject, loading }) {
  const [showRejectBox, setShowRejectBox] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center border-b pb-4">
            <h2 className="text-xl font-bold">Request Details</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          {request ? (
            <div className="py-4">
              {/* Request ID and Status */}
              <div className="flex justify-between items-center mb-4">
                <div>
                  <span className="text-sm text-gray-500">Request ID</span>
                  <h3 className="text-lg font-medium">{request.id}</h3>
                </div>
                <div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
                    {request.status}
                  </span>
                </div>
              </div>

              {/* Main Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <span className="text-sm text-gray-500">Fertilizer Type</span>
                  <p className="font-medium">{request.categoryName}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Company</span>
                  <p className="font-medium">{request.companyName}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Quantity</span>
                  <p className="font-medium">
                    {request.quantity} {request.unit || 'kg'}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Requested By</span>
                  <p className="font-medium">{request.userName}</p>
                </div>
              </div>

              {/* Additional Info */}
              <div className="mb-4">
                <span className="text-sm text-gray-500">Note</span>
                <p className="p-3 bg-gray-50 rounded-md">{request.note || "No notes provided"}</p>
              </div>

              {request.description && (
                <div className="mb-4">
                  <span className="text-sm text-gray-500">Description</span>
                  <p className="p-3 bg-gray-50 rounded-md">{request.description}</p>
                </div>
              )}

              {request.rejectReason && (
                <div className="mb-4">
                  <span className="text-sm text-gray-500">Rejection Reason</span>
                  <p className="p-3 bg-gray-50 rounded-md text-red-600">{request.rejectReason}</p>
                </div>
              )}

              {/* Timestamps */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 text-sm text-gray-500">
                <div>
                  <span>Created: {formatDate(request.createdAt)}</span>
                </div>
                <div>
                  <span>Last Updated: {formatDate(request.updatedAt)}</span>
                </div>
              </div>

              {/* Actions */}
              {request.status === "PENDING" && (
                <div className="flex flex-col gap-3 mt-6 pt-4 border-t">
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => setShowRejectBox((prev) => !prev)}
                      className="px-4 py-2 border border-red-500 text-red-600 rounded-md hover:bg-red-50 disabled:opacity-50"
                      disabled={loading}
                    >
                      {loading === "reject" ? "Rejecting..." : "Reject"}
                    </button>
                    <button
                      onClick={() => onApprove(request.id)}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                      disabled={loading}
                    >
                      {loading === "approve" ? "Approving..." : "Approve"}
                    </button>
                  </div>
                  {showRejectBox && (
                    <div className="mt-2 flex flex-col items-end gap-2">
                      <input
                        type="text"
                        className="w-full border border-red-300 rounded-md p-2"
                        placeholder="Enter reject reason..."
                        value={rejectReason}
                        onChange={e => setRejectReason(e.target.value)}
                        disabled={loading}
                      />
                      <button
                        onClick={() => onReject(request.id, rejectReason)}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                        disabled={loading || !rejectReason.trim()}
                      >
                        Confirm Reject
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="py-6 text-center">Request not found</div>
          )}
        </div>
      </div>
    </div>
  );
}