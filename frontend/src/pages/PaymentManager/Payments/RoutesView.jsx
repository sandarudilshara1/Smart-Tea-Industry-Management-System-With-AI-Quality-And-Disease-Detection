import { Eye, Truck } from "lucide-react";

const ACCENT_COLOR = "#01251F";
const BORDER_COLOR = "#cfece6";

export default function RoutesView({ filteredData, getCurrentData, onViewRoute }) {
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
      {/* Table Header */}
      <div className="bg-[#01251F] text-white">
        <div className="grid grid-cols-6 gap-4 p-4 font-medium text-sm text-center">
          <div className="text-left">Route Number</div>
          <div className="text-left">Route Name</div>
          <div>Suppliers</div>
          <div>Total Weight (kg)</div>
          <div>Total Amount</div>
          <div>View</div>
        </div>
      </div>

      {/* Table Rows */}
      <div className="divide-y divide-gray-100">
        {filteredData.map((route) => (
          <div
            key={route.id}
            className="grid grid-cols-6 gap-4 px-4 py-3 items-center hover:bg-gray-50 transition"
          >
            <div className="text-sm font-medium">
              <span className="px-3 py-1 border border-black rounded-full text-xs inline-block">
                {route.routeNumber}
              </span>
            </div>
            <div className="text-sm font-semibold text-gray-900 text-left">{route.routeName}</div>
            <div className="text-sm text-gray-800 font-medium text-center">{route.supplierCount}</div>
            <div className="text-sm text-gray-900 font-semibold text-center">{route.totalWeight.toFixed(1)}</div>
            <div className="text-sm text-gray-900 font-semibold text-right">
              Rs. {route.totalAmount.toLocaleString()}
            </div>
            <div className="flex justify-center">
              <button
                onClick={() => onViewRoute(route)}
                className="p-2 rounded-full border hover:bg-gray-100 text-[#01251F] transition"
                title="View Details"
                style={{ borderColor: ACCENT_COLOR }}
              >
                <Eye className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}

        {/* Empty State */}
        {filteredData.length === 0 && (
          <div className="p-12 text-center text-gray-500">
            <div className="bg-gray-100 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <Truck className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No routes found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>

      {/* Results Count (Bottom Footer) */}
      <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 text-sm text-gray-600 flex justify-between">
        <span>
          Showing <strong>{filteredData.length}</strong> of{" "}
          <strong>{getCurrentData().length}</strong> results
        </span>
      </div>
    </div>
  );
}
