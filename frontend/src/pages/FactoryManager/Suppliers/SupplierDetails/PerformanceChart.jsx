import React from "react";
import { TrendingUp } from "lucide-react";
import AdvanceChart from "../../../../components/charts/AdvanceChart";


export default function PerformanceChart({ supplier }) {
  // Only show for approved suppliers
  if (supplier.status === "pending" || supplier.status === "rejected") return null;


  return (
    <div className="bg-white rounded-xl shadow-sm border border-emerald-300 overflow-hidden">
      <div className="px-6 py-4 border-b border-emerald-300 bg-emerald-50">
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-emerald-600" />
          <h2 className="text-lg font-semibold text-gray-900">
            Monthly Supply Performance
          </h2>
        </div>
      </div>
      <div className="p-6">
        <AdvanceChart />
      </div>
    </div>
  );
}

