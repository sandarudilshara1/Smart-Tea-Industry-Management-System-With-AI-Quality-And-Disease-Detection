import { Eye } from "lucide-react";

const ACCENT_COLOR = "#01251F";
const BORDER_COLOR = "#cfece6";

export default function DriversView({ data, getCurrentData, onView }) {
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
      {/* Table Header */}
      <div className="bg-[#01251F] text-white">
        <div className="grid grid-cols-6 gap-4 p-4 font-medium text-sm text-center">
          <div className="text-left">Payment ID</div>
          <div className="text-left">Driver Name</div>
          <div>Date</div>
          <div>Status</div>
          <div>Total Amount</div>
          <div>View</div>
        </div>
      </div>

      {/* Table Rows */}
      <div className="divide-y divide-gray-100">
        {data.map((row) => (
          <div
            key={row.pid}
            className="grid grid-cols-6 gap-4 px-4 py-3 items-center hover:bg-gray-50 transition"
          >
            <div className="text-sm font-medium">
              <span className="px-3 py-1 border border-black rounded-full text-xs inline-block">
                {row.pid}
              </span>
            </div>
            <div className="text-sm font-semibold text-gray-900 text-left">{row.name}</div>
            <div className="text-sm text-gray-800 font-medium text-center">{row.date}</div>
            <div className="text-sm text-gray-900 font-semibold text-center">{row.status}</div>
            <div className="text-sm text-gray-900 font-semibold text-right">Rs. {row.amount.toLocaleString()}</div>
            <div className="flex justify-center">
              <button
                onClick={() => onView(row)}
                className="p-2 rounded-full border hover:bg-gray-100 text-[#01251F] transition"
                title="View Details"
                style={{ borderColor: ACCENT_COLOR }}
              >
                <Eye className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}

        {data.length === 0 && (
          <div className="p-12 text-center text-gray-500">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No payments found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 text-sm text-gray-600 flex justify-between">
        <span>
          Showing <strong>{data.length}</strong> of <strong>{getCurrentData().length}</strong> results
        </span>
      </div>
    </div>
  );
}
