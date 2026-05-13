import { Route } from "react-router-dom";
import Layout from "../layouts/Layout";
import InventoryManagerDashboard from "../pages/InventoryManager/dashboard";
import History from "../pages/InventoryManager/History/history";
import AnnouncementComponent from "../components/Announcement/Announcement";
import EmptySupplierBagAll from "../pages/InventoryManager/BagWeight/empty_bag_supplier_all";
import FertilizerInventory from "../pages/InventoryManager/FertilizerInventory/FertilizerInventory";
import FertilizerCompany from "../pages/InventoryManager/FertilizerCompany/FertilizerCompany";
import AddFertilizerCompany from "../pages/InventoryManager/FertilizerCompany/AddFertilizerCompany";
import LeafInventory from "../pages/InventoryManager/LeafInventory/LeafInventory";


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
  <Route
    key="fertilizer_inventory"
    path="/inventoryManager/fertilizer-inventory"
    element={
      <Layout>
        <FertilizerInventory />
      </Layout>
    }
  />,
  <Route
    key="fertilizer_companies"
    path="/inventoryManager/fertilizer-companies"
    element={
      <Layout>
        <FertilizerCompany />
      </Layout>
    }
  />,
  <Route
    key="fertilizer_companies_add"
    path="/inventoryManager/fertilizer-companies/add"
    element={
      <Layout>
        <AddFertilizerCompany />
      </Layout>
    }
  />,
  <Route
    key="fertilizer_companies_edit"
    path="/inventoryManager/fertilizer-companies/edit"
    element={
      <Layout>
        <AddFertilizerCompany />
      </Layout>
    }
  />,
  <Route
    key="leaf_supply_requests"
    path="/inventoryManager/leaf-inventory"
    element={
      <Layout>
        <LeafInventory />
      </Layout>
    }
  />,
];
