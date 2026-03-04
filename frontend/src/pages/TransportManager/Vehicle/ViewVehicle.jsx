import React from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function ViewVehicle({ vehicles }) {
  const { vehicleNumber } = useParams();
  const navigate = useNavigate();

  // Find vehicle by vehicleNumber
  const vehicle = vehicles.find((v) => v.vehicleNumber === vehicleNumber);

  if (!vehicle)
    return <div className="p-8 text-center">Vehicle not found.</div>;

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="text-blue-600 mb-4 hover:underline"
      >
        &larr; Back
      </button>

      {/* Vehicle Info Section */}
      <div className="flex items-center gap-6">
        {vehicle.vehicleImage ? (
          <img
            src={
              typeof vehicle.vehicleImage === "string"
                ? vehicle.vehicleImage
                : URL.createObjectURL(vehicle.vehicleImage)
            }
            alt="Vehicle"
            className="w-32 h-32 object-cover rounded-lg border"
          />
        ) : (
          <div className="w-32 h-32 bg-gray-200 flex items-center justify-center rounded-lg border text-gray-400">
            No Image
          </div>
        )}

        <div>
          <h2 className="text-2xl font-bold mb-2">
            {vehicle.vehicleType}{" "}
            <span className="text-gray-500">({vehicle.vehicleNumber})</span>
          </h2>
          <div className="mt-2">
            <span className="font-semibold">Capacity:</span> {vehicle.capacity}
          </div>
          <div>
            <span className="font-semibold">Status:</span> {vehicle.status}
          </div>
          <div>
            <span className="font-semibold">Last Service:</span>{" "}
            {vehicle.lastServiceDate}
          </div>
        </div>
      </div>

      {/* Driver Info Section */}
      <div>
        <h3 className="font-semibold mb-2">Assigned Driver</h3>
        {vehicle.assignedDriver ? (
          <div className="flex items-center gap-4">
            {vehicle.driverImage ? (
              <img
                src={vehicle.driverImage}
                alt={vehicle.assignedDriver}
                className="w-16 h-16 rounded-full border object-cover"
              />
            ) : (
              <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center text-gray-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5.121 17.804A9 9 0 1118.879 6.196 9 9 0 015.12 17.804z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
            )}
            <span className="text-lg">{vehicle.assignedDriver}</span>
          </div>
        ) : (
          <div className="text-gray-500">No driver assigned</div>
        )}
      </div>
    </div>
  );
}
