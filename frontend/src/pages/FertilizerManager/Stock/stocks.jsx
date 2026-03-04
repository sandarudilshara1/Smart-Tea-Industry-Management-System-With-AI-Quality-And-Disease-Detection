import React, { useState, useEffect } from "react";
import { getAllFertilizerCategories, getCompaniesByFertilizerCategory } from "../../../api/owner";
import { createFertilizerStock } from "../../../api/fertilizerManager";
import { getAllFertilizerStocks } from "../../../api/fertilizerManager";
import { useAuth } from "../../../contexts/AuthContext";
import {
  Plus,
  Package,
  Building2,
  Weight,
  Warehouse,
  Eye,
  Edit,
  Trash2,
  X,
  FileText,
} from "lucide-react";

// Theme Constants
const ACCENT_COLOR = "#165E52";
const BUTTON_COLOR = "#172526";
const BORDER_COLOR = "#cfece6";

const FertilizerStocks = () => {
  useEffect(() => {
    // Fetch all stocks from backend on mount
    getAllFertilizerStocks().then(setFertilizers).catch((err) => {
      console.error("Failed to fetch fertilizer stocks", err);
    });
  }, []);
  const { user } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);
  const [fertilizers, setFertilizers] = useState([]);
  //dropdown states
  // Backend-connected dropdowns
  const [categories, setCategories] = useState([]);
  const [companies, setCompanies] = useState([]);
//
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    quantity: "",
    weight: "",
    warehouse: "",
    purchasePrice: "",
    sellPrice: "",
  });
//dropdown data fetching
  // Fetch categories on mount
  useEffect(() => {
    getAllFertilizerCategories().then(setCategories);
  }, []);

  // Fetch companies when category changes
  useEffect(() => {
    const selectedCategory = categories.find(c => c.name === formData.name);
    if (selectedCategory) {
      getCompaniesByFertilizerCategory(selectedCategory.id).then(setCompanies);
    } else {
      setCompanies([]);
    }
  }, [formData.name, categories]);
