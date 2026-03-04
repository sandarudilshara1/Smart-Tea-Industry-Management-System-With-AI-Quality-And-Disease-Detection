// Design system constants
export const ACCENT_COLOR = "#165E52";
export const BTN_COLOR = "#01251F";
export const BORDER_COLOR = "#cfece6";
export const BG_LIGHT_GREEN = "#e1f4ef";

// Get summary statistics for fertilizer requests
export function getFertilizerSummary(requests = []) {
  return {
    totalRequests: requests.length || 0,
    pendingRequests: requests.filter((r) => r.status === "PENDING").length || 0,
    approvedRequests: requests.filter((r) => r.status === "APPROVED").length || 0,
    rejectedRequests: requests.filter((r) => r.status === "REJECTED").length || 0,
  };
}

// Filter fertilizer requests based on filters
export function filterFertilizerRequests(requests, filters) {
  return requests.filter((request) => {
    // Filter by search term
    if (
      filters.search &&
      !Object.values(request).some((value) =>
        String(value).toLowerCase().includes(filters.search.toLowerCase())
      )
    ) {
      return false;
    }

    // Filter by status
    if (filters.status && request.status !== filters.status) {
      return false;
    }

    // Filter by category
    if (filters.categoryId && request.categoryId !== filters.categoryId) {
      return false;
    }

    // Filter by company
    if (filters.companyId && request.companyId !== filters.companyId) {
      return false;
    }

    return true;
  });
}

// Sort fertilizer requests
export function sortFertilizerRequests(requests, sortKey, sortOrder) {
  return [...requests].sort((a, b) => {
    let valA = a[sortKey];
    let valB = b[sortKey];
    
    // Handle special cases like dates
    if (sortKey === "createdAt" || sortKey === "updatedAt") {
      valA = new Date(valA).getTime();
      valB = new Date(valB).getTime();
    }
    
    // Handle numeric fields
    if (sortKey === "quantity") {
      valA = Number(valA);
      valB = Number(valB);
    }
    
    // Perform the comparison
    if (valA < valB) return sortOrder === "asc" ? -1 : 1;
    if (valA > valB) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });
}

// Format date for display
export function formatDate(dateString) {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// Get status badge color
export function getStatusColor(status) {
  const statusColors = {
    PENDING: "bg-yellow-100 text-yellow-800",
    APPROVED: "bg-green-100 text-green-800",
    REJECTED: "bg-red-100 text-red-800",
    FULFILLED: "bg-blue-100 text-blue-800",
  };
  
  return statusColors[status] || "bg-gray-100 text-gray-800";
}
