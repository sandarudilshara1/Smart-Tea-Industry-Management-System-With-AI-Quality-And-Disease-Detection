import { Paperclip, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import { createAnnouncement } from "../../../api/announcement";

const ACCENT_COLOR = "#165E52";
const BTN_COLOR = "#01251F";
const BORDER_COLOR = "#cfece6";
const HEADER_BG = "#e1f4ef";
const INPUT_BG = "#ffffff";

export default function AddAnnouncement() {
  const { user, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const authCheckDone = useRef(false);
  
  const [form, setForm] = useState({
    topic: "",
    subject: "",
    content: "",
    factories: [],
    attachments: [],
  });
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const factoryOptions = [
    { id: "1", name: "Wawlugala Tea Factory" },
    { id: "2", name: "Miyanawathura Tea Factory" },
    { id: "3", name: "Andaradeniya Tea Factory" },
    { id: "4", name: "Batuwangala Tea Factory" },
    { id: "5", name: "Duli Ella Tea Factory" },
    { id: "6", name: "Devonia Tea Factory" },
    { id: "7", name: "Fortune Tea Factory" },
    { id: "8", name: "Galaxi Tea Factory" },
    { id: "9", name: "Ruhunu Tea Factory" },
  ];

  const topicOptions = [
    { id: "general", name: "General" },
    { id: "payments", name: "Payments" },
    { id: "maintenance", name: "Maintenance" },
    { id: "routes", name: "Routes" },
    { id: "inventory", name: "Inventory" },
    { id: "fertilizer", name: "Fertilizer" },
    { id: "event", name: "Event" },
  ];

  // Check authentication and owner role on mount (only once)
  useEffect(() => {
    // Wait for auth to finish loading
    if (loading) {
      console.log('[AddAnnouncement] Auth loading...');
      return;
    }
    
    // Only check once
    if (authCheckDone.current) {
      return;
    }
    
    authCheckDone.current = true;
    
    console.log('[AddAnnouncement] Auth check:', { 
      isAuthenticated, 
      userRole: user?.role,
      hasToken: !!localStorage.getItem("authToken")
    });
    
    const token = localStorage.getItem("authToken");
    
    // Check authentication
    if (!isAuthenticated || !token) {
      console.warn('[AddAnnouncement] Not authenticated, redirecting to login');
      alert("You must be logged in to create announcements. Redirecting to login...");
      navigate("/login");
      return;
    }
    
    // Check if user is owner (only after we confirm user object exists)
    if (user) {
      if (user.role !== "owner") {
        console.warn('[AddAnnouncement] Access denied - user role:', user.role);
        alert("Access denied. Only owners can create announcements.");
        navigate(-1);
      } else {
        console.log('[AddAnnouncement] Access granted for owner');
      }
    }
  }, [loading, isAuthenticated, user, navigate]);

  const handleInputChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleFactoryToggle = (factoryId) => {
    setForm((prev) => {
      const isSelected = prev.factories.includes(factoryId);
      const newFactories = isSelected
        ? prev.factories.filter((f) => f !== factoryId)
        : [...prev.factories, factoryId];
      return {
        ...prev,
        factories: newFactories,
      };
    });
    setDropdownOpen(false);
  };

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    // Convert each file to base64 data URL
    const filePromises = files.map((file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve({
            id: Date.now() + Math.random(),
            name: file.name,
            size: (file.size / (1024 * 1024)).toFixed(2) + " MB",
            url: reader.result, // base64 data URL
            file: file,
          });
        };
        reader.readAsDataURL(file);
      });
    });

    const newAttachments = await Promise.all(filePromises);
    setForm((prev) => ({
      ...prev,
      attachments: [...prev.attachments, ...newAttachments],
    }));
  };

  const handleRemoveAttachment = (attachmentId) => {
    setForm((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((att) => att.id !== attachmentId),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check authentication before submitting
    const token = localStorage.getItem("authToken");
    if (!token || !isAuthenticated) {
      alert("Your session has expired. Please log in again.");
      navigate("/login");
      return;
    }

    // Check if user is owner
    if (!user || user.role !== "owner") {
      alert("Access denied. Only owners can create announcements.");
      navigate(-1);
      return;
    }

    // Validation
    if (!form.topic || !form.subject || !form.content) {
      alert("Please fill in all required fields");
      return;
    }

    if (form.factories.length === 0) {
      alert("Please select at least one factory");
      return;
    }

    console.log("Creating announcement:");
    console.log("topic:", form.topic);
    console.log("subject:", form.subject);
    console.log("content:", form.content);
    console.log("factories:", form.factories);
    console.log("Token present:", !!token);
    console.log("User authenticated:", isAuthenticated);
    console.log("attachments:", form.attachments.map(att => ({ name: att.name, size: att.size })));

    // Prepare data for backend
    const announcementData = {
      topic: form.topic,
      subject: form.subject,
      content: form.content,
      factories: form.factories.map(f => Number(f)),
      // Store attachments with base64 data URLs
      attachments: form.attachments.map(att => ({
        name: att.name,
        size: att.size,
        url: att.url || '' // base64 data URL for download
      }))
    };

    try {
      const result = await createAnnouncement(announcementData);
      console.log("Backend response:", result);
      if (result.success) {
        alert("Announcement created successfully!");
        navigate(-1);
      } else {
        alert("Failed to create announcement: " + (result.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Error creating announcement:", error?.response || error?.message || error);
      
      // Handle authentication errors specifically
      if (error?.response?.status === 401) {
        alert("Authentication failed. Please log in again.");
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
        navigate("/login");
      } else {
        alert("Failed to create announcement: " + (error?.response?.data?.message || error?.message || "Unknown error"));
      }
    }
  };

  // Show loading while authentication is being checked
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-[#165E52] border-solid mx-auto mb-4"></div>
          <div style={{ color: "#165E52", fontWeight: "bold", fontSize: 18 }}>
            Loading...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Add Announcement
              </h1>
              <p className="text-gray-600 mt-1">
                Owner Dashboard - Add a New Announcement
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                type="button"
                className="flex items-center text-gray-500 hover:text-gray-700 text-lg font-medium px-4 py-2 rounded-lg border border-gray-300 bg-white transition-colors"
                style={{ borderColor: BORDER_COLOR }}
              >
                <span className="mr-2">&#8592;</span> Back
              </button>
              <button
                onClick={handleSubmit}
                className="px-6 py-2 rounded-lg font-medium shadow transition-colors"
                style={{ backgroundColor: BTN_COLOR, color: "white" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = ACCENT_COLOR)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = BTN_COLOR)
                }
              >
                Save Announcement
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm">
          <form onSubmit={handleSubmit} className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                <div className="border-b border-gray-100 pb-4 mb-6">
                  <h3 className="text-lg font-semibold" style={{ color: ACCENT_COLOR }}>
                    Announcement Details
                  </h3>
                </div>

                {/* Topic */}
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Topic :
                  </label>
                  <select
                    value={form.topic}
                    onChange={(e) => handleInputChange("topic", e.target.value)}
                    className="w-full px-4 py-3 border rounded-lg text-gray-900 focus:ring-2 focus:ring-[#165e52]"
                    style={{ borderColor: BORDER_COLOR }}
                  >
                    <option value="">Select topic</option>
                    {topicOptions.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Subject :
                  </label>
                  <input
                    type="text"
                    value={form.subject}
                    onChange={(e) =>
                      handleInputChange("subject", e.target.value)
                    }
                    className="w-full px-4 py-3 border rounded-lg text-gray-900 focus:ring-2 focus:ring-[#165e52]"
                    placeholder="Enter announcement subject"
                    style={{ borderColor: BORDER_COLOR }}
                  />
                </div>

                {/* Content */}
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Content :
                  </label>
                  <textarea
                    value={form.content}
                    onChange={(e) =>
                      handleInputChange("content", e.target.value)
                    }
                    rows={5}
                    className="w-full px-4 py-3 border rounded-lg text-gray-900 focus:ring-2 focus:ring-[#165e52] resize-none"
                    placeholder="Enter announcement content"
                    style={{ borderColor: BORDER_COLOR }}
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <div className="border-b border-gray-100 pb-4 mb-6">
                  <h3 className="text-lg font-semibold" style={{ color: ACCENT_COLOR }}>
                    Assignment & Attachments
                  </h3>
                </div>

                {/* Factories */}
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Factories :
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className="w-full px-4 py-3 border rounded-lg text-left text-gray-900 bg-white"
                      style={{ borderColor: BORDER_COLOR }}
                    >
                      {form.factories.length > 0
                        ? factoryOptions
                            .filter((f) => form.factories.includes(f.id))
                            .map((f) => f.name)
                            .join(", ")
                        : "Select factories"}
                    </button>
                    {dropdownOpen && (
                      <ul className="absolute top-full left-0 right-0 mt-1 max-h-64 overflow-auto rounded-lg border bg-white shadow-lg z-50">
                        {factoryOptions.map((factory) => (
                          <li
                            key={factory.id}
                            className={`flex items-center px-4 py-2 cursor-pointer hover:bg-[#e1f4ef] ${
                              form.factories.includes(factory.id)
                                ? "bg-[#d4eadf] font-semibold"
                                : ""
                            }`}
                            onClick={() => handleFactoryToggle(factory.id)}
                          >
                            <input
                              type="checkbox"
                              checked={form.factories.includes(factory.id)}
                              readOnly
                              className="w-4 h-4 mr-2"
                            />
                            {factory.name}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {form.factories.length} selected
                  </div>
                </div>

                {/* File Upload */}
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Attach Files
                  </label>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <input
                        type="file"
                        multiple
                        onChange={handleFileUpload}
                        className="hidden"
                        id="fileUpload"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt,.xlsx,.xls"
                      />
                      <label
                        htmlFor="fileUpload"
                        className="flex items-center space-x-2 bg-[#01251f] text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-[#165e52]"
                      >
                        <Paperclip className="w-4 h-4" />
                        <span>Choose Files</span>
                      </label>
                      <span className="ml-3 text-sm text-gray-500">
                        Supported: PDF, DOC, DOCX, JPG, PNG, TXT, XLSX
                      </span>
                    </div>

                    {form.attachments.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-700">
                          Selected Files:
                        </p>
                        {form.attachments.map((attachment) => (
                          <div
                            key={attachment.id}
                            className="flex items-center justify-between p-3 border rounded-lg bg-gray-50"
                          >
                            <div className="flex items-center space-x-3">
                              <Paperclip className="w-4 h-4 text-gray-500" />
                              <span className="text-sm text-gray-700">
                                {attachment.name}
                              </span>
                              <span className="text-xs text-gray-500">
                                ({attachment.size})
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                handleRemoveAttachment(attachment.id)
                              }
                              className="p-1 text-red-500 hover:text-red-700"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
