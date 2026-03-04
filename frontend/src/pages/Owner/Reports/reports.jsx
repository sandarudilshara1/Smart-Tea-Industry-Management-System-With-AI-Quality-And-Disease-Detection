import { useEffect, useRef, useState } from "react";
import {
  Download,
  Printer,
  TrendingUp,
  DollarSign,
  Package,
  Users,
  BarChart3,
  Activity,
  Award,
  AlertTriangle,
  Calculator,
} from "lucide-react";
import axios from "../../../api/axios";
import { getLoanRates } from "../../../api/owner";

const ACCENT_COLOR = "#165E52";
const BORDER_COLOR = "#cfece6";

export default function OwnerReportView() {
  const [activeReport, setActiveReport] = useState("overview");
  const [loanRate, setLoanRate] = useState(null);
  const [teaRate, setTeaRate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCalculator, setShowCalculator] = useState(false);
  const reportRef = useRef();

  // Sample data
  const reportData = {
    overview: {
      totalRevenue: "Rs. 12,450,000",
      totalExpenses: "Rs. 8,200,000",
      netProfit: "Rs. 4,250,000",
      totalEmployees: 145,
      activeFactories: 9,
    },
    production: [
      { factory: "Andaradeniya Tea Factory", production: "12,500 kg", growth: "+11.3%" },
      { factory: "Batuwangala Tea Factory", production: "10,800 kg", growth: "+9.7%" },
      { factory: "Ruhuna Tea Factory", production: "14,200 kg", growth: "+13.2%" },
      { factory: "Fortune Tea Factory", production: "11,600 kg", growth: "+10.5%" },
    ],
    financial: [
      { month: "January", revenue: "Rs. 1,200,000", expenses: "Rs. 780,000" },
      { month: "February", revenue: "Rs. 1,150,000", expenses: "Rs. 760,000" },
      { month: "March", revenue: "Rs. 1,350,000", expenses: "Rs. 850,000" },
      { month: "April", revenue: "Rs. 1,280,000", expenses: "Rs. 820,000" },
    ],
    quality: [
      { factory: "Andaradeniya Tea Factory", grade: "A+", score: 92, assessments: 45 },
      { factory: "Batuwangala Tea Factory", grade: "A", score: 88, assessments: 38 },
      { factory: "Ruhuna Tea Factory", grade: "A", score: 89, assessments: 42 },
      { factory: "Fortune Tea Factory", grade: "B+", score: 82, assessments: 36 },
    ],
    diseases: [
      { disease: "Blister Blight", cases: 8, status: "Active", affectedArea: "12 hectares" },
      { disease: "Red Rust", cases: 5, status: "Monitoring", affectedArea: "8 hectares" },
      { disease: "Root Rot", cases: 3, status: "Under Control", affectedArea: "4 hectares" },
    ],
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const rates = await getLoanRates();
        const today = new Date().toISOString().slice(0, 10);
        if (Array.isArray(rates)) {
          const sorted = rates.sort((a, b) => new Date(a.effectiveDate) - new Date(b.effectiveDate));
          const current = sorted.filter(r => new Date(r.effectiveDate) <= new Date(today)).pop();
          setLoanRate(current || null);
        }
      } catch (err) {
        setLoanRate(null);
      }

      try {
        const res = await axios.get("/api/tea_rates/approved");
        const teaRates = Array.isArray(res.data) ? res.data : [];
        const now = new Date();
        const filtered = teaRates.filter(r => {
          const d = new Date(r.effectiveDate);
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        });
        if (filtered.length > 0) {
          const latest = filtered.reduce((a, b) => new Date(a.effectiveDate) > new Date(b.effectiveDate) ? a : b);
          setTeaRate(latest);
        }
      } catch (err) {
        setTeaRate(null);
      }

      setLoading(false);
    }
    fetchData();
  }, []);

  const handlePrint = () => window.print();

  const handleCalculator = () => {
    setShowCalculator(!showCalculator);
  };

  const reportTypes = [
    { id: "overview", label: "Overview", icon: Activity },
    { id: "production", label: "Production", icon: Package },
    { id: "financial", label: "Financial", icon: DollarSign },
    { id: "quality", label: "Quality", icon: Award },
    { id: "diseases", label: "Diseases", icon: AlertTriangle },
    { id: "rates", label: "Rates", icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <style>{`
        @media print {
          .print\\:hidden { display: none !important; }
          nav, aside { display: none !important; }
        }
      `}</style>

      {/* Header */}
      <div className="bg-white shadow-md border-b-2 rounded-lg mb-6 p-6" style={{ borderColor: ACCENT_COLOR }}>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: ACCENT_COLOR }}>Reports & Analytics</h1>
            <p className="text-gray-600 mt-1">Business reports and insights</p>
          </div>
          <div className="flex gap-2 print:hidden">
            <button
              onClick={handleCalculator}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium border"
              style={{ borderColor: BORDER_COLOR, color: ACCENT_COLOR }}
            >
              <Calculator size={18} />
              Calculator
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium"
              style={{ backgroundColor: ACCENT_COLOR }}
            >
              <Printer size={18} />
              Print
            </button>
          </div>
        </div>
      </div>

      {/* Simple Calculator Modal */}
      {showCalculator && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 print:hidden">
          <div className="bg-white rounded-lg shadow-2xl p-6 w-80">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold" style={{ color: ACCENT_COLOR }}>Quick Calculator</h3>
              <button
                onClick={() => setShowCalculator(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="bg-gray-100 p-3 rounded mb-4 text-right text-2xl font-mono">
              <input
                type="text"
                id="calc-display"
                defaultValue="0"
                readOnly
                className="w-full bg-transparent text-right outline-none"
              />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {['7', '8', '9', '/', '4', '5', '6', '*', '1', '2', '3', '-', '0', '.', '=', '+'].map((btn) => (
                <button
                  key={btn}
                  onClick={() => {
                    const display = document.getElementById('calc-display');
                    if (btn === '=') {
                      try {
                        display.value = eval(display.value);
                      } catch {
                        display.value = 'Error';
                      }
                    } else {
                      if (display.value === '0') display.value = '';
                      display.value += btn;
                    }
                  }}
                  className="p-4 rounded-lg font-semibold hover:opacity-80"
                  style={{ 
                    backgroundColor: btn === '=' ? ACCENT_COLOR : '#f3f4f6',
                    color: btn === '=' ? 'white' : '#111'
                  }}
                >
                  {btn}
                </button>
              ))}
              <button
                onClick={() => {
                  document.getElementById('calc-display').value = '0';
                }}
                className="col-span-4 p-4 rounded-lg font-semibold bg-red-500 text-white hover:bg-red-600"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Tabs */}
      <div className="bg-white rounded-lg shadow-md p-3 mb-6 print:hidden">
        <div className="flex gap-2 flex-wrap">
          {reportTypes.map((type) => {
            const Icon = type.icon;
            return (
              <button
                key={type.id}
                onClick={() => setActiveReport(type.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  activeReport === type.id ? "text-white" : "border"
                }`}
                style={
                  activeReport === type.id
                    ? { backgroundColor: ACCENT_COLOR }
                    : { borderColor: BORDER_COLOR, color: ACCENT_COLOR }
                }
              >
                <Icon size={18} />
                {type.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Report Content */}
      <div ref={reportRef} className="bg-white rounded-lg shadow-md p-6">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading...</p>
          </div>
        ) : (
          <>
            {/* Overview */}
            {activeReport === "overview" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold mb-4" style={{ color: ACCENT_COLOR }}>Business Overview</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="border rounded-lg p-4" style={{ borderColor: BORDER_COLOR }}>
                    <DollarSign size={24} style={{ color: ACCENT_COLOR }} className="mb-2" />
                    <p className="text-sm text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold">{reportData.overview.totalRevenue}</p>
                  </div>
                  <div className="border rounded-lg p-4" style={{ borderColor: BORDER_COLOR }}>
                    <TrendingUp size={24} style={{ color: ACCENT_COLOR }} className="mb-2" />
                    <p className="text-sm text-gray-600">Total Expenses</p>
                    <p className="text-2xl font-bold">{reportData.overview.totalExpenses}</p>
                  </div>
                  <div className="border rounded-lg p-4" style={{ borderColor: BORDER_COLOR }}>
                    <Activity size={24} style={{ color: ACCENT_COLOR }} className="mb-2" />
                    <p className="text-sm text-gray-600">Net Profit</p>
                    <p className="text-2xl font-bold">{reportData.overview.netProfit}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="border rounded-lg p-4" style={{ borderColor: BORDER_COLOR }}>
                    <Users size={24} style={{ color: ACCENT_COLOR }} className="mb-2" />
                    <p className="text-sm text-gray-600">Total Employees</p>
                    <p className="text-2xl font-bold">{reportData.overview.totalEmployees}</p>
                  </div>
                  <div className="border rounded-lg p-4" style={{ borderColor: BORDER_COLOR }}>
                    <Package size={24} style={{ color: ACCENT_COLOR }} className="mb-2" />
                    <p className="text-sm text-gray-600">Active Factories</p>
                    <p className="text-2xl font-bold">{reportData.overview.activeFactories}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Production */}
            {activeReport === "production" && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold mb-4" style={{ color: ACCENT_COLOR }}>Production Report</h2>
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2" style={{ borderColor: ACCENT_COLOR }}>
                      <th className="px-4 py-3 text-left">Factory</th>
                      <th className="px-4 py-3 text-right">Production</th>
                      <th className="px-4 py-3 text-right">Growth</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.production.map((item, idx) => (
                      <tr key={idx} className="border-b">
                        <td className="px-4 py-3">{item.factory}</td>
                        <td className="px-4 py-3 text-right">{item.production}</td>
                        <td className="px-4 py-3 text-right text-green-600 font-bold">{item.growth}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Financial */}
            {activeReport === "financial" && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold mb-4" style={{ color: ACCENT_COLOR }}>Financial Report</h2>
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2" style={{ borderColor: ACCENT_COLOR }}>
                      <th className="px-4 py-3 text-left">Month</th>
                      <th className="px-4 py-3 text-right">Revenue</th>
                      <th className="px-4 py-3 text-right">Expenses</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.financial.map((item, idx) => (
                      <tr key={idx} className="border-b">
                        <td className="px-4 py-3">{item.month}</td>
                        <td className="px-4 py-3 text-right text-green-600">{item.revenue}</td>
                        <td className="px-4 py-3 text-right text-red-600">{item.expenses}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Quality Report */}
            {activeReport === "quality" && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold mb-4" style={{ color: ACCENT_COLOR }}>Quality Assessment Report</h2>
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2" style={{ borderColor: ACCENT_COLOR }}>
                      <th className="px-4 py-3 text-left">Factory</th>
                      <th className="px-4 py-3 text-center">Grade</th>
                      <th className="px-4 py-3 text-right">Quality Score</th>
                      <th className="px-4 py-3 text-right">Assessments</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.quality.map((item, idx) => (
                      <tr key={idx} className="border-b">
                        <td className="px-4 py-3">{item.factory}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            item.grade.startsWith('A') ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {item.grade}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-bold" style={{ color: ACCENT_COLOR }}>{item.score}/100</td>
                        <td className="px-4 py-3 text-right text-gray-700">{item.assessments}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Disease Report */}
            {activeReport === "diseases" && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold mb-4" style={{ color: ACCENT_COLOR }}>Disease Monitoring Report</h2>
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2" style={{ borderColor: ACCENT_COLOR }}>
                      <th className="px-4 py-3 text-left">Disease Name</th>
                      <th className="px-4 py-3 text-center">Cases</th>
                      <th className="px-4 py-3 text-center">Status</th>
                      <th className="px-4 py-3 text-right">Affected Area</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.diseases.map((item, idx) => (
                      <tr key={idx} className="border-b">
                        <td className="px-4 py-3 font-semibold">{item.disease}</td>
                        <td className="px-4 py-3 text-center font-bold text-gray-700">{item.cases}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            item.status === 'Active' ? 'bg-red-100 text-red-700' :
                            item.status === 'Monitoring' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-gray-700">{item.affectedArea}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Rates */}
            {activeReport === "rates" && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold mb-4" style={{ color: ACCENT_COLOR }}>Current Rates</h2>
                
                <div className="border rounded-lg p-6" style={{ borderColor: BORDER_COLOR }}>
                  <h3 className="text-lg font-bold mb-3" style={{ color: ACCENT_COLOR }}>Current Loan Rate</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Rate</p>
                      <span className="text-3xl font-bold" style={{ color: ACCENT_COLOR }}>
                        {loanRate ? loanRate.rate + "%" : "N/A"}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Effective Date</p>
                      <span className="text-lg">{loanRate ? loanRate.effectiveDate : "N/A"}</span>
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-6" style={{ borderColor: BORDER_COLOR }}>
                  <h3 className="text-lg font-bold mb-3" style={{ color: ACCENT_COLOR }}>Current Tea Rate</h3>
                  <div>
                    <p className="text-sm text-gray-600">Rate per kg</p>
                    <span className="text-3xl font-bold" style={{ color: ACCENT_COLOR }}>
                      Rs. {teaRate && teaRate.rate ? teaRate.rate : "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
