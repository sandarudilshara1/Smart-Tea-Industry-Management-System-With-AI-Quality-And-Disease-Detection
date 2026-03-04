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
import {
  getOverview,
  getProduction,
  getFinancial,
  getQuality,
  getDiseases
} from "../../../api/reports";

const ACCENT_COLOR = "#165E52";
const BORDER_COLOR = "#cfece6";

// Helper function to format currency
const formatCurrency = (value) => {
  if (!value && value !== 0) return "N/A";
  return `Rs. ${Number(value).toLocaleString()}`;
};

// Helper function to format numbers
const formatNumber = (value) => {
  if (!value && value !== 0) return "N/A";
  return Number(value).toLocaleString();
};

export default function OwnerReportView() {
  const [activeReport, setActiveReport] = useState("overview");
  const [loanRate, setLoanRate] = useState(null);
  const [teaRate, setTeaRate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCalculator, setShowCalculator] = useState(false);
  const [calcDisplay, setCalcDisplay] = useState("0");
  const [reportData, setReportData] = useState({
    overview: {},
    production: [],
    financial: [],
    quality: [],
    diseases: []
  });
  const reportRef = useRef();

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Fetch all report data
        const [overviewRes, productionRes, financialRes, qualityRes, diseasesRes, rates] = await Promise.all([
          getOverview().catch(() => ({ data: {} })),
          getProduction().catch(() => ({ data: [] })),
          getFinancial().catch(() => ({ data: [] })),
          getQuality().catch(() => ({ data: [] })),
          getDiseases().catch(() => ({ data: [] })),
          getLoanRates().catch(() => [])
        ]);

        setReportData({
          overview: overviewRes.data || {},
          production: productionRes.data || [],
          financial: financialRes.data || [],
          quality: qualityRes.data || [],
          diseases: diseasesRes.data || []
        });

        // Set loan rate
        const today = new Date().toISOString().slice(0, 10);
        if (Array.isArray(rates)) {
          const sorted = rates.sort((a, b) => new Date(a.effectiveDate) - new Date(b.effectiveDate));
          const current = sorted.filter(r => new Date(r.effectiveDate) <= new Date(today)).pop();
          setLoanRate(current || null);
        }
      } catch (err) {
        console.error('Error fetching report data:', err);
        setLoanRate(null);
      }

      // Fetch tea rates
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
        console.error('Error fetching tea rates:', err);
        setTeaRate(null);
      }

      setLoading(false);
    }
    fetchData();
  }, []);

  const handlePrint = () => window.print();

  const handleCalculator = () => {
    setShowCalculator(!showCalculator);
    if (!showCalculator) setCalcDisplay("0");
  };

  const handleCalcButton = (value) => {
    if (value === '=') {
      try {
        // Evaluate expression safely
        const result = Function('"use strict"; return (' + calcDisplay + ')')();
        setCalcDisplay(String(result));
      } catch {
        setCalcDisplay('Error');
        setTimeout(() => setCalcDisplay('0'), 1000);
      }
    } else if (value === 'C') {
      setCalcDisplay('0');
    } else if (value === 'Backspace') {
      setCalcDisplay(prev => prev.length > 1 ? prev.slice(0, -1) : '0');
    } else {
      setCalcDisplay(prev => {
        // Prevent multiple operators or decimals in a row
        const lastChar = prev[prev.length - 1];
        const operators = ['+', '-', '*', '/'];
        
        if (operators.includes(value) && operators.includes(lastChar)) {
          return prev.slice(0, -1) + value;
        }
        
        // Handle decimal point
        if (value === '.') {
          const parts = prev.split(/[\+\-\*\/]/);
          const lastNumber = parts[parts.length - 1];
          if (lastNumber.includes('.')) return prev;
        }
        
        return prev === '0' && value !== '.' ? value : prev + value;
      });
    }
  };

  // Keyboard support for calculator
  useEffect(() => {
    if (!showCalculator) return;
    
    const handleKeyPress = (e) => {
      const key = e.key;
      if (/^[0-9\+\-\*\/\.]$/.test(key)) {
        handleCalcButton(key);
      } else if (key === 'Enter' || key === '=') {
        handleCalcButton('=');
      } else if (key === 'Escape' || key === 'c' || key === 'C') {
        handleCalcButton('C');
      } else if (key === 'Backspace') {
        e.preventDefault();
        handleCalcButton('Backspace');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showCalculator, calcDisplay]);

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
          nav, aside, button { display: none !important; }
          body { background: white; }
          .bg-gray-50 { background: white; }
          .shadow-md, .shadow-lg, .shadow-2xl { box-shadow: none; }
          table { page-break-inside: auto; }
          tr { page-break-inside: avoid; page-break-after: auto; }
          thead { display: table-header-group; }
          tfoot { display: table-footer-group; }
          h1, h2, h3 { page-break-after: avoid; }
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

      {/* Enhanced Calculator Modal */}
      {showCalculator && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 print:hidden">
          <div className="bg-white rounded-lg shadow-2xl p-6 w-80">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold" style={{ color: ACCENT_COLOR }}>Quick Calculator</h3>
              <button
                onClick={() => setShowCalculator(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>
            <div className="bg-gray-100 p-4 rounded mb-4 text-right text-2xl font-mono min-h-[60px] flex items-center justify-end">
              <div className="w-full overflow-x-auto">{calcDisplay}</div>
            </div>
            <div className="grid grid-cols-4 gap-2 mb-2">
              {['7', '8', '9', '/', '4', '5', '6', '*', '1', '2', '3', '-', '0', '.', '=', '+'].map((btn) => (
                <button
                  key={btn}
                  onClick={() => handleCalcButton(btn)}
                  className="p-4 rounded-lg font-semibold hover:opacity-80 transition-opacity"
                  style={{ 
                    backgroundColor: btn === '=' ? ACCENT_COLOR : '#f3f4f6',
                    color: btn === '=' ? 'white' : '#111'
                  }}
                >
                  {btn}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleCalcButton('Backspace')}
                className="p-4 rounded-lg font-semibold bg-orange-500 text-white hover:bg-orange-600 transition-colors"
              >
                Backspace
              </button>
              <button
                onClick={() => handleCalcButton('C')}
                className="p-4 rounded-lg font-semibold bg-red-500 text-white hover:bg-red-600 transition-colors"
              >
                Clear
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-3 text-center">
              Tip: Use keyboard for input (Esc to clear)
            </p>
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
                    <p className="text-2xl font-bold">{formatCurrency(reportData.overview.totalRevenue)}</p>
                  </div>
                  <div className="border rounded-lg p-4" style={{ borderColor: BORDER_COLOR }}>
                    <TrendingUp size={24} style={{ color: ACCENT_COLOR }} className="mb-2" />
                    <p className="text-sm text-gray-600">Total Expenses</p>
                    <p className="text-2xl font-bold">{formatCurrency(reportData.overview.totalExpenses)}</p>
                  </div>
                  <div className="border rounded-lg p-4" style={{ borderColor: BORDER_COLOR }}>
                    <Activity size={24} style={{ color: ACCENT_COLOR }} className="mb-2" />
                    <p className="text-sm text-gray-600">Net Profit</p>
                    <p className="text-2xl font-bold">{formatCurrency(reportData.overview.netProfit)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="border rounded-lg p-4" style={{ borderColor: BORDER_COLOR }}>
                    <Users size={24} style={{ color: ACCENT_COLOR }} className="mb-2" />
                    <p className="text-sm text-gray-600">Total Employees</p>
                    <p className="text-2xl font-bold">{formatNumber(reportData.overview.totalEmployees)}</p>
                  </div>
                  <div className="border rounded-lg p-4" style={{ borderColor: BORDER_COLOR }}>
                    <Package size={24} style={{ color: ACCENT_COLOR }} className="mb-2" />
                    <p className="text-sm text-gray-600">Active Factories</p>
                    <p className="text-2xl font-bold">{formatNumber(reportData.overview.activeFactories)}</p>
                  </div>
                </div>

                {/* Additional Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div className="border rounded-lg p-4" style={{ borderColor: BORDER_COLOR }}>
                    <Users size={24} style={{ color: ACCENT_COLOR }} className="mb-2" />
                    <p className="text-sm text-gray-600">Total Managers</p>
                    <p className="text-2xl font-bold">{formatNumber(reportData.overview.totalManagers)}</p>
                  </div>
                  <div className="border rounded-lg p-4" style={{ borderColor: BORDER_COLOR }}>
                    <Package size={24} style={{ color: ACCENT_COLOR }} className="mb-2" />
                    <p className="text-sm text-gray-600">Total Drivers</p>
                    <p className="text-2xl font-bold">{formatNumber(reportData.overview.totalDrivers)}</p>
                  </div>
                  <div className="border rounded-lg p-4" style={{ borderColor: BORDER_COLOR }}>
                    <Package size={24} style={{ color: ACCENT_COLOR }} className="mb-2" />
                    <p className="text-sm text-gray-600">Fertilizer Companies</p>
                    <p className="text-2xl font-bold">{formatNumber(reportData.overview.totalCompanies)}</p>
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
