import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  CreditCard,
  MapPin,
  IdCard,
  Truck,
  Calendar,
  Loader,
  AlertCircle,
} from "lucide-react";
import { createDriver } from "../../../api/driver";

// Design Tokens
const ACCENT_COLOR = "#165E52";
const BORDER_COLOR = "#cfece6";
const BTN_COLOR = "#01251F";
const HEADER_BG = "#e1f4ef";
const INPUT_BG = "#ffffff";

export default function AddDriver() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);
  
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    licenseNo: "",
    nic: "",
    address: "",
    vehicleNo: "",
    licenseExpiry: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyContactRelationship: "",
    experience: "",
    status: "Available",
  });

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      // Prepare driver data
      const driverData = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        licenseNo: form.licenseNo,
        nic: form.nic,
        address: form.address,
        status: form.status,
      };

      // Add optional fields
      if (form.vehicleNo) driverData.vehicleNo = form.vehicleNo;
      if (form.licenseExpiry) driverData.licenseExpiry = form.licenseExpiry;
      if (form.experience) driverData.experience = parseInt(form.experience);
      
      // Add emergency contact if provided
      if (form.emergencyContactName && form.emergencyContactPhone) {
        driverData.emergencyContact = {
          name: form.emergencyContactName,
          phone: form.emergencyContactPhone,
          relationship: form.emergencyContactRelationship || 'Not Specified'
        };
      }

      console.log('Creating driver with data:', driverData);
      const result = await createDriver(driverData);
      console.log('Driver created:', result);
      
      showNotification('Driver added successfully!', 'success');
      
      setTimeout(() => {
        navigate('/transportManager/drivers');
      }, 1500);
    } catch (error) {
      console.error('Error creating driver:', error);
      
      let errorMessage = 'Failed to add driver';
      if (error.message) {
        errorMessage = error.message;
      } else if (error.errors) {
        // Mongoose validation errors
        errorMessage = error.errors.join(', ');
      }
      
      showNotification(errorMessage, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fdfc] p-6">
      <div className="max-w-4xl mx-auto rounded-2xl border shadow-2xl overflow-hidden bg-white" style={{ borderColor: BORDER_COLOR }}>
        {/* Notification */}
        {notification && (
          <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${
            notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          } text-white font-medium`}>
            {notification.message}
          </div>
        )}

        {/* Header */}
        <div className="px-8 py-6 border-b" style={{ backgroundColor: HEADER_BG, borderColor: BORDER_COLOR }}>
          <h2 className="text-2xl font-semibold" style={{ color: ACCENT_COLOR }}>
            Add New Driver
          </h2>
          <p className="text-sm mt-1 opacity-80" style={{ color: ACCENT_COLOR }}>
            Complete all required fields marked with *
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block mb-1 text-sm font-medium" style={{ color: ACCENT_COLOR }}>
              Full Name *
            </label>
            <div className="flex items-center gap-3 rounded-lg p-3 border" style={{ borderColor: BORDER_COLOR, backgroundColor: INPUT_BG }}>
              <User className="text-[rgba(22,94,82,0.8)]" size={24} />
              <input
                id="name"
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Kasun Perera"
                required
                className="w-full bg-transparent focus:outline-none text-sm"
                style={{ color: ACCENT_COLOR }}
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block mb-1 text-sm font-medium" style={{ color: ACCENT_COLOR }}>
              Email Address *
            </label>
            <div className="flex items-center gap-3 rounded-lg p-3 border" style={{ borderColor: BORDER_COLOR, backgroundColor: INPUT_BG }}>
              <Mail className="text-[rgba(22,94,82,0.8)]" size={24} />
              <input
                id="email"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="driver@example.com"
                required
                className="w-full bg-transparent focus:outline-none text-sm"
                style={{ color: ACCENT_COLOR }}
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block mb-1 text-sm font-medium" style={{ color: ACCENT_COLOR }}>
              Phone Number *
            </label>
            <div className="flex items-center gap-3 rounded-lg p-3 border" style={{ borderColor: BORDER_COLOR, backgroundColor: INPUT_BG }}>
              <Phone className="text-[rgba(22,94,82,0.8)]" size={24} />
              <input
                id="phone"
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="0771234567"
                required
                pattern="[0-9]{10}"
                title="Enter a valid 10 digit phone number"
                className="w-full bg-transparent focus:outline-none text-sm"
                style={{ color: ACCENT_COLOR }}
              />
            </div>
          </div>

          {/* License Number */}
          <div>
            <label htmlFor="licenseNo" className="block mb-1 text-sm font-medium" style={{ color: ACCENT_COLOR }}>
              License Number *
            </label>
            <div className="flex items-center gap-3 rounded-lg p-3 border" style={{ borderColor: BORDER_COLOR, backgroundColor: INPUT_BG }}>
              <CreditCard className="text-[rgba(22,94,82,0.8)]" size={24} />
              <input
                id="licenseNo"
                type="text"
                name="licenseNo"
                value={form.licenseNo}
                onChange={handleChange}
                placeholder="B1234567"
                required
                className="w-full bg-transparent focus:outline-none text-sm"
                style={{ color: ACCENT_COLOR }}
              />
            </div>
          </div>

          {/* NIC */}
          <div>
            <label htmlFor="nic" className="block mb-1 text-sm font-medium" style={{ color: ACCENT_COLOR }}>
              NIC *
            </label>
            <div className="flex items-center gap-3 rounded-lg p-3 border" style={{ borderColor: BORDER_COLOR, backgroundColor: INPUT_BG }}>
              <IdCard className="text-[rgba(22,94,82,0.8)]" size={24} />
              <input
                id="nic"
                type="text"
                name="nic"
                value={form.nic}
                onChange={handleChange}
                placeholder="881234567V or 199812345678"
                required
                className="w-full bg-transparent focus:outline-none text-sm"
                style={{ color: ACCENT_COLOR }}
              />
            </div>
          </div>

          {/* License Expiry Date */}
          <div>
            <label htmlFor="licenseExpiry" className="block mb-1 text-sm font-medium" style={{ color: ACCENT_COLOR }}>
              License Expiry Date
            </label>
            <div className="flex items-center gap-3 rounded-lg p-3 border" style={{ borderColor: BORDER_COLOR, backgroundColor: INPUT_BG }}>
              <Calendar className="text-[rgba(22,94,82,0.8)]" size={24} />
              <input
                id="licenseExpiry"
                type="date"
                name="licenseExpiry"
                value={form.licenseExpiry}
                onChange={handleChange}
                className="w-full bg-transparent focus:outline-none text-sm"
                style={{ color: ACCENT_COLOR }}
              />
            </div>
          </div>

          {/* Address - Full Width */}
          <div className="md:col-span-2">
            <label htmlFor="address" className="block mb-1 text-sm font-medium" style={{ color: ACCENT_COLOR }}>
              Address *
            </label>
            <div className="flex items-center gap-3 rounded-lg p-3 border" style={{ borderColor: BORDER_COLOR, backgroundColor: INPUT_BG }}>
              <MapPin className="text-[rgba(22,94,82,0.8)]" size={24} />
              <input
                id="address"
                type="text"
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="123 Main Street, Colombo"
                required
                className="w-full bg-transparent focus:outline-none text-sm"
                style={{ color: ACCENT_COLOR }}
              />
            </div>
          </div>

          {/* Vehicle Number */}
          <div>
            <label htmlFor="vehicleNo" className="block mb-1 text-sm font-medium" style={{ color: ACCENT_COLOR }}>
              Vehicle Number
            </label>
            <div className="flex items-center gap-3 rounded-lg p-3 border" style={{ borderColor: BORDER_COLOR, backgroundColor: INPUT_BG }}>
              <Truck className="text-[rgba(22,94,82,0.8)]" size={24} />
              <input
                id="vehicleNo"
                type="text"
                name="vehicleNo"
                value={form.vehicleNo}
                onChange={handleChange}
                placeholder="WP CD-1234"
                className="w-full bg-transparent focus:outline-none text-sm"
                style={{ color: ACCENT_COLOR }}
              />
            </div>
          </div>

          {/* Experience */}
          <div>
            <label htmlFor="experience" className="block mb-1 text-sm font-medium" style={{ color: ACCENT_COLOR }}>
              Experience (Years)
            </label>
            <div className="flex items-center gap-3 rounded-lg p-3 border" style={{ borderColor: BORDER_COLOR, backgroundColor: INPUT_BG }}>
              <User className="text-[rgba(22,94,82,0.8)]" size={24} />
              <input
                id="experience"
                type="number"
                name="experience"
                value={form.experience}
                onChange={handleChange}
                placeholder="5"
                min="0"
                className="w-full bg-transparent focus:outline-none text-sm"
                style={{ color: ACCENT_COLOR }}
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label htmlFor="status" className="block mb-1 text-sm font-medium" style={{ color: ACCENT_COLOR }}>
              Status
            </label>
            <div className="flex items-center gap-3 rounded-lg p-3 border" style={{ borderColor: BORDER_COLOR, backgroundColor: INPUT_BG }}>
              <AlertCircle className="text-[rgba(22,94,82,0.8)]" size={24} />
              <select
                id="status"
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full bg-transparent focus:outline-none text-sm"
                style={{ color: ACCENT_COLOR }}
              >
                <option value="Available">Available</option>
                <option value="On Route">On Route</option>
                <option value="On Leave">On Leave</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Divider */}
          <div className="md:col-span-2 border-t pt-4" style={{ borderColor: BORDER_COLOR }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: ACCENT_COLOR }}>
              Emergency Contact (Optional)
            </h3>
          </div>

          {/* Emergency Contact Name */}
          <div>
            <label htmlFor="emergencyContactName" className="block mb-1 text-sm font-medium" style={{ color: ACCENT_COLOR }}>
              Contact Name
            </label>
            <div className="flex items-center gap-3 rounded-lg p-3 border" style={{ borderColor: BORDER_COLOR, backgroundColor: INPUT_BG }}>
              <User className="text-[rgba(22,94,82,0.8)]" size={24} />
              <input
                id="emergencyContactName"
                type="text"
                name="emergencyContactName"
                value={form.emergencyContactName}
                onChange={handleChange}
                placeholder="e.g. Nimal Silva"
                className="w-full bg-transparent focus:outline-none text-sm"
                style={{ color: ACCENT_COLOR }}
              />
            </div>
          </div>

          {/* Emergency Contact Phone */}
          <div>
            <label htmlFor="emergencyContactPhone" className="block mb-1 text-sm font-medium" style={{ color: ACCENT_COLOR }}>
              Contact Phone
            </label>
            <div className="flex items-center gap-3 rounded-lg p-3 border" style={{ borderColor: BORDER_COLOR, backgroundColor: INPUT_BG }}>
              <Phone className="text-[rgba(22,94,82,0.8)]" size={24} />
              <input
                id="emergencyContactPhone"
                type="tel"
                name="emergencyContactPhone"
                value={form.emergencyContactPhone}
                onChange={handleChange}
                placeholder="0771234567"
                className="w-full bg-transparent focus:outline-none text-sm"
                style={{ color: ACCENT_COLOR }}
              />
            </div>
          </div>

          {/* Emergency Contact Relationship */}
          <div className="md:col-span-2">
            <label htmlFor="emergencyContactRelationship" className="block mb-1 text-sm font-medium" style={{ color: ACCENT_COLOR }}>
              Relationship
            </label>
            <div className="flex items-center gap-3 rounded-lg p-3 border" style={{ borderColor: BORDER_COLOR, backgroundColor: INPUT_BG }}>
              <User className="text-[rgba(22,94,82,0.8)]" size={24} />
              <input
                id="emergencyContactRelationship"
                type="text"
                name="emergencyContactRelationship"
                value={form.emergencyContactRelationship}
                onChange={handleChange}
                placeholder="e.g. Spouse, Parent, Sibling"
                className="w-full bg-transparent focus:outline-none text-sm"
                style={{ color: ACCENT_COLOR }}
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="md:col-span-2 flex gap-4">
            <button
              type="button"
              onClick={() => navigate('/transportManager/drivers')}
              className="flex-1 rounded-lg border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold text-lg py-3 flex items-center justify-center gap-2 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-lg hover:bg-[#164d44] disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold text-lg py-3 flex items-center justify-center gap-2 shadow-lg transition-colors"
              style={{ backgroundColor: BTN_COLOR }}
            >
              {submitting ? (
                <>
                  <Loader className="animate-spin" size={20} />
                  Adding Driver...
                </>
              ) : (
                <>
                  <User size={20} />
                  Add Driver
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
