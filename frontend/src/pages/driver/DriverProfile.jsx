import { useState, useEffect } from 'react';
import { UserCheck, Phone, Mail, MapPin, Award, CreditCard, Edit2, Save, X, HeartPulse } from 'lucide-react';
import { getMyDriverProfile, updateMyDriverProfile } from '../../api/driver';
import { useAuth } from '../../contexts/AuthContext';

export default function DriverProfile() {
  const { user: authUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [driver, setDriver] = useState(null);
  const [error, setError] = useState("");

  // Editing state
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    nic: '',
    licenseNo: '',
    licenseExpiry: '',
    experience: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");
      const profileRes = await getMyDriverProfile();
      if (profileRes.success && profileRes.data) {
        setDriver(profileRes.data);
        setFormData({
          nic: profileRes.data.nic || '',
          licenseNo: profileRes.data.licenseNo || '',
          licenseExpiry: profileRes.data.licenseExpiry ? new Date(profileRes.data.licenseExpiry).toISOString().split('T')[0] : '',
          experience: profileRes.data.experience || ''
        });
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
      // Even on error, show auth user data
      setDriver(null);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = () => {
    // If auth user's NIC exists but driver doesn't have it, prepopulate it
    if (!formData.nic && authUser?.nic) {
      setFormData(prev => ({ ...prev, nic: authUser.nic }));
    }
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    // Reset form
    setFormData({
      nic: driver?.nic || '',
      licenseNo: driver?.licenseNo || '',
      licenseExpiry: driver?.licenseExpiry ? new Date(driver.licenseExpiry).toISOString().split('T')[0] : '',
      experience: driver?.experience || ''
    });
    setIsEditing(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError("");
      const res = await updateMyDriverProfile({
        ...formData,
        experience: formData.experience === '' ? 0 : Number(formData.experience)
      });
      if (res.success) {
        setDriver(res.data);
        setIsEditing(false);
      }
    } catch (err) {
      console.error("Failed to update profile", err);
      setError(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  // Emergency Contact Editing State
  const [isEditingEmergency, setIsEditingEmergency] = useState(false);
  const [emergencyFormData, setEmergencyFormData] = useState({
    name: '',
    relationship: '',
    phone: ''
  });

  const handleEditEmergencyClick = () => {
    setEmergencyFormData({
      name: driver?.emergencyContact?.name || '',
      relationship: driver?.emergencyContact?.relationship || '',
      phone: driver?.emergencyContact?.phone || ''
    });
    setIsEditingEmergency(true);
  };

  const handleCancelEmergencyEdit = () => {
    setIsEditingEmergency(false);
  };

  const handleEmergencyChange = (e) => {
    setEmergencyFormData({ ...emergencyFormData, [e.target.name]: e.target.value });
  };

  const handleEmergencySubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError("");
      const res = await updateMyDriverProfile({
        emergencyContact: emergencyFormData
      });
      if (res.success) {
        setDriver(res.data);
        setIsEditingEmergency(false);
      }
    } catch (err) {
      console.error("Failed to update emergency contact", err);
      setError(err.message || "Failed to update emergency contact");
    } finally {
      setSaving(false);
    }
  };

  // Merge auth user data with driver profile — auth is always the source of truth for identity
  const displayName = driver?.name ||
    `${authUser?.firstName || ''} ${authUser?.lastName || ''}`.trim() ||
    'Driver';
  const displayEmail = driver?.email || authUser?.email || '';
  const displayPhone = driver?.phone || authUser?.phone || 'N/A';
  const displayAddress = driver?.address || authUser?.address || 'N/A';
  const displayNic = driver?.nic || authUser?.nic || 'Not provided';
  const isPartial = driver?._isPartialProfile;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  // If no driver at all and no auth user, show error
  if (error && !authUser && !isPartial) {
    return <div className="p-6 text-red-500 font-medium">{error}</div>;
  }

  const driverId = driver?._id || authUser?.id || '';

  return (
    <div className="max-w-7xl mx-auto pb-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-500 mt-1">Manage your personal information and view license details.</p>
      </div>

      {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">{error}</div>}

      {/* Partial profile notice */}
      {isPartial && (
        <div className="mb-6 flex items-center gap-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-5 py-3 text-sm">
          <span className="text-lg">ℹ️</span>
          <span>Your driver record hasn't been fully set up yet. Contact your Transport Manager to complete your profile, or update your License details below.</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Personal Info & Account Status */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
            <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserCheck className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">{displayName}</h2>
            <p className="text-gray-500 mb-4">Driver ID: {String(driverId).slice(-6).toUpperCase()}</p>
            
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
              <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
              Active Account
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-gray-900 mb-4 pb-4 border-b border-gray-100">Contact Information</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium text-gray-900">{displayPhone}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium text-gray-900">{displayEmail}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="font-medium text-gray-900">{displayAddress}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: License, Emergency & Additional Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* License & ID */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-8 border-b border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-xl text-gray-900 flex items-center gap-2">
                  <CreditCard className="w-6 h-6 text-emerald-600" />
                  Identification & License
                </h3>
                
                {!isEditing ? (
                  <button 
                    onClick={handleEditClick}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit Details
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={handleCancelEdit}
                      className="flex items-center gap-2 px-3 py-2 text-gray-500 hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors"
                      disabled={saving}
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                    <button 
                      onClick={handleSubmit}
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors"
                      disabled={saving}
                    >
                      <Save className="w-4 h-4" />
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                )}
              </div>
              
              {!isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">National Identity Card (NIC)</p>
                    <p className="text-lg font-medium text-gray-900 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
                      {displayNic}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Driving License Number</p>
                    <p className="text-lg font-medium text-gray-900 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
                      {driver?.licenseNo || 'Not provided'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">License Expiry Date</p>
                    <div className="flex items-center gap-3">
                      <p className="text-lg font-medium text-gray-900">
                        {driver?.licenseExpiry ? new Date(driver.licenseExpiry).toLocaleDateString() : 'N/A'}
                      </p>
                      {driver?.licenseExpiry && new Date(driver.licenseExpiry) < new Date() && (
                        <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-bold rounded-md">EXPIRED</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Driving Experience</p>
                    <div className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-emerald-600" />
                      <p className="text-lg font-medium text-gray-900">{driver?.experience || 0} Years</p>
                    </div>
                  </div>
                </div>
              ) : (
                <form id="profile-edit-form" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">National Identity Card (NIC)</label>
                    <input
                      type="text"
                      name="nic"
                      value={formData.nic}
                      onChange={handleChange}
                      placeholder="e.g. 199012345678"
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 bg-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Driving License Number</label>
                    <input
                      type="text"
                      name="licenseNo"
                      value={formData.licenseNo}
                      onChange={handleChange}
                      placeholder="e.g. B1234567"
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 bg-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">License Expiry Date</label>
                    <input
                      type="date"
                      name="licenseExpiry"
                      value={formData.licenseExpiry}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 bg-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Driving Experience (Years)</label>
                    <input
                      type="number"
                      name="experience"
                      value={formData.experience}
                      onChange={handleChange}
                      min="0"
                      max="60"
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 bg-white"
                    />
                  </div>
                </form>
              )}
            </div></div>

          {/* Emergency Contact */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-xl text-gray-900 flex items-center gap-2">
                <HeartPulse className="w-6 h-6 text-red-500" />
                Emergency Contact
              </h3>

              {!isEditingEmergency ? (
                <button 
                  onClick={handleEditEmergencyClick}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                  {driver?.emergencyContact?.name ? 'Edit Contact' : 'Add Contact'}
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button 
                    onClick={handleCancelEmergencyEdit}
                    className="flex items-center gap-2 px-3 py-2 text-gray-500 hover:bg-gray-50 rounded-lg text-sm font-medium transition-colors"
                    disabled={saving}
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                  <button 
                    onClick={handleEmergencySubmit}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors"
                    disabled={saving}
                  >
                    <Save className="w-4 h-4" />
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              )}
            </div>
            
            {!isEditingEmergency ? (
              driver?.emergencyContact?.name ? (
                <div className="bg-red-50 p-6 rounded-xl border border-red-100">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <p className="text-sm text-red-700/70 mb-1">Contact Name</p>
                      <p className="font-bold text-red-900">{driver.emergencyContact.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-red-700/70 mb-1">Relationship</p>
                      <p className="font-medium text-red-900">{driver.emergencyContact.relationship || 'Not specified'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-red-700/70 mb-1">Phone Number</p>
                      <p className="font-bold text-red-900">{driver.emergencyContact.phone}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 bg-gray-50 rounded-xl border border-gray-200 border-dashed">
                  <p className="text-gray-500">No emergency contact information provided.</p>
                  <button 
                    onClick={handleEditEmergencyClick}
                    className="mt-3 text-emerald-600 font-medium hover:text-emerald-700"
                  >
                    Add Emergency Contact
                  </button>
                </div>
              )
            ) : (
              <form id="emergency-edit-form" onSubmit={handleEmergencySubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-red-50/50 p-6 rounded-xl border border-red-100">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Name</label>
                  <input
                    type="text"
                    name="name"
                    value={emergencyFormData.name}
                    onChange={handleEmergencyChange}
                    placeholder="e.g. Jane Doe"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Relationship</label>
                  <input
                    type="text"
                    name="relationship"
                    value={emergencyFormData.relationship}
                    onChange={handleEmergencyChange}
                    placeholder="e.g. Spouse, Brother"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    name="phone"
                    value={emergencyFormData.phone}
                    onChange={handleEmergencyChange}
                    placeholder="e.g. 0712345678"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 bg-white"
                    required
                  />
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
