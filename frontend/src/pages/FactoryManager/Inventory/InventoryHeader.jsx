export default function InventoryHeader({
  currentView,
  selectedRoute,
  viewMode,
  onViewModeChange,
  selectedDate,
  onDateChange,
  selectedMonth,
  selectedYear,
  onMonthChange,
  onYearChange,
  monthNames,
  availableYears,
  getAvailableMonths,
  onBackToRoutes,
  onBackToSuppliers,
}) {
  const ACCENT = "#165E52";
  const BG_PRIMARY = "#01251F";
  const BORDER = "#cfece6";
  const BG_LIGHT = "#e1f4ef";

  const getTitle = () => {
    if (currentView === "routes") return "Inventory Management";
    if (currentView === "suppliers") return selectedRoute?.routeName || "Route";
    if (currentView === "detail") return "Inventory Details";
    return "Inventory";
  };

  const handleGoBack = () => {
    if (currentView === "suppliers") {
      onBackToRoutes();
    } else if (currentView === "detail") {
      onBackToSuppliers();
    }
  };

  return (
    <div
      className="bg-white shadow-md border-b"
      style={{ borderColor: BORDER }}
    >
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
          {/* Title */}
          <div>
            <p className="text-3xl font-bold mb-1" style={{ color: ACCENT }}>
              {getTitle()}
            </p>
          </div>

          {/* Right Controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {(currentView === "suppliers" || currentView === "detail") && (
              <button
                onClick={handleGoBack}
                className="px-6 py-3 rounded-lg text-sm font-semibold transition-colors duration-200"
                style={{
                  backgroundColor: BG_LIGHT,
                  color: ACCENT,
                  border: `1px solid ${BORDER}`,
                }}
              >
                ← Back
              </button>
            )}

            {/* View Mode Buttons (Only for routes/suppliers) */}
            {(currentView === "routes" || currentView === "suppliers") && (
              <>
                {/* View Toggle */}
                <div className="flex gap-2">
                  {["daily", "monthly"].map((mode) => (
                    <button
                      key={mode}
                      onClick={() => onViewModeChange(mode)}
                      className={`px-4 py-2 text-sm font-medium rounded-lg min-w-[90px] transition-colors duration-200 ${
                        viewMode === mode
                          ? "bg-[#01251F] text-white border border-[#01251F] shadow"
                          : "bg-white text-[#01251F] border border-[#01251F] hover:bg-[#01251F] hover:text-white"
                      }`}
                      style={{
                        outline: "none",
                      }}
                    >
                      {mode.charAt(0).toUpperCase() + mode.slice(1)}
                    </button>
                  ))}
                </div>

                {/* Controls for Daily View */}
                {viewMode === "daily" && (
                  <>
                    <button
                      onClick={() => {
                        const today = new Date();
                        const todayStr = today.toISOString().split("T")[0];

                        const yesterday = new Date();
                        yesterday.setDate(today.getDate() - 1);
                        const yesterdayStr = yesterday
                          .toISOString()
                          .split("T")[0];

                        onDateChange(
                          selectedDate === todayStr ? yesterdayStr : todayStr
                        );
                      }}
                      className="px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 min-w-[90px]"
                      style={{
                        backgroundColor: BG_LIGHT,
                        color: ACCENT,
                        border: `1px solid ${BORDER}`,
                      }}
                    >
                      {(() => {
                        const today = new Date().toISOString().split("T")[0];
                        return selectedDate === today ? "Yesterday" : "Today";
                      })()}
                    </button>

                    <div className="flex items-center gap-2">
                      <label
                        className="text-sm font-medium"
                        style={{ color: ACCENT }}
                      >
                        Date:
                      </label>
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => onDateChange(e.target.value)}
                        className="px-3 py-2 rounded-lg font-medium outline-none"
                        style={{
                          color: ACCENT,
                          backgroundColor: BG_LIGHT,
                          border: `1px solid ${BORDER}`,
                        }}
                      />
                    </div>
                  </>
                )}

                {/* Controls for Monthly View */}
                {viewMode === "monthly" && (
                  <>
                    <div className="flex items-center gap-2">
                      <label
                        className="text-sm font-medium"
                        style={{ color: ACCENT }}
                      >
                        Month:
                      </label>
                      <select
                        value={selectedMonth}
                        onChange={(e) =>
                          onMonthChange(parseInt(e.target.value))
                        }
                        className="px-3 py-2 rounded-lg font-medium"
                        style={{
                          backgroundColor: BG_LIGHT,
                          color: ACCENT,
                          border: `1px solid ${BORDER}`,
                        }}
                      >
                        {getAvailableMonths(selectedYear).map((monthIndex) => (
                          <option key={monthIndex} value={monthIndex}>
                            {monthNames[monthIndex]}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <label
                        className="text-sm font-medium"
                        style={{ color: ACCENT }}
                      >
                        Year:
                      </label>
                      <select
                        value={selectedYear}
                        onChange={(e) => {
                          const newYear = parseInt(e.target.value);
                          onYearChange(newYear);
                          const availableMonths = getAvailableMonths(newYear);
                          if (!availableMonths.includes(selectedMonth)) {
                            onMonthChange(
                              availableMonths[availableMonths.length - 1]
                            );
                          }
                        }}
                        className="px-3 py-2 rounded-lg font-medium"
                        style={{
                          backgroundColor: BG_LIGHT,
                          color: ACCENT,
                          border: `1px solid ${BORDER}`,
                        }}
                      >
                        {availableYears.map((year) => (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
