import { useLocation, useNavigate } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const factoryLoans = [
  { factory: "Factory A", amount: 120000 },
  { factory: "Factory B", amount: 90000 },
  { factory: "Factory C", amount: 80000 },
  { factory: "Factory D", amount: 60000 },
];

export default function ViewLoanFactoryWise() {
  const location = useLocation();
  const navigate = useNavigate();
  // const title = location.state?.title || "Factory-wise Loan Amount";
  const label = location.state?.label || "Loan Amount (LKR)";
  const data = location.state?.data || factoryLoans;

  // Calculate total for summary
  const total = data.reduce((sum, f) => sum + f.amount, 0);

  return (
    <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-auto p-8">
      <div className="flex items-center justify-between mb-6 border-b pb-4">
        <div>
          <h2 className="text-2xl font-bold text-[#165E52] flex items-center gap-2">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border-2 border-[#165E52] bg-blue-50 text-[#165E52] font-semibold text-base shadow-sm">
              Loan Amount Given
            </span>
          </h2>
          <p className="text-gray-500 mt-1 text-base">
            Visual breakdown of total loan amount given to suppliers, by
            factory.
          </p>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-700 font-medium"
        >
          Back
        </button>
      </div>
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <span className="text-lg font-semibold text-gray-700">
            Total Loans:
          </span>
          <span className="text-2xl font-bold text-[#165E52]">
            LKR {total.toLocaleString()}
          </span>
        </div>
      </div>
      <div className="mb-8">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="factory" tick={{ fontSize: 14, fill: "#4C8D7E" }} />
            <YAxis tick={{ fontSize: 14 }} />
            <Tooltip formatter={(v) => `LKR ${v.toLocaleString()}`} />
            <Legend />
            <Bar
              dataKey="amount"
              fill="#4C8D7E"
              name="Loan Amount (LKR)"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Factory
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {label}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((fp) => (
              <tr key={fp.factory}>
                <td className="px-6 py-4 whitespace-nowrap text-gray-700 font-medium">
                  {fp.factory}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-[#4C8D7E] font-bold">
                  LKR {fp.amount.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
