import { Plus, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { createFertilizerCompany, updateFertilizerCompany, getFertilizerCompanies } from "../../../api/owner";

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
        if (data && data.length > 0) {
          const allCategories = Array.from(
            new Set(data.flatMap((company) => company.categories))
          );
          setCategories(allCategories);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name || !formData.address || !formData.contactPerson || !formData.contactNumber || !formData.email) {
      alert("Please fill in all required fields");
      return;
    }

    if (formData.categories.length === 0) {
      alert("Please add at least one fertilizer category");
      return;
    }

    const { newCategory, ...cleanData } = formData;
  console.log('Submitting company data:', JSON.stringify(cleanData, null, 2));

    try {
      let result;
      if (isEditMode) {
        result = await updateFertilizerCompany(editingCompany.id, cleanData);
        if (result.success) {
          alert("Company updated successfully!");
          navigate("/owner/fertilizer-companies");
        } else {
          alert("Failed to update company: " + (result.message || "Unknown error"));
        }
      } else {
        result = await createFertilizerCompany(cleanData);
        if (result.success) {
          alert("Company added successfully!");
          navigate("/owner/fertilizer-companies");
        } else {
          alert("Failed to add company: " + (result.message || "Unknown error"));
        }
      }
    } catch (error) {
      console.error("Error saving company:", error);
      const errorMsg = error?.response?.data?.message || error?.message || "Unknown error";
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
                Owner Dashboard - {isEditMode ? "Update Company Details" : "Add a New Fertilizer Supplier"}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/owner/fertilizer-companies")}
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

                {/* Company Name */}
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

                {/* Address */}
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

                {/* Contact Person */}
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

                {/* Contact Number */}
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Contact Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border rounded-lg text-gray-900 focus:ring-2 focus:ring-[#165e52]"
                    placeholder="+94 XX XXX XXXX"
                    style={{ borderColor: BORDER_COLOR }}
                    required
                  />
                </div>

                {/* Email */}
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
                    placeholder="company@example.com"
                    style={{ borderColor: BORDER_COLOR }}
                    required
                  />
                </div>

                {/* Categories */}
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Fertilizer Categories
                  </label>
                  <div className="space-y-4 rounded-xl border bg-[#f7fcfa] p-5" style={{ borderColor: BORDER_COLOR }}>
                    {/* Selected Categories Display */}
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Selected Categories ({formData.categories.length})
                      </p>
                      <div className="flex flex-wrap gap-2 min-h-[60px] p-3 bg-white rounded-lg border" style={{ borderColor: BORDER_COLOR }}>
                        {formData.categories.map((category, idx) => (
                          <div
                            key={idx}
                            className="bg-gradient-to-r from-[#165E52] to-[#1a7566] px-3 py-1.5 rounded-full flex items-center gap-2 shadow-sm h-fit"
                          >
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
                          <p className="text-sm text-gray-400 italic m-auto">No categories selected yet</p>
                        )}
                      </div>
                    </div>

                    {/* Select Existing Category */}
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">
                        Select from existing categories
                      </label>
                      <select
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#165e52] bg-white"
                        style={{ borderColor: BORDER_COLOR }}
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
                      <label className="block text-sm font-medium text-gray-600 mb-2">
                        Or add a new category
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          name="newCategory"
                          value={formData.newCategory}
                          onChange={handleInputChange}
                          placeholder="Type new category name"
                          className="flex-grow px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#165e52] bg-white"
                          style={{ borderColor: BORDER_COLOR }}
                        />
                        <button
                          type="button"
                          onClick={handleAddNewCategory}
                          className="text-white px-5 py-3 rounded-lg font-medium shadow transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                          style={{ backgroundColor: BTN_COLOR }}
                          onMouseEnter={(e) =>
                            !formData.newCategory.trim() ? null : (e.currentTarget.style.backgroundColor = ACCENT_COLOR)
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.backgroundColor = BTN_COLOR)
                          }
                          disabled={!formData.newCategory.trim()}
                        >
                          <Plus size={20} />
                          <span>Add</span>
                        </button>
                      </div>
                    </div>

                    {formData.categories.length === 0 && (
                      <p className="text-sm text-red-500 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                        Please add at least one fertilizer category
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
