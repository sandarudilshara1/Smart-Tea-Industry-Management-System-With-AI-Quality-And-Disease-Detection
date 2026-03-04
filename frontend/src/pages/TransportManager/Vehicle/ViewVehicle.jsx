import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getVehicleById } from "../../../api/vehicle";
import { Loader, Truck, Calendar, User } from "lucide-react";

const ACCENT_COLOR = "#165E52";
const BORDER_COLOR = "#cfece6";

export default function ViewVehicle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchVehicle();
  }, [id]);

  const fetchVehicle = async () => {
    try {
      setLoading(true);
      const data = await getVehicleById(id);
      setVehicle(data);
    } catch (err) {
      console.error('Error fetching vehicle:', err);
      setError('Failed to load vehicle details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="animate-spin" size={32} style={{ color: ACCENT_COLOR }} />
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="p-8 text-center text-red-600">
        {error || 'Vehicle not found'}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fdfc] p-6">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 px-4 py-2 rounded-lg border bg-white hover:bg-gray-50 transition-colors"
          style={{ borderColor: BORDER_COLOR, color: ACCENT_COLOR }}
        >
          ← Back
        </button>

        <div className="bg-white rounded-lg shadow-md border p-8" style={{ borderColor: BORDER_COLOR }}>
          <h2 className="text-3xl font-bold mb-6" style={{ color: ACCENT_COLOR }}>
            Vehicle Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Vehicle Number */}
            <div>
              <label className="text-sm font-medium text-gray-600">Vehicle Number</label>
              <p className="text-lg font-semibold mt-1" style={{ color: ACCENT_COLOR }}>
                {vehicle.vehicleNumber}
              </p>
            </div>

            {/* Vehicle Type */}
            <div>
              <label className="text-sm font-medium text-gray-600">Type</label>
              <p className="text-lg font-semibold mt-1" style={{ color: ACCENT_COLOR }}>
                {vehicle.vehicleType}
              </p>
            </div>

            {/* Model */}
            <div>
              <label className="text-sm font-medium text-gray-600">Model</label>
              <p className="text-lg font-semibold mt-1" style={{ color: ACCENT_COLOR }}>
                {vehicle.model}
              </p>
            </div>

            {/* Capacity */}
            <div>
              <label className="text-sm font-medium text-gray-600">Capacity</label>
              <p className="text-lg font-semibold mt-1" style={{ color: ACCENT_COLOR }}>
                {vehicle.capacity}
              </p>
            </div>

            {/* Status */}
            <div>
              <label className="text-sm font-medium text-gray-600">Status</label>
              <p className="text-lg font-semibold mt-1" style={{ color: ACCENT_COLOR }}>
                {vehicle.status}
              </p>
            </div>

            {/* Assigned Driver */}
            <div>
              <label className="text-sm font-medium text-gray-600">Assigned Driver</label>
              <p className="text-lg font-semibold mt-1" style={{ color: ACCENT_COLOR }}>
                {vehicle.assignedDriver || 'Not Assigned'}
              </p>
            </div>

            {/* Registration Number */}
            {vehicle.registrationNumber && (
              <div>
                <label className="text-sm font-medium text-gray-600">Registration Number</label>
                <p className="text-lg font-semibold mt-1" style={{ color: ACCENT_COLOR }}>
                  {vehicle.registrationNumber}
                </p>
              </div>
            )}

            {/* Manufacturing Year */}
            {vehicle.manufacturingYear && (
              <div>
                <label className="text-sm font-medium text-gray-600">Year</label>
                <p className="text-lg font-semibold mt-1" style={{ color: ACCENT_COLOR }}>
                  {vehicle.manufacturingYear}
                </p>
              </div>
            )}

            {/* Fuel Type */}
            {vehicle.fuelType && (
              <div>
                <label className="text-sm font-medium text-gray-600">Fuel Type</label>
                <p className="text-lg font-semibold mt-1" style={{ color: ACCENT_COLOR }}>
                  {vehicle.fuelType}
                </p>
              </div>
            )}

            {/* Mileage */}
            {vehicle.mileage !== undefined && (
              <div>
                <label className="text-sm font-medium text-gray-600">Mileage</label>
                <p className="text-lg font-semibold mt-1" style={{ color: ACCENT_COLOR }}>
                  {vehicle.mileage} km
                </p>
              </div>
            )}

            {/* Last Service Date */}
            {vehicle.lastServiceDate && (
              <div>
                <label className="text-sm font-medium text-gray-600">Last Service Date</label>
                <p className="text-lg font-semibold mt-1" style={{ color: ACCENT_COLOR }}>
                  {new Date(vehicle.lastServiceDate).toLocaleDateString()}
                </p>
              </div>
            )}

            {/* Next Service Date */}
            {vehicle.nextServiceDate && (
              <div>
                <label className="text-sm font-medium text-gray-600">Next Service Date</label>
                <p className="text-lg font-semibold mt-1" style={{ color: ACCENT_COLOR }}>
                  {new Date(vehicle.nextServiceDate).toLocaleDateString()}
                </p>
              </div>
            )}

            {/* Insurance Expiry */}
            {vehicle.insuranceExpiryDate && (
              <div>
                <label className="text-sm font-medium text-gray-600">Insurance Expiry</label>
                <p className="text-lg font-semibold mt-1" style={{ color: ACCENT_COLOR }}>
                  {new Date(vehicle.insuranceExpiryDate).toLocaleDateString()}
                </p>
              </div>
            )}

            {/* Notes */}
            {vehicle.notes && (
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-600">Notes</label>
                <p className="text-lg mt-1" style={{ color: ACCENT_COLOR }}>
                  {vehicle.notes}
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex gap-4">
            <button
              onClick={() => navigate(`/transportManager/vehicle/edit/${vehicle._id}`)}
              className="px-6 py-2 rounded-lg text-white font-semibold hover:opacity-90 transition-opacity"
              style={{ backgroundColor: '#172526' }}
            >
              Edit Vehicle
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
