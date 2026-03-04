import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Bell } from "lucide-react";
import NotificationDropdown from "./NotificationDropdown";
import ProfileDropdown from "./ProfileDropdown";
import UserAvatar from "./UserAvatar";

const ACCENT_COLOR = "#01251F";
const FONT_FAMILY = "Inter, Segoe UI, Arial, sans-serif"; // More professional and modern

const Navbar = () => {
  // Get current date in Sri Lanka time zone
  const date = () => {
    const date = new Date();
    return date.toLocaleDateString("en-GB", {
      timeZone: "Asia/Colombo",
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  };
  const todayDate = date();
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    setShowProfile(false);
  };

  const toggleProfile = () => {
    setShowProfile(!showProfile);
    setShowNotifications(false);
  };

  const closeDropdowns = () => {
    setShowNotifications(false);
    setShowProfile(false);
  };

  return (
    <nav
      className="bg-white border-b border-gray-200 px-6 py-2 shadow-sm relative"
      style={{ fontFamily: FONT_FAMILY, fontWeight: 500 }}
    >
      <div className="flex items-center justify-between">
        {/* Company Name */}
        <div className="flex flex-col items-start">
          <span className="text-3xl font-bold text-black tracking-tight font-sans">
            {user?.factoryName || "Factory Name"}
          </span>
          <span className="text-s text-gray-500 font-normal mt-1">
            {todayDate}
          </span>
        </div>

        <div className="flex items-center space-x-4 ml-auto">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={toggleNotifications}
              className="relative p-2 text-[#172526] hover:text-black hover:bg-gray-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#172526]/20"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {/* Notification badge */}
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold drop-shadow">
                3
              </span>
            </button>
            {showNotifications && (
              <NotificationDropdown onClose={closeDropdowns} />
            )}
          </div>

          {/* User Profile */}
          <div className="relative">
            <button
              onClick={toggleProfile}
              className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-[#172526]/20"
            >
              <UserAvatar name={user?.username} />
              <div className="hidden md:block text-left">
                <p className="font-semibold text-sm text-[#172526] leading-tight">
                  {user?.name || ""}
                </p>
                <p className="text-gray-500 text-xs capitalize font-medium">
                  {user?.role?.toLowerCase() || "Supervisor"}
                </p>
              </div>
              {/* Dropdown Arrow */}
              <svg
                className={`w-4 h-4 text-gray-400 ml-1 transition-transform ${
                  showProfile ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {showProfile && (
              <ProfileDropdown user={user} onClose={closeDropdowns} />
            )}
          </div>
        </div>
      </div>

      {/* Backdrop for dropdowns */}
      {(showNotifications || showProfile) && (
        <div className="fixed inset-0 z-10" onClick={closeDropdowns} />
      )}
    </nav>
  );
};

export default Navbar;
