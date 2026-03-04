import React, { useState } from "react";
import { ClockHistory, Search, Calendar, Package } from "lucide-react";

const ACCENT_COLOR = "#165E52";
const BORDER_COLOR = "#cfece6";
const HEADER_BG = "#e1f4ef";
const HOVER_BG = "#f0faf8";

const sampleHistory = [
  {
    id: 1,
    action: "Added Stock",
    fertilizer: "NPK 20-20-20",
    quantity: 200,
    unit: "kg",
    date: "2025-06-28",
    user: "Manager A",
    note: "Restocked after delivery.",
  },
  {
    id: 2,
    action: "Requested Fertilizer",
    fertilizer: "Urea 46%",
    quantity: 100,
    unit: "kg",
    date: "2025-06-25",
    user: "Manager B",
    note: "Requested for field trial.",
  },
  {
    id: 3,
    action: "Edited Stock",
    fertilizer: "NPK 15-15-15",
    quantity: 50,
    unit: "kg",
    date: "2025-06-20",
    user: "Manager A",
    note: "Corrected quantity after audit.",
  },
  {
    id: 4,
    action: "Deleted Stock",
    fertilizer: "Organic Compost",
    quantity: 30,
    unit: "bags (50kg)",
    date: "2025-06-15",
    user: "Manager C",
    note: "Expired stock removed.",
  },
];

const FertilizerHistoryPage = () => {
  const [search, setSearch] = useState("");

  const filtered = sampleHistory.filter(
    (h) =>
      h.fertilizer.toLowerCase().includes(search.toLowerCase()) ||
      h.action.toLowerCase().includes(search.toLowerCase()) ||
      h.user.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen p-6 bg-white">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div className="flex items-center gap-3">
            <ClockHistory className="w-8 h-8 text-[#165E52]" />
            <h1 className="text-3xl font-bold" style={{ color: ACCENT_COLOR }}>
              Fertilizer History
            </h1>
          </div>

          <div className="relative w-full md:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search history..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full md:w-64 pl-10 pr-4 py-2 rounded-lg border border-[#cfece6] bg-white focus:ring-2 focus:ring-[#165E52] focus:outline-none text-sm text-gray-900 shadow-sm"
            />
          </div>
        </div>

        {/* Table */}
        <div
          className="bg-white rounded-xl shadow-md border overflow-x-auto"
          style={{ borderColor: BORDER_COLOR }}
        >
          <table className="w-full divide-y text-sm">
            <thead>
              <tr style={{ backgroundColor: HEADER_BG }}>
                <th className="px-4 py-3 text-left font-semibold text-[#165E52]">Date</th>
                <th className="px-4 py-3 text-left font-semibold text-[#165E52]">Action</th>
                <th className="px-4 py-3 text-left font-semibold text-[#165E52]">Fertilizer</th>
                <th className="px-4 py-3 text-left font-semibold text-[#165E52]">Quantity</th>
                <th className="px-4 py-3 text-left font-semibold text-[#165E52]">User</th>
                <th className="px-4 py-3 text-left font-semibold text-[#165E52]">Note</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#cfece6]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    No history found.
                  </td>
                </tr>
              ) : (
                filtered.map((h) => (
                  <tr
                    key={h.id}
                    className="hover:bg-[#f0faf8] transition-colors"
                  >
                    <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                      {new Date(h.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-[#165E52] font-semibold whitespace-nowrap">
                      {h.action}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap flex items-center gap-2 text-gray-800">
                      <Package className="w-4 h-4 text-[#165E52]" />
                      {h.fertilizer}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-700">
                      {h.quantity} {h.unit}
                    </td>
                    <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{h.user}</td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{h.note}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FertilizerHistoryPage;
