import React from "react";
import { User, Phone, Mail, MapPin } from "lucide-react";


const ACCENT_COLOR = "#165E52";
const BORDER_COLOR = "#cfece6";
const HEADER_BG = "#e1f4ef";


export default function PersonalInfoCard({ supplier }) {
  if (!supplier) return null;
  // Fallbacks for each field
  const name = supplier.supplierName || "-";
  const nic = supplier.nic || "-";
  const contactNo = supplier.contactNo || "-";
  const email = supplier.email || "-";
  const address = supplier.address || "-";

  return (
    <div
      className="bg-white rounded-xl shadow-sm border overflow-hidden"
      style={{ borderColor: BORDER_COLOR }}
    >
      {/* Header */}
      <div
        className="px-6 py-4 border-b flex items-center space-x-2"
        style={{
          borderColor: BORDER_COLOR,
          backgroundColor: HEADER_BG,
        }}
      >
        <User className="w-5 h-5" style={{ color: ACCENT_COLOR }} />
        <h2 className="text-lg font-semibold" style={{ color: ACCENT_COLOR }}>
          Personal Information
        </h2>
      </div>

      {/* Card Body */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Full Name */}
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Full Name
            </label>
            <p className="mt-1 text-sm font-medium text-gray-900">
              {name}
            </p>
          </div>

          {/* NIC Number */}
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              NIC Number
            </label>
            <p className="mt-1 text-sm font-medium text-gray-900">
              {nic}
            </p>
          </div>

          {/* Mobile Number */}
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Mobile Number
            </label>
            <div className="mt-1 flex items-center space-x-2">
              <Phone className="w-4 h-4" style={{ color: ACCENT_COLOR }} />
              <p className="text-sm font-medium text-gray-900">
                {contactNo}
              </p>
            </div>
          </div>

          {/* Email Address */}
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Email Address
            </label>
            <div className="mt-1 flex items-center space-x-2">
              <Mail className="w-4 h-4" style={{ color: ACCENT_COLOR }} />
              <p className="text-sm font-medium text-gray-900 truncate">
                {email}
              </p>
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Address
            </label>
            <div className="mt-1 flex items-start space-x-2">
              <MapPin className="w-4 h-4 mt-0.5" style={{ color: ACCENT_COLOR }} />
              <p className="text-sm font-medium text-gray-900">
                {address}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



