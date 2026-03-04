import { Calendar, UserX } from "lucide-react";
import { useState, useEffect } from "react";

import { getSupplierDailySummary } from "../../../api/factoryManagerDashboard";

export default function SupplierDetailView({ supplier }) {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [dailyData, setDailyData] = useState([]);

  useEffect(() => {
    const fetchDailyData = async () => {
      if (!supplier?.id) return;

      try {
        const data = await getSupplierDailySummary(
          supplier.id,
          selectedMonth + 1,
          selectedYear
        );
        setDailyData(data);
      } catch (error) {
        console.error("Failed to fetch daily summary:", error);
        setDailyData([]);
      }
    };

    fetchDailyData();
  }, [supplier?.id, selectedMonth, selectedYear]);

  if (!supplier) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 flex flex-col items-center">
        <UserX className="w-12 h-12 text-gray-300 mb-2" />
        <p className="text-gray-500 text-lg">No supplier selected</p>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  const generateMonthlyData = () => {
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const monthlyData = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const deliveryEntry = dailyData.find((entry) => entry.day === day);

      if (deliveryEntry) {
        monthlyData.push({
          day,
          bagCount: deliveryEntry.bagCount || 0,
          totalWeight: deliveryEntry.grossWeight || 0,
          bagWeight: deliveryEntry.bagWeight || 0,
          waterContent: deliveryEntry.water || 0,
          coarseLeaf: deliveryEntry.coarseLeaf || 0,
          netWeight: deliveryEntry.netWeight || 0,
          hasDelivery: true,
        });
      } else {
        monthlyData.push({
          day,
          bagCount: 0,
          totalWeight: 0,
          bagWeight: 0,
          waterContent: 0,
          coarseLeaf: 0,
          netWeight: 0,
          hasDelivery: false,
        });
      }
    }

    return monthlyData;
  };

  const monthlyData = generateMonthlyData();

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <div className="bg-white rounded-lg shadow-md border border-emerald-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Basic Information -{" "}
          {new Date(selectedYear, selectedMonth).toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          })}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Supplier ID
            </label>
            <p className="mt-1 text-sm text-gray-900">{supplier.id}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Supplier Name
            </label>
            <p className="mt-1 text-sm text-gray-900">
              {supplier.supplierName}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Contact Number
            </label>
            <p className="mt-1 text-sm text-gray-900">
              {supplier.contactNumber}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Last Delivery
            </label>
            <p className="mt-1 text-sm text-gray-900">
              {formatDate(supplier.lastDelivery)}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Total Net Weight
            </label>
            <p className="mt-1 text-lg font-semibold text-emerald-600">
              {(supplier.totalNetWeight || 0).toFixed(1)} kg
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Total Bags
            </label>
            <p className="mt-1 text-lg font-semibold text-emerald-600">
              {supplier.totalBags}
            </p>
          </div>
        </div>
      </div>

      {/* Tea Leaf Entries */}
      <div className="bg-white rounded-lg shadow-md border border-emerald-200 overflow-hidden">
        <div className="p-4 bg-emerald-50 border-b border-emerald-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Monthly Tea Leaf Deliveries
            </h3>

            <div className="flex items-center gap-2">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="px-3 py-2 border border-emerald-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm bg-white text-gray-900 hover:border-emerald-400"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i} value={i} className="text-gray-900">
                    {new Date(2024, i, 1).toLocaleDateString("en-US", {
                      month: "long",
                    })}
                  </option>
                ))}
              </select>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="px-3 py-2 border border-emerald-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm bg-white text-gray-900 hover:border-emerald-400"
              >
                {Array.from({ length: 5 }, (_, i) => {
                  const year = new Date().getFullYear() - 2 + i;
                  return (
                    <option key={year} value={year} className="text-gray-900">
                      {year}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
        </div>

        {/* Monthly Summary Cards */}
        <div className="p-4 bg-gray-50 border-b border-emerald-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-3 rounded-lg border border-emerald-200">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Delivery Days
              </div>
              <div className="mt-1 text-lg font-semibold text-emerald-600">
                {monthlyData.filter((day) => day.hasDelivery).length}
              </div>
              <div className="text-xs text-gray-500">
                out of {new Date(selectedYear, selectedMonth + 1, 0).getDate()}{" "}
                days
              </div>
            </div>
            <div className="bg-white p-3 rounded-lg border border-emerald-200">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Total Bags
              </div>
              <div className="mt-1 text-lg font-semibold text-emerald-600">
                {monthlyData.reduce((sum, day) => sum + day.bagCount, 0)}
              </div>
              <div className="text-xs text-gray-500">bags collected</div>
            </div>
            <div className="bg-white p-3 rounded-lg border border-emerald-200">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Gross Weight
              </div>
              <div className="mt-1 text-lg font-semibold text-emerald-600">
                {monthlyData
                  .reduce((sum, day) => sum + day.totalWeight, 0)
                  .toFixed(1)}{" "}
                kg
              </div>
              <div className="text-xs text-gray-500">before deductions</div>
            </div>
            <div className="bg-white p-3 rounded-lg border border-emerald-200">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Net Weight
              </div>
              <div className="mt-1 text-lg font-semibold text-emerald-600">
                {monthlyData
                  .reduce((sum, day) => sum + day.netWeight, 0)
                  .toFixed(1)}{" "}
                kg
              </div>
              <div className="text-xs text-gray-500">after deductions</div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-emerald-200 bg-emerald-50">
                <th className="text-center py-3 px-2 font-medium text-gray-700">
                  Date
                </th>
                <th className="text-center py-3 px-2 font-medium text-gray-700">
                  Bag Count
                </th>
                <th className="text-right py-3 px-2 font-medium text-gray-700">
                  Gross Weight (kg)
                </th>
                <th className="text-right py-3 px-2 font-medium text-gray-700">
                  Bag Weight (kg)
                </th>
                <th className="text-right py-3 px-2 font-medium text-gray-700">
                  Water (kg)
                </th>
                <th className="text-right py-3 px-2 font-medium text-gray-700">
                  Coarse Leaf (kg)
                </th>
                <th className="text-right py-3 px-2 font-medium text-gray-700">
                  Net Weight (kg)
                </th>
              </tr>
            </thead>
            <tbody>
              {monthlyData.map((dayData) => (
                <tr
                  key={dayData.day}
                  className={`border-b border-emerald-100 ${
                    dayData.netWeight > 0 ? "bg-white" : "bg-gray-50"
                  }`}
                >
                  <td className="py-2 px-2 text-center font-mono text-gray-900">
                    {dayData.day}
                  </td>
                  <td className="py-2 px-2 text-center font-mono text-gray-900">
                    {dayData.bagCount > 0 ? dayData.bagCount : "-"}
                  </td>
                  <td className="py-2 px-2 text-right font-mono text-gray-900">
                    {dayData.totalWeight > 0
                      ? dayData.totalWeight.toFixed(1)
                      : "-"}
                  </td>
                  <td className="py-2 px-2 text-right font-mono text-gray-900">
                    {dayData.bagWeight > 0 ? dayData.bagWeight.toFixed(1) : "-"}
                  </td>
                  <td className="py-2 px-2 text-right font-mono text-gray-900">
                    {dayData.waterContent > 0
                      ? dayData.waterContent.toFixed(1)
                      : "-"}
                  </td>
                  <td className="py-2 px-2 text-right font-mono text-gray-900">
                    {dayData.coarseLeaf > 0
                      ? dayData.coarseLeaf.toFixed(1)
                      : "-"}
                  </td>
                  <td className="py-2 px-2 text-right font-mono font-bold text-gray-900">
                    {dayData.netWeight > 0 ? dayData.netWeight.toFixed(1) : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-emerald-200 bg-emerald-50 font-bold">
                <td className="py-3 px-2 text-center text-gray-900">Total</td>
                <td className="py-3 px-2 text-center font-mono text-gray-900">
                  {monthlyData.reduce((sum, day) => sum + day.bagCount, 0)}
                </td>
                <td className="py-3 px-2 text-right font-mono text-gray-900">
                  {monthlyData
                    .reduce((sum, day) => sum + day.totalWeight, 0)
                    .toFixed(1)}
                </td>
                <td className="py-3 px-2 text-right font-mono text-gray-900">
                  {monthlyData
                    .reduce((sum, day) => sum + day.bagWeight, 0)
                    .toFixed(1)}
                </td>
                <td className="py-3 px-2 text-right font-mono text-gray-900">
                  {monthlyData
                    .reduce((sum, day) => sum + day.waterContent, 0)
                    .toFixed(1)}
                </td>
                <td className="py-3 px-2 text-right font-mono text-gray-900">
                  {monthlyData
                    .reduce((sum, day) => sum + day.coarseLeaf, 0)
                    .toFixed(1)}
                </td>
                <td className="py-3 px-2 text-right font-mono font-bold text-emerald-600">
                  {monthlyData
                    .reduce((sum, day) => sum + day.netWeight, 0)
                    .toFixed(1)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Total Summary */}
        <div className="p-4 bg-emerald-50 border-t border-emerald-200">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-lg font-semibold text-gray-900">
                Total Net Weight:{" "}
                <span className="text-emerald-600">
                  {monthlyData
                    .reduce((sum, day) => sum + day.netWeight, 0)
                    .toFixed(1)}{" "}
                  kg
                </span>
              </div>
              <div className="flex gap-6 mt-2 text-sm text-gray-600">
                <div>
                  Total Bags:{" "}
                  <span className="font-medium text-emerald-600">
                    {monthlyData.reduce((sum, day) => sum + day.bagCount, 0)}
                  </span>
                </div>
                <div>
                  Gross Weight:{" "}
                  <span className="font-medium text-emerald-600">
                    {monthlyData
                      .reduce((sum, day) => sum + day.totalWeight, 0)
                      .toFixed(1)}{" "}
                    kg
                  </span>
                </div>
                <div>
                  Total Deductions:{" "}
                  <span className="font-medium text-red-600">
                    {(
                      monthlyData.reduce(
                        (sum, day) => sum + day.totalWeight,
                        0
                      ) -
                      monthlyData.reduce((sum, day) => sum + day.netWeight, 0)
                    ).toFixed(1)}{" "}
                    kg
                  </span>
                </div>
              </div>
              <div className="flex gap-6 mt-1 text-xs text-gray-500">
                <div>
                  Bag Weight:{" "}
                  <span className="font-medium text-red-500">
                    {monthlyData
                      .reduce((sum, day) => sum + day.bagWeight, 0)
                      .toFixed(1)}{" "}
                    kg
                  </span>
                </div>
                <div>
                  Water Content:{" "}
                  <span className="font-medium text-red-500">
                    {monthlyData
                      .reduce((sum, day) => sum + day.waterContent, 0)
                      .toFixed(1)}{" "}
                    kg
                  </span>
                </div>
                <div>
                  Coarse Leaf:{" "}
                  <span className="font-medium text-red-500">
                    {monthlyData
                      .reduce((sum, day) => sum + day.coarseLeaf, 0)
                      .toFixed(1)}{" "}
                    kg
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
