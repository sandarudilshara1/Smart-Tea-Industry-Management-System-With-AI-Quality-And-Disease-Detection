import React, { useState, useEffect } from "react";
import { Search, Truck, Package, CheckCircle } from "lucide-react";
import PaginationControls from "../../../components/ui/PaginationControls";
import { useNavigate, Outlet, useMatch, useLocation } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import { getTripsByFactoryAndStatus, getTripStatusCounts } from "../../../api/inventoryManager/leafWeight";

export default function Route() {
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentView, setCurrentView] = useState("weighed");
  const [trips, setTrips] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [counts, setCounts] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const factoryId = user?.factoryId;

  // Load trips when factoryId, view, page, searchTerm or location changes
  useEffect(() => {
    if (!factoryId) return;
    let mounted = true;
    const loadTrips = async () => {
      try {
        // status: map 'completed' view to the server's 'weighed' status if needed
        const status = currentView;
        const data = await getTripsByFactoryAndStatus(
          factoryId,
          status,
          page,
          searchTerm
        );
        if (!mounted) return;
        // backend returns pageable response with `content` and pagination meta
        setTrips(Array.isArray(data.content) ? data.content : []);
        setTotalPages(
          typeof data.totalPages === "number" ? data.totalPages : 0
        );
        setTotalElements(
          typeof data.totalElements === "number" ? data.totalElements : 0
        );
        console.log("Fetched bag weight trips (paged):", data);
      } catch (err) {
        console.error("Error fetching trip details:", err);
      }
    };

    loadTrips();
    return () => {
      mounted = false;
    };
  }, [factoryId, location.key, currentView, page, searchTerm]);

  // fetch status counts separately when factoryId changes
  useEffect(() => {
    if (!factoryId) return;
    let mounted = true;
    const loadCounts = async () => {
      try {
        const data = await getTripStatusCounts(factoryId);
        if (!mounted) return;
        setCounts(data || null);
      } catch (err) {
        console.error("Error fetching trip counts:", err);
      }
    };

    loadCounts();
    return () => {
      mounted = false;
    };
  }, [factoryId, location.key]);

  // trips is now server-side filtered/paged content for the selected status
  const searchedTrips = trips;

  // debounce searchInput -> searchTerm to avoid calling API on every keystroke
  useEffect(() => {
    const t = setTimeout(() => setSearchTerm(searchInput.trim()), 500);
    return () => clearTimeout(t);
  }, [searchInput]);

  const handleWeighedRoutesClick = () => {
    setCurrentView("weighed");
    setPage(0);
    setSearchInput("");
    setSearchTerm("");
  };

  const handleArrivedRoutesClick = () => {
    setCurrentView("arrived");
    setPage(0);
    setSearchInput("");
    setSearchTerm("");
  };

  const handleCompletedRoutesClick = () => {
    setCurrentView("completed");
    setPage(0);
    setSearchInput("");
    setSearchTerm("");
  };

  const isBase = useMatch("/inventoryManager/empty_bags_weight");

  return (
    <div className="h-full bg-gray-50 p-4">
      <div className="max-w-8xl mx-auto space-y-4">
        {isBase && (
          <>
            <div className="bg-white shadow-sm p-4 mb-6  transition-all duration-200">
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold" style={{ color: "#165E52" }}>
                  Bag Weight
                </h1>
              </div>
            </div>

            {/* Top Statistics Cards - Weighed, Arrived, Completed */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* Weighed Routes Card - Clickable */}
              <div
                onClick={handleWeighedRoutesClick}
                className={`bg-white px-4 py-3 rounded-lg shadow-md border   ${
                  currentView === "weighed"
                    ? "border-black-500 bg-gray-200"
                    : "border-black-200 "
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p
                      className={`text-sm font-medium ${
                        currentView === "weighed"
                          ? "text-black-800"
                          : "text-black-700"
                      }`}
                    >
                      Weighed Routes
                    </p>
                    <p
                      className={`text-2xl font-bold ${
                        currentView === "weighed"
                          ? "text-black-900"
                          : "text-black-800"
                      }`}
                    >
                      {counts?.weighedCount ?? 0}
                    </p>
                    <p
                      className={`text-xs ${
                        currentView === "weighed"
                          ? "text-black-700"
                          : "text-black-600"
                      }`}
                    >
                      {currentView === "weighed"
                        ? "Currently viewing"
                        : "Click to view"}
                    </p>
                  </div>
                  <div
                    className={`h-10 w-10 rounded-full flex items-center justify-center ${
                      currentView === "weighed" ? "bg-gray-200" : "bg-gray-200"
                    }`}
                  >
                    <Truck className="text-black-600 w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Arrived Routes Card - Clickable */}
              <div
                onClick={handleArrivedRoutesClick}
                className={`bg-white px-4 py-3 rounded-lg shadow-md border   ${
                  currentView === "arrived"
                    ? "border-black-500 bg-gray-200"
                    : "border-black-200 "
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p
                      className={`text-sm font-medium ${
                        currentView === "arrived"
                          ? "text-black-800"
                          : "text-black-700"
                      }`}
                    >
                      Arrived Routes
                    </p>
                    <p
                      className={`text-2xl font-bold ${
                        currentView === "arrived"
                          ? "text-black-900"
                          : "text-black-800"
                      }`}
                    >
                      {counts?.arrivedCount ?? 0}
                    </p>
                    <p
                      className={`text-xs ${
                        currentView === "arrived"
                          ? "text-black-700"
                          : "text-black-600"
                      }`}
                    >
                      {currentView === "arrived"
                        ? "Currently viewing"
                        : "Click to view"}
                    </p>
                  </div>
                  <div
                    className={`h-10 w-10 rounded-full flex items-center justify-center ${
                      currentView === "arrived" ? "bg-gray-200" : "bg-gray-200"
                    }`}
                  >
                    <Package className="text-black-600 w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Completed Routes Card - Clickable */}
              <div
                onClick={handleCompletedRoutesClick}
                className={`bg-white px-4 py-3 rounded-lg shadow-md border  ${
                  currentView === "completed"
                    ? "border-black-500 bg-gray-200"
                    : "border-black-200 "
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p
                      className={`text-sm font-medium ${
                        currentView === "completed"
                          ? "text-black-800"
                          : "text-black-700"
                      }`}
                    >
                      Completed Routes
                    </p>
                    <p
                      className={`text-2xl font-bold ${
                        currentView === "completed"
                          ? "text-black-900"
                          : "text-black-800"
                      }`}
                    >
                      {counts?.completedCount ?? 0}
                    </p>
                    <p
                      className={`text-xs ${
                        currentView === "completed"
                          ? "text-black-700"
                          : "text-black-600"
                      }`}
                    >
                      {currentView === "completed"
                        ? "Currently viewing"
                        : "Click to view"}
                    </p>
                  </div>
                  <div
                    className={`h-10 w-10 rounded-full flex items-center justify-center ${
                      currentView === "completed"
                        ? "bg-gray-200"
                        : "bg-gray-200"
                    }`}
                  >
                    <CheckCircle className="text-black-600 w-5 h-5" />
                  </div>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6 ">
              <div className="flex justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {currentView === "weighed"
                      ? "Weighed Routes"
                      : currentView === "arrived"
                      ? "Arrived Routes"
                      : "Completed Routes"}
                  </h2>
                  {currentView === "weighed" && (
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      Weighed
                    </span>
                  )}
                  {currentView === "arrived" && (
                    <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      Arrived
                    </span>
                  )}
                  {currentView === "completed" && (
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      Completed
                    </span>
                  )}
                </div>

                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search"
                    value={searchInput}
                    onChange={(e) => {
                      setSearchInput(e.target.value);
                      setPage(0);
                    }}
                    className="w-64 pl-4 pr-10 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                  />
                  <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Routes Table */}
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden border-emerald-200 duration-200">
              <div className="bg-[#01251F] text-white">
                <div
                  className={`grid gap-4 p-3 font-medium text-center ${
                    currentView === "completed"
                      ? "grid-cols-5"
                      : currentView === "weighed"
                      ? "grid-cols-4"
                      : "grid-cols-4"
                  }`}
                >
                  <div>Route No</div>
                  <div>Route Name</div>
                  <div>Driver Name</div>
                  <div>No of Bags</div>
                  {currentView === "completed" && (
                    <>
                      <div>Bag Weight</div>
                    </>
                  )}
                </div>
              </div>

              <div className="divide-y divide-gray-200">
                {searchedTrips.length > 0 ? (
                  searchedTrips.map((trip, index) => {
                    let rowContent;
                    if (currentView === "weighed") {
                      rowContent = (
                        <>
                          <div className="font-medium text-gray-900 text-center">
                            {trip.routeId}
                          </div>
                          <div className="text-gray-600 text-center">
                            {trip.routeName}
                          </div>
                          <div className="text-gray-600 text-center">
                            {trip.driverName}
                          </div>
                          <div className="text-gray-900 font-medium text-center">
                            {trip.bagCount}
                          </div>
                        </>
                      );
                    } else if (currentView === "arrived") {
                      rowContent = (
                        <>
                          <div className="font-medium text-gray-900 text-center">
                            {trip.routeId}
                          </div>
                          <div className="text-gray-600 text-center">
                            {trip.routeName}
                          </div>
                          <div className="text-gray-600 text-center">
                            {trip.driverName}
                          </div>
                          <div className="text-gray-900 font-medium text-center">
                            {trip.bagCount}
                          </div>
                        </>
                      );
                    } else if (currentView === "completed") {
                      rowContent = (
                        <>
                          <div className="font-medium text-gray-900 text-center">
                            {trip.routeId}
                          </div>
                          <div className="text-gray-600 text-center">
                            {trip.routeName}
                          </div>
                          <div className="text-gray-600 text-center">
                            {trip.driverName}
                          </div>
                          <div className="text-gray-900 font-medium text-center">
                            {trip.bagCount}
                          </div>
                          <div className="text-emerald-700 font-medium text-center">
                            {trip.totalTareWeight || "-"}
                          </div>
                        </>
                      );
                    }
                    const isArrived = currentView === "arrived";
                    return (
                      <div
                        key={trip.id || index}
                        className={`grid gap-4 p-4 items-center ${
                          currentView === "completed"
                            ? "grid-cols-5"
                            : currentView === "weighed"
                            ? "grid-cols-4"
                            : "grid-cols-4"
                        } ${
                          !isArrived ? "hover:bg-gray-50 cursor-pointer" : ""
                        }`}
                        {...(!isArrived && {
                          onClick: () =>
                            navigate(`route/${trip.tripId}`, {
                              state: {
                                routeId: trip.routeId,
                                routeName: trip.routeName,
                                driverName: trip.driverName,
                                currentView,
                                sessionId: trip.sessionId,
                              },
                            }),
                        })}
                        style={isArrived ? { cursor: "default" } : {}}
                      >
                        {rowContent}
                      </div>
                    );
                  })
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    No {currentView} routes found matching your search.
                  </div>
                )}
              </div>
            </div>
            {/* Pagination Controls */}
            <PaginationControls
              page={page}
              totalPages={totalPages}
              totalElements={totalElements}
              setPage={setPage}
            />
          </>
        )}
        <Outlet />
      </div>
    </div>
  );
}
