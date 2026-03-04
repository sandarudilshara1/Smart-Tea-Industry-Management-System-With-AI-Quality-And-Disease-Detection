import { useState, useMemo, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Search, Eye, Users, Clock, X } from "lucide-react";
import { useAuth } from "../../../contexts/AuthContext";
import {
  getAdvancesByStatus,
  getAdvanceStatusCounts,
} from "../../../api/paymentManager";
import PaginationControls from "../../../components/ui/PaginationControls";

const ACCENT_COLOR = "#165E52";
const BUTTON = "#01251F";
const BORDER_COLOR = "#cfece6";
const BG_LIGHT_GREEN = "#e1f4ef";

const statusMapping = {
  approved: "APPROVED",
  pending: "REQUESTED",
  rejected: "REJECTED",
};

export default function AdvanceManagement() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const factoryId = user?.factoryId;

  const currentDate = useMemo(() => new Date(), []);
  const availableYears = Array.from(
    { length: 10 },
    (_, i) => currentDate.getFullYear() - i
  );

  const months = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) =>
        new Date(0, i).toLocaleString("en", { month: "long" })
      ),
    []
  );

  const [advances, setAdvances] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentView, setCurrentView] = useState("approved");
  const [statusCounts, setStatusCounts] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    month: months[currentDate.getMonth()],
    year: currentDate.getFullYear(),
    page: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: searchTerm, page: 0 }));
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Set initial view based on navigation state
  useEffect(() => {
    if (location.state?.view) {
      setCurrentView(location.state.view);
    }
  }, [location.state?.view]);

  // Fetch advances data
  useEffect(() => {
    const fetchAdvances = async () => {
      if (!factoryId) return;
      setLoading(true);
      try {
        const params = {
          page: filters.page,
          ...(filters.month && {
            month:
              new Date(
                `${filters.month} 1, ${
                  filters.year || currentDate.getFullYear()
                }`
              ).getMonth() + 1,
          }),
          ...(filters.year && { year: filters.year }),
          ...(filters.search && { search: filters.search }),
        };
        const data = await getAdvancesByStatus(
          factoryId,
          statusMapping[currentView],
          params
        );
        setAdvances(data.content || []);
        setTotalPages(data.totalPages || 1);
        setTotalElements(data.totalElements || 0);
      } catch (error) {
        console.error("Error fetching advances:", error);
        setAdvances([]);
        setTotalPages(1);
        setTotalElements(0);
      } finally {
        setLoading(false);
      }
    };
    fetchAdvances();

    // Refetch advances when window regains focus
    const handleFocus = () => {
      fetchAdvances();
    };
    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [
    factoryId,
    currentView,
    filters.page,
    filters.month,
    filters.year,
    filters.search,
    currentDate,
  ]);

  // Fetch status counts
  useEffect(() => {
    const fetchStatusCounts = async () => {
      if (!factoryId) return;
      try {
        const params = {
          ...(filters.month && {
            month:
              new Date(
                `${filters.month} 1, ${
                  filters.year || currentDate.getFullYear()
                }`
              ).getMonth() + 1,
          }),
          ...(filters.year && { year: filters.year }),
        };
        const data = await getAdvanceStatusCounts(factoryId, params);
        setStatusCounts(data);
      } catch (error) {
        console.error("Error fetching status counts:", error);
        setStatusCounts([]);
      }
    };
    fetchStatusCounts();

    // Refetch counts when window regains focus (e.g., after returning from advance details)
    const handleFocus = () => {
      fetchStatusCounts();
    };
    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [factoryId, filters.month, filters.year, currentDate]);

  const metrics = useMemo(() => {
    return statusCounts.reduce(
      (acc, item) => {
        if (item.status === "APPROVED") acc.approvedCount = item.count;
        else if (item.status === "REQUESTED") acc.pendingCount = item.count;
        else if (item.status === "REJECTED") acc.rejectedCount = item.count;
        return acc;
      },
      { approvedCount: 0, pendingCount: 0, rejectedCount: 0 }
    );
  }, [statusCounts]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value, page: 0 })); // Reset page on filter change
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div
        className="bg-white shadow-md border-b"
        style={{ borderColor: BORDER_COLOR }}
      >
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <h1 className="text-3xl font-bold text-[${ACCENT_COLOR}]">
            Advance Management
          </h1>
          <div className="flex gap-4">
            <select
              name="month"
              value={filters.month}
              onChange={handleFilterChange}
              className="p-2 text-sm rounded-md border focus:ring-2 focus:ring-[#165E52]"
              style={{ borderColor: BORDER_COLOR }}
            >
              <option value="">All Months</option>
              {months.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <select
              name="year"
              value={filters.year}
              onChange={handleFilterChange}
              className="p-2 text-sm rounded-md border focus:ring-2 focus:ring-[#165E52]"
              style={{ borderColor: BORDER_COLOR }}
            >
              <option value="">All Years</option>
              {availableYears.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[
            {
              label: "Total Approved",
              count: metrics.approvedCount,
              icon: <Users />,
              view: "approved",
            },
            {
              label: "Pending Requests",
              count: metrics.pendingCount,
              icon: <Clock />,
              view: "pending",
            },
            {
              label: "Rejected",
              count: metrics.rejectedCount,
              icon: <X />,
              view: "rejected",
            },
          ].map((card, i) => (
            <div
              key={i}
              onClick={() => setCurrentView(card.view)}
              className={`bg-white p-6 rounded-lg shadow-md cursor-pointer border transition ${
                currentView === card.view
                  ? "ring-2 ring-[#165E52] bg-[#e1f4ef]"
                  : ""
              }`}
              style={{
                borderColor:
                  card.label === "Rejected"
                    ? "#ef4444"
                    : currentView === card.view
                    ? ACCENT_COLOR
                    : "#000",
              }}
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-black">{card.label}</p>
                  <p className="text-2xl font-bold text-black">{card.count}</p>
                </div>
                <div className="bg-gray-100 p-2 rounded-full">{card.icon}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div
          className="bg-white rounded-lg shadow-md border mb-6"
          style={{ borderColor: BORDER_COLOR }}
        >
          <div className="p-4">
            {/* 🔍 Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search by name"
                  name="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#165E52] focus:outline-none text-gray-900 transition-colors text-sm"
                  style={{
                    borderColor: BORDER_COLOR,
                    color: "#000",
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
          <div style={{ backgroundColor: BUTTON, color: "white" }}>
            <div className="grid grid-cols-5 gap-4 p-4 text-sm font-medium text-center">
              <div>Name</div>
              <div>Purpose</div>
              <div>Amount</div>
              <div>Date</div>
              <div>View</div>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {loading ? (
              <div className="text-center text-sm p-10 text-gray-400">
                Loading...
              </div>
            ) : advances.length > 0 ? (
              advances.map((advance, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-5 gap-4 p-4 items-center hover:bg-gray-50 border-b"
                >
                  <div className="text-center">
                    <span className="font-semibold text-sm text-gray-900">
                      {advance.supplierName}
                    </span>
                  </div>
                  <div className="text-center text-sm font-medium text-gray-900">
                    {advance.purpose}
                  </div>
                  <div className="text-center text-sm">
                    Rs.{" "}
                    {advance.status === "APPROVED"
                      ? advance.approvedAmount
                      : advance.requestedAmount}
                  </div>
                  <div className="text-center text-sm">
                    {new Date(advance.requestedDate).toLocaleDateString()}
                  </div>
                  <div className="flex justify-center">
                    <button
                      className="p-2 rounded-full border border-gray-400 text-black hover:text-white hover:bg-black"
                      onClick={() =>
                        navigate(
                          `/factoryManager/payment/advance/${advance.id}`
                        )
                      }
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-sm p-10 text-gray-400">
                No advances found.
              </div>
            )}
          </div>
        </div>

        {/* Pagination */}
        <PaginationControls
          page={filters.page}
          totalPages={totalPages}
          totalElements={totalElements}
          setPage={handlePageChange}
        />
      </div>
    </div>
  );
}
