import { useEffect, useMemo, useState } from "react";
import { jsPDF } from "jspdf";
import {
  AlertTriangle,
  Award,
  Download,
  Package,
  Users,
  DollarSign,
  Truck,
  TrendingUp,
} from "lucide-react";
import {
  getDiseases,
  getFinancial,
  getOverview,
  getProduction,
  getQuality,
  getSupplierInsights,
} from "../../../api/reports";

const ACCENT_COLOR = "#165E52";
const BORDER_COLOR = "#cfece6";

const DEFAULT_DAYS = 30;

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

const formatKg = (value) => {
  if (!value && value !== 0) return "N/A";
  return `${Number(value).toLocaleString()} kg`;
};

const formatPct = (value) => {
  if (!value && value !== 0) return "N/A";
  return `${Number(value).toFixed(2)}%`;
};

const formatDate = (value) => {
  if (!value) return "N/A";
  try {
    return new Date(value).toLocaleDateString();
  } catch {
    return "N/A";
  }
};

function TabIntroCard({ title, description }) {
  return (
    <div
      className="border rounded-lg p-4 bg-gray-50"
      style={{ borderColor: BORDER_COLOR }}
    >
      <div className="text-sm font-semibold" style={{ color: ACCENT_COLOR }}>
        {title}
      </div>
      <div className="text-sm text-gray-600 mt-1">{description}</div>
    </div>
  );
}

