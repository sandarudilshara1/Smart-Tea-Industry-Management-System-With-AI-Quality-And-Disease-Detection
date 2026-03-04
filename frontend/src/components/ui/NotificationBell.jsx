import { Bell } from 'lucide-react';

const NotificationBell = ({ onClick, hasNotifications = true, notificationCount = 3 }) => {
  return (
    <button
      onClick={onClick}
      className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
    >
      <Bell className="w-5 h-5" />
      {hasNotifications && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {notificationCount > 9 ? '9+' : notificationCount}
        </span>
      )}
    </button>
  );
};

export default NotificationBell;
