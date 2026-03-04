import React from "react";
import { Calendar, Mail, FileText } from "lucide-react";


const ACCENT_COLOR = "#165E52";
const BORDER_COLOR = "#cfece6";
const HOVER_BG = "#D5E6E3";


export default function QuickActionsCard() {
  return (
    <div
      className="bg-white rounded-xl shadow-sm border overflow-hidden"
      style={{ borderColor: BORDER_COLOR }}
    >
      <div
        className="px-6 py-4 border-b"
        style={{ borderColor: BORDER_COLOR, backgroundColor: "#e1f4ef" }}
      >
        <h3 className="text-lg font-semibold" style={{ color: ACCENT_COLOR }}>
          Quick Actions
        </h3>
      </div>
      <div className="p-6">
        <div className="space-y-3">
          {/* Action: Schedule Site Visit */}
          <button
            className="w-full flex items-center justify-between p-3 text-left rounded-lg transition-colors"
            style={{ backgroundColor: "#f9fafa" }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = HOVER_BG)}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#f9fafa")}
          >
            <span className="text-sm font-medium text-gray-900">Schedule Site Visit</span>
            <Calendar className="w-4 h-4" style={{ color: ACCENT_COLOR }} />
          </button>


          {/* Action: Send Message */}
          <button
            className="w-full flex items-center justify-between p-3 text-left rounded-lg transition-colors"
            style={{ backgroundColor: "#f9fafa" }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = HOVER_BG)}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#f9fafa")}
          >
            <span className="text-sm font-medium text-gray-900">Send Message</span>
            <Mail className="w-4 h-4" style={{ color: ACCENT_COLOR }} />
          </button>


          {/* Action: Request More Info */}
          <button
            className="w-full flex items-center justify-between p-3 text-left rounded-lg transition-colors"
            style={{ backgroundColor: "#f9fafa" }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = HOVER_BG)}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#f9fafa")}
          >
            <span className="text-sm font-medium text-gray-900">Request More Info</span>
            <FileText className="w-4 h-4" style={{ color: ACCENT_COLOR }} />
          </button>
        </div>
      </div>
    </div>
  );
}



