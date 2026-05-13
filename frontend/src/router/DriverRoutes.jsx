import { Route } from "react-router-dom";
import Layout from "../layouts/Layout";
import DriverDashboard from "../pages/driver/Dashboard";
import DriverRoutesPage from "../pages/driver/DriverRoutes";
import DriverVehicle from "../pages/driver/DriverVehicle";
import DriverProfile from "../pages/driver/DriverProfile";

export default [
  <Route
    key="driver-dashboard"
    path="/driver/dashboard"
    element={
      <Layout>
        <DriverDashboard />
      </Layout>
    }
  />,
  <Route
    key="driver-routes"
    path="/driver/routes"
    element={
      <Layout>
        <DriverRoutesPage />
      </Layout>
    }
  />,
  <Route
    key="driver-vehicle"
    path="/driver/vehicle"
    element={
      <Layout>
        <DriverVehicle />
      </Layout>
    }
  />,
  <Route
    key="driver-profile"
    path="/driver/profile"
    element={
      <Layout>
        <DriverProfile />
      </Layout>
    }
  />
];
