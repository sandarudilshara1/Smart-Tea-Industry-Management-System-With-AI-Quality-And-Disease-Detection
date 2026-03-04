import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash, X, Search, Mail, Phone, MapPin, Briefcase, Calendar, DollarSign, User } from "lucide-react";
import { getAllEmployees, createEmployee, updateEmployee, deleteEmployee } from "../../../api/employee";

const ACCENT_COLOR = "#165e52";
const BUTTON_COLOR = "#172526";
const BORDER_COLOR = "#cfece6";
const CARD_BG = "#fff";

// Employee Form Modal Component
const EmployeeForm = ({ employee, onSave, onClose }) => {
  const [formData, setFormData] = useState({
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
  });

  useEffect(() => {
    if (employee) {
      setFormData(employee);
    }
  }, [employee]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200">
        <div className="sticky top-0 bg-white border-b p-6 z-10" style={{ borderColor: BORDER_COLOR }}>
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold" style={{ color: ACCENT_COLOR }}>
              {employee ? "Edit Employee" : "Add New Employee"}
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <X size={24} className="text-gray-600" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* First Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                First Name *
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className="w-full p-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                required
              />
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Last Name *
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className="w-full p-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-10 p-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Phone *
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full pl-10 p-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            {/* Position */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Position *
              </label>
              <select
                name="position"
                value={formData.position}
                onChange={handleInputChange}
                className="w-full p-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
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

            {/* Department */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Department *
              </label>
              <select
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                className="w-full p-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
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

            {/* Salary */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Salary (Rs.) *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  name="salary"
                  value={formData.salary}
                  onChange={handleInputChange}
                  className="w-full pl-10 p-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            {/* Hire Date */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Hire Date *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  name="hireDate"
                  value={formData.hireDate}
                  onChange={handleInputChange}
                  className="w-full pl-10 p-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Address
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full pl-10 p-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* City */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                City
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                className="w-full p-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Status *
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full p-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                required
              >
                <option value="Active">Active</option>
                <option value="On Leave">On Leave</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              style={{ borderColor: BORDER_COLOR }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 rounded-lg text-white font-medium shadow-md hover:shadow-lg transition-all"
              style={{ backgroundColor: BUTTON_COLOR }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = ACCENT_COLOR}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = BUTTON_COLOR}
            >
              {employee ? "Update Employee" : "Add Employee"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Main Component
const EmployerManagement = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  // Fetch employees from backend
  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await getAllEmployees();
      if (response.success) {
        // Transform data to match frontend format
        const transformedEmployees = response.data.employees.map(emp => ({
          id: emp._id,
          firstName: emp.firstName,
          lastName: emp.lastName,
          email: emp.email,
          phone: emp.phone,
          position: emp.position,
          department: emp.department,
          salary: emp.salary.toString(),
          hireDate: emp.hireDate.split('T')[0],
          address: emp.address || '',
          city: emp.city || '',
          status: emp.status
        }));
        setEmployees(transformedEmployees);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      showNotification('Failed to load employees', 'error');
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleOpenModal = (employee = null) => {
    setEditingEmployee(employee);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingEmployee(null);
  };

  const handleSaveEmployee = async (employeeData) => {
    try {
      if (editingEmployee) {
        // Update existing employee
        const response = await updateEmployee(editingEmployee.id, {
          ...employeeData,
          salary: Number(employeeData.salary)
        });
        if (response.success) {
          showNotification('Employee updated successfully', 'success');
          fetchEmployees();
        }
      } else {
        // Add new employee
        const response = await createEmployee({
          ...employeeData,
          salary: Number(employeeData.salary)
        });
        if (response.success) {
          showNotification('Employee added successfully', 'success');
          fetchEmployees();
        }
      }
      handleCloseModal();
    } catch (error) {
      console.error('Error saving employee:', error);
      showNotification(
        error?.response?.data?.message || 'Failed to save employee',
        'error'
      );
    }
  };

  const handleDeleteEmployee = async (id) => {
    if (window.confirm("Are you sure you want to delete this employee?")) {
      try {
        const response = await deleteEmployee(id);
        if (response.success) {
          showNotification('Employee deleted successfully', 'success');
          fetchEmployees();
        }
      } catch (error) {
        console.error('Error deleting employee:', error);
        showNotification(
          error?.response?.data?.message || 'Failed to delete employee',
          'error'
        );
      }
    }
  };

  // Filter employees
  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.position.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = filterDepartment === "All" || emp.department === filterDepartment;
    const matchesStatus = filterStatus === "All" || emp.status === filterStatus;
    
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  // Calculate statistics
  const stats = {
    total: employees.length,
    active: employees.filter((e) => e.status === "Active").length,
    onLeave: employees.filter((e) => e.status === "On Leave").length,
    inactive: employees.filter((e) => e.status === "Inactive").length,
  };

  const departments = ["All", ...new Set(employees.map((e) => e.department))];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="bg-white shadow-md border-b mb-6">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-1 text-gray-900">
                Employer Management
              </h1>
              <p className="text-gray-600">
                Manage your workforce and employee information
              </p>
            </div>
            <button
              className="flex items-center gap-2 px-6 py-2 rounded-lg font-medium shadow transition-colors text-white"
              style={{ backgroundColor: BUTTON_COLOR }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = ACCENT_COLOR}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = BUTTON_COLOR}
              onClick={() => handleOpenModal()}
            >
              <Plus size={24} />
              Add Employee
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total Employees", value: stats.total, icon: User },
            { label: "Active", value: stats.active, icon: User },
            { label: "On Leave", value: stats.onLeave, icon: User },
            { label: "Inactive", value: stats.inactive, icon: User },
          ].map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className="bg-white p-6 rounded-lg shadow-md border border-black transition duration-200 hover:shadow-lg flex items-center justify-between"
                style={{ borderColor: BORDER_COLOR }}
              >
                <div>
                  <p className="text-sm font-medium text-black">{stat.label}</p>
                  <p className="text-2xl font-bold text-black">{stat.value}</p>
                </div>
                <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center">
                  <Icon size={28} color="black" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 border" style={{ borderColor: BORDER_COLOR }}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, or position..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 p-3 border rounded-lg focus:ring-2 focus:border-transparent transition-all"
                style={{ borderColor: BORDER_COLOR }}
              />
            </div>

            {/* Department Filter */}
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:border-transparent transition-all"
              style={{ borderColor: BORDER_COLOR }}
            >
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept === "All" ? "All Departments" : dept}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:border-transparent transition-all"
              style={{ borderColor: BORDER_COLOR }}
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="On Leave">On Leave</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Employees Table */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="bg-white rounded-lg shadow-md overflow-hidden border" style={{ borderColor: BORDER_COLOR }}>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead style={{ backgroundColor: ACCENT_COLOR }}>
                <tr className="text-white">
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Employee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Position</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Salary</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y" style={{ divideColor: BORDER_COLOR }}>
                {filteredEmployees.map((employee, idx) => (
                  <tr key={employee.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold" style={{ backgroundColor: ACCENT_COLOR }}>
                          {employee.firstName[0]}{employee.lastName[0]}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">
                            {employee.firstName} {employee.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{employee.city}</div>
                        </div>
                      </div>
                    </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Mail size={14} />
                        {employee.email}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Phone size={14} />
                        {employee.phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Briefcase size={16} style={{ color: ACCENT_COLOR }} />
                      <span className="font-semibold text-gray-900">{employee.position}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                      {employee.department}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-gray-900">Rs. {parseInt(employee.salary).toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        employee.status === "Active"
                          ? "bg-green-100 text-green-700"
                          : employee.status === "On Leave"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {employee.status}
                    </span>
                  </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          className="p-2 rounded-lg transition-colors hover:bg-gray-100"
                          style={{ color: ACCENT_COLOR }}
                          onClick={() => handleOpenModal(employee)}
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          onClick={() => handleDeleteEmployee(employee.id)}
                        >
                          <Trash size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredEmployees.length === 0 && (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                      <User size={48} className="mx-auto mb-4 text-gray-300" />
                      <p className="text-lg font-semibold">No employees found</p>
                      <p className="text-sm">Try adjusting your search or filters</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Employee Form Modal */}
      {isModalOpen && (
        <EmployeeForm
          employee={editingEmployee}
          onSave={handleSaveEmployee}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default EmployerManagement;
