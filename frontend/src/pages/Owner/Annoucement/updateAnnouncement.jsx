import { Paperclip, X } from "lucide-react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { updateAnnouncement } from "../../../api/announcement";

const ACCENT_COLOR = "#165E52";
const BTN_COLOR = "#01251F";
const BORDER_COLOR = "#cfece6";
const HEADER_BG = "#e1f4ef";
const INPUT_BG = "#ffffff";
const MAX_FILE_SIZE_MB = 3;
const MAX_TOTAL_SIZE_MB = 7;
const MAX_FILES = 5;

export default function UpdateAnnouncement() {
  const navigate = useNavigate();
  const location = useLocation();
  const announcement = location.state?.announcement || {
    topic: "",
    subject: "",
    content: "",
    factories: [],
    attachments: [],
  };
  // Ensure factories are always stored as IDs (strings)
  const [form, setForm] = useState({
    ...announcement,
    factories: Array.isArray(announcement.factories)
      ? announcement.factories.map(f => typeof f === "object" && f.id ? f.id : String(f))
      : [],
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

    if (form.attachments.length + files.length > MAX_FILES) {
      alert(`You can upload up to ${MAX_FILES} files only.`);
      event.target.value = "";
      return;
    }

    const oversizedFile = files.find(
      (file) => file.size > MAX_FILE_SIZE_MB * 1024 * 1024
    );
    if (oversizedFile) {
      alert(
        `File \"${oversizedFile.name}\" is too large. Max allowed per file is ${MAX_FILE_SIZE_MB} MB.`
      );
      event.target.value = "";
      return;
    }

    const currentTotalBytes = form.attachments.reduce((sum, att) => {
      const parsedSizeMb = parseFloat(String(att.size || "0"));
      return sum + (Number.isFinite(parsedSizeMb) ? parsedSizeMb * 1024 * 1024 : 0);
    }, 0);
    const incomingBytes = files.reduce((sum, file) => sum + file.size, 0);

    if (currentTotalBytes + incomingBytes > MAX_TOTAL_SIZE_MB * 1024 * 1024) {
      alert(
        `Total attachment size is too large. Keep total under ${MAX_TOTAL_SIZE_MB} MB.`
      );
      event.target.value = "";
      return;
    }

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

    event.target.value = "";
  };

  const handleRemoveAttachment = (attachmentId) => {
    setForm((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((att) => att.id !== attachmentId),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!form.topic || !form.subject || !form.content) {
      alert("Please fill in all required fields");
      return;
    }

    if (form.factories.length === 0) {
      alert("Please select at least one factory");
      return;
    }

    // Prepare data for backend
    const announcementData = {
      topic: form.topic,
      subject: form.subject,
      content: form.content,
      factories: form.factories.map(f => Number(f)),
      // Keep existing attachments with URLs, format new ones
      attachments: form.attachments.map(att => ({
        name: att.name,
        size: att.size,
        url: att.url || '' // base64 data URL for download
      }))
    };

    try {
      const result = await updateAnnouncement(announcement.id || announcement._id, announcementData);
      console.log("Update response:", result);
      if (result.success) {
        alert("Announcement updated successfully!");
        navigate(-1);
      } else {
        alert("Failed to update announcement: " + (result.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Error updating announcement:", error?.response || error?.message || error);
      const status = error?.response?.status;
      if (status === 413) {
        alert(
          "Failed to update announcement: attachments are too large. Reduce file sizes and try again."
        );
      } else {
        alert("Failed to update announcement: " + (error?.response?.data?.message || error?.message || "Unknown error"));
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div
        className="bg-white shadow-sm border-b"
        // style={{ borderColor: BORDER_COLOR }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1
                className="text-3xl font-bold text-gray-900"
                // style={{ color: ACCENT_COLOR }}
              >
                Update Announcement
              </h1>
              <p className="text-gray-600 mt-1">
                Owner Dashboard - Update Announcement
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                type="button"
                className="flex items-center text-gray-500 hover:text-gray-700 text-lg font-medium px-4 py-2 rounded-lg border bg-white transition-colors"
                style={{ borderColor: BORDER_COLOR }}
              >
                <span className="mr-2">&#8592;</span> Back
              </button>
              <button
                onClick={handleSubmit}
                className="px-6 py-2 rounded-lg font-medium shadow transition-colors text-white"
                style={{ backgroundColor: BTN_COLOR }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = ACCENT_COLOR)}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = BTN_COLOR)}
              >
                Update Announcement
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm">
          <form onSubmit={handleSubmit} className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column - Main Fields */}
              <div className="space-y-6">
                <div className="border-b border-[#cfece6] pb-4 mb-6">
                  <h3
                    className="text-lg font-semibold"
                    style={{ color: ACCENT_COLOR }}
                  >
                    Announcement Details
                  </h3>
                </div>

                {/* Topic Field */}
                <div>
                  <label
                    className="block font-medium mb-2"
                    style={{ color: ACCENT_COLOR }}
                  >
                    Topic :
                  </label>
                  <select
                    value={form.topic}
                    onChange={(e) => handleInputChange("topic", e.target.value)}
                    className="w-full px-4 py-3 border rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#165e52] focus:border-[#165e52] transition-all bg-white"
                    style={{ borderColor: BORDER_COLOR }}
                  >
                    <option value="">Select topic</option>
                    {topicOptions.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>

                {/* Subject Field */}
                <div>
                  <label
                    className="block font-medium mb-2"
                    style={{ color: ACCENT_COLOR }}
                  >
                    Subject :
                  </label>
                  <input
                    type="text"
                    value={form.subject}
                    onChange={(e) =>
                      handleInputChange("subject", e.target.value)
                    }
                    className="w-full px-4 py-3 border rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#165e52] focus:border-[#165e52] transition-all bg-white"
                    placeholder="Enter announcement subject"
                    style={{ borderColor: BORDER_COLOR }}
                  />
                </div>

                {/* Content Field */}
                <div>
                  <label
                    className="block font-medium mb-2"
                    style={{ color: ACCENT_COLOR }}
                  >
                    Content :
                  </label>
                  <textarea
                    value={form.content}
                    onChange={(e) =>
                      handleInputChange("content", e.target.value)
                    }
                    rows={5}
                    className="w-full px-4 py-3 border rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#165e52] focus:border-[#165e52] transition-all resize-none bg-white"
                    placeholder="Enter announcement content"
                    style={{ borderColor: BORDER_COLOR }}
                  />
                </div>
              </div>

              {/* Right Column - Factories & Attachments */}
              <div className="space-y-6">
                <div className="border-b border-[#cfece6] pb-4 mb-6">
                  <h3
                    className="text-lg font-semibold"
                    style={{ color: ACCENT_COLOR }}
                  >
                    Assignment & Attachments
                  </h3>
                </div>

                {/* Factories Multi-Select Styled Dropdown */}
                <div>
                  <label
                    className="block font-medium mb-2"
                    style={{ color: ACCENT_COLOR }}
                  >
                    Factories :
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      readOnly
                      value={form.factories.length > 0
                        ? factoryOptions
                            .filter((f) => form.factories.includes(f.id))
                            .map((f) => f.name)
                            .join(", ")
                        : "Select factories"}
                      className="w-full px-4 py-3 border rounded-lg text-left cursor-pointer bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#165e52] focus:border-[#165e52] transition-all"
                      style={{ borderColor: BORDER_COLOR }}
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      aria-haspopup="listbox"
                      aria-expanded={dropdownOpen}
                      placeholder="Select factories"
                    />
                    {dropdownOpen && (
                      <ul
                        className="absolute top-full left-0 right-0 mt-1 max-h-64 overflow-auto rounded-lg border border-[#165e52] bg-white shadow-lg z-50"
                        role="listbox"
                        tabIndex={-1}
                      >
                        {factoryOptions.map((factory) => (
                          <li
                            key={factory.id}
                            role="option"
                            aria-selected={form.factories.includes(factory.id)}
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
                              className="w-4 h-4 mr-2 cursor-pointer text-[#165e52] bg-white border border-gray-300 rounded focus:ring-[#165e52] focus:ring-2"
                            />
                            <span className="flex items-center gap-2">
                              {factory.name}
                              {form.factories.includes(factory.id) && (
                                <span className="text-green-600 ml-1">&#10003;</span>
                              )}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div className="text-sm text-gray-700 mt-2">
                    <span className="font-medium">Selected Factories:</span>
                    {form.factories.length > 0 ? (
                      <span className="ml-2">
                        {factoryOptions
                          .filter(f => form.factories.includes(f.id))
                          .map(f => f.name)
                          .join(", ")}
                      </span>
                    ) : (
                      <span className="ml-2 text-gray-400">None</span>
                    )}
                  </div>
                </div>

                {/* Attach Files */}
                <div>
                  <label
                    className="block font-medium mb-2"
                    style={{ color: ACCENT_COLOR }}
                  >
                    Attach Files
                  </label>
                  <div className="space-y-4 rounded-xl border border-[#cfece6] bg-[#f7fcfa] p-4 sm:p-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
                        className="inline-flex w-fit items-center space-x-2 rounded-lg bg-[#01251f] px-4 py-2.5 text-white shadow-sm transition-colors hover:bg-[#165e52] cursor-pointer"
                      >
                        <Paperclip className="w-4 h-4" />
                        <span>Choose Files</span>
                      </label>

                      <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-600">
                        <span className="rounded-full bg-white px-3 py-1 border border-[#d9ebe5]">
                          Max {MAX_FILE_SIZE_MB}MB per file
                        </span>
                        <span className="rounded-full bg-white px-3 py-1 border border-[#d9ebe5]">
                          {MAX_TOTAL_SIZE_MB}MB total
                        </span>
                        <span className="rounded-full bg-white px-3 py-1 border border-[#d9ebe5]">
                          Up to {MAX_FILES} files
                        </span>
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-gray-500">
                      Supported formats: PDF, DOC, DOCX, JPG, PNG, TXT, XLSX
                    </p>

                    {form.attachments.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-700">
                          Selected Files ({form.attachments.length})
                        </p>
                        {form.attachments.map((attachment) => (
                          <div
                            key={attachment.id}
                            className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-white"
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
                              className="p-1 text-red-500 hover:text-red-700 transition-colors"
                              aria-label={`Remove ${attachment.name}`}
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
