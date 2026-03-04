import {
  Award,
  BadgeAlert,
  BarChart3,
  Bell,
  DollarSign,
  Home,
  ListCheck,
  Package,
  Route,
  Settings,
  Truck,
  UserCheck,
  Users,
} from "lucide-react";
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

// Custom Accent Green
const ACCENT_COLOR = "#104137";

// For your project logo, adjust the src path to match your assets location.
// Example: "/assets/logo.png"
const LOGO_SRC = "/assets/logo2.png";

const sidebarLinks = {
  supplier: [
    { name: "Dashboard", path: "/supplier/dashboard", icon: Home },
    { name: "Tea Production", path: "/supplier/production", icon: Package },
    { name: "Tea Quality", path: "/supplier/tea-quality", icon: Package },
    { name: "Inventory", path: "/supplier/inventory", icon: Package },
    { name: "Processing", path: "/supplier/processing", icon: Settings },
  ],
  driver: [
    { name: "Dashboard", path: "/driver/dashboard", icon: Home },
    { name: "Trips", path: "/driver/trips", icon: Truck },
    { name: "Emergency", path: "/driver/emergency", icon: Award },
  ],
  transport_manager: [
    { name: "Dashboard", path: "/transportManager/dashboard", icon: Home },
    { name: "Drivers", path: "/transportManager/drivers", icon: Users },
    { name: "Vehicle", path: "/transportManager/vehicle", icon: Truck },
    { name: "Route", path: "/transportManager/routeList", icon: Route },
    {
      name: "Announcements",
      path: "/transportManager/announcements",
      icon: Bell,
    },
    {
      name: "Route Planner",
      path: "/transportManager/routePlan",
      icon: ListCheck,
    },
    {
      name: "Emergency",
      path: "/transportManager/emergency",
      icon: BadgeAlert,
    },
  ],
  inventory_manager: [
    { name: "Dashboard", path: "/inventoryManager/Dashboard", icon: Home },
    { name: "Leaf Weight", path: "/inventoryManager/leaf_weight", icon: Truck },
    {
      name: "Bag Weight",
      path: "/inventoryManager/empty_bags_weight",
      icon: Package,
    },
    {
      name: "Announcements",
      path: "/inventoryManager/announcements",
      icon: Bell,
    },
    { name: "History", path: "/inventoryManager/history", icon: Award },
  ],
  fertilizer_manager: [
    { name: "Dashboard", path: "/fertilizerManager/Dashboard", icon: Home },
    { name: "Stock", path: "/fertilizerManager/stocks", icon: Truck },
    { name: "Request", path: "/fertilizerManager/request", icon: Package },
    {
      name: "Announcements",
      path: "/fertilizerManager/announcements",
      icon: Bell,
    },
    { name: "Report", path: "/fertilizerManager/report", icon: Users },
  ],
  factory_manager: [
    { name: "Dashboard", path: "/factoryManager/dashboard", icon: Home },
    { name: "Fertilizers", path: "/factoryManager/fertilizers", icon: Package },
    { name: "Suppliers", path: "/factoryManager/suppliers", icon: Users },
    { name: "Tea Quality", path: "/factoryManager/tea-quality", icon: Package },
    {
      name: "Announcements",
      path: "/factoryManager/announcements",
      icon: Bell,
    },
    // { name: "Routes", path: "/factoryManager/routes", icon: Route },
    { name: "Inventory", path: "/factoryManager/inventory", icon: Package },
    // { name: "Drivers", path: "/factoryManager/drivers", icon: Users },
    // { name: "Payments New", path: "/factoryManager/payment/main", icon: Users },
    {
      name: "Payments",
      icon: DollarSign,
      children: [
        // {
        //   name: "Payments Proceed",
        //   path: "/factoryManager/payment/proceed",
        //   icon: DollarSign,
        // },
        {
          name: "Payments",
          path: "/factoryManager/payment/payments",
          icon: DollarSign,
        },
        {
          name: "Tea Rate",
          path: "/factoryManager/payment/teaRate",
          icon: Package,
        },
        {
          name: "Advance",
          path: "/factoryManager/payment/advance",
          icon: DollarSign,
        },
        {
          name: "Loans",
          path: "/factoryManager/payment/loans",
          icon: BarChart3,
        },
      ],
    },
  ],
  owner: [
    { name: "Dashboard", path: "/owner/Dashboard", icon: Home },
    { name: "Annoucement", path: "/owner/annoucement", icon: Bell },
    { name: "Tea Disease Detection", path: "/owner/tea-disease", icon: BadgeAlert },
    { name: "Tea Quality", path: "/owner/tea-quality", icon: Package },
    { name: "Drivers", path: "/owner/drivers", icon: Truck },
    { name: "Payments", path: "/owner/payments", icon: DollarSign },
    { name: "Manager Works", path: "/owner/managers", icon: UserCheck },
    { name: "Employer Management", path: "/owner/employers", icon: Users },
    {
      name: "Fertilizer Company",
      path: "/owner/fertilizer-company",
      icon: Package,
    },
    { name: "Reports", path: "/owner/reports", icon: BarChart3 },
  ],
};

