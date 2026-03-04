import React, { useState } from "react";
import { CalendarDays, Map, UserCircle, Truck } from "lucide-react";

const ACCENT_COLOR = "#165E52"; // Title & highlights
const BORDER_COLOR = "#cfece6";
const BTN_COLOR = "#01251F";
const BG_INPUT = "#f8fdfc";

const routes = [
  { value: "A", label: "Route A - Galle Neluwa" },
  { value: "B", label: "Route B - Matara Neluwa" },
];

const drivers = [
  { value: "Mr.Perera", label: "Mr. Perera" },
  { value: "Mr.Kamal", label: "Mr. Kamal" },
];

const vehicles = [
  { value: "TRK-001", label: "TRK-001", capacity: "500kg" },
  { value: "TRK-002", label: "TRK-002", capacity: "750kg" },
  { value: "TRK-003", label: "TRK-003", capacity: "1000kg" },
];

export default function CenteredAssignRoutePage() {
  const [form, setForm] = useState({
    route: "",
    driver: "",
    vehicle: "",
    vehicleCapacity: "",
    date: "",
  });

  function handleChange(e) {
    const { name, value } = e.target;
    if (name === "vehicle") {
      const selectedVehicle = vehicles.find((v) => v.value === value);
      setForm({
        ...form,
        vehicle: value,
        vehicleCapacity: selectedVehicle ? selectedVehicle.capacity : "",
      });
    } else {
      setForm({ ...form, [name]: value });
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    alert("Route assigned!\n" + JSON.stringify(form, null, 2));
  }

  return (
    <div className="flex items-center justify-center bg-gray-50 overflow-hidden m-6">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl p-6 overflow-hidden">
        <h2
          className="text-2xl font-bold mb-6 flex items-center gap-2 text-[#165E52]"
          tabIndex={-1}
        >
          <Map size={28} aria-hidden="true" />
          Assign Route & Vehicle
        </h2>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-8"
          noValidate
        >
          {/* Route */}
          <div>
            <label
              htmlFor="route"
              className="block mb-1 font-semibold text-[#165E52]"
            >
              Select Route
            </label>
            <div className="relative">
              <Map
                className="absolute left-3 top-3 text-[#165E52]"
                size={18}
                aria-hidden="true"
              />
              <select
                id="route"
                name="route"
                value={form.route}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-3 py-2 rounded-lg border border-[#cfece6] bg-[#f8fdfc] text-[#165E52] text-sm focus:outline-none focus:ring-2 focus:ring-[#165E52] focus:border-transparent transition"
                aria-required="true"
              >
                <option value="">Choose a route</option>
                {routes.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Driver */}
          <div>
            <label
              htmlFor="driver"
              className="block mb-1 font-semibold text-[#165E52]"
            >
              Driver
            </label>
            <div className="relative">
              <UserCircle
                className="absolute left-3 top-3 text-[#165E52]"
                size={18}
                aria-hidden="true"
              />
              <select
                id="driver"
                name="driver"
                value={form.driver}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-3 py-2 rounded-lg border border-[#cfece6] bg-[#f8fdfc] text-[#165E52] text-sm focus:outline-none focus:ring-2 focus:ring-[#165E52] focus:border-transparent transition"
                aria-required="true"
              >
                <option value="">Choose driver</option>
                {drivers.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Vehicle and Vehicle Capacity side by side */}
          <div className="grid grid-cols-2 gap-6">
            {/* Vehicle */}
            <div>
              <label
                htmlFor="vehicle"
                className="block mb-1 font-semibold text-[#165E52]"
              >
                Vehicle
              </label>
              <div className="relative">
                <Truck
                  className="absolute left-3 top-3 text-[#165E52]"
                  size={18}
                  aria-hidden="true"
                />
                <select
                  id="vehicle"
                  name="vehicle"
                  value={form.vehicle}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-3 py-2 rounded-lg border border-[#cfece6] bg-[#f8fdfc] text-[#165E52] text-sm focus:outline-none focus:ring-2 focus:ring-[#165E52] focus:border-transparent transition"
                  aria-required="true"
                >
                  <option value="">Choose vehicle</option>
                  {vehicles.map((v) => (
                    <option key={v.value} value={v.value}>
                      {v.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Vehicle Capacity */}
            <div>
              <label
                htmlFor="vehicleCapacity"
                className="block mb-1 font-semibold text-[#165E52]"
              >
                Vehicle Capacity
              </label>
              <input
                type="text"
                id="vehicleCapacity"
                name="vehicleCapacity"
                readOnly
                value={form.vehicleCapacity}
                placeholder="Auto-filled from vehicle"
                className="w-full px-4 py-2 rounded-lg border border-[#cfece6] bg-[#f0faf7] text-[#165E52] cursor-not-allowed text-sm"
                aria-readonly="true"
              />
            </div>
          </div>

          {/* Date */}
          <div>
            <label
              htmlFor="date"
              className="block mb-1 font-semibold text-[#165E52]"
            >
              Date of Assign
            </label>
            <div className="relative">
              <CalendarDays
                className="absolute left-3 top-3 text-[#165E52]"
                size={18}
                aria-hidden="true"
              />
              <input
                type="date"
                id="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-3 py-2 rounded-lg border border-[#cfece6] bg-[#f8fdfc] text-[#165E52] text-sm focus:outline-none focus:ring-2 focus:ring-[#165E52] focus:border-transparent transition"
                aria-required="true"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              className="w-full py-3 rounded-lg bg-[#172526] hover:bg-[#134632] text-white font-bold text-lg shadow transition"
            >
              Assign Route
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
