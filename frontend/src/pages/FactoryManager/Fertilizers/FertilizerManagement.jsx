import { useState, useEffect, useCallback } from "react";
import { getAllFertilizerRequests, approveFertilizerRequest, rejectFertilizerRequest } from "../../../api/fertilizerManager";
import FertilizerHeader from "./FertilizerHeader";
import FertilizerSummaryCards from "./FertilizerSummaryCards";
import FertilizerFilters from "./FertilizerFilters";
import FertilizerTable from "./FertilizerTable";
import FertilizerRequestModal from "./FertilizerRequestModal";
import { useAuth } from "../../../contexts/AuthContext";
import { 
  getFertilizerSummary,
  filterFertilizerRequests,
} from "./fertilizerUtils";

// For development/testing
import { 
  fertilizerRequests as sampleRequests, 
  fertilizerCategories, 
  fertilizerCompanies 
} from "./fertilizerData";

const ACCENT_COLOR = "#165E52";

export default function FertilizerManagement() {
  const { user } = useAuth();
  const factoryId = user?.factoryId;

  // State
  const [allRequests, setAllRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [metrics, setMetrics] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState("pending");
  const [filters, setFilters] = useState({
    search: "",
    categoryId: "",
    companyId: "",
  });
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  // Pagination state
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [first, setFirst] = useState(true);
  const [last, setLast] = useState(false);

  // Fetch fertilizer requests based on current view
  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      let filteredByStatus;
      if (currentView === "all") {
        filteredByStatus = await getAllFertilizerRequests();
      } else {
        filteredByStatus = await getAllFertilizerRequests(currentView.toUpperCase());
      }
      setAllRequests(filteredByStatus);
      setTotalElements(filteredByStatus.length);
      // Calculate metrics from all requests
      const summary = getFertilizerSummary(filteredByStatus);
      setMetrics({
        total: summary.totalRequests,
        pending: summary.pendingRequests,
        approved: summary.approvedRequests,
        rejected: summary.rejectedRequests,
      });
    } catch (error) {
      console.error("Error fetching fertilizer requests:", error);
    } finally {
      setLoading(false);
    }
  }, [currentView]);

  // Initial data fetch
  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Apply filters
  useEffect(() => {
    const filtered = filterFertilizerRequests(allRequests, filters);
    
    // Apply pagination (simple client-side pagination for now)
    const start = page * size;
    const end = start + size;
    const paginatedData = filtered.slice(start, end);
    
    setFilteredRequests(paginatedData);
    setTotalElements(filtered.length);
    setFirst(page === 0);
    setLast(end >= filtered.length);
  }, [allRequests, filters, page, size]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
    // Reset to first page when filters change
    setPage(0);
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      categoryId: "",
      companyId: "",
    });
    // Reset to first page when filters are cleared
    setPage(0);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleViewRequest = (request) => {
    setSelectedRequest(request);
    setShowRequestModal(true);
  };

  const handleApprove = async (id) => {
    setActionLoading("approve");
    try {
      await approveFertilizerRequest(id);
      setShowRequestModal(false);
      setCurrentView("approved"); // Switch to approved card
      fetchRequests();
    } catch (error) {
      console.error("Error approving request:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id, rejectReason = "Request rejected by factory manager") => {
    setActionLoading("reject");
    try {
      await rejectFertilizerRequest(id, rejectReason);
      setShowRequestModal(false);
      fetchRequests();
    } catch (error) {
      console.error("Error rejecting request:", error);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <FertilizerHeader />
      
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Summary Cards */}
        <FertilizerSummaryCards
          metrics={metrics}
          currentView={currentView}
          setCurrentView={setCurrentView}
        />
        
        {/* Filters */}
        <FertilizerFilters
          filters={filters}
          handleFilterChange={handleFilterChange}
          clearFilters={clearFilters}
          categories={fertilizerCategories}
          companies={fertilizerCompanies}
          currentView={currentView}
        />
        
        {/* Table */}
        <FertilizerTable
          filteredRequests={filteredRequests}
          currentView={currentView}
          loading={loading}
          onViewRequest={handleViewRequest}
          onApprove={handleApprove}
          onReject={handleReject}
          page={page}
          size={size}
          totalElements={totalElements}
          first={first}
          last={last}
          onPageChange={handlePageChange}
        />
      </div>
      
      {/* Modal */}
      {selectedRequest && (
        <FertilizerRequestModal
          request={selectedRequest}
          isOpen={showRequestModal}
          onClose={() => setShowRequestModal(false)}
          onApprove={handleApprove}
          onReject={handleReject}
          loading={actionLoading}
        />
      )}
    </div>
  );
}
