import React, { useState, useEffect, useRef } from "react";
import { Search, User, Scale, Filter, Clock, Calendar, Leaf, Droplets } from "lucide-react";
import { getRoutesDetails } from "../../../api/supplier";
import {
  getBagWeights,
  getInventoryManagersByFactory,
  getFertilizerHistory,
} from "../../../api/inventoryManager/history";
import PaginationControls from "../../../components/ui/PaginationControls";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useAuth } from "../../../contexts/AuthContext";

export default function InventoryHistory() {
  const [activeTab, setActiveTab] = useState("leaf"); // 'leaf' or 'fertilizer'
  const [history, setHistory] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const debounceTimeout = useRef();
  
  // Leaf Filters
  const [routeFilter, setRouteFilter] = useState("");
  const [userIdFilter, setUserIdFilter] = useState("");
  
  // Fertilizer Filters
  const [fertilizerTypeFilter, setFertilizerTypeFilter] = useState(""); // 'IN', 'OUT' or ''
  
  const [selectedDate, setSelectedDate] = useState(null); // Date object
  const [routeOptions, setRouteOptions] = useState([]);
  const [userOptions, setUserOptions] = useState([]); // [{userId, userName}]
  const { user } = useAuth();
  const factoryId = user?.factoryId;

  // Reset page when tab changes
  useEffect(() => {
    setPage(0);
    setSearchTerm("");
    setSelectedDate(null);
  }, [activeTab]);

  // Debounce searchTerm
  useEffect(() => {
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 400);
    return () => clearTimeout(debounceTimeout.current);
  }, [searchTerm]);

  // Fetch data from API based on active tab
  useEffect(() => {
    if (!factoryId) return;
    setLoading(true);
    
    const params = {
      page,
      size: 10,
    };

    if (selectedDate) {
      const localDate = selectedDate;
      const yyyy = localDate.getFullYear();
      const mm = String(localDate.getMonth() + 1).padStart(2, "0");
      const dd = String(localDate.getDate()).padStart(2, "0");
      params.date = `${yyyy}-${mm}-${dd}`;
    }
    
    if (debouncedSearch) params.search = debouncedSearch;

    if (activeTab === "leaf") {
      params.factoryId = factoryId;
      if (routeFilter) params.routeId = routeFilter;
      if (userIdFilter) params.userId = userIdFilter;
      
      getBagWeights(params)
        .then((data) => {
          setHistory(data.content || []);
          setTotalPages(data.totalPages || 1);
          setTotalElements(data.totalElements || 0);
        })
        .catch(() => {
          setHistory([]);
          setTotalPages(1);
          setTotalElements(0);
        })
        .finally(() => setLoading(false));
    } else {
      // Fertilizer history
      if (fertilizerTypeFilter) params.type = fertilizerTypeFilter;
      
      getFertilizerHistory(params)
        .then((data) => {
          setHistory(data.content || []);
          setTotalPages(data.totalPages || 1);
          setTotalElements(data.totalElements || 0);
        })
        .catch(() => {
          setHistory([]);
          setTotalPages(1);
          setTotalElements(0);
        })
        .finally(() => setLoading(false));
    }
  }, [
    factoryId,
    activeTab,
    page,
    routeFilter,
    userIdFilter,
    fertilizerTypeFilter,
    selectedDate,
    debouncedSearch,
  ]);

  // Fetch dropdown options
  useEffect(() => {
    if (!factoryId) return;
    getInventoryManagersByFactory(factoryId)
      .then((data) => setUserOptions(data))
      .catch(() => setUserOptions([]));
      
    getRoutesDetails(factoryId)
      .then((data) => setRouteOptions(data))
      .catch(() => setRouteOptions([]));
  }, [factoryId]);

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedDate(null);
    if (activeTab === "leaf") {
      setRouteFilter("");
      setUserIdFilter("");
    } else {
      setFertilizerTypeFilter("");
    }
  };

  return (
    <div className="h-full bg-gray-50 p-4">
      <div className="max-w-8xl mx-auto space-y-4">
        {/* Header and Tabs */}
        <div className="bg-white shadow-sm p-4 mb-6 rounded-lg">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-emerald-900">
                Inventory History
              </h1>
              <p className="text-sm text-gray-500">View and manage all inventory transaction logs</p>
            </div>
            
            <div className="flex bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab("leaf")}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTab === "leaf"
                    ? "bg-white text-emerald-700 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <Leaf className="h-4 w-4" />
                Leaf Inventory
              </button>
              <button
                onClick={() => setActiveTab("fertilizer")}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTab === "fertilizer"
                    ? "bg-white text-emerald-700 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <Droplets className="h-4 w-4" />
                Fertilizer Inventory
              </button>
            </div>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder={activeTab === 'leaf' ? "Search by Supplier Name" : "Search Category/Company"}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-4 pr-10 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-gray-50"
              />
              <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>

            {activeTab === "leaf" ? (
              <>
                {/* Route Filter */}
                <div>
                  <select
                    value={routeFilter}
                    onChange={(e) => setRouteFilter(e.target.value)}
                    className="w-full py-2 px-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-gray-50"
                  >
                    <option value="">All Routes</option>
                    {routeOptions.map((route) => (
                      <option key={route.routeId} value={route.routeId}>
                        {route.name} - {route.routeCode}
                      </option>
                    ))}
                  </select>
                </div>
                {/* UserId Filter */}
                <div>
                  <select
                    value={userIdFilter}
                    onChange={(e) => setUserIdFilter(e.target.value)}
                    className="w-full py-2 px-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-gray-50"
                  >
                    <option value="">All Users</option>
                    {userOptions.map((user) => (
                      <option key={user.userId} value={user.userId}>
                        {user.userName}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            ) : (
              <>
                {/* Fertilizer Type Filter */}
                <div>
                  <select
                    value={fertilizerTypeFilter}
                    onChange={(e) => setFertilizerTypeFilter(e.target.value)}
                    className="w-full py-2 px-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-gray-50"
                  >
                    <option value="">All Types</option>
                    <option value="IN">Stock IN (Received)</option>
                    <option value="OUT">Stock OUT (Used)</option>
                  </select>
                </div>
                <div className="hidden md:block"></div>
              </>
            )}

            {/* Date Picker */}
            <div>
              <DatePicker
                selected={selectedDate}
                onChange={(date) => setSelectedDate(date)}
                dateFormat="yyyy-MM-dd"
                placeholderText="Select Date"
                className="w-full py-2 px-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-gray-50"
                isClearable
                maxDate={new Date()}
                showIcon
                icon={<Calendar className="h-4 w-4 text-gray-400" />}
              />
            </div>

            {/* Clear Filters */}
            <div>
              <button
                onClick={clearFilters}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* History Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead style={{ backgroundColor: "#01251F" }}>
                {activeTab === "leaf" ? (
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Supplier ID/Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Gross Weight
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Deductions
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Net Weight
                    </th>
                  </tr>
                ) : (
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Type/Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Company/Purpose
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Recorded By
                    </th>
                  </tr>
                )}
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-500">
                      Loading...
                    </td>
                  </tr>
                ) : history.length > 0 ? (
                  history.map((item) => (
                    activeTab === "leaf" ? (
                      <tr
                        key={item.bagWeightId}
                        className="hover:bg-gray-50 transition-colors duration-150"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{item.supplierName}</div>
                          <div className="text-xs text-gray-500">{item.supplierId}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(item.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-emerald-700 font-medium">
                          {item.grossWeight} Kg
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                          {item.deduction} Kg
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-emerald-700 font-medium">
                          {item.netWeight} Kg
                        </td>
                      </tr>
                    ) : (
                      <tr
                        key={item.transactionId}
                        className="hover:bg-gray-50 transition-colors duration-150"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                              item.type === 'IN' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {item.type}
                            </span>
                            <span className="text-sm font-medium text-gray-900">{item.categoryName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{item.type === 'IN' ? item.companyName : item.purpose}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(item.eventAt).toLocaleDateString()}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold ${
                          item.type === 'IN' ? 'text-emerald-700' : 'text-red-700'
                        }`}>
                          {item.type === 'IN' ? '+' : '-'}{item.kg} Kg
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.recordedBy}
                        </td>
                      </tr>
                    )
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-500">
                      <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No History Records Found
                      </h3>
                      <p>
                        No records match your current search and filter
                        criteria.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <PaginationControls
            page={page}
            totalPages={totalPages}
            totalElements={totalElements}
            setPage={setPage}
          />
        </div>
      </div>
    </div>
  );
}
