import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../../../api/auth";

// Design Tokens
const ACCENT_COLOR = "#165E52";
const BTN_COLOR = "#01251F";
const BORDER_COLOR = "#cfece6";
const INPUT_BG = "#ffffff";

const roles = [
  { label: 'Factory Manager', value: 'factory_manager' },
  { label: 'Inventory Manager', value: 'inventory_manager' },
  { label: 'Fertilizer Manager', value: 'fertilizer_manager' },
  { label: 'Transport Manager', value: 'transport_manager' }
];

const factoryOptions = [
  { id: "1", name: "Wawlugala Tea Factory" },
  { id: "2", name: "Miyanawathura Tea Factory" },
  { id: "3", name: "Andaradeniya Tea Factory" },
  { id: "4", name: "Batuwangala Tea Factory" },
  { id: "5", name: "Duli Ella Tea Factory" },
  { id: "6", name: "Devonia Tea Factory" },
  { id: "7", name: "Fortune Tea Factory" },
  { id: "8", name: "Galaxi Tea Factory" },
  { id: "9", name: "Ruhunu Tea Factory" },
];

export default function AddManagersInterface() {
  const [formData, setFormData] = useState({
    name: "",
    password: "",
    email: "",
    nic: "",
    mobile: "",
    role: "",
    factory: "",
    address: ""
  });

  const [dropdowns, setDropdowns] = useState({
    role: false,
    factory: false,
  });

  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const toggleDropdown = (dropdown) => {
    setDropdowns({
      ...dropdowns,
      [dropdown]: !dropdowns[dropdown],
    });
  };

  const selectOption = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    });
    setDropdowns({
      ...dropdowns,
      [field]: false,
    });
  };

  const handleSave = async () => {
    try {
      // Find the factory name
      const selectedFactory = factoryOptions.find(f => f.id === formData.factory);
      
      const payload = {
        firstName: formData.name.split(' ')[0] || formData.name,
        lastName: formData.name.split(' ').slice(1).join(' ') || '',
        email: formData.email,
        password: formData.password,
        role: formData.role,
        nic: formData.nic,
        phone: formData.mobile,
        address: formData.address,
        factoryId: formData.factory ? Number(formData.factory) : null,
        factoryName: selectedFactory ? selectedFactory.name : ''
      };
      
      console.log("Data sent to backend:", payload);

      const response = await register(payload);

      if (response.success) {
        alert('Manager created successfully!');
        navigate("/owner/managers");
      } else {
        alert(response.message || 'Failed to create manager');
      }
    } catch (error) {
      console.error("Error creating manager:", error);
      alert(error?.response?.data?.message || 'Failed to create manager');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Add Manager</h1>
              <p className="text-gray-600 mt-1">Owner Dashboard - Register and Assign Manager Access</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                type="button"
                className="flex items-center text-gray-500 hover:text-gray-700 text-lg font-medium px-4 py-2 rounded-lg border bg-white transition-colors"
                style={{ borderColor: BORDER_COLOR }}
              >
                <span className="mr-2">&#8592;</span> Back
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2 rounded-lg text-white font-medium shadow transition-colors"
                style={{ backgroundColor: BTN_COLOR }}
                type="button"
              >
                Save Manager
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            {/* Left Column */}
            <div className="space-y-6">
              <div className="border-b border-gray-100 pb-4 mb-6">
                <h3 className="text-lg font-semibold" style={{ color: ACCENT_COLOR }}>
                  Personal Information
                </h3>
              </div>

              {/* Name */}
              <div>
                <label className="block mb-2 text-sm font-medium" style={{ color: ACCENT_COLOR }}>
                  Name :
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full rounded-lg px-4 py-3 border h-12"
                  style={{
                    borderColor: BORDER_COLOR,
                    backgroundColor: INPUT_BG,
                    color: ACCENT_COLOR,
                  }}
                  placeholder="Enter manager name"
                />
              </div>

              {/* Address */}
              <div>
                <label className="block mb-2 text-sm font-medium" style={{ color: ACCENT_COLOR }}>
                  Address :
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full rounded-lg px-4 py-3 border h-12"
                  style={{
                    borderColor: BORDER_COLOR,
                    backgroundColor: INPUT_BG,
                    color: ACCENT_COLOR,
                  }}
                  placeholder="Enter manager address"
                />
              </div>

              {/* NIC */}
              <div>
                <label className="block mb-2 text-sm font-medium" style={{ color: ACCENT_COLOR }}>
                  NIC :
                </label>
                <input
                  type="text"
                  name="nic"
                  value={formData.nic}
                  onChange={handleInputChange}
                  className="w-full rounded-lg px-4 py-3 border h-12"
                  style={{
                    borderColor: BORDER_COLOR,
                    backgroundColor: INPUT_BG,
                    color: ACCENT_COLOR,
                  }}
                  placeholder="Enter NIC number"
                />
              </div>

              {/* Mobile */}
              <div>
                <label className="block mb-2 text-sm font-medium" style={{ color: ACCENT_COLOR }}>
                  Mobile Number :
                </label>
                <input
                  type="tel"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleInputChange}
                  className="w-full rounded-lg px-4 py-3 border h-12"
                  style={{
                    borderColor: BORDER_COLOR,
                    backgroundColor: INPUT_BG,
                    color: ACCENT_COLOR,
                  }}
                  placeholder="Enter mobile number"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block mb-2 text-sm font-medium" style={{ color: ACCENT_COLOR }}>
                  E-mail :
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full rounded-lg px-4 py-3 border h-12"
                  style={{
                    borderColor: BORDER_COLOR,
                    backgroundColor: INPUT_BG,
                    color: ACCENT_COLOR,
                  }}
                  placeholder="Enter email address"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block mb-2 text-sm font-medium" style={{ color: ACCENT_COLOR }}>
                  Password :
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full rounded-lg px-4 py-3 border h-12"
                  style={{
                    borderColor: BORDER_COLOR,
                    backgroundColor: INPUT_BG,
                    color: ACCENT_COLOR,
                  }}
                  placeholder="Enter password"
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div className="border-b border-gray-100 pb-4 mb-6">
                <h3 className="text-lg font-semibold" style={{ color: ACCENT_COLOR }}>
                  Role & Assignment
                </h3>
              </div>

              {/* Role Dropdown */}
              <div>
                <label className="block mb-2 text-sm font-medium" style={{ color: ACCENT_COLOR }}>
                  Role :
                </label>
                <div className="relative">
                  <input
                    type="text"
                    readOnly
                    value={roles.find(r => r.value === formData.role)?.label || ""}
                    onClick={() => toggleDropdown('role')}
                    placeholder="Select Role"
                    className="w-full rounded-lg px-4 py-3 border h-12 cursor-pointer"
                    style={{
                      borderColor: BORDER_COLOR,
                      backgroundColor: INPUT_BG,
                      color: ACCENT_COLOR,
                    }}
                  />
                  <ChevronDown size={20} className={`absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none ${dropdowns.role ? 'rotate-180' : ''}`} />
                  {dropdowns.role && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-green-400 rounded-lg shadow-2xl z-50">
                      {roles.map((role) => (
                        <button
                          key={role.value}
                          type="button"
                          onClick={() => selectOption('role', role.value)}
                          className="w-full px-4 py-3 text-left hover:bg-green-50 focus:bg-green-100 transition-colors"
                        >
                          {role.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Factory Dropdown */}
              <div>
                <label className="block mb-2 text-sm font-medium" style={{ color: ACCENT_COLOR }}>
                  Factory :
                </label>
                <div className="relative">
                  <input
                    type="text"
                    readOnly
                    value={factoryOptions.find(f => f.id === formData.factory)?.name || ""}
                    onClick={() => toggleDropdown('factory')}
                    placeholder="Select Factory"
                    className="w-full rounded-lg px-4 py-3 border h-12 cursor-pointer"
                    style={{
                      borderColor: BORDER_COLOR,
                      backgroundColor: INPUT_BG,
                      color: ACCENT_COLOR,
                    }}
                  />
                  <ChevronDown size={20} className={`absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none ${dropdowns.factory ? 'rotate-180' : ''}`} />
                  {dropdowns.factory && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-green-400 rounded-lg shadow-2xl z-50">
                      {factoryOptions.map((factory) => (
                        <button
                          key={factory.id}
                          type="button"
                          onClick={() => selectOption('factory', factory.id)}
                          className="w-full px-4 py-3 text-left hover:bg-green-50 focus:bg-green-100 transition-colors"
                        >
                          {factory.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
