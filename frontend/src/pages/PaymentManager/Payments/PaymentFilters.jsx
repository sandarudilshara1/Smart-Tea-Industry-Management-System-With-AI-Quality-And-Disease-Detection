import { Filter, Search, ChevronDown } from "lucide-react";
import { useState } from "react";

const ACCENT_COLOR = "#165E52";
const BORDER_COLOR = "#cfece6";
const BG_LIGHT_GREEN = "#e1f4ef";

export default function PaymentFilters({
  filters,
  setFilters,
  currentView,
  onClearFilters,
}) {
  const [showFilters, setShowFilters] = useState(false);

  const getSearchPlaceholder = () => {
    if (currentView === "routes") return "Search routes...";
    if (currentView === "suppliers") return "Search suppliers...";
    return "Search...";
  };

  return (
    <div
      className="bg-white rounded-lg shadow-md border mb-6"
      style={{ borderColor: BORDER_COLOR }}
    >
      <div className="p-4">
        {/* 🔍 Search + Toggle */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-4">
          {/* Search input */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder={getSearchPlaceholder()}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#165E52] focus:outline-none text-gray-900 transition-colors"
                value={filters.search}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    search: e.target.value,
                  }))
                }
                style={{ borderColor: BORDER_COLOR }}
              />
            </div>
          </div>

          {/* Filters Toggle Button */}
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
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div
            className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg border"
            style={{ borderColor: BORDER_COLOR }}
          >
            {/* Sort by Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort by Amount
              </label>
              <select
                value={filters.sortOrder || ""}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, sortOrder: e.target.value }))
                }
                className="w-full p-2 rounded-md focus:ring-2 focus:ring-[#165E52] focus:outline-none text-gray-900 transition-colors"
                style={{ borderColor: BORDER_COLOR }}
              >
                <option value="">Default Order</option>
                <option value="high">High Payment First</option>
                <option value="low">Low Payment First</option>
              </select>
            </div>

            {/* Payment status and method (only for suppliers) */}
            {currentView === "suppliers" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Status</label>
                  <select
                    value={filters.status || "All"}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        status: e.target.value,
                      }))
                    }
                    className="w-full p-2 rounded-md focus:ring-2 focus:ring-[#165E52] focus:outline-none text-gray-900 transition-colors"
                    style={{ borderColor: BORDER_COLOR }}
                  >
                    <option value="All">All Status</option>
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                  <select
                    value={filters.paymentMethod || "All"}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        paymentMethod: e.target.value,
                      }))
                    }
                    className="w-full p-2 rounded-md focus:ring-2 focus:ring-[#165E52] focus:outline-none text-gray-900 transition-colors"
                    style={{ borderColor: BORDER_COLOR }}
                  >
                    <option value="All">All Methods</option>
                    <option value="Bank">Bank</option>
                    <option value="Cash">Cash</option>
                  </select>
                </div>
              </>
            )}

            {/* Clear Filters Button */}
            <div className="flex items-end">
              <button
                onClick={onClearFilters}
                className="w-full px-4 py-2 text-sm font-medium rounded-md shadow-sm transition-colors"
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
