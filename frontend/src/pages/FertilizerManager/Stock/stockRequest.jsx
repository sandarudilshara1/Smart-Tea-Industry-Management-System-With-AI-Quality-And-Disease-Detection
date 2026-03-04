// File: src/pages/owner/StockRequest.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { FileText, Send, Package, Building2, MessageSquare, Loader2 } from "lucide-react";
import { getAllFertilizerCategories, getCompaniesByFertilizerCategory } from "../../../api/owner";
import {
  createFertilizerStockRequest,
  getAllFertilizerStockRequests,
} from "../../../api/fertilizerManager";

const ACCENT_COLOR = "#165E52";

const StockRequest = () => {
  const [activeTab, setActiveTab] = useState("all");
  const tabOptions = [
    { key: "all", label: "All" },
    { key: "pending", label: "Pending" },
    { key: "approved", label: "Approved" },
    { key: "fulfilled", label: "Fulfilled" },
    { key: "rejected", label: "Rejected" },
  ];

  // ...existing code...
  const [requests, setRequests] = useState([]);

  const filteredRequests = useMemo(() => {
    if (activeTab === "all") return requests;
    return requests.filter(r => r.status === activeTab);
  }, [activeTab, requests]);

  const [formData, setFormData] = useState({
    fertilizerType: "",
    company: "",
    quantity: "",
    notes: "",
  });

  const [categories, setCategories] = useState([]); // [{id,name}]
  const [loadingCategories, setLoadingCategories] = useState(false);

  const [companies, setCompanies] = useState([]); // [{id,name}]
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [companyError, setCompanyError] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const { user } = useAuth();
  const userId = useMemo(() => {
    if (user?.userId) return user.userId;
    const raw = localStorage.getItem("userId");
    return raw ? Number(raw) : null;
  }, [user]);

  // Load categories
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoadingCategories(true);
      try {
        const res = await getAllFertilizerCategories();
        if (!mounted) return;
        setCategories(Array.isArray(res) ? res : []);
      } catch {
        if (!mounted) return;
        setCategories([]);
      } finally {
        if (mounted) setLoadingCategories(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Load companies by selected category
  useEffect(() => {
    let mounted = true;
    const categoryObj = categories.find((c) => c.name === formData.fertilizerType);
    if (!categoryObj) {
      setCompanies([]);
      return () => {
        mounted = false;
      };
    }
    (async () => {
      setLoadingCompanies(true);
      setCompanyError("");
      try {
        const res = await getCompaniesByFertilizerCategory(categoryObj.id);
        if (!mounted) return;
        setCompanies(Array.isArray(res) ? res : []);
      } catch {
        if (!mounted) return;
        setCompanyError("Failed to load companies for fertilizer type");
        setCompanies([]);
      } finally {
        if (mounted) setLoadingCompanies(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [formData.fertilizerType, categories]);

  // Load all fertilizer stock requests
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await getAllFertilizerStockRequests();
        if (!mounted) return;
        const mapped = (res || []).map((r) => ({
          id: r.id,
          fertilizerType: r.categoryName,
          company: r.companyName,
          quantity: r.quantity,
          status: (r.status || "PENDING").toLowerCase(),
          dateRequested: r.createdAt ? String(r.createdAt).split("T")[0] : "",
          notes: r.note || "",
        }));
        setRequests(mapped);
      } catch {
        // silent
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const selectedCategory = useMemo(
    () => categories.find((c) => c.name === formData.fertilizerType) || null,
    [categories, formData.fertilizerType]
  );
  const selectedCompany = useMemo(
    () => companies.find((c) => c.name === formData.company) || null,
    [companies, formData.company]
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    if (!userId || !selectedCategory || !selectedCompany || !formData.quantity) return;

    setSubmitting(true);
    setErrorMsg("");
    try {
      const payload = {
        categoryId: selectedCategory.id,
        companyId: selectedCompany.id,
        userId,
        quantity: Number(formData.quantity),
        note: formData.notes?.trim() || "",
      };
      const created = await createFertilizerStockRequest(payload);
      const createdMapped = {
        id: created.id,
        fertilizerType: created.categoryName,
        company: created.companyName,
        quantity: created.quantity,
        status: (created.status || "PENDING").toLowerCase(),
        dateRequested: created.createdAt ? String(created.createdAt).split("T")[0] : "",
        notes: created.note || "",
      };
      setRequests((prev) => [createdMapped, ...prev]);
      setFormData({ fertilizerType: "", company: "", quantity: "", notes: "" });
    } catch (err) {
      console.error("Create request failed", err);
      const status = err?.response?.status;
      const serverMsg = err?.response?.data?.message || err?.message || "";
      if (status === 403 || serverMsg.toLowerCase().includes("access denied")) {
        setErrorMsg("You don't have permission to create requests. Please contact an admin.");
      } else {
        setErrorMsg("Failed to submit request. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Stock Requests</h1>
          <p className="text-gray-600">Request additional fertilizer stock from suppliers</p>
        </div>

  <div className="flex flex-col gap-8 w-full">
          {/* Request Form */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 w-full">
            <div className="flex items-center mb-4">
              <FileText className="text-blue-600 mr-3" size={24} />
              <h2 className="text-xl font-semibold text-gray-900">New Stock Request</h2>
            </div>

            <form onSubmit={handleSubmitRequest} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {errorMsg && (
                <div className="p-3 rounded-md text-sm bg-red-50 text-red-700 border border-red-200">
                  {errorMsg}
                </div>
              )}
              <div className="space-y-4">
                {/* Left column */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fertilizer Type</label>
                  <div className="relative">
                    <Package className="pointer-events-none absolute left-3 top-3 text-gray-400" size={18} />
                    <select
                      name="fertilizerType"
                      value={formData.fertilizerType}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, fertilizerType: e.target.value, company: "" }))
                      }
                      className="w-full pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white disabled:opacity-60"
                      required
                      disabled={loadingCategories && categories.length === 0}
                    >
                      <option value="" disabled>
                        {loadingCategories && categories.length === 0 ? "Loading fertilizer types..." : "Select fertilizer type"}
                      </option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    {loadingCategories && <Loader2 className="absolute right-3 top-3 animate-spin text-gray-400" size={18} />}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity Needed</label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter quantity"
                    min="1"
                    required
                  />
                </div>
              </div>
              <div className="space-y-4">
                {/* Right column */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company/Supplier</label>
                  <div className="relative">
                    <Building2 className="pointer-events-none absolute left-3 top-3 text-gray-400" size={18} />
                    <select
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white disabled:opacity-60"
                      required
                      disabled={loadingCompanies || !formData.fertilizerType}
                    >
                      <option value="" disabled>
                        {formData.fertilizerType
                          ? loadingCompanies
                            ? "Loading companies..."
                            : companies.length
                            ? "Select a company"
                            : companyError || "No companies found"
                          : "Select fertilizer type first"}
                      </option>
                      {companies.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    {loadingCompanies && <Loader2 className="absolute right-3 top-3 animate-spin text-gray-400" size={18} />}
                  </div>
                  {companyError && <p className="mt-1 text-xs text-red-600">{companyError}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-3 text-gray-400" size={18} />
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Additional notes or requirements..."
                      maxLength={500}
                    />
                  </div>
                </div>
              </div>
              <div className="col-span-1 md:col-span-2">
                <button
                  type="submit"
                  style={{ backgroundColor: ACCENT_COLOR }}
                  className="w-full hover:opacity-90 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 font-semibold transition-opacity disabled:opacity-60"
                  disabled={submitting}
                >
                  {submitting ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                  {submitting ? "Submitting..." : "Submit Request"}
                </button>
              </div>
            </form>
          </div>

          {/* Request History with Tabs */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 w-full">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Requests</h2>
            <div className="mb-4 flex gap-2">
              {tabOptions.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    activeTab === tab.key
                      ? "bg-[#165E52] text-white shadow"
                      : "bg-gray-100 text-[#165E52] hover:bg-[#e1f4ef]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="space-y-4">
              {filteredRequests.map((request) => (
                <div key={request.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-gray-900">{request.fertilizerType}</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{request.company}</p>
                  <p className="text-sm text-gray-600 mb-2">Quantity: {request.quantity} units</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Requested on {request.dateRequested}</span>
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        request.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : request.status === "approved"
                          ? "bg-green-100 text-green-800"
                          : request.status === "fulfilled"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </span>
                  </div>
                  {request.notes && <p className="text-xs text-gray-500 mt-2 italic">"{request.notes}"</p>}
                </div>
              ))}
              {!filteredRequests.length && <p className="text-sm text-gray-500">No requests in this tab.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockRequest;