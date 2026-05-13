import { useEffect, useState } from "react";
import {
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
  Eye,
  AlertTriangle,
  Ban,
  Activity,
  DollarSign,
  Package,
  CheckCircle,
} from "lucide-react";
import axios from "../../../api/axios";

const ACCENT_COLOR = "#165E52";
const BORDER_COLOR = "#e5e7eb";

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({ total: 0, active: 0, bank: 0, cash: 0 });

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [supplierStats, setSupplierStats] = useState({
    teaLeaf: { totalWeight: 0, totalNetWeight: 0, totalAmount: 0, entryCount: 0 },
    payments: { totalPaid: 0, paymentCount: 0 },
    advances: { totalAdvances: 0, advanceCount: 0 }
  });
  const [statsLoading, setStatsLoading] = useState(false);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      // Fallback API if backend doesn't exist yet, we will mock if needed
      const res = await axios.get("/suppliers");
      const data = res.data.content || res.data.data || res.data;
      
      if (Array.isArray(data)) {
        setSuppliers(data);
        calculateStats(data);
      }
    } catch (err) {
      console.error("Error fetching suppliers:", err);
      // For demonstration, let's mock some data if API fails so the UI works
      const mockData = [
        {
          _id: "1",
          supplierCode: "SUP-001",
          name: "Saman Perera",
          contactNumber: "0771234567",
          nicNumber: "198512345678",
          routeId: { routeName: "South Hills" },
          status: "Active",
          preferredPaymentMethod: "Bank",
        },
        {
          _id: "2",
          supplierCode: "SUP-002",
          name: "Nimal Silva",
          contactNumber: "0719876543",
          nicNumber: "199012345678",
          routeId: { routeName: "North Estate" },
          status: "Inactive",
          preferredPaymentMethod: "Cash",
        },
      ];
      setSuppliers(mockData);
      calculateStats(mockData);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    let active = 0, bank = 0, cash = 0;
    data.forEach(s => {
      if (s.status === "Active") active++;
      if (s.preferredPaymentMethod === "Bank") bank++;
      if (s.preferredPaymentMethod === "Cash") cash++;
    });
    setStats({ total: data.length, active, bank, cash });
  };

  const handleSuspend = async (id) => {
    if (!window.confirm("Are you sure you want to suspend this supplier?")) return;
    try {
      await axios.put(`/suppliers/${id}`, { status: "Suspended" });
      fetchSuppliers();
      if (selectedSupplier && selectedSupplier._id === id) {
        setSelectedSupplier(prev => ({ ...prev, status: "Suspended" }));
      }
    } catch (err) {
      console.error("Error suspending:", err);
      alert("Failed to suspend. Mocking suspension.");
      setSuppliers(prev => prev.map(s => s._id === id ? { ...s, status: "Suspended" } : s));
      calculateStats(suppliers.map(s => s._id === id ? { ...s, status: "Suspended" } : s));
      if (selectedSupplier && selectedSupplier._id === id) {
        setSelectedSupplier(prev => ({ ...prev, status: "Suspended" }));
      }
    }
  };

  const handleActivate = async (id) => {
    if (!window.confirm("Are you sure you want to re-activate this supplier?")) return;
    try {
      await axios.put(`/suppliers/${id}`, { status: "Active" });
      fetchSuppliers();
      if (selectedSupplier && selectedSupplier._id === id) {
        setSelectedSupplier(prev => ({ ...prev, status: "Active" }));
      }
    } catch (err) {
      console.error("Error activating:", err);
      alert("Failed to activate. Mocking activation.");
      setSuppliers(prev => prev.map(s => s._id === id ? { ...s, status: "Active" } : s));
      calculateStats(suppliers.map(s => s._id === id ? { ...s, status: "Active" } : s));
      if (selectedSupplier && selectedSupplier._id === id) {
        setSelectedSupplier(prev => ({ ...prev, status: "Active" }));
      }
    }
  };

  const openProfile = async (supplier) => {
    setSelectedSupplier(supplier);
    setIsProfileModalOpen(true);
    setStatsLoading(true);
    try {
      const res = await axios.get(`/suppliers/${supplier._id}/statistics`);
      if (res.data.success) {
        setSupplierStats(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching supplier statistics:", err);
    } finally {
      setStatsLoading(false);
    }
  };

  const filteredSuppliers = suppliers.filter(s =>
    s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.supplierCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.contactNumber?.includes(searchTerm)
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white shadow-md border-b-2 rounded-lg p-6" style={{ borderColor: ACCENT_COLOR }}>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: ACCENT_COLOR }}>Supplier Management</h1>
            <p className="text-gray-600 mt-1">Manage your tea leaf suppliers, routes, and performance.</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { title: "Total Suppliers", value: stats.total, icon: Users, color: "text-blue-600", bg: "bg-blue-100" },
          { title: "Active Suppliers", value: stats.active, icon: Activity, color: "text-green-600", bg: "bg-green-100" },
          { title: "Bank Payments", value: stats.bank, icon: DollarSign, color: "text-purple-600", bg: "bg-purple-100" },
          { title: "Cash Payments", value: stats.cash, icon: Package, color: "text-orange-600", bg: "bg-orange-100" },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">{stat.title}</p>
              <h3 className="text-3xl font-bold text-gray-800 mt-1">{stat.value}</h3>
            </div>
            <div className={`${stat.bg} ${stat.color} p-4 rounded-full`}>
              <stat.icon size={24} />
            </div>
          </div>
        ))}
      </div>

      {/* Search & Table Container */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-lg">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by Name, Code, or Contact..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:border-transparent transition-all"
              style={{ focusRing: ACCENT_COLOR }}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200 text-left">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Code</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name & Contact</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Route</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Payment Method</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-8 h-8 border-4 border-gray-200 rounded-full animate-spin border-t-[#165E52] mb-4"></div>
                      Loading Suppliers...
                    </div>
                  </td>
                </tr>
              ) : filteredSuppliers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    No suppliers found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredSuppliers.map((supplier) => (
                  <tr key={supplier._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-mono text-sm text-gray-700">
                      {supplier.supplierCode}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{supplier.name}</div>
                      <div className="text-sm text-gray-500">{supplier.contactNumber}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {supplier.routeId?.routeName || "Unassigned"}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        supplier.preferredPaymentMethod === 'Bank' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                      }`}>
                        {supplier.preferredPaymentMethod || "Bank"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        supplier.status === 'Active' ? 'bg-green-100 text-green-700' : 
                        supplier.status === 'Inactive' ? 'bg-gray-100 text-gray-700' : 
                        'bg-red-100 text-red-700'
                      }`}>
                        {supplier.status || "Active"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => openProfile(supplier)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        <button 
                          className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={18} />
                        </button>
                        {supplier.status === 'Active' ? (
                          <button 
                            onClick={() => handleSuspend(supplier._id)}
                            className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                            title="Suspend Supplier"
                          >
                            <Ban size={18} />
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleActivate(supplier._id)}
                            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Re-Activate Supplier"
                          >
                            <CheckCircle size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Profile/Details Modal */}
      {isProfileModalOpen && selectedSupplier && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div 
              className="px-6 py-8 text-white relative"
              style={{ backgroundColor: ACCENT_COLOR }}
            >
              <button 
                onClick={() => setIsProfileModalOpen(false)}
                className="absolute top-4 right-4 text-white/80 hover:text-white"
              >
                ✕
              </button>
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center text-4xl font-bold border-4 border-white/30">
                  {selectedSupplier.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-3xl font-bold">{selectedSupplier.name}</h2>
                  <div className="flex gap-4 mt-2 text-white/90 text-sm">
                    <span className="bg-black/20 px-3 py-1 rounded-full font-mono">{selectedSupplier.supplierCode}</span>
                    <span className="flex items-center gap-1"><Users size={16}/> {selectedSupplier.routeId?.routeName || "Unassigned Route"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto bg-gray-50 flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Identity Info */}
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                  <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Users size={18} className="text-[#165E52]"/> Identity & Contact
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="grid grid-cols-3"><span className="text-gray-500">NIC No:</span> <span className="col-span-2 font-medium">{selectedSupplier.nicNumber}</span></div>
                    <div className="grid grid-cols-3"><span className="text-gray-500">Phone:</span> <span className="col-span-2 font-medium">{selectedSupplier.contactNumber}</span></div>
                    <div className="grid grid-cols-3"><span className="text-gray-500">Email:</span> <span className="col-span-2 font-medium">{selectedSupplier.email || "N/A"}</span></div>
                    <div className="grid grid-cols-3"><span className="text-gray-500">Address:</span> <span className="col-span-2 font-medium">{selectedSupplier.address || "N/A"}</span></div>
                  </div>
                </div>

                {/* Financial Info */}
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                  <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <DollarSign size={18} className="text-[#165E52]"/> Payment & Bank
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="grid grid-cols-3"><span className="text-gray-500">Preference:</span> <span className="col-span-2 font-medium">{selectedSupplier.preferredPaymentMethod}</span></div>
                    {selectedSupplier.preferredPaymentMethod === 'Bank' && (
                      <>
                        <div className="grid grid-cols-3"><span className="text-gray-500">Bank:</span> <span className="col-span-2 font-medium">{selectedSupplier.bankDetails?.bankName || "Pending"}</span></div>
                        <div className="grid grid-cols-3"><span className="text-gray-500">Branch:</span> <span className="col-span-2 font-medium">{selectedSupplier.bankDetails?.branchName || "Pending"}</span></div>
                        <div className="grid grid-cols-3"><span className="text-gray-500">Account:</span> <span className="col-span-2 font-mono font-medium">{selectedSupplier.bankDetails?.accountNumber || "Pending"}</span></div>
                      </>
                    )}
                  </div>
                </div>

                {/* Performance Stats */}
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm md:col-span-2">
                  <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Activity size={18} className="text-[#165E52]"/> Supply Performance (All Time)
                  </h3>
                  {statsLoading ? (
                    <div className="flex items-center justify-center py-6 text-gray-500 text-sm">
                      <div className="w-6 h-6 border-2 border-gray-200 rounded-full animate-spin border-t-[#165E52] mr-3"></div>
                      Loading metrics...
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                      <div className="p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-700">
                          {supplierStats.teaLeaf.totalNetWeight ? supplierStats.teaLeaf.totalNetWeight.toLocaleString() : '0'} kg
                        </div>
                        <div className="text-xs text-green-600 uppercase tracking-wide mt-1">Total Leaves Supplied</div>
                      </div>
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-700">
                          Rs. {supplierStats.payments.totalPaid ? supplierStats.payments.totalPaid.toLocaleString() : '0'}
                        </div>
                        <div className="text-xs text-blue-600 uppercase tracking-wide mt-1">Total Earnings Paid</div>
                      </div>
                      <div className="p-4 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-700">
                          Rs. {supplierStats.advances.totalAdvances ? supplierStats.advances.totalAdvances.toLocaleString() : '0'}
                        </div>
                        <div className="text-xs text-purple-600 uppercase tracking-wide mt-1">Total Advances</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Modal Footer Actions */}
            <div className="p-4 border-t border-gray-200 bg-white flex justify-between items-center">
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                selectedSupplier.status === 'Active' ? 'bg-green-100 text-green-700' : 
                selectedSupplier.status === 'Inactive' ? 'bg-gray-100 text-gray-700' : 
                'bg-red-100 text-red-700'
              }`}>
                Status: {selectedSupplier.status}
              </span>
              <div className="flex gap-3">
                <button 
                  onClick={() => setIsProfileModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
                {selectedSupplier.status === 'Active' ? (
                  <button 
                    onClick={() => handleSuspend(selectedSupplier._id)}
                    className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-medium hover:bg-red-100 flex items-center gap-2"
                  >
                    <Ban size={16}/> Suspend Supplier
                  </button>
                ) : (
                  <button 
                    onClick={() => handleActivate(selectedSupplier._id)}
                    className="px-4 py-2 bg-green-50 text-green-700 border border-green-200 rounded-lg text-sm font-medium hover:bg-green-100 flex items-center gap-2"
                  >
                    <CheckCircle size={16}/> Re-Activate Supplier
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