export default function OwnerReportView() {
  const [activeReport, setActiveReport] = useState("financial");
  const [reportData, setReportData] = useState({
    financial: null,
    production: null,
    logistics: null,
    quality: null,
    diseases: null,
  });

  const [tabLoading, setTabLoading] = useState({
    snapshot: false,
    leaf: false,
    suppliers: false,
    quality: false,
    diseases: false,
  });

  const [tabError, setTabError] = useState({
    snapshot: null,
    leaf: null,
    suppliers: null,
    quality: null,
    diseases: null,
  });

  const days = DEFAULT_DAYS;

  const tabConfig = useMemo(
    () => ({
      financial: {
        dataKey: "financial",
        fetch: () => getFinancial(days),
      },
      production: {
        dataKey: "production",
        fetch: () => getProduction(days),
      },
      logistics: {
        dataKey: "logistics",
        fetch: () => getSupplierInsights(days),
      },
      quality: {
        dataKey: "quality",
        fetch: () => getQuality(days),
      },
      diseases: {
        dataKey: "diseases",
        fetch: () => getDiseases(days),
      },
    }),
    [days]
  );

  const fetchTabData = async (tabId, { force = false } = {}) => {
    const config = tabConfig[tabId];
    if (!config) return;

    const { dataKey, fetch } = config;
    const alreadyHasData = reportData[dataKey] !== null;
    if (alreadyHasData && !force) return;

    setTabLoading((prev) => ({ ...prev, [tabId]: true }));
    setTabError((prev) => ({ ...prev, [tabId]: null }));

    try {
      const res = await fetch();
      setReportData((prev) => ({ ...prev, [dataKey]: res?.data ?? null }));
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(`Error fetching tab '${tabId}':`, err);
      setTabError((prev) => ({
        ...prev,
        [tabId]: err?.response?.data?.message || err?.message || "Failed to load data",
      }));
    } finally {
      setTabLoading((prev) => ({ ...prev, [tabId]: false }));
    }
  };

  useEffect(() => {
    void fetchTabData(activeReport);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeReport, tabConfig]);

  const generatePDF = async () => {
    const fetchForPdf = async (tabId) => {
      const config = tabConfig[tabId];
      if (!config) return null;

      const { dataKey, fetch } = config;
      const existing = reportData[dataKey];
      if (existing !== null) return existing;

      try {
        const res = await fetch();
        const data = res?.data ?? null;
        setReportData((prev) => ({ ...prev, [dataKey]: data }));
        return data;
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(`[PDF] Failed to fetch ${tabId}:`, err);
        return null;
      }
    };

    // Fetch all datasets needed for a complete PDF
    const [financial, production, logistics, quality, diseases] = await Promise.all([
      fetchForPdf("financial"),
      fetchForPdf("production"),
      fetchForPdf("logistics"),
      fetchForPdf("quality"),
      fetchForPdf("diseases"),
    ]);

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 14;
    const footerHeight = 14;
    let y = 20;
    let pageNum = 1;

    const safeText = (value) => {
      if (value === null || value === undefined) return "N/A";
      return String(value);
    };

    const periodText = (() => {
      const p = financial?.period;
      if (p?.from && p?.to) return `${formatDate(p.from)} → ${formatDate(p.to)} (last ${p.days ?? days} days)`;
      return `Last ${days} days`;
    })();

    const drawHeader = () => {
      doc.setFillColor(22, 94, 82);
      doc.rect(0, 0, pageWidth, 32, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.setTextColor(255, 255, 255);
      doc.text("Owner Report", margin, 20);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(220, 240, 236);
      doc.text(`Period: ${periodText}`, margin, 27);

      doc.setTextColor(255, 255, 255);
      doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth - margin, 20, {
        align: "right",
      });

      y = 44;
    };

    const drawFooter = () => {
      const yFooter = pageHeight - footerHeight;
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.3);
      doc.line(margin, yFooter - 5, pageWidth - margin, yFooter - 5);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(120, 120, 120);
      doc.text("Confidential — Internal Use", margin, yFooter);
      doc.text(`Page ${pageNum}`, pageWidth - margin, yFooter, { align: "right" });
    };

    const ensureSpace = (needed = 16) => {
      if (y + needed > pageHeight - footerHeight - 6) {
        drawFooter();
        doc.addPage();
        pageNum += 1;
        drawHeader();
      }
    };

    const sectionTitle = (title) => {
      ensureSpace(18);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(22, 94, 82);
      doc.text(title, margin, y);
      y += 7;
      doc.setDrawColor(210, 210, 210);
      doc.setLineWidth(0.3);
      doc.line(margin, y, pageWidth - margin, y);
      y += 7;
    };

    const kvLine = (label, value) => {
      ensureSpace(8);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(40, 40, 40);
      doc.text(`${label}:`, margin, y);
      doc.setFont("helvetica", "bold");
      doc.text(safeText(value), margin + 58, y);
      y += 6;
    };

    const drawTable = ({ headers, rows, colWidths }) => {
      if (!Array.isArray(rows) || rows.length === 0) {
        kvLine("Status", "No data");
        return;
      }

      const startX = margin;
      const headerHeight = 8;

      const renderRow = (cells, rowIndex) => {
        const fontSize = 9;
        doc.setFontSize(fontSize);
        doc.setFont("helvetica", "normal");

        const splitCells = cells.map((cell, i) => {
          const maxWidth = Math.max(10, colWidths[i] - 2);
          return doc.splitTextToSize(safeText(cell), maxWidth);
        });

        const lineHeight = 4.5;
        const maxLines = Math.max(...splitCells.map((c) => c.length));
        const rowHeight = Math.max(7, maxLines * lineHeight + 2);

        ensureSpace(rowHeight + 2);

        if (rowIndex % 2 === 0) {
          doc.setFillColor(248, 250, 249);
          doc.rect(startX, y - 5.5, colWidths.reduce((a, b) => a + b, 0), rowHeight, "F");
        }

        let x = startX;
        splitCells.forEach((lines, i) => {
          doc.setTextColor(40, 40, 40);
          doc.text(lines, x + 1, y);
          x += colWidths[i];
        });

        y += rowHeight;
        doc.setDrawColor(235, 235, 235);
        doc.setLineWidth(0.2);
        doc.line(startX, y - 3, pageWidth - margin, y - 3);
      };

      // Header row
      ensureSpace(headerHeight + 4);
      doc.setFillColor(22, 94, 82);
      doc.rect(startX, y - 6, colWidths.reduce((a, b) => a + b, 0), headerHeight, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(255, 255, 255);

      let x = startX;
      headers.forEach((h, i) => {
        doc.text(safeText(h), x + 1, y - 1);
        x += colWidths[i];
      });
      y += headerHeight + 2;

      rows.forEach((cells, idx) => renderRow(cells, idx));
      y += 2;
    };

    drawHeader();

    // Executive Summary (from production summary for simple stats)
    sectionTitle("Production Overview");
    if (production?.summary) {
      kvLine("Leaf entries", formatNumber(production.summary.entries));
      kvLine("Net weight", formatKg(production.summary.netWeightKg));
      kvLine("Avg deduction", formatPct(production.summary.avgDeductionPct));
      kvLine("Avg rate/kg", `Rs. ${formatNumber(production.summary.avgRatePerKg)}`);
    } else {
      kvLine("Status", "No data");
    }

    // Leaf intake
    sectionTitle("Leaf Intake & Deductions");
    if (production?.summary) {
      kvLine("Entries", formatNumber(production.summary.entries));
      kvLine("Gross weight", formatKg(production.summary.grossWeightKg));
      kvLine("Deductions", formatKg(production.summary.deductionsKg));
      kvLine("Net weight", formatKg(production.summary.netWeightKg));
      kvLine("Gross amount", formatCurrency(production.summary.grossAmount));
      kvLine("Net amount", formatCurrency(production.summary.netAmount));
      kvLine("Avg deduction", formatPct(production.summary.avgDeductionPct));
      kvLine("Avg rate/kg", `Rs. ${formatNumber(production.summary.avgRatePerKg)}`);

      if (Array.isArray(production.byRoute) && production.byRoute.length > 0) {
        sectionTitle("Leaf Intake — By Route (Top)");
        drawTable({
          headers: ["Route", "Area", "Net kg", "Entries", "Net Amount"],
          colWidths: [60, 32, 22, 18, 40],
          rows: production.byRoute.slice(0, 12).map((r) => [
            `${safeText(r.routeNumber)} - ${safeText(r.routeName)}`,
            safeText(r.area),
            safeText(formatKg(r.netWeightKg)),
            safeText(formatNumber(r.entries)),
            safeText(formatCurrency(r.netAmount)),
          ]),
        });
      }
    } else {
      kvLine("Status", "No data");
    }

    // Logistics
    sectionTitle("Logistics & Supplier Insights");
    if (logistics) {
      kvLine("Distinct suppliers", formatNumber(logistics.summary?.distinctSuppliers));
      kvLine("Total net weight", formatKg(logistics.summary?.totalNetWeightKg));
      kvLine("Total entries", formatNumber(logistics.summary?.entries));

      sectionTitle("Top Suppliers");
      drawTable({
        headers: ["Supplier", "Route", "Net kg", "Entries", "Avg rate/kg"],
        colWidths: [62, 44, 20, 18, 26],
        rows: (logistics.topSuppliers || []).slice(0, 15).map((r) => [
          `${safeText(r.supplierCode)} — ${safeText(r.supplierName)}`,
          `${safeText(r.routeNumber)} - ${safeText(r.routeName)}`,
          safeText(formatKg(r.netWeightKg)),
          safeText(formatNumber(r.entries)),
          `Rs. ${safeText(formatNumber(r.avgRatePerKg))}`,
        ]),
      });
    } else {
      kvLine("Status", "No data");
    }

    // Quality
    sectionTitle("Quality Intelligence");
    if (quality?.summary) {
      kvLine("Assessments", formatNumber(quality.summary.totalAssessments));
      kvLine("Avg quality score", formatNumber(quality.summary.avgQualityScore));
      kvLine("Premium grades", formatNumber(quality.summary.premiumGrades));
      kvLine("Avg adjusted price/kg", `Rs. ${formatNumber(quality.summary.avgAdjustedPricePerKg)}`);

      if (Array.isArray(quality.gradeDistribution) && quality.gradeDistribution.length > 0) {
        sectionTitle("Grade Distribution");
        drawTable({
          headers: ["Grade", "Count"],
          colWidths: [80, 80],
          rows: quality.gradeDistribution.map((r) => [safeText(r.grade), safeText(formatNumber(r.count))]),
        });
      }

      if (Array.isArray(quality.byFlavor) && quality.byFlavor.length > 0) {
        sectionTitle("By Flavor (Top)");
        drawTable({
          headers: ["Flavor", "Assessments", "Avg score"],
          colWidths: [80, 40, 40],
          rows: quality.byFlavor.slice(0, 12).map((r) => [
            safeText(r.flavorLabel || r.flavor),
            safeText(formatNumber(r.assessments)),
            safeText(formatNumber(r.avgQualityScore)),
          ]),
        });
      }
    } else {
      kvLine("Status", "No data");
    }

    // Diseases
    sectionTitle("Disease Surveillance");
    if (diseases?.summary) {
      kvLine("Total scans", formatNumber(diseases.summary.totalScans));
      kvLine("Diseases found", formatNumber(diseases.summary.diseasesFound));
      kvLine("Healthy leaves", formatNumber(diseases.summary.healthyLeaves));
      kvLine("Avg confidence", formatNumber(diseases.summary.avgConfidence));
      kvLine("High severity", formatNumber(diseases.summary.highSeverity));

      if (Array.isArray(diseases.byDisease) && diseases.byDisease.length > 0) {
        sectionTitle("Top Diseases");
        drawTable({
          headers: ["Disease", "Cases", "Avg conf", "High sev"],
          colWidths: [78, 26, 26, 30],
          rows: diseases.byDisease.slice(0, 15).map((r) => [
            safeText(r.disease),
            safeText(formatNumber(r.cases)),
            safeText(formatNumber(r.avgConfidence)),
            safeText(formatNumber(r.highSeverity)),
          ]),
        });
      }
    } else {
      kvLine("Status", "No data");
    }

    drawFooter();
    doc.save("Owner_Reports.pdf");
  };

  const reportTypes = useMemo(
    () => [
      { id: "financial", label: "Financial Overview", icon: DollarSign },
      { id: "production", label: "Production & Quality", icon: Package },
      { id: "logistics", label: "Logistics & Inventory", icon: Truck },
      { id: "quality", label: "Quality Analysis", icon: Award },
      { id: "diseases", label: "Surveillance", icon: AlertTriangle },
    ],
    []
  );

  const periodLabel = useMemo(() => {
    const p = reportData.financial?.period;
    if (!p) return `Last ${days} days`;
    return `${formatDate(p.from)} → ${formatDate(p.to)}`;
  }, [reportData.financial, days]);

  const tabIntros = useMemo(
    () => ({
      financial: {
        title: "Financial Overview",
        description:
          "Estimated business performance for the period: Revenue (estimated by Net Weight * NSA), Supplier Payments, Fertilizer Costs, and Payroll Estimates.",
      },
      production: {
        title: "Production Performance",
        description:
          "Leaf intake volume and deduction metrics: Gross vs Net weights, deduction breakdown, and route-level intake performance.",
      },
      logistics: {
        title: "Logistics & Inventory",
        description:
          "Supplier contribution and route logistics: Distinct suppliers, total entries, top contributors, and fertilizer company status.",
      },
      quality: {
        title: "Quality Intelligence",
        description:
          "AI-based tea quality scores and grade distribution: Average scores, premium counts, and flavor-based performance.",
      },
      diseases: {
        title: "Disease Surveillance",
        description:
          "Tea leaf disease monitoring: Scan totals, detections, severity breakdown, and common disease types detected by AI.",
      },
    }),
    []
  );

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
            <h1 className="text-3xl font-bold" style={{ color: ACCENT_COLOR }}>
              Owner Reports
            </h1>
            <p className="text-gray-600 mt-1">{periodLabel}</p>
          </div>
          <div className="flex gap-2 print:hidden">
            <button
              onClick={() => void generatePDF()}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium"
              style={{ backgroundColor: ACCENT_COLOR }}
            >
              <Download size={18} />
              Download Report
            </button>
          </div>
        </div>
      </div>

      {/* Report Tabs */}
      <div className="bg-white rounded-lg shadow-md p-3 mb-6 print:hidden">
        <div className="flex gap-2 flex-wrap">
          {reportTypes.map((type) => {
            const Icon = type.icon;
            return (
              <button
                key={type.id}
                onClick={() => setActiveReport(type.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${activeReport === type.id ? "text-white" : "border"
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
      <div className="bg-white rounded-lg shadow-md p-6">
        {(() => {
          const activeKey = tabConfig[activeReport]?.dataKey;
          const activeData = activeKey ? reportData[activeKey] : null;
          const isLoading = tabLoading[activeReport] && activeData === null;
          const errorMsg = tabError[activeReport];

          if (isLoading) {
            return (
              <div className="text-center py-12">
                <p className="text-gray-600">Loading...</p>
              </div>
            );
          }

          if (errorMsg) {
            return (
              <div className="border rounded-lg p-6" style={{ borderColor: BORDER_COLOR }}>
                <div className="text-sm font-semibold" style={{ color: ACCENT_COLOR }}>
                  Couldn’t load this report
                </div>
                <div className="text-sm text-gray-600 mt-1">{errorMsg}</div>
                <button
                  className="mt-4 px-4 py-2 rounded-lg text-white font-medium"
                  style={{ backgroundColor: ACCENT_COLOR }}
                  onClick={() => void fetchTabData(activeReport, { force: true })}
                >
                  Retry
                </button>
              </div>
            );
          }

          return (
            <>
              {/* Financial Overview */}
              {activeReport === "financial" && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold" style={{ color: ACCENT_COLOR }}>
                    Financial Overview
                  </h2>

                  <TabIntroCard
                    title={tabIntros.financial.title}
                    description={tabIntros.financial.description}
                  />

                  {reportData.financial?.summary ? (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="border rounded-lg p-4 bg-emerald-50" style={{ borderColor: BORDER_COLOR }}>
                          <p className="text-sm text-gray-600 font-medium">Estimated Revenue</p>
                          <p className="text-2xl font-bold text-emerald-700">{formatCurrency(reportData.financial.summary.estimatedRevenue)}</p>
                          <p className="text-xs text-gray-500 mt-1">Net Weight × NSA</p>
                        </div>
                        <div className="border rounded-lg p-4 bg-red-50" style={{ borderColor: "#fee2e2" }}>
                          <p className="text-sm text-gray-600 font-medium">Supplier Payments</p>
                          <p className="text-2xl font-bold text-red-700">{formatCurrency(reportData.financial.summary.supplierPayments)}</p>
                          <p className="text-xs text-gray-500 mt-1">Paid & Approved</p>
                        </div>
                        <div className="border rounded-lg p-4" style={{ borderColor: BORDER_COLOR }}>
                          <p className="text-sm text-gray-600 font-medium">Fertilizer Costs</p>
                          <p className="text-2xl font-bold">{formatCurrency(reportData.financial.summary.fertilizerCosts)}</p>
                          <p className="text-xs text-gray-500 mt-1">Stock Purchases (IN)</p>
                        </div>
                        <div className="border rounded-lg p-4" style={{ borderColor: BORDER_COLOR }}>
                          <p className="text-sm text-gray-600 font-medium">Est. Net Profit</p>
                          <p className={`text-2xl font-bold ${reportData.financial.summary.netProfitEstimate >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                            {formatCurrency(reportData.financial.summary.netProfitEstimate)}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">After Payments & Costs</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="border rounded-lg p-6" style={{ borderColor: BORDER_COLOR }}>
                          <h3 className="text-lg font-bold mb-4" style={{ color: ACCENT_COLOR }}>Operating Metrics</h3>
                          <div className="space-y-4">
                            <div className="flex justify-between items-center pb-2 border-b">
                              <span className="text-gray-600">Total Net Weight Processed</span>
                              <span className="font-semibold">{formatKg(reportData.financial.breakdown?.totalNetWeight)}</span>
                            </div>
                            <div className="flex justify-between items-center pb-2 border-b">
                              <span className="text-gray-600">Net Sales Average (NSA)</span>
                              <span className="font-semibold">Rs. {formatNumber(reportData.financial.breakdown?.nsaApplied)}</span>
                            </div>
                            <div className="flex justify-between items-center pb-2 border-b">
                              <span className="text-gray-600">Supplier Deductions Collected</span>
                              <span className="font-semibold text-emerald-600">{formatCurrency(reportData.financial.breakdown?.supplierDeductionsCollected)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">Payroll Estimate (Monthly)</span>
                              <span className="font-semibold">{formatCurrency(reportData.financial.summary?.payrollEstimate)}</span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-gray-50 border rounded-lg p-6 flex flex-col justify-center items-center text-center" style={{ borderColor: BORDER_COLOR }}>
                          <TrendingUp size={48} className="text-emerald-600 mb-4" />
                          <h4 className="text-xl font-bold text-gray-800">Financial Health</h4>
                          <p className="text-gray-600 mt-2 max-w-xs">
                            Based on current production rates and market sales averages, the factory is operating at a 
                            <span className="font-bold text-emerald-700"> {Math.round((reportData.financial.summary.netProfitEstimate / reportData.financial.summary.estimatedRevenue) * 100) || 0}% </span>
                            estimated margin.
                          </p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-12 border rounded-lg" style={{ borderColor: BORDER_COLOR }}>
                      <DollarSign size={48} className="mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-600 font-medium">No financial data available for this period</p>
                    </div>
                  )}
                </div>
              )}

              {/* Production Performance */}
              {activeReport === "production" && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold" style={{ color: ACCENT_COLOR }}>
                    Production Performance
                  </h2>

                  <TabIntroCard
                    title={tabIntros.production.title}
                    description={tabIntros.production.description}
                  />

                  {reportData.production?.summary ? (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="border rounded-lg p-4" style={{ borderColor: BORDER_COLOR }}>
                          <p className="text-sm text-gray-600">Gross Intake</p>
                          <p className="text-2xl font-bold">{formatKg(reportData.production.summary.grossWeightKg)}</p>
                        </div>
                        <div className="border rounded-lg p-4" style={{ borderColor: BORDER_COLOR }}>
                          <p className="text-sm text-gray-600">Net Processed</p>
                          <p className="text-2xl font-bold text-emerald-600">{formatKg(reportData.production.summary.netWeightKg)}</p>
                        </div>
                        <div className="border rounded-lg p-4" style={{ borderColor: BORDER_COLOR }}>
                          <p className="text-sm text-gray-600">Total Deductions</p>
                          <p className="text-2xl font-bold text-red-600">{formatKg(reportData.production.summary.deductionsKg)}</p>
                        </div>
                        <div className="border rounded-lg p-4" style={{ borderColor: BORDER_COLOR }}>
                          <p className="text-sm text-gray-600">Avg. Rate / Kg</p>
                          <p className="text-2xl font-bold">Rs. {formatNumber(reportData.production.summary.avgRatePerKg)}</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-lg font-bold" style={{ color: ACCENT_COLOR }}>Intake by Route</h3>
                        {Array.isArray(reportData.production.byRoute) && reportData.production.byRoute.length > 0 ? (
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead>
                                <tr className="border-b-2" style={{ borderColor: ACCENT_COLOR }}>
                                  <th className="px-4 py-3 text-left">Route</th>
                                  <th className="px-4 py-3 text-left">Area</th>
                                  <th className="px-4 py-3 text-right">Net Weight</th>
                                  <th className="px-4 py-3 text-right">Entries</th>
                                  <th className="px-4 py-3 text-right">Yield Score</th>
                                </tr>
                              </thead>
                              <tbody>
                                {reportData.production.byRoute.map((row) => (
                                  <tr key={row.routeId} className="border-b hover:bg-gray-50">
                                    <td className="px-4 py-3 font-medium">{row.routeNumber} - {row.routeName}</td>
                                    <td className="px-4 py-3 text-gray-600">{row.area}</td>
                                    <td className="px-4 py-3 text-right font-bold">{formatKg(row.netWeightKg)}</td>
                                    <td className="px-4 py-3 text-right">{formatNumber(row.entries)}</td>
                                    <td className="px-4 py-3 text-right">
                                      <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-md text-xs font-bold">
                                        {Math.round((row.netWeightKg / reportData.production.summary.netWeightKg) * 100)}%
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <p className="text-gray-600">No route performance data.</p>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-12 border rounded-lg" style={{ borderColor: BORDER_COLOR }}>
                      <Package size={48} className="mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-600 font-medium">No production data available</p>
                    </div>
                  )}
                </div>
              )}

              {/* Logistics & Inventory */}
              {activeReport === "logistics" && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold" style={{ color: ACCENT_COLOR }}>
                    Logistics & Inventory
                  </h2>

                  <TabIntroCard
                    title={tabIntros.logistics.title}
                    description={tabIntros.logistics.description}
                  />

                  {reportData.logistics ? (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="border rounded-lg p-4" style={{ borderColor: BORDER_COLOR }}>
                          <p className="text-sm text-gray-600">Active Suppliers</p>
                          <p className="text-2xl font-bold">{formatNumber(reportData.logistics.summary?.distinctSuppliers)}</p>
                        </div>
                        <div className="border rounded-lg p-4" style={{ borderColor: BORDER_COLOR }}>
                          <p className="text-sm text-gray-600">Total Leaf Entries</p>
                          <p className="text-2xl font-bold">{formatNumber(reportData.logistics.summary?.entries)}</p>
                        </div>
                        <div className="border rounded-lg p-4" style={{ borderColor: BORDER_COLOR }}>
                          <p className="text-sm text-gray-600">Avg. Entry Weight</p>
                          <p className="text-2xl font-bold">
                            {reportData.logistics.summary?.entries > 0 
                              ? formatKg(reportData.logistics.summary.totalNetWeightKg / reportData.logistics.summary.entries)
                              : "0 kg"}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-lg font-bold" style={{ color: ACCENT_COLOR }}>Key Suppliers</h3>
                        {Array.isArray(reportData.logistics.topSuppliers) && reportData.logistics.topSuppliers.length > 0 ? (
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead>
                                <tr className="border-b-2" style={{ borderColor: ACCENT_COLOR }}>
                                  <th className="px-4 py-3 text-left">Supplier</th>
                                  <th className="px-4 py-3 text-left">Route</th>
                                  <th className="px-4 py-3 text-right">Supply (kg)</th>
                                  <th className="px-4 py-3 text-right">Avg Rate</th>
                                </tr>
                              </thead>
                              <tbody>
                                {reportData.logistics.topSuppliers.slice(0, 10).map((row) => (
                                  <tr key={row.supplierId} className="border-b hover:bg-gray-50">
                                    <td className="px-4 py-3">
                                      <div className="font-semibold">{row.supplierCode}</div>
                                      <div className="text-sm text-gray-500">{row.supplierName}</div>
                                    </td>
                                    <td className="px-4 py-3 text-gray-600">{row.routeNumber}</td>
                                    <td className="px-4 py-3 text-right font-bold">{formatNumber(row.netWeightKg)}</td>
                                    <td className="px-4 py-3 text-right">Rs. {formatNumber(row.avgRatePerKg)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <p className="text-gray-600">No supplier insights available.</p>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-12 border rounded-lg" style={{ borderColor: BORDER_COLOR }}>
                      <Truck size={48} className="mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-600 font-medium">No logistics data available</p>
                    </div>
                  )}
                </div>
              )}

              {/* Quality Analysis */}
              {activeReport === "quality" && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold" style={{ color: ACCENT_COLOR }}>
                    Quality Intelligence
                  </h2>

                  <TabIntroCard
                    title={tabIntros.quality.title}
                    description={tabIntros.quality.description}
                  />

                  {reportData.quality?.summary ? (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="border rounded-lg p-4" style={{ borderColor: BORDER_COLOR }}>
                          <p className="text-sm text-gray-600">Assessments</p>
                          <p className="text-2xl font-bold">{formatNumber(reportData.quality.summary.totalAssessments)}</p>
                        </div>
                        <div className="border rounded-lg p-4" style={{ borderColor: BORDER_COLOR }}>
                          <p className="text-sm text-gray-600">Avg Quality Score</p>
                          <p className="text-2xl font-bold text-emerald-600">{formatNumber(reportData.quality.summary.avgQualityScore)}</p>
                        </div>
                        <div className="border rounded-lg p-4" style={{ borderColor: BORDER_COLOR }}>
                          <p className="text-sm text-gray-600">Premium Grades</p>
                          <p className="text-2xl font-bold text-emerald-700">{formatNumber(reportData.quality.summary.premiumGrades)}</p>
                        </div>
                        <div className="border rounded-lg p-4" style={{ borderColor: BORDER_COLOR }}>
                          <p className="text-sm text-gray-600">Market Potential</p>
                          <p className="text-2xl font-bold">Rs. {formatNumber(reportData.quality.summary.avgAdjustedPricePerKg)}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="border rounded-lg p-6" style={{ borderColor: BORDER_COLOR }}>
                          <h3 className="text-lg font-bold mb-4" style={{ color: ACCENT_COLOR }}>Grade Distribution</h3>
                          <div className="space-y-4">
                            {reportData.quality.gradeDistribution?.map((row) => (
                              <div key={row.grade} className="flex items-center gap-4">
                                <div className="w-12 font-bold text-gray-700">{row.grade}</div>
                                <div className="flex-1 bg-gray-100 rounded-full h-4">
                                  <div 
                                    className="h-4 rounded-full bg-emerald-600" 
                                    style={{ width: `${(row.count / reportData.quality.summary.totalAssessments) * 100}%` }}
                                  ></div>
                                </div>
                                <div className="w-16 text-right text-sm text-gray-600">{formatNumber(row.count)}</div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="border rounded-lg p-6" style={{ borderColor: BORDER_COLOR }}>
                          <h3 className="text-lg font-bold mb-4" style={{ color: ACCENT_COLOR }}>Flavor Performance</h3>
                          <div className="space-y-4">
                            {reportData.quality.byFlavor?.slice(0, 5).map((row) => (
                              <div key={row.flavor} className="flex justify-between items-center pb-2 border-b">
                                <span className="text-gray-700">{row.flavorLabel}</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-emerald-700 font-bold">{row.avgQualityScore}</span>
                                  <span className="text-xs text-gray-400">({row.assessments} tests)</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-12 border rounded-lg" style={{ borderColor: BORDER_COLOR }}>
                      <Award size={48} className="mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-600 font-medium">No quality data available</p>
                    </div>
                  )}
                </div>
              )}

              {/* Surveillance */}
              {activeReport === "diseases" && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold" style={{ color: ACCENT_COLOR }}>
                    Disease Surveillance
                  </h2>

                  <TabIntroCard
                    title={tabIntros.diseases.title}
                    description={tabIntros.diseases.description}
                  />

                  {reportData.diseases?.summary ? (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="border rounded-lg p-4" style={{ borderColor: BORDER_COLOR }}>
                          <p className="text-sm text-gray-600">Total Scans</p>
                          <p className="text-2xl font-bold">{formatNumber(reportData.diseases.summary.totalScans)}</p>
                        </div>
                        <div className="border rounded-lg p-4 bg-red-50" style={{ borderColor: "#fee2e2" }}>
                          <p className="text-sm text-gray-600">Detections</p>
                          <p className="text-2xl font-bold text-red-700">{formatNumber(reportData.diseases.summary.diseasesFound)}</p>
                        </div>
                        <div className="border rounded-lg p-4 bg-emerald-50" style={{ borderColor: BORDER_COLOR }}>
                          <p className="text-sm text-gray-600">Healthy Leaves</p>
                          <p className="text-2xl font-bold text-emerald-700">{formatNumber(reportData.diseases.summary.healthyLeaves)}</p>
                        </div>
                      </div>

                      <div className="border rounded-lg p-6" style={{ borderColor: BORDER_COLOR }}>
                        <h3 className="text-lg font-bold mb-4" style={{ color: ACCENT_COLOR }}>Disease Breakdown</h3>
                        {Array.isArray(reportData.diseases.byDisease) && reportData.diseases.byDisease.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {reportData.diseases.byDisease.map((row) => (
                              <div key={row.disease} className="p-4 border rounded-lg bg-gray-50 flex justify-between items-center">
                                <div>
                                  <p className="font-bold text-gray-800">{row.disease}</p>
                                  <p className="text-xs text-gray-500">{row.cases} identified cases</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-bold text-red-600">{row.highSeverity} High Severity</p>
                                  <p className="text-xs text-gray-400">{row.avgConfidence}% Avg Confidence</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-600">No diseases detected in this period.</p>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-12 border rounded-lg" style={{ borderColor: BORDER_COLOR }}>
                      <AlertTriangle size={48} className="mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-600 font-medium">No surveillance data available</p>
                    </div>
                  )}
                </div>
              )}
            </>
          );
        })()}
      </div>
    </div>
  );
}
