import { useState, useEffect } from "react";
import { Search, Truck, CheckCircle } from "lucide-react";
import PaginationControls from "../../../components/ui/PaginationControls";
import { useNavigate, Outlet, useMatch, useLocation } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import { getTripsByFactoryAndStatus, getTripStatusCounts } from "../../../api/inventoryManager/leafWeight";

export default function Route() {
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentView, setCurrentView] = useState("arrived");
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
        // use server-side status filtered endpoint
        const status = currentView === "completed" ? "weighed" : currentView;
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
        console.log("Fetched trips (paged):", data);
      } catch (err) {
        console.error("Error fetching trip details:", err);
      }
    };

    loadTrips();
    return () => {
      mounted = false;
    };
  }, [factoryId, location.key, currentView, page, searchTerm]);

  // Load counts only when factoryId changes
  useEffect(() => {
    if (!factoryId) return;
    let mounted = true;
    const loadCounts = async () => {
      try {
        const data = await getTripStatusCounts(factoryId);
        if (!mounted) return;
        setCounts(data || null);
        console.log("Fetched trip counts:", data);
      } catch (err) {
        console.error("Error fetching trip counts:", err);
      }
    };

    loadCounts();
    return () => {
      mounted = false;
    };
  }, [factoryId, location.key]);

  // trips now contains server-side filtered content for the selected status
  const searchedTrips = trips;

  // debounce searchInput -> searchTerm to avoid calling API on every keystroke
  useEffect(() => {
    const t = setTimeout(() => setSearchTerm(searchInput.trim()), 500);
    return () => clearTimeout(t);
  }, [searchInput]);

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

  const handlePendingRoutesClick = () => {
    setCurrentView("pending");
    setPage(0);
    setSearchInput("");
    setSearchTerm("");
  };

  const isBase = useMatch("/inventoryManager/leaf_weight");

  return (
    <div className="h-full bg-gray-50 p-4">
      <div className="max-w-8xl mx-auto space-y-4">
        {isBase && (
          <>
            <div className="bg-white shadow-sm p-4 mb-6  transition-all duration-200">
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold" style={{ color: "#165E52" }}>
                  Leaf Weight
                </h1>
              </div>
            </div>

            {/* Top Statistics Cards - Arrived, Pending, Completed */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
                      {counts && typeof counts.arrivedCount === "number"
                        ? counts.arrivedCount
                        : 0}
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
                    <Truck className="text-black-600 w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Pending Routes Card - Clickable */}
              <div
                onClick={handlePendingRoutesClick}
                className={`bg-white px-4 py-3 rounded-lg shadow-md border  ${
                  currentView === "pending"
                    ? "border-black-500 bg-gray-200"
                    : "border-black-200 "
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p
                      className={`text-sm font-medium ${
                        currentView === "pending"
                          ? "text-black-800"
                          : "text-black-700"
                      }`}
                    >
                      Pending Routes
                    </p>
                    <p
                      className={`text-2xl font-bold ${
                        currentView === "pending"
                          ? "text-black-900"
                          : "text-black-800"
                      }`}
                    >
                      {counts && typeof counts.pendingCount === "number"
                        ? counts.pendingCount
                        : 0}
                    </p>
                    <p
                      className={`text-xs ${
                        currentView === "pending"
                          ? "text-black-700"
                          : "text-black-600"
                      }`}
                    >
                      {currentView === "pending"
                        ? "Currently viewing"
                        : "Click to view"}
                    </p>
                  </div>
                  <div
                    className={`h-10 w-10 rounded-full flex items-center justify-center ${
                      currentView === "pending" ? "bg-gray-200" : "bg-gray-200"
                    }`}
                  >
                    <CheckCircle className="text-black-600 w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Completed Routes Card - Clickable */}
              <div
                onClick={handleCompletedRoutesClick}
                className={`bg-white px-4 py-3 rounded-lg shadow-md border   ${
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
                      {counts && typeof counts.weighedCount === "number"
                        ? counts.weighedCount
                        : 0}
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
                    {currentView === "pending"
                      ? "Pending Routes"
                      : currentView === "completed"
                      ? "Completed Routes"
                      : "Arrived Routes"}
                  </h2>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search"
                    value={searchInput}
                    onChange={(e) => {
                      setSearchInput(e.target.value);
                      setPage(0); // reset to first page on search
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
                    currentView === "completed" ? "grid-cols-5" : "grid-cols-4"
                  }`}
                >
                  <div>Route No</div>
                  <div>Route Name</div>
                  <div>Driver Name</div>
                  <div>No of Bags</div>
                  {currentView === "completed" && <div>Gross Weight</div>}
                </div>
              </div>

              <div className="divide-y divide-gray-200">
                {searchedTrips && searchedTrips.length > 0 ? (
                  searchedTrips.map((trip, index) => {
                    let rowContent;
                    if (currentView === "completed") {
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
                          <div className="text-gray-900 text-center">
                            {trip.grossWeight || "-"}
                          </div>
                        </>
                      );
                    } else {
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
                    }
                    if (currentView === "pending") {
                      return (
                        <div
                          key={trip.tripId || index}
                          className="grid gap-4 p-4 items-center grid-cols-4 bg-white"
                        >
                          {rowContent}
                        </div>
                      );
                    } else if (currentView === "completed") {
                      return (
                        <div
                          key={trip.tripId || index}
                          className="grid gap-4 p-4 items-center grid-cols-5 hover:bg-gray-50 cursor-pointer"
                          onClick={() =>
                            navigate(`route/${trip.tripId}`, {
                              state: {
                                routeId: trip.routeId,
                                routeName: trip.routeName,
                                driverName: trip.driverName,
                                currentView,
                              },
                            })
                          }
                        >
                          {rowContent}
                        </div>
                      );
                    } else if (currentView === "arrived") {
                      return (
                        <div
                          key={trip.tripId || index}
                          className="grid gap-4 p-4 items-center grid-cols-4 hover:bg-gray-50 cursor-pointer"
                          onClick={() =>
                            navigate(`route/${trip.tripId}`, {
                              state: {
                                routeId: trip.routeId,
                                routeName: trip.routeName,
                                driverName: trip.driverName,
                                currentView,
                                sessionId: trip.sessionId,
                              },
                            })
                          }
                        >
                          {rowContent}
                        </div>
                      );
                    }
                  })
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    No trips found.
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
