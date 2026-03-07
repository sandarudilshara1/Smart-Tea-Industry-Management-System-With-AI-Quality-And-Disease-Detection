import {
    Award,
    Download,
    Paperclip,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getAllAnnouncements } from "../../api/announcement";
import { useAuth } from "../../contexts/AuthContext";

const BUTTON_COLOR = "#172526";
const ACCENT_COLOR = "#165e52";

export default function AnnouncementComponent() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [notification, setNotification] = useState(null);

  // local mapping of factory ids to names (same as viewAnnoucement.jsx)
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

  const formatFactories = (facs) => {
    if (!facs) return "-";
    if (!Array.isArray(facs)) return String(facs);
    return facs
      .map((fid) => {
        // handle case where fid may be an object { id, name }
        if (fid && typeof fid === "object") {
          return fid.name || fid.id || JSON.stringify(fid);
        }
        const found = factoryOptions.find((f) => String(f.id) === String(fid) || f.id === fid);
        return found ? found.name : fid;
      })
      .join(", ");
  };

  // fetch announcements
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
    return () => (mounted = false);
  }, []);


  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Handle file download
  const handleDownload = (attachment) => {
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

  // View-only: update and delete actions removed

  // Add new action removed per UI update

  // compute visible announcements based on user's factory
  const visibleAnnouncements = useMemo(() => {
    const factoryId = user?.factoryId;
    const factoryName = user?.factoryName;
    if (!factoryId && !factoryName) return announcements || [];
    return (announcements || []).filter((announcement) => {
      const facs = announcement.factories;
      if (!facs) return false;
      if (Array.isArray(facs)) {
        return facs.some((f) => {
          if (f == null) return false;
          if (typeof f === "object") {
            return String(f.id) === String(factoryId) || String(f.name) === String(factoryName);
          }
          return String(f) === String(factoryId) || String(f) === String(factoryName);
        });
      }
      const s = String(facs);
      return (factoryId && s.includes(String(factoryId))) || (factoryName && s.includes(String(factoryName)));
    });
  }, [announcements, user?.factoryId, user?.factoryName]);

  const Notification = () => {
    if (!notification) return null;
    const style = notification.type === "success" ? "bg-green-600" : "bg-red-600";
    return (
      <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded text-white ${style}`}>
        {notification.message}
      </div>
    );
  };

  return (
    <div className="min-h-screen overflow-auto bg-[#f8fdfc]">
      <Notification />

      {/* Header */}
      <div className="bg-white shadow-md border-b">
        <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-1" style={{ color: ACCENT_COLOR }}>Announcements</h1>
            {/* <h1 className="text-3xl font-bold mb-1 text-gray-900">Announcements</h1> */}
            {/* <p className="text-[#000000] opacity-80 max-w-2xl">Owner Dashboard - Announcement Center</p> */}
          </div>
          {/* Add New removed */}
        </div>
      </div>

      {/* Content */}
  <div className="max-w-7xl mx-auto px-6 py-8">
  <div>
          {visibleAnnouncements.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <Award className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Announcements</h3>
              <p className="text-gray-600">There are no announcements for your factory at this time.</p>
            </div>
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {visibleAnnouncements.map((announcement) => {
              const formattedFactories = formatFactories(announcement.factories);
              const factoryCount = formattedFactories === "-" ? 0 : formattedFactories.split(", ").length;

              return (
              <div key={announcement._id || announcement.id} className="bg-white rounded-xl shadow-md border border-gray-200 transition hover:shadow-xl hover:border-[#165e52] overflow-hidden">
                <div className="bg-gradient-to-r from-[#f0f9f8] to-white p-4 border-b border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border-2 border-[#165e52] bg-white text-[#165e52] font-semibold text-sm shadow-sm capitalize">
                      <span className="w-2 h-2 rounded-full bg-[#165e52] inline-block" />
                      {announcement.topic}
                    </span>
                    <span className="text-xs text-gray-500 font-medium bg-gray-100 px-3 py-1 rounded-full">
                      {factoryCount} {factoryCount === 1 ? "Factory" : "Factories"}
                    </span>
                  </div>

                </div>
                <div className="p-6">
                  <div className="mb-3">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{announcement.subject || <span className="text-gray-400">No Subject</span>}</h3>
                    <p className="text-xs text-gray-500">Assigned to: {formattedFactories}</p>
                  </div>

                  <div className="mb-4">
                    <p className="text-gray-700 text-sm leading-relaxed">{announcement.content || <span className="text-gray-400">No content available</span>}</p>
                  </div>

                  {announcement.attachments && announcement.attachments.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-2 mb-3">
                        <Paperclip className="w-4 h-4 text-[#165e52]" />
                        <span className="font-semibold text-sm text-gray-900">Attachments ({announcement.attachments.length})</span>
                      </div>
                      <div className="space-y-2">
                        {announcement.attachments.map((attachment) => (
                          <div key={attachment.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-gradient-to-r from-gray-50 to-white hover:from-[#f0f9f8] hover:to-white transition-all">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 rounded-lg bg-[#165e52] bg-opacity-10 flex items-center justify-center">
                                <Paperclip className="w-4 h-4 text-[#165e52]" />
                              </div>
                              <div>
                                <span className="text-sm font-medium text-gray-900 block">{attachment.name}</span>
                                <span className="text-xs text-gray-500">{attachment.size}</span>
                              </div>
                            </div>
                            <button 
                              onClick={() => handleDownload(attachment)} 
                              className="p-2 text-[#165e52] hover:bg-[#165e52] hover:text-white rounded-lg transition-all"
                              title="Download file"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              );
            })}
          </div>
          )}
        </div>

      </div>
    </div>
  );
}

