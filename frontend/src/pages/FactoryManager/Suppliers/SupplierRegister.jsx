import { useState, useEffect, useCallback, useRef } from "react";
import {
  getSupplierCounts,
  approveSupplierRequest,
  rejectSupplierRequest,
  getApprovedSuppliers,
  getSupplierRequestsByStatus,
  getRoutesDetails,
} from "../../../api/supplier";
import SupplierHeader from "./SupplierHeader.jsx";
import SupplierSummaryCards from "./SupplierSummaryCards.jsx";
import SupplierFilters from "./SupplierFilters.jsx";
import SupplierTable from "./SupplierTable.jsx";
import { useAuth } from "../../../contexts/AuthContext.jsx";

const ACCENT_COLOR = "#165E52";

export default function SupplierRegister() {
  const { user } = useAuth();
  const factoryId = user?.factoryId;

  // State
  const [suppliers, setSuppliers] = useState([]);
  const [metrics, setMetrics] = useState({
    approved: 0,
    pending: 0,
    rejected: 0,
  });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    route: "",
  });
  const [routes, setRoutes] = useState([]);
  // Fetch routes for the factory
  useEffect(() => {
    if (!factoryId) return;
    const fetchRoutes = async () => {
      try {
        const data = await getRoutesDetails(factoryId);
        setRoutes(Array.isArray(data) ? data : []);
      } catch (err) {
        setRoutes([]);
        console.error("Error fetching routes:", err);
      }
    };
    fetchRoutes();
  }, [factoryId]);
  const [showFilters, setShowFilters] = useState(false);
  const [currentView, setCurrentView] = useState("approved");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [isFirstPage, setIsFirstPage] = useState(false);
  const [isLastPage, setIsLastPage] = useState(false);

  // Debounce ref
  const debounceRef = useRef();

  // Fetch supplier counts
  const fetchCounts = useCallback(async () => {
    if (!factoryId) return;
    try {
      const data = await getSupplierCounts(factoryId);
      if (data.status === 404 && data.message) {
        setMetrics({ approved: 0, pending: 0, rejected: 0 });
        console.error(data.message);
      } else {
        setMetrics({
          approved: data.activeSupplierCount,
          pending: data.pendingRequestCount,
          rejected: data.rejectedRequestCount,
        });
      }
    } catch (error) {
      setMetrics({ approved: 0, pending: 0, rejected: 0 });
      console.error(
        error.response?.data?.message || "Error fetching supplier counts:",
        error
      );
    }
  }, [factoryId]);

  useEffect(() => {
    fetchCounts();
  }, [fetchCounts]);

  // Approve handler
  const handleApproveSupplierRequest = async (id, routeId, bagLimit) => {
    try {
      await approveSupplierRequest(id, routeId, Number(bagLimit));
      await fetchCounts();
      // No need to call fetchTableData directly; effect will run due to dependency change
    } catch (error) {
      console.error("Error approving supplier request:", error);
    }
  };

  // Reject handler
  const handleRejectSupplierRequest = async (id, reason) => {
    try {
      await rejectSupplierRequest(id, reason);
      await fetchCounts();
      // No need to call fetchTableData directly; effect will run due to dependency change
    } catch (error) {
      console.error("Error rejecting supplier request:", error);
    }
  };

  // Fetch table data (unmount-safe)
  const fetchTableData = useCallback(
    async (view, currentPage = 0, customFilters) => {
      if (!factoryId) return;
      let isMounted = true;
      setLoading(true);
      setSuppliers([]);

      try {
        let data;
        const activeFilters = customFilters || filters;
        const params = { page: currentPage, search: activeFilters.search };
        if (activeFilters.route) {
          params.routeId = activeFilters.route;
        }

        if (view === "approved") {
          data = await getApprovedSuppliers(factoryId, {
            ...params,
            sort: "approvedDate,desc",
          });
        } else if (view === "pending" || view === "rejected") {
          data = await getSupplierRequestsByStatus(factoryId, view, {
            ...params,
            sort: "requestedDate,desc",
          });
        }

        if (!isMounted) return;

        setTotalElements(data.totalElements || 0);
        setPageSize(data.size || data.pageable?.pageSize || 10);
        setIsFirstPage(data.first ?? false);
        setIsLastPage(data.last ?? false);

        const items = Array.isArray(data.content) ? data.content : [];
        const mapped =
          view === "approved"
            ? items.map((item) => ({
                id: item.supplierId || null,
                name: item.supplierName || null,
                routeName: item.routeName || null,
                approvedDate: item.approvedDate || null,
              }))
            : items.map((item) => ({
                id: item.supplierRequestId || null,
                name: item.name || "N/A",
                monthlySupply: item.monthlySupply || null,
                supplierCreatedDate: item.requestDate || null,
                rejectedDate: item.rejectedDate || null,
                status: view,
              }));

        setSuppliers(mapped);
      } catch (error) {
        setSuppliers([]);
        console.error(
          error.response?.data?.message ||
            "Error fetching supplier table data:",
          error
        );
      } finally {
        if (isMounted) setLoading(false);
      }

      return () => {
        isMounted = false;
      };
    },
    [factoryId, filters]
  );

  // Handle view change
  const handleViewChange = (view) => {
    setCurrentView(view);
    setPage(0);
    setFilters({ search: "", status: "all", route: "" });
  };

  // Clear filters on mount (refresh)
  useEffect(() => {
    setFilters({ search: "", status: "all", route: "" });
    setPage(0);
  }, []);

  // Debounced fetch on filter/search/view/page change
  useEffect(() => {
    if (!factoryId) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setLoading(true);
    debounceRef.current = setTimeout(() => {
      fetchTableData(currentView, page);
    }, 500); // 500ms debounce
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [filters.route, filters.search, currentView, page, factoryId, fetchTableData]);

  // Filters
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === "route") setPage(0);
      return updated;
    });
    if (name !== "route") setPage(0); // Reset page on any filter change
  };

  const clearFilters = () =>
    setFilters({ search: "", status: "all", route: "" });

  return (
    <div className="min-h-screen bg-gray-50">
      <SupplierHeader />

      <div className="max-w-7xl mx-auto px-6 py-6">
        <SupplierSummaryCards
          metrics={metrics}
          currentView={currentView}
          setCurrentView={handleViewChange}
        />

        <SupplierFilters
          filters={filters}
          handleFilterChange={handleFilterChange}
          clearFilters={clearFilters}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          routes={routes}
          showRouteFilter={currentView === "approved"}
          currentView={currentView}
        />

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-[#165E52] border-solid"></div>
            <span className="ml-4 text-[#165E52] font-semibold">
              Loading suppliers...
            </span>
          </div>
        ) : (
          <SupplierTable
            filteredSuppliers={suppliers}
            currentView={currentView}
            page={page}
            size={pageSize}
            totalElements={totalElements}
            first={isFirstPage}
            last={isLastPage}
            onPageChange={setPage}
            onApproveSupplierRequest={handleApproveSupplierRequest}
            onRejectSupplierRequest={handleRejectSupplierRequest}
          />
        )}
      </div>
    </div>
  );
}
