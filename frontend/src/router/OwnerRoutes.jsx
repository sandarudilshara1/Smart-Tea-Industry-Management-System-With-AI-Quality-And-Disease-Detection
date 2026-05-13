import { Route } from "react-router-dom";
import Layout from "../layouts/Layout";

import AddAnnouncement from "../pages/Owner/Annoucement/addAnnouncement";
import UpdateAnnouncement from "../pages/Owner/Annoucement/updateAnnouncement";
import OwnerAnnoucement from "../pages/Owner/Annoucement/viewAnnoucement";
import OwnerAnnouncementManage from "../pages/Owner/Announcement/Announcement";
import OwnerDashboard from "../pages/Owner/dashboard";
import AddEmployee from "../pages/Owner/Employers/AddEmployee";
import EmployerManagement from "../pages/Owner/Employers/EmployerManagement";
import LoanRates from "../pages/Owner/Rates/Rates";
import AddManagers from "../pages/Owner/ManagerView/addManagers";
import GiveAccess from "../pages/Owner/ManagerView/giveaccess";
import OwnerManagers from "../pages/Owner/ManagerView/viewManagers";
import OwnerPaymnets from "../pages/Owner/Payments/payment";
import ViewAdvanceFactoryWise from "../pages/Owner/Payments/viewAdvanceFactoryWise";
import ViewLoanFactoryWise from "../pages/Owner/Payments/viewLoanFactoryWise";
import ViewPaymentFactoryWise from "../pages/Owner/Payments/viewPaymentFactoryWise";
import OwnerReports from "../pages/Owner/Reports/reports";
import OwnerTeaRate from "../pages/Owner/TeaRate/teaRate";
import OwnerSuppliers from "../pages/Owner/Suppliers/Suppliers";
import FertilizerCompany from "../pages/Owner/FertilizerCompany/FertilizerCompany";

export default [
  <>
    <Route
      path="/owner/dashboard"
      element={
        <Layout>
          {" "}
          <OwnerDashboard />{" "}
        </Layout>
      }
    />
    <Route
      path="/owner/suppliers"
      element={
        <Layout>
          <OwnerSuppliers />
        </Layout>
      }
    />
    <Route
      path="/owner/fertilizer-companies"
      element={
        <Layout>
          <FertilizerCompany />
        </Layout>
      }
    />
    <Route
      path="/owner/teaRate"
      element={
        <Layout>
          {" "}
          <OwnerTeaRate />{" "}
        </Layout>
      }
    />
    <Route
      path="/owner/managers"
      element={
        <Layout>
          {" "}
          <OwnerManagers />{" "}
        </Layout>
      }
    />
    <Route
      path="/owner/announcement"
      element={
        <Layout>
          {" "}
          <OwnerAnnoucement />{" "}
        </Layout>
      }
    />
    <Route
      path="/owner/annoucement"
      element={
        <Layout>
          {" "}
          <OwnerAnnoucement />{" "}
        </Layout>
      }
    />
    <Route
      path="/owner/announcement/manage"
      element={
        <Layout>
          {" "}
          <OwnerAnnouncementManage />{" "}
        </Layout>
      }
    />
    <Route
      path="/owner/annoucement/manage"
      element={
        <Layout>
          {" "}
          <OwnerAnnouncementManage />{" "}
        </Layout>
      }
    />
    <Route
      path="/owner/reports"
      element={
        <Layout>
          {" "}
          <OwnerReports />{" "}
        </Layout>
      }
    />
    <Route
      path="/owner/managerview/addmanagers"
      element={
        <Layout>
          {" "}
          <AddManagers />
          {"  "}
        </Layout>
      }
    />
    <Route
      path="/Owner/ManagerView/addManagers"
      element={
        <Layout>
          {" "}
          <AddManagers />
          {"  "}
        </Layout>
      }
    />
    <Route
      path="/owner/managerview/giveaccess"
      element={
        <Layout>
          {" "}
          <GiveAccess />{" "}
        </Layout>
      }
    />
    <Route
      path="/Owner/ManagerView/giveaccess"
      element={
        <Layout>
          {" "}
          <GiveAccess />{" "}
        </Layout>
      }
    />
    <Route
      path="/owner/announcement/add"
      element={
        <Layout>
          {" "}
          <AddAnnouncement />{" "}
        </Layout>
      }
    />
    <Route
      path="/owner/annoucement/add"
      element={
        <Layout>
          {" "}
          <AddAnnouncement />{" "}
        </Layout>
      }
    />
    <Route
      path="/owner/announcement/update"
      element={
        <Layout>
          {" "}
          <UpdateAnnouncement />{" "}
        </Layout>
      }
    />
    <Route
      path="/owner/annoucement/update"
      element={
        <Layout>
          {" "}
          <UpdateAnnouncement />{" "}
        </Layout>
      }
    />
    <Route
      path="/owner/loan-rates"
      element={
        <Layout>
          {" "}
          <LoanRates />{" "}
        </Layout>
      }
    />
    <Route
      path="/owner/employers"
      element={
        <Layout>
          {" "}
          <EmployerManagement />{" "}
        </Layout>
      }
    />
    <Route
      path="/owner/employers/add"
      element={
        <Layout>
          {" "}
          <AddEmployee />{" "}
        </Layout>
      }
    />
    <Route
      path="/owner/employers/edit"
      element={
        <Layout>
          {" "}
          <AddEmployee />{" "}
        </Layout>
      }
    />
  </>,
];
