import { Search, Filter, ChevronDown } from "lucide-react";

const ACCENT_COLOR = "#165E52";
const BTN_COLOR = "#01251F";
const BORDER_COLOR = "#cfece6";
const BG_LIGHT_GREEN = "#e1f4ef";

export default function SupplierFilters({
  filters = {},
  handleFilterChange,
  clearFilters,
  showFilters,
  setShowFilters,
  routes = [],
  showRouteFilter = false,
  currentView = "approved",
}) {
  return (
    <div
      className="bg-white rounded-lg shadow-md border mb-6"
      style={{ borderColor: BORDER_COLOR }}
    >
      <div className="p-4">
        {/* 🔍 Search + Toggle */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-4">
          {/* 🔍 Search Field */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder={
                  currentView === "approved"
                    ? "Search supplier by name or ID..."
                    : "Search supplier by name..."
                }
                name="search"
                value={filters?.search || ""}
                onChange={handleFilterChange}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#165E52] focus:outline-none text-gray-900 transition-colors"
                style={{
                  borderColor: BORDER_COLOR,
                  color: "#000",
                }}
              />
            </div>
          </div>

          {/* ☰ Filter Toggle Button (only in approved view) */}
          {showRouteFilter && (
            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors shadow-sm"
                style={{
                  backgroundColor: BG_LIGHT_GREEN,
                  color: ACCENT_COLOR,
                  border: `2px solid ${BORDER_COLOR}`,
                }}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
                <ChevronDown
                  className={`h-4 w-4 ml-2 transition-transform ${
                    showFilters ? "rotate-180" : ""
                  }`}
                />
              </button>
            </div>
          )}
        </div>

        {/* 🔧 Expanded Filters (only in approved view) */}
        {showRouteFilter && showFilters && (
          <div
            className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg border"
            style={{ borderColor: BORDER_COLOR }}
          >
            {/* Route Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Route
              </label>
              <select
                name="route"
                value={filters?.route || ""}
                onChange={handleFilterChange}
                className="w-full p-2 rounded-md focus:ring-2 focus:ring-[#165E52] focus:outline-none text-gray-900 transition-colors"
                style={{
                  borderColor: BORDER_COLOR,
                }}
              >
                <option value="">All Routes</option>
                {routes.map((route) => (
                  <option key={route.routeId} value={route.routeId}>
                    {route.name} ({route.routeCode})
                  </option>
                ))}
              </select>
            </div>

            {/* Clear Filters */}
            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="w-30 px-4 py-2 text-sm font-medium rounded-md shadow-sm transition-colors"
                style={{
                  backgroundColor: BG_LIGHT_GREEN,
                  color: ACCENT_COLOR,
                  border: `2px solid ${BORDER_COLOR}`,
                }}
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
