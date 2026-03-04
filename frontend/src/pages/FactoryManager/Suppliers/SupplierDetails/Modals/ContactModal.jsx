import React, { useEffect } from "react";
import { X, Mail } from "lucide-react";


const ACCENT_COLOR = "#165E52";
const BTN_COLOR = "#01251F";
const BORDER_COLOR = "#cfece6";
const HEADER_BG = "#e1f4ef";


export default function ContactModal({
  show,
  onClose,
  supplier,
  contactData,
  setContactData,
  onConfirm,
}) {
  useEffect(() => {
    document.body.style.overflow = show ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [show]);


  if (!show) return null;


  const isDisabled = !contactData.subject.trim() || !contactData.message.trim();


  return (
    <div className="fixed inset-0 flex items-center justify-center z-[1000] backdrop-blur-sm bg-black/30 overflow-hidden">
      <div
        className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl border"
        style={{ borderColor: BORDER_COLOR }}
      >
        {/* Header */}
        <div
          className="p-6 border-b flex items-center space-x-3"
          style={{ borderColor: BORDER_COLOR, backgroundColor: HEADER_BG }}
        >
          <div className="w-10 h-10 bg-[#e1f4ef] rounded-full flex items-center justify-center">
            <Mail className="w-5 h-5" style={{ color: ACCENT_COLOR }} />
          </div>
          <h2 className="text-xl font-semibold" style={{ color: ACCENT_COLOR }}>
            Contact Supplier
          </h2>
        </div>


        {/* Supplier Info Section */}
        <div className="p-6">
          <div
            className="border rounded-lg p-4 mb-6"
            style={{ backgroundColor: "#f0faf7", borderColor: BORDER_COLOR }}
          >
            <h3 className="font-medium mb-2" style={{ color: ACCENT_COLOR }}>
              Send Message To
            </h3>
            <p className="text-sm text-gray-700">
              {supplier.name} - {supplier.location}
            </p>
            <p className="text-sm text-gray-700">Email: {supplier.email}</p>
            <p className="text-sm text-gray-700">Phone: {supplier.phone}</p>
          </div>


          {/* Message Form */}
          <div className="space-y-4">
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-2">
                Subject <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:outline-none"
                placeholder="Enter message subject..."
                value={contactData.subject}
                onChange={(e) =>
                  setContactData({
                    ...contactData,
                    subject: e.target.value,
                  })
                }
                style={{ borderColor: BORDER_COLOR }}
              />
            </div>


            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-2">
                Message <span className="text-red-500">*</span>
              </label>
              <textarea
                className="border rounded-lg px-3 py-2 text-sm min-h-[150px] resize-y focus:ring-2 focus:outline-none"
                placeholder="Type your message here..."
                value={contactData.message}
                onChange={(e) =>
                  setContactData({
                    ...contactData,
                    message: e.target.value,
                  })
                }
                style={{ borderColor: BORDER_COLOR }}
              ></textarea>
            </div>
          </div>
        </div>


        {/* Footer Buttons */}
        <div
          className="flex gap-3 justify-end p-6 border-t"
          style={{ borderColor: BORDER_COLOR, backgroundColor: HEADER_BG }}
        >
          <button
            className="px-6 py-2 rounded-lg text-sm font-medium transition"
            onClick={onClose}
            style={{
              backgroundColor: "transparent",
              color: ACCENT_COLOR,
              border: `2px solid ${BORDER_COLOR}`,
            }}
          >
            Cancel
          </button>


          <button
            onClick={onConfirm}
            disabled={isDisabled}
            className="px-6 py-2 rounded-lg text-sm font-medium text-white transition-colors"
            style={{
              backgroundColor: BTN_COLOR,
              opacity: isDisabled ? 0.5 : 1,
              cursor: isDisabled ? "not-allowed" : "pointer",
            }}
          >
            Send Message
          </button>
        </div>
      </div>
    </div>
  );
}



