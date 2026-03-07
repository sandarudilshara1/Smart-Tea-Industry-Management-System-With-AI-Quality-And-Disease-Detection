import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Edit, Trash, Search, Mail, Phone, Briefcase, User } from "lucide-react";
import { getAllEmployees, deleteEmployee } from "../../../api/employee";

const ACCENT_COLOR = "#165e52";
const BUTTON_COLOR = "#172526";
const BORDER_COLOR = "#cfece6";

const EmployerManagement = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await getAllEmployees();
      if (response.success) {
        const transformedEmployees = response.data.employees.map((emp) => ({
          id: emp._id,
          firstName: emp.firstName,
          lastName: emp.lastName,
          email: emp.email,
          phone: emp.phone,
          position: emp.position,
          department: emp.department,
          salary: emp.salary.toString(),
          hireDate: emp.hireDate.split("T")[0],
          address: emp.address || "",
          city: emp.city || "",
          status: emp.status,
        }));
        setEmployees(transformedEmployees);
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
      showNotification("Failed to load employees", "error");
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleDeleteEmployee = async (id) => {
    if (window.confirm("Are you sure you want to delete this employee?")) {
      try {
        const response = await deleteEmployee(id);
        if (response.success) {
          showNotification("Employee deleted successfully", "success");
          fetchEmployees();
        }
      } catch (error) {
        console.error("Error deleting employee:", error);
        showNotification(
          error?.response?.data?.message || "Failed to delete employee",
          "error"
        );
      }
    }
  };

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.position.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDepartment =
      filterDepartment === "All" || emp.department === filterDepartment;
    const matchesStatus = filterStatus === "All" || emp.status === filterStatus;

    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const stats = {
    total: employees.length,
    active: employees.filter((e) => e.status === "Active").length,
    onLeave: employees.filter((e) => e.status === "On Leave").length,
    inactive: employees.filter((e) => e.status === "Inactive").length,
  };

  const departments = ["All", ...new Set(employees.map((e) => e.department))];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg text-white shadow-lg ${
            notification.type === "success" ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {notification.message}
        </div>
      )}

      <div className="bg-white shadow-md border-b mb-6">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-1 text-gray-900">Employer Management</h1>
              <p className="text-gray-600">Manage your workforce and employee information</p>
            </div>
            <button
              className="flex items-center gap-2 px-6 py-2 rounded-lg font-medium shadow transition-colors text-white"
              style={{ backgroundColor: BUTTON_COLOR }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = ACCENT_COLOR;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = BUTTON_COLOR;
              }}
              onClick={() => navigate("/owner/employers/add")}
            >
              <Plus size={24} />
              Add Employee
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total Employees", value: stats.total },
            { label: "Active", value: stats.active },
            { label: "On Leave", value: stats.onLeave },
            { label: "Inactive", value: stats.inactive },
          ].map((stat, idx) => (
            <div
              key={idx}
              className="bg-white p-6 rounded-lg shadow-md border transition duration-200 hover:shadow-lg flex items-center justify-between"
              style={{ borderColor: BORDER_COLOR }}
            >
              <div>
                <p className="text-sm font-medium text-black">{stat.label}</p>
                <p className="text-2xl font-bold text-black">{stat.value}</p>
              </div>
              <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center">
                <User size={28} color="black" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 border" style={{ borderColor: BORDER_COLOR }}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                {!loading &&
                  filteredEmployees.map((employee) => (
                    <tr key={employee.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                            style={{ backgroundColor: ACCENT_COLOR }}
                          >
                            {employee.firstName[0]}
                            {employee.lastName[0]}
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
                        <span className="font-bold text-gray-900">
                          Rs. {parseInt(employee.salary, 10).toLocaleString()}
                        </span>
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
                            onClick={() =>
                              navigate("/owner/employers/edit", { state: { employee } })
                            }
                            title="Edit Employee"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            onClick={() => handleDeleteEmployee(employee.id)}
                            title="Delete Employee"
                          >
                            <Trash size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                {!loading && filteredEmployees.length === 0 && (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                      <User size={48} className="mx-auto mb-4 text-gray-300" />
                      <p className="text-lg font-semibold">No employees found</p>
                      <p className="text-sm">Try adjusting your search or filters</p>
                    </td>
                  </tr>
                )}
                {loading && (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                      Loading employees...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployerManagement;
