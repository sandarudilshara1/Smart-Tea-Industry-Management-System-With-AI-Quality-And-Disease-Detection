
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">
              {company ? "Edit Fertilizer Company" : "Add New Fertilizer Company"}
            </h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X size={20} />
            </button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* ...inputs as before... */}
              {/* Company Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="name">
                  Company Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="address">
                  Address *
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
              {/* Contact Person */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="contactPerson">
                  Contact Person *
                </label>
                <input
                  type="text"
                  id="contactPerson"
                  name="contactPerson"
                  value={formData.contactPerson}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
              {/* Contact Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="contactNumber">
                  Contact Number *
                </label>
                <input
                  type="tel"
                  id="contactNumber"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
              {/* Categories */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fertilizer Categories *
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.categories.map((category, idx) => (
                    <div key={idx} className="bg-green-100 px-3 py-1 rounded-full flex items-center">
                      <span className="text-sm text-green-800">{category}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveCategory(category)}
                        className="ml-2 text-green-600 hover:text-green-800"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                  {formData.categories.length === 0 && (
                    <p className="text-sm text-gray-500 italic">No categories selected</p>
                  )}
                </div>
                <div className="flex gap-2 mb-3">
                  <select
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    onChange={handleCategorySelect}
                    value="select"
                  >
                    <option value="select" disabled>
                      Select existing category
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
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="newCategory"
                    value={formData.newCategory}
                    onChange={handleInputChange}
                    placeholder="Add new category"
                    className="flex-grow p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={handleAddNewCategory}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                    disabled={!formData.newCategory.trim()}
                  >
                    <Plus size={20} />
                  </button>
                </div>
                {formData.categories.length === 0 && (
                  <p className="text-sm text-red-500 mt-1">
                    Please add at least one fertilizer category
                  </p>
                )}
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={formData.categories.length === 0}
              >
                {company ? "Update" : "Save"}
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
    <div className="p-6">
      {/* ...rest of the UI as before... */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Fertilizer Companies
        </h1>
        <button
          className="flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white py-2 px-4 rounded-lg transition-colors"
          onClick={() => handleOpenModal()}
        >
          <Plus size={20} />
          Add Company
        </button>
      </div>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">
            Total Companies
          </h2>
          <p className="text-3xl font-bold text-green-700">
            {companies.length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">
            Total Fertilizer Types
          </h2>
          <p className="text-3xl font-bold text-green-700">
            {totalFertilizers}
          </p>
        </div>
      </div>
      {/* Companies Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Company Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact Person
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact Number
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Categories
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {companies.map((company) => (
              <tr key={company.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {company.name}
                  </div>
                  <div className="text-sm text-gray-500">{company.address}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {company.contactPerson}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {company.contactNumber}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {company.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-wrap gap-1">
                    {company.categories.map((category, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800"
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      className="text-indigo-600 hover:text-indigo-900"
                      onClick={() => handleOpenModal(company)}
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      className="text-red-600 hover:text-red-900"
                      onClick={() => handleDeleteCompany(company.id)}
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
                  colSpan="6"
                  className="px-6 py-4 text-center text-sm text-gray-500"
                >
                  No companies found. Add a company to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
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