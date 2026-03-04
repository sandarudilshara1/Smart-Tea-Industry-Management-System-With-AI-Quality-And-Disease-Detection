import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createLoanRate, getLoanRates } from "../../../api/owner";

const ACCENT_COLOR = "#165e52";
const BUTTON_COLOR = "#172526";

// Minimal local component to match Owner UI style
export default function LoanRates() {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ effective_date: "", rate: "" });
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    async function fetchRates() {
      setLoading(true);
      try {
        const data = await getLoanRates();
        // Only map required fields
        const mapped = Array.isArray(data)
          ? data.map((r) => ({
              rate_id: r.rateId || r.id || r.rate_id, // Try rateId, then id, then rate_id
              effective_date: r.effectiveDate || r.effective_date,
              rate: r.rate,
              status: r.status ? "active" : "expired",
            }))
          : [];
        setRecords(mapped);
      } catch (err) {
        setNotification("Failed to fetch loan rates");
      }
      setLoading(false);
    }
    fetchRates();
  }, []);

  const openAdd = () => setShowAdd(true);
  const closeAdd = () => setShowAdd(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        rate: Number(form.rate),
        effectiveDate: form.effective_date,
        status: true,
      };
      const newRecord = await createLoanRate(payload);
      // Only map required fields
      const mapped = {
        rate_id: newRecord.rateId || newRecord.id || newRecord.rate_id,
        effective_date: newRecord.effectiveDate || newRecord.effective_date,
        rate: newRecord.rate,
        status: newRecord.status ? "active" : "expired",
      };
      setRecords((r) => [mapped, ...r]);
      setNotification("Loan rate added");
      setForm({ effective_date: "", rate: "" });
      closeAdd();
      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      setNotification("Failed to add loan rate");
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fdfc]">
      {notification && (
        <div className="fixed top-4 right-4 z-50 px-4 py-3 rounded text-white bg-green-600">{notification}</div>
      )}

      <div className="bg-white shadow-md border-b">
        <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-1 text-gray-900">Loan Rates</h1>
            <p className="text-[#000000] opacity-80 max-w-2xl">Owner Dashboard - Manage Loan Rates</p>
          </div>
          {/* Add New button removed: form is always visible */}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Add Loan Rate Form - always visible above the list */}
        <div className="bg-white rounded-lg shadow-lg w-full p-6 mb-8">
          <h3 className="text-xl font-semibold mb-4">Add Loan Rate</h3>
          <form onSubmit={handleSubmit} className="w-full">
            <div className="flex flex-wrap items-end gap-4 w-full">
              <div className="flex flex-col flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">Effective Date</label>
                <input type="date" value={form.effective_date} onChange={(e)=>setForm(f=>({...f,effective_date:e.target.value}))} className="block w-full border px-3 py-2 rounded-md" required />
              </div>

              <div className="flex flex-col flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">Rate (%)</label>
                <input type="number" step="0.01" value={form.rate} onChange={(e)=>setForm(f=>({...f,rate:e.target.value}))} className="block w-full border px-3 py-2 rounded-md" required />
              </div>

              <div className="flex flex-col justify-end">
                <button type="submit" className="px-6 py-2 rounded text-white" style={{backgroundColor: BUTTON_COLOR}}>Save</button>
              </div>
            </div>
          </form>
        </div>

        {/* Current Month's Loan Rate Display */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Current Month's Loan Rate</h2>
          {(() => {
            const now = new Date();
            const current = records.find(r => {
              if (!r.effective_date) return false;
              const d = new Date(r.effective_date);
              return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
            });
            if (current) {
              return (
                <div className="p-4 rounded bg-green-100 flex flex-col md:flex-row md:items-center gap-4">
                  <span className="text-green-700 font-bold text-xl">Rate: {current.rate}%</span>
                  <span className="text-green-700">Effective Date: {current.effective_date}</span>
                  <span className="text-green-700">Status: {current.status}</span>
                </div>
              );
            } else {
              return <div className="p-4 rounded bg-yellow-100 text-yellow-800">No rate found for this month.</div>;
            }
          })()}
        </div>

        {/* Loan Rate Records List */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Loan Rate Records</h2>
          <div className="overflow-auto">
            <table className="w-full table-auto border-collapse">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-3 pr-4">Rate ID</th>
                  <th className="py-3 pr-4">Effective Date</th>
                  <th className="py-3 pr-4">Rate (%)</th>
                  <th className="py-3 pr-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => {
                  // Check if effective_date matches current month/year
                  let isCurrentMonth = false;
                  if (r.effective_date) {
                    const d = new Date(r.effective_date);
                    const now = new Date();
                    isCurrentMonth = d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
                  }
                  return (
                    <tr
                      key={r.rate_id}
                      className={`border-b hover:bg-gray-50 ${isCurrentMonth ? 'bg-green-100' : ''}`}
                    >
                      <td className="py-3 pr-4">{r.rate_id}</td>
                      <td className={`py-3 pr-4 ${isCurrentMonth ? 'text-green-700 font-bold' : ''}`}>{r.effective_date}</td>
                      <td className="py-3 pr-4">{r.rate}</td>
                      <td className="py-3 pr-4">{r.status ?? '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
