import { useState } from "react";
import { TrendingUp, Users, DollarSign } from "lucide-react";
import OwnerPaymentReport from "./OwnerPaymentReport";
import ViewAdvanceFactoryWise from "./viewAdvanceFactoryWise";
import ViewLoanFactoryWise from "./viewLoanFactoryWise";
import ViewPaymentFactoryWise from "./viewPaymentFactoryWise";

const ACCENT_COLOR = "#165E52";
const BORDER_COLOR = "#cfece6";
const HEADER_BG = "#e1f4ef";

const factoryData = [
  { factory: "Factory A", teaPayment: 500000, loan: 120000, advance: 70000 },
  { factory: "Factory B", teaPayment: 350000, loan: 90000, advance: 50000 },
  { factory: "Factory C", teaPayment: 250000, loan: 80000, advance: 40000 },
  { factory: "Factory D", teaPayment: 150000, loan: 60000, advance: 20000 },
];

function Payment() {
  const [totalTeaPayment] = useState(1250000);
  const [totalLoanAmount] = useState(350000);
  const [totalAdvances] = useState(180000);
  const [popup, setPopup] = useState(null); // 'tea' | 'loan' | 'advance' | null
  const [factorySearch, setFactorySearch] = useState("");
  const [selectedFactory, setSelectedFactory] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header
        className="shadow-sm border-b"
        // style={{ borderColor: BORDER_COLOR }}
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1
                className="text-3xl font-bold text-gray-900"
                // style={{ color: ACCENT_COLOR }}
              >
                Payments Overview
              </h1>
              <p
                className="text-gray-700 opacity-90 mt-1"
                // style={{ color: ACCENT_COLOR }}
              >
                Owner Dashboard - Payment Summary
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 sm:px-6 lg:px-8 py-8">
        {/* Payment Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {[
            {
              type: "tea",
              label: "Tea Leaves Payment",
              value: totalTeaPayment,
              description: "Total cost paid for tea leaves",
              icon: <TrendingUp size={28} color="black" />,
            },
            {
              type: "loan",
              label: "Loan Amount Given",
              value: totalLoanAmount,
              description: "Total loan amount given to suppliers",
              icon: <DollarSign size={28} color="black" />,
            },
            {
              type: "advance",
              label: "Advances Given",
              value: totalAdvances,
              description: "Total advances given to suppliers",
              icon: <Users size={28} color="black" />,
            },
          ].map((card) => (
            <div
              key={card.type}
              className="bg-white p-6 rounded-lg shadow-md border border-black transition duration-200 hover:shadow-lg hover:border-[#cfece6] flex items-center justify-between cursor-pointer"
              onClick={() => setPopup(card.type)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  setPopup(card.type);
                }
              }}
              aria-pressed={popup === card.type}
            >
              <div>
                <p className="text-sm font-medium text-black">{card.label}</p>
                <p className="text-2xl font-bold text-black">
                  {card.value.toLocaleString()}
                </p>
                <p className="text-xs text-gray-600 mt-1">{card.description}</p>
              </div>
              <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center">
                {card.icon}
              </div>
            </div>
          ))}
        </section>

        {/* Factory Details Lookup Section */}
        <section
          className="rounded-lg border border-black p-8 flex flex-col w-full mb-2"
          aria-label="Factory Details Lookup"
        >
          {/* Section Title (simple styled div as title, no hover/shadow) */}
          <div
            className="mb-2 font-semibold"
            style={{
              color: ACCENT_COLOR,
              fontSize: "1.25rem",
              userSelect: "none",
            }}
          >
            Factory Details Lookup
          </div>

          <p
            className="text-base mb-4 leading-relaxed"
            style={{ color: ACCENT_COLOR }}
          >
            You can view all payment, loan, and advance details for a specific
            factory. Use the search box below to find a factory and see its
            summary.
          </p>

          <div className="w-full max-w-md relative">
            <input
              type="text"
              placeholder="Search factory name..."
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#165E52] focus:border-[#165E52] transition-all text-gray-900 placeholder-gray-400 mb-2"
              style={{ borderColor: BORDER_COLOR, color: ACCENT_COLOR }}
              value={factorySearch}
              onChange={(e) => {
                setFactorySearch(e.target.value);
                setSelectedFactory(null);
              }}
              autoComplete="off"
              onFocus={() => setShowDropdown(true)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
              aria-label="Search factory"
            />
            {showDropdown && (
              <div className="absolute left-0 right-0 z-20 bg-white rounded-lg shadow-lg border border-gray-300 divide-y divide-gray-200 max-h-48 overflow-y-auto mt-1">
                {factorySearch &&
                factoryData.filter((f) =>
                  f.factory.toLowerCase().includes(factorySearch.toLowerCase())
                ).length === 0 ? (
                  <div className="p-3 text-gray-500 text-center">
                    No factories found.
                  </div>
                ) : (
                  factoryData
                    .filter((f) =>
                      f.factory
                        .toLowerCase()
                        .includes(factorySearch.toLowerCase())
                    )
                    .map((f) => (
                      <div
                        key={f.factory}
                        className="p-3 cursor-pointer hover:bg-[#d9f0e7] rounded text-[#165E52] font-semibold transition-colors"
                        onMouseDown={() => {
                          setSelectedFactory(f);
                          setFactorySearch(f.factory);
                          setShowDropdown(false);
                        }}
                      >
                        {f.factory}
                      </div>
                    ))
                )}
              </div>
            )}
          </div>

          {/* Factory Details Modal */}
          {selectedFactory && (
            <div className="fixed inset-0 backdrop-blur-[2px] bg-white/60 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto relative p-6">
                <button
                  onClick={() => setSelectedFactory(null)}
                  className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl font-bold z-10"
                  aria-label="Close"
                >
                  &times;
                </button>
                <h3
                  className="text-lg font-bold"
                  style={{ color: ACCENT_COLOR }}
                >
                  {selectedFactory.factory}
                </h3>
                <div className="space-y-2 mt-4">
                  <div className="flex justify-between">
                    <span
                      className="font-medium"
                      style={{ color: ACCENT_COLOR }}
                    >
                      Tea Leaves Payment:
                    </span>
                    <span className="font-bold text-[#165E52]">
                      LKR {selectedFactory.teaPayment.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span
                      className="font-medium"
                      style={{ color: ACCENT_COLOR }}
                    >
                      Loan Amount:
                    </span>
                    <span className="font-bold text-[#165E52]">
                      LKR {selectedFactory.loan.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span
                      className="font-medium"
                      style={{ color: ACCENT_COLOR }}
                    >
                      Advances Given:
                    </span>
                    <span className="font-bold text-[#165E52]">
                      LKR {selectedFactory.advance.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Owner Payment Report Section */}
      <section className="max-w-7xl mx-auto px-6 sm:px-6 lg:px-8 py-4">
        <OwnerPaymentReport />
      </section>

      {/* Popup Overlay for detail views */}
      {popup && (
        <div className="fixed inset-0 backdrop-blur-[2px] bg-white/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto relative p-6">
            <button
              onClick={() => setPopup(null)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl font-bold z-10"
              aria-label="Close"
            >
              &times;
            </button>
            <div>
              {popup === "tea" && <ViewPaymentFactoryWise />}
              {popup === "loan" && <ViewLoanFactoryWise />}
              {popup === "advance" && <ViewAdvanceFactoryWise />}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Payment;
