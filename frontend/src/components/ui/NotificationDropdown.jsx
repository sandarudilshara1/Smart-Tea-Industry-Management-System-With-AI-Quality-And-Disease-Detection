import { CheckCircle, AlertCircle, Info, Clock, Bell } from 'lucide-react';

const NotificationDropdown = ({ onClose }) => {
  const notifications = [
    {
      id: 1,
      type: 'success',
      title: 'Production Target Met',
      message: 'Daily tea production target of 500kg achieved.',
      time: '2 minutes ago',
      unread: true,
    },
    {
      id: 2,
      type: 'warning',
      title: 'Low Inventory Alert',
      message: 'Tea leaf inventory below 50kg threshold.',
      time: '1 hour ago',
      unread: true,
    },
    {
      id: 3,
      type: 'info',
      title: 'Maintenance Scheduled',
      message: 'Equipment maintenance scheduled for tomorrow.',
      time: '3 hours ago',
      unread: false,
    },
  ];

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
      case 'info':
      case 'warning':
      case 'error':
      default:
        return <Info className="w-5 h-5 text-black" />;
    }
  };

  const markAsRead = (id) => {
    console.log(`Marked notification ${id} as read`);
  };

  const markAllAsRead = () => {
    console.log('Marked all as read');
  };

  return (
    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-black">Notifications</h3>
          <button
            onClick={markAllAsRead}
            className="text-sm text-gray-600 hover:text-black transition"
          >
            Mark all as read
          </button>
        </div>
      </div>

      {/* Notifications */}
      <div className="max-h-80 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No notifications yet</p>
          </div>
        ) : (
          <div className="py-2">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`flex p-3 items-start space-x-3 cursor-pointer border-l-4 ${
                  notification.unread ? 'border-black bg-gray-50' : 'border-transparent'
                } hover:bg-gray-100 transition`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex-shrink-0 mt-1">{getNotificationIcon(notification.type)}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-black">
                    {notification.title}
                  </p>
                  <p className="text-sm text-gray-700 mt-1">{notification.message}</p>
                  <div className="flex items-center mt-2">
                    <Clock className="w-3 h-3 text-gray-500 mr-1" />
                    <span className="text-xs text-gray-500">{notification.time}</span>
                    {notification.unread && (
                      <span className="ml-2 w-2 h-2 bg-black rounded-full"></span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-100">
        <button
          onClick={onClose}
          className="w-full text-sm text-gray-700 hover:text-black transition text-center font-medium"
        >
          View all notifications
        </button>
      </div>
    </div>
  );
};

export default NotificationDropdown;
