import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Edit, Trash } from "lucide-react";
import {
  getFertilizerCompanies,
  deleteFertilizerCompany,
} from "../../../api/fertilizerCompanies";

const FertilizerCompany = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [categories, setCategories] = useState([]);
  const [totalFertilizers, setTotalFertilizers] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const data = await getFertilizerCompanies();
      const list = Array.isArray(data) ? data : [];
      setCompanies(list);

      const allCategories = Array.from(new Set(list.flatMap((c) => c.categories || [])));
      setCategories(allCategories);
      setTotalFertilizers(allCategories.length);
    } catch (error) {
      console.error("Error fetching companies:", error);
      setCompanies([]);
      setCategories([]);
      setTotalFertilizers(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleOpenAddPage = () => {
    navigate("/inventoryManager/fertilizer-companies/add");
  };

  const handleOpenEditPage = (company) => {
    navigate("/inventoryManager/fertilizer-companies/edit", { state: { company } });
  };

  const handleDeleteCompany = async (id) => {
    if (!id) return;
    if (!window.confirm("Delete this company?")) return;
    try {
      await deleteFertilizerCompany(id);
      await fetchCompanies();
    } catch (e) {
      console.error("Error deleting company:", e);
      alert(e?.response?.data?.message || e?.message || "Failed to delete company");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50 to-gray-50 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Fertilizer Companies
          </h1>
          <p className="text-gray-600">
            Inventory Manager Dashboard - Manage fertilizer suppliers and their product categories
          </p>
        </div>
        <button
          className="flex items-center gap-2 bg-gradient-to-r from-[#165E52] to-[#1a7566] hover:shadow-xl text-white py-3 px-6 rounded-xl transition-all duration-200 font-medium"
          onClick={handleOpenAddPage}
        >
          <Plus size={20} />
          <span>Add New Company</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                Total Companies
              </h2>
              <p className="text-4xl font-bold text-[#165E52]">
                {companies.length}
              </p>
            </div>
            <div className="w-16 h-16 bg-gradient-to-br from-[#165E52] to-[#1a7566] rounded-2xl flex items-center justify-center shadow-lg">
              <Plus className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                Total Fertilizer Types
              </h2>
              <p className="text-4xl font-bold text-[#165E52]">
                {totalFertilizers}
              </p>
            </div>
            <div className="w-16 h-16 bg-gradient-to-br from-[#165E52] to-[#1a7566] rounded-2xl flex items-center justify-center shadow-lg">
              <Plus className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Companies List */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Companies</h2>
          <p className="text-sm text-gray-600 mt-1">
            {loading ? "Loading..." : `${companies.length} company(s) found`}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead style={{ backgroundColor: "#01251F" }}>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Categories
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-100">
              {companies.map((company) => (
                <tr key={company.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-semibold text-gray-900">
                      {company.name}
                    </div>
                    <div className="text-sm text-gray-600">{company.address}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{company.contactPerson}</div>
                    <div className="text-sm text-gray-600">{company.contactNumber}</div>
                    <div className="text-sm text-gray-600">{company.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      {(company.categories || []).map((cat) => (
                        <span
                          key={cat}
                          className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100"
                        >
                          {cat}
                        </span>
                      ))}
                      {(company.categories || []).length === 0 && (
                        <span className="text-sm text-gray-500">No categories</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50"
                        title="Edit"
                        onClick={() => handleOpenEditPage(company)}
                      >
                        <Edit className="w-4 h-4 text-gray-700" />
                      </button>
                      <button
                        className="p-2 rounded-lg border border-gray-200 hover:bg-red-50"
                        title="Delete"
                        onClick={() => handleDeleteCompany(company.id)}
                      >
                        <Trash className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {!loading && companies.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-gray-500">
                    No fertilizer companies found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Categories Summary */}
      <div className="mt-8 bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">All Categories</h2>
          <p className="text-sm text-gray-600 mt-1">
            {categories.length} category(ies)
          </p>
        </div>
        <div className="p-6">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <span
                key={cat}
                className="px-3 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-700 border border-gray-200"
              >
                {cat}
              </span>
            ))}
            {categories.length === 0 && (
              <div className="text-sm text-gray-600">No categories yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FertilizerCompany;