export default function Sidebar() {
  const { user } = useAuth();
  const location = useLocation();
  const role = user?.role;
  const [paymentsOpen, setPaymentsOpen] = React.useState(false);

  // Use sidebarLinks[role] directly; Payments handled in rendering below
  let linksToShow = sidebarLinks[role];

  return (
    <div
      className="w-62 h-screen text-white flex flex-col"
      style={{ backgroundColor: ACCENT_COLOR }}
    >
      {/* Header */}
      <div className="p-6 border-b" style={{ borderColor: "#104137" }}>
        <div className="flex items-center space-x-3">
          <div className="bg-white rounded-lg flex items-center justify-center w-12 h-12">
            <img
              src={LOGO_SRC}
              alt="GreenLeaf Logo"
              className="w-9 h-9 object-contain"
            />
          </div>
          <div>
            <h3 className="text-xl font-bold">GreenLeaf</h3>
            <p className="text-sm" style={{ color: "#cde7de" }}>
              Tea Factory System
            </p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 mt-6 px-4">
        {linksToShow?.map((link) => {
          // For Factory Manager, render Payments as collapsible
          if (role === "factory_manager" && link.name === "Payments") {
            return (
              <div key={link.name}>
                <button
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg mb-2 font-medium transition-all duration-200 ${
                    paymentsOpen
                      ? "shadow-lg text-white bg-[#104137]"
                      : "text-white/70 hover:bg-[#104137] hover:text-white"
                  }`}
                  onClick={() => setPaymentsOpen((open) => !open)}
                  style={{
                    backgroundColor: paymentsOpen ? "#104137" : "transparent",
                    // additional style if needed
                  }}
                >
                  <link.icon className="w-5 h-5" />
                  <span>{link.name}</span>
                  <span className="ml-auto">{paymentsOpen ? "▲" : "▼"}</span>
                </button>

                {paymentsOpen && (
                  <div className="ml-6">
                    {link.children.map((child) => {
                      const ChildIcon = child.icon;
                      const isActive = location.pathname === child.path;
                      return (
                        <Link
                          key={child.name}
                          to={child.path}
                          className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg mb-1 font-medium transition-all duration-200 ${
                            isActive
                              ? "shadow-lg text-white bg-[#104137]"
                              : "text-white/70 hover:bg-[#104137] hover:text-white"
                          }`}
                          style={{
                            backgroundColor: isActive
                              ? "#104137"
                              : "transparent",
                          }}
                        >
                          <ChildIcon className="w-4 h-4" />
                          <span>{child.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }
          // Render other links as usual
          const Icon = link.icon;
          // Highlight parent if inside nested route
          const isActive = location.pathname.startsWith(link.path);
          return (
            <Link
              key={link.name}
              to={link.path}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg mb-2 font-medium transition-all duration-200 ${
                isActive
                  ? "shadow-lg text-white"
                  : "text-white/70 hover:bg-[#124c46] hover:text-white"
              }`}
              style={{
                backgroundColor: isActive ? "#124c46" : "transparent",
              }}
            >
              <Icon className="w-5 h-5" />
              <span>{link.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
