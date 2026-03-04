import { Calendar, DollarSign, CreditCard, Banknote } from "lucide-react";

export default function SupplierBillView({
  selectedSupplier,
  selectedRoute,
  selectedMonth,
  selectedYear,
  monthNames,
}) {
  if (!selectedSupplier) return null;

  // Generate all days (1-31) for the selected month
  const generateMonthlyData = () => {
    const daysInMonth = 31; // Showing 31 days for consistency
    const monthlyData = [];
    const totalActualWeight = selectedSupplier.totalWeight;
    const bagWeightRatio = selectedSupplier.bagWeight / totalActualWeight;
    const waterWeightRatio = selectedSupplier.waterWeight / totalActualWeight;
    const coarseLeafRatio =
      selectedSupplier.coarseLeafWeight / totalActualWeight;

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${selectedYear}-${(selectedMonth + 1)
        .toString()
        .padStart(2, "0")}-${day.toString().padStart(2, "0")}`;

      const existingEntry = selectedSupplier.teaLeafEntries.find(
        (entry) => entry.date === dateStr
      );

      if (existingEntry) {
        const dayBagWeight = existingEntry.weight * bagWeightRatio;
        const dayWaterWeight = existingEntry.weight * waterWeightRatio;
        const dayCoarseLeaf = existingEntry.weight * coarseLeafRatio;
        const dayNetWeight =
          existingEntry.weight - dayBagWeight - dayWaterWeight - dayCoarseLeaf;

        monthlyData.push({
          day,
          date: dateStr,
          bagCount:
            Math.floor(existingEntry.weight / 20) +
            Math.floor(Math.random() * 3), // Simulate bag count
          totalWeight: existingEntry.weight,
          bagWeight: dayBagWeight,
          waterContent: dayWaterWeight,
          coarseLeaf: dayCoarseLeaf,
          netWeight: dayNetWeight,
          amount: dayNetWeight * selectedSupplier.ratePerKg,
        });
      } else {
        monthlyData.push({
          day,
          date: dateStr,
          bagCount: 0,
          totalWeight: 0,
          bagWeight: 0,
          waterContent: 0,
          coarseLeaf: 0,
          netWeight: 0,
          amount: 0,
        });
      }
    }

    return monthlyData;
  };

  const monthlyData = generateMonthlyData();
  const totalNetWeight = monthlyData.reduce(
    (sum, day) => sum + day.netWeight,
    0
  );
  const totalAmount = totalNetWeight * selectedSupplier.ratePerKg;

  // Updated summary cards UI (black border, Lucide icon, modern layout)
  const summaryCards = [
    {
      label: "Total Weight",
      value: `${totalNetWeight.toFixed(1)} kg`,
      icon: <DollarSign size={28} color="black" />,
    },
    {
      label: "Total Amount",
      value: `Rs. ${totalAmount.toLocaleString()}`,
      icon: <DollarSign size={28} color="black" />,
    },
    {
      label: "Paid",
      value:
        selectedSupplier.status === "Paid"
          ? `Rs. ${selectedSupplier.finalAmount.toLocaleString()}`
          : "-",
      icon: <CreditCard size={28} color="black" />,
    },
    {
      label: "Pending",
      value:
        selectedSupplier.status !== "Paid"
          ? `Rs. ${selectedSupplier.finalAmount.toLocaleString()}`
          : "-",
      icon: <Banknote size={28} color="black" />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Bill Header */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-1">
              {selectedSupplier.supplierName}
            </h2>
            <div className="flex items-center space-x-4 mb-4">
              <span className="text-sm text-gray-500">
                ID: {selectedSupplier.id}
              </span>
              <span className="text-sm text-gray-500">•</span>
              <span className="text-sm text-gray-500">
                Period: {monthNames[selectedMonth]} {selectedYear}
              </span>
              <span className="text-sm text-gray-500">•</span>
              <div
                className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                  selectedSupplier.status === "Paid"
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {selectedSupplier.status}
              </div>
            </div>
            <div className="space-y-1 text-sm text-gray-600">
              <p>
                <span className="font-medium">Route:</span>{" "}
                {selectedRoute?.routeName}
              </p>
              <p>
                <span className="font-medium">Rate:</span> Rs.{" "}
                {selectedSupplier.ratePerKg.toFixed(2)}/kg
              </p>
              <p>
                <span className="font-medium">Payment Method: </span>
                {selectedSupplier.paymentMethod}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-[#4CAF50]">
              Rs. {selectedSupplier.finalAmount.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Final Amount</div>

            {/* Upcoming Payments Info */}
            <div className="mt-4 space-y-1">
              <div className="text-sm font-medium text-gray-600 border-b border-gray-200 pb-1 mb-2">
                Next Month Due:
              </div>
              {selectedSupplier.upcomingPayments?.loanInstallment && (
                <div className="flex justify-between items-center text-sm text-gray-600">
                  <span>Loan Installment:</span>
                  <span className="font-mono">
                    Rs.{" "}
                    {selectedSupplier.upcomingPayments.loanInstallment.toLocaleString()}
                  </span>
                </div>
              )}
              {selectedSupplier.upcomingPayments?.fertilizerDue && (
                <div className="flex justify-between items-center text-sm text-gray-600">
                  <span>Fertilizer Due:</span>
                  <span className="font-mono">
                    Rs.{" "}
                    {selectedSupplier.upcomingPayments.fertilizerDue.toLocaleString()}
                  </span>
                </div>
              )}
              {selectedSupplier.upcomingPayments &&
                (selectedSupplier.upcomingPayments.loanInstallment ||
                  selectedSupplier.upcomingPayments.fertilizerDue) && (
                  <div className="flex justify-between items-center text-sm font-medium text-gray-600 border-t border-gray-200 pt-1 mt-2">
                    <span>Total Due:</span>
                    <span className="font-mono">
                      Rs.{" "}
                      {(
                        (selectedSupplier.upcomingPayments.loanInstallment ||
                          0) +
                        (selectedSupplier.upcomingPayments.fertilizerDue || 0)
                      ).toLocaleString()}
                    </span>
                  </div>
                )}
              {(!selectedSupplier.upcomingPayments ||
                (!selectedSupplier.upcomingPayments.loanInstallment &&
                  !selectedSupplier.upcomingPayments.fertilizerDue)) && (
                <div className="text-sm text-gray-600 italic">
                  No payments due next month
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Modern Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
          {summaryCards.map((card, idx) => (
            <div
              key={idx}
              className="bg-white p-5 rounded-lg shadow-md flex flex-col justify-between border transition-transform"
              style={{ border: "1.5px solid black" }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-black pb-1">{card.label}</p>
                  <p className="text-xl font-bold text-black">{card.value}</p>
                </div>
                <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                  {card.icon}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tea Leaf Entries Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-4 bg-[#f8f9fa] border-b border-[#e0e0e0]">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Tea Leaf Deliveries
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#e0e0e0] bg-[#f8f9fa]">
                <th className="text-center py-3 px-2 font-medium text-gray-700">Date</th>
                <th className="text-center py-3 px-2 font-medium text-gray-700">Bag Count</th>
                <th className="text-right py-3 px-2 font-medium text-gray-700">Total Weight (kg)</th>
                <th className="text-right py-3 px-2 font-medium text-gray-700">Bag Weight (kg)</th>
                <th className="text-right py-3 px-2 font-medium text-gray-700">Water (kg)</th>
                <th className="text-right py-3 px-2 font-medium text-gray-700">Coarse Leaf (kg)</th>
                <th className="text-right py-3 px-2 font-medium text-gray-700">Net Weight (kg)</th>
              </tr>
            </thead>
            <tbody>
              {monthlyData.map((dayData) => (
                <tr
                  key={dayData.day}
                  className={`border-b border-[#f0f0f0] ${
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
              <tr className="border-t-2 border-[#e0e0e0] bg-[#f8f9fa] font-bold">
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
                <td className="py-3 px-2 text-right font-mono font-bold text-[#4CAF50]">
                  {totalNetWeight.toFixed(1)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Total Summary */}
        <div className="p-4 bg-[#f8f9fa] border-t border-[#e0e0e0]">
          <div className="flex justify-between items-center">
            <div className="text-lg font-semibold text-gray-900">
              Total Net Weight:{" "}
              <span className="text-[#4CAF50]">{totalNetWeight.toFixed(1)} kg</span>
            </div>
            <div className="text-lg font-semibold text-gray-900">
              Total Amount:{" "}
              <span className="text-[#4CAF50]">
                Rs. {totalAmount.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Summary */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Payment Summary
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Gross Amount:</span>
            <span className="font-mono text-gray-900">
              Rs. {selectedSupplier.grossAmount.toLocaleString()}
            </span>
          </div>
          <div className="border-t border-[#e0e0e0] pt-3">
            <div className="text-sm font-medium text-gray-600 mb-2">
              Deductions:
            </div>
            <div className="space-y-2 ml-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Advances:</span>
                <span className="font-mono text-red-600">
                  - Rs. {selectedSupplier.advances.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Fertilizer:</span>
                <span className="font-mono text-red-600">
                  - Rs. {selectedSupplier.fertilizer.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Transport:</span>
                <span className="font-mono text-red-600">
                  - Rs. {selectedSupplier.transport.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Others:</span>
                <span className="font-mono text-red-600">
                  - Rs. {selectedSupplier.others.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm font-medium border-t border-[#f0f0f0] pt-2">
                <span className="text-gray-600">Total Deductions:</span>
                <span className="font-mono text-red-600">
                  - Rs. {selectedSupplier.totalDeductions.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
          <div className="border-t border-[#e0e0e0] pt-3 flex justify-between text-lg font-bold">
            <span className="text-gray-900">Final Amount:</span>
            <span className="font-mono text-[#4CAF50]">
              Rs. {selectedSupplier.finalAmount.toLocaleString()}
            </span>
          </div>
          <div className="border-t border-[#e0e0e0] pt-3 flex justify-between text-sm">
            <span className="text-gray-600">Payment Method:</span>
            <span
              className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                selectedSupplier.paymentMethod === "Bank"
                  ? "bg-[#ffffff] text-[#000000]"
                  : "bg-[#ffffff] text-[#000000]"
              }`}
            >
              {selectedSupplier.paymentMethod === "Bank" ? (
                <CreditCard className="h-3 w-3" />
              ) : (
                <Banknote className="h-3 w-3" />
              )}
              {selectedSupplier.paymentMethod}
            </span>
          </div>
          {selectedSupplier.paidDate && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Payment Date:</span>
              <span className="font-mono text-gray-900">
                {selectedSupplier.paidDate}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
