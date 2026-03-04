import React, { useState } from "react";
import { FileText, Eye, Download } from "lucide-react";

const ACCENT_COLOR = "#165E52";
const BORDER_COLOR = "#cfece6";
const HEADER_BG = "#e1f4ef";

export default function DocumentsCard({ supplier, nicImageUrl }) {
  // Prefer nicImageUrl if provided, else fallback to supplier.nicImage
  const nicImage = nicImageUrl || supplier.nicImage;
  const nicComplete = !!nicImage;
  const [showModal, setShowModal] = useState(false);

  return (
    <div
      className="bg-white rounded-xl shadow-sm border overflow-hidden"
      style={{ borderColor: BORDER_COLOR }}
    >
      {/* Header */}
      <div
        className="px-6 py-4 border-b flex items-center justify-between"
        style={{ borderColor: BORDER_COLOR, backgroundColor: HEADER_BG }}
      >
        <div className="flex items-center space-x-2">
          <FileText className="w-5 h-5" style={{ color: ACCENT_COLOR }} />
          <h3 className="text-lg font-semibold" style={{ color: ACCENT_COLOR }}>
            Documents
          </h3>
        </div>
        <span
          className={`text-sm font-medium ${
            nicComplete ? "text-green-700" : "text-red-600"
          }`}
        >
          {nicComplete ? "Complete" : "Incomplete"}
        </span>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="space-y-4">
          <div
            className="flex items-center justify-between p-3 rounded-lg border"
            style={{ backgroundColor: "#f9faf9", borderColor: BORDER_COLOR }}
          >
            <div className="flex items-center space-x-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: "#e1f4ef" }}
              >
                <FileText className="w-5 h-5" style={{ color: ACCENT_COLOR }} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">NIC Copy</p>
              </div>
            </div>

            {nicImage && (
              <div className="flex space-x-2">
                <button
                  className="p-2 rounded-lg transition-colors shadow-sm"
                  style={{
                    color: ACCENT_COLOR,
                    backgroundColor: "#f0fdfa",
                    border: `2px solid ${BORDER_COLOR}`,
                  }}
                  onClick={() => setShowModal(true)}
                  title="View NIC Image"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            )}
            {/* NIC Image Modal */}
            {showModal && nicImage && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center"
                style={{
                  backdropFilter: "blur(8px)",
                  background: "rgba(0,0,0,0.15)",
                }}
              >
                <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg w-full relative">
                  <button
                    className="absolute top-2 right-2 text-gray-500 hover:text-black"
                    onClick={() => setShowModal(false)}
                    title="Close"
                  >
                    &times;
                  </button>
                  <img
                    src={nicImage}
                    alt="NIC Copy"
                    className="w-full h-auto rounded-lg"
                    style={{ maxHeight: "70vh", objectFit: "contain" }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
