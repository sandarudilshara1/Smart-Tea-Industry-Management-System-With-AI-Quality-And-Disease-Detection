import { Route } from "react-router-dom";
import Layout from "../layouts/Layout";
import EmptyBagsWeight from "../pages/InventoryManager/BagWeight/bag_weight";
import InventoryManagerDashboard from "../pages/InventoryManager/dashboard";
import LeafBagsWeight from "../pages/InventoryManager/LeafWeight/leaf_bags_weight";
import LeafWeight from "../pages/InventoryManager/LeafWeight/leaf_weight";
import RouteLeaf from "../pages/InventoryManager/LeafWeight/route_leaf";
// import RouteBagsWeight from "../pages/InventoryManager/BagWeight/route_bags_weight";
// import SupplierBagsWeight from "../pages/InventoryManager/BagWeight/bag_weight_supplier";
// import WeightCondition from "../pages/InventoryManager/weight_condition";
import History from "../pages/InventoryManager/History/history";
// import SupplierAdd from "../pages/InventoryManager/Report/Addsupplier";
import AnnouncementComponent from "../components/Announcement/Announcement";
import EmptySupplierBag from "../pages/InventoryManager/BagWeight/empty_bag_supplier";
import EmptySupplierBagAll from "../pages/InventoryManager/BagWeight/empty_bag_supplier_all";

export default [
  <Route
    key="dashboard"
    path="/inventoryManager/dashboard"
    element={
      <Layout>
        <InventoryManagerDashboard />
      </Layout>
    }
  />,
  <Route
    key="leaf_weight"
    path="/inventoryManager/leaf_weight"
    element={
      <Layout>
        <LeafWeight />
      </Layout>
    }
  >
    <Route path="route/:tripId" element={<RouteLeaf />}>
      <Route path="supplier/:supplyRequestId" element={<LeafBagsWeight />} />
    </Route>
  </Route>,

  <Route
    key="empty_bags_weight"
    path="/inventoryManager/empty_bags_weight"
    element={
      <Layout>
        <EmptyBagsWeight />
      </Layout>
    }
  >
    <Route path="route/:tripId" element={<EmptySupplierBag />}>
      <Route path="supplier/:supplyRequestId" element={<EmptySupplierBagAll />} />
    </Route>
  </Route>,
  <Route
    key="history"
    path="/inventoryManager/history"
    element={
      <Layout>
        <History />
      </Layout>
    }
  />,
  <Route
    key="announcements"
    path="/inventoryManager/announcements"
    element={
      <Layout>
        <AnnouncementComponent />
      </Layout>
    }
  />, 
];
