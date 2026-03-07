import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, AlertCircle, Info, Clock, Bell } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getAllAnnouncements } from '../../api/announcement';

const NotificationDropdown = ({ onClose }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const response = await getAllAnnouncements();
      console.log('Announcements API response:', response);
      // Backend returns { success, data: { announcements: [...] } }
      const allAnnouncements = response?.data?.announcements || response?.announcements || [];
      console.log('Parsed announcements:', allAnnouncements);
      // Take only first 3 announcements
      const latestAnnouncements = allAnnouncements.slice(0, 3);
      setAnnouncements(latestAnnouncements);
    } catch (error) {
      console.error('Error fetching announcements:', error);
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  };

  const getAnnouncementsRoute = () => {
    // Determine route based on user role
    const role = user?.role?.toLowerCase();
    console.log('User role for routing:', role);
    switch (role) {
      case 'transport_manager':
        return '/transportManager/announcements';
      case 'factory_manager':
        return '/factoryManager/announcements';
      case 'fertilizer_manager':
        return '/fertilizerManager/announcements';
      case 'inventory_manager':
        return '/inventoryManager/announcements';
      case 'owner':
        return '/owner/announcement';
      default:
        return '/announcements';
    }
  };

  const handleViewAll = () => {
    const route = getAnnouncementsRoute();
    navigate(route);
    onClose();
  };

  const handleNotificationClick = (announcement) => {
    const route = getAnnouncementsRoute();
    navigate(route);
    onClose();
  };

  const getNotificationIcon = (topic) => {
    switch (topic?.toLowerCase()) {
      case 'payments':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'maintenance':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'routes':
        return <Info className="w-5 h-5 text-blue-600" />;
      case 'inventory':
        return <AlertCircle className="w-5 h-5 text-orange-600" />;
      case 'fertilizer':
        return <Info className="w-5 h-5 text-green-700" />;
      case 'event':
        return <CheckCircle className="w-5 h-5 text-purple-600" />;
      case 'general':
      default:
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  const getTopicBadgeColor = (topic) => {
    switch (topic?.toLowerCase()) {
      case 'payments':
        return 'bg-green-100 text-green-700';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-700';
      case 'routes':
        return 'bg-blue-100 text-blue-700';
      case 'inventory':
        return 'bg-orange-100 text-orange-700';
      case 'fertilizer':
        return 'bg-green-100 text-green-800';
      case 'event':
        return 'bg-purple-100 text-purple-700';
      case 'general':
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Just now';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-20">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-[#165E52] to-[#1a7566]">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-white" />
            <h3 className="text-base font-semibold text-white">Latest Announcements</h3>
          </div>
          <button
            onClick={handleViewAll}
            className="text-xs text-white hover:text-gray-200 transition font-medium"
          >
            View all →
          </button>
        </div>
      </div>

      {/* Notifications */}
      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <div className="p-10 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#165E52] mx-auto"></div>
            <p className="text-sm text-gray-500 mt-3 font-medium">Loading announcements...</p>
          </div>
        ) : announcements.length === 0 ? (
          <div className="p-10 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Bell className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-600 font-medium">No announcements yet</p>
            <p className="text-xs text-gray-400 mt-1">Check back later for updates</p>
          </div>
        ) : (
          <div className="py-2">
            {announcements.map((announcement) => (
              <div
                key={announcement._id || announcement.id}
                className="flex p-4 items-start space-x-3 cursor-pointer border-b border-gray-100 hover:bg-gray-50 transition-all"
                onClick={() => handleNotificationClick(announcement)}
              >
                <div className="flex-shrink-0 mt-1">
                  {getNotificationIcon(announcement.topic)}
                </div>
                <div className="flex-1 min-w-0">
                  {/* Topic Badge */}
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium mb-1 ${getTopicBadgeColor(announcement.topic)}`}>
                    {announcement.topic?.toUpperCase() || 'GENERAL'}
                  </span>
                  
                  {/* Subject (Title) */}
                  <p className="font-semibold text-sm text-black leading-tight">
                    {announcement.subject || announcement.title || 'No Subject'}
                  </p>
                  
                  {/* Content Preview */}
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2 leading-snug">
                    {announcement.content || announcement.message || 'No content available'}
                  </p>
                  
                  {/* Timestamp */}
                  <div className="flex items-center mt-2">
                    <Clock className="w-3 h-3 text-gray-400 mr-1" />
                    <span className="text-xs text-gray-500">
                      {formatDate(announcement.createdAt || announcement.date)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-200 bg-gray-50">
        <button
          onClick={handleViewAll}
          className="w-full text-sm text-white bg-[#165E52] hover:bg-[#134a40] transition-all text-center font-semibold py-2.5 rounded-lg shadow-sm hover:shadow-md"
        >
          View All Announcements
        </button>
      </div>
    </div>
  );
};

export default NotificationDropdown;
