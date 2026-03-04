import { Filter, X, Search, ChevronDown } from "lucide-react";
import { useState } from "react";

// Design tokens using constants
const ACCENT_COLOR = "#165E52";
const BTN_COLOR = "#01251F"; // currently unused in this component, add if needed
const BORDER_COLOR = "#cfece6";
const BG_LIGHT_GREEN = "#e1f4ef";

export default function InventoryFilters({
  filters,
  onFiltersChange,
  currentView,
}) {
  const [showFilters, setShowFilters] = useState(false);

  const getSearchPlaceholder = () => {
    if (currentView === "routes") return "Search routes...";
    if (currentView === "suppliers") return "Search suppliers...";
    return "Search...";
  };

  const onClearFilters = () => {
    onFiltersChange({
      search: "",
      sortOrder: "",
      status: "All",
    });
  };

  return (
    <div
      className="bg-white rounded-lg shadow-md border mb-6"
      style={{ borderColor: BORDER_COLOR }}
    >
      <div className="p-4">
        {/* 🔍 Search + Filter Toggle */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-4">
          {/* 🔍 Search Field */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder={getSearchPlaceholder()}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#165E52] focus:outline-none text-gray-900 transition-colors"
                style={{
                  borderColor: BORDER_COLOR,
                }}
                value={filters.search}
                onChange={(e) =>
                  onFiltersChange({ ...filters, search: e.target.value })
                }
              />
            </div>
          </div>

          {/* ☰ Filter Toggle Button */}
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

        {/* 🧩 Extra Filters Section */}
        {showFilters && (
          <div
            className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 bg-gray-50 border rounded-lg"
            style={{ borderColor: BORDER_COLOR }}
          >
            {/* ↕️ Sort Filter */}
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: ACCENT_COLOR }}
              >
                Sort by Weight
              </label>
              <select
                value={filters.sortOrder || ""}
                onChange={(e) =>
                  onFiltersChange({ ...filters, sortOrder: e.target.value })
                }
                className="w-full p-2 rounded-md focus:ring-2 focus:ring-[#165E52] focus:outline-none text-gray-900 transition-colors"
                style={{
                  borderColor: BORDER_COLOR,
                }}
              >
                <option value="">Default Order</option>
                <option value="desc">High Weight First</option>
                <option value="asc">Low Weight First</option>
              </select>
            </div>

            {/* 🧼 Clear Filters Button */}
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
                <X className="inline-block mb-0.5 mr-2" size={15} />
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
