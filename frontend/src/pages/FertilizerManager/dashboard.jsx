import React, { useState } from "react";
import {
  AlertTriangle,
  PackageSearch,
  UserPlus,
  Eye,
  ClipboardList,
  PackageCheck,
  X,
  Truck,
  Package,
  Clock,
} from "lucide-react";

const ACCENT_COLOR = "#165e52";
const BUTTON_COLOR = "#172526";
const BORDER_COLOR = "#cfece6";

export default function FertilizerManagerDashboard() {
  const [search, setSearch] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [currentView, setCurrentView] = useState("approved");

  // Sample Data
  const totalFertilizers = 12;
  const pendingRequestCount = 4;
  const lowStocks = [
    { id: 1, name: "NPK 20-20-20", stock: 20 },
    { id: 2, name: "Urea", stock: 12 },
  ];
  const requests = [
    {
      id: 1,
      supplier: "GreenGrow Ltd",
      route: "R-2",
      driver: "Samuel",
      total: 2,
      items: [
        { type: "MOP", quantity: "5" },
        { type: "Urea", quantity: "3" },
      ],
    },
    {
      id: 2,
      supplier: "Agro Direct",
      route: "R-5",
      driver: "Michael",
      total: 3,
      items: [
        { type: "NPK", quantity: "40kg" },
        { type: "TSP", quantity: "25kg" },
        { type: "Urea", quantity: "18kg" },
      ],
    },
  ];

  const filtered = requests.filter((r) =>
    r.route.toLowerCase().includes(search.toLowerCase())
  );

  const summaryCards = [
    {
      type: "approved",
      label: "Total Fertilizers",
      value: totalFertilizers,
      icon: <Package size={30} color={ACCENT_COLOR} />,
    },
    {
      type: "pending",
      label: "Pending Requests",
      value: pendingRequestCount,
      icon: <Clock size={30} color="#f59e0b" />,
    },
  ];

  const getBorderColor = (type) => {
    switch (type) {
      case "approved":
        return ACCENT_COLOR;
      case "pending":
        return "#f59e0b";
      default:
        return "#d1d5db";
    }
  };

  const getRingClass = (type) => {
    if (type === "approved") return "";
    if (currentView === type) {
      if (type === "pending") return "ring-2 ring-[#f59e0b]/30";
    }
    return "";
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-8">
      {/* Header */}
      <div
        className="bg-white shadow-md border-b"
        style={{ borderColor: BORDER_COLOR }}
      >
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-3xl font-bold" style={{ color: ACCENT_COLOR }}>
            Dashboard
          </h1>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-7xl mx-auto">
        {summaryCards.map(({ type, label, value, icon }) => {
          const isApproved = type === "approved";
          return (
            <div
              key={type}
              onClick={() => setCurrentView(type)}
              className={`bg-white p-6 rounded-2xl border shadow-md cursor-pointer transition-transform ${
                !isApproved ? "hover:scale-[1.02]" : "hover:shadow-none"
              } ${getRingClass(type)}`}
              style={{ borderColor: getBorderColor(type), borderWidth: "1px" }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p
                    className="text-sm font-medium"
                    style={{ color: ACCENT_COLOR }}
                  >
                    {label}
                  </p>
                  <p
                    className="text-3xl font-bold"
                    style={{ color: ACCENT_COLOR }}
                  >
                    {value}
                  </p>
                </div>
                <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center">
                  {icon}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Top Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-7xl mx-auto">
        {/* Low Stock */}
        <div
          className="bg-white border rounded-2xl shadow-md p-6"
          style={{ borderColor: BORDER_COLOR }}
        >
          <div className="flex items-center mb-4">
            <AlertTriangle
              className="w-6 h-6"
              style={{ color: ACCENT_COLOR }}
            />
            <span
              className="text-lg font-bold ml-2"
              style={{ color: ACCENT_COLOR }}
            >
              Low Fertilizer Stock
            </span>
          </div>
          {lowStocks.length === 0 ? (
            <div className="flex flex-col items-center text-gray-500 py-8">
              <UserPlus className="w-10 h-10 mb-2" />
              <p>No low stock alerts</p>
            </div>
          ) : (
            <div className="space-y-3">
              {lowStocks.map(({ id, name, stock }) => (
                <div
                  key={id}
                  className="flex items-center justify-between p-3 rounded-lg"
                  style={{
                    background: "#fff7ed",
                    border: `1px solid ${BORDER_COLOR}`,
                  }}
                >
                  <div>
                    <span
                      className="font-semibold"
                      style={{ color: ACCENT_COLOR }}
                    >
                      {name}
                    </span>
                    <span className="ml-2 text-gray-700 text-xs">
                      {stock} Kg left
                    </span>
                  </div>
                  <PackageCheck
                    className="w-5 h-5"
                    style={{ color: ACCENT_COLOR }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Incoming Requests */}
        <div
          className="bg-white border rounded-2xl shadow-md p-6"
          style={{ borderColor: BORDER_COLOR }}
        >
          <div className="flex items-center mb-4">
            <PackageSearch
              className="w-6 h-6"
              style={{ color: ACCENT_COLOR }}
            />
            <span
              className="text-lg font-bold ml-2"
              style={{ color: ACCENT_COLOR }}
            >
              Incoming Fertilizer Orders
            </span>
          </div>

          {requests.length === 0 ? (
            <div className="flex flex-col items-center text-gray-500 py-8">
              <ClipboardList className="w-10 h-10 mb-2" />
              <p>No incoming requests</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {requests.map((r) => (
                <div
                  key={r.id}
                  className="flex justify-between p-3 border rounded-lg items-center"
                  style={{ borderColor: "#e1f4ef", borderWidth: "1px" }}
                >
                  <div>
                    <span
                      className="font-semibold"
                      style={{ color: ACCENT_COLOR }}
                    >
                      {r.supplier}
                    </span>
                    <span className="ml-2 text-xs text-gray-600">
                      Route {r.route}, Driver {r.driver}
                    </span>
                  </div>
                  <ClipboardList
                    className="w-5 h-5 cursor-pointer"
                    style={{ color: ACCENT_COLOR }}
                    onClick={() => setSelectedRequest(r)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom: Release Queue Table */}
      <div
        className="bg-white border rounded-2xl shadow-md p-6 max-w-7xl mx-auto mt-8"
        style={{ borderColor: BORDER_COLOR }}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-black flex items-center gap-2">
            <Truck className="w-5 h-5" /> Release Queue
          </h3>
          <input
            placeholder="Search by route"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border px-3 py-2 rounded focus:ring-2 focus:ring-[#165e52] border-[#cfece6] transition"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#172526] text-white rounded-t-2xl">
                <th className="p-3 text-left rounded-tl-2xl">Route</th>
                <th className="p-3 text-left">Driver</th>
                <th className="p-3 text-left">Total Count</th>
                <th className="p-3 text-left rounded-tr-2xl">View</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center text-gray-400 py-6">
                    <div className="flex flex-col items-center">
                      <UserPlus className="w-10 h-10 mb-2 text-gray-300" />
                      <p>No requests found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((req) => (
                  <tr
                    key={req.id}
                    className="border-b border-[#e1f4ef] last:border-0"
                  >
                    <td
                      className="p-3 font-medium"
                      style={{ color: ACCENT_COLOR }}
                    >
                      {req.route}
                    </td>
                    <td className="p-3" style={{ color: ACCENT_COLOR }}>
                      {req.driver}
                    </td>
                    <td className="p-3" style={{ color: ACCENT_COLOR }}>
                      {req.total}
                    </td>
                    <td className="p-3">
                      <button
                        className="px-4 py-1 rounded bg-black text-white text-xs hover:bg-[#165e52] transition"
                        onClick={() => setSelectedRequest(req)}
                        aria-label={`View details for route ${req.route}`}
                      >
                        <Eye className="inline w-4 h-4 mr-1" />
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/10">
          <div
            className="bg-white w-full max-w-lg rounded-2xl shadow-lg p-6 border relative"
            style={{ borderColor: BORDER_COLOR }}
          >
            <button
              className="absolute top-4 right-4 rounded p-1 hover:bg-gray-100 transition"
              onClick={() => setSelectedRequest(null)}
              aria-label="Close modal"
            >
              <X className="w-5 h-5" style={{ color: ACCENT_COLOR }} />
            </button>
            <h3
              className="text-xl font-bold mb-4 flex items-center gap-2"
              style={{ color: ACCENT_COLOR }}
            >
              <Truck className="w-5 h-5" />
              Release Order Details
            </h3>
            <div className="space-y-2 mb-4" style={{ color: ACCENT_COLOR }}>
              <div>
                <span className="font-semibold">Driver: </span>
                <span className="text-gray-700">{selectedRequest.driver}</span>
              </div>
              <div>
                <span className="font-semibold">Route: </span>
                <span className="text-gray-700">{selectedRequest.route}</span>
              </div>
            </div>
            <div className="border border-[#e1f4ef] rounded">
              <div
                className="grid grid-cols-2 bg-gray-100 p-2 font-semibold"
                style={{ color: ACCENT_COLOR }}
              >
                <div>Fertilizer Type</div>
                <div>Quantity</div>
              </div>
              {selectedRequest.items.map((item, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-2 p-2 border-t border-[#e1f4ef] text-sm"
                  style={{ color: ACCENT_COLOR }}
                >
                  <div>{item.type}</div>
                  <div>{item.quantity}</div>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                className="px-5 py-2 rounded bg-gray-200 text-black hover:bg-gray-300 transition"
                onClick={() => setSelectedRequest(null)}
              >
                Close
              </button>
              <button
                className="px-5 py-2 rounded bg-[#172526] text-white hover:bg-[#0e1a1a] transition"
                onClick={() => {
                  console.log("Released:", selectedRequest);
                  setSelectedRequest(null);
                }}
              >
                Release
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
