import React, { useEffect, useState } from "react";
import { X } from "lucide-react";

const BORDER_COLOR = "#cfece6";
const HEADER_BG = "#e1f4ef";
const ACCENT_GREEN = "#165E52";

export default function RejectionModal({
  show,
  onClose,
  supplier,
  rejectionReason,
  setRejectionReason,
  onRejectSupplierRequest,
}) {
  const [rejectLoading, setRejectLoading] = useState(false);
  useEffect(() => {
    if (show) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [show]);

  if (!show) return null;

  const handleConfirm = async () => {
    if (!rejectionReason.trim()) return;
    setRejectLoading(true);
    try {
      await onRejectSupplierRequest(supplier.id, rejectionReason);
      onClose();
    } finally {
      setRejectLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[1000] backdrop-blur-sm bg-black/30 overflow-hidden">
      <div
        className="bg-white rounded-2xl w-full max-w-xl shadow-2xl border"
        style={{ borderColor: BORDER_COLOR }}
      >
        {/* Header */}
        <div
          className="p-6 border-b flex items-center space-x-3"
          style={{ borderColor: BORDER_COLOR, backgroundColor: HEADER_BG }}
        >
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <X className="w-5 h-5 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">
            Reject Supplier Registration
          </h2>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-red-900 mb-2">Confirm Rejection</h3>
            <p className="text-sm text-red-700">
              Are you sure you want to reject the registration request from{" "}
              <strong>{supplier.name}</strong>?
            </p>
            <p className="text-sm text-red-600 mt-2">
              This action cannot be undone.
            </p>
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-2">
              Reason for Rejection <span className="text-red-500">*</span>
            </label>
            <textarea
              className="border rounded-lg px-3 py-2 text-sm min-h-[120px] resize-y focus:ring-2 focus:outline-none"
              style={{
                borderColor: BORDER_COLOR,
                outlineColor: ACCENT_GREEN,
                boxShadow: "none",
              }}
              placeholder="Please provide a clear reason for rejection. This will be communicated to the supplier."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            ></textarea>
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex gap-3 justify-end p-6 border-t"
          style={{ borderColor: BORDER_COLOR, backgroundColor: HEADER_BG }}
        >
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg text-sm font-medium transition shadow-sm"
            style={{
              backgroundColor: "transparent",
              color: ACCENT_GREEN,
              border: `2px solid ${BORDER_COLOR}`,
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!rejectionReason.trim() || rejectLoading}
            className="px-6 py-2 rounded-lg text-sm font-medium text-white transition-colors flex items-center justify-center disabled:opacity-50"
            style={{
              backgroundColor: "#d90429",
              cursor:
                !rejectionReason.trim() || rejectLoading
                  ? "not-allowed"
                  : "pointer",
              opacity: !rejectionReason.trim() || rejectLoading ? 0.5 : 1,
            }}
          >
            {rejectLoading && (
              <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-white border-solid mr-2"></span>
            )}
            Confirm Rejection
          </button>
        </div>
      </div>
    </div>
  );
}
