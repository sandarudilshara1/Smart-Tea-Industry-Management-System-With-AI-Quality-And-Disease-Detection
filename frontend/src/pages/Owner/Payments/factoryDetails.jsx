import { useState } from 'react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
    PieChart,
    Pie,
    Cell
} from 'recharts';

const factoryData = [
    { factory: 'Factory A', teaPayment: 500000, loan: 120000, advance: 70000 },
    { factory: 'Factory B', teaPayment: 350000, loan: 90000, advance: 50000 },
    { factory: 'Factory C', teaPayment: 250000, loan: 80000, advance: 40000 },
    { factory: 'Factory D', teaPayment: 150000, loan: 60000, advance: 20000 },
];

const COLORS = ['#22c55e', '#2563eb', '#eab308'];

export default function FactoryDetails({ onClose }) {
    const [search, setSearch] = useState('');

    const filtered = search
        ? factoryData.filter(f =>
            f.factory.toLowerCase().includes(search.toLowerCase())
        )
        : factoryData;

    const totalTea = filtered.reduce((sum, f) => sum + f.teaPayment, 0);
    const totalLoan = filtered.reduce((sum, f) => sum + f.loan, 0);
    const totalAdvance = filtered.reduce((sum, f) => sum + f.advance, 0);

    const summaryData = [
        { name: 'Tea Payment', value: totalTea },
        { name: 'Loan', value: totalLoan },
        { name: 'Advance', value: totalAdvance },
    ];

    return (
        <div className="fixed inset-0 backdrop-blur-[2px] bg-black/30 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative p-6">
                {/* Close Button */}
                <button
                    onClick={onClose ? onClose : () => window.history.back()}
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl font-bold z-10"
                    aria-label="Close"
                >
                    &times;
                </button>

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 border-b pb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-blue-700">
                            Factory Payment Details
                        </h2>
                        <p className="text-gray-500 mt-1 text-sm">
                            Visual breakdown of tea payment, loan, and advance by factory.
                        </p>
                    </div>
                    <input
                        type="text"
                        placeholder="Search factory..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="border rounded px-3 py-2 mt-4 md:mt-0 w-full md:w-1/3"
                    />
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-green-100 p-4 rounded-lg shadow">
                        <p className="text-green-800 font-semibold">Total Tea Payment</p>
                        <p className="text-2xl font-bold text-green-700">LKR {totalTea.toLocaleString()}</p>
                    </div>
                    <div className="bg-blue-100 p-4 rounded-lg shadow">
                        <p className="text-blue-800 font-semibold">Total Loans</p>
                        <p className="text-2xl font-bold text-blue-700">LKR {totalLoan.toLocaleString()}</p>
                    </div>
                    <div className="bg-yellow-100 p-4 rounded-lg shadow">
                        <p className="text-yellow-800 font-semibold">Total Advances</p>
                        <p className="text-2xl font-bold text-yellow-700">LKR {totalAdvance.toLocaleString()}</p>
                    </div>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* Bar Chart */}
                    <div className="bg-white rounded-lg shadow p-4">
                        <h3 className="text-lg font-semibold text-blue-700 mb-2">Factory Comparison</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={filtered}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="factory" />
                                <YAxis />
                                <Tooltip formatter={v => `LKR ${v.toLocaleString()}`} />
                                <Legend />
                                <Bar dataKey="teaPayment" fill="#22c55e" name="Tea Payment" />
                                <Bar dataKey="loan" fill="#2563eb" name="Loan" />
                                <Bar dataKey="advance" fill="#eab308" name="Advance" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Pie Chart */}
                    <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center justify-center">
                        <h3 className="text-lg font-semibold text-blue-700 mb-2">Summary Distribution</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={summaryData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    label={({ name, percent }) =>
                                        `${name} (${(percent * 100).toFixed(0)}%)`
                                    }
                                >
                                    {summaryData.map((entry, index) => (
                                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={v => `LKR ${v.toLocaleString()}`} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-6 py-3 text-left font-medium text-gray-600">Factory</th>
                                <th className="px-6 py-3 text-left font-medium text-gray-600">Tea Payment</th>
                                <th className="px-6 py-3 text-left font-medium text-gray-600">Loan</th>
                                <th className="px-6 py-3 text-left font-medium text-gray-600">Advance</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filtered.map(fp => (
                                <tr key={fp.factory}>
                                    <td className="px-6 py-4 text-gray-700">{fp.factory}</td>
                                    <td className="px-6 py-4 text-green-700 font-semibold">LKR {fp.teaPayment.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-blue-700 font-semibold">LKR {fp.loan.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-yellow-700 font-semibold">LKR {fp.advance.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
