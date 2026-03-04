import { useState, useEffect, useRef } from "react";
import { Search, Users, Package } from "lucide-react";
import { getWeighedBagsForTripPaginated } from "../../../api/inventoryManager/bagWeight";
import {
  getTripWeighingSummary,
  getTripSummary,
  getBagWeightsBySession,
} from "../../../api/inventoryManager/leafWeight";
import PaginationControls from "../../../components/ui/PaginationControls";
import {
  useNavigate,
  Outlet,
  useMatch,
  useLocation,
  useParams,
} from "react-router-dom";

export default function DriverRoute() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const searchInputRef = useRef(null);
  const [bags, setBags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ totalSuppliers: 0, totalBags: 0 });
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const { routeId, routeName, driverName, currentView } = location.state || {};
  const { tripId } = useParams();

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchTerm(searchInput);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchInput]);

  // Keep search input focused after searchTerm changes (API call)
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchTerm]);

  useEffect(() => {
    if (!tripId) return;
    setLoading(true);
    setError(null);
    // Fetch stats summary for cards
    getTripWeighingSummary(tripId, currentView)
      .then((summary) => {
        setStats({
          totalSuppliers: summary.totalSuppliers ?? 0,
          totalBags: summary.totalBags ?? 0,
        });
      })
      .catch((err) => {
        setStats({ totalSuppliers: 0, totalBags: 0 });
        setError(err.message);
      });

    // Fetch bags for weighed view with pagination & search
    if (currentView === "weighed") {
      getWeighedBagsForTripPaginated(tripId, {
        page,
        size: 15,
        search: searchTerm,
      })
        .then((data) => {
          setBags(Array.isArray(data.content) ? data.content : []);
          setTotalPages(data.totalPages || 1);
          setTotalElements(data.totalElements || 0);
        })
        .catch((err) => {
          setBags([]);
          setTotalPages(1);
          setTotalElements(0);
          setError(err.message);
        })
        .finally(() => setLoading(false));
    } else if (currentView === "completed") {
      // Fetch sessionId from trip summary, then fetch paginated bag weights
      getTripSummary(tripId)
        .then((summary) => {
          const sessionId = summary.sessionId;
          console.log("Trip summary data:", summary);
          console.log("Session ID:", sessionId);
          if (!sessionId) {
            setBags([]);
            setTotalPages(1);
            setTotalElements(0);
            setLoading(false);
            return;
          }
          // status should be 'completed' for completed view
          getBagWeightsBySession(sessionId, "completed", page, searchTerm)
            .then((data) => {
              console.log("Completed view data:", data);
              setBags(Array.isArray(data.content) ? data.content : []);
              setTotalPages(data.totalPages || 1);
              setTotalElements(data.totalElements || 0);
            })
            .catch(() => {
              setBags([]);
              setTotalPages(1);
              setTotalElements(0);
            })
            .finally(() => setLoading(false));
        })
        .catch(() => {
          setBags([]);
          setTotalPages(1);
          setTotalElements(0);
          setLoading(false);
        });
    }
  }, [tripId, location.key, currentView, page, searchTerm]);

  const totalSuppliers = stats.totalSuppliers;
  const totalBags = stats.totalBags;
  const isBase = useMatch("/inventoryManager/empty_bags_weight/route/:routeId");

  // For weighed view: split bags into up to 3 columns, each with up to 5 bags
  const getColumns = (bagsList) => {
    const columns = [[], [], []];
    bagsList.forEach((bag, idx) => {
      const colIdx = idx % 3;
      if (columns[colIdx].length < 5) columns[colIdx].push(bag);
    });
    return columns.filter((col) => col.length > 0);
  };

  return (
    <div className="h-full bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-5">
        {/* Header */}
        <div className="bg-white p-4 shadow-sm">
          <h1 className="text-2xl font-bold" style={{ color: "#165E52" }}>
            Route Details
          </h1>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              label: "No of Suppliers",
              value: totalSuppliers,
              icon: <Users className="text-[#000000] w-5 h-5" />,
            },
            {
              label: "No of Bags",
              value: totalBags,
              icon: <Package className="text-[#000000] w-5 h-5" />,
            },
          ].map((card, idx) => (
            <div
              key={idx}
              className="bg-white px-4 py-3 rounded-lg shadow-md border transition-all duration-200 hover:shadow-lg"
              style={{ borderColor: "#000000" }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p
                    className="text-sm font-medium"
                    style={{ color: "#000000" }}
                  >
                    {card.label}
                  </p>
                  <p className="text-2xl font-bold text-[#000000]">
                    {card.value}
                  </p>
                </div>
                <div className="h-10 w-10 bg-[#f3f4f6] rounded-full flex items-center justify-center text-lg">
                  {card.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Route Info + Search (always rendered) */}
        <div
          className="bg-white rounded-lg shadow-sm p-4 border"
          style={{ borderColor: "#cfece6" }}
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label
                className="text-sm font-semibold mb-1 block"
                style={{ color: "#165E52" }}
              >
                Route No
              </label>
              <div className="text-lg font-bold text-[#01251F]">
                {routeId || "Route ID Not Available"}
              </div>
            </div>
            <div>
              <label
                className="text-sm font-semibold mb-1 block"
                style={{ color: "#165E52" }}
              >
                Route Name
              </label>
              <div className="text-lg font-bold text-gray-800">
                {routeName || "Route Name Not Available"}
              </div>
            </div>
            <div>
              <label
                className="text-sm font-semibold mb-1 block"
                style={{ color: "#165E52" }}
              >
                Driver Name
              </label>
              <div className="text-lg font-bold text-gray-800">
                {driverName || "Driver Name Not Available"}
              </div>
            </div>
            <div className="relative">
              <input
                ref={searchInputRef}
                type="text"
                value={searchInput}
                onChange={(e) => {
                  setPage(0); // Reset to first page on search
                  setSearchInput(e.target.value);
                }}
                placeholder="Search"
                className="w-full px-4 pr-10 py-2 text-sm border border-gray-300 rounded-lg bg-gray-50
             focus:outline-none focus:ring-2 focus:ring-[#165E52] focus:border-transparent"
              />
              <Search className="absolute text-gray-400 h-4 w-4 right-3 top-3" />
            </div>
          </div>
        </div>

        {/* Loading/Error messages (do not unmount search) */}
        {loading && isBase && (
          <div className="bg-white p-4 rounded shadow text-center text-gray-600">
            Loading bag details...
          </div>
        )}
        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded shadow text-center">
            {error}
          </div>
        )}

        {/* Supplier Action Bar */}
        <div
          className="bg-white rounded-lg shadow-sm p-4 border"
          style={{ borderColor: "#cfece6" }}
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <h2
                className="text-lg font-semibold"
                style={{ color: "#165E52" }}
              >
                Supplier Bags
              </h2>
            </div>
          </div>
        </div>

        {/* Main content changes by currentView */}
        {isBase && (
          <>
            {currentView === "weighed" ? (
              totalElements === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="text-green-600 font-semibold text-lg mb-4">
                    All Bags Weighed
                  </div>
                  <button
                    onClick={() => navigate(-1)}
                    className="px-6 py-2 rounded-lg font-medium bg-[#165E52] text-white hover:bg-[#11453f] transition"
                  >
                    Back
                  </button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {getColumns(bags).map((colBags, colIdx) => (
                      <div
                        key={colIdx}
                        className="bg-white rounded-lg border overflow-hidden"
                        style={{ borderColor: "#cfece6" }}
                      >
                        <div className="bg-[#01251F] text-white p-3 text-sm font-semibold text-center">
                          Bag Numbers
                        </div>
                        <div>
                          {colBags.map((bag, idx) => (
                            <div
                              key={idx}
                              onClick={() => {
                                navigate(`supplier/${bag.supplyRequestId}`, {
                                  state: {
                                    sessionId: bag.sessionId,
                                  },
                                });
                              }}
                              className="p-4 text-center hover:bg-gray-50 cursor-pointer transition font-medium text-[#01251F] border-b last:border-b-0"
                            >
                              {bag.bagNumber || bag.bagNo}
                            </div>
                          ))}
                          {colBags.length === 0 && (
                            <div className="p-8 text-center text-gray-500">
                              No bags found.
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <PaginationControls
                    page={page}
                    totalPages={totalPages}
                    totalElements={totalElements}
                    setPage={setPage}
                  />
                </>
              )
            ) : currentView === "completed" ? (
              totalElements === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="text-green-600 font-semibold text-lg mb-4">
                    No supplier summary found
                  </div>
                  <button
                    onClick={() => navigate(-1)}
                    className="px-6 py-2 rounded-lg font-medium bg-[#165E52] text-white hover:bg-[#11453f] transition"
                  >
                    Back
                  </button>
                </div>
              ) : (
                <>
                  <div
                    className="bg-white rounded-lg border overflow-hidden"
                    style={{ borderColor: "#cfece6" }}
                  >
                    <div className="bg-[#01251F] text-white grid grid-cols-4 gap-4 p-3 text-sm font-semibold text-center">
                      <div>Supplier ID</div>
                      <div>Supplier Name</div>
                      <div>Total Bags</div>
                      <div>Tare Weight</div>
                    </div>
                    <div className="divide-y divide-gray-100">
                      {bags.map((s, idx) => (
                        <div
                          key={idx}
                          className="grid grid-cols-4 gap-4 p-4 text-center"
                        >
                          <div className="font-medium text-[#01251F]">
                            {s.supplierId}
                          </div>
                          <div className="font-medium text-[#165E52]">
                            {s.supplierName}
                          </div>
                          <div className="font-medium">{s.bagTotal}</div>
                          <div className="font-medium">{s.tareWeight}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <PaginationControls
                    page={page}
                    totalPages={totalPages}
                    totalElements={totalElements}
                    setPage={setPage}
                  />
                </>
              )
            ) : null}
            <Outlet />
          </>
        )}
        {!isBase && <Outlet />}
      </div>
    </div>
  );
}
