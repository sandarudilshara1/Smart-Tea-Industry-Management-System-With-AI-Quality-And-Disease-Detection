import { Route } from "react-router-dom";
import Layout from "../layouts/Layout";

// Payment Manager Components
import PaymentManagerDashboard from "../pages/PaymentManager/dashboard";
import AdvanceManagement from "../pages/PaymentManager/Advance/AdvanceManagement";
import LoanManagement from "../pages/PaymentManager/Loans/LoanManagement";
import ActiveLoans from "../pages/PaymentManager/Loans/ActiveLoans";
import TeaRateAdjustment from "../pages/PaymentManager/TeaRate/TeaRateAdjustment";
import PaymentManagement from "../pages/PaymentManager/Payments/PaymentManagement";
import SimplePaymentSystem from "../pages/PaymentManager/SimplePaymentSystem";

export default [
  <Route
    key="payment-manager"
    path="/payment-manager"
    element={
      <Layout>
        <PaymentManagerDashboard />
      </Layout>
    }
  />,
  <Route
    key="payment-manager-dashboard"
    path="/payment-manager/dashboard"
    element={
      <Layout>
        <PaymentManagerDashboard />
      </Layout>
    }
  />,
  <Route
    key="payment-manager-simple"
    path="/payment-manager/simple"
    element={
      <Layout>
        <SimplePaymentSystem />
      </Layout>
    }
  />,
  <Route
    key="payment-manager-advances"
    path="/payment-manager/advances"
    element={
      <Layout>
        <AdvanceManagement />
      </Layout>
    }
  />,
  <Route
    key="payment-manager-loans"
    path="/payment-manager/loans"
    element={
      <Layout>
        <LoanManagement />
      </Layout>
    }
  />,
  <Route
    key="payment-manager-loans-active"
    path="/payment-manager/loans/active"
    element={
      <Layout>
        <ActiveLoans />
      </Layout>
    }
  />,
  <Route
    key="payment-manager-tea-rates"
    path="/payment-manager/tea-rates"
    element={
      <Layout>
        <TeaRateAdjustment />
      </Layout>
    }
  />,
  <Route
    key="payment-manager-payments"
    path="/payment-manager/payments"
    element={
      <Layout>
        <PaymentManagement />
      </Layout>
    }
  />,
];