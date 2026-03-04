import React from "react";
import { Building } from "lucide-react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
// Replace with your actual Google Maps API key
const GOOGLE_MAPS_API_KEY = "AIzaSyCC1yw0F2ZC9dCYPDmcEdm3VAU6UqTYefo";

const ACCENT_COLOR = "#165E52";
const BORDER_COLOR = "#cfece6";
const HEADER_BG = "#e1f4ef";

export default function BusinessInfoCard({ supplier }) {
  // Parse coordinates (assume { lat, lng } or "lat,lng" string)
  const parseLocation = (loc) => {
    if (!loc) return null;
    if (typeof loc === "object" && loc.lat && loc.lng) return loc;
    if (typeof loc === "string") {
      // Handle Google Maps URL format: https://maps.google.com/?q=lat,lng
      const match = loc.match(/q=([-\d.]+),([-\d.]+)/);
      if (match) {
        const lat = parseFloat(match[1]);
        const lng = parseFloat(match[2]);
        if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
      }
      // Handle plain "lat,lng" string
      if (loc.includes(",")) {
        const [lat, lng] = loc.split(",").map(Number);
        if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
      }
    }
    return null;
  };

  const landCoords = parseLocation(supplier.landLocation);
  const pickupCoords = parseLocation(supplier.pickupLocation);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
  });
  return (
    <div
      className="bg-white rounded-xl shadow-sm border overflow-hidden"
      style={{ borderColor: BORDER_COLOR }}
    >
      {/* Header */}
      <div
        className="px-6 py-4 border-b flex items-center space-x-2"
        style={{ borderColor: BORDER_COLOR, backgroundColor: HEADER_BG }}
      >
        <Building className="w-5 h-5" style={{ color: ACCENT_COLOR }} />
        <h2 className="text-lg font-semibold" style={{ color: ACCENT_COLOR }}>
          Land Information
        </h2>
      </div>

      {/* Body */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Land Size */}
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Land Size
            </label>
            <p className="mt-1 text-sm font-medium text-gray-900">
              {supplier.landSize ? `${supplier.landSize} acres` : "-"}
            </p>
          </div>

          {/* Monthly Supply */}
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              {supplier.status === "approved"
                ? "Initial Bag Count"
                : "Monthly Supply"}
            </label>
            <p className="mt-1 text-sm font-medium text-gray-900">
              {supplier.status === "approved"
                ? supplier.initialBagCount ?? "-"
                : supplier.monthlySupply
                ? `${supplier.monthlySupply} kg`
                : "-"}
            </p>
          </div>

          {/* Route Info */}
          {supplier.status === "approved" && (
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Assigned Route
              </label>
              <p className="mt-1 text-sm font-medium text-gray-900">
                {supplier.routeName || "-"}
              </p>
            </div>
          )}

          {/* ...existing code... */}

          {/* Rejection Reason */}
          {supplier.status === "rejected" && (
            <div className="md:col-span-2 lg:col-span-3">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Rejection Reason
              </label>
              <p className="mt-1 text-sm text-red-700 bg-red-50 p-3 rounded-lg border border-red-200">
                {supplier.rejectionReason}
              </p>
            </div>
          )}
        </div>

        {/* Google Maps for Land and Pickup Locations */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-40 rounded-lg border-2 border-dashed border-gray-300 overflow-hidden">
            <p className="text-sm text-gray-500 text-center mb-1">
              Land Location Map
            </p>
            {isLoaded && landCoords ? (
              <GoogleMap
                mapContainerStyle={{ width: "100%", height: "140px" }}
                center={landCoords}
                zoom={15}
              >
                <Marker position={landCoords} />
              </GoogleMap>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                No location
              </div>
            )}
          </div>
          <div className="h-40 rounded-lg border-2 border-dashed border-gray-300 overflow-hidden">
            <p className="text-sm text-gray-500 text-center mb-1">
              Pickup Location Map
            </p>
            {isLoaded && pickupCoords ? (
              <GoogleMap
                mapContainerStyle={{ width: "100%", height: "140px" }}
                center={pickupCoords}
                zoom={15}
              >
                <Marker position={pickupCoords} />
              </GoogleMap>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                No location
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
