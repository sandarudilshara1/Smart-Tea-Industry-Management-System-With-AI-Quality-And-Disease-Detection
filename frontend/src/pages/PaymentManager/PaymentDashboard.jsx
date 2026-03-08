import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
    DollarSign,
    Users,
    Clock,
    CheckCircle,
    AlertTriangle,
    TrendingUp,
    TrendingDown,
    CreditCard,
    Banknote,
    FileText,
    ArrowRight,
    Calendar,
    BarChart2,
    Loader2,
    RefreshCw,
    List,
} from "lucide-react";

const ACCENT = "#165E52";
const DARK = "#01251F";
const LIGHT_BG = "#e1f4ef";
const BORDER = "#cfece6";
const CARD_SHADOW = "0 2px 12px 0 rgba(22,94,82,0.08)";

// Format currency
const fmt = (n) =>
    Number(n || 0).toLocaleString("en-LK", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    });

// Stat Card
function StatCard({ label, value, sub, icon: Icon, color, onClick, active }) {
    return (
        <div
            onClick={onClick}
            className={`bg-white rounded-xl p-5 border transition-all duration-200 ${onClick ? "cursor-pointer hover:shadow-lg" : ""
                } ${active ? "ring-2" : ""}`}
            style={{
                borderColor: active ? ACCENT : BORDER,
                boxShadow: CARD_SHADOW,
                ringColor: ACCENT,
            }}
        >
            <div className="flex items-center justify-between mb-3">
                <div
                    className="w-11 h-11 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: LIGHT_BG }}
                >
                    <Icon size={22} color={ACCENT} />
                </div>
                {sub !== undefined && (
                    <span
                        className="text-xs font-semibold px-2 py-1 rounded-full"
                        style={{ backgroundColor: LIGHT_BG, color: ACCENT }}
                    >
                        {sub}
                    </span>
                )}
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500 mt-1">{label}</p>
        </div>
    );
}

// Quick Action Card
function ActionCard({ title, desc, icon: Icon, path, color }) {
    const navigate = useNavigate();
    return (
        <div
            onClick={() => navigate(path)}
            className="bg-white rounded-xl p-5 border cursor-pointer hover:shadow-lg transition-all duration-200 group"
            style={{ borderColor: BORDER, boxShadow: CARD_SHADOW }}
        >
            <div className="flex items-start justify-between">
                <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
                    style={{ backgroundColor: LIGHT_BG }}
                >
                    <Icon size={20} color={ACCENT} />
                </div>
                <ArrowRight
                    size={16}
                    color={ACCENT}
                    className="opacity-0 group-hover:opacity-100 transition-opacity mt-1"
                />
            </div>
            <h3 className="font-semibold text-gray-900 text-sm">{title}</h3>
            <p className="text-xs text-gray-500 mt-1">{desc}</p>
        </div>
    );
}

// Badge
function Badge({ status }) {
    const map = {
        Paid: { bg: "#d1fae5", color: "#065f46", label: "Paid" },
        Approved: { bg: "#dbeafe", color: "#1e40af", label: "Approved" },
        Calculated: { bg: "#fef9c3", color: "#854d0e", label: "Pending" },
        Queued: { bg: "#e0f2fe", color: "#0369a1", label: "Queued" },
        Cancelled: { bg: "#fee2e2", color: "#991b1b", label: "Cancelled" },
    };
    const s = map[status] || { bg: "#f3f4f6", color: "#374151", label: status };
    return (
        <span
            className="px-2 py-0.5 rounded-full text-xs font-semibold"
            style={{ backgroundColor: s.bg, color: s.color }}
        >
            {s.label}
        </span>
    );
}

