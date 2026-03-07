import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { createEmployee, updateEmployee } from "../../../api/employee";

const ACCENT_COLOR = "#165E52";
const BTN_COLOR = "#01251F";
const BORDER_COLOR = "#cfece6";

const initialForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  position: "",
  department: "",
  salary: "",
  hireDate: "",
  address: "",
  city: "",
  status: "Active",
};

export default function AddEmployee() {
  const navigate = useNavigate();
  const location = useLocation();
  const editingEmployee = location.state?.employee || null;
  const isEditMode = Boolean(editingEmployee);

  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    if (editingEmployee) {
      setFormData({
        ...initialForm,
        ...editingEmployee,
      });
    }
  }, [editingEmployee]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        ...formData,
        salary: Number(formData.salary),
      };

      const response = isEditMode
        ? await updateEmployee(editingEmployee.id, payload)
        : await createEmployee(payload);

      if (response?.success) {
        alert(isEditMode ? "Employee updated successfully" : "Employee created successfully");
        navigate("/owner/employers");
        return;
      }

      alert(response?.message || "Failed to save employee");
    } catch (error) {
      const message =
        error?.response?.data?.message || error?.message || "Failed to save employee";
      alert(message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {isEditMode ? "Update Employee" : "Add New Employee"}
              </h1>
              <p className="text-gray-600 mt-1">
                Owner Dashboard - {isEditMode ? "Update Employee Details" : "Create Employee Profile"}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/owner/employers")}
                type="button"
                className="flex items-center text-gray-500 hover:text-gray-700 text-lg font-medium px-4 py-2 rounded-lg border border-gray-300 bg-white transition-colors"
                style={{ borderColor: BORDER_COLOR }}
              >
                <span className="mr-2">&#8592;</span> Back
              </button>
              <button
                onClick={handleSubmit}
                type="button"
                className="px-6 py-2 rounded-lg font-medium shadow transition-colors text-white"
                style={{ backgroundColor: BTN_COLOR }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = ACCENT_COLOR;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = BTN_COLOR;
                }}
              >
                {isEditMode ? "Update Employee" : "Save Employee"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm">
          <form onSubmit={handleSubmit} className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="border-b border-gray-100 pb-4 mb-6">
                  <h3 className="text-lg font-semibold" style={{ color: ACCENT_COLOR }}>
                    Personal Details
                  </h3>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">First Name *</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border rounded-lg text-gray-900 focus:ring-2 focus:ring-[#165e52]"
                    style={{ borderColor: BORDER_COLOR }}
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Last Name *</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border rounded-lg text-gray-900 focus:ring-2 focus:ring-[#165e52]"
                    style={{ borderColor: BORDER_COLOR }}
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border rounded-lg text-gray-900 focus:ring-2 focus:ring-[#165e52]"
                    style={{ borderColor: BORDER_COLOR }}
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Phone *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border rounded-lg text-gray-900 focus:ring-2 focus:ring-[#165e52]"
                    style={{ borderColor: BORDER_COLOR }}
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border rounded-lg text-gray-900 focus:ring-2 focus:ring-[#165e52]"
                    style={{ borderColor: BORDER_COLOR }}
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border rounded-lg text-gray-900 focus:ring-2 focus:ring-[#165e52]"
                    style={{ borderColor: BORDER_COLOR }}
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div className="border-b border-gray-100 pb-4 mb-6">
                  <h3 className="text-lg font-semibold" style={{ color: ACCENT_COLOR }}>
                    Employment Details
                  </h3>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Position *</label>
                  <select
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border rounded-lg text-gray-900 focus:ring-2 focus:ring-[#165e52] bg-white"
                    style={{ borderColor: BORDER_COLOR }}
                    required
                  >
                    <option value="">Select Position</option>
                    <option value="Factory Manager">Factory Manager</option>
                    <option value="Transport Manager">Transport Manager</option>
                    <option value="Inventory Manager">Inventory Manager</option>
                    <option value="Fertilizer Manager">Fertilizer Manager</option>
                    <option value="Payment Manager">Payment Manager</option>
                    <option value="Driver">Driver</option>
                    <option value="Tea Collector">Tea Collector</option>
                    <option value="Quality Inspector">Quality Inspector</option>
                    <option value="Warehouse Supervisor">Warehouse Supervisor</option>
                    <option value="Field Worker">Field Worker</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Department *</label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border rounded-lg text-gray-900 focus:ring-2 focus:ring-[#165e52] bg-white"
                    style={{ borderColor: BORDER_COLOR }}
                    required
                  >
                    <option value="">Select Department</option>
                    <option value="Management">Management</option>
                    <option value="Transport">Transport</option>
                    <option value="Inventory">Inventory</option>
                    <option value="Fertilizer">Fertilizer</option>
                    <option value="Payment">Payment</option>
                    <option value="Quality Control">Quality Control</option>
                    <option value="Production">Production</option>
                    <option value="Field Operations">Field Operations</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Salary (Rs.) *</label>
                  <input
                    type="number"
                    name="salary"
                    value={formData.salary}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border rounded-lg text-gray-900 focus:ring-2 focus:ring-[#165e52]"
                    style={{ borderColor: BORDER_COLOR }}
                    required
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Hire Date *</label>
                  <input
                    type="date"
                    name="hireDate"
                    value={formData.hireDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border rounded-lg text-gray-900 focus:ring-2 focus:ring-[#165e52]"
                    style={{ borderColor: BORDER_COLOR }}
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">Status *</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border rounded-lg text-gray-900 focus:ring-2 focus:ring-[#165e52] bg-white"
                    style={{ borderColor: BORDER_COLOR }}
                    required
                  >
                    <option value="Active">Active</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
