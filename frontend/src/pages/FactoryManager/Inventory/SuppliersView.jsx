import { Eye, Users } from "lucide-react";

import PaginationControls from "../../../components/ui/PaginationControls";

export default function SuppliersView({
  suppliersData,
  onViewSupplierDetail,
  page,
  totalPages,
  totalElements,
  setPage,
  loading,
}) {
  return (
    <div className="bg-white rounded-xl shadow border border-[#d1e7dd] overflow-hidden">
      {/* Table Header */}
      <div className="bg-[#172526] text-white">
        <div className="grid grid-cols-6 gap-4 p-4 font-semibold text-sm">
          <div className="text-center">Supplier ID</div>
          <div className="text-center">Supplier Name</div>
          <div className="text-center">Weight (kg)</div>
          <div className="text-center">Bags</div>
          <div className="text-center">Net Weight</div>
          <div className="text-center">Details</div>
        </div>
      </div>

      {/* Table Body */}
      <div className="divide-y divide-gray-100">
        {suppliersData.map((supplier) => {
          return (
            <div
              key={supplier.id}
              className="grid grid-cols-6 gap-4 p-4 items-center hover:bg-gray-50 transition"
            >
              <div className="flex justify-center">
                <span className="text-sm font-semibold text-[#172526] bg-[#edf3f2] px-3 py-1 rounded-full border border-[#d1e7dd]">
                  {supplier.id}
                </span>
              </div>
              <div className="text-center text-sm font-medium text-gray-800">
                {supplier.supplierName}
              </div>
              <div className="text-center text-sm text-gray-700 font-semibold">
                {supplier.totalWeight.toFixed(1)}
              </div>
              <div className="text-center text-sm text-gray-700 font-semibold">
                {supplier.totalBags}
              </div>
              <div className="text-center text-sm text-gray-700 font-medium">
                {supplier.totalNetWeight.toFixed(1)}
              </div>
              <div className="flex justify-center">
                <button
                  onClick={() => onViewSupplierDetail(supplier)}
                  className="text-[#172526] hover:bg-[#edf3f2] p-2 rounded-full transition"
                  title="View Details"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}

        {suppliersData.length === 0 && !loading && (
          <div className="p-10 text-center text-gray-500">
            <div className="flex justify-center mb-2">
              <Users className="w-12 h-12 text-gray-300" />
            </div>

            <h3 className="text-lg font-semibold text-gray-800 mb-1">
              No suppliers found
            </h3>
            <p className="text-gray-600 text-sm">
              Please adjust your filters or search term.
            </p>
          </div>
        )}

        {loading && (
          <div className="p-10 text-center text-gray-500">
            <div className="flex justify-center mb-2">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#172526]"></div>
            </div>
            <p className="text-gray-600 text-sm">Loading suppliers...</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <PaginationControls
          page={page}
          totalPages={totalPages}
          totalElements={totalElements}
          setPage={setPage}
        />
      )}
    </div>
  );
}
