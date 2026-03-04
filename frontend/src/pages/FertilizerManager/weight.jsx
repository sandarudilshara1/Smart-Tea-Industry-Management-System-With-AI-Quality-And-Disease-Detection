import React, { useState } from 'react';
import { Search } from 'lucide-react';

const ACCENT_COLOR = '#165E52';
const BTN_COLOR = '#01251F';
const BORDER_COLOR = '#cfece6';

export default function Route() {
  const [searchTerm, setSearchTerm] = useState('');

  const [routes] = useState([
    { id: 'TN-1', routeName: 'Route - 1', driverName: 'Driver - 1', vehicleNo: 'DAD-2435', suppliers: 10 },
    { id: 'TK-1', routeName: 'Route - 2', driverName: 'Driver - 2', vehicleNo: 'DAD-2436', suppliers: 12 },
    { id: 'TB-1', routeName: 'Route - 3', driverName: 'Driver - 3', vehicleNo: 'DAD-2437', suppliers: 8 },
    { id: 'TR-1', routeName: 'Route - 4', driverName: 'Driver - 4', vehicleNo: 'DAD-2438', suppliers: 29 },
    { id: 'TB-2', routeName: 'Route - 5', driverName: 'Driver - 5', vehicleNo: 'DAD-2439', suppliers: 16 },
  ]);

  const filteredRoutes = routes.filter((route) =>
    route.routeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    route.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    route.vehicleNo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto space-y-5">
        {/* Top Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow-sm border p-4" style={{ borderColor: BORDER_COLOR }}>
            <div className="flex justify-between">
              <span className="text-gray-600 font-medium text-sm">No of Suppliers</span>
              <span className="text-xl font-bold text-gray-900">12</span>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-4" style={{ borderColor: BORDER_COLOR }}>
            <div className="flex justify-between">
              <span className="text-gray-600 font-medium text-sm">No of Bags</span>
              <span className="text-xl font-bold text-gray-900">12</span>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-4" style={{ borderColor: BORDER_COLOR }}>
            <div className="flex justify-between">
              <span className="text-gray-600 font-medium text-sm">Total Weight</span>
              <span className="text-xl font-bold text-gray-900">12</span>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="bg-white rounded-lg shadow-sm border p-4" style={{ borderColor: BORDER_COLOR }}>
          <div className="flex justify-between items-center gap-4 flex-wrap">
            <button
              className="text-white text-sm font-medium px-4 py-2 rounded transition-colors"
              style={{ backgroundColor: BTN_COLOR }}
            >
              Enter
            </button>
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-4 pr-10 py-2 text-sm border border-[#cfece6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#165E52] focus:border-transparent bg-gray-50"
              />
              <Search className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Route Table */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden" style={{ borderColor: BORDER_COLOR }}>
          <div className="bg-[#165E52] text-white">
            <div className="grid grid-cols-6 gap-4 p-3 font-medium text-sm">
              <div>Route No</div>
              <div>Route Name</div>
              <div>Driver Name</div>
              <div>Vehicle No</div>
              <div>No. of Suppliers</div>
              <div>Action</div>
            </div>
          </div>

          <div className="divide-y divide-gray-200 text-sm">
            {filteredRoutes.map((route, idx) => (
              <div key={idx} className="grid grid-cols-6 gap-4 p-3 items-center hover:bg-gray-50">
                <div className="font-medium text-gray-900">{route.id}</div>
                <div className="text-gray-700">{route.routeName}</div>
                <div className="text-gray-700">{route.driverName}</div>
                <div className="text-gray-700">{route.vehicleNo}</div>
                <div className="font-medium text-gray-900">{route.suppliers}</div>
                <div>
                  <button
                    className="text-white px-4 py-1 rounded text-xs font-medium transition"
                    style={{ backgroundColor: BTN_COLOR }}
                  >
                    View
                  </button>
                </div>
              </div>
            ))}

            {filteredRoutes.length === 0 && (
              <div className="p-6 text-center text-gray-500">
                No routes found matching your search.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
