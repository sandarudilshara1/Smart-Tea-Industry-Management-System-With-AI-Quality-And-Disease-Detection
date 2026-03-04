import React from "react";
import { Building } from "lucide-react";


const ACCENT_COLOR = "#165e52";


export default function BankingInfoCard({ supplier }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div
        className="px-6 py-4"
        style={{
          backgroundColor: "#e1f4ef",
        }}
      >
        <div className="flex items-center space-x-2">
          <Building className="w-5 h-5" style={{ color: ACCENT_COLOR }} />
          <h2 className="text-lg font-semibold" style={{ color: ACCENT_COLOR }}>
            Banking Information
          </h2>
        </div>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Bank Name
            </label>
            <p className="mt-1 text-sm font-medium text-gray-900">
              Commercial Bank
            </p>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Account Holder
            </label>
            <p className="mt-1 text-sm font-medium text-gray-900">
              {supplier.name}
            </p>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Account Number
            </label>
            <p className="mt-1 text-sm font-medium text-gray-900">
              8001234567
            </p>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Branch
            </label>
            <p className="mt-1 text-sm font-medium text-gray-900">
              Maharagama Branch
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}



