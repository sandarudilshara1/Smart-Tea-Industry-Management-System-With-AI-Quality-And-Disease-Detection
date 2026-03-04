import { Eye, CheckCircle, XCircle, ChevronLeft, ChevronRight, Package } from "lucide-react";
import { getStatusColor } from "./fertilizerUtils";

const ACCENT_COLOR = "#01251F";

export default function FertilizerTable({
  filteredRequests,
  currentView,
  loading,
  onViewRequest,
  onApprove,
  onReject,
  page = 0,
  size = 10,
  totalElements = 0,
  first = false,
  last = false,
  onPageChange,
}) {
  const currentPage = page + 1;
  const totalPages = Math.ceil(totalElements / size);

  const goToPage = (uiPage) => {
    // uiPage is 1-based, backend expects 0-based
    if (onPageChange) onPageChange(uiPage - 1);
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };
  
  // ✅ Unified green header for all views - like suppliers table
  const getHeaderColor = () => ({
    backgroundColor: ACCENT_COLOR,
    color: "#ffffff",
  });
  
  const getBadgeColor = () => {
    if (currentView === "approved")
      return {
        backgroundColor: "#e1f4ef",
        color: "#165e52",
        borderColor: "#165e52",
      };
    if (currentView === "pending")
      return {
        backgroundColor: "#fffbeb",
        color: "#b45309",
        borderColor: "#f59e0b",
      };
    if (currentView === "rejected")
      return {
        backgroundColor: "#fee2e2",
        color: "#b91c1c",
        borderColor: "#ef4444",
      };
    return {};
  };
  
  const getActionButton = (request) => (
    <div className="flex items-center justify-center gap-2">
      <button
        onClick={() => onViewRequest(request)}
        className="p-2 rounded-full transition-colors"
        title="View Details"
        style={{ border: `1.5px solid ${ACCENT_COLOR}`, color: ACCENT_COLOR }}
      >
        <Eye className="h-4 w-4" />
      </button>
      {currentView === "pending" && (
        <>
          <button
            onClick={() => onApprove(request.id)}
            className="p-2 rounded-full transition-colors"
            title="Approve Request"
            style={{ border: "1.5px solid #16a34a", color: "#16a34a" }}
          >
            <CheckCircle className="h-4 w-4" />
          </button>
          <button
            onClick={() => onReject(request.id)}
            className="p-2 rounded-full transition-colors"
            title="Reject Request"
            style={{ border: "1.5px solid #dc2626", color: "#dc2626" }}
          >
            <XCircle className="h-4 w-4" />
          </button>
        </>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md border">
        <div className="p-6 text-center">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-6 w-24 bg-gray-200 mb-4 rounded"></div>
            <div className="h-32 w-full bg-gray-100 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (filteredRequests.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div style={getHeaderColor()}>
          <div className="grid grid-cols-5 gap-4 p-4 font-medium text-sm text-center">
            <div>ID</div>
            <div>Category</div>
            <div>Company</div>
            <div>Quantity</div>
            <div>Actions</div>
          </div>
        </div>
        <div className="p-12 text-center text-gray-500">
          <div className="bg-gray-100 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <Package className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No requests found</h3>
          <p className="text-gray-500">
            {currentView === "pending"
              ? "There are no pending fertilizer requests at this time."
              : currentView === "approved"
              ? "No approved fertilizer requests found matching your filters."
              : currentView === "rejected"
              ? "No rejected fertilizer requests found matching your filters."
              : "No fertilizer requests found matching your filters."}
          </p>
        </div>
      </div>
    );
  }

  // Define columns based on view
  const columns = [
    {
      key: "id",
      label: "Request ID",
      render: (r) => (
        <span
          className="font-semibold text-sm px-3 py-1 rounded-full border"
          style={getBadgeColor()}
        >
          REQ-{String(r.id).padStart(4, "0")}
        </span>
      ),
    },
    { 
      key: "category", 
      label: "Category", 
      render: (r) => r.categoryName || "-" 
    },
    { 
      key: "company", 
      label: "Company", 
      render: (r) => r.companyName || "-" 
    },
    {
      key: "quantity",
      label: "Quantity",
      render: (r) => `${r.quantity} ${r.unit || "kg"}`,
    },
    ...(currentView === "all" 
      ? [
          {
            key: "status",
            label: "Status",
            render: (r) => (
              <span
                className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(r.status)}`}
              >
                {r.status}
              </span>
            ),
          }
        ] 
      : []
    ),
    {
      key: "date",
      label: "Requested On",
      render: (r) => formatDate(r.createdAt),
    },
    {
      key: "actions",
      label: "Actions",
      render: (r) => getActionButton(r),
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
      {/* Table Header */}
      <div style={getHeaderColor()}>
        <div className={`grid grid-cols-${columns.length} gap-4 p-4 font-medium text-sm text-center`}>
          {columns.map((col) => (
            <div key={col.key}>{col.label}</div>
          ))}
        </div>
      </div>
      
      {/* Table Body */}
      <div className="divide-y divide-gray-200">
        {filteredRequests.map((request) => (
          <div
            key={request.id}
            className={`grid grid-cols-${columns.length} gap-4 p-4 items-center hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0`}
          >
            {columns.map((col) => (
              <div key={col.key} className="text-sm text-gray-900 text-center">
                {col.render(request)}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalElements > 0 && (
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm text-gray-700">
              <span>
                Showing <span className="font-medium">{page * size + 1}</span>{" "}
                to{" "}
                <span className="font-medium">
                  {Math.min((page + 1) * size, totalElements)}
                </span>{" "}
                of <span className="font-medium">{totalElements}</span> results
              </span>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => !first && goToPage(currentPage - 1)}
                  disabled={first}
                  className={`p-2 rounded-md border ${
                    first 
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                
                {/* Simplified page number display */}
                <div className="text-sm font-medium">
                  Page {currentPage} of {totalPages}
                </div>
                
                <button
                  onClick={() => !last && goToPage(currentPage + 1)}
                  disabled={last}
                  className={`p-2 rounded-md border ${
                    last 
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}