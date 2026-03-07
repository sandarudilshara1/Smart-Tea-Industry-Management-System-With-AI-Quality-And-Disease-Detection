
import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash, X } from "lucide-react";
import {
  getFertilizerCompanies,
  createFertilizerCompany,
  updateFertilizerCompany,
  deleteFertilizerCompany,
} from "../../../api/owner";

// Form component
const CompanyForm = ({ company, categories, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    contactPerson: "",
    contactNumber: "",
    email: "",
    categories: [],
    newCategory: "",
  });

  useEffect(() => {
    if (company) {
      setFormData({
        name: company.name || "",
        address: company.address || "",
        contactPerson: company.contactPerson || "",
        contactNumber: company.contactNumber || "",
        email: company.email || "",
        categories: [...(company.categories || [])],
        newCategory: "",
      });
    } else {
      setFormData({
        name: "",
        address: "",
        contactPerson: "",
        contactNumber: "",
        email: "",
        categories: [],
        newCategory: "",
      });
    }
  }, [company]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleCategorySelect = (e) => {
    const selectedCategory = e.target.value;
    if (
      selectedCategory &&
      !formData.categories.includes(selectedCategory) &&
      selectedCategory !== "select"
    ) {
      setFormData({
        ...formData,
        categories: [...formData.categories, selectedCategory],
      });
    }
  };

  const handleAddNewCategory = () => {
    if (
      formData.newCategory.trim() !== "" &&
      !formData.categories.includes(formData.newCategory) &&
      !categories.includes(formData.newCategory)
    ) {
      setFormData({
        ...formData,
        categories: [...formData.categories, formData.newCategory],
        newCategory: "",
      });
    }
  };

  const handleRemoveCategory = (category) => {
    setFormData({
      ...formData,
      categories: formData.categories.filter((c) => c !== category),
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { newCategory: _, ...cleanData } = formData;
    onSave(cleanData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#165E52] to-[#1a7566] px-6 py-5 border-b border-gray-100">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <Plus className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white">
                {company ? "Edit Fertilizer Company" : "Add New Fertilizer Company"}
              </h2>
            </div>
            <button 
              onClick={onClose} 
              className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-all duration-200"
            >
              <X size={22} />
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          <form onSubmit={handleSubmit}>
            <div className="space-y-5">
              {/* Company Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="name">
                  Company Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#165E52] focus:border-[#165E52] transition-all duration-200 bg-gray-50 hover:bg-white"
                  placeholder="Enter company name"
                  required
                />
              </div>
              {/* Address */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="address">
                  Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#165E52] focus:border-[#165E52] transition-all duration-200 bg-gray-50 hover:bg-white"
                  placeholder="Enter complete address"
                  required
                />
              </div>
              {/* Contact Person */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="contactPerson">
                  Contact Person <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="contactPerson"
                  name="contactPerson"
                  value={formData.contactPerson}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#165E52] focus:border-[#165E52] transition-all duration-200 bg-gray-50 hover:bg-white"
                  placeholder="Enter contact person name"
                  required
                />
              </div>
              {/* Contact Number */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="contactNumber">
                  Contact Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  id="contactNumber"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#165E52] focus:border-[#165E52] transition-all duration-200 bg-gray-50 hover:bg-white"
                  placeholder="+94 XX XXX XXXX"
                  required
                />
              </div>
              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="email">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#165E52] focus:border-[#165E52] transition-all duration-200 bg-gray-50 hover:bg-white"
                  placeholder="company@example.com"
                  required
                />
              </div>
              {/* Categories */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-5 rounded-xl border border-gray-200">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Fertilizer Categories <span className="text-red-500">*</span>
                </label>
                
                {/* Selected Categories Display */}
                <div className="flex flex-wrap gap-2 mb-4 min-h-[40px] p-3 bg-white rounded-lg border border-gray-200">
                  {formData.categories.map((category, idx) => (
                    <div key={idx} className="bg-gradient-to-r from-[#165E52] to-[#1a7566] px-3 py-1.5 rounded-full flex items-center gap-2 shadow-sm">
                      <span className="text-sm font-medium text-white">{category}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveCategory(category)}
                        className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-0.5 transition-all duration-200"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  {formData.categories.length === 0 && (
                    <p className="text-sm text-gray-400 italic">No categories selected yet</p>
                  )}
                </div>
                
                {/* Select Existing Category */}
                <div className="mb-3">
                  <label className="block text-xs font-medium text-gray-600 mb-2">
                    Select from existing categories
                  </label>
                  <select
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#165E52] focus:border-[#165E52] transition-all duration-200 bg-white"
                    onChange={handleCategorySelect}
                    value="select"
                  >
                    <option value="select" disabled>
                      Choose a category
                    </option>
                    {categories
                      .filter((cat) => !formData.categories.includes(cat))
                      .map((category, idx) => (
                        <option key={idx} value={category}>
                          {category}
                        </option>
                      ))}
                  </select>
                </div>
                
                {/* Add New Category */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-2">
                    Or add a new category
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      name="newCategory"
                      value={formData.newCategory}
                      onChange={handleInputChange}
                      placeholder="Type new category name"
                      className="flex-grow px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#165E52] focus:border-[#165E52] transition-all duration-200 bg-white"
                    />
                    <button
                      type="button"
                      onClick={handleAddNewCategory}
                      className="bg-gradient-to-r from-[#165E52] to-[#1a7566] text-white px-5 py-3 rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      disabled={!formData.newCategory.trim()}
                    >
                      <Plus size={20} />
                      <span className="font-medium">Add</span>
                    </button>
                  </div>
                </div>
                
                {formData.categories.length === 0 && (
                  <p className="text-sm text-red-500 mt-3 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                    Please add at least one fertilizer category
                  </p>
                )}
              </div>
            </div>
            
            {/* Footer Actions */}
            <div className="mt-6 pt-5 border-t border-gray-200 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border-2 border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-[#165E52] to-[#1a7566] text-white rounded-lg font-medium hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
                disabled={formData.categories.length === 0}
              >
                {company ? (
                  <>
                    <Edit size={18} />
                    <span>Update Company</span>
                  </>
                ) : (
                  <>
                    <Plus size={18} />
                    <span>Add Company</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// ...existing code...

const FertilizerCompany = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [editingCompany, setEditingCompany] = useState(null);
  const [categories, setCategories] = useState([]);
  const [totalFertilizers, setTotalFertilizers] = useState(0);

  // Fetch companies from backend
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const data = await getFertilizerCompanies();
        if (data && data.length > 0) {
          setCompanies(data);
          // Extract unique categories
          const allCategories = Array.from(
            new Set(data.flatMap((company) => company.categories))
          );
          setCategories(allCategories);
          setTotalFertilizers(allCategories.length);
        } else {
          // Use sample data if API returns empty
          const sampleData = [
            {
              id: 1,
              name: "AgriCorp International",
              address: "No. 45, Main Street, Colombo 03",
              contactPerson: "Mr. Kamal Silva",
              contactNumber: "+94 77 123 4567",
              email: "info@agricorp.lk",
              categories: ["Urea", "NPK 15-15-15", "Potassium Nitrate"]
            },
            {
              id: 2,
              name: "FarmSolutions Ltd",
              address: "258/A, Kandy Road, Peradeniya",
              contactPerson: "Mrs. Nimal Fernando",
              contactNumber: "+94 77 234 5678",
              email: "sales@farmsolutions.lk",
              categories: ["NPK 15-15-15", "Ammonium Sulfate", "Triple Super Phosphate"]
            },
            {
              id: 3,
              name: "EcoGrow Fertilizers",
              address: "123, Galle Road, Matara",
              contactPerson: "Mr. Sunil Perera",
              contactNumber: "+94 77 345 6789",
              email: "contact@ecogrow.lk",
              categories: ["Urea", "Calcium Nitrate", "Potassium Nitrate"]
            },
            {
              id: 4,
              name: "TeaGreen Specialists",
              address: "87/B, Nuwara Eliya Road, Hatton",
              contactPerson: "Ms. Sanduni Jayawardena",
              contactNumber: "+94 77 456 7890",
              email: "info@teagreen.lk",
              categories: ["NPK 15-15-15", "Urea", "Micronutrient Mix"]
            },
            {
              id: 5,
              name: "NutriSoil Systems",
              address: "456, Temple Road, Negombo",
              contactPerson: "Mr. Ravi Kumar",
              contactNumber: "+94 77 567 8901",
              email: "support@nutrisoil.lk",
              categories: ["Triple Super Phosphate", "Ammonium Sulfate", "Calcium Nitrate"]
            },
            {
              id: 6,
              name: "Green Valley Agro",
              address: "12/3, Hill Street, Badulla",
              contactPerson: "Mrs. Chamari Dissanayake",
              contactNumber: "+94 77 678 9012",
              email: "info@greenvalley.lk",
              categories: ["Urea", "NPK 20-20-20", "Potassium Sulfate"]
            },
            {
              id: 7,
              name: "Lanka Fertilizer Co.",
              address: "789, Industrial Estate, Ratmalana",
              contactPerson: "Mr. Asanka Bandara",
              contactNumber: "+94 77 789 0123",
              email: "sales@lankafertilizer.lk",
              categories: ["NPK 15-15-15", "Urea", "DAP", "Zinc Sulfate"]
            },
            {
              id: 8,
              name: "Ceylon Agro Products",
              address: "321, Baseline Road, Colombo 09",
              contactPerson: "Mr. Pradeep Mendis",
              contactNumber: "+94 77 890 1234",
              email: "contact@ceylonagro.lk",
              categories: ["Calcium Nitrate", "Magnesium Sulfate", "Boron"]
            }
          ];
          setCompanies(sampleData);
          const allCategories = Array.from(
            new Set(sampleData.flatMap((company) => company.categories))
          );
          setCategories(allCategories);
          setTotalFertilizers(allCategories.length);
        }
      } catch (error) {
        console.error("Error fetching companies:", error);
        // Fallback to sample data on error
        const sampleData = [
          {
            id: 1,
            name: "AgriCorp International",
            address: "No. 45, Main Street, Colombo 03",
            contactPerson: "Mr. Kamal Silva",
            contactNumber: "+94 77 123 4567",
            email: "info@agricorp.lk",
            categories: ["Urea", "NPK 15-15-15", "Potassium Nitrate"]
          },
          {
            id: 2,
            name: "FarmSolutions Ltd",
            address: "258/A, Kandy Road, Peradeniya",
            contactPerson: "Mrs. Nimal Fernando",
            contactNumber: "+94 77 234 5678",
            email: "sales@farmsolutions.lk",
            categories: ["NPK 15-15-15", "Ammonium Sulfate", "Triple Super Phosphate"]
          },
          {
            id: 3,
            name: "EcoGrow Fertilizers",
            address: "123, Galle Road, Matara",
            contactPerson: "Mr. Sunil Perera",
            contactNumber: "+94 77 345 6789",
            email: "contact@ecogrow.lk",
            categories: ["Urea", "Calcium Nitrate", "Potassium Nitrate"]
          },
          {
            id: 4,
            name: "TeaGreen Specialists",
            address: "87/B, Nuwara Eliya Road, Hatton",
            contactPerson: "Ms. Sanduni Jayawardena",
            contactNumber: "+94 77 456 7890",
            email: "info@teagreen.lk",
            categories: ["NPK 15-15-15", "Urea", "Micronutrient Mix"]
          },
          {
            id: 5,
            name: "NutriSoil Systems",
            address: "456, Temple Road, Negombo",
            contactPerson: "Mr. Ravi Kumar",
            contactNumber: "+94 77 567 8901",
            email: "support@nutrisoil.lk",
            categories: ["Triple Super Phosphate", "Ammonium Sulfate", "Calcium Nitrate"]
          },
          {
            id: 6,
            name: "Green Valley Agro",
            address: "12/3, Hill Street, Badulla",
            contactPerson: "Mrs. Chamari Dissanayake",
            contactNumber: "+94 77 678 9012",
            email: "info@greenvalley.lk",
            categories: ["Urea", "NPK 20-20-20", "Potassium Sulfate"]
          },
          {
            id: 7,
            name: "Lanka Fertilizer Co.",
            address: "789, Industrial Estate, Ratmalana",
            contactPerson: "Mr. Asanka Bandara",
            contactNumber: "+94 77 789 0123",
            email: "sales@lankafertilizer.lk",
            categories: ["NPK 15-15-15", "Urea", "DAP", "Zinc Sulfate"]
          },
          {
            id: 8,
            name: "Ceylon Agro Products",
            address: "321, Baseline Road, Colombo 09",
            contactPerson: "Mr. Pradeep Mendis",
            contactNumber: "+94 77 890 1234",
            email: "contact@ceylonagro.lk",
            categories: ["Calcium Nitrate", "Magnesium Sulfate", "Boron"]
          }
        ];
        setCompanies(sampleData);
        const allCategories = Array.from(
          new Set(sampleData.flatMap((company) => company.categories))
        );
        setCategories(allCategories);
        setTotalFertilizers(allCategories.length);
      }
    };
    fetchCompanies();
  }, []);

  const handleOpenModal = (company = null) => {
    setEditingCompany(company);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCompany(null);
  };

  const handleSaveCompany = async (companyData) => {
    if (editingCompany) {
      // Update
      const updated = await updateFertilizerCompany(editingCompany.id, companyData);
      setCompanies((prev) =>
        prev.map((c) => (c.id === updated.id ? updated : c))
      );
      // Update categories
      const newCategories = Array.from(
        new Set([...categories, ...companyData.categories])
      );
      setCategories(newCategories);
      setTotalFertilizers(newCategories.length);
      handleCloseModal();
    } else {
      // Create
      const created = await createFertilizerCompany(companyData);
      setCompanies((prev) => [...prev, created]);
      const newCategories = Array.from(
        new Set([...categories, ...companyData.categories])
      );
      setCategories(newCategories);
      setTotalFertilizers(newCategories.length);
      handleCloseModal();
    }
  };

  const handleDeleteCompany = async (id) => {
    await deleteFertilizerCompany(id);
    const remainingCompanies = companies.filter((company) => company.id !== id);
    setCompanies(remainingCompanies);
    // Recalculate categories
    const remainingCategories = Array.from(
      new Set(remainingCompanies.flatMap((company) => company.categories))
    );
    setCategories(remainingCategories);
    setTotalFertilizers(remainingCategories.length);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50 to-gray-50 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Fertilizer Companies
          </h1>
          <p className="text-gray-600">Manage fertilizer suppliers and their product categories</p>
        </div>
        <button
          className="flex items-center gap-2 bg-gradient-to-r from-[#165E52] to-[#1a7566] hover:shadow-xl text-white py-3 px-6 rounded-xl transition-all duration-200 font-medium"
          onClick={() => handleOpenModal()}
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
              <span className="text-2xl font-bold text-white">#</span>
            </div>
          </div>
        </div>
      </div>
      {/* Companies Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Company Details
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Contact Person
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Contact Info
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Categories
                </th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {companies.map((company) => (
                <tr key={company.id} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-[#165E52] to-[#1a7566] flex items-center justify-center">
                          <span className="text-white font-bold text-sm">
                            {company.name.charAt(0)}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-semibold text-gray-900">
                          {company.name}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <span className="inline-block w-1 h-1 bg-gray-400 rounded-full"></span>
                          {company.address}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{company.contactPerson}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{company.contactNumber}</div>
                    <div className="text-sm text-gray-500">{company.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1.5">
                      {company.categories.slice(0, 3).map((category, index) => (
                        <span
                          key={index}
                          className="px-2.5 py-1 text-xs font-medium rounded-full bg-gradient-to-r from-[#165E52] to-[#1a7566] text-white"
                        >
                          {category}
                        </span>
                      ))}
                      {company.categories.length > 3 && (
                        <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
                          +{company.categories.length - 3} more
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                        onClick={() => handleOpenModal(company)}
                        title="Edit Company"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to delete ${company.name}?`)) {
                            handleDeleteCompany(company.id);
                          }
                        }}
                        title="Delete Company"
                      >
                        <Trash size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {companies.length === 0 && (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-12 text-center"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <Plus className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500 font-medium mb-2">No companies found</p>
                      <p className="text-sm text-gray-400">Add a company to get started</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* Company Form Modal */}
      {isModalOpen && (
        <CompanyForm
          company={editingCompany}
          categories={categories}
          onSave={handleSaveCompany}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default FertilizerCompany;