import { useState, useMemo, useEffect } from "react";
import { Eye, Edit, MapPin, Users } from "lucide-react";
import RouteHeader from "./RouteHeader";
import RouteFilters from "./RouteFilters";
import RouteSummaryCards from "./RouteSummaryCards";
import RouteModal from "./RouteModal";
import SupplierSelectionModal from "./SupplierSelectionModal";
import { regions } from "./routeData";
import {
  getRouteSummary,
  filterRoutes,
  sortRoutes,
} from "./routeUtils";
import {
  getAllRoutes,
  createRoute as createRouteAPI,
  updateRoute as updateRouteAPI,
  deleteRoute as deleteRouteAPI,
} from "../../../api/route";
import { getAllDrivers } from "../../../api/driver";
import { getAllVehicles } from "../../../api/vehicle";
import { useAuth } from "../../../contexts/AuthContext";

export default function RouteManagement() {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState("routes");
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [showRouteModal, setShowRouteModal] = useState(false);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [editingRoute, setEditingRoute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [availableDrivers, setAvailableDrivers] = useState([]);
  const [availableVehicles, setAvailableVehicles] = useState([]);

  const factoryId = "me";

  const [filters, setFilters] = useState({
    search: "",
    status: "All",
    region: "All",
    driverAssignment: "All",
  });
  const [sortBy, setSortBy] = useState("routeName");
  const [sortOrder, setSortOrder] = useState("asc");

  // Fetch routes and drivers on mount
  useEffect(() => {
    fetchRoutes();
    fetchDrivers();
    fetchVehicles();
  }, [factoryId]);

  const fetchRoutes = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllRoutes(factoryId);
      console.log('📊 Routes API response:', response);
      if (response.success && response.content) {
        // Map backend fields to frontend format
        const mappedRoutes = response.content.map(route => ({
          id: route._id,
          routeId: route.routeNumber,
          routeName: route.routeName,
          area: route.area,
          description: route.description,
          assignedDriver: route.driverId?.name || null,
          driverId: route.driverId?._id,
          vehicleId: route.vehicleId?._id,
          vehicleNumber: route.vehicleId?.vehicleNumber,
          supplierCount: route.supplierCount || 0,
          status: route.status,
          collectionDays: route.collectionDays || [],
          distance: '---', // Not in schema
          estimatedTime: '---', // Not in schema
          lastMonthWeight: 0, // TODO: Calculate from actual data
          actualLoad: 0, // TODO: Calculate from actual data
          createdDate: route.createdAt ? new Date(route.createdAt).toISOString().split('T')[0] : null,
          lastUpdated: route.updatedAt ? new Date(route.updatedAt).toISOString().split('T')[0] : null,
          ...route
        }));
        console.log('✅ Setting routes:', mappedRoutes.length, 'routes');
        setRoutes(mappedRoutes);
      }
    } catch (err) {
      console.error('❌ Error fetching routes:', err);
      setError(err.message || 'Failed to load routes');
    } finally {
      setLoading(false);
    }
  };

  const fetchDrivers = async () => {
    try {
      const response = await getAllDrivers();
      if (response.success && response.data && response.data.drivers) {
        setAvailableDrivers(response.data.drivers);
      }
    } catch (err) {
      console.error('Error fetching drivers:', err);
    }
  };

  const fetchVehicles = async () => {
    try {
      // Keep only active vehicles to avoid assigning deleted records.
      const vehicles = await getAllVehicles({ isActive: true });
      setAvailableVehicles(Array.isArray(vehicles) ? vehicles : []);
    } catch (err) {
      console.error('Error fetching vehicles:', err);
      setAvailableVehicles([]);
    }
  };

  const filteredAndSortedRoutes = useMemo(() => {
    const filtered = filterRoutes(routes, filters);
    return sortRoutes(filtered, sortBy, sortOrder);
  }, [routes, filters, sortBy, sortOrder]);

  const summary = useMemo(() => {
    if (currentView === "routes") {
      return getRouteSummary(filteredAndSortedRoutes);
    } else if (currentView === "details" && selectedRoute) {
      return { route: selectedRoute };
    }
    return {};
  }, [currentView, filteredAndSortedRoutes, selectedRoute]);

  const handleGoBack = (view) => {
    setCurrentView(view);
    if (view === "routes") {
      setSelectedRoute(null);
    }
  };

  const handleViewRoute = (route) => {
    setSelectedRoute(route);
    setCurrentView("details");
  };

  const handleManageSuppliers = () => {
    setCurrentView("suppliers");
  };

  const handleAddSuppliers = () => {
    setShowSupplierModal(true);
  };

  const handleSupplierSubmit = (newSuppliers) => {
    if (!selectedRoute || !newSuppliers.length) return;
    // TODO: Implement supplier assignment API
    console.log('Assigning suppliers:', newSuppliers, 'to route:', selectedRoute.id);
    // Refresh routes to get updated supplier count
    fetchRoutes();
  };

  const handleCreateRoute = () => {
    setEditingRoute(null);
    setShowRouteModal(true);
  };

  const handleEditRoute = (route) => {
    setEditingRoute(route);
    setShowRouteModal(true);
  };

  const handleSubmitRoute = async (routeData) => {
    const payload = {
      ...routeData,
      routeNumber: String(routeData.routeNumber || "").trim(),
      routeName: String(routeData.routeName || "").trim(),
      area: String(routeData.area || "").trim(),
      description: String(routeData.description || "").trim(),
      // Ensure collectionDays is a valid array with trimmed strings
      collectionDays: Array.isArray(routeData.collectionDays)
        ? routeData.collectionDays.map(d => String(d || "").trim()).filter(d => d)
        : [],
    };

    // Remove empty optional ObjectId fields to avoid validation errors
    if (!payload.driverId || payload.driverId === "") delete payload.driverId;
    if (!payload.vehicleId || payload.vehicleId === "") delete payload.vehicleId;

    // Validate required fields before sending
    if (!payload.collectionDays || payload.collectionDays.length === 0) {
      throw new Error("At least one collection day must be selected");
    }

    console.log('📤 Sending route payload:', payload);

    try {
      if (editingRoute) {
        // Update existing route
        const response = await updateRouteAPI(editingRoute._id || editingRoute.id, payload);
        console.log('✅ Route updated:', response);
        if (response.success) {
          await fetchRoutes(); // Refresh list
        } else {
          throw new Error(response.message || 'Failed to update route');
        }
      } else {
        // Create new route
        const response = await createRouteAPI(payload);
        console.log('✅ Route created:', response);
        if (response.success) {
          await fetchRoutes(); // Refresh list
        } else {
          throw new Error(response.message || 'Failed to create route');
        }
      }
      setShowRouteModal(false);
      setEditingRoute(null);
    } catch (err) {
      console.error('❌ Error saving route. Full error:', err);
      // err may be: an Error object, or the API error body { success, message, error }
      const message =
        err?.message ||
        err?.error ||
        (editingRoute ? 'Failed to update route' : 'Error creating route');
      throw new Error(message);
    }
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      Active: "bg-[#e1f4ef] text-[#165E52]",
      Inactive: "bg-gray-100 text-gray-800",
      "Under Maintenance": "bg-yellow-100 text-yellow-800",
      Suspended: "bg-red-100 text-red-800",
    };
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[status] || "bg-gray-100 text-gray-800"
          }`}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#f8fdfc]">
      {/* Header */}
      <RouteHeader
        currentView={currentView}
        selectedRoute={selectedRoute}
        onGoBack={handleGoBack}
        onCreateRoute={handleCreateRoute}
        onEditRoute={handleEditRoute}
        onManageSuppliers={handleManageSuppliers}
      />

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Summary Cards */}
        {currentView === "routes" && (
          <RouteSummaryCards currentView={currentView} summary={summary} />
        )}

        {/* Routes List View */}
        {currentView === "routes" && (
          <>
            <RouteFilters
              filters={filters}
              setFilters={setFilters}
              regions={regions}
              sortBy={sortBy}
              setSortBy={setSortBy}
              sortOrder={sortOrder}
              setSortOrder={setSortOrder}
            />

            <div className="bg-white rounded-lg shadow-sm border border-[#cfece6] overflow-hidden">
              <div className="bg-[#01251F] text-white">
                <div className="grid grid-cols-8 gap-4 p-4 font-medium text-sm">
                  <div className="text-left">Route ID</div>
                  <div className="text-left">Route</div>
                  <div className="text-left">Driver</div>
                  <div className="text-center">Suppliers</div>
                  <div className="text-right">Last Month (kg)</div>
                  <div className="text-right">Distance</div>
                  <div className="text-center">Status</div>
                  <div className="text-center">View Details</div>
                </div>
              </div>

              <div className="divide-y divide-[#cfece6]">
                {filteredAndSortedRoutes.map((route) => (
                  <div
                    key={route.id}
                    className="grid grid-cols-8 gap-4 p-3 items-center hover:bg-gray-100 transition-colors"
                  >
                    <div className="font-mono text-sm text-black">{route.id}</div>
                    <div>
                      <p className="font-semibold text-black">{route.routeName}</p>
                    </div>
                    <div>
                      {route.assignedDriver ? (
                        <span className="text-sm text-black">
                          {route.assignedDriver}
                        </span>
                      ) : (
                        <span className="text-gray-400 italic text-sm">
                          Not assigned
                        </span>
                      )}
                    </div>
                    <div className="text-center">
                      <span className="font-medium text-black">{route.supplierCount}</span>
                    </div>
                    <div className="text-right text-sm">
                      <div className="font-medium text-black">
                        {route.lastMonthWeight || route.actualLoad || 0} kg
                      </div>
                      {route.lastMonthWeight !== route.actualLoad && (
                        <div className="text-gray-600">
                          Prev: {route.actualLoad || 0} kg
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-black">
                        {route.distance} km
                      </div>
                      {route.estimatedTime && (
                        <div className="text-xs text-gray-600">{route.estimatedTime}</div>
                      )}
                    </div>
                    <div className="flex justify-center">{getStatusBadge(route.status)}</div>
                    <div className="flex justify-center">
                      <button
                        onClick={() => handleViewRoute(route)}
                        className="text-[#165E52] hover:text-[#165E52] hover:bg-[#e1f4ef] p-2 rounded-full transition-colors"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {filteredAndSortedRoutes.length === 0 && (
                <div className="p-8 text-center text-[#165E52]">
                  <div className="h-12 w-12 text-[#cfece6] mx-auto mb-4 text-4xl">
                    🚛
                  </div>
                  <h3 className="text-lg font-medium text-[#165E52] mb-2">
                    No routes found
                  </h3>
                  <p className="text-[#165E52] opacity-80">
                    {filters.search ||
                      filters.status !== "All" ||
                      filters.region !== "All"
                      ? "Try adjusting your filters"
                      : "Create your first route to get started"}
                  </p>
                </div>
              )}

              {/* Showing X out of X routes - bg white */}
              <div className="mt-6 flex items-center justify-between text-sm text-gray-600 p-4 border-t border-[#cfece6] bg-white">
                <div>
                  Showing {filteredAndSortedRoutes.length} of {routes.length} routes
                </div>
              </div>
            </div>
          </>
        )}

        {/* Route Details View */}
        {currentView === "details" && selectedRoute && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-[#cfece6] p-6">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-[#e1f4ef] rounded-lg flex items-center justify-center">
                      <MapPin className="text-[#165E52]" size={18} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl font-semibold text-[#165E52]">
                          {selectedRoute.routeName}
                        </h2>
                        {getStatusBadge(selectedRoute.status)}
                      </div>
                      <p className="text-sm text-[#165E52] opacity-80 mt-1">
                        ID: <span className="font-mono">{selectedRoute.id}</span> •
                        Last updated: {selectedRoute.lastUpdated}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => handleEditRoute(selectedRoute)}
                    className="bg-[#01251F] hover:bg-[#01251F] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center gap-2"
                  >
                    <Edit size={16} />
                    Edit Route
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-[#cfece6]">
                <div>
                  <p className="text-sm text-[#165E52] opacity-80">Driver</p>
                  <p className="font-medium text-[#165E52]">
                    {selectedRoute.assignedDriver || "Not assigned"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-[#165E52] opacity-80">Distance</p>
                  <p className="font-medium text-[#165E52]">
                    {selectedRoute.distance} km
                  </p>
                </div>
                <div>
                  <p className="text-sm text-[#165E52] opacity-80">Last Month Weight</p>
                  <p className="font-medium text-[#165E52]">
                    {selectedRoute.lastMonthWeight ||
                      selectedRoute.actualLoad ||
                      0}{" "}
                    kg
                  </p>
                </div>
                <div>
                  <p className="text-sm text-[#165E52] opacity-80">Bag Counts</p>
                  <p className="font-medium text-[#165E52]">
                    {selectedRoute.bagCounts || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-[#cfece6] p-6">
              <h3 className="text-lg font-semibold text-[#165E52] mb-4">
                Route Map
              </h3>
              <div className="bg-[#f8fdfc] border border-[#cfece6] rounded-lg h-80 flex items-center justify-center">
                <div className="text-center p-6 w-full">
                  <div className="w-16 h-16 bg-[#e1f4ef] rounded-full flex items-center justify-center mx-auto mb-4">
                    <MapPin className="text-[#cfece6]" size={32} />
                  </div>
                  <p className="text-sm text-[#165E52] opacity-80 mt-4">
                    Interactive map showing full route will be implemented soon
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-[#cfece6] overflow-hidden">
              <div className="flex justify-between items-center p-6 border-b border-[#cfece6] bg-[#e1f4ef]">
                <h3 className="text-lg font-semibold text-[#165E52]">
                  Suppliers on Route
                </h3>
                <button
                  onClick={handleAddSuppliers}
                  className="bg-[#01251F] hover:bg-[#01251F] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center gap-2"
                >
                  <Users size={16} />
                  Add Suppliers
                </button>
              </div>

              {(selectedRoute.suppliers || []).length > 0 ? (
                <>
                  <div className="bg-[#01251F] text-white">
                    <div className="grid grid-cols-5 gap-4 p-4 font-medium text-sm">
                      <div className="text-left">Supplier ID</div>
                      <div className="text-left">Name</div>
                      <div className="text-left">Location</div>
                      <div className="text-center">Bag Count</div>
                      <div className="text-right">Last Month (kg)</div>
                    </div>
                  </div>

                  <div className="divide-y divide-[#cfece6]">
                    {selectedRoute.suppliers.map((supplier) => (
                      <div
                        key={supplier.id}
                        className="grid grid-cols-5 gap-4 p-3 items-center hover:bg-gray-100 transition-colors"
                      >
                        <div className="font-mono text-sm text-black">
                          {supplier.id}
                        </div>
                        <div>
                          <p className="font-semibold text-black">
                            {supplier.name}
                          </p>
                        </div>
                        <div className="text-sm text-black">
                          {supplier.location}
                        </div>
                        <div className="text-center">
                          <span className="font-medium text-black">
                            {supplier.bagCount || 0}
                          </span>
                        </div>
                        <div className="text-right text-sm">
                          <div className="font-medium text-black">
                            {supplier.lastMonthWeight ||
                              supplier.actualLoad ||
                              0}{" "}
                            kg
                          </div>
                          {supplier.lastMonthWeight &&
                            supplier.lastMonthWeight !== supplier.actualLoad && (
                              <div className="text-gray-600">
                                Prev: {supplier.actualLoad || 0} kg
                              </div>
                            )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-600 p-4 border-t border-[#cfece6] bg-white">
                    <div>
                      Showing {selectedRoute.suppliers.length} suppliers on this route
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-[#165E52]">
                  <Users size={48} className="mx-auto text-[#cfece6] mb-4" />
                  <p className="font-medium mb-2">
                    No suppliers assigned to this route yet
                  </p>
                  <button
                    onClick={handleAddSuppliers}
                    className="mt-2 text-[#165E52] hover:text-[#165E52] font-medium transition-colors duration-200"
                  >
                    Add First Supplier
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Route Modal */}
      <RouteModal
        isOpen={showRouteModal}
        onClose={() => {
          setShowRouteModal(false);
          setEditingRoute(null);
        }}
        onSubmit={handleSubmitRoute}
        route={editingRoute}
        availableDrivers={availableDrivers}
        availableVehicles={availableVehicles}
      />

      {/* Supplier Selection Modal */}
      <SupplierSelectionModal
        isOpen={showSupplierModal}
        onClose={() => setShowSupplierModal(false)}
        onSubmit={handleSupplierSubmit}
        currentSupplierIds={(selectedRoute?.suppliers || []).map(
          (supplier) => supplier.id
        )}
      />
    </div>
  );
}
