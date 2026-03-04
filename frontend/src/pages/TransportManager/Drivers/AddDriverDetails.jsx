import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function AddDriverDetails({ vehicles }) {
  const location = useLocation();
  const navigate = useNavigate();
  const userId = location.state?.userId;

  const [form, setForm] = useState({
    driver_id: userId || "",
    type: "INHOUSE",
    assigned_vehicle_id: "",
    phone: "",
    license_no: "",
    nic: "",
  });

  useEffect(() => {
    if (!userId) {
      alert("User ID missing! Please complete Step 1.");
      navigate("/transportManager/driver");
    }
  }, [userId, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Fake API call example — replace with actual backend request
    const response = await fetch("/api/driver/addDetails", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (response.ok) {
      // On success navigate to driver list or driver view page
      navigate("/transportManager/driver/all");
    } else {
      alert("Failed to add driver details!");
    }
  };

  return (
    <div className="max-w-md mx-auto p-8 bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-6 text-center">
        Add Driver - Step 2 (Details)
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-semibold" htmlFor="type">
            Driver Type
          </label>
          <select
            id="type"
            name="type"
            value={form.type}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          >
            <option value="INHOUSE">INHOUSE</option>
            <option value="PRIVATE">PRIVATE</option>
          </select>
        </div>
        <div>
          <label
            className="block mb-1 font-semibold"
            htmlFor="assigned_vehicle_id"
          >
            Assigned Vehicle
          </label>
          <select
            id="assigned_vehicle_id"
            name="assigned_vehicle_id"
            value={form.assigned_vehicle_id}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          >
            <option value="">Select a Vehicle</option>
            {vehicles?.map((v) => (
              <option
                key={v.vehicleNumber || v.id}
                value={v.vehicleNumber || v.id}
              >
                {v.vehicleNumber || "ID: " + v.id} - {v.vehicleType || v.type}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block mb-1 font-semibold" htmlFor="phone">
            Phone Number
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder="0771234567"
          />
        </div>
        <div>
          <label className="block mb-1 font-semibold" htmlFor="license_no">
            License Number
          </label>
          <input
            type="text"
            id="license_no"
            name="license_no"
            value={form.license_no}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block mb-1 font-semibold" htmlFor="nic">
            NIC
          </label>
          <input
            type="text"
            id="nic"
            name="nic"
            value={form.nic}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-700 text-white p-3 rounded hover:bg-blue-800 transition"
        >
          Submit Driver Details
        </button>
      </form>
    </div>
  );
}