export default function PaymentDashboard() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState(null);
    const [recentPayments, setRecentPayments] = useState([]);
    const [refreshKey, setRefreshKey] = useState(0);

    const now = new Date();
    const monthName = now.toLocaleString("default", { month: "long" });
    const year = now.getFullYear();

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setError(null);
            try {
                // Import paymentManager API
                const { getDashboardStatistics, getCashPaymentsQueue } = await import(
                    "../../api/paymentManager"
                );

                const month = now.getMonth() + 1;
                const [dashData, cashData] = await Promise.allSettled([
                    getDashboardStatistics({ month, year, factoryId: "1" }),
                    getCashPaymentsQueue({ factoryId: "1" }),
                ]);

                if (dashData.status === "fulfilled") {
                    setStats(dashData.value);
                } else {
                    // Use mock stats when backend not available
                    setStats({
                        monthlyPendingCount: 0,
                        monthlyPendingSum: 0,
                        adhocPendingCount: 0,
                        adhocPendingSum: 0,
                        cashReadySum: 0,
                        bankQueueSum: 0,
                        totalRoutes: 3,
                        totalSuppliers: 5,
                        adhocBankCount: 0,
                        adhocBankSum: 0,
                        adhocCashCount: 0,
                        adhocCashSum: 0,
                        adhocApprovedSum: 0,
                    });
                }
            } catch (err) {
                console.error("Dashboard load error:", err);
                setStats({
                    monthlyPendingCount: 0,
                    monthlyPendingSum: 0,
                    adhocPendingCount: 0,
                    adhocPendingSum: 0,
                    cashReadySum: 0,
                    bankQueueSum: 0,
                    totalRoutes: 3,
                    totalSuppliers: 5,
                });
            } finally {
                setLoading(false);
            }
        };
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refreshKey]);

    const kpiCards = useMemo(
        () => [
            {
                label: "Monthly Pending",
                value: stats?.monthlyPendingCount ?? "—",
                sub: `Rs. ${fmt(stats?.monthlyPendingSum)}`,
                icon: Calendar,
            },
            {
                label: "Ad-hoc Pending",
                value: stats?.adhocPendingCount ?? "—",
                sub: `Rs. ${fmt(stats?.adhocPendingSum)}`,
                icon: Clock,
            },
            {
                label: "Ready for Cash",
                value: `Rs. ${fmt(stats?.cashReadySum)}`,
                icon: Banknote,
            },
            {
                label: "Bank Queue",
                value: `Rs. ${fmt(stats?.bankQueueSum)}`,
                icon: CreditCard,
            },
        ],
        [stats]
    );

    const quickActions = [
        {
            title: "Payments Overview",
            desc: "View all supplier payment bills by route",
            icon: DollarSign,
            path: "/payment-manager/payments",
        },
        {
            title: "Monthly Approval",
            desc: "Review & approve pending monthly payments",
            icon: CheckCircle,
            path: "/payment-manager/proceed/monthly",
        },
        {
            title: "Ad-hoc Payments",
            desc: "Process urgent or one-off payments",
            icon: AlertTriangle,
            path: "/payment-manager/proceed/adhoc",
        },
        {
            title: "Disbursement",
            desc: "Disburse ready-to-pay bank & cash orders",
            icon: Banknote,
            path: "/payment-manager/proceed/disbursement",
        },
        {
            title: "Advance Management",
            desc: "Review advance requests from suppliers",
            icon: TrendingUp,
            path: "/payment-manager/advances",
        },
        {
            title: "Loan Management",
            desc: "Track active loans and repayment plans",
            icon: FileText,
            path: "/payment-manager/loans",
        },
        {
            title: "Tea Rates",
            desc: "Submit and review monthly tea leaf rates",
            icon: BarChart2,
            path: "/payment-manager/tea-rates",
        },
        {
            title: "Processing Center",
            desc: "Full payment processing workflow",
            icon: List,
            path: "/payment-manager/proceed",
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b shadow-sm" style={{ borderColor: BORDER }}>
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                            <h1 className="text-2xl font-bold" style={{ color: DARK }}>
                                Payment Manager Dashboard
                            </h1>
                            <p className="text-sm text-gray-500 mt-1">
                                {monthName} {year} · Tea Factory Payment System
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setRefreshKey((k) => k + 1)}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors"
                                style={{
                                    borderColor: BORDER,
                                    color: ACCENT,
                                    backgroundColor: LIGHT_BG,
                                }}
                            >
                                <RefreshCw size={15} />
                                Refresh
                            </button>
                            <button
                                onClick={() => navigate("/payment-manager/proceed")}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors hover:opacity-90"
                                style={{ backgroundColor: DARK }}
                            >
                                <DollarSign size={15} />
                                Processing Center
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
                {/* Loading */}
                {loading && (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 size={32} className="animate-spin" style={{ color: ACCENT }} />
                        <span className="ml-3 text-gray-500 text-sm">Loading dashboard...</span>
                    </div>
                )}

                {!loading && (
                    <>
                        {/* KPI Cards */}
                        <section>
                            <h2
                                className="text-base font-semibold mb-4"
                                style={{ color: ACCENT }}
                            >
                                {monthName} {year} — Overview
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {kpiCards.map((card, i) => (
                                    <StatCard key={i} {...card} />
                                ))}
                            </div>
                        </section>

                        {/* Summary Row */}
                        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Monthly Payments */}
                            <div
                                className="bg-white rounded-xl p-6 border"
                                style={{ borderColor: BORDER, boxShadow: CARD_SHADOW }}
                            >
                                <div className="flex items-center justify-between mb-5">
                                    <h3 className="font-semibold text-gray-900">Monthly Payments</h3>
                                    <span
                                        className="text-xs font-semibold px-2 py-1 rounded-full"
                                        style={{ backgroundColor: LIGHT_BG, color: ACCENT }}
                                    >
                                        {stats?.monthlyPendingCount ?? 0} pending
                                    </span>
                                </div>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between py-2 border-b" style={{ borderColor: BORDER }}>
                                        <span className="text-gray-500">Total Routes</span>
                                        <span className="font-medium">{stats?.totalRoutes ?? "—"}</span>
                                    </div>
                                    <div className="flex justify-between py-2 border-b" style={{ borderColor: BORDER }}>
                                        <span className="text-gray-500">Total Suppliers</span>
                                        <span className="font-medium">{stats?.totalSuppliers ?? "—"}</span>
                                    </div>
                                    <div className="flex justify-between py-2 items-center">
                                        <span className="text-gray-500">Pending Amount</span>
                                        <span className="text-lg font-bold" style={{ color: DARK }}>
                                            Rs. {fmt(stats?.monthlyPendingSum)}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => navigate("/payment-manager/proceed/monthly")}
                                    className="mt-5 w-full py-2.5 rounded-lg text-sm font-medium text-white transition-colors hover:opacity-90"
                                    style={{ backgroundColor: DARK }}
                                >
                                    Review &amp; Approve Monthly Payments →
                                </button>
                            </div>

                            {/* Ad-hoc Payments */}
                            <div
                                className="bg-white rounded-xl p-6 border"
                                style={{ borderColor: BORDER, boxShadow: CARD_SHADOW }}
                            >
                                <div className="flex items-center justify-between mb-5">
                                    <h3 className="font-semibold text-gray-900">Ad-hoc Payments</h3>
                                    <span
                                        className="text-xs font-semibold px-2 py-1 rounded-full"
                                        style={{ backgroundColor: "#fef9c3", color: "#854d0e" }}
                                    >
                                        {stats?.adhocPendingCount ?? 0} pending
                                    </span>
                                </div>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between py-2 border-b" style={{ borderColor: BORDER }}>
                                        <span className="text-gray-500">Bank Payments</span>
                                        <span className="font-medium">
                                            {stats?.adhocBankCount ?? 0} &nbsp;·&nbsp; Rs. {fmt(stats?.adhocBankSum)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between py-2 border-b" style={{ borderColor: BORDER }}>
                                        <span className="text-gray-500">Cash Payments</span>
                                        <span className="font-medium">
                                            {stats?.adhocCashCount ?? 0} &nbsp;·&nbsp; Rs. {fmt(stats?.adhocCashSum)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between py-2 items-center">
                                        <span className="text-gray-500">Total Pending</span>
                                        <span className="text-lg font-bold" style={{ color: DARK }}>
                                            Rs. {fmt(stats?.adhocPendingSum)}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => navigate("/payment-manager/proceed/adhoc")}
                                    className="mt-5 w-full py-2.5 rounded-lg text-sm font-medium text-white transition-colors hover:opacity-90"
                                    style={{ backgroundColor: DARK }}
                                >
                                    Process Ad-hoc Payments →
                                </button>
                            </div>
                        </section>

                        {/* Quick Actions */}
                        <section>
                            <h2
                                className="text-base font-semibold mb-4"
                                style={{ color: ACCENT }}
                            >
                                Quick Navigation
                            </h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                {quickActions.map((action, i) => (
                                    <ActionCard key={i} {...action} />
                                ))}
                            </div>
                        </section>

                        {/* Payments Summary Table */}
                        <section>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-base font-semibold" style={{ color: ACCENT }}>
                                    Payment Module Summary
                                </h2>
                                <button
                                    onClick={() => navigate("/payment-manager/payments")}
                                    className="flex items-center gap-1 text-sm font-medium transition-colors"
                                    style={{ color: ACCENT }}
                                >
                                    View all payments <ArrowRight size={14} />
                                </button>
                            </div>
                            <div
                                className="bg-white rounded-xl border overflow-hidden"
                                style={{ borderColor: BORDER, boxShadow: CARD_SHADOW }}
                            >
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr style={{ backgroundColor: DARK, color: "white" }}>
                                            {["Module", "Description", "Action"].map((h) => (
                                                <th
                                                    key={h}
                                                    className="px-5 py-3 text-left font-medium text-xs uppercase tracking-wide"
                                                >
                                                    {h}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y" style={{ borderColor: BORDER }}>
                                        {[
                                            {
                                                module: "Payments",
                                                desc: "View route-wise & supplier-wise payment bills",
                                                path: "/payment-manager/payments",
                                                badge: "Supplier Bills",
                                            },
                                            {
                                                module: "Advances",
                                                desc: "Approve or reject supplier advance requests",
                                                path: "/payment-manager/advances",
                                                badge: "Advance Mgmt",
                                            },
                                            {
                                                module: "Loans",
                                                desc: "Manage active loans and repayment tracking",
                                                path: "/payment-manager/loans",
                                                badge: "Loan Mgmt",
                                            },
                                            {
                                                module: "Tea Rates",
                                                desc: "Submit monthly NSA/GSA tea leaf rates",
                                                path: "/payment-manager/tea-rates",
                                                badge: "Rate Config",
                                            },
                                            {
                                                module: "Monthly Processing",
                                                desc: "Review and approve calculated monthly payments",
                                                path: "/payment-manager/proceed/monthly",
                                                badge: "Approval",
                                            },
                                            {
                                                module: "Disbursement",
                                                desc: "Disburse bank and cash approved payments",
                                                path: "/payment-manager/proceed/disbursement",
                                                badge: "Disbursement",
                                            },
                                        ].map((row) => (
                                            <tr
                                                key={row.module}
                                                className="hover:bg-gray-50 transition-colors"
                                            >
                                                <td className="px-5 py-3 font-semibold" style={{ color: ACCENT }}>
                                                    {row.module}
                                                </td>
                                                <td className="px-5 py-3 text-gray-600">{row.desc}</td>
                                                <td className="px-5 py-3">
                                                    <button
                                                        onClick={() => navigate(row.path)}
                                                        className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors hover:opacity-90"
                                                        style={{
                                                            backgroundColor: LIGHT_BG,
                                                            color: ACCENT,
                                                            border: `1px solid ${BORDER}`,
                                                        }}
                                                    >
                                                        Open <ArrowRight size={12} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    </>
                )}
            </div>
        </div>
    );
}
