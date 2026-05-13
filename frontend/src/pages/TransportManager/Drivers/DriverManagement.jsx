import React, { useState, useEffect, useCallback } from "react";
import {
    Plus, Search, Edit2, Trash2, Route, Eye, Download, UserCircle,
    Phone, Mail, CreditCard, MapPin, CheckCircle, XCircle, Clock,
    AlertTriangle, Loader, X, Zap, Truck, Star, Calendar, Shield,
    ChevronRight, RefreshCw, User, IdCard,
} from "lucide-react";
import { getAllDrivers, createDriver, updateDriver, deleteDriver, assignRoute, unassignRoute } from "../../../api/driver";
import { getAllRoutes } from "../../../api/route";
import { getAllVehicles } from "../../../api/vehicle";

// ── Design Tokens ──────────────────────────────────────────────────────────────
const A = "#165E52";      // accent
const BTN = "#01251F";    // button / dark
const BORDER = "#cfece6";
const HEADER_BG = "#e1f4ef";
const BG = "#f8fdfc";

// ── Helpers ────────────────────────────────────────────────────────────────────
const statusMeta = {
    Available: { bg: "#dcfce7", text: "#166534", dot: "#22c55e" },
    "On Route": { bg: "#dbeafe", text: "#1e40af", dot: "#3b82f6" },
    "On Leave": { bg: "#fef9c3", text: "#854d0e", dot: "#eab308" },
    Inactive: { bg: "#fee2e2", text: "#991b1b", dot: "#ef4444" },
};

function StatusBadge({ status }) {
    const m = statusMeta[status] || statusMeta.Inactive;
    return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
            style={{ backgroundColor: m.bg, color: m.text }}>
            <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: m.dot }} />
            {status}
        </span>
    );
}

function Toast({ msg, type, onClose }) {
    useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
    const isError = type === "error";
    return (
        <div className={`fixed top-5 right-5 z-[999] flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl text-white text-sm font-medium animate-slide-in`}
            style={{ backgroundColor: isError ? "#dc2626" : "#059669", minWidth: 260 }}>
            {isError ? <XCircle size={18} /> : <CheckCircle size={18} />}
            <span>{msg}</span>
            <button onClick={onClose} className="ml-auto opacity-70 hover:opacity-100"><X size={16} /></button>
        </div>
    );
}

function Overlay({ children, onClose }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={e => e.target === e.currentTarget && onClose()}>
            {children}
        </div>
    );
}

// ── Add / Edit Driver Modal ────────────────────────────────────────────────────
function Field({ label, name, type = "text", placeholder, required, children, form, errors, handleChange }) {
    return (
        <div>
            <label className="block mb-1 text-xs font-semibold uppercase tracking-wide" style={{ color: A }}>
                {label}{required && <span className="text-red-500 ml-0.5">*</span>}
            </label>
            {children || (
                <input type={type} name={name} value={form[name] || ""} onChange={handleChange} placeholder={placeholder}
                    className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2"
                    style={{
                        borderColor: errors[name] ? "#ef4444" : BORDER, color: A,
                        backgroundColor: "#fff", "--tw-ring-color": A
                    }} />
            )}
            {errors[name] && <p className="text-red-500 text-xs mt-1">{errors[name]}</p>}
        </div>
    );
}

const EMPTY_FORM = {
    name: "", email: "", phone: "", licenseNo: "", nic: "", address: "",
    vehicleNo: "", licenseExpiry: "", experience: "", status: "Available",
    emergencyContactName: "", emergencyContactPhone: "", emergencyContactRelationship: "",
};

