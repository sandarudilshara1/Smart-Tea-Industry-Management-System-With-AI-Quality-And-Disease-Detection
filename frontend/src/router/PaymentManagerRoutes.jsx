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
import PaymentProcessingDashboard from "../pages/PaymentManager/PaymentProceed";
import MonthlyPaymentProcessing from "../pages/PaymentManager/PaymentProceed/MonthlyPaymentProcessing";
import PaymentDisbursement from "../pages/PaymentManager/PaymentProceed/PaymentDisbursement";
import AdhocPaymentProcessing from "../pages/PaymentManager/PaymentProceed/AdhocPaymentProcessing";
import CashDisbursementTerminal from "../pages/PaymentManager/PaymentProceed/CashDisbursementTerminal";

export default [
  <Route
    key="payment-manager"
    path="/payment-manager"
    element={
      <Layout>
        <PaymentManagement />
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
  <Route
    key="payment-manager-payment"
    path="/payment-manager/payment"
    element={
      <Layout>
        <PaymentManagement />
      </Layout>
    }
  />,
  <Route
    key="payment-manager-proceed"
    path="/payment-manager/proceed"
    element={
      <Layout>
        <PaymentProcessingDashboard />
      </Layout>
    }
  />,
  <Route
    key="payment-manager-proceed-monthly"
    path="/payment-manager/proceed/monthly"
    element={
      <Layout>
        <MonthlyPaymentProcessing />
      </Layout>
    }
  />,
  <Route
    key="payment-manager-proceed-disbursement"
    path="/payment-manager/proceed/disbursement"
    element={
      <Layout>
        <PaymentDisbursement />
      </Layout>
    }
  />,
  <Route
    key="payment-manager-proceed-adhoc"
    path="/payment-manager/proceed/adhoc"
    element={
      <Layout>
        <AdhocPaymentProcessing />
      </Layout>
    }
  />,
  <Route
    key="payment-manager-proceed-cash-terminal"
    path="/payment-manager/proceed/cash-terminal/:routeId"
    element={
      <Layout>
        <CashDisbursementTerminal />
      </Layout>
    }
  />,
];