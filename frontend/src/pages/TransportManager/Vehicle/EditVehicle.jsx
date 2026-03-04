import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function EditVehicle({ vehicles, onEdit }) {
  const { vehicleNumber } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);

  useEffect(() => {
    const vehicle = vehicles.find((v) => v.vehicleNumber === vehicleNumber);
    if (vehicle) setForm(vehicle);
  }, [vehicleNumber, vehicles]);

  if (!form) return <div>Loading...</div>;

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "vehicleImage") {
      setForm({ ...form, vehicleImage: files[0] });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onEdit(form);
    navigate("/transportManager/vehicle");
  };

  return (
    <div className="max-w-lg mx-auto bg-white p-8 rounded-xl shadow">
      <h2 className="text-2xl font-bold mb-6">Edit Vehicle</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="vehicleNumber"
          value={form.vehicleNumber}
          disabled
          className="w-full border p-2 rounded bg-gray-100"
        />
        <input
          name="vehicleType"
          value={form.vehicleType}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />
        <input
          name="capacity"
          value={form.capacity}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />
        <select
          name="status"
          value={form.status}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        >
          <option>Available</option>
          <option>In Use</option>
          <option>Maintenance</option>
        </select>
        <input
          name="assignedDriver"
          value={form.assignedDriver || ""}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />
        <input
          name="lastServiceDate"
          type="date"
          value={form.lastServiceDate}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />
        <input
          name="vehicleImage"
          type="file"
          accept="image/*"
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />
        <button
          type="submit"
          className="bg-yellow-600 text-white px-6 py-2 rounded-lg font-semibold"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
}
