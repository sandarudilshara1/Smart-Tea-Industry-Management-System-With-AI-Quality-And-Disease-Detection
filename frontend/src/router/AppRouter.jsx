import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "../layouts/Layout";
import Profile from "../components/ui/Profile";

// import inventoryManagerRoutes from "./InventoryManagerRoutes";
import inventoryManagerRoutes from "./InventoryManagerRoutes";
import fertilizerManagerRoutes from "./FertilizerManagerRoutes";

import TransportManagerRoutes from "./TransportManagerRoutes";

import FactoryManagerRoutes from "./FactoryManagerRoutes";
import OwnerRoutes from "./OwnerRoutes";
import PaymentManagerRoutes from "./PaymentManagerRoutes";

//Factory Manager - Now handled by FactoryManagerRoutes.jsx

//Payment Manager
import PaymentManagerDashboard from "../pages/PaymentManager/dashboard";
import AdvanceManagement from "../pages/PaymentManager/Advance/AdvanceManagement";
import LoanManagement from "../pages/PaymentManager/Loans/LoanManagement";
import TeaRateAdjustment from "../pages/PaymentManager/TeaRate/TeaRateAdjustment";
import PaymentManagement from "../pages/PaymentManager/Payments/PaymentManagement";

//Transport Manager
import TransportManagerDashboard from "../pages/TransportManager/dashboard";
import Vehicle from "../pages/TransportManager/Vehicle/VehicleList";
import TrackRoutes from "../pages/TransportManager/Route/RouteList";
import Emergency from "../pages/TransportManager/Emergency/EmergencyList";
import Assignment from "../pages/TransportManager/RoutePlanner/RoutePlan";

import { useAuth } from "../contexts/AuthContext";
import Auth from "../components/Auth";
import DevLogin from "../pages/auth/login";
import Landing from "../components/landingNew";
import SignupForm from "../components/SignupForm";
import ForgotPassword from "../components/ui/ForgotPassword";
import TeaDiseaseDetection from "../pages/TeaDiseaseDetection";
import TeaQuality from "../pages/TeaQuality";
import DriverManagement from "../pages/FactoryManager/Drivers/DriverManagement";

export default function AppRouter() {
  const { user } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        {user?.role === "inventory_manager" && inventoryManagerRoutes}
        {user?.role === "fertilizer_manager" && fertilizerManagerRoutes}
        {/* Expose FertilizerManager routes for development/testing so pages are visible
          Remove or guard these in production if you want strict role-based access */}
        {fertilizerManagerRoutes}
        {user?.role === "owner" && OwnerRoutes}
        {user?.role === "factory_manager" && FactoryManagerRoutes}
        {user?.role === "transport_manager" && TransportManagerRoutes}
        {/* Payment Manager routes - Only accessible by Owner and Payment Manager */}
        {(user?.role === "payment_manager" || user?.role === "owner") && PaymentManagerRoutes}
        
        {/* Expose TransportManager routes for development/testing so pages are visible
          Remove or guard these in production if you want strict role-based access */}
        {TransportManagerRoutes}
        
        <Route path="/login" element={<Auth />} />
        {/* Development-only simple login (bypasses backend) */}
        <Route path="/dev-login" element={<DevLogin />} />
        <Route path="/signup" element={<SignupForm />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route
          path="/profile"
          element={
            <Layout>
              <Profile />
            </Layout>
          }
        />
        <Route
          path="/owner/tea-disease"
          element={
            <Layout>
              <TeaDiseaseDetection />
            </Layout>
          }
        />
        <Route
          path="/owner/drivers"
          element={
            <Layout>
              <DriverManagement />
            </Layout>
          }
        />
        <Route
          path="/owner/tea-quality"
          element={
            <Layout>
              <TeaQuality />
            </Layout>
          }
        />
        <Route
          path="/supplier/tea-quality"
          element={
            <Layout>
              <TeaQuality />
            </Layout>
          }
        />
        <Route
          path="/factoryManager/tea-quality"
          element={
            <Layout>
              <TeaQuality />
            </Layout>
          }
        />
        <Route path="/landing" element={<Landing />} />
        <Route path="" element={<Navigate to="/landing" />} />
        {/* <Route path="" element={<Navigate to="/login" />} /> */}
      </Routes>
    </BrowserRouter>
  );
}
