import { teaRate } from "./paymentData";
import { DollarSign, Banknote, HandCoins, X } from "lucide-react";

const ACCENT_COLOR = "#165E52";
const BTN_COLOR = "#01251F";
const BORDER_COLOR = "#cfece6";
const HEADER_BG = "#e1f4ef";

export default function PaymentModal({
  showPaymentModal,
  closePaymentModal,
  paymentView,
  showConfirmation,
  showConfirmDialog,
  showDownloadDialog,
  handleConfirmPayments,
  handleConfirmYes,
  handleConfirmNo,
  handleDownloadCSV,
  handleDownloadConfirmYes,
  handleDownloadConfirmNo,
  selectedMonth,
  selectedYear,
  monthNames,
  stats,
}) {
  if (!showPaymentModal) return null;

  const CrossButton = ({ onClick }) => (
    <button
      onClick={onClick}
      aria-label="Close"
      className="absolute top-4 right-4 rounded-full p-1 hover:bg-gray-200 transition"
      style={{ lineHeight: 0 }}
    >
      <X size={22} color="#333" />
    </button>
  );

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50">
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto border relative"
        style={{ borderColor: BORDER_COLOR }}
      >
        <CrossButton onClick={closePaymentModal} />

        {/* Header */}
        <div
          className="p-6 rounded-t-2xl border-b text-center"
          style={{ backgroundColor: HEADER_BG, borderColor: BORDER_COLOR }}
        >
          <h2 className="text-xl font-semibold" style={{ color: ACCENT_COLOR }}>
            Payment Processing
          </h2>
          <p className="text-sm mt-1 text-gray-700">
            {monthNames[selectedMonth]} {selectedYear} – Tea Leaf Payments
          </p>
        </div>

        <div className="p-6">
          {paymentView === "summary" && (
            <>
              {/* Submitted Tea Rate Card */}
              <div
                className="bg-white p-6 rounded-lg shadow-md mb-6 flex flex-col items-center"
                style={{ border: "1.5px solid black" }}
              >
                <div className="flex flex-col items-center">
                  <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                    <DollarSign size={30} color="black" />
                  </div>
                  <p className="text-sm font-medium text-black text-center w-full mb-3">
                    Submitted Tea Rate : 233.00 Rs/Kg
                  </p>
                </div>
                <p className="text-sm text-black mb-2 text-center">
                  <span className="font-medium">Submission Date:</span> {teaRate.submittedDate}
                </p>
                
              </div>

              {/* Payment Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div
                  className="bg-white p-6 rounded-lg shadow-md flex flex-col justify-between"
                  style={{ border: "1.5px solid black" }}
                >
                  <div className="flex items-center justify-between pb-3">
                    <p className="text-sm font-medium text-black">Total Payments</p>
                    <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center">
                      <DollarSign size={30} color="black" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-black">
                    {stats.totalAmount !== undefined
                      ? `Rs. ${stats.totalAmount.toLocaleString()}`
                      : ""}
                  </p>
                </div>
                <div
                  className="bg-white p-6 rounded-lg shadow-md flex flex-col justify-between"
                  style={{ border: "1.5px solid black" }}
                >
                  <div className="flex items-center justify-between pb-3">
                    <p className="text-sm font-medium text-black">Advance Payments</p>
                    <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center">
                      <Banknote size={30} color="black" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-black">
                    {stats.bankAmount !== undefined
                      ? `Rs. ${stats.bankAmount.toLocaleString()}`
                      : ""}
                  </p>
                  {stats.bankPayments !== undefined && (
                    <p className="text-sm font-medium text-black">{stats.bankPayments} suppliers</p>
                  )}
                </div>
                <div
                  className="bg-white p-6 rounded-lg shadow-md flex flex-col justify-between"
                  style={{ border: "1.5px solid black" }}
                >
                  <div className="flex items-center justify-between pb-3">
                    <p className="text-sm font-medium text-black">Loan Payments</p>
                    <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center">
                      <HandCoins size={30} color="black" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-black">
                    {stats.cashAmount !== undefined
                      ? `Rs. ${stats.cashAmount.toLocaleString()}`
                      : ""}
                  </p>
                  {stats.cashPayments !== undefined && (
                    <p className="text-sm font-medium text-black">{stats.cashPayments} suppliers</p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-center gap-4">
                {!showConfirmation && (
                  <>
                    <button
                      onClick={handleConfirmPayments}
                      className="px-6 py-3 rounded-lg text-white font-medium shadow"
                      style={{ backgroundColor: BTN_COLOR }}
                    >
                      Confirm All Payments
                    </button>
                    <button
                      onClick={closePaymentModal}
                      className="px-6 py-3 rounded-lg font-medium"
                      style={{
                        border: `2px solid ${BORDER_COLOR}`,
                        backgroundColor: "transparent",
                        color: ACCENT_COLOR,
                      }}
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>

              {/* Confirmation Message */}
              {showConfirmation && (
                <div
                  className="text-center mt-6 border rounded-lg p-6"
                  style={{ backgroundColor: "#f0faf7", borderColor: BORDER_COLOR }}
                >
                  <h3 className="text-xl font-semibold mb-2" style={{ color: ACCENT_COLOR }}>
                    Payments Confirmed
                  </h3>
                  <p className="text-gray-700">
                    All payments for {monthNames[selectedMonth]} {selectedYear} have been
                    successfully confirmed.
                  </p>
                  <div className="mt-4">
                    <button
                      onClick={handleDownloadCSV}
                      disabled={!showConfirmation}
                      className={`px-6 py-2 rounded-lg font-medium text-white shadow transition ${
                        showConfirmation ? "" : "opacity-50 cursor-not-allowed"
                      }`}
                      style={{
                        backgroundColor: showConfirmation ? BTN_COLOR : "#ccc",
                      }}
                    >
                      Download CSV
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmDialog && (
        <div className="fixed inset-0 flex items-center justify-center z-[1000] backdrop-blur-sm bg-black/30">
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 border relative"
            style={{ borderColor: BORDER_COLOR }}
          >
            <CrossButton onClick={closePaymentModal} />
            <div className="p-6 text-center">
              <h3 className="text-xl font-semibold mb-4" style={{ color: ACCENT_COLOR }}>
                Are you sure?
              </h3>
              <p className="text-gray-600 mb-6">
                This will confirm all payments for {monthNames[selectedMonth]} {selectedYear}.
                This cannot be undone.
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={handleConfirmYes}
                  className="px-6 py-2 rounded-lg text-white font-medium transition"
                  style={{ backgroundColor: BTN_COLOR }}
                >
                  Yes, Confirm
                </button>
                <button
                  onClick={handleConfirmNo}
                  className="px-6 py-2 rounded-lg font-medium"
                  style={{
                    border: `2px solid ${BORDER_COLOR}`,
                    backgroundColor: "transparent",
                    color: ACCENT_COLOR,
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Download Modal */}
      {showDownloadDialog && (
        <div className="fixed inset-0 flex items-center justify-center z-[1000] backdrop-blur-sm bg-black/30">
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 border relative"
            style={{ borderColor: BORDER_COLOR }}
          >
            <CrossButton onClick={closePaymentModal} />
            <div className="p-6 text-center">
              <h3 className="text-xl font-semibold mb-4 text-black">
                Download CSV File?
              </h3>
              <p className="text-gray-600 mb-6">
                This will download the payment details for {monthNames[selectedMonth]} {selectedYear}.
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={handleDownloadConfirmYes}
                  className="px-6 py-2 rounded-lg text-white font-medium"
                  style={{ backgroundColor: BTN_COLOR }}
                >
                  Yes, Download
                </button>
                <button
                  onClick={handleDownloadConfirmNo}
                  className="px-6 py-2 rounded-lg font-medium"
                  style={{
                    border: `2px solid ${BORDER_COLOR}`,
                    backgroundColor: "transparent",
                    color: ACCENT_COLOR,
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
