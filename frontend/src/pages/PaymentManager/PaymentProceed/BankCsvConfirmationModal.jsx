import React, { useState } from "react";
import { FileText, X, Info, Download, AlertCircle } from "lucide-react";
import { downloadBankCsv } from "../../../api/paymentManager";

// Color constants to match existing theme
const ACCENT_COLOR = "#165e52";
const BUTTON_COLOR = "#172526";
const BORDER_COLOR = "#cfece6";
const BG_LIGHT_GREEN = "#e1f4ef";

const BankCsvConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  payments = [],
}) => {
  const [isVerified, setIsVerified] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const totalAmount = payments.reduce(
    (sum, payment) => sum + (payment.amount || 0),
    0
  );

  const handleConfirm = async () => {
    if (!isVerified) return;

    try {
      setDownloading(true);
      // First call the onConfirm callback (which generates the CSV)
      const batchId = await onConfirm();

      if (!batchId) {
        throw new Error("Batch ID is missing from CSV generation response");
      }

      // Then download the CSV file
      const csvBlob = await downloadBankCsv(batchId);
      const url = window.URL.createObjectURL(csvBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `bank-payments-${batchId}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      onClose();
    } catch (err) {
      console.error("Error downloading CSV:", err);
      alert("Failed to download CSV. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div
          className="px-6 py-4 rounded-t-lg border-b"
          style={{ backgroundColor: BG_LIGHT_GREEN, borderColor: BORDER_COLOR }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="p-2 rounded-lg"
                style={{ backgroundColor: BG_LIGHT_GREEN }}
              >
                <FileText size={24} style={{ color: ACCENT_COLOR }} />
              </div>
              <h2
                className="text-xl font-semibold"
                style={{ color: ACCENT_COLOR }}
              >
                Generate Bank CSV
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition duration-200"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Summary */}
          <div className="mb-6">
            <p className="text-gray-700 mb-2">
              You are about to generate CSV for bank transfer
            </p>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Payment count:</span>
              <span className="font-medium">{payments.length} payments</span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-gray-600">Total amount:</span>
              <span className="text-2xl font-bold text-gray-900">
                Rs.{" "}
                {totalAmount.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>

          {/* Details Table */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              Payment Details
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-200 rounded-lg">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b">
                      Supplier
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b">
                      Account Number
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment, index) => (
                    <tr
                      key={payment.id || index}
                      className="border-b border-gray-200"
                    >
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {payment.supplierName}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 font-mono">
                        {payment.accountNumber || payment.bankAccount || "N/A"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        Rs.{" "}
                        {payment.amount?.toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }) || "0.00"}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-gray-50 border-t-2 border-gray-300">
                    <td className="px-4 py-3 text-sm font-bold text-gray-900">
                      Total
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-gray-900">
                      -
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-gray-900">
                      Rs.{" "}
                      {totalAmount.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Info Box */}
          <div
            className="border rounded-lg p-4 mb-6"
            style={{
              backgroundColor: BG_LIGHT_GREEN,
              borderColor: BORDER_COLOR,
            }}
          >
            <div className="flex items-start gap-3">
              <Info
                size={20}
                className="mt-0.5"
                style={{ color: ACCENT_COLOR }}
              />
              <p className="text-sm" style={{ color: ACCENT_COLOR }}>
                CSV file will be downloaded immediately. Please review before
                uploading to bank system.
              </p>
            </div>
          </div>

          {/* Checkbox */}
          <div className="mb-6">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={isVerified}
                onChange={(e) => setIsVerified(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">
                I have verified all payment details are correct
              </span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 rounded-b-lg border-t border-gray-200">
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              disabled={downloading}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition duration-200 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!isVerified || downloading || payments.length === 0}
              className={`px-6 py-2 rounded-lg font-medium transition duration-200 flex items-center gap-2 ${
                isVerified && !downloading && payments.length > 0
                  ? "text-white"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
              style={
                isVerified && !downloading && payments.length > 0
                  ? { backgroundColor: BUTTON_COLOR }
                  : {}
              }
            >
              {downloading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Download size={16} />
                  Generate & Download CSV
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BankCsvConfirmationModal;
