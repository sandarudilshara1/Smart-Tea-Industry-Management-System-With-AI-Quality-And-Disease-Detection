import { Route } from "react-router-dom";
import Layout from "../layouts/Layout";
import Dashboard from "../pages/FertilizerManager/dashboard";
import ReportPage from "../pages/FertilizerManager/Report/report";
import Request from "../pages/FertilizerManager/Request/supplierRequest";
import StockRequest from "../pages/FertilizerManager/Stock/stockRequest";
import StocksComponent from "../pages/FertilizerManager/Stock/stocks";
import ViewStock from "../pages/FertilizerManager/Stock/ViewStock";
// import History from "../pages/FertilizerManager/History/history";
import AnnouncementComponent from "../components/Announcement/Announcement";

export default [
  <Route
    path="/fertilizerManager/dashboard"
    element={
      <Layout>
        <Dashboard />
      </Layout>
    }
  />,
  <Route
    path="/fertilizerManager/stocks"
    element={
      <Layout>
        <StocksComponent />
      </Layout>
    }
  />,
  <Route
    key="view_stock"
    path="/fertilizerManager/stocks/view/:id"
    element={
      <Layout>
        <ViewStock />
      </Layout>
    }
  />,
  <Route
    key="stock_request"
    path="/fertilizerManager/stocks/request"
    element={
      <Layout>
        <StockRequest />
      </Layout>
    }
  />,
  <Route
    key="request"
    path="/fertilizerManager/request"
    element={
      <Layout>
        <Request />
      </Layout>
    }
  />,
  <Route
    key="report"
    path="/fertilizerManager/report"
    element={
      <Layout>
        <ReportPage />
      </Layout>
    }
  />,
  <Route
    key="announcements"
    path="/fertilizerManager/announcements"
    element={
      <Layout>
        <AnnouncementComponent />
      </Layout>
    }
  />,
  // <Route
  //   key="history"
  //   path="/fertilizerManager/history"
  //   element={
  //     <Layout>
  //       <History />
  //     </Layout>
  //   }
  // />,
];
