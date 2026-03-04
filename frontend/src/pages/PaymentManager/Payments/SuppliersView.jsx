import { Eye, User, CreditCard, Banknote } from "lucide-react";

export default function SuppliersView({
  filteredData,
  getCurrentData,
  onViewSupplierBill,
}) {
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
      {/* Table Header */}
      <div className="bg-[#01251F] text-white">
        <div className="grid grid-cols-6 gap-4 p-4 font-medium text-sm">
          <div className="text-left">Supplier ID</div>
          <div className="text-left">Supplier Name</div>
          <div className="text-right">Final Amount</div>
          <div className="text-center">Payment Method</div>
          <div className="text-center">Status</div>
          <div className="text-center">View Details</div>
        </div>
      </div>

      {/* Table Rows */}
      <div className="divide-y divide-gray-100">
        {filteredData.map((supplier) => {
          const isBank = supplier.paymentMethod === "Bank";
          const isPaid = supplier.status === "Paid";

          const paymentBg = isBank ? "#ffffff" : "#ffffff";
          const paymentBorder = isBank ? "#000000" : "#000000";
          const paymentText = isBank ? "#000000" : "#000000";

          const statusBg = isPaid ? "#d6f5e3" : "#fff3cd";
          const statusBorder = isPaid ? "#388e3c" : "#ffc107";
          const statusText = isPaid ? "#388e3c" : "#856404";

          return (
            <div
              key={supplier.id}
              className="grid grid-cols-6 gap-4 p-3 items-center hover:bg-gray-50 transition-colors"
            >
              {/* Supplier ID Badge */}
              <div className="font-semibold text-black text-sm bg-gray-100 px-3 py-1 rounded-full inline-block border border-black w-fit text-center">
                {supplier.id}
              </div>

              {/* Supplier Name */}
              <div className="font-medium text-gray-900 text-sm">{supplier.supplierName}</div>

              {/* Final Amount */}
              <div className="text-sm font-bold text-black text-right">
                Rs. {supplier.finalAmount.toLocaleString()}
              </div>

              {/* Payment Method Pill */}
              <div className="flex justify-center">
                <span
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: paymentBg,
                    border: `1px solid ${paymentBorder}`,
                    color: paymentText,
                  }}
                >
                  {isBank ? (
                    <CreditCard className="h-3 w-3" />
                  ) : (
                    <Banknote className="h-3 w-3" />
                  )}
                  {supplier.paymentMethod}
                </span>
              </div>

              {/* Status Pill */}
              <div className="flex justify-center">
                <span
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: statusBg,
                    border: `1px solid ${statusBorder}`,
                    color: statusText,
                  }}
                >
                  {supplier.status}
                </span>
              </div>

              {/* View Button */}
              <div className="flex justify-center">
                <button
                  onClick={() => onViewSupplierBill(supplier)}
                  className="text-[#165e52] border border-[#165e52] hover:bg-[#e1f4ef] p-2 rounded-full transition-colors"
                  title="View Details"
                >
                  <Eye className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}

        {/* Empty state */}
        {filteredData.length === 0 && (
          <div className="p-12 text-center text-gray-500">
            <div className="bg-gray-100 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <User className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No suppliers found
            </h3>
            <p className="text-gray-600">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </div>

      {/* Table Footer */}
      <div className="bg-gray-50 flex items-center justify-between text-sm text-gray-600 p-4 border-t border-gray-200">
        <div>
          Showing {filteredData.length} of {getCurrentData().length} results
        </div>
      </div>
    </div>
  );
}