function DriverModal({ driver, onClose, onSaved, onError }) {
    const isEdit = !!driver;
    const [form, setForm] = useState(isEdit ? {
        name: driver.name || "",
        email: driver.email || "",
        phone: driver.phone || "",
        licenseNo: driver.licenseNo || "",
        nic: driver.nic || "",
        address: driver.address || "",
        vehicleNo: driver.vehicleNo || "",
        licenseExpiry: driver.licenseExpiry ? driver.licenseExpiry.split("T")[0] : "",
        experience: driver.experience ?? "",
        status: driver.status || "Available",
        emergencyContactName: driver.emergencyContact?.name || "",
        emergencyContactPhone: driver.emergencyContact?.phone || "",
        emergencyContactRelationship: driver.emergencyContact?.relationship || "",
    } : EMPTY_FORM);
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);

    const validate = () => {
        const e = {};
        if (!form.name.trim()) e.name = "Name is required";
        if (!form.email.trim()) e.email = "Email is required";
        if (!form.phone.trim()) e.phone = "Phone is required";
        if (!form.licenseNo.trim()) e.licenseNo = "License number is required";
        if (!form.nic.trim()) e.nic = "NIC is required";
        if (!form.address.trim()) e.address = "Address is required";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleChange = e => {
        const { name, value } = e.target;
        setForm(p => ({ ...p, [name]: value }));
        if (errors[name]) setErrors(p => ({ ...p, [name]: "" }));
    };

    const handleSubmit = async e => {
        e.preventDefault();
        if (!validate()) return;
        setSaving(true);
        try {
            const payload = {
                name: form.name, email: form.email, phone: form.phone,
                licenseNo: form.licenseNo, nic: form.nic, address: form.address,
                status: form.status,
            };
            if (form.vehicleNo) payload.vehicleNo = form.vehicleNo;
            if (form.licenseExpiry) payload.licenseExpiry = form.licenseExpiry;
            if (form.experience !== "") payload.experience = parseInt(form.experience) || 0;
            if (form.emergencyContactName && form.emergencyContactPhone) {
                payload.emergencyContact = {
                    name: form.emergencyContactName,
                    phone: form.emergencyContactPhone,
                    relationship: form.emergencyContactRelationship || "Not Specified",
                };
            }
            if (isEdit) await updateDriver(driver._id, payload);
            else await createDriver(payload);
            onSaved(isEdit ? "Driver updated successfully!" : "Driver added successfully!");
        } catch (err) {
            const errorMsg = err?.message || (isEdit ? "Failed to update driver" : "Failed to add driver");
            setErrors({ submit: errorMsg });
            if (onError) onError(errorMsg);
        } finally {
            setSaving(false);
        }
    };

    return (
        <Overlay onClose={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl flex flex-col w-full max-w-2xl max-h-[90vh] overflow-hidden"
                style={{ border: `1px solid ${BORDER}` }}>
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b" style={{ backgroundColor: HEADER_BG, borderColor: BORDER }}>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: "#c7ece4" }}>
                            <User size={20} style={{ color: A }} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold" style={{ color: A }}>{isEdit ? "Edit Driver" : "Add New Driver"}</h2>
                            <p className="text-xs opacity-70" style={{ color: A }}>{isEdit ? "Update driver information" : "Fill in all required details"}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-white/60 transition" style={{ color: A }}><X size={20} /></button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field form={form} errors={errors} handleChange={handleChange} label="Full Name" name="name" placeholder="Kasun Perera" required />
                        <Field form={form} errors={errors} handleChange={handleChange} label="Email Address" name="email" type="email" placeholder="driver@example.com" required />
                        <Field form={form} errors={errors} handleChange={handleChange} label="Phone Number" name="phone" placeholder="0771234567" required />
                        <Field form={form} errors={errors} handleChange={handleChange} label="License Number" name="licenseNo" placeholder="B1234567" required />
                        <Field form={form} errors={errors} handleChange={handleChange} label="NIC" name="nic" placeholder="881234567V" required />
                        <Field form={form} errors={errors} handleChange={handleChange} label="License Expiry" name="licenseExpiry" type="date" />
                        <div className="sm:col-span-2">
                            <Field form={form} errors={errors} handleChange={handleChange} label="Address" name="address" placeholder="123 Main Street, Colombo" required />
                        </div>
                        <Field form={form} errors={errors} handleChange={handleChange} label="Vehicle Number" name="vehicleNo" placeholder="WP CD-1234" />
                        <Field form={form} errors={errors} handleChange={handleChange} label="Experience (Years)" name="experience" type="number" placeholder="5" />
                        <div className="sm:col-span-2">
                            <label className="block mb-1 text-xs font-semibold uppercase tracking-wide" style={{ color: A }}>Status</label>
                            <select name="status" value={form.status} onChange={handleChange}
                                className="w-full border rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none"
                                style={{ borderColor: BORDER, color: A }}>
                                <option value="Available">Available</option>
                                <option value="On Route">On Route</option>
                                <option value="On Leave">On Leave</option>
                                <option value="Inactive">Inactive</option>
                            </select>
                        </div>
                    </div>

                    {/* Emergency Contact */}
                    <div className="mt-5 pt-4 border-t" style={{ borderColor: BORDER }}>
                        <h3 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: A }}>
                            <Shield size={15} /> Emergency Contact <span className="font-normal opacity-60">(Optional)</span>
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <Field form={form} errors={errors} handleChange={handleChange} label="Contact Name" name="emergencyContactName" placeholder="Nimal Silva" />
                            <Field form={form} errors={errors} handleChange={handleChange} label="Contact Phone" name="emergencyContactPhone" placeholder="0771234567" />
                            <Field form={form} errors={errors} handleChange={handleChange} label="Relationship" name="emergencyContactRelationship" placeholder="Spouse / Parent" />
                        </div>
                    </div>

                    {errors.submit && (
                        <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 flex items-center gap-2">
                            <AlertTriangle size={16} className="text-red-500 flex-shrink-0" />
                            <p className="text-sm text-red-600">{errors.submit}</p>
                        </div>
                    )}
                </form>

                {/* Footer */}
                <div className="flex gap-3 p-4 border-t" style={{ backgroundColor: HEADER_BG, borderColor: BORDER }}>
                    <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-lg border text-sm font-semibold transition hover:bg-white/60"
                        style={{ borderColor: BORDER, color: A }}>Cancel</button>
                    <button type="submit" onClick={handleSubmit} disabled={saving}
                        className="flex-1 py-2.5 rounded-lg text-white text-sm font-semibold shadow transition hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
                        style={{ backgroundColor: BTN }}>
                        {saving ? <><Loader size={16} className="animate-spin" /> Saving...</> : (isEdit ? "Update Driver" : "Add Driver")}
                    </button>
                </div>
            </div>
        </Overlay>
    );
}

