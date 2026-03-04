import { ArrowLeft, DollarSign, Download } from "lucide-react";

const ACCENT_COLOR = "#165e52";
const BORDER_COLOR = "#cfece6";
const BUTTON_COLOR = "#01251F";

export default function PaymentHeader({
  currentView,
  selectedRoute,
  onGoBack,
  onProceedPayments,
  selectedMonth,
  selectedYear,
  setSelectedMonth,
  setSelectedYear,
  monthNames,
  availableYears,
  getAvailableMonths,
}) {
  const getTitle = () => {
    if (currentView === "routes") return "Payment Management";
    if (currentView === "suppliers")
      return `Route: ${selectedRoute?.routeName} - Suppliers`;
    if (currentView === "bill") return "Payment Bill";
    return "Payment Management";
  };

  const handleGoBack = () => {
    if (currentView === "suppliers") {
      onGoBack("routes");
    } else if (currentView === "bill") {
      onGoBack("suppliers");
    }
  };

  return (
    <div className="bg-white shadow-md border-b" style={{ borderColor: BORDER_COLOR }}>
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
          {/* Title Section */}
          <div>
            <h1 className="text-3xl font-bold mb-1" style={{ color: ACCENT_COLOR }}>
              {getTitle()}
            </h1>
            <div className="text-lg font-semibold" style={{ color: ACCENT_COLOR }}>
              {monthNames[selectedMonth]} {selectedYear}
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {currentView === "routes" && (
              <button
                onClick={onProceedPayments}
                className="text-white px-5 py-2.5 text-sm font-semibold rounded-md transition-colors"
                style={{ backgroundColor: BUTTON_COLOR }}
              >
                <DollarSign className="inline-block w-4 h-4 mr-2" />
                Proceed Payments
              </button>
            )}

            {currentView !== "routes" && (
              <button
                onClick={handleGoBack}
                className="px-5 py-2.5 text-sm font-semibold rounded-md transition-colors text-white"
                style={{ backgroundColor: BUTTON_COLOR }}
              >
                <ArrowLeft className="inline-block w-4 h-4 mr-2" />
                Back
              </button>
            )}

            {/* Month Selector */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium" style={{ color: ACCENT_COLOR }}>
                Month:
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="px-3 py-2 border rounded-md text-sm"
                style={{
                  borderColor: BORDER_COLOR,
                  color: ACCENT_COLOR,
                }}
              >
                {getAvailableMonths(selectedYear).map((monthIndex) => (
                  <option key={monthIndex} value={monthIndex}>
                    {monthNames[monthIndex]}
                  </option>
                ))}
              </select>
            </div>

            {/* Year Selector */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium" style={{ color: ACCENT_COLOR }}>
                Year:
              </label>
              <select
                value={selectedYear}
                onChange={(e) => {
                  const newYear = parseInt(e.target.value);
                  setSelectedYear(newYear);
                  const availableMonths = getAvailableMonths(newYear);
                  if (!availableMonths.includes(selectedMonth)) {
                    setSelectedMonth(availableMonths[availableMonths.length - 1]);
                  }
                }}
                className="px-3 py-2 border rounded-md text-sm"
                style={{
                  borderColor: BORDER_COLOR,
                  color: ACCENT_COLOR,
                }}
              >
                {availableYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
