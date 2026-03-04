import { Eye, Users, ChevronLeft, ChevronRight } from "lucide-react";
// ...existing code...
import { useNavigate } from "react-router-dom";

const ACCENT_COLOR = "#01251F";

export default function SupplierTable({
  filteredSuppliers,
  currentView,
  page = 0,
  size = 10,
  totalElements = 0,
  first = false,
  last = false,
  onPageChange,
}) {
  const navigate = useNavigate();
  const currentPage = page + 1;
  const totalPages = Math.ceil(totalElements / size);
  const currentSuppliers = filteredSuppliers;

  const goToPage = (uiPage) => {
    // uiPage is 1-based, backend expects 0-based
    if (onPageChange) onPageChange(uiPage - 1);
  };

  const handleViewDetails = (supplier) => {
    navigate(`/factoryManager/suppliers/${supplier.id}`, {
      state: { currentView },
    });
  };

  // ✅ Unified green header for all views
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

  const getActionButton = (supplier) => (
    <button
      onClick={() => handleViewDetails(supplier)}
      className="p-2 rounded-full transition-colors"
      title="View Details"
      style={
        currentView === "rejected"
          ? { border: "1.5px solid #dc2626", color: "#dc2626" }
          : { border: `1.5px solid ${ACCENT_COLOR}`, color: ACCENT_COLOR }
      }
    >
      <Eye className="h-4 w-4" />
    </button>
  );

  // Column definitions based on view
  const columns =
    currentView === "approved"
      ? [
          {
            key: "id",
            label: "Supplier ID",
            render: (s) => (
              <span
                className="font-semibold text-sm px-3 py-1 rounded-full border"
                style={getBadgeColor()}
              >
                SUP-{String(s.id).padStart(4, "0")}
              </span>
            ),
          },
          { key: "name", label: "Supplier Name", render: (s) => s.name },
          {
            key: "routeName",
            label: "Route",
            render: (s) => s.routeName || "-",
          },
          {
            key: "approvedDate",
            label: "Approved Date",
            render: (s) => s.approvedDate || "-",
          },
          {
            key: "actions",
            label: "View Details",
            render: (s) => getActionButton(s),
          },
        ]
      : [
          {
            key: "id",
            label: "Request ID",
            render: (s) => (
              <span
                className="font-semibold text-sm px-3 py-1 rounded-full border"
                style={getBadgeColor()}
              >
                REQ-{String(s.id).padStart(4, "0")}
              </span>
            ),
          },
          { key: "name", label: "Supplier Name", render: (s) => s.name },
          {
            key: "monthlySupply",
            label: "Monthly Supply",
            render: (s) => (s.monthlySupply ? `${s.monthlySupply} kg` : "-"),
          },
          {
            key: "date",
            label: currentView === "pending" ? "Request Date" : "Rejected Date",
            render: (s) =>
              currentView === "pending"
                ? s.supplierCreatedDate || "-"
                : s.rejectedDate || "-",
          },
          {
            key: "actions",
            label: "View Details",
            render: (s) => getActionButton(s),
          },
        ];

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
      <div style={getHeaderColor()}>
        <div
          className={`grid grid-cols-${columns.length} gap-4 p-4 font-medium text-sm text-center`}
        >
          {columns.map((col) => (
            <div key={col.key}>{col.label}</div>
          ))}
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        {currentSuppliers.map((supplier) => (
          <div
            key={supplier.id}
            className={`grid grid-cols-${columns.length} gap-4 p-4 items-center hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0`}
          >
            {columns.map((col) => (
              <div key={col.key} className="text-sm text-gray-900 text-center">
                {col.render(supplier)}
              </div>
            ))}
          </div>
        ))}

        {filteredSuppliers.length === 0 && (
          <div className="p-12 text-center text-gray-500">
            <div className="bg-gray-100 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <Users className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No suppliers found
            </h3>
          </div>
        )}
      </div>

      {totalElements > 0 && (
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm text-gray-700">
              <span>
                Showing <span className="font-medium">{page * size + 1}</span>{" "}
                to{" "}
                <span className="font-medium">
                  {Math.min(
                    page * size + currentSuppliers.length,
                    totalElements
                  )}
                </span>{" "}
                of <span className="font-medium">{totalElements}</span>{" "}
                suppliers
              </span>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={first}
                  className={`p-2 rounded-md ${
                    first
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-gray-600 hover:text-black hover:bg-gray-100"
                  } transition-colors`}
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <div className="flex space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => {
                      return (
                        p === 1 ||
                        p === totalPages ||
                        (p >= currentPage - 1 && p <= currentPage + 1)
                      );
                    })
                    .map((p, index, array) => {
                      const showEllipsis =
                        index > 0 && p - array[index - 1] > 1;
                      return (
                        <div key={p} className="flex items-center">
                          {showEllipsis && (
                            <span className="px-3 py-2 text-gray-500">...</span>
                          )}
                          <button
                            onClick={() => goToPage(p)}
                            className={`px-3 py-2 text-sm rounded-md border ${
                              currentPage === p
                                ? "border-gray-400 bg-[#165e52] text-white"
                                : "border-gray-200 text-black hover:bg-gray-100"
                            } transition-colors`}
                          >
                            {p}
                          </button>
                        </div>
                      );
                    })}
                </div>
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={last}
                  className={`p-2 rounded-md ${
                    last
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-gray-600 hover:text-black hover:bg-gray-100"
                  } transition-colors`}
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