//
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddFertilizer = (e) => {
    e.preventDefault();
    if (
      formData.name &&
      formData.company &&
      formData.quantity &&
      formData.weight &&
      formData.warehouse &&
      formData.purchasePrice &&
      formData.sellPrice
    ) {
      const selectedCategory = categories.find(c => c.name === formData.name);
      const selectedCompany = companies.find(c => c.name === formData.company);
      const payload = {
        userId: user?.userId,
        categoryId: selectedCategory?.id,
        companyId: selectedCompany?.id,
        weightPerQuantity: parseFloat(formData.weight),
        purchasePrice: parseFloat(formData.purchasePrice),
        sellPrice: parseFloat(formData.sellPrice),
        warehouse: formData.warehouse,
        quantity: parseInt(formData.quantity),
      };
      createFertilizerStock(payload)
        .then((newStock) => {
          setFertilizers((prev) => [...prev, newStock]);
          setFormData({
            name: "",
            company: "",
            quantity: "",
            weight: "",
            warehouse: "",
            purchasePrice: "",
            sellPrice: "",
          });
          setShowAddForm(false);
        })
        .catch((err) => {
          console.error("Failed to add fertilizer stock", err);
        });
    }
  };

  const handleDeleteFertilizer = (id) => {
    setFertilizers((prev) => prev.filter((fertilizer) => fertilizer.id !== id));
  };

  const handleRequestFertilizer = () => {
    // Navigate to request fertilizer page or open request modal
    window.location.href = "/fertilizerManager/stocks/request";
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">

      <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Fertilizer Stock Management
          </h1>
          <p className="text-gray-600">
            Manage your fertilizer inventory and stock levels
          </p>
        </div>
        <div className="max-w-7xl mx-auto">
        {/* Summary cards */}
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 mb-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Package className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Fertilizers</p>
                <p className="text-2xl font-semibold text-gray-900">{fertilizers.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Building2 className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Companies</p>
                <p className="text-2xl font-semibold text-gray-900">{new Set(fertilizers.map((f) => f.companyName || f.company)).size}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Warehouse className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Warehouses Used</p>
                <p className="text-2xl font-semibold text-gray-900">{new Set(fertilizers.map((f) => f.warehouse)).size}</p>
              </div>
            </div>
          </div>
        </div>
        {/* Header */}
        

        {/* Action Buttons */}
        <div className="mb-6 flex gap-4">
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 font-semibold transition-colors"
          >
            <Plus size={20} />
            Add Fertilizer
          </button>
          <button
            onClick={handleRequestFertilizer}
            style={{ backgroundColor: ACCENT_COLOR }}
            className="hover:opacity-90 text-white px-6 py-3 rounded-lg flex items-center gap-2 font-semibold transition-opacity"
          >
            <FileText size={20} />
            Request Fertilizer
          </button>
        </div>

        {/* Add Fertilizer Form Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  Add New Fertilizer
                </h2>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleAddFertilizer} className="space-y-4">

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fertilizer Category
                  </label>
                  <div className="relative">
                    <Package className="absolute left-3 top-3 text-gray-400" size={18} />
                    <select
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select Fertilizer Category</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-3 text-gray-400" size={18} />
                    <select
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select Company</option>
                      {companies.map((comp) => (
                        <option key={comp.id} value={comp.name}>{comp.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter quantity"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Weight
                  </label>
                  <div className="relative">
                    <Weight className="absolute left-3 top-3 text-gray-400" size={18} />
                    <input
                      type="text"
                      name="weight"
                      value={formData.weight}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="e.g., 50kg, 25kg"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Warehouse
                  </label>
                  <div className="relative">
                    <Warehouse className="absolute left-3 top-3 text-gray-400" size={18} />
                    <select
                      name="warehouse"
                      value={formData.warehouse}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select Warehouse</option>
                      <option value="Warehouse A">Warehouse A</option>
                      <option value="Warehouse B">Warehouse B</option>
                      <option value="Warehouse C">Warehouse C</option>
                    </select>
                  </div>
                  
                </div>
                                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Purchase Price
                  </label>
                  <input
                    type="number"
                    name="purchasePrice"
                    value={formData.purchasePrice}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter purchase price"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sell Price
                  </label>
                  <input
                    type="number"
                    name="sellPrice"
                    value={formData.sellPrice}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter sell price"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>


                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Add Fertilizer
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Fertilizer List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Current Stock ({fertilizers.length} items)
            </h2>
          </div>

          {fertilizers.length === 0 ? (
            <div className="text-center py-12">
              <Package className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No fertilizers in stock
              </h3>
              <p className="text-gray-500 mb-4">
                Start by adding your first fertilizer to the inventory
              </p>
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
              >
                Add Fertilizer
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Weight/Unit</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purchase Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sell Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Warehouse</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Added</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {fertilizers.map((fertilizer) => (
                    <tr key={fertilizer.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {fertilizer.categoryName && fertilizer.companyName
                            ? `${fertilizer.categoryName} - ${fertilizer.companyName}`
                            : (fertilizer.productName || fertilizer.name || '-')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{fertilizer.categoryName}</div>
                        <div className="text-xs text-gray-500">ID: {fertilizer.id}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{fertilizer.companyName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {fertilizer.quantity} units
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{fertilizer.weightPerQuantity}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">Rs. {fertilizer.purchasePrice}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">Rs. {fertilizer.sellPrice}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          {fertilizer.warehouse}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {fertilizer.createdAt ? new Date(fertilizer.createdAt).toLocaleDateString() : "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <button className="text-blue-600 hover:text-blue-900" title="View Details">
                            <Eye size={18} />
                          </button>
                          <button className="text-green-600 hover:text-green-900" title="Edit">
                            <Edit size={18} />
                          </button>
                          <button onClick={() => handleDeleteFertilizer(fertilizer.id)} className="text-red-600 hover:text-red-900" title="Delete">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Stock Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Package className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">
                  Total Fertilizers
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {fertilizers.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Building2 className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">
                  Total Companies
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {new Set(fertilizers.map((f) => f.company)).size}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Warehouse className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">
                  Warehouses Used
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {new Set(fertilizers.map((f) => f.warehouse)).size}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FertilizerStocks;
