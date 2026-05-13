import { Route } from "react-router-dom";
import Layout from "../layouts/Layout";
import Dashboard from "../pages/supplier/Dashboard";
import TeaProduction from "../pages/supplier/TeaProduction";
import SupplierInventory from "../pages/supplier/SupplierInventory";
import SupplierProcessing from "../pages/supplier/SupplierProcessing";
import SupplierLeafSupplyRequests from "../pages/supplier/LeafSupplyRequests";

const supplierRoutes = [
  <Route
    key="supplier-dashboard"
    path="/supplier/dashboard"
    element={
      <Layout>
        <Dashboard />
      </Layout>
    }
  />,
  <Route
    key="supplier-production"
    path="/supplier/production"
    element={
      <Layout>
        <TeaProduction />
      </Layout>
    }
  />,
  <Route
    key="supplier-inventory"
    path="/supplier/inventory"
    element={
      <Layout>
        <SupplierInventory />
      </Layout>
    }
  />,
  <Route
    key="supplier-processing"
    path="/supplier/processing"
    element={
      <Layout>
        <SupplierProcessing />
      </Layout>
    }
  />,
  <Route
    key="supplier-leaf-supply-requests"
    path="/supplier/leaf-supply-requests"
    element={
      <Layout>
        <SupplierLeafSupplyRequests />
      </Layout>
    }
  />
];

export default supplierRoutes;
