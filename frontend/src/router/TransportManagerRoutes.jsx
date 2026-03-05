import { Route } from "react-router-dom";
import AnnouncementComponent from "../components/Announcement/Announcement";
import Layout from "../layouts/Layout";
import TransportManagerDashboard from "../pages/TransportManager/dashboard";
import AddDriver from "../pages/TransportManager/Drivers/AddDriver";
import Drivers from "../pages/TransportManager/Drivers/DriverList";
import Emergency from "../pages/TransportManager/Emergency/EmergencyList";
import CreateRoute from "../pages/TransportManager/Route/CreateRoute";
import TrackRoutes from "../pages/TransportManager/Route/RouteList";
import RoutePlan from "../pages/TransportManager/RoutePlanner/RoutePlan";
import AddVehicle from "../pages/TransportManager/Vehicle/AddVehicle";
import EditVehicle from "../pages/TransportManager/Vehicle/EditVehicle";
import Vehicle from "../pages/TransportManager/Vehicle/VehicleList";
import ViewVehicle from "../pages/TransportManager/Vehicle/ViewVehicle";

const transportManagerRoutes = [
  <Route
    key="dashboard"
    path="/transportManager/dashboard"
    element={
      <Layout>
        <TransportManagerDashboard />
      </Layout>
    }
  />,
  <Route
    key="driver"
    path="/transportManager/drivers"
    element={
      <Layout>
        <Drivers />
      </Layout>
    }
  />,
  <Route
    key="add_driver"
    path="/transportManager/drivers/add"
    element={
      <Layout>
        <AddDriver />
      </Layout>
    }
  />,
  <Route
    key="vehicle"
    path="/transportManager/vehicle"
    element={
      <Layout>
        <Vehicle />
      </Layout>
    }
  />,
  <Route
    key="add_vehicle"
    path="/transportManager/vehicle/add"
    element={
      <Layout>
        <AddVehicle />
      </Layout>
    }
  />,
  <Route
    key="edit_vehicle"
    path="/transportManager/vehicle/edit/:id"
    element={
      <Layout>
        <EditVehicle />
      </Layout>
    }
  />,
  <Route
    key="view_vehicle"
    path="/transportManager/vehicle/view/:id"
    element={
      <Layout>
        <ViewVehicle />
      </Layout>
    }
  />,
  <Route
    key="track_routes"
    path="/transportManager/routeList"
    element={
      <Layout>
        <TrackRoutes />
      </Layout>
    }
  />,
  <Route
    key="create_route"
    path="/transportManager/route/add"
    element={
      <Layout>
        <CreateRoute />
      </Layout>
    }
  />,
  <Route
    key="emergency"
    path="/transportManager/emergency"
    element={
      <Layout>
        <Emergency />
      </Layout>
    }
  />,
  <Route
    key="route_plan"
    path="/transportManager/routePlan"
    element={
      <Layout>
        <RoutePlan />
      </Layout>
    }
  />,
  <Route
    key="announcements"
    path="/transportManager/announcements"
    element={
      <Layout>
        <AnnouncementComponent />
      </Layout>
    }
  />,
];

export default transportManagerRoutes;
