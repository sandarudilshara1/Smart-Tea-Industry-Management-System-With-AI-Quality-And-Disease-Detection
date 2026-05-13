import { useState, useEffect } from 'react';
import { Truck, ShieldCheck, AlertTriangle, Calendar, FileText, CheckCircle, XCircle, Edit2, Save, X, Plus } from 'lucide-react';
import { getMyDriverProfile } from '../../api/driver';
import axios from '../../api/axios';

export default function DriverVehicle() {
  const [loading, setLoading] = useState(true);
  const [driver, setDriver] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);
  const [error, setError] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const initialFormState = {
    vehicleNumber: '',
    vehicleType: 'Lorry',
    capacity: '',
    fuelType: 'Diesel',
    mileage: '',
    registrationNumber: '',
    model: '',
    manufacturingYear: new Date().getFullYear(),
    nextServiceDate: '',
    insuranceExpiryDate: '',
    licenseExpiryDate: '',
    status: 'Available'
  };
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    fetchVehicleData();
  }, []);

  const fetchVehicleData = async () => {
    try {
      setLoading(true);
      setError("");

      const profileRes = await getMyDriverProfile();
      if (profileRes.success && profileRes.data) {
        const driverData = profileRes.data;
        setDriver(driverData);

        const vehiclesRes = await axios.get('/vehicles');
        if (vehiclesRes.data.success) {
          // Find all vehicles assigned to this driver
          const myVehicles = vehiclesRes.data.data.filter(v => 
            v.driverId === driverData._id || 
            (v.driverId && v.driverId._id === driverData._id) || 
            v.vehicleNumber === driverData.vehicleNo // fallback
          );
          
          setVehicles(myVehicles);
          if (myVehicles.length > 0 && !selectedVehicleId) {
            setSelectedVehicleId(myVehicles[0]._id);
          }
        }
      }
    } catch (err) {
      console.error("Error fetching vehicle:", err);
      setError("Failed to load vehicle information.");
    } finally {
      setLoading(false);
    }
  };

  const populateForm = (v) => {
    if (!v) {
      setFormData(initialFormState);
      return;
    }
    setFormData({
      vehicleNumber: v.vehicleNumber || '',
      vehicleType: v.vehicleType || 'Lorry',
      capacity: v.capacity || '',
      fuelType: v.fuelType || 'Diesel',
      mileage: v.mileage || '',
      registrationNumber: v.registrationNumber || '',
      model: v.model || '',
      manufacturingYear: v.manufacturingYear || new Date().getFullYear(),
      nextServiceDate: v.nextServiceDate ? new Date(v.nextServiceDate).toISOString().split('T')[0] : '',
      insuranceExpiryDate: v.insuranceExpiryDate ? new Date(v.insuranceExpiryDate).toISOString().split('T')[0] : '',
      licenseExpiryDate: v.licenseExpiryDate ? new Date(v.licenseExpiryDate).toISOString().split('T')[0] : '',
      status: v.status || 'Available'
    });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEditClick = (v) => {
    populateForm(v);
    setSelectedVehicleId(v._id);
    setIsEditing(true);
    setIsAddingNew(false);
  };

  const handleAddNewClick = () => {
    populateForm(null);
    setIsAddingNew(true);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setIsAddingNew(false);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError("");
      
      const payload = {
        ...formData,
        driverId: driver._id
      };

      if (!isAddingNew && selectedVehicleId) {
        // Update existing vehicle
        const res = await axios.put(`/vehicles/${selectedVehicleId}`, payload);
        if (res.data.success) {
          setIsEditing(false);
          fetchVehicleData();
        }
      } else {
        // Create new vehicle
        const res = await axios.post('/vehicles', payload);
        if (res.data.success) {
          setIsEditing(false);
          setIsAddingNew(false);
          setSelectedVehicleId(res.data.data._id);
          fetchVehicleData();
        }
      }
    } catch (err) {
      console.error("Failed to save vehicle", err);
      setError(err.response?.data?.message || err.message || "Failed to save vehicle details");
    } finally {
      setSaving(false);
    }
  };

  if (loading && vehicles.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Available': return 'bg-green-100 text-green-800';
      case 'In Use': return 'bg-blue-100 text-blue-800';
      case 'Maintenance': return 'bg-amber-100 text-amber-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isExpired = (dateString) => {
    if (!dateString) return false;
    return new Date(dateString) < new Date();
  };

  const isExpiringSoon = (dateString) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = Math.abs(date - today);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && diffDays > 0;
  };

  const getExpiryIndicator = (dateString) => {
    if (!dateString) return <span className="text-gray-400">Unknown</span>;
    if (isExpired(dateString)) return <span className="text-red-600 font-medium flex items-center gap-1"><XCircle className="w-4 h-4"/> Expired</span>;
    if (isExpiringSoon(dateString)) return <span className="text-amber-600 font-medium flex items-center gap-1"><AlertTriangle className="w-4 h-4"/> Expiring Soon</span>;
    return <span className="text-green-600 font-medium flex items-center gap-1"><CheckCircle className="w-4 h-4"/> Valid</span>;
  };

  const activeVehicle = vehicles.find(v => v._id === selectedVehicleId) || vehicles[0];

  return (
    <div className="max-w-7xl mx-auto pb-10">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Vehicles</h1>
          <p className="text-gray-500 mt-1">Manage your fleet of vehicles, maintenance status, and insurance.</p>
        </div>
        {!isEditing && (
          <button 
            onClick={handleAddNewClick}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add Vehicle
          </button>
        )}
        {isEditing && (
          <div className="flex items-center gap-3">
            <button 
              onClick={handleCancel}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors"
              disabled={saving}
            >
              <X className="w-4 h-4" /> Cancel
            </button>
            <button 
              onClick={handleSubmit}
              form="vehicle-form"
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
              disabled={saving}
            >
              <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>

      {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">{error}</div>}

      {/* Vehicle Selection Tabs */}
      {!isEditing && vehicles.length > 1 && (
        <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
          {vehicles.map(v => (
            <button
              key={v._id}
              onClick={() => setSelectedVehicleId(v._id)}
              className={`flex items-center gap-3 px-5 py-3 rounded-xl border font-medium transition-all whitespace-nowrap
                ${selectedVehicleId === v._id 
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-800 shadow-sm' 
                  : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                }`}
            >
              <Truck className={`w-5 h-5 ${selectedVehicleId === v._id ? 'text-emerald-600' : 'text-gray-400'}`} />
              <div>
                <div className="font-bold">{v.vehicleNumber}</div>
                <div className="text-xs font-normal opacity-80">{v.model}</div>
              </div>
            </button>
          ))}
        </div>
      )}

      {vehicles.length === 0 && !isEditing ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <Truck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">No Vehicles Found</h3>
          <p className="text-gray-500 max-w-md mx-auto mb-6">
            You currently do not have any vehicles assigned to your profile.
          </p>
          <button 
            onClick={handleAddNewClick}
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5" /> Add First Vehicle
          </button>
        </div>
      ) : (!isEditing && activeVehicle) || isEditing ? (
        <form id="vehicle-form" onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Vehicle Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
              {!isEditing && activeVehicle ? (
                <>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-8 border-b border-gray-100">
                    <div className="flex items-center gap-5">
                      <div className="w-20 h-20 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                        <Truck className="w-10 h-10" />
                      </div>
                      <div>
                        <h2 className="text-3xl font-bold text-gray-900">{activeVehicle.vehicleNumber}</h2>
                        <p className="text-lg text-gray-500">{activeVehicle.model} ({activeVehicle.manufacturingYear})</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`px-4 py-2 rounded-lg font-bold uppercase tracking-wider text-sm ${getStatusColor(activeVehicle.status)}`}>
                        {activeVehicle.status}
                      </span>
                      <button 
                        type="button"
                        onClick={() => handleEditClick(activeVehicle)}
                        className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="Edit this vehicle"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-8 gap-x-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Vehicle Type</p>
                      <p className="font-medium text-gray-900">{activeVehicle.vehicleType}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Capacity</p>
                      <p className="font-medium text-gray-900">{activeVehicle.capacity}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Fuel Type</p>
                      <p className="font-medium text-gray-900">{activeVehicle.fuelType}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Current Mileage</p>
                      <p className="font-medium text-gray-900">{activeVehicle.mileage ? `${activeVehicle.mileage.toLocaleString()} km` : 'Unknown'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Registration No</p>
                      <p className="font-medium text-gray-900">{activeVehicle.registrationNumber || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Assigned Driver</p>
                      <p className="font-medium text-gray-900">{driver?.name}</p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-6">
                  <h3 className="font-bold text-lg border-b pb-4">{isAddingNew ? 'Add New Vehicle' : 'Edit Vehicle Details'}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Number Plate *</label>
                      <input type="text" name="vehicleNumber" value={formData.vehicleNumber} onChange={handleChange} required className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-emerald-500 focus:ring-emerald-500" placeholder="e.g. WP-1234" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Model</label>
                      <input type="text" name="model" value={formData.model} onChange={handleChange} className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-emerald-500 focus:ring-emerald-500" placeholder="e.g. Isuzu Elf" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Manufacturing Year</label>
                      <input type="number" name="manufacturingYear" value={formData.manufacturingYear} onChange={handleChange} className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-emerald-500 focus:ring-emerald-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type</label>
                      <select name="vehicleType" value={formData.vehicleType} onChange={handleChange} className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-emerald-500 focus:ring-emerald-500 bg-white">
                        <option value="Lorry">Lorry</option>
                        <option value="Tractor">Tractor</option>
                        <option value="Cab">Cab</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                      <input type="text" name="capacity" value={formData.capacity} onChange={handleChange} placeholder="e.g. 600kg" className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-emerald-500 focus:ring-emerald-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Fuel Type</label>
                      <select name="fuelType" value={formData.fuelType} onChange={handleChange} className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-emerald-500 focus:ring-emerald-500 bg-white">
                        <option value="Diesel">Diesel</option>
                        <option value="Petrol">Petrol</option>
                        <option value="Electric">Electric</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Current Mileage (km)</label>
                      <input type="number" name="mileage" value={formData.mileage} onChange={handleChange} className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-emerald-500 focus:ring-emerald-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Registration Number</label>
                      <input type="text" name="registrationNumber" value={formData.registrationNumber} onChange={handleChange} className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-emerald-500 focus:ring-emerald-500" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Maintenance & Compliance Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-gray-50 p-4 border-b border-gray-100 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-gray-700" />
                <h3 className="font-bold text-gray-900">Compliance & Maintenance</h3>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Next Service */}
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-sm font-medium text-gray-700">Next Service Date</span>
                    {!isEditing && activeVehicle && getExpiryIndicator(activeVehicle.nextServiceDate)}
                  </div>
                  {isEditing ? (
                    <input type="date" name="nextServiceDate" value={formData.nextServiceDate} onChange={handleChange} className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-emerald-500 focus:ring-emerald-500" />
                  ) : (
                    <div className={`p-3 rounded-lg border flex items-center gap-3 ${isExpired(activeVehicle?.nextServiceDate) ? 'bg-red-50 border-red-100' : 'bg-gray-50 border-gray-200'}`}>
                      <AlertTriangle className={`w-5 h-5 ${isExpired(activeVehicle?.nextServiceDate) ? 'text-red-500' : 'text-gray-400'}`} />
                      <span className={`font-medium ${isExpired(activeVehicle?.nextServiceDate) ? 'text-red-700' : 'text-gray-900'}`}>
                        {activeVehicle?.nextServiceDate ? new Date(activeVehicle.nextServiceDate).toLocaleDateString() : 'Not scheduled'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Insurance Expiry */}
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-sm font-medium text-gray-700">Insurance Expiry</span>
                    {!isEditing && activeVehicle && getExpiryIndicator(activeVehicle.insuranceExpiryDate)}
                  </div>
                  {isEditing ? (
                    <input type="date" name="insuranceExpiryDate" value={formData.insuranceExpiryDate} onChange={handleChange} className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-emerald-500 focus:ring-emerald-500" />
                  ) : (
                    <div className={`p-3 rounded-lg border flex items-center gap-3 ${isExpired(activeVehicle?.insuranceExpiryDate) ? 'bg-red-50 border-red-100' : 'bg-gray-50 border-gray-200'}`}>
                      <FileText className={`w-5 h-5 ${isExpired(activeVehicle?.insuranceExpiryDate) ? 'text-red-500' : 'text-gray-400'}`} />
                      <span className={`font-medium ${isExpired(activeVehicle?.insuranceExpiryDate) ? 'text-red-700' : 'text-gray-900'}`}>
                        {activeVehicle?.insuranceExpiryDate ? new Date(activeVehicle.insuranceExpiryDate).toLocaleDateString() : 'Not recorded'}
                      </span>
                    </div>
                  )}
                </div>
                
                {/* License Expiry */}
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-sm font-medium text-gray-700">Revenue License Expiry</span>
                    {!isEditing && activeVehicle && getExpiryIndicator(activeVehicle.licenseExpiryDate)}
                  </div>
                  {isEditing ? (
                    <input type="date" name="licenseExpiryDate" value={formData.licenseExpiryDate} onChange={handleChange} className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-emerald-500 focus:ring-emerald-500" />
                  ) : (
                    <div className={`p-3 rounded-lg border flex items-center gap-3 ${isExpired(activeVehicle?.licenseExpiryDate) ? 'bg-red-50 border-red-100' : 'bg-gray-50 border-gray-200'}`}>
                      <FileText className={`w-5 h-5 ${isExpired(activeVehicle?.licenseExpiryDate) ? 'text-red-500' : 'text-gray-400'}`} />
                      <span className={`font-medium ${isExpired(activeVehicle?.licenseExpiryDate) ? 'text-red-700' : 'text-gray-900'}`}>
                        {activeVehicle?.licenseExpiryDate ? new Date(activeVehicle.licenseExpiryDate).toLocaleDateString() : 'Not recorded'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </form>
      ) : null}
    </div>
  );
}