// ── Delete Confirm Modal ───────────────────────────────────────────────────────
function DeleteModal({ driver, onClose, onDeleted, onError }) {
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState("");
    const handleDelete = async () => {
        setDeleting(true);
        try {
            await deleteDriver(driver._id);
            onDeleted("Driver removed successfully.");
        } catch (err) {
            const errorMsg = err?.message || "Failed to delete driver";
            setError(errorMsg);
            if (onError) onError(errorMsg);
        } finally { setDeleting(false); }
    };
    return (
        <Overlay onClose={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm" style={{ border: `1px solid ${BORDER}` }}>
                <div className="flex flex-col items-center text-center gap-3">
                    <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
                        <Trash2 size={26} className="text-red-500" />
                    </div>
                    <h2 className="text-lg font-bold" style={{ color: BTN }}>Remove Driver</h2>
                    <p className="text-sm text-gray-500">
                        Are you sure you want to remove <strong>{driver.name}</strong>? This action cannot be undone.
                    </p>
                    {error && <p className="text-sm text-red-500 bg-red-50 w-full py-2 rounded-lg">{error}</p>}
                    <div className="flex gap-3 w-full mt-2">
                        <button onClick={onClose} className="flex-1 py-2.5 rounded-lg border text-sm font-semibold"
                            style={{ borderColor: BORDER, color: A }}>Cancel</button>
                        <button onClick={handleDelete} disabled={deleting}
                            className="flex-1 py-2.5 rounded-lg text-white text-sm font-semibold bg-red-500 hover:bg-red-600 transition disabled:opacity-60 flex items-center justify-center gap-2">
                            {deleting ? <Loader size={15} className="animate-spin" /> : <Trash2 size={15} />}
                            {deleting ? "Removing..." : "Remove"}
                        </button>
                    </div>
                </div>
            </div>
        </Overlay>
    );
}

// ── Assign Route Modal ─────────────────────────────────────────────────────────
function AssignRouteModal({ driver, routes, vehicles = [], drivers = [], onClose, onSaved, onError }) {
    const [selectedRoute, setSelectedRoute] = useState("");
    const [selectedVehicle, setSelectedVehicle] = useState(driver.vehicleNo || "");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const assigned = (driver.assignedRoutes || []).map(r => r.routeId);
    const available = routes.filter(r => !assigned.includes(r._id) && r.status === "Active");

    // Filter out vehicles that are currently in use by other drivers or marked unavailable
    const takenVehicles = drivers
        .filter(d => d._id !== driver._id)
        .flatMap(d => {
            const taken = [];
            // Only block vehicles actively used by other drivers' current trips.
            // Do NOT block just because another driver has a default vehicleNo set.
            if (d.currentTrip && d.currentTrip.routeId && d.currentTrip.status !== 'Completed' && d.currentTrip.vehicleNo) {
                taken.push(String(d.currentTrip.vehicleNo).toUpperCase());
            }
            return taken;
        });

    const normalizedSelectedVehicle = String(selectedVehicle || '').toUpperCase();
    const availableVehicles = vehicles.filter(v => {
        const vehicleNumber = String(v.vehicleNumber || '').toUpperCase();
        if (!vehicleNumber) return false;
        if (takenVehicles.includes(vehicleNumber)) return false;
        if (vehicleNumber === normalizedSelectedVehicle) return true;
        return v.status === 'Available';
    });

    const handleAssign = async () => {
        if (!selectedRoute) { setError("Please select a route"); return; }
        const route = routes.find(r => r._id === selectedRoute);
        setSaving(true);
        try {
            await assignRoute(driver._id, {
                routeId: route._id,
                routeName: route.routeName,
                vehicleNo: selectedVehicle
            });
            onSaved(`Route "${route.routeName}" assigned to ${driver.name}.`);
        } catch (err) {
            const errorMsg = err?.message || "Failed to assign route";
            setError(errorMsg);
            if (onError) onError(errorMsg);
        } finally { setSaving(false); }
    };

    const handleUnassign = async routeId => {
        try {
            await unassignRoute(driver._id, routeId);
            onSaved("Route unassigned successfully.");
        } catch (err) {
            const errorMsg = err?.message || "Failed to unassign route";
            setError(errorMsg);
            if (onError) onError(errorMsg);
        }
    };

    return (
        <Overlay onClose={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl flex flex-col w-full max-w-lg max-h-[80vh] overflow-hidden"
                style={{ border: `1px solid ${BORDER}` }}>
                <div className="flex items-center justify-between p-5 border-b" style={{ backgroundColor: HEADER_BG, borderColor: BORDER }}>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: "#c7ece4" }}>
                            <Route size={18} style={{ color: A }} />
                        </div>
                        <div>
                            <h2 className="text-base font-bold" style={{ color: A }}>Manage Route Assignments</h2>
                            <p className="text-xs opacity-70" style={{ color: A }}>{driver.name}</p>
                        </div>
                    </div>
                    <button onClick={onClose} style={{ color: A }}><X size={20} /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                    {/* Current Assignments */}
                    {driver.assignedRoutes?.length > 0 && (
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: A }}>Current Assignments</p>
                            <div className="space-y-2">
                                {driver.assignedRoutes.map(r => (
                                    <div key={r.routeId} className="flex items-center justify-between p-3 rounded-lg border"
                                        style={{ borderColor: BORDER, backgroundColor: BG }}>
                                        <div className="flex items-center gap-2">
                                            <Route size={15} style={{ color: A }} />
                                            <div>
                                                <p className="text-sm font-medium" style={{ color: BTN }}>{r.routeName}</p>
                                                {r.assignedDate && (
                                                    <p className="text-xs text-gray-400">{new Date(r.assignedDate).toLocaleDateString()}</p>
                                                )}
                                            </div>
                                        </div>
                                        <button onClick={() => handleUnassign(r.routeId)}
                                            className="text-xs text-red-500 hover:text-red-700 font-medium flex items-center gap-1">
                                            <X size={14} /> Remove
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {/* Assign New */}
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: A }}>Assign New Route</p>
                        {available.length === 0 ? (
                            <p className="text-sm text-gray-400 italic">No available active routes to assign.</p>
                        ) : (
                            <select value={selectedRoute} onChange={e => { setSelectedRoute(e.target.value); setError(""); }}
                                className="w-full border rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none"
                                style={{ borderColor: error ? "#ef4444" : BORDER, color: A }}>
                                <option value="">Select a route...</option>
                                {available.map(r => (
                                    <option key={r._id} value={r._id}>{r.routeName} ({r.routeNumber}) — {r.area}</option>
                                ))}
                            </select>
                        )}
                        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
                    </div>

                    {/* Assign Vehicle */}
                    {available.length > 0 && (
                        <div className="mt-4 border-t pt-4" style={{ borderColor: BORDER }}>
                            <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: A }}>Assign Vehicle <span className="font-normal opacity-60">(Optional)</span></p>
                            <select value={selectedVehicle} onChange={e => setSelectedVehicle(e.target.value)}
                                className="w-full border rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none"
                                style={{ borderColor: BORDER, color: A }}>
                                <option value="">-- Let driver use default or any vehicle --</option>
                                {availableVehicles.map(v => (
                                    <option key={v._id || v.vehicleNumber} value={v.vehicleNumber}>
                                        {v.vehicleNumber} - {v.vehicleType || 'Vehicle'}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>
                <div className="flex gap-3 p-4 border-t" style={{ borderColor: BORDER, backgroundColor: HEADER_BG }}>
                    <button onClick={onClose} className="flex-1 py-2.5 rounded-lg border text-sm font-semibold"
                        style={{ borderColor: BORDER, color: A }}>Close</button>
                    {available.length > 0 && (
                        <button onClick={handleAssign} disabled={saving}
                            className="flex-1 py-2.5 rounded-lg text-white text-sm font-semibold shadow transition hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
                            style={{ backgroundColor: BTN }}>
                            {saving ? <Loader size={15} className="animate-spin" /> : <Route size={15} />}
                            {saving ? "Assigning..." : "Assign Route"}
                        </button>
                    )}
                </div>
            </div>
        </Overlay>
    );
}

// ── Quick Assign Panel (slide-in) ──────────────────────────────────────────────
function QuickAssignPanel({ drivers, routes, vehicles, onClose, onSaved }) {
    const [driverId, setDriverId] = useState("");
    const [routeId, setRouteId] = useState("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const availableDrivers = drivers.filter(d => d.status === "Available" || d.status === "On Route");
    const activeRoutes = routes.filter(r => r.status === "Active");

    const handleAssign = async () => {
        if (!driverId || !routeId) { setError("Please select both a driver and a route."); return; }
        const driver = drivers.find(d => d._id === driverId);
        const route = routes.find(r => r._id === routeId);
        setSaving(true);
        try {
            await assignRoute(driverId, { routeId: route._id, routeName: route.routeName });
            onSaved(`⚡ Quick Assigned: ${driver.name} → ${route.routeName}`);
        } catch (err) {
            setError(err?.message || "Assignment failed");
        } finally { setSaving(false); }
    };

    return (
        <div className="fixed inset-y-0 right-0 z-50 flex">
            <div className="flex-1" onClick={onClose} />
            <div className="w-80 bg-white shadow-2xl flex flex-col overflow-hidden"
                style={{ borderLeft: `1px solid ${BORDER}` }}>
                <div className="p-5 flex items-center justify-between" style={{ backgroundColor: HEADER_BG }}>
                    <div className="flex items-center gap-2">
                        <Zap size={18} className="text-amber-500" />
                        <h2 className="font-bold" style={{ color: A }}>Quick Assign</h2>
                    </div>
                    <button onClick={onClose} style={{ color: A }}><X size={20} /></button>
                </div>
                <div className="flex-1 p-5 space-y-4 overflow-y-auto">
                    <p className="text-xs text-gray-500">Quickly assign a driver to any active route.</p>
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wide mb-1" style={{ color: A }}>Driver</label>
                        <select value={driverId} onChange={e => { setDriverId(e.target.value); setError(""); }}
                            className="w-full border rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none"
                            style={{ borderColor: BORDER, color: A }}>
                            <option value="">Choose a driver...</option>
                            {availableDrivers.map(d => (
                                <option key={d._id} value={d._id}>{d.name} — {d.status}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wide mb-1" style={{ color: A }}>Route</label>
                        <select value={routeId} onChange={e => { setRouteId(e.target.value); setError(""); }}
                            className="w-full border rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none"
                            style={{ borderColor: BORDER, color: A }}>
                            <option value="">Choose a route...</option>
                            {activeRoutes.map(r => (
                                <option key={r._id} value={r._id}>{r.routeName} ({r.area})</option>
                            ))}
                        </select>
                    </div>
                    {error && (
                        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600 flex items-center gap-2">
                            <AlertTriangle size={14} /> {error}
                        </div>
                    )}
                    {driverId && routeId && (
                        <div className="p-3 rounded-lg border" style={{ borderColor: BORDER, backgroundColor: BG }}>
                            <p className="text-xs font-bold mb-1" style={{ color: A }}>Assignment Preview</p>
                            <p className="text-sm" style={{ color: BTN }}>
                                <strong>{drivers.find(d => d._id === driverId)?.name}</strong>
                                {" → "}
                                <strong>{routes.find(r => r._id === routeId)?.routeName}</strong>
                            </p>
                        </div>
                    )}
                </div>
                <div className="p-4 border-t" style={{ borderColor: BORDER }}>
                    <button onClick={handleAssign} disabled={saving}
                        className="w-full py-3 rounded-lg text-white font-bold text-sm shadow transition hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
                        style={{ backgroundColor: BTN }}>
                        {saving ? <Loader size={16} className="animate-spin" /> : <Zap size={16} />}
                        {saving ? "Assigning..." : "Quick Assign Now"}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Driver Detail Drawer ───────────────────────────────────────────────────────
function DriverDetailDrawer({ driver, onClose, onEdit, onAssignRoute, onDelete }) {
    const expiry = driver.licenseExpiry ? new Date(driver.licenseExpiry) : null;
    const isExpired = expiry && expiry < new Date();
    const daysLeft = expiry ? Math.ceil((expiry - new Date()) / 86400000) : null;

    const handleDownloadLicense = () => {
        const content = [
            "========================================",
            "      DRIVER LICENSE INFORMATION",
            "========================================",
            `Name          : ${driver.name}`,
            `License No    : ${driver.licenseNo}`,
            `NIC           : ${driver.nic}`,
            `Phone         : ${driver.phone}`,
            `Email         : ${driver.email}`,
            `Address       : ${driver.address}`,
            `Experience    : ${driver.experience ?? 0} year(s)`,
            `License Expiry: ${expiry ? expiry.toLocaleDateString() : "N/A"}`,
            `Status        : ${driver.status}`,
            ...(driver.vehicleNo ? [`Vehicle No    : ${driver.vehicleNo}`] : []),
            "----------------------------------------",
            `Generated On  : ${new Date().toLocaleString()}`,
            "========================================",
        ].join("\n");
        const blob = new Blob([content], { type: "text/plain" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `License_${driver.name.replace(/\s+/g, "_")}_${driver.licenseNo}.txt`;
        a.click();
        URL.revokeObjectURL(a.href);
    };

    return (
        <div className="fixed inset-y-0 right-0 z-50 flex">
            <div className="flex-1 bg-black/20" onClick={onClose} />
            <div className="w-96 bg-white shadow-2xl flex flex-col overflow-hidden"
                style={{ borderLeft: `1px solid ${BORDER}` }}>
                {/* Header */}
                <div className="p-5 flex items-center justify-between" style={{ backgroundColor: HEADER_BG }}>
                    <h2 className="font-bold text-base" style={{ color: A }}>Driver Details</h2>
                    <button onClick={onClose} style={{ color: A }}><X size={20} /></button>
                </div>

                {/* Avatar + Name */}
                <div className="flex flex-col items-center gap-2 py-6 px-5" style={{ backgroundColor: HEADER_BG }}>
                    <div className="w-20 h-20 rounded-full flex items-center justify-center shadow-lg"
                        style={{ background: `linear-gradient(135deg, ${A}, #0d3d36)` }}>
                        <UserCircle size={44} className="text-white" />
                    </div>
                    <h3 className="text-lg font-bold" style={{ color: BTN }}>{driver.name}</h3>
                    <StatusBadge status={driver.status} />
                    {driver.rating > 0 && (
                        <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} size={13} fill={i < Math.round(driver.rating) ? "#f59e0b" : "none"}
                                    stroke={i < Math.round(driver.rating) ? "#f59e0b" : "#d1d5db"} />
                            ))}
                            <span className="text-xs text-gray-500 ml-1">{driver.rating.toFixed(1)}</span>
                        </div>
                    )}
                </div>

                {/* Info */}
                <div className="flex-1 overflow-y-auto p-5 space-y-3">
                    {[
                        { icon: Mail, label: "Email", val: driver.email },
                        { icon: Phone, label: "Phone", val: driver.phone },
                        { icon: CreditCard, label: "License No", val: driver.licenseNo },
                        { icon: IdCard, label: "NIC", val: driver.nic },
                        { icon: MapPin, label: "Address", val: driver.address },
                        { icon: Truck, label: "Vehicle No", val: driver.vehicleNo || "—" },
                        { icon: Star, label: "Experience", val: `${driver.experience ?? 0} year(s)` },
                        { icon: Clock, label: "Total Trips", val: driver.totalTrips ?? 0 },
                    ].map(({ icon: Icon, label, val }) => (
                        <div key={label} className="flex items-start gap-3 p-3 rounded-lg" style={{ backgroundColor: BG }}>
                            <Icon size={16} className="mt-0.5 flex-shrink-0" style={{ color: A }} />
                            <div className="min-w-0">
                                <p className="text-xs text-gray-400 font-medium">{label}</p>
                                <p className="text-sm font-semibold truncate" style={{ color: BTN }}>{val}</p>
                            </div>
                        </div>
                    ))}

                    {/* License Expiry */}
                    <div className={`flex items-start gap-3 p-3 rounded-lg ${isExpired ? "bg-red-50" : daysLeft && daysLeft < 30 ? "bg-yellow-50" : ""}`}
                        style={!isExpired && (!daysLeft || daysLeft >= 30) ? { backgroundColor: BG } : {}}>
                        <Calendar size={16} className={`mt-0.5 flex-shrink-0 ${isExpired ? "text-red-500" : daysLeft && daysLeft < 30 ? "text-yellow-500" : ""}`}
                            style={!isExpired && (!daysLeft || daysLeft >= 30) ? { color: A } : {}} />
                        <div>
                            <p className="text-xs text-gray-400 font-medium">License Expiry</p>
                            <p className="text-sm font-semibold" style={{ color: isExpired ? "#dc2626" : BTN }}>
                                {expiry ? expiry.toLocaleDateString() : "N/A"}
                                {isExpired && " (EXPIRED)"}
                                {!isExpired && daysLeft && daysLeft < 30 && ` (${daysLeft}d left)`}
                            </p>
                        </div>
                    </div>

                    {/* Assigned Routes */}
                    {driver.assignedRoutes?.length > 0 && (
                        <div>
                            <p className="text-xs text-gray-400 font-medium mb-2">Assigned Routes</p>
                            <div className="space-y-1">
                                {driver.assignedRoutes.map(r => (
                                    <div key={r.routeId} className="flex items-center gap-2 p-2 rounded-lg text-sm"
                                        style={{ backgroundColor: BG }}>
                                        <Route size={13} style={{ color: A }} />
                                        <span style={{ color: BTN }}>{r.routeName}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Emergency Contact */}
                    {driver.emergencyContact?.name && (
                        <div className="p-3 rounded-lg border" style={{ borderColor: BORDER, backgroundColor: BG }}>
                            <p className="text-xs text-gray-400 font-medium mb-1">Emergency Contact</p>
                            <p className="text-sm font-semibold" style={{ color: BTN }}>{driver.emergencyContact.name}</p>
                            <p className="text-xs text-gray-500">{driver.emergencyContact.phone} · {driver.emergencyContact.relationship}</p>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="p-4 border-t space-y-2" style={{ borderColor: BORDER, backgroundColor: HEADER_BG }}>
                    <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => onEdit(driver)} className="py-2 rounded-lg text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow"
                            style={{ backgroundColor: BTN }}>
                            <Edit2 size={13} /> Edit Driver
                        </button>
                        <button onClick={handleDownloadLicense} className="py-2 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition hover:bg-white"
                            style={{ borderColor: BORDER, color: A }}>
                            <Download size={13} /> License Copy
                        </button>
                        <button onClick={() => onAssignRoute(driver)} className="py-2 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition hover:bg-white"
                            style={{ borderColor: BORDER, color: A }}>
                            <Route size={13} /> Assign Route
                        </button>
                        <button onClick={() => onDelete(driver)} className="py-2 rounded-lg border border-red-200 text-xs font-semibold flex items-center justify-center gap-1.5 text-red-500 hover:bg-red-50 transition">
                            <Trash2 size={13} /> Remove
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Summary Cards ──────────────────────────────────────────────────────────────
function SummaryCards({ drivers }) {
    const total = drivers.length;
    const available = drivers.filter(d => d.status === "Available").length;
    const onRoute = drivers.filter(d => d.status === "On Route").length;
    const onLeave = drivers.filter(d => d.status === "On Leave").length;

    const cards = [
        { label: "Total Drivers", value: total, icon: UserCircle, bg: "#e1f4ef", color: A },
        { label: "Available", value: available, icon: CheckCircle, bg: "#dcfce7", color: "#166534" },
        { label: "On Route", value: onRoute, icon: Route, bg: "#dbeafe", color: "#1e40af" },
        { label: "On Leave", value: onLeave, icon: Clock, bg: "#fef9c3", color: "#854d0e" },
    ];
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {cards.map(({ label, value, icon: Icon, bg, color }) => (
                <div key={label} className="bg-white rounded-xl shadow-sm border p-4 flex items-center gap-4"
                    style={{ borderColor: BORDER }}>
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: bg }}>
                        <Icon size={20} style={{ color }} />
                    </div>
                    <div>
                        <p className="text-2xl font-black" style={{ color: BTN }}>{value}</p>
                        <p className="text-xs text-gray-500 font-medium">{label}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function DriverManagement() {
    const [drivers, setDrivers] = useState([]);
    const [routes, setRoutes] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState("All");

    // Modals
    const [showAddEdit, setShowAddEdit] = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [routeTarget, setRouteTarget] = useState(null);
    const [viewTarget, setViewTarget] = useState(null);
    const [showQuickAssign, setShowQuickAssign] = useState(false);

    const [toast, setToast] = useState(null);

    const showToast = useCallback((msg, type = "success") => setToast({ msg, type }), []);
    const handleError = useCallback((msg) => showToast(msg, "error"), [showToast]);

    // ── Fetch ────────────────────────────────────────────────────────────────────
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [dResp, rResp] = await Promise.all([
                getAllDrivers(),
                getAllRoutes({ limit: 200 }),
            ]);
            if (dResp?.success) setDrivers(dResp.data?.drivers || []);
            // getAllRoutes returns { success, content: [...] }
            if (rResp?.success) setRoutes(rResp.content || []);
            try {
                const v = await getAllVehicles({ isActive: true });
                setVehicles(Array.isArray(v) ? v : (v?.vehicles || []));
            } catch { /* vehicles optional */ }
        } catch (err) {
            showToast(err?.message || "Failed to load data", "error");
        } finally { setLoading(false); }
    }, [showToast]);

    useEffect(() => { fetchData(); }, [fetchData]);

    // ── Filtered list ────────────────────────────────────────────────────────────
    const filtered = drivers.filter(d => {
        if (filterStatus !== "All" && d.status !== filterStatus) return false;
        if (search.trim()) {
            const t = search.toLowerCase();
            return (
                d.name?.toLowerCase().includes(t) ||
                d.email?.toLowerCase().includes(t) ||
                d.licenseNo?.toLowerCase().includes(t) ||
                d.phone?.toLowerCase().includes(t)
            );
        }
        return true;
    }).sort((a, b) => {
        // Fallback to _id sorting which inherently contains the timestamp in MongoDB
        if (a._id && b._id) {
            return b._id.localeCompare(a._id); // Descending (newest first)
        }
        return 0;
    });

    // ── Action Handlers ──────────────────────────────────────────────────────────
    const handleSaved = msg => {
        showToast(msg);
        fetchData();
        setShowAddEdit(false);
        setEditTarget(null);
        setRouteTarget(null);
        setShowQuickAssign(false);
    };

    const handleDeleted = msg => {
        showToast(msg);
        fetchData();
        setDeleteTarget(null);
        setViewTarget(null);
    };

    const openEdit = driver => {
        setViewTarget(null);
        setEditTarget(driver);
        setShowAddEdit(true);
    };

    const openDelete = driver => {
        setViewTarget(null);
        setDeleteTarget(driver);
    };

    const openRoute = driver => {
        setViewTarget(null);
        setRouteTarget(driver);
    };

    const handleDownloadLicense = driver => {
        const expiry = driver.licenseExpiry ? new Date(driver.licenseExpiry) : null;
        const content = [
            "========================================",
            "      DRIVER LICENSE INFORMATION",
            "========================================",
            `Name          : ${driver.name}`,
            `License No    : ${driver.licenseNo}`,
            `NIC           : ${driver.nic}`,
            `Phone         : ${driver.phone}`,
            `Email         : ${driver.email}`,
            `Address       : ${driver.address}`,
            `Experience    : ${driver.experience ?? 0} year(s)`,
            `License Expiry: ${expiry ? expiry.toLocaleDateString() : "N/A"}`,
            `Status        : ${driver.status}`,
            ...(driver.vehicleNo ? [`Vehicle No    : ${driver.vehicleNo}`] : []),
            "----------------------------------------",
            `Generated On  : ${new Date().toLocaleString()}`,
            "========================================",
        ].join("\n");
        const blob = new Blob([content], { type: "text/plain" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `License_${driver.name.replace(/\s+/g, "_")}_${driver.licenseNo}.txt`;
        a.click();
        URL.revokeObjectURL(a.href);
        showToast(`License copy downloaded for ${driver.name}.`);
    };

    // ── Render ───────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen" style={{ backgroundColor: BG }}>
            {/* Toast */}
            {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

            {/* Page Header */}
            <div className="bg-white border-b shadow-sm" style={{ borderColor: BORDER }}>
                <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-black" style={{ color: A }}>Driver Management</h1>
                        <p className="text-sm text-gray-500 mt-0.5">Manage drivers, assignments, licenses & routes</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <button onClick={() => setShowQuickAssign(true)}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold border-2 transition hover:bg-amber-50"
                            style={{ borderColor: "#f59e0b", color: "#92400e" }}>
                            <Zap size={16} className="text-amber-500" /> Quick Assign
                        </button>
                        <button onClick={fetchData} disabled={loading}
                            className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm border transition hover:bg-gray-50"
                            style={{ borderColor: BORDER, color: A }}>
                            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
                        </button>
                        <button onClick={() => { setEditTarget(null); setShowAddEdit(true); }}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-white text-sm font-bold shadow-md transition hover:opacity-90"
                            style={{ backgroundColor: BTN }}>
                            <Plus size={18} /> Add Driver
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-6">
                {/* Summary */}
                {!loading && <SummaryCards drivers={drivers} />}

                {/* Filters */}
                <div className="bg-white rounded-xl border shadow-sm p-4 mb-5 flex flex-col sm:flex-row gap-3 items-center"
                    style={{ borderColor: BORDER }}>
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <input type="text" placeholder="Search by name, email, license, phone..."
                            value={search} onChange={e => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2"
                            style={{ borderColor: BORDER, color: A, backgroundColor: BG }} />
                    </div>
                    <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                        className="px-4 py-2 text-sm border rounded-lg focus:outline-none bg-white"
                        style={{ borderColor: BORDER, color: A }}>
                        <option value="All">All Statuses</option>
                        <option value="Available">Available</option>
                        <option value="On Route">On Route</option>
                        <option value="On Leave">On Leave</option>
                        <option value="Inactive">Inactive</option>
                    </select>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl border shadow-sm overflow-hidden" style={{ borderColor: BORDER }}>
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-3">
                            <Loader size={32} className="animate-spin" style={{ color: A }} />
                            <p className="text-sm text-gray-400">Loading drivers...</p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-sm">
                                    <thead>
                                        <tr style={{ backgroundColor: BTN }}>
                                            {["Driver", "Contact", "License / NIC", "Vehicle", "Assigned Routes", "Status", "Actions"].map(h => (
                                                <th key={h} className="py-3.5 px-4 text-left text-white text-xs font-bold uppercase tracking-wide">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filtered.length === 0 ? (
                                            <tr>
                                                <td colSpan={7} className="text-center py-16">
                                                    <UserCircle size={40} className="mx-auto mb-3" style={{ color: BORDER }} />
                                                    <p className="text-gray-400 font-medium">No drivers found</p>
                                                    <p className="text-gray-300 text-xs mt-1">Try adjusting your filters or add a new driver</p>
                                                </td>
                                            </tr>
                                        ) : filtered.map((d, idx) => {
                                            const expiry = d.licenseExpiry ? new Date(d.licenseExpiry) : null;
                                            const expired = expiry && expiry < new Date();
                                            return (
                                                <tr key={d._id}
                                                    className={`border-b transition-colors ${idx % 2 === 0 ? "bg-white" : ""} hover:bg-[#f0faf7]`}
                                                    style={{ borderColor: BORDER }}>
                                                    {/* Driver */}
                                                    <td className="py-3 px-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                                                                style={{ background: `linear-gradient(135deg, ${A}, #0d3d36)` }}>
                                                                {d.name?.[0]?.toUpperCase() || "D"}
                                                            </div>
                                                            <div>
                                                                <p className="font-semibold" style={{ color: BTN }}>{d.name}</p>
                                                                <p className="text-xs text-gray-400">{d._id?.slice(-6).toUpperCase()}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    {/* Contact */}
                                                    <td className="py-3 px-4">
                                                        <p className="text-gray-700">{d.phone}</p>
                                                        <p className="text-xs text-gray-400 truncate max-w-[160px]">{d.email}</p>
                                                    </td>
                                                    {/* License / NIC */}
                                                    <td className="py-3 px-4">
                                                        <p className="font-mono text-xs font-semibold" style={{ color: A }}>{d.licenseNo}</p>
                                                        <p className="text-xs text-gray-400">{d.nic}</p>
                                                        {expiry && (
                                                            <p className={`text-xs mt-0.5 ${expired ? "text-red-500 font-semibold" : "text-gray-400"}`}>
                                                                {expired ? "⚠ Expired" : `Exp: ${expiry.toLocaleDateString()}`}
                                                            </p>
                                                        )}
                                                    </td>
                                                    {/* Vehicle */}
                                                    <td className="py-3 px-4">
                                                        <span className="text-gray-600 text-xs">{d.vehicleNo || "—"}</span>
                                                    </td>
                                                    {/* Routes */}
                                                    <td className="py-3 px-4">
                                                        {d.assignedRoutes?.length > 0 ? (
                                                            <div className="space-y-1">
                                                                {d.assignedRoutes.slice(0, 2).map(r => (
                                                                    <span key={r.routeId} className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
                                                                        style={{ backgroundColor: HEADER_BG, color: A }}>
                                                                        <Route size={10} /> {r.routeName}
                                                                    </span>
                                                                ))}
                                                                {d.assignedRoutes.length > 2 && (
                                                                    <span className="text-xs text-gray-400">+{d.assignedRoutes.length - 2} more</span>
                                                                )}
                                                            </div>
                                                        ) : <span className="text-xs text-gray-300 italic">None</span>}
                                                    </td>
                                                    {/* Status */}
                                                    <td className="py-3 px-4">
                                                        <StatusBadge status={d.status} />
                                                        {d.currentTrip && d.currentTrip.status !== 'Completed' && d.currentTrip.status !== 'Not Started' && (
                                                            <div className="mt-1">
                                                                <span className="text-[10px] uppercase font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 shadow-sm">
                                                                    ▶ {d.currentTrip.status}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </td>
                                                    {/* Actions */}
                                                    <td className="py-3 px-4">
                                                        <div className="flex items-center gap-1">
                                                            <button onClick={() => setViewTarget(d)} title="View Details"
                                                                className="p-1.5 rounded-lg transition hover:bg-[#e1f4ef]" style={{ color: A }}>
                                                                <Eye size={15} />
                                                            </button>
                                                            <button onClick={() => openEdit(d)} title="Edit Driver"
                                                                className="p-1.5 rounded-lg transition hover:bg-[#e1f4ef]" style={{ color: A }}>
                                                                <Edit2 size={15} />
                                                            </button>
                                                            <button onClick={() => handleDownloadLicense(d)} title="Download License"
                                                                className="p-1.5 rounded-lg transition hover:bg-[#e1f4ef]" style={{ color: A }}>
                                                                <Download size={15} />
                                                            </button>
                                                            <button onClick={() => openRoute(d)} title="Assign Route"
                                                                className="p-1.5 rounded-lg transition hover:bg-[#e1f4ef]" style={{ color: A }}>
                                                                <Route size={15} />
                                                            </button>
                                                            <button onClick={() => openDelete(d)} title="Delete Driver"
                                                                className="p-1.5 rounded-lg transition hover:bg-red-50 text-red-400 hover:text-red-600">
                                                                <Trash2 size={15} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                            <div className="px-4 py-3 border-t flex items-center justify-between text-xs text-gray-400"
                                style={{ borderColor: BORDER }}>
                                <span>Showing <strong>{filtered.length}</strong> of <strong>{drivers.length}</strong> drivers</span>
                                {filtered.length < drivers.length && (
                                    <button onClick={() => { setSearch(""); setFilterStatus("All"); }}
                                        className="text-xs underline" style={{ color: A }}>Clear filters</button>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* ── Modals & Panels ── */}
            {showAddEdit && (
                <DriverModal driver={editTarget} onClose={() => { setShowAddEdit(false); setEditTarget(null); }} onSaved={handleSaved} onError={handleError} />
            )}
            {deleteTarget && (
                <DeleteModal driver={deleteTarget} onClose={() => setDeleteTarget(null)} onDeleted={handleDeleted} onError={handleError} />
            )}
            {routeTarget && (
                <AssignRouteModal driver={routeTarget} routes={routes} vehicles={vehicles} drivers={drivers} onClose={() => setRouteTarget(null)} onSaved={handleSaved} onError={handleError} />
            )}
            {viewTarget && (
                <DriverDetailDrawer driver={viewTarget} onClose={() => setViewTarget(null)}
                    onEdit={openEdit} onAssignRoute={openRoute} onDelete={openDelete} />
            )}
            {showQuickAssign && (
                <QuickAssignPanel drivers={drivers} routes={routes} vehicles={vehicles}
                    onClose={() => setShowQuickAssign(false)} onSaved={handleSaved} />
            )}
        </div>
    );
}
