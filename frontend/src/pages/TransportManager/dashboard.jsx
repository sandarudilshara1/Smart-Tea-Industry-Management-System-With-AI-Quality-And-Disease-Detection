import React from "react";
import {
  Route,
  Truck,
  Users,
  BellRing,
  AlertTriangle,
  CirclePlus,
} from "lucide-react";

// Accent & button colors from the new style
const ACCENT_COLOR = "#165e52";
const BUTTON_COLOR = "#172526";

export default function TransportManagerDashboard() {
  const stats = [
    {
      label: "Total Routes",
      value: 24,
      icon: <Route size={28} color="black" />,
    },
    {
      label: "Active Trips",
      value: 11,
      icon: <Truck size={28} color="black" />,
    },
    {
      label: "Approved Drivers",
      value: 18,
      icon: <Users size={28} color="black" />,
    },
  ];

  const breakdowns = [
    { id: "TRK-001", driver: "Kasun Perera", route: "Galle - Neluwa" },
    { id: "TRK-002", driver: "Ajith Perera", route: "Mathugama - Neluwa" },
  ];

  const pendingDrivers = [
    { id: "DRV-101", name: "Ajith Kumara", appliedOn: "2025-07-17" },
    { id: "DRV-102", name: "Sanduni Silva", appliedOn: "2025-07-18" },
  ];

  const recentTrips = [
    {
      route: "Galle - Neluwa",
      driver: "Kasun Perera",
      vehicle: "TRK-003",
      status: "Ongoing",
    },
    {
      route: "Akuressa - Neluwa",
      driver: "Ajith Kumara",
      vehicle: "TRK-004",
      status: "Completed",
    },
    {
      route: "Galle - Neluwa",
      driver: "Kasun Perera",
      vehicle: "TRK-005",
      status: "Ongoing",
    },
    {
      route: "Akuressa - Neluwa",
      driver: "Ajith Kumara",
      vehicle: "TRK-006",
      status: "Completed",
    },
  ];

  const statusBadge = {
    Ongoing: "bg-yellow-100 text-yellow-800 border border-yellow-700",
    Completed: "bg-green-100 text-green-800 border border-green-700",
    Pending: "bg-gray-100 text-gray-700 border border-gray-400",
  };

  return (
    <div className=" bg-gray-50">
      <div className="bg-white shadow-md ">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold mb-0"  style={{ color: ACCENT_COLOR }}>Dashboard Home</h1>

          {/* Replace period filter with Assign Driver button */}
          <div className="flex justify-end">
            <button
              onClick={() => alert("Navigate to Assign Driver")}
              className="flex items-center px-5 rounded-lg font-semibold text-white transition shadow"
              style={{ backgroundColor: BUTTON_COLOR }}
            >
              <CirclePlus size={20} /> Assign Driver to Route
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-white p-6 rounded-lg shadow-md border border-black transition duration-200 hover:shadow-lg hover:border-[#cfece6]"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-black">{stat.label}</p>
                  <p className="text-2xl font-bold text-black">{stat.value}</p>
                </div>
                <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center">
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Alerts & Notifications + Pending Drivers + Recent Trips */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Alerts Section */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-black">
            <h3 className="text-lg font-semibold text-black mb-5 flex items-center gap-2">
              <BellRing className="text-yellow-500" /> Alerts & Notifications
            </h3>
            <div className="space-y-3">
              {breakdowns.length === 0 ? (
                <div className="text-black">
                  No active alerts for trips or vehicles.
                </div>
              ) : (
                breakdowns.map((bd) => (
                  <div
                    key={bd.id}
                    className="p-3 bg-[#fceaea] border-l-4 border-red-600 rounded animate-pulse-slow mb-2 flex gap-2 items-center"
                  >
                    <AlertTriangle size={22} color="#dc2626" />
                    <div>
                      <div className="font-semibold text-red-700 text-sm">
                        Vehicle <span className="text-red-600">{bd.id}</span>{" "}
                        breakdown on{" "}
                        <span className="font-bold text-black">{bd.route}</span>
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        Driver: {bd.driver}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          {/* Pending Drivers */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-black">
            <h3 className="text-lg font-semibold text-black mb-5 flex items-center gap-2">
              <Users className="text-[#165e52]" /> Drivers Activation & Decline
            </h3>
            {pendingDrivers.length === 0 ? (
              <div className="text-black">No drivers awaiting review.</div>
            ) : (
              <div>
                {pendingDrivers.map((drv) => (
                  <div
                    key={drv.id}
                    className="flex justify-between items-center border-b border-gray-100 py-2"
                  >
                    <div>
                      <div className="font-semibold text-black">{drv.name}</div>
                      <div className="text-xs text-gray-500">
                        Applied on: {drv.appliedOn}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        className="px-3 py-1 rounded text-xs font-medium text-white"
                        style={{ backgroundColor: BUTTON_COLOR }}
                      >
                        Approve
                      </button>
                      <button
                        className="px-3 py-1 rounded text-xs font-medium text-white"
                        style={{ backgroundColor: "#dc2626" }}
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Recent Trip Activity */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-black">
            <h3 className="text-lg font-semibold text-black mb-5 flex items-center gap-2">
              <Truck className="text-[#165e52]" /> Recent Trip Activity
            </h3>
            <div className="space-y-3">
              {recentTrips.length === 0 ? (
                <div className="text-black font-medium">
                  No recent trip events.
                </div>
              ) : (
                recentTrips.map((trip, idx) => (
                  <div
                    key={idx}
                    className={`flex justify-between items-center border-b border-gray-200 pb-2`}
                  >
                    <div>
                      <div className="font-semibold text-black">
                        {trip.route}
                      </div>
                      <div className="text-xs text-gray-600">
                        Driver:{" "}
                        <span className="text-black">{trip.driver}</span> |
                        Vehicle: <span>{trip.vehicle}</span>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold border ${
                        statusBadge[trip.status]
                      }`}
                    >
                      {trip.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Emergency/alert animation */}
      <style>{`
        @keyframes pulseSlow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        .animate-pulse-slow {
          animation: pulseSlow 1.5s infinite;
        }
      `}</style>
    </div>
  );
}
