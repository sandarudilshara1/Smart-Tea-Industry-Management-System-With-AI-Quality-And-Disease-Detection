import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import RoutesView from './RoutesView'
import DriversView from './DriversView'

const months = [
  'January','February','March','April','May','June','July','August','September','October','November','December'
]

const sampleRoutes = [
  { id: 'RT-001', name: 'Kandy Route', suppliers: 3, weight: 4241.5, amount: 328381.3 },
  { id: 'RT-002', name: 'Matale Route', suppliers: 2, weight: 2437.2, amount: 187741.65 },
  { id: 'RT-003', name: 'Nuwara Eliya Route', suppliers: 0, weight: 0, amount: 0 }
]

const sampleDriverPayments = [
  { pid: 'KD-001', name: 'Kandy Route', date: '2025-06-03', status: 'Success', amount: 328381.3 },
  { pid: 'MT-002', name: 'Matale Route', date: '2025-06-02', status: 'Success', amount: 187741.65 },
  { pid: 'NE-003', name: 'Nuwara Eliya Route', date: '2025-06-01', status: 'Success', amount: 0 }
]

function currency(n) {
  return n.toLocaleString(undefined, { style: 'currency', currency: 'LKR', maximumFractionDigits: 2 })
}

export default function PaymentMain() {
  // Inline CSS string inserted into the page so no separate CSS file is required
  const inlineCss = `
  .pm-root { padding: 20px; font-family: Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; }
  .pm-title { color: #165e52; margin-bottom: 16px; }
  .pm-tabs { display:flex; gap:8px; margin-bottom:12px }
  .pm-tab { padding:10px 18px; border-radius:6px; border:1px solid #e0e0e0; background:#f5f5f5; cursor:pointer }
  .pm-tab.active { background:#e6f1ec; border-color:#0b6b57; font-weight:600 }
  .pm-card { background: #fff; border-radius:8px; padding:18px; box-shadow: 0 1px 3px rgba(0,0,0,0.05) }
  .pm-header-row { display:flex; gap:20px; flex-wrap:wrap; align-items:flex-start }
  .pm-summary { flex:1 1 520px }
  .pm-summary h3 { margin:0 0 10px 0 }
  .pm-summary-grid { display:flex; gap:12px; flex-wrap:wrap }
  .pm-sum-box { background:#ffffff; padding:24px; border-radius:12px; min-width:200px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); transition: transform 200ms; cursor: pointer; border: 1.5px solid black }
  .pm-sum-box:hover { transform: scale(1.02) }
  .pm-sum-box .label { color:#6b6b6b; font-size:13px }
  .pm-sum-box .value { font-size:22px; font-weight:700; margin-top:6px }
  .pm-sum-box .meta { color:#9a9a9a; font-size:12px; margin-top:6px }
  .pm-controls { display:flex; flex-direction:column; gap:12px; min-width:260px }
  .pm-actions { display:flex; gap:8px; align-items:center }
  .pm-select { display:flex; gap:6px; align-items:center; font-size:13px }
  .pm-select select, .pm-select input { margin-left:6px; padding:6px 8px; border-radius:4px; border:1px solid #ddd }
  .btn { padding:8px 12px; border-radius:6px; border:1px solid transparent; cursor:pointer }
  .btn-primary { background:#0b6b57; color:white }
  .btn-ghost { background:transparent; border:1px solid #ddd }
  .btn-sm { padding:6px 8px; font-size:13px }
  .pm-search { display:flex; gap:8px; align-items:center }
  .pm-search input { padding:8px 10px; border-radius:6px; border:1px solid #ddd; min-width:180px }
  .pm-table-wrap { margin-top:18px; overflow:auto }
  .pm-table { width:100%; border-collapse:collapse; min-width:800px }
  .pm-table th, .pm-table td { text-align:left; padding:10px 12px; border-bottom:1px solid #f0f0f0 }
  .pm-table thead th { background:#083525; color:white; position:sticky; top:0 }
  @media (max-width: 880px) {
    .pm-header-row { flex-direction:column }
    .pm-summary { order:2 }
    .pm-controls { order:1; width:100% }
    .pm-table { min-width:600px }
  }
  `
  const [view, setView] = useState('supplier') // supplier | driver
  const [search, setSearch] = useState('')
  const [month, setMonth] = useState('June')
  const [year, setYear] = useState(new Date().getFullYear())
  const [commissionRate] = useState(10)
  const navigate = useNavigate()

  const filteredRoutes = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return sampleRoutes
    return sampleRoutes.filter(r =>
      r.id.toLowerCase().includes(q) || r.name.toLowerCase().includes(q)
    )
  }, [search])

  const filteredDriverPayments = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return sampleDriverPayments
    return sampleDriverPayments.filter(p =>
      p.pid.toLowerCase().includes(q) || p.name.toLowerCase().includes(q)
    )
  }, [search])

  // Map sampleRoutes to shape expected by RoutesView
  const routesForView = filteredRoutes.map(r => ({
    routeNumber: r.id,
    routeName: r.name,
    supplierCount: r.suppliers,
    totalWeight: r.weight,
    totalAmount: r.amount,
  }))

  const getCurrentDataForRoutesView = () => sampleRoutes.map(r => ({
    routeNumber: r.id,
    routeName: r.name,
    supplierCount: r.suppliers,
    totalWeight: r.weight,
    totalAmount: r.amount,
  }))

  const totalSupply = sampleRoutes.reduce((s, r) => s + (r.weight || 0), 0)
  const totalSuppliers = sampleRoutes.reduce((s, r) => s + (r.suppliers || 0), 0)
  const totalRoutes = sampleRoutes.length

  return (
    <div className="pm-root">
      <style>{inlineCss}</style>
  <h1 className="pm-title text-3xl font-bold">Payment Management</h1>

      <div className="pm-tabs" role="tablist">
        <button
          className={`pm-tab ${view === 'supplier' ? 'active' : ''}`}
          onClick={() => setView('supplier')}
          aria-selected={view === 'supplier'}
        >
          Supplier
        </button>
        <button
          className={`pm-tab ${view === 'driver' ? 'active' : ''}`}
          onClick={() => setView('driver')}
          aria-selected={view === 'driver'}
        >
          Driver
        </button>
      </div>

      <div className="pm-card">
        <div className="pm-header-row">
          <div className="pm-summary">
            {view === 'supplier' ? (
              <>
                <h3 style={{ color: '#165e52' }} className="text-3xl font-bold">Supplier Payments</h3>
                <div className="pm-summary-grid">
                  <div className="pm-sum-box">
                    <div className="label">Total Supply</div>
                    <div className="value">{Number(totalSupply).toLocaleString()} kg</div>
                    <div className="meta">{totalSuppliers} Suppliers • {totalRoutes} Routes</div>
                  </div>
                  <div className="pm-sum-box">
                    <div className="label">Tea Rate</div>
                    <div className="value">Rs { (102).toFixed(2) }</div>
                    <div className="meta">{month} {year}</div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <h3 style={{ color: '#165e52' }} className="text-3xl font-bold">Driver Payments</h3>
                <div className="pm-summary-grid">
                  <div className="pm-sum-box">
                    <div className="label">Total Collect</div>
                    <div className="value">{Number(totalSupply).toLocaleString()} kg</div>
                    <div className="meta">{totalSuppliers} Suppliers • {totalRoutes} Routes</div>
                  </div>
                  <div className="pm-sum-box">
                    <div className="label">Commission</div>
                    <div className="value">{commissionRate}%</div>
                    <div className="meta">{month} {year}</div>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="pm-controls">
            <div className="pm-actions">
              <button className="btn btn-primary" onClick={() => navigate('/factoryManager/payment/proceed')}>Proceed Payments</button>
              <label className="pm-select">
                Month
                <select value={month} onChange={e => setMonth(e.target.value)}>
                  {months.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </label>
              <label className="pm-select">
                Year
                <input
                  type="number"
                  value={year}
                  onChange={e => setYear(Number(e.target.value))}
                  min={2000}
                  max={2100}
                />
              </label>
            </div>
          </div>
        </div>

        {/* Table controls: search + filters placed at top of the table */}
        <div className="pm-table-controls max-w-7xl mx-auto px-6 py-2 flex items-center justify-between gap-4">
          <div className="flex-1 max-w-md">
            <input
              type="text"
              placeholder={view === 'supplier' ? 'Search routes...' : 'Search payments...'}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-3 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#165E52] focus:outline-none text-gray-900 transition-colors"
              style={{ borderColor: '#cfece6' }}
            />
          </div>
          <div>
            <button
              onClick={() => { /* noop - placeholder for filter toggle */ }}
              className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors shadow-sm"
              style={{ backgroundColor: '#e1f4ef', color: '#165E52', border: '2px solid #cfece6' }}
            >
              Filters ▾
            </button>
          </div>
        </div>

        <div className="pm-table-wrap">
          {view === 'supplier' ? (
            <RoutesView
              filteredData={routesForView}
              getCurrentData={getCurrentDataForRoutesView}
              onViewRoute={(route) => navigate(`/factoryManager/payment/payments?routeName=${encodeURIComponent(route.routeName)}`)}
            />
          ) : (
            <DriversView
              data={filteredDriverPayments}
              getCurrentData={() => sampleDriverPayments}
              // noop handler: clicking View will not redirect
              onView={() => {}}
            />
          )}
        </div>
      </div>
    </div>
  )
}