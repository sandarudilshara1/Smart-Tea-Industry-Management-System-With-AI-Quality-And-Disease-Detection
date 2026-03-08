import { Route } from "react-router-dom";
import Layout from "../layouts/Layout";

// Factory Manager Components
import AnnouncementComponent from "../components/Announcement/Announcement";
import DriverManagement from "../pages/TransportManager/Drivers/DriverManagement";
import FactoryManagerDashboard from "../pages/FactoryManager/dashboard";
import SupplierRegister from "../pages/FactoryManager/Suppliers/SupplierRegister";
import FertilizersPage from "../pages/FactoryManager/Fertilizers/FertilizersPage";
import SupplierDetailsPage from "../pages/FactoryManager/Suppliers/SupplierDetailsPage";
import RouteManagement from "../pages/FactoryManager/Routes/RouteManagement";
import InventoryRoutesPage from "../pages/FactoryManager/Inventory/InventoryRoutesPage";
import InventorySupplierDetailPage from "../pages/FactoryManager/Inventory/InventorySupplierDetailPage";
import InventorySuppliersPage from "../pages/FactoryManager/Inventory/InventorySuppliersPage";
// Payment Manager Components
import AdvanceDetails from "../pages/PaymentManager/Advance/AdvanceDetails";
import AdvanceManagement from "../pages/PaymentManager/Advance/AdvanceManagement";
import PaymentManagerDashboard from "../pages/PaymentManager/dashboard";
import LoanManagement from "../pages/PaymentManager/Loans/LoanManagement";
import PaymentManagement from "../pages/PaymentManager/Payments/PaymentManagement";
import ProceedPayment from "../pages/PaymentManager/ProceedPayment/ProceedPayment";
import PaymentProcessingDashboard from "../pages/PaymentManager/PaymentProceed";
import MonthlyPaymentProcessing from "../pages/PaymentManager/PaymentProceed/MonthlyPaymentProcessing";
import PaymentDisbursement from "../pages/PaymentManager/PaymentProceed/PaymentDisbursement";
import AdhocPaymentProcessing from "../pages/PaymentManager/PaymentProceed/AdhocPaymentProcessing";
import CashDisbursementTerminal from "../pages/PaymentManager/PaymentProceed/CashDisbursementTerminal";
import PaymentMain from "../pages/PaymentManager/Payments/PaymentMain";
import TeaRateAdjustment from "../pages/PaymentManager/TeaRate/TeaRateAdjustment";

const FactoryManagerRoutes = (
  <>
    <Route
      path="/factoryManager/dashboard"
      element={
        <Layout>
          <FactoryManagerDashboard />
        </Layout>
      }
    />
    {/* Payment Manager routes under Factory Manager */}
    <Route
      path="/factoryManager/payment/dashboard"
      element={
        <Layout>
          <PaymentManagerDashboard />
        </Layout>
      }
    />
    <Route
      path="/factoryManager/payment/advance"
      element={
        <Layout>
          <AdvanceManagement />
        </Layout>
      }
    />
    <Route
      path="/factoryManager/payment/advance/:advanceId"
      element={
        <Layout>
          <AdvanceDetails />
        </Layout>
      }
    />
    <Route
      path="/factoryManager/payment/loans"
      element={
        <Layout>
          <LoanManagement />
        </Layout>
      }
    />
    <Route
      path="/factoryManager/payment/payments"
      element={
        <Layout>
          {/* <PaymentMain /> */}
          <PaymentManagement />
        </Layout>
      }
    />
    <Route
      path="/factoryManager/payment/proceed"
      element={
        <Layout>
          <PaymentProcessingDashboard />
        </Layout>
      }
    />
    <Route
      path="/factoryManager/payment/proceed/monthly"
      element={
        <Layout>
          <MonthlyPaymentProcessing />
        </Layout>
      }
    />
    <Route
      path="/factoryManager/payment/proceed/disbursement"
      element={
        <Layout>
          <PaymentDisbursement />
        </Layout>
      }
    />
    <Route
      path="/factoryManager/payment/proceed/adhoc"
      element={
        <Layout>
          <AdhocPaymentProcessing />
        </Layout>
      }
    />
    <Route
      path="/factoryManager/payment/proceed/cash-terminal"
      element={
        <Layout>
          <CashDisbursementTerminal />
        </Layout>
      }
    />
    <Route
      path="/factoryManager/payment/proceed/cash-terminal/:routeId"
      element={
        <Layout>
          <CashDisbursementTerminal />
        </Layout>
      }
    />
    <Route
      path="/factoryManager/payment/teaRate"
      element={
        <Layout>
          <TeaRateAdjustment />
        </Layout>
      }
    />
    <Route
      path="/factoryManager/payment/main"
      element={
        <Layout>
          <PaymentMain />
        </Layout>
      }
    />
    <Route
      path="/factoryManager/suppliers"
      element={
        <Layout>
          <SupplierRegister />
        </Layout>
      }
    />
    <Route
      path="/factoryManager/fertilizers"
      element={
        <Layout>
          <FertilizersPage />
        </Layout>
      }
    />
    <Route
      path="/factoryManager/suppliers/:id"
      element={
        <Layout>
          <SupplierDetailsPage />
        </Layout>
      }
    />
    <Route
      path="/factoryManager/suppliers/pending"
      element={
        <Layout>
          <SupplierRegister />
        </Layout>
      }
    />
    <Route
      path="/factoryManager/suppliers/rejected"
      element={
        <Layout>
          <SupplierRegister />
        </Layout>
      }
    />
    <Route
      path="/factoryManager/drivers"
      element={
        <Layout>
          <DriverManagement />
        </Layout>
      }
    />
    <Route
      path="/factoryManager/inventory"
      element={
        <Layout>
          <InventoryRoutesPage />
        </Layout>
      }
    />
    <Route
      path="/factoryManager/inventory/routes/:routeId"
      element={
        <Layout>
          <InventorySuppliersPage />
        </Layout>
      }
    />
    <Route
      path="/factoryManager/inventory/routes/:routeId/:supplierId"
      element={
        <Layout>
          <InventorySupplierDetailPage />
        </Layout>
      }
    />
    <Route
      path="/factoryManager/routes"
      element={
        <Layout>
          <RouteManagement />
        </Layout>
      }
    />
    <Route
      path="/factoryManager/announcements"
      element={
        <Layout>
          <AnnouncementComponent />
        </Layout>
      }
    />
  </>
);

export default FactoryManagerRoutes;
