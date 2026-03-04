import React, { useState, useMemo, useEffect } from "react";
import {
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  User,
  Truck,
  Phone,
  MapPin,
  FileText,
  Loader,
  Edit,
  Trash2,
} from "lucide-react";
import DriverHeader from "./DriverHeader";
import DriverFilters from "./DriverFilters";
import DriverSummaryCards from "./DriverSummaryCards";
import DriverModal from "./DriverModal";
import AssignmentModal from "./AssignmentModal";
import {
  getAllDrivers,
  createDriver as createDriverAPI,
  updateDriver as updateDriverAPI,
  deleteDriver as deleteDriverAPI,
  assignRoute as assignRouteAPI,
} from "../../../api/driver";
import {
  getDriverSummary,
  filterDrivers,
  sortDrivers,
} from "./driverUtils";

const ACCENT_COLOR = "#01251F";

const DriverManagement = () => {
  const [currentView, setCurrentView] = useState("list"); // 'list', 'profile', 'assign'
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [showDriverModal, setShowDriverModal] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);

  // Driver data
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter and sort state
  const [filters, setFilters] = useState({
    search: "",
    status: "All",
  });
  const [sortBy, _setSortBy] = useState("name");
  const [sortOrder, _setSortOrder] = useState("asc");

  // Fetch drivers on mount
  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllDrivers();
      if (response.success) {
        setDrivers(response.data.drivers);
      }
    } catch (err) {
      console.error('Error fetching drivers:', err);
      setError(err.message || 'Failed to load drivers');
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort drivers
  const filteredAndSortedDrivers = useMemo(() => {
    const filtered = filterDrivers(drivers, filters);
    return sortDrivers(filtered, sortBy, sortOrder);
  }, [drivers, filters, sortBy, sortOrder]);

  // Calculate summary data
  const summary = useMemo(() => {
    if (currentView === "list") {
      return getDriverSummary(filteredAndSortedDrivers);
    } else if (currentView === "profile" && selectedDriver) {
      return { driver: selectedDriver };
    }
    return {};
  }, [currentView, filteredAndSortedDrivers, selectedDriver]);

  // Navigation handlers
  const handleGoBack = (view) => {
    setCurrentView(view);
    if (view === "list") {
      setSelectedDriver(null);
    }
  };

  const handleViewDriver = (driver) => {
    setSelectedDriver(driver);
    setCurrentView("profile");
  };

  // Driver operations
  const handleCreateDriver = () => {
    setEditingDriver(null);
    setShowDriverModal(true);
  };

  const handleEditDriver = (driver) => {
    setEditingDriver(driver);
    setShowDriverModal(true);
  };

  const handleDeleteDriver = async (driver) => {
    if (!window.confirm(`Are you sure you want to delete driver "${driver.name}"?`)) {
      return;
    }

    try {
      const response = await deleteDriverAPI(driver._id);
      if (response.success) {
        setDrivers((prev) => prev.filter((d) => d._id !== driver._id));
        // If viewing deleted driver, go back to list
        if (selectedDriver?._id === driver._id) {
          setCurrentView('list');
          setSelectedDriver(null);
        }
      }
    } catch (err) {
      console.error('Error deleting driver:', err);
      alert(err.message || 'Failed to delete driver');
    }
  };

  const handleDriverSubmit = async (driverData) => {
    try {
      if (editingDriver) {
        // Update existing driver
        const response = await updateDriverAPI(editingDriver._id, driverData);
        if (response.success) {
          setDrivers((prev) =>
            prev.map((d) =>
              d._id === editingDriver._id ? response.data.driver : d
            )
          );
        }
      } else {
        // Create new driver
        const response = await createDriverAPI(driverData);
        if (response.success) {
          setDrivers((prev) => [...prev, response.data.driver]);
        }
      }
      setShowDriverModal(false);
      setEditingDriver(null);
    } catch (err) {
      console.error('Error saving driver:', err);
      alert(err.message || 'Failed to save driver');
    }
  };

  // Assignment operations
  const handleQuickAssign = () => {
    setShowAssignmentModal(true);
  };

  const handleAssignRoute = async (assignmentData) => {
    try {
      const response = await assignRouteAPI(assignmentData.driverId, {
        routeId: assignmentData.route.id || assignmentData.route,
        routeName: assignmentData.route.name || assignmentData.route,
      });
      if (response.success) {
        setDrivers((prev) =>
          prev.map((d) =>
            d._id === assignmentData.driverId ? response.data.driver : d
          )
        );
      }
      setShowAssignmentModal(false);
    } catch (err) {
      console.error('Error assigning route:', err);
      alert(err.message || 'Failed to assign route');
    }
  };

  const getLicenseStatusIcon = (status) => {
    return status === "valid" ? (
      <CheckCircle size={16} className="text-emerald-500" />
    ) : (
      <AlertTriangle size={16} className="text-red-500" />
    );
  };

  const availableDrivers = drivers.filter(
    (d) => d.isActive && d.status === "Available"
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <DriverHeader
        currentView={currentView}
        selectedDriver={selectedDriver}
        onGoBack={handleGoBack}
        onCreateDriver={handleCreateDriver}
        onQuickAssign={handleQuickAssign}
      />

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <Loader className="h-8 w-8 animate-spin text-emerald-600" />
            <span className="ml-3 text-gray-600">Loading drivers...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <p className="text-red-700">{error}</p>
            </div>
            <button
              onClick={fetchDrivers}
              className="mt-2 text-sm text-red-600 hover:text-red-700 underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Main Content */}
        {!loading && !error && (
          <>

        {/* Summary Cards */}
        <DriverSummaryCards currentView={currentView} summary={summary} />

        {/* Filters */}
        {currentView === "list" && (
          <DriverFilters filters={filters} onFiltersChange={setFilters} />
        )}

        {/* Driver List Tab */}
        {currentView === "list" && (
          <div className="space-y-6">
            {/* Drivers Table */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
              <div style={{ backgroundColor: ACCENT_COLOR, color: "#fff" }}>
                <div className="grid grid-cols-6 gap-4 p-4 font-medium text-sm text-center">
                  <div>ID</div>
                  <div>Name</div>
                  <div>Vehicle Number</div>
                  <div>Route</div>
                  <div>Status</div>
                  <div>Actions</div>
                </div>
              </div>
              <div className="divide-y divide-gray-200">
                {filteredAndSortedDrivers.map((driver, index) => (
                  <div
                    key={driver._id}
                    className="grid grid-cols-6 gap-4 p-4 items-center hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 text-center"
                  >
                    <div>
                      <span
                        className="font-semibold text-sm px-3 py-1 rounded-full border"
                        style={{
                          backgroundColor: "#e1f4ef",
                          color: "#165e52",
                          borderColor: "#165e52",
                        }}
                      >
                        DRV{String(index + 1).padStart(3, '0')}
                      </span>
                    </div>
                    <div className="font-medium text-black text-sm">
                      {driver.name}
                    </div>
                    <div className="text-sm text-black font-medium">
                      {driver.vehicleNo || 'Not assigned'}
                    </div>
                    <div className="text-sm text-black font-medium">
                      {driver.assignedRoutes && driver.assignedRoutes.length > 0 ? (
                        driver.assignedRoutes.slice(0, 1).map((route, i) => (
                          <span key={i}>{route.routeName || route}</span>
                        ))
                      ) : (
                        <span className="text-gray-400 italic">
                          Not assigned
                        </span>
                      )}
                    </div>
                    <div>
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${
                          driver.status === 'Available'
                            ? 'bg-green-100 text-green-700'
                            : driver.status === 'On Route'
                            ? 'bg-blue-100 text-blue-700'
                            : driver.status === 'On Leave'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {driver.status}
                      </span>
                    </div>
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => handleViewDriver(driver)}
                        className="p-2 rounded-full transition-colors border hover:bg-emerald-50"
                        style={{
                          border: `1.5px solid ${ACCENT_COLOR}`,
                          color: ACCENT_COLOR,
                        }}
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEditDriver(driver)}
                        className="p-2 rounded-full transition-colors border border-blue-500 text-blue-500 hover:bg-blue-50"
                        title="Edit Driver"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteDriver(driver)}
                        className="p-2 rounded-full transition-colors border border-red-500 text-red-500 hover:bg-red-50"
                        title="Delete Driver"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {filteredAndSortedDrivers.length === 0 && (
                  <div className="p-12 text-center text-gray-500">
                    <div className="bg-gray-100 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                      <User className="h-10 w-10 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No drivers found
                    </h3>
                    <p className="text-gray-600">
                      Try adjusting your search or filter criteria
                    </p>
                  </div>
                )}
              </div>
              {filteredAndSortedDrivers.length > 0 && (
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-700">
                      <span>
                        Showing <span className="font-medium">1</span> to{" "}
                        <span className="font-medium">
                          {filteredAndSortedDrivers.length}
                        </span>{" "}
                        of{" "}
                        <span className="font-medium">
                          {drivers.length}
                        </span>{" "}
                        drivers
                      </span>
                      <span className="ml-4 text-xs text-gray-500">
                        (Filter: {filters.status || "All"})
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Driver Profile Tab */}
        {currentView === "profile" && selectedDriver && (
          <div className="space-y-6">
            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => handleEditDriver(selectedDriver)}
                className="px-4 py-2 rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Edit size={16} />
                Edit Driver
              </button>
              <button
                onClick={() => handleDeleteDriver(selectedDriver)}
                className="px-4 py-2 rounded-lg font-medium text-white bg-red-600 hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <Trash2 size={16} />
                Delete Driver
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Personal Information */}
              <div className="bg-white rounded-lg shadow-md border border-emerald-200 p-6">
                <h3 className="text-lg font-semibold text-emerald-900 mb-4 flex items-center gap-2">
                  <User size={20} className="text-emerald-500" />
                  Personal Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-emerald-700">
                      Full Name
                    </label>
                    <p className="text-emerald-900">{selectedDriver.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-emerald-700">
                      NIC Number
                    </label>
                    <p className="font-mono text-emerald-900">
                      {selectedDriver.nic}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-emerald-700">
                      Contact Number
                    </label>
                    <p className="text-emerald-900 flex items-center gap-2">
                      <Phone size={14} />
                      {selectedDriver.phone}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-emerald-700">
                      Email
                    </label>
                    <p className="text-emerald-900">
                      {selectedDriver.email}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-emerald-700">
                      Address
                    </label>
                    <p className="text-emerald-900 flex items-center gap-2">
                      <MapPin size={14} />
                      {selectedDriver.address}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-emerald-700">
                      Experience
                    </label>
                    <p className="text-emerald-900">{selectedDriver.experience || 0} years</p>
                  </div>
                </div>
              </div>

              {/* Vehicle & License Information */}
              <div className="bg-white rounded-lg shadow-md border border-emerald-200 p-6">
                <h3 className="text-lg font-semibold text-emerald-900 mb-4 flex items-center gap-2">
                  <Truck size={20} className="text-emerald-500" />
                  Vehicle & License
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-emerald-700">
                      Vehicle Number
                    </label>
                    <p className="font-mono text-emerald-900 text-lg">
                      {selectedDriver.vehicleNo || 'Not assigned'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-emerald-700">
                      License Number
                    </label>
                    <p className="font-mono text-emerald-900">
                      {selectedDriver.licenseNo}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-emerald-700">
                      License Status
                    </label>
                    <div className="flex items-center gap-2">
                      {getLicenseStatusIcon(
                        selectedDriver.licenseExpiry && new Date(selectedDriver.licenseExpiry) > new Date() 
                          ? "valid" 
                          : "expired"
                      )}
                      <span
                        className={`font-medium ${
                          selectedDriver.licenseExpiry && new Date(selectedDriver.licenseExpiry) > new Date()
                            ? "text-emerald-600"
                            : "text-red-600"
                        }`}
                      >
                        {selectedDriver.licenseExpiry && new Date(selectedDriver.licenseExpiry) > new Date()
                          ? "Valid"
                          : "Expired"}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-emerald-700">
                      License Expiry
                    </label>
                    <p className="text-emerald-900">
                      {selectedDriver.licenseExpiry 
                        ? new Date(selectedDriver.licenseExpiry).toLocaleDateString()
                        : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-emerald-700">
                      Status
                    </label>
                    <p className="text-emerald-900 font-medium">
                      {selectedDriver.status || 'Available'}
                    </p>
                  </div>
                  <div className="pt-2">
                    <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors duration-200">
                      <FileText size={16} />
                      Download License Copy
                    </button>
                  </div>
                </div>
              </div>

              {/* Route Assignments */}
              <div className="bg-white rounded-lg shadow-md border border-emerald-200 p-6">
                <h3 className="text-lg font-semibold text-emerald-900 mb-4 flex items-center gap-2">
                  <MapPin size={20} className="text-emerald-500" />
                  Route Assignments
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-emerald-700">
                      Current Routes
                    </label>
                    {selectedDriver.assignedRoutes && selectedDriver.assignedRoutes.length > 0 ? (
                      <div className="space-y-2 mt-2">
                        {selectedDriver.assignedRoutes.map((route, index) => (
                          <div
                            key={index}
                            className="bg-emerald-50 border border-emerald-200 rounded-lg p-3"
                          >
                            <p className="font-medium text-emerald-800">
                              {route.routeName || route}
                            </p>
                            {route.assignedDate && (
                              <p className="text-xs text-emerald-600 mt-1">
                                Assigned: {new Date(route.assignedDate).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-emerald-500 italic mt-2">
                        No routes currently assigned
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-emerald-700">
                      Current Status
                    </label>
                    <div className="flex items-center gap-2 mt-1">
                      {selectedDriver.status === 'Available' ? (
                        <>
                          <CheckCircle size={16} className="text-emerald-500" />
                          <span className="text-emerald-600 font-medium">
                            {selectedDriver.status}
                          </span>
                        </>
                      ) : (
                        <>
                          <XCircle size={16} className="text-amber-500" />
                          <span className="text-amber-600 font-medium">
                            {selectedDriver.status}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="pt-2 space-y-2">
                    <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200">
                      Assign New Route
                    </button>
                    <button className="w-full border border-emerald-300 hover:bg-emerald-50 text-emerald-700 px-4 py-2 rounded-lg font-medium transition-colors duration-200">
                      Edit Assignments
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Daily Assignments Tab */}
        {currentView === "assign" && (
          <div className="space-y-6">
            {/* Date Header */}
            <div className="bg-white rounded-lg shadow-md border border-emerald-200 p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-emerald-900">
                    Daily Route Assignments
                  </h3>
                  <p className="text-emerald-600 mt-1">
                    Assign drivers to routes for today's collections
                  </p>
                </div>
                <div className="text-sm text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg">
                  Today:{" "}
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
              </div>
            </div>

            {/* Available Drivers */}
            <div className="bg-white rounded-lg shadow-md border border-emerald-200 p-6">
              <h3 className="text-lg font-semibold text-emerald-900 mb-4">
                Available Drivers Today
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableDrivers.map((driver) => (
                  <div
                    key={driver._id}
                    className="border border-emerald-200 rounded-lg p-4 hover:bg-emerald-50 transition-colors duration-150"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                          <User size={18} className="text-emerald-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-emerald-900">
                            {driver.name}
                          </h4>
                          <p className="text-sm text-emerald-600">
                            {driver.vehicleNo || 'No vehicle'}
                          </p>
                        </div>
                      </div>
                      <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                    </div>

                    <div className="mt-3">
                      <p className="text-sm text-emerald-600">
                        Current Routes:
                      </p>
                      {driver.assignedRoutes && driver.assignedRoutes.length > 0 ? (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {driver.assignedRoutes.map((route, index) => (
                            <span
                              key={index}
                              className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded text-xs"
                            >
                              {route.routeName || route}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400 mt-1">
                          No assignments
                        </p>
                      )}
                    </div>

                    <button className="w-full mt-3 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded text-sm font-medium transition-colors duration-200">
                      Assign Route
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Driver Modal */}
        <DriverModal
          isOpen={showDriverModal}
          onClose={() => setShowDriverModal(false)}
          onSubmit={handleDriverSubmit}
          driver={editingDriver}
        />

        {/* Assignment Modal */}
        <AssignmentModal
          isOpen={showAssignmentModal}
          onClose={() => setShowAssignmentModal(false)}
          onSubmit={handleAssignRoute}
          availableDrivers={availableDrivers}
        />
          </>
        )}
      </div>
    </div>
  );
};

export default DriverManagement;
