import { User, Settings, LogOut, Shield } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const ProfileDropdown = ({ onClose }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      onClose();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const menuItems = [
    {
      icon: User,
      label: "Profile",
      action: () => {
        navigate("/profile");
        onClose();
      },
    },
  ];

  return (
    <div className="absolute right-0 mt-2 w-50 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
  
      {/* Menu Items */}
      <div className="py-2">
        {menuItems.map((item, index) => (
          <button
            key={index}
            onClick={item.action}
            className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
          >
            <item.icon className="w-4 h-4 text-gray-500" />
            <span className="text-gray-700">{item.label}</span>
          </button>
        ))}
      </div>

      {/* Logout */}
      <div className="border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-red-50 transition-colors text-red-600"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default ProfileDropdown;
