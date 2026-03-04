import React, { useState } from "react";
import { Search } from "lucide-react";

const ACCENT_COLOR = "#165E52";
const BORDER_COLOR = "#cfece6";
const BTN_COLOR = "#01251F";

export default function DriverRoute() {
  const [searchTerm, setSearchTerm] = useState("");

  const [suppliers] = useState([
    { bagNo: "TN-B1", supplierNo: "TN-S101", supplierName: "Supplier - 1", weight: "20 Kg" },
    { bagNo: "TN-B2", supplierNo: "TN-S102", supplierName: "Supplier - 2", weight: "22 Kg" },
    { bagNo: "TN-B4", supplierNo: "TN-S103", supplierName: "Supplier - 3", weight: "14 Kg" },
    { bagNo: "TN-B5", supplierNo: "TN-S104", supplierName: "Supplier - 4", weight: "24 Kg" },
    { bagNo: "TN-B6", supplierNo: "TN-S104", supplierName: "Supplier - 4", weight: "25 Kg" },
    { bagNo: "TN-B7", supplierNo: "TN-S104", supplierName: "Supplier - 4", weight: "14 Kg" },
  ]);

  const filteredSuppliers = suppliers.filter((supplier) =>
    supplier.bagNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.supplierNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.supplierName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleConfirm = (bagNo) => {
    console.log(`Confirmed bag: ${bagNo}`);
  };

  const handleEdit = (bagNo) => {
    console.log(`Edit bag: ${bagNo}`);
  };

  return (
    <div className="min-h-screen bg-[#f9fafb] p-4">
      <div className="max-w-6xl mx-auto space-y-5">
        {/* Top Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-white rounded-lg shadow-sm border" style={{ borderColor: BORDER_COLOR }}>
            <div className="flex justify-between items-center p-4">
              <span className="text-gray-600 font-medium text-sm">No of Suppliers</span>
              <span className="text-xl font-bold text-gray-900">{suppliers.length}</span>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border" style={{ borderColor: BORDER_COLOR }}>
            <div className="flex justify-between items-center p-4">
              <span className="text-gray-600 font-medium text-sm">No of Bags</span>
              <span className="text-xl font-bold text-gray-900">{suppliers.length}</span>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border" style={{ borderColor: BORDER_COLOR }}>
            <div className="flex justify-between items-center p-4">
              <span className="text-gray-600 font-medium text-sm">Total Weight</span>
              <span className="text-xl font-bold text-gray-900">---</span>
            </div>
          </div>
        </div>

        {/* Route Information Inputs */}
        <div className="bg-white rounded-lg shadow-sm border p-4" style={{ borderColor: BORDER_COLOR }}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Route No
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 text-sm border rounded-md focus:ring-2 focus:ring-[#165E52] focus:border-transparent border-[#cfece6] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Route Name
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 text-sm border rounded-md focus:ring-2 focus:ring-[#165E52] focus:border-transparent border-[#cfece6] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Driver Name
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 text-sm border rounded-md focus:ring-2 focus:ring-[#165E52] focus:border-transparent border-[#cfece6] focus:outline-none"
              />
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-4 pr-10 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-[#165E52] focus:border-transparent border-[#cfece6] bg-gray-50 focus:outline-none"
              />
              <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Suppliers Table */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden" style={{ borderColor: BORDER_COLOR }}>
          <div className="bg-[#165E52] text-white">
            <div className="grid grid-cols-6 gap-4 p-3 font-medium text-sm">
              <div>Bag No</div>
              <div>Supplier No</div>
              <div>Supplier Name</div>
              <div>Weight</div>
              <div>Condition</div>
              <div>Action</div>
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {filteredSuppliers.map((supplier, index) => (
              <div
                key={index}
                className="grid grid-cols-6 gap-4 p-3 items-center text-sm hover:bg-gray-50 transition-colors"
              >
                <div className="font-medium text-gray-900">{supplier.bagNo}</div>
                <div className="text-gray-700">{supplier.supplierNo}</div>
                <div className="text-gray-700">{supplier.supplierName}</div>
                <div className="text-gray-900 font-semibold">{supplier.weight}</div>
                <div></div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleConfirm(supplier.bagNo)}
                    className="px-3 py-1 text-xs font-medium rounded bg-[#165E52] text-white hover:bg-[#144d45] transition"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => handleEdit(supplier.bagNo)}
                    className="px-3 py-1 text-xs font-medium rounded border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
                  >
                    Edit
                  </button>
                </div>
              </div>
            ))}

            {filteredSuppliers.length === 0 && (
              <div className="p-6 text-center text-gray-500 text-sm">
                No suppliers found matching your search.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
