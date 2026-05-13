import { Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  createFertilizerCompany,
  updateFertilizerCompany,
  getFertilizerCompanies,
} from "../../../api/fertilizerCompanies";

const ACCENT_COLOR = "#165E52";
const BTN_COLOR = "#01251F";
const BORDER_COLOR = "#cfece6";

export default function AddFertilizerCompany() {
  const navigate = useNavigate();
  const location = useLocation();
  const editingCompany = location.state?.company;
  const isEditMode = !!editingCompany;

  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    contactPerson: "",
    contactNumber: "",
    email: "",
    categories: [],
    newCategory: "",
  });

  // Fetch existing categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getFertilizerCompanies();
        const list = Array.isArray(data) ? data : [];
        const allCategories = Array.from(
          new Set(list.flatMap((company) => company.categories || []))
        );
        setCategories(allCategories);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  // Populate form if editing
  useEffect(() => {
    if (editingCompany) {
      setFormData({
        name: editingCompany.name || "",
        address: editingCompany.address || "",
        contactPerson: editingCompany.contactPerson || "",
        contactNumber: editingCompany.contactNumber || "",
        email: editingCompany.email || "",
        categories: [...(editingCompany.categories || [])],
        newCategory: "",
      });
    }
  }, [editingCompany]);

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
    const next = formData.newCategory.trim();
    if (
      next !== "" &&
      !formData.categories.includes(next) &&
      !categories.includes(next)
    ) {
      setFormData({
        ...formData,
        categories: [...formData.categories, next],
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.address ||
      !formData.contactPerson ||
      !formData.contactNumber ||
      !formData.email
    ) {
      alert("Please fill in all required fields");
      return;
    }

    if (formData.categories.length === 0) {
      alert("Please add at least one fertilizer category");
      return;
    }

    const { newCategory, ...cleanData } = formData;

    try {
      let result;
      if (isEditMode) {
        result = await updateFertilizerCompany(editingCompany.id, cleanData);
        if (result.success) {
          alert("Company updated successfully!");
          navigate("/inventoryManager/fertilizer-companies");
        } else {
          alert(
            "Failed to update company: " + (result.message || "Unknown error")
          );
        }
      } else {
        result = await createFertilizerCompany(cleanData);
        if (result.success) {
          alert("Company added successfully!");
          navigate("/inventoryManager/fertilizer-companies");
        } else {
          alert("Failed to add company: " + (result.message || "Unknown error"));
        }
      }
    } catch (error) {
      console.error("Error saving company:", error);
      const errorMsg =
        error?.response?.data?.message || error?.message || "Unknown error";
      alert("Failed to save company: " + errorMsg);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {isEditMode ? "Edit Fertilizer Company" : "Add Fertilizer Company"}
              </h1>
              <p className="text-gray-600 mt-1">
                Inventory Manager Dashboard - {isEditMode ? "Update Company Details" : "Add a New Fertilizer Supplier"}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/inventoryManager/fertilizer-companies")}
                type="button"
                className="flex items-center text-gray-500 hover:text-gray-700 text-lg font-medium px-4 py-2 rounded-lg border border-gray-300 bg-white transition-colors"
                style={{ borderColor: BORDER_COLOR }}
              >
                <span className="mr-2">&#8592;</span> Back
              </button>
              <button
                onClick={handleSubmit}
                className="px-6 py-2 rounded-lg font-medium shadow transition-colors"
                style={{ backgroundColor: BTN_COLOR, color: "white" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = ACCENT_COLOR)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = BTN_COLOR)
                }
              >
                {isEditMode ? "Update Company" : "Save Company"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm">
          <form onSubmit={handleSubmit} className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                <div className="border-b border-gray-100 pb-4 mb-6">
                  <h3 className="text-lg font-semibold" style={{ color: ACCENT_COLOR }}>
                    Company Information
                  </h3>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Company Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border rounded-lg text-gray-900 focus:ring-2 focus:ring-[#165e52]"
                    placeholder="Enter company name"
                    style={{ borderColor: BORDER_COLOR }}
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-3 border rounded-lg text-gray-900 focus:ring-2 focus:ring-[#165e52] resize-none"
                    placeholder="Enter complete address"
                    style={{ borderColor: BORDER_COLOR }}
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Contact Person <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="contactPerson"
                    value={formData.contactPerson}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border rounded-lg text-gray-900 focus:ring-2 focus:ring-[#165e52]"
                    placeholder="Enter contact person name"
                    style={{ borderColor: BORDER_COLOR }}
                    required
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <div className="border-b border-gray-100 pb-4 mb-6">
                  <h3 className="text-lg font-semibold" style={{ color: ACCENT_COLOR }}>
                    Contact Details & Categories
                  </h3>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Contact Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border rounded-lg text-gray-900 focus:ring-2 focus:ring-[#165e52]"
                    placeholder="Enter contact number"
                    style={{ borderColor: BORDER_COLOR }}
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border rounded-lg text-gray-900 focus:ring-2 focus:ring-[#165e52]"
                    placeholder="Enter email"
                    style={{ borderColor: BORDER_COLOR }}
                    required
                  />
                </div>

                {/* Categories */}
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Fertilizer Categories <span className="text-red-500">*</span>
                  </label>

                  <div className="flex flex-col sm:flex-row gap-3 mb-3">
                    <select
                      onChange={handleCategorySelect}
                      className="flex-1 px-4 py-3 border rounded-lg text-gray-900 focus:ring-2 focus:ring-[#165e52]"
                      style={{ borderColor: BORDER_COLOR }}
                      defaultValue="select"
                    >
                      <option value="select">Select existing category</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>

                    <div className="flex gap-2 flex-1">
                      <input
                        type="text"
                        name="newCategory"
                        value={formData.newCategory}
                        onChange={handleInputChange}
                        className="flex-1 px-4 py-3 border rounded-lg text-gray-900 focus:ring-2 focus:ring-[#165e52]"
                        placeholder="New category"
                        style={{ borderColor: BORDER_COLOR }}
                      />
                      <button
                        type="button"
                        onClick={handleAddNewCategory}
                        className="px-4 py-3 rounded-lg font-medium text-white"
                        style={{ backgroundColor: BTN_COLOR }}
                        title="Add category"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Selected categories */}
                  <div className="flex flex-wrap gap-2">
                    {formData.categories.map((cat) => (
                      <span
                        key={cat}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm bg-emerald-50 text-emerald-700 border border-emerald-100"
                      >
                        {cat}
                        <button
                          type="button"
                          onClick={() => handleRemoveCategory(cat)}
                          className="text-emerald-700 hover:text-emerald-900"
                          title="Remove"
                        >
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                    {formData.categories.length === 0 && (
                      <div className="text-sm text-gray-600">No categories selected yet.</div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                type="submit"
                className="px-6 py-3 rounded-lg font-medium text-white"
                style={{ backgroundColor: BTN_COLOR }}
              >
                {isEditMode ? "Update" : "Save"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
