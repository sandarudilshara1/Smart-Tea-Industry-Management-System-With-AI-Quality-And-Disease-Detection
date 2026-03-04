import React from "react";
import { Clock, FileText, Check, X } from "lucide-react";

export default function ActivityTimelineCard({ supplier }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-emerald-300 overflow-hidden">
      <div className="px-6 py-4 border-b border-emerald-300 bg-emerald-50">
        <div className="flex items-center space-x-2">
          <Clock className="w-5 h-5 text-emerald-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Activity Timeline
          </h3>
        </div>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          <div className="flex space-x-3">
            <div className="flex-shrink-0 w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
              <FileText className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                Application Submitted
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {supplier.requestDate
                  ? supplier.requestDate
                  : "Unknown Date"}
              </p>
            </div>
          </div>

          {supplier.status === "rejected" && (
            <div className="flex space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <X className="w-4 h-4 text-red-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  Application Rejected
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {supplier.rejectedDate
                    ? supplier.rejectedDate
                    : "Unknown Date"}
                </p>
              </div>
            </div>
          )} 

          {supplier.status === "pending" && (
            <div className="flex space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <Clock className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  Under Review
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
