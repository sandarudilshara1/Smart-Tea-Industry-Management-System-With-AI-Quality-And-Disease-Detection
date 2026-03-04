import { Eye, PackageX } from "lucide-react";

const ACCENT_COLOR = "#01251F";

export default function RoutesView({ filteredData, onViewRoute, loading }) {
  const getHeaderColor = () => ({
    backgroundColor: ACCENT_COLOR,
    color: "#ffffff",
  });

  const getActionButton = (route) => (
    <button
      onClick={() => onViewRoute(route)}
      className="p-2 rounded-full border"
      style={{ borderColor: ACCENT_COLOR, color: ACCENT_COLOR }}
      title="View Details"
    >
      <Eye className="w-4 h-4" />
    </button>
  );

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading routes...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
      {/* Table header */}
      <div style={getHeaderColor()}>
        <div className="grid grid-cols-6 gap-4 p-4 font-medium text-sm text-center">
          <div>Route Code</div>
          <div>Route Name</div>
          <div>Suppliers</div>
          <div>Total Weight (kg)</div>
          <div>Net Weight (kg)</div>
          <div>View Details</div>
        </div>
      </div>

      {/* Table rows */}
      <div className="divide-y divide-gray-100">
        {filteredData.map((route) => (
          <div
            key={route.routeId}
            className="grid grid-cols-6 gap-4 p-4 items-center hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 text-center"
          >
            <div className="flex justify-center">
              <span
                className="text-sm font-semibold px-3 py-1 rounded-full border"
                style={{
                  backgroundColor: "#e1f4ef",
                  color: "#165e52",
                  borderColor: "#165e52",
                }}
              >
                {route.routeCode || route.routeNumber || "N/A"}
              </span>
            </div>
            <div className="text-gray-900 font-medium text-sm">
              {route.routeName}
            </div>
            <div className="text-sm text-gray-800">{route.supplierCount}</div>
            <div className="text-sm font-semibold text-gray-800">
              {route.totalGrossWeight?.toFixed(1) || "0.0"}
            </div>
            <div className="text-sm font-medium text-gray-800">
              {route.netWeight?.toFixed(1) || "0.0"}
            </div>
            <div className="flex justify-center">{getActionButton(route)}</div>
          </div>
        ))}

        {/* Empty state */}
        {filteredData.length === 0 && (
          <div className="p-12 text-center text-gray-500">
            <div className="bg-gray-100 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <PackageX className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No routes found
            </h3>
            <p className="text-gray-600 text-sm">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
