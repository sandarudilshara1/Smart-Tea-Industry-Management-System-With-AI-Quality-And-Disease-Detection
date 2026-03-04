import { Route, Users, Scale } from "lucide-react";

export default function RouteSummaryCards({ currentView, summary }) {
  if (currentView === "routes") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {/* Total Routes Card */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-black transition-all duration-200 hover:shadow-lg hover:border-black">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-black">Total Routes</p>
              <p className="text-2xl font-bold text-black">{summary.totalRoutes || 0}</p>
              <p className="text-xs text-neutral-700">{summary.activeRoutes || 0} active</p>
            </div>
            <div className="h-12 w-12 bg-neutral-100 rounded-full flex items-center justify-center">
              <Route className="w-6 h-6 text-black" />
            </div>
          </div>
        </div>

        {/* Total Suppliers Card */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-black transition-all duration-200 hover:shadow-lg hover:border-black">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-black">Total Suppliers</p>
              <p className="text-2xl font-bold text-black">{summary.totalSuppliers || 0}</p>
              <p className="text-xs text-neutral-700">Across all routes</p>
            </div>
            <div className="h-12 w-12 bg-neutral-100 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-black" />
            </div>
          </div>
        </div>

        {/* Total Load Card */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-black transition-all duration-200 hover:shadow-lg hover:border-black">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-black">Total Load</p>
              <p className="text-2xl font-bold text-black">
                {(summary.totalLoad?.toFixed(1) || "0.0")} kg
              </p>
            </div>
            <div className="h-12 w-12 bg-neutral-100 rounded-full flex items-center justify-center">
              <Scale className="w-6 h-6 text-black" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
