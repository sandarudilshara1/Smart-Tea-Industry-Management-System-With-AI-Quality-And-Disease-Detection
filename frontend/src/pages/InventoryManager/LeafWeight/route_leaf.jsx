import { useState, useEffect } from "react";
import { Search, Users, Package, Scale } from "lucide-react";
import { useNavigate, Outlet, useMatch, useLocation, useParams } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import PaginationControls from "../../../components/ui/PaginationControls";
import { getTripDetails, getPaginatedBagsForTrip, getBagWeightsBySession, createWeighingSession, getTripSummary, getTripWeighingSummary } from "../../../api/inventoryManager/leafWeight";

export default function DriverRoute() {
  const [searchTerm, setSearchTerm] = useState("");
  const [bags, setBags] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [tripDetails, setTripDetails] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [sessionUserId, setSessionUserId] = useState(null);
  const [supplierSummary, setSupplierSummary] = useState([]);
  const [cardStats, setCardStats] = useState(null);
  const [confirmPopup, setConfirmPopup] = useState({ open: false, supplierBags: null });
  const navigate = useNavigate();
  const location = useLocation();
  const { routeId, routeName, driverName, currentView } = location.state || {};
  const view = currentView;
  const { tripId } = useParams();
  const { user } = useAuth();

  // Always fetch latest data when this page is shown or navigated to
  useEffect(() => {
    if (!tripId) return;
    let mounted = true;
    const load = async () => {
      try {
        const data = await getTripDetails(tripId);
        if (mounted) setTripDetails(data);
      } catch (err) {
        if (mounted) setTripDetails(null);
        console.error("Error fetching trip details for tripId", tripId, err);
      }

      try {
        const summaryData = await getTripSummary(tripId);
        console.log("Trip summary data:", summaryData);
        if (!mounted) return;
        setCardStats(summaryData || null);
        setSessionId(summaryData?.sessionId || null);
        setSessionUserId(summaryData?.userId || null);
      } catch (err) {
        setCardStats(null);
        setSessionId(null);
        setSessionUserId(null);
        console.error("Error fetching trip summary for tripId", tripId, err);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [location.key, tripId]);

  // Fetch paginated bags for arrived view (depends on search/page)
  useEffect(() => {
    if (!tripDetails || !tripId || view !== "arrived") return;
    let mounted = true;
    const loadBags = async () => {
      try {
        const bagsPage = await getPaginatedBagsForTrip(
          tripId,
          page,
          searchTerm
        );
        if (!mounted) return;
        setBags(Array.isArray(bagsPage.content) ? bagsPage.content : []);
        setTotalPages(
          typeof bagsPage.totalPages === "number" ? bagsPage.totalPages : 0
        );
        setTotalElements(
          typeof bagsPage.totalElements === "number"
            ? bagsPage.totalElements
            : 0
        );
      } catch (err) {
        if (mounted) setBags([]);
        setTotalPages(0);
        setTotalElements(0);
        console.error("Error fetching bags for tripId", tripId, err);
      }
      if (mounted) setSupplierSummary([]);
    };
    loadBags();
    return () => {
      mounted = false;
    };
  }, [tripDetails, tripId, view, page, searchTerm]);

  // Completed view: fetch paginated supplier summary and weighing summary for cards
  useEffect(() => {
    if (!tripDetails || !tripId || view === "arrived") return;
    let mounted = true;
    const loadCompleted = async () => {
      try {
        const [supplierDataPage, weighSummary] = await Promise.all([
          sessionId
            ? getBagWeightsBySession(sessionId, "weighed", page, searchTerm )
            : Promise.resolve({ content: [], totalPages: 0, totalElements: 0 }),
          getTripWeighingSummary(tripId, "weighed"),
        ]);
        if (!mounted) return;
        setSupplierSummary(
          Array.isArray(supplierDataPage.content)
            ? supplierDataPage.content
            : []
        );
        setTotalPages(
          typeof supplierDataPage.totalPages === "number"
            ? supplierDataPage.totalPages
            : 0
        );
        setTotalElements(
          typeof supplierDataPage.totalElements === "number"
            ? supplierDataPage.totalElements
            : 0
        );
        setCardStats(weighSummary || null);
      } catch (err) {
        if (mounted) setSupplierSummary([]);
        setTotalPages(0);
        setTotalElements(0);
        setCardStats(null);
        console.error(
          "Error fetching supplier/weight summary for tripId",
          tripId,
          err
        );
      }
      if (mounted) setBags([]);
    };
    loadCompleted();
    return () => {
      mounted = false;
    };
  }, [tripDetails, sessionId, tripId, view, page, searchTerm]);

  // Summary cards: use bags for arrived, supplierSummary for completed
  // Use API-provided cardStats when available, otherwise compute from local arrays
  const computedTotalSuppliers =
    view === "arrived"
      ? [...new Set(bags.map((b) => b.supplierId))].length
      : supplierSummary.length;
  const computedTotalBags =
    view === "arrived"
      ? bags.length
      : supplierSummary.reduce((sum, s) => sum + (Number(s.bagTotal) || 0), 0);
  const computedTotalWeight =
    view === "arrived"
      ? bags.reduce((sum, b) => sum + (Number(b.driverWeight) || 0), 0)
      : supplierSummary.reduce(
          (sum, s) => sum + (Number(s.grossWeight) || 0),
          0
        );

  const totalSuppliers =
    cardStats && view === "arrived"
      ? Number(cardStats.supplierRequestCount || cardStats.totalSuppliers || 0)
      : cardStats && view !== "arrived"
      ? Number(cardStats.totalSuppliers || 0)
      : computedTotalSuppliers;

  const totalBags =
    cardStats && view === "arrived"
      ? Number(cardStats.totalBags || 0)
      : cardStats && view !== "arrived"
      ? Number(cardStats.totalBags || 0)
      : computedTotalBags;

  const totalWeight =
    cardStats && view === "arrived"
      ? Number(cardStats.totalWeight || 0)
      : cardStats && view !== "arrived"
      ? Number(cardStats.totalGrossWeight || cardStats.totalWeight || 0)
      : computedTotalWeight;

  // Bags are already filtered by searchTerm from API
  const filteredBags = bags;
  // supplierSummary is already paginated and filtered by search from API
  const filteredSuppliers = supplierSummary;

  const isBase = useMatch("/inventoryManager/leaf_weight/route/:routeId");

  return (
    <div className="h-full bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-5">
        {isBase && (
          <>
            {/* Header */}
            <div className="bg-white p-4 shadow-sm ">
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
                {
                  label: "Total Weight",
                  value: `${totalWeight} Kg`,
                  icon: <Scale className="text-[#000000]w-5 h-5" />,
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

            {/* Route Info + Search */}
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
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search"
                    className="w-full px-4 pr-10 py-2 text-sm border border-gray-300 rounded-lg bg-gray-50
                     focus:outline-none focus:ring-2 focus:ring-[#165E52] focus:border-transparent"
                  />
                  <Search className="absolute text-gray-400 h-4 w-4 right-3 top-3" />
                </div>
              </div>
            </div>

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

            {/* Table: Arrived = bag list, Completed = supplier summary */}
            <div
              className="bg-white rounded-lg border overflow-hidden"
              style={{ borderColor: "#cfece6" }}
            >
              {view === "arrived" ? (
                <>
                  <div className="bg-[#01251F] text-white">
                    <div className="grid grid-cols-3 gap-4 p-3 text-sm font-semibold text-center">
                      <div>Bag No</div>
                      <div>Weight</div>
                      <div>Quality</div>
                    </div>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {filteredBags.map((bag, index) => {
                      let quality = "Good";
                      let qualityColor = "#165E52";
                      if (bag.wet && bag.coarse) {
                        quality = "Wet, Coarse";
                        qualityColor = "#ff8400ff";
                      } else if (bag.wet) {
                        quality = "Wet";
                        qualityColor = "#f59e42";
                      } else if (bag.coarse) {
                        quality = "Coarse";
                        qualityColor = "#f59e42";
                      }
                      const handleBagClick = () => {
                        const supplyRequestId = bag.supplyRequestId ?? null;

                        if (!sessionId) {
                          setConfirmPopup({
                            open: true,
                            supplyRequestId,
                            tripId,
                          });
                        } else if (sessionUserId === user?.userId) {
                          navigate(`supplier/${supplyRequestId}`, {
                            state: { sessionId, tripId },
                          });
                        } else {
                          setConfirmPopup({ open: "session" });
                        }
                      };
                      return (
                        <div
                          key={index}
                          onClick={handleBagClick}
                          className="grid grid-cols-3 gap-4 p-4 text-center hover:bg-gray-200 cursor-pointer transition"
                        >
                          <div className="font-medium text-[#01251F]">
                            {bag.bagNo || bag.bagNumber}
                          </div>
                          <div className="font-medium text-[#165E52]">
                            {bag.weight || bag.driverWeight}
                          </div>
                          <div
                            className="font-medium"
                            style={{
                              color:
                                quality === "Good" ? "#165E52" : qualityColor,
                            }}
                          >
                            {quality}
                          </div>
                        </div>
                      );
                    })}
                    {filteredBags.length === 0 &&
                      tripDetails?.status !== "weighed" && (
                        <div className="p-8 text-center text-gray-500">
                          No bags found
                        </div>
                      )}
                  </div>
                  {/* Pagination Controls for current view (arrived) */}
                  {view === "arrived" && tripDetails?.status !== "weighed" && (
                    <PaginationControls
                      page={page}
                      totalPages={totalPages}
                      totalElements={totalElements}
                      setPage={setPage}
                    />
                  )}
                  {/* Show 'All bags weighed' only in arrived view and if status is weighed */}
                  {tripDetails?.status === "weighed" && (
                    <div className="flex flex-col items-center justify-center py-12">
                      <div className="text-green-600 font-semibold text-lg mb-4">
                        All bags weighed
                      </div>
                      <button
                        onClick={() => navigate(-1)}
                        className="px-6 py-2 rounded-lg font-medium bg-[#165E52] text-white hover:bg-[#11453f] transition"
                      >
                        Go Back
                      </button>
                    </div>
                  )}
                </>
              ) : (
                // Completed view: supplier summary table
                <>
                  <div className="bg-[#01251F] text-white">
                    <div className="grid grid-cols-5 gap-4 p-3 text-sm font-semibold text-center">
                      <div>Supplier ID</div>
                      <div>Supplier Name</div>
                      <div>Total Bags</div>
                      <div>Gross Weight</div>
                      <div>Deductions</div>
                    </div>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {filteredSuppliers.map((s, idx) => (
                      <div
                        key={idx}
                        className="grid grid-cols-5 gap-4 p-4 text-center"
                      >
                        <div className="font-medium text-[#01251F]">
                          {s.supplierId}
                        </div>
                        <div className="font-medium text-[#165E52]">
                          {s.supplierName}
                        </div>
                        <div className="font-medium">{s.bagTotal}</div>
                        <div className="font-medium">{s.grossWeight} Kg</div>
                        <div className="font-medium">
                          {(s.water || 0) +
                            (s.coarse || 0) +
                            (s.otherWeight || 0)}
                        </div>
                      </div>
                    ))}
                    {filteredSuppliers.length === 0 && (
                      <div className="p-8 text-center text-gray-500">
                        No suppliers found
                      </div>
                    )}
                  </div>
                  {/* Pagination Controls for completed view */}
                  {view !== "arrived" && (
                    <PaginationControls
                      page={page}
                      totalPages={totalPages}
                      totalElements={totalElements}
                      setPage={setPage}
                    />
                  )}
                </>
              )}
            </div>
          </>
        )}
        <Outlet />
      </div>

      {confirmPopup.open && (
        <div className="fixed inset-0 flex items-center justify-center z-[1000] backdrop-blur-sm bg-black/30">
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 border relative"
            style={{ borderColor: "#cfece6" }}
          >
            <div className="p-6 text-center">
              {confirmPopup.open === true && (
                <>
                  <h3
                    className="text-xl font-semibold mb-4"
                    style={{ color: "#165E52" }}
                  >
                    Start Weighing?
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Do you want to start weighing for{" "}
                    <span className="font-semibold text-[#165E52]">
                      {routeName}
                    </span>
                    ?
                  </p>
                  <div className="flex justify-center gap-4">
                    <button
                      onClick={async () => {
                        setConfirmPopup({ open: false });
                        let newSessionId = null;
                        try {
                          const data = await createWeighingSession({
                            userId: user?.userId,
                            tripId: tripId,
                          });
                          newSessionId = data?.sessionId;
                        } catch (error) {
                          console.error(
                            "Error creating weighing session:",
                            error
                          );
                        }
                        navigate(`supplier/${confirmPopup.supplyRequestId}`, {
                          state: {
                            sessionId: newSessionId,
                            tripId: confirmPopup.tripId,
                          },
                        });
                      }}
                      className="px-6 py-2 rounded-lg text-white font-medium transition"
                      style={{ backgroundColor: "#165E52" }}
                    >
                      Yes, Start
                    </button>
                    <button
                      onClick={() => setConfirmPopup({ open: false })}
                      className="px-6 py-2 rounded-lg font-medium"
                      style={{
                        border: "2px solid #cfece6",
                        backgroundColor: "transparent",
                        color: "#165E52",
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}
              {confirmPopup.open === "session" && (
                <>
                  <h3
                    className="text-xl font-semibold mb-4"
                    style={{ color: "#165E52" }}
                  >
                    Session In Progress
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Weighing session is in progress by another user.
                  </p>
                  <div className="flex justify-center gap-4">
                    <button
                      onClick={() => setConfirmPopup({ open: false })}
                      className="px-6 py-2 rounded-lg font-medium transition-colors bg-transparent text-[#165E52] hover:bg-[#165E52] hover:text-white border-2"
                      style={{ borderColor: "#3ec5aaff" }}
                    >
                      OK
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
