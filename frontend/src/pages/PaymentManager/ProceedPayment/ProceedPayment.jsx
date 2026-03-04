import React, { useMemo, useState, useEffect, useRef } from "react";
import { Search, Download, Eye } from "lucide-react";
import { routes, suppliers } from "../Payments/paymentData";

const ACCENT = "#165E52";

function useOutsideClick(ref, onOutside) {
  useEffect(() => {
    function handle(e) {
      if (ref.current && !ref.current.contains(e.target)) onOutside();
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [ref, onOutside]);
}

function formatCurrency(v) {
  return v?.toLocaleString?.("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00";
}

function exportCsv(filename, rows) {
  const csv = [Object.keys(rows[0] || {}).join(","), ...rows.map(r => Object.values(r).map(v=>`"${String(v).replace(/"/g,'""')}"`).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ProceedPayment() {
  // derive bank payments from suppliers mock
  const bankPayments = useMemo(() => suppliers.filter(s => s.paymentMethod === "Bank"), []);
  const cashPayments = useMemo(() => suppliers.filter(s => s.paymentMethod === "Cash"), []);

  const totalBankAmount = useMemo(() => bankPayments.reduce((s, p) => s + (p.finalAmount || 0), 0), [bankPayments]);

  // Popups state
  const [showBankList, setShowBankList] = useState(false);
  const [showBankHistory, setShowBankHistory] = useState(false);
  const [showBankDetails, setShowBankDetails] = useState(null); // supplier id

  const [bankSearch, setBankSearch] = useState("");
  const [bankFilter, setBankFilter] = useState("");

  const bankRef = useRef();
  useOutsideClick(bankRef, () => setShowBankList(false));

  // Cash section
  const [cashSearchPending, setCashSearchPending] = useState("");
  const [cashSearchHistory, setCashSearchHistory] = useState("");
  const [cashList, setCashList] = useState(cashPayments.map(c => ({ ...c })));

  const totalPendingCash = useMemo(() => {
    return cashList.reduce((sum, p) => sum + ((p.status === 'Pending') ? (p.finalAmount || 0) : 0), 0);
  }, [cashList]);

  function handlePay(id) {
    setCashList(prev => prev.map(p => p.id === id ? { ...p, status: 'Paid' } : p));
  }

  // Cash detail popup
  const [selectedCashId, setSelectedCashId] = useState(null);
  const [showCashDetails, setShowCashDetails] = useState(false);

  function openCashDetails(id) {
    setSelectedCashId(id);
    setShowCashDetails(true);
  }

  function handleCashPayFromModal(id) {
    // mark as Driver Collected and set paidDate to today
    const today = new Date().toISOString().split('T')[0];
    setCashList(prev => prev.map(p => p.id === id ? { ...p, status: 'Driver Collected', paidDate: today } : p));
    setShowCashDetails(false);
  }

  // bank list derived rows
  const bankListRows = bankPayments.filter(b => {
    if (bankFilter && b.bankName !== bankFilter) return false;
    if (bankSearch) {
      const q = bankSearch.toLowerCase();
      return [b.supplierName, b.bankName, b.accountNo, String(b.finalAmount), b.branch || ""].some(v => String(v).toLowerCase().includes(q));
    }
    return true;
  });

  const bankHistoryRows = bankPayments.map(b => ({ paymentId: b.id, date: b.paidDate || b.paymentDate || '-', totalAmount: formatCurrency(b.finalAmount || 0) }));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-md border-b" style={{ borderColor: '#cfece6' }}>
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold" style={{ color: ACCENT }}>Proceed Payment</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* Bank Payments Section */}
        <div className="bg-white rounded-lg shadow-md border p-6" style={{ borderColor: '#e6f3ee' }}>
          <h2 className="font-semibold text-lg mb-4">Bank Payments</h2>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex flex-col">
              <div className="text-sm text-gray-600">Total Ammount :</div>
              <div className="text-2xl font-bold">Rs. {formatCurrency(totalBankAmount)}</div>
            </div>
            <div className="flex gap-3">
              <button className="px-4 py-2 rounded border border-[#073026] text-[#073026] flex items-center gap-2" onClick={() => exportCsv('bank-payments.csv', bankPayments.map(b=>({ id: b.id, name: b.supplierName, bank: b.bankName || '', accountNo: b.accountNo || '', amount: b.finalAmount })))}><Download className="h-4 w-4"/>Download</button>
              <button className="px-4 py-2 rounded bg-[#073026] text-white" onClick={() => setShowBankList(true)}>View</button>
              <button className="px-4 py-2 rounded bg-[#073026] text-white" onClick={() => setShowBankHistory(true)}>History</button>
            </div>
          </div>

          {/* bank list popup */}
          {showBankList && (
            <div className="fixed inset-0 z-40 flex items-center justify-center px-4">
              <div className="absolute inset-0 bg-black opacity-40" onClick={() => setShowBankList(false)} />
              <div ref={bankRef} className="relative w-full max-w-3xl bg-white rounded shadow-lg border max-h-[80vh] overflow-auto">
                <div className="p-4 flex items-center justify-between border-b">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <input placeholder="Search" value={bankSearch} onChange={e=>setBankSearch(e.target.value)} className="pl-10 pr-3 py-2 border rounded text-sm" />
                    </div>
                    <select value={bankFilter} onChange={e=>setBankFilter(e.target.value)} className="p-2 border rounded text-sm">
                      <option value="">All Banks</option>
                      {[...new Set(bankPayments.map(b=>b.bankName).filter(Boolean))].map(bn=> <option key={bn} value={bn}>{bn}</option>)}
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="px-3 py-1 border rounded text-sm" onClick={()=>exportCsv('bank-payments-popup.csv', bankListRows.map(r=>({ name: r.supplierName, bank: r.bankName || '', accountNo: r.accountNo||'', amount: r.finalAmount })))}>Download CSV</button>
                  </div>
                </div>
                <div className="max-h-80 overflow-auto">
                  <div className="grid grid-cols-5 gap-4 p-3 text-sm font-medium bg-[#01251F] text-white">
                    <div className="text-center">Name</div>
                    <div className="text-center">Bank</div>
                    <div className="text-center">Acc No</div>
                    <div className="text-left">Amount</div>
                    <div className="text-center">Branch</div>
                  </div>
                  {bankListRows.length>0 ? bankListRows.map(b=> (
                    <div key={b.id} className="grid grid-cols-5 gap-4 p-3 items-center border-b text-sm text-center">
                      <div className="text-center">{b.supplierName}</div>
                      <div className="text-center">{b.bankName||'-'}</div>
                      <div className="text-center">{b.accountNo||'-'}</div>
                      <div className="text-left">Rs. {formatCurrency(b.finalAmount||0)}</div>
                      <div className="text-center">{b.branch||'-'}</div>
                    </div>
                  )) : <div className="p-6 text-center text-gray-500">No bank payments found.</div>}
                </div>
              </div>
            </div>
          )}

          {/* bank history popup */}
          {showBankHistory && (
            <div className="fixed inset-0 z-40 flex items-center justify-center px-4">
              <div className="absolute inset-0 bg-black opacity-40" onClick={() => setShowBankHistory(false)} />
              <div className="relative w-full max-w-3xl bg-white rounded shadow-lg border max-h-[80vh] overflow-auto">
                <div className="p-4 flex items-center justify-between border-b">
                  <div className="text-xl font-bold" style={{ color: '#1f2937' }}>Bank Payment History</div>
                </div>
                <div className="max-h-80 overflow-auto">
                  <div className="grid grid-cols-4 gap-4 p-3 text-sm font-medium bg-[#01251F] text-white">
                    <div className="text-center">Payment ID</div>
                    <div className="text-center">Date</div>
                    <div className="text-left">Total Amount</div>
                    <div className="text-center">View</div>
                  </div>
                  {bankHistoryRows.map(row=> (
                    <div key={row.paymentId} className="grid grid-cols-4 gap-4 p-3 items-center border-b text-sm text-center">
                      <div className="text-center">{row.paymentId}</div>
                      <div className="text-center">{row.date}</div>
                      <div className="text-left">Rs. {row.totalAmount}</div>
                      <div className="flex justify-center">
                        <button className="px-3 py-1 rounded bg-[#073026] text-white" onClick={()=>setShowBankDetails(row.paymentId)}><Eye className="h-4 w-4"/></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* bank details popup */}
          {showBankDetails && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
              <div className="absolute inset-0 bg-black opacity-40" onClick={() => setShowBankDetails(null)} />
              <div className="relative w-full max-w-xl bg-white rounded shadow-lg border p-6 max-h-[85vh] overflow-auto">
                <div className="mb-4">
                  <h3 className="text-xl font-bold" style={{ color: '#1f2937' }}>Bank Payment Details</h3>
                </div>
                <div>
                  {(() => {
                    const s = bankPayments.find(x=>x.id===showBankDetails);
                    if (!s) return <div>Not found</div>;
                    return (
                      <div className="space-y-2 text-sm">
                        <div><b>Payment ID:</b> {s.id}</div>
                        <div><b>Name:</b> {s.supplierName}</div>
                        <div><b>Bank:</b> {s.bankName||'-'}</div>
                        <div><b>Account No:</b> {s.accountNo||'-'}</div>
                        <div><b>Branch:</b> {s.branch||'-'}</div>
                        <div><b>Amount:</b> Rs. {formatCurrency(s.finalAmount||0)}</div>
                        <div><b>Date:</b> {s.paidDate || s.paymentDate || '-'}</div>
                        <div><b>Details:</b> {s.teaLeafEntries ? `${s.teaLeafEntries.length} entries` : '—'}</div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Cash Payments Section */}
        <div className="bg-white rounded-lg shadow-md border p-6" style={{ borderColor: '#e6f3ee' }}>
          <h2 className="font-semibold text-lg mb-4">Cash Payments</h2>
          <div className="mb-3">
            <div className="text-sm text-gray-600">Total Pending Cash Payments:</div>
            <div className="text-xl font-bold">Rs. {formatCurrency(totalPendingCash)}</div>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <div className="font-medium">Pending payment</div>
              <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input placeholder="Search pending" value={cashSearchPending} onChange={e=>setCashSearchPending(e.target.value)} className="pl-10 pr-3 py-2 border rounded text-sm" />
              </div>
            </div>

            <div className="overflow-auto border rounded">
              <div className="grid grid-cols-5 gap-4 p-3 text-sm font-medium bg-[#01251F] text-white">
                <div className="text-center">Payment ID</div>
                <div className="text-center">Driver Name</div>
                <div className="text-center">Date</div>
                <div className="text-left">Total Amount</div>
                <div className="text-center">Status</div>
              </div>
              {cashList.filter(r=> (cashSearchPending? [r.id,r.supplierName,String(r.finalAmount)].join(' ').toLowerCase().includes(cashSearchPending.toLowerCase()): true)).map(r=> (
                <div key={r.id} className="grid grid-cols-5 gap-4 p-3 items-center border-b text-sm hover:bg-gray-50 cursor-pointer" onClick={() => openCashDetails(r.id)}>
                  <div className="text-center">{r.id}</div>
                  <div className="text-center">{r.supplierName}</div>
                  <div className="text-center">{r.paymentDate||'-'}</div>
                  <div className="text-left">Rs. {formatCurrency(r.finalAmount||0)}</div>
                  <div className="text-center">
                    <span className="px-3 py-1 rounded text-sm" style={{backgroundColor: r.status === 'Driver Collected' ? '#e6f3ee' : 'transparent', color: r.status === 'Driver Collected' ? '#065f4b' : '#000'}}>{r.status || 'Pending'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="font-medium">History</div>
              <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input placeholder="Search history" value={cashSearchHistory} onChange={e=>setCashSearchHistory(e.target.value)} className="pl-10 pr-3 py-2 border rounded text-sm" />
              </div>
            </div>

            <div className="overflow-auto border rounded">
              <div className="grid grid-cols-4 gap-4 p-3 text-sm font-medium bg-[#01251F] text-white">
                <div className="text-center">Payment ID</div>
                <div className="text-center">Driver Name</div>
                <div className="text-center">Date</div>
                <div className="text-left">Total Amount</div>
              </div>
              {cashList.filter(r=> r.status !== 'Pending' && (cashSearchHistory? [r.id,r.supplierName,String(r.finalAmount)].join(' ').toLowerCase().includes(cashSearchHistory.toLowerCase()): true)).map(r=> (
                <div key={r.id} className="grid grid-cols-4 gap-4 p-3 items-center border-b text-sm text-center">
                  <div className="text-center">{r.id}</div>
                  <div className="text-center">{r.supplierName}</div>
                  <div className="text-center">{r.paidDate||r.paymentDate||'-'}</div>
                  <div className="text-left">Rs. {formatCurrency(r.finalAmount||0)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Cash details modal */}
        {showCashDetails && selectedCashId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-black opacity-40" onClick={() => setShowCashDetails(false)} />
            <div className="relative w-full max-w-md bg-white rounded shadow-lg border p-6 text-center">
              <div className="mb-4">
                <h3 className="text-xl font-bold" style={{ color: '#1f2937' }}>Cash Payment Details</h3>
              </div>
              <div>
                {(() => {
                  const s = cashList.find(x=>x.id===selectedCashId);
                  if (!s) return <div>Not found</div>;
                  const payableSuppliers = s.suppliers ? s.suppliers.length : 0;
                  const routeName = routes.find(rt=>rt.id===s.routeId)?.routeName || '-';
                  return (
                    <div className="space-y-3 text-sm flex flex-col items-center">
                      <div><b>Driver Name:</b> {s.supplierName}</div>
                      <div><b>Route:</b> {routeName}</div>
                      <div><b>Payable Supplier Count:</b> {payableSuppliers}</div>
                      <div><b>Total Amount:</b> Rs. {formatCurrency(s.finalAmount||0)}</div>
                      <div><b>Date:</b> {s.paymentDate || '-'}</div>
                      <div className="mt-4">
                        { (s.status === 'Pending' || !s.status) && (
                          <button className="px-6 py-3 rounded bg-[#0b7b5a] text-white text-lg font-semibold shadow-md hover:brightness-95" onClick={()=>handleCashPayFromModal(s.id)}>Pay</button>
                        ) }
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
