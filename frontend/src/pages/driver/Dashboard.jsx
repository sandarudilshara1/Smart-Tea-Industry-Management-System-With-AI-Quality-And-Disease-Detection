import { useState, useEffect } from 'react';
import {
  Truck, Route, Award, Navigation,
  MapPin, Clock, Calendar, AlertTriangle, ShieldCheck
} from 'lucide-react';
import { getMyDriverProfile, updateTripStatus } from '../../api/driver';
import { getMyEmergencies, reportEmergency } from '../../api/emergency';
import { useAuth } from '../../contexts/AuthContext';
import axios from '../../api/axios';

const Overlay = ({ children, onClose }) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
    onClick={(e) => e.target === e.currentTarget && onClose()}
  >
    {children}
  </div>
);

const StatCard = ({ title, value, subtitle, icon: Icon, colorClass, bgColorClass, iconColorClass }) => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${bgColorClass || 'bg-blue-100'}`}>
          <Icon className={`w-6 h-6 ${iconColorClass || 'text-blue-600'}`} />
        </div>
      </div>
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-1">{value}</h3>
        <p className="text-gray-600 text-sm font-medium">{title}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
      </div>
    </div>
  );
};

export default function DriverDashboard() {
  const { user: authUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [driver, setDriver] = useState(null);
  const [vehicle, setVehicle] = useState(null);
  const [replacementVehicle, setReplacementVehicle] = useState(null);
  const [error, setError] = useState("");
  const [elapsedTime, setElapsedTime] = useState("");
  const [statusUpdating, setStatusUpdating] = useState(false);

  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [emergencySubmitting, setEmergencySubmitting] = useState(false);
  const [emergencyError, setEmergencyError] = useState("");
  const [emergencySuccess, setEmergencySuccess] = useState("");
  const [myEmergencies, setMyEmergencies] = useState([]);
  const [lastOpenEmergencyKey, setLastOpenEmergencyKey] = useState(null);
  const [emergencyForm, setEmergencyForm] = useState({
    issueType: 'Breakdown',
    severity: 'Medium',
    locationText: '',
    description: '',
  });

  useEffect(() => {
    let timer;
    if (driver?.currentTrip?.startTime && !['Completed', 'Not Started'].includes(driver.currentTrip.status)) {
      timer = setInterval(() => {
        const start = new Date(driver.currentTrip.startTime);
        const now = new Date();
        const diff = Math.floor((now - start) / 1000); // total seconds
        const h = Math.floor(diff / 3600);
        const m = Math.floor((diff % 3600) / 60);
        const s = diff % 60;
        setElapsedTime(`${h > 0 ? h + 'h ' : ''}${m}m ${s}s`);
      }, 1000);
    } else {
      setElapsedTime("");
    }
    return () => clearInterval(timer);
  }, [driver?.currentTrip]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Poll for emergency status updates so the driver gets notified when a replacement is assigned.
  useEffect(() => {
    if (!driver?._id) return;

    const poll = async () => {
      try {
        const emRes = await getMyEmergencies();
        const list = emRes?.data?.emergencies || [];
        setMyEmergencies(Array.isArray(list) ? list : []);
      } catch {
        // ignore polling errors
      }
    };

    // Poll a bit more frequently only when a trip is active.
    const hasTrip = !!(driver?.currentTrip?.routeId) && driver?.currentTrip?.status !== 'Completed';
    if (!hasTrip) return;

    poll();
    const id = setInterval(poll, 10000);
    return () => clearInterval(id);
  }, [driver?._id, driver?.currentTrip?.routeId, driver?.currentTrip?.status]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      // 1. Get my driver profile
      const profileRes = await getMyDriverProfile();
      if (profileRes.success && profileRes.data) {
        const driverData = profileRes.data;
        setDriver(driverData);

        // 2. If vehicle assigned, fetch vehicle details
        if (driverData.vehicleNo) {
          try {
            // This is a naive lookup by vehicleNo since the driver model only has vehicleNo string.
            // A better way would be driver.vehicleId, but we will fetch all and filter for now.
            const vehiclesRes = await axios.get('/vehicles');
            if (vehiclesRes.data.success) {
              const myVehicle = vehiclesRes.data.data.find(v => v.vehicleNumber === driverData.vehicleNo);
              if (myVehicle) setVehicle(myVehicle);
            }
          } catch (err) {
            console.error("Failed to fetch vehicle", err);
          }
        }
      }

      // 3. Fetch my recent emergency reports (best-effort)
      try {
        const emRes = await getMyEmergencies();
        const list = emRes?.data?.emergencies || [];
        setMyEmergencies(Array.isArray(list) ? list : []);
      } catch (emErr) {
        // Don't block dashboard for emergency API failures
        console.warn('Failed to fetch emergencies', emErr);
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Failed to load your dashboard. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    if (!driver || !driver._id) return;
    setStatusUpdating(true);
    try {
      const res = await updateTripStatus(driver._id, newStatus);
      if (res.success) {
        setDriver(res.data.driver);
      }
    } catch (err) {
      alert(err.message || 'Failed to update status');
    } finally {
      setStatusUpdating(false);
    }
  };

  const hasActiveTrip = !!(driver?.currentTrip?.routeId) && driver?.currentTrip?.status !== 'Completed';

  const openEmergency = (myEmergencies || []).find((e) => !['Resolved', 'Cancelled'].includes(e.status));
  const openEmergencyKey = openEmergency
    ? `${openEmergency._id}:${openEmergency.status}:${openEmergency.replacementVehicleNumber || ''}`
    : null;

  useEffect(() => {
    let cancelled = false;

    const replacementNumber = openEmergency?.replacementVehicleNumber;
    if (!replacementNumber) {
      setReplacementVehicle(null);
      return;
    }

    const fetchReplacementVehicle = async () => {
      try {
        const vehiclesRes = await axios.get('/vehicles');
        const list = vehiclesRes?.data?.data;
        const vehicles = Array.isArray(list) ? list : [];
        const found = vehicles.find((v) => v?.vehicleNumber === replacementNumber) || null;
        if (!cancelled) setReplacementVehicle(found || { vehicleNumber: replacementNumber });
      } catch {
        if (!cancelled) setReplacementVehicle({ vehicleNumber: replacementNumber });
      }
    };

    fetchReplacementVehicle();
    return () => {
      cancelled = true;
    };
  }, [openEmergency?.replacementVehicleNumber]);

  useEffect(() => {
    if (!openEmergencyKey) return;
    if (lastOpenEmergencyKey && openEmergencyKey !== lastOpenEmergencyKey) {
      // Only show a toast-like message for the most important transition.
      if (openEmergency?.status === 'Replacement Assigned' && openEmergency?.replacementVehicleNumber) {
        setEmergencySuccess(`Replacement vehicle ${openEmergency.replacementVehicleNumber} is on the way.`);
      }
    }
    setLastOpenEmergencyKey(openEmergencyKey);
  }, [openEmergencyKey, lastOpenEmergencyKey, openEmergency]);

  const openEmergencyModal = () => {
    setEmergencyError('');
    setEmergencySuccess('');
    setEmergencyForm({
      issueType: 'Breakdown',
      severity: 'Medium',
      locationText: '',
      description: '',
    });
    setShowEmergencyModal(true);
  };

  const submitEmergency = async (e) => {
    e.preventDefault();
    setEmergencyError('');
    setEmergencySuccess('');

    if (!emergencyForm.description.trim()) {
      setEmergencyError('Please describe the issue.');
      return;
    }

    setEmergencySubmitting(true);
    try {
      const resp = await reportEmergency(emergencyForm);
      if (resp?.success) {
        setEmergencySuccess('Emergency reported. Transport Manager will assign a replacement.');
        setShowEmergencyModal(false);
        // Refresh emergency status list
        fetchDashboardData();
      } else {
        setEmergencyError(resp?.message || 'Failed to report emergency');
      }
    } catch (err) {
      setEmergencyError(err?.message || 'Failed to report emergency');
    } finally {
      setEmergencySubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900">{error}</h3>
        <button onClick={fetchDashboardData} className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
          Retry
        </button>
      </div>
    );
  }

  if (!driver) {
    return (
      <div className="p-6 text-center">
        <h3 className="text-lg font-medium text-gray-900">Driver profile not found</h3>
        <p className="text-gray-500 mt-2">Please contact the transport manager to set up your profile.</p>
      </div>
    );
  }

  // Use driver data or fall back to auth user data
  const displayName = driver?.name ||
    `${authUser?.firstName || ''} ${authUser?.lastName || ''}`.trim() ||
    'Driver';
  const displayStatus = driver?.status || 'Available';

  // Determine today's routes
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayName = daysOfWeek[new Date().getDay()];

  // Note: We don't have collectionDays in assignedRoutes array on driver model directly, 
  // so we just show all assigned routes as "Active Assignments" for now.
  const assignedRoutes = driver?.assignedRoutes || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome, {displayName.split(' ')[0]}</h1>
          <p className="text-gray-500 mt-1">Here is your schedule for today, {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </div>

        <div className={`px-4 py-2 rounded-full font-medium text-sm flex items-center gap-2 ${displayStatus === 'Available' ? 'bg-green-100 text-green-800' :
            displayStatus === 'On Route' ? 'bg-blue-100 text-blue-800' :
              'bg-gray-100 text-gray-800'
          }`}>
          <div className={`w-2 h-2 rounded-full ${displayStatus === 'Available' ? 'bg-green-500' :
              displayStatus === 'On Route' ? 'bg-blue-500' :
                'bg-gray-500'
            }`}></div>
          {displayStatus}
        </div>
      </div>

      {emergencySuccess ? (
        <div className="p-4 rounded-lg bg-green-50 border border-green-200 text-green-800 text-sm font-medium">
          {emergencySuccess}
        </div>
      ) : null}

      {openEmergency && hasActiveTrip ? (

        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-900 text-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-bold">Emergency status: {openEmergency.status}</p>
              <p className="mt-1 opacity-90">
                Vehicle: <span className="font-semibold">{openEmergency.vehicleNumber}</span> · {openEmergency.issueType} ({openEmergency.severity})
              </p>
              {openEmergency.replacementVehicleNumber ? (
                <div className="mt-1">
                  <p>
                    Replacement vehicle <span className="font-semibold">{openEmergency.replacementVehicleNumber}</span> is on the way.
                  </p>
                  {replacementVehicle ? (
                    <div className="mt-2 inline-flex flex-wrap items-center gap-2 rounded-lg bg-white/70 border border-red-200 px-3 py-2 text-xs text-red-900">
                      <span className="font-semibold">{replacementVehicle.vehicleNumber}</span>
                      {replacementVehicle.vehicleType ? <span>· {replacementVehicle.vehicleType}</span> : null}
                      {replacementVehicle.model ? <span>· {replacementVehicle.model}</span> : null}
                      {replacementVehicle.capacity ? <span>· {replacementVehicle.capacity}</span> : null}
                    </div>
                  ) : null}
                </div>
              ) : (
                <p className="mt-1">Waiting for Transport Manager replacement assignment.</p>
              )}
            </div>
            <button
              type="button"
              onClick={fetchDashboardData}
              className="px-3 py-2 rounded-lg bg-white border border-red-200 text-red-700 font-semibold hover:bg-red-100"
            >
              Refresh
            </button>
          </div>
        </div>
      ) : null}

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Assigned Routes"
          value={assignedRoutes.length}
          subtitle="Active route assignments"
          icon={Route}
          bgColorClass="bg-emerald-100"
          iconColorClass="text-emerald-600"
        />
        <StatCard
          title="Assigned Vehicle"
          value={driver.vehicleNo || 'None'}
          subtitle={vehicle ? `${vehicle.vehicleType} - ${vehicle.model}` : "Pending assignment"}
          icon={Truck}
          bgColorClass="bg-blue-100"
          iconColorClass="text-blue-600"
        />
        <StatCard
          title="Total Trips"
          value={driver.totalTrips || 0}
          subtitle="Lifetime completed trips"
          icon={Navigation}
          bgColorClass="bg-purple-100"
          iconColorClass="text-purple-600"
        />
        <StatCard
          title="Driver Rating"
          value={driver.rating ? `${driver.rating.toFixed(1)} / 5.0` : 'N/A'}
          subtitle="Based on feedback"
          icon={Award}
          bgColorClass="bg-amber-100"
          iconColorClass="text-amber-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CURRENT TRIP & TODAY'S SCHEDULE */}
        <div className="lg:col-span-2 space-y-6">

          {/* Active Trip Tracker Panel */}
          {driver?.currentTrip && driver.currentTrip.status !== 'Completed' && (
            <div className="bg-white rounded-xl shadow-md border-2 border-emerald-500 overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-emerald-600 animate-pulse"></div>
              <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-emerald-50/30">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="animate-pulse w-3 h-3 bg-emerald-500 rounded-full"></span>
                    <h2 className="text-lg font-bold text-gray-900">Current Trip Tracker</h2>
                  </div>
                  <p className="text-sm font-medium text-emerald-700">{driver.currentTrip.routeName}</p>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold bg-white text-emerald-700 border border-emerald-200 shadow-sm">
                    {driver.currentTrip.status}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs text-gray-500 font-medium mb-1">Elapsed Time</p>
                    <p className="text-xl font-black text-gray-900 font-mono tracking-wider">
                      {elapsedTime || (driver.currentTrip.status === 'Not Started' ? '00m 00s' : '...')}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs text-gray-500 font-medium mb-1">Vehicle No</p>
                    <p className="text-xl font-bold text-gray-900">{driver.currentTrip.vehicleNo}</p>
                  </div>
                </div>

                {/* Status Update Buttons */}
                <div className="space-y-3">
                  <p className="text-sm font-medium text-gray-700">Update Trip Status:</p>
                  <div className="flex flex-wrap gap-2">
                    {driver.currentTrip.status === 'Not Started' && (
                      <button onClick={() => handleUpdateStatus('Started')} disabled={statusUpdating}
                        className="flex-1 py-3 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition">
                        ▶ Start Route
                      </button>
                    )}
                    {['Started', 'Returning'].includes(driver.currentTrip.status) && (
                      <button onClick={() => handleUpdateStatus('Collecting')} disabled={statusUpdating}
                        className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition">
                        🌿 Collecting Leaves
                      </button>
                    )}
                    {driver.currentTrip.status === 'Collecting' && (
                      <button onClick={() => handleUpdateStatus('Returning')} disabled={statusUpdating}
                        className="flex-1 py-3 bg-amber-500 text-white font-bold rounded-lg hover:bg-amber-600 transition">
                        ↩ Returning
                      </button>
                    )}
                    {['Returning', 'Started', 'Collecting'].includes(driver.currentTrip.status) && (
                      <button onClick={() => handleUpdateStatus('Reached Destination')} disabled={statusUpdating}
                        className="flex-1 py-3 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition">
                        📍 Reached Destination
                      </button>
                    )}
                    {driver.currentTrip.status === 'Reached Destination' && (
                      <button onClick={() => handleUpdateStatus('Completed')} disabled={statusUpdating}
                        className="flex-1 py-3 bg-gray-900 text-white font-bold rounded-lg hover:bg-black transition">
                        🏁 Complete Trip
                      </button>
                    )}
                  </div>
                </div>

                {/* Emergency Reporting */}
                <div className="mt-5">
                  <button
                    type="button"
                    onClick={openEmergencyModal}
                    disabled={!hasActiveTrip}
                    className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg font-bold transition ${hasActiveTrip ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      }`}
                  >
                    <AlertTriangle className="w-5 h-5" />
                    Report Emergency / Breakdown
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900">Route History</h2>
              <span className="text-sm text-emerald-600 font-medium">{assignedRoutes.length} Total</span>
            </div>

            {assignedRoutes.length > 0 ? (
              <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
                {assignedRoutes.slice().reverse().map((route, idx) => (
                  <div key={idx} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-gray-50 text-gray-500 rounded-lg">
                          <MapPin className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-md font-bold text-gray-900">{route.routeName}</h3>
                          <p className="text-sm text-gray-500 mt-1">Assigned on {new Date(route.assignedDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Route className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">No Routes Found</h3>
                <p className="text-gray-500">You don't have any route history.</p>
              </div>
            )}
          </div>
        </div>

        {/* VEHICLE SNAPSHOT */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Vehicle Snapshot</h2>

            {vehicle ? (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                    <Truck className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{vehicle.vehicleNumber}</h3>
                    <p className="text-gray-500 text-sm">{vehicle.model} • {vehicle.capacity}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 text-sm flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4" /> Insurance
                    </span>
                    <span className={`text-sm font-medium ${new Date(vehicle.insuranceExpiryDate) < new Date() ? 'text-red-600' : 'text-gray-900'
                      }`}>
                      {vehicle.insuranceExpiryDate ? new Date(vehicle.insuranceExpiryDate).toLocaleDateString() : 'Unknown'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 text-sm flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" /> Next Service
                    </span>
                    <span className={`text-sm font-medium ${new Date(vehicle.nextServiceDate) < new Date() ? 'text-red-600' : 'text-gray-900'
                      }`}>
                      {vehicle.nextServiceDate ? new Date(vehicle.nextServiceDate).toLocaleDateString() : 'Unknown'}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <Truck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No vehicle information available.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showEmergencyModal ? (
        <EmergencyModal
          form={emergencyForm}
          setForm={setEmergencyForm}
          submitting={emergencySubmitting}
          error={emergencyError}
          onClose={() => setShowEmergencyModal(false)}
          onSubmit={submitEmergency}
        />
      ) : null}
    </div>
  );
}

// Emergency modal
// (Kept inline to avoid introducing new UI primitives)
function EmergencyModal({ form, setForm, submitting, error, onClose, onSubmit }) {
  return (
    <Overlay onClose={onClose}>
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Report Emergency</h3>
            <p className="text-sm text-gray-500">Send a breakdown/emergency report to the Transport Manager.</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>

        <form onSubmit={onSubmit} className="p-5 space-y-4">
          {error ? (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
          ) : null}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Issue Type</label>
              <select
                className="w-full border rounded-lg px-3 py-2 bg-white"
                value={form.issueType}
                onChange={(e) => setForm((p) => ({ ...p, issueType: e.target.value }))}
              >
                <option value="Breakdown">Breakdown</option>
                <option value="Accident">Accident</option>
                <option value="Medical">Medical</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Severity</label>
              <select
                className="w-full border rounded-lg px-3 py-2 bg-white"
                value={form.severity}
                onChange={(e) => setForm((p) => ({ ...p, severity: e.target.value }))}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Location (optional)</label>
            <input
              className="w-full border rounded-lg px-3 py-2"
              placeholder="e.g., Near Neluwa junction"
              value={form.locationText}
              onChange={(e) => setForm((p) => ({ ...p, locationText: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
            <textarea
              className="w-full border rounded-lg px-3 py-2 min-h-[110px]"
              placeholder="Describe the issue and what you need..."
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border border-gray-200 font-semibold text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`flex-1 py-2.5 rounded-lg font-bold text-white ${submitting ? 'bg-gray-400' : 'bg-red-600 hover:bg-red-700'}`}
            >
              {submitting ? 'Sending...' : 'Send Report'}
            </button>
          </div>
        </form>
      </div>
    </Overlay>
  );
}
