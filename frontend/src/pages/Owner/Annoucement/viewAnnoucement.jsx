import {
  AlertCircle,
  CheckCircle,
  Download,
  Paperclip,
  Plus,
  X,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllAnnouncements, deleteAnnouncement } from "../../../api/announcement";

const ACCENT_COLOR = "#165e52";
const BUTTON_COLOR = "#172526";

export default function GreenLeafDashboard() {
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState([]);
  const factoryOptions = [
    { id: 1, name: "Wawlugala Tea Factory" },
    { id: 2, name: "Miyanawathura Tea Factory" },
    { id: 3, name: "Andaradeniya Tea Factory" },
    { id: 4, name: "Batuwangala Tea Factory" },
    { id: 5, name: "Duli Ella Tea Factory" },
    { id: 6, name: "Devonia Tea Factory" },
    { id: 7, name: "Fortune Tea Factory" },
    { id: 8, name: "Galaxi Tea Factory" },
    { id: 9, name: "Ruhunu Tea Factory" },
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

  const formatTopic = (topic) => {
    if (!topic) return "-";
    const found = topicOptions.find((t) => String(t.id) === String(topic));
    return found ? found.name : String(topic);
  };

  const [notification, setNotification] = useState(null);

  // Fetch announcements from backend on mount (use centralized API helper)
  useEffect(() => {
    let mounted = true;
    async function fetchAnnouncements() {
      try {
        const response = await getAllAnnouncements();
        if (mounted && response.success) {
          setAnnouncements(response.data.announcements || []);
        }
      } catch (error) {
        console.error("Error fetching announcements:", error?.response || error?.message || error);
        if (mounted) {
          setAnnouncements([]);
          showNotification("Failed to load announcements", "error");
        }
      }
    }
    fetchAnnouncements();
    return () => {
      mounted = false;
    };
  }, []);

  // Auto-hide notification after 3 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this announcement?")) {
      return;
    }
    
    try {
      const result = await deleteAnnouncement(id);
      if (result.success) {
        setAnnouncements((prev) => prev.filter((ann) => (ann._id || ann.id) !== id));
        showNotification("Announcement deleted successfully", "success");
      } else {
        showNotification(result.message || "Failed to delete announcement", "error");
      }
    } catch (error) {
      showNotification("Failed to delete announcement", "error");
      console.error("Error deleting announcement:", error?.response || error?.message || error);
    }
  };

  const handleUpdate = async (id) => {
    const announcement = announcements.find((ann) => (ann._id || ann.id) === id);
    if (announcement) {
      // Example: navigate to update page, or send update to backend
      // Here, you can POST/PATCH to backend, or just navigate
      // For demonstration, let's navigate and also show how to call backend
      // Uncomment below to send update to backend
      // try {
      //   const apiUrl =
      //     process.env.NODE_ENV === "development"
      //       ? `http://localhost:8080/api/announcements/${id}`
      //       : `/api/announcements/${id}`;
      //   const response = await fetch(apiUrl, {
      //     method: "PATCH", // or "PUT"
      //     headers: { "Content-Type": "application/json" },
      //     body: JSON.stringify(announcement),
      //   });
      //   if (response.ok) {
      //     showNotification("Announcement updated successfully", "success");
      //   } else {
      //     showNotification("Failed to update announcement", "error");
      //   }
      // } catch (error) {
      //   showNotification("Error updating announcement", "error");
      //   console.error("Error updating announcement:", error);
      // }
      navigate("/owner/announcement/update", { state: { announcement } });
    }
  };

  const handleAddNew = () => {
    navigate("/owner/announcement/add");
  };

  const handleDownloadAttachment = (attachment) => {
    if (!attachment || !attachment.url) {
      showNotification("No file available for download", "error");
      return;
    }

    try {
      // Create a temporary anchor element and trigger download
      const link = document.createElement('a');
      link.href = attachment.url;
      link.download = attachment.name || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showNotification(`Downloading ${attachment.name}...`, "success");
    } catch (error) {
      console.error("Download error:", error);
      showNotification("Failed to download file", "error");
    }
  };

  const NotificationComponent = () => {
    if (!notification) return null;

    const getNotificationStyle = (type) => {
      switch (type) {
        case "success":
          return "bg-green-600 text-white";
        case "error":
          return "bg-red-600 text-white";
        case "info":
          return "bg-blue-600 text-white";
        default:
          return "bg-gray-600 text-white";
      }
    };

    const getNotificationIcon = (type) => {
      switch (type) {
        case "success":
          return <CheckCircle className="w-5 h-5" />;
        case "error":
          return <XCircle className="w-5 h-5" />;
        case "info":
          return <AlertCircle className="w-5 h-5" />;
        default:
          return <AlertCircle className="w-5 h-5" />;
      }
    };

    return (
      <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right duration-300">
        <div
          className={`flex items-center space-x-3 px-6 py-4 rounded-lg shadow-lg ${getNotificationStyle(
            notification.type
          )}`}
        >
          {getNotificationIcon(notification.type)}
          <span className="font-medium">{notification.message}</span>
          <button
            onClick={() => setNotification(null)}
            className="ml-2 hover:opacity-70 transition-opacity"
            aria-label="Close notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50 to-gray-50">
      <NotificationComponent />
      <div className="bg-white shadow-lg border-b-4" style={{ borderBottomColor: ACCENT_COLOR }}>
        <div className="max-w-7xl mx-auto px-6 py-8 flex justify-between items-center">
          <div>
            <h1
              className="text-4xl font-bold mb-2 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent"
            >
               Announcements
            </h1>
            <p className="text-gray-600 text-lg">
              Manage and broadcast important updates across all factories
            </p>
          </div>
          <button
            onClick={handleAddNew}
            className="flex items-center gap-3 px-8 py-3 rounded-xl font-semibold shadow-lg transition-all transform hover:scale-105 hover:shadow-xl"
            style={{ backgroundColor: ACCENT_COLOR, color: "white" }}
          >
            <Plus className="w-5 h-5" />
            Create New
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {announcements.map((announcement) => (
            <div
              key={announcement._id || announcement.id}
              className="bg-white p-8 rounded-2xl shadow-lg border-2 border-gray-100 transition-all duration-300 hover:shadow-2xl hover:border-[#165e52] transform hover:-translate-y-2 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-4">
                  <span
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border-2 font-bold text-sm uppercase tracking-wide shadow-md"
                    style={{
                      borderColor: ACCENT_COLOR,
                      backgroundColor: '#f0f9f8',
                      color: ACCENT_COLOR
                    }}
                  >
                    <span className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ backgroundColor: ACCENT_COLOR }}></span>
                    {formatTopic(announcement.topic)}
                  </span>
                </div>
                <div className="mb-3">
                  <h3 className="text-xl font-bold text-gray-900 leading-tight">
                    {announcement.subject || (
                      <span className="text-gray-400">No Subject</span>
                    )}
                  </h3>
                </div>
                <div className="mb-4">
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {announcement.content || (
                      <span className="text-gray-400 italic">No content available</span>
                    )}
                  </p>
                </div>
                <div className="mb-4 pb-4 border-b border-gray-200">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="font-semibold">📍 Factories:</span>
                    <span className="text-gray-600">
                      {announcement.factories && Array.isArray(announcement.factories)
                          ? announcement.factories
                              .map(fid => {
                                const found = factoryOptions.find(f => String(f.id) === String(fid) || f.id === Number(fid));
                                return found ? found.name : fid;
                              })
                              .slice(0, 2)
                              .join(", ") + (announcement.factories.length > 2 ? ` +${announcement.factories.length - 2} more` : "")
                          : "N/A"}
                    </span>
                  </div>
                </div>
                {announcement.attachments &&
                  announcement.attachments.length > 0 && (
                    <div className="mb-6">
                      <div className="flex items-center gap-2 font-semibold text-gray-700 mb-3 text-sm">
                        <Paperclip className="w-4 h-4" style={{ color: ACCENT_COLOR }} />
                        <span>Attachments ({announcement.attachments.length})</span>
                      </div>
                      <div className="space-y-2">
                        {announcement.attachments.map((attachment) => (
                          <div
                            key={attachment.id}
                            className="flex items-center justify-between p-3 border-2 border-gray-200 rounded-xl bg-gradient-to-r from-gray-50 to-white hover:border-[#165e52] transition-all"
                          >
                            <div className="flex items-center space-x-3 flex-1 min-w-0">
                              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#f0f9f8' }}>
                                <Paperclip className="w-4 h-4" style={{ color: ACCENT_COLOR }} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <span className="text-sm text-gray-800 font-medium block truncate">
                                  {attachment.name}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {attachment.size}
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={() =>
                                handleDownloadAttachment(attachment)
                              }
                              className="p-2 rounded-lg hover:bg-green-50 transition-colors flex-shrink-0"
                              style={{ color: ACCENT_COLOR }}
                              aria-label={`Download ${attachment.name}`}
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
              <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleUpdate(announcement._id || announcement.id)}
                  className="flex-1 px-5 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-md hover:shadow-lg text-white"
                  style={{ backgroundColor: ACCENT_COLOR }}
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => handleDelete(announcement._id || announcement.id)}
                  className="flex-1 px-5 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-md hover:shadow-lg text-white bg-red-600 hover:bg-red-700"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
