import React, { useState, useEffect } from "react";
import {
  fetchTeaRateRecords,
  submitTeaRate,
} from "../../../api/factoryManager";

import { Calculator, TrendingUp, Send, Table } from "lucide-react";
// import { auth } from "../../../firebase";

const BORDER_COLOR = "#cfece6";

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const getDefaultRate = (month) => {
  const defaultRates = {
    1: 68,
    2: 69,
    3: 67,
    4: 70,
    5: 68,
    6: 69,
    7: 68,
    8: 67,
    9: 70,
    10: 68,
    11: 69,
    12: 68,
  };
  return defaultRates[month] || 68;
};

export default function TeaRateAdjustment() {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [nsaValue, setNsaValue] = useState("");
  const [gsaValue, setGsaValue] = useState("");
  const [monthlyRate, setMonthlyRate] = useState(getDefaultRate(currentMonth));
  const [totalWeight, setTotalWeight] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [userId, setUserId] = useState(null);
  const [teaRateRecords, setTeaRateRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    if (storedUserId) {
      setUserId(storedUserId);
      fetchRecords(storedUserId);
    } else {
      setUserId(null);
      console.warn("User ID not found in localStorage");
    }
  }, []);

  // Fetch tea rate records from backend
  const fetchRecords = async (userIdParam) => {
    setLoading(true);
    const records = await fetchTeaRateRecords(userIdParam);
    setTeaRateRecords(records);
    setLoading(false);
  };

  // Calculations
  const calculatedRate =
    ((parseFloat(gsaValue) || 0) * (parseFloat(monthlyRate) || 0)) / 100;
  const totalPayout = calculatedRate * (parseFloat(totalWeight) || 0);

  // const handleSubmit = async () => {
  //   if (!userId) {
  //     alert("User not logged in.");
  //     return;
  //   }
  //   if (!gsaValue || calculatedRate === 0) {
  //     alert("Please fill valid GSA and Monthly Rate.");
  //     return;
  //   }
  //   try {
  //     const payload = {
  //       userId: userId,
  //       month: `${2025}-${currentMonth.toString().padStart(2, "0")}`,
  //       nsa: parseFloat(nsaValue),
  //       gsa: parseFloat(gsaValue),
  //       monthlyRate: parseFloat(monthlyRate),
  //       totalWeight: parseFloat(totalWeight),
  //       finalRatePerKg: calculatedRate,
  //       totalPayout: totalPayout,
  //     };

  //     const res = await axios.post(API_URL, payload);

  //     if (res.status === 200 || res.status === 201) {
  //       alert("Rate submitted successfully!");
  //       setIsSubmitted(true);
  //     } else {
  //       alert("Something went wrong.");
  //     }
  //   } catch (err) {
  //     console.error(err);
  //     alert("Error submitting data.");
  //   }
  // };

  const handleSubmit = async () => {
    if (!userId) {
      alert("User not logged in.");
      return;
    }
    if (!gsaValue || calculatedRate === 0) {
      alert("Please fill valid GSA and Monthly Rate.");
      return;
    }
    try {
      const payload = {
        createdBy: userId,
        effectiveDate: new Date(`${2025}-${currentMonth.toString().padStart(2, "0")}-01`),
        defaultRate: calculatedRate || 0,
        rates: [
          { quality: 'A', ratePerKg: calculatedRate || 0 },
          { quality: 'B', ratePerKg: calculatedRate || 0 },
          { quality: 'C', ratePerKg: calculatedRate || 0 },
          { quality: 'Premium', ratePerKg: calculatedRate || 0 }
        ],
        month: `${2025}-${currentMonth.toString().padStart(2, "0")}`,
        nsa: parseFloat(nsaValue),
        gsa: parseFloat(gsaValue),
        monthlyRate: parseFloat(monthlyRate),
        totalWeight: parseFloat(totalWeight),
        finalRatePerKg: calculatedRate,
        totalPayout: totalPayout,
      };

      const res = await submitTeaRate(payload);

      if (res.status === 200 || res.status === 201) {
        alert("Rate submitted successfully!");
        setIsSubmitted(true);

        // Refresh tea rate records from backend
        await fetchRecords(userId);

        // Reset form
        setNsaValue("");
        setGsaValue("");
        setTotalWeight("");
        setIsSubmitted(false);
      } else {
        alert("Something went wrong.");
      }
    } catch (err) {
      console.error(err);
      alert("Error submitting data.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Rate Inputs */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <Calculator className="h-5 w-5 text-black mr-2" />
            <h2 className="text-lg font-semibold">Rate Inputs</h2>
          </div>

          <div className="mb-4">
            <label className="text-sm font-medium text-gray-600 mb-1 block">
              Select Month
            </label>
            <select
              value={currentMonth}
              onChange={(e) => {
                const month = parseInt(e.target.value);
                setCurrentMonth(month);
                setMonthlyRate(getDefaultRate(month));
              }}
              className="w-full p-2 border rounded text-sm text-gray-900"
              style={{ borderColor: BORDER_COLOR }}
            >
              {months.map((m, idx) => (
                <option key={idx} value={idx + 1}>
                  {m} 2025
                </option>
              ))}
            </select>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-sm font-medium text-gray-600">NSA</label>
              <input
                type="number"
                step="0.01"
                className="w-full p-2 border rounded"
                value={nsaValue}
                onChange={(e) => setNsaValue(e.target.value)}
                placeholder="Net Sale Average"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">GSA *</label>
              <input
                type="number"
                step="0.01"
                className="w-full p-2 border rounded"
                value={gsaValue}
                onChange={(e) => setGsaValue(e.target.value)}
                placeholder="Gross Sale Average"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">
                {" "}
                Monthly Rate %{" "}
              </label>
              <input
                type="number"
                step="0.1"
                className="w-full p-2 border rounded"
                value={monthlyRate}
                onChange={(e) =>
                  setMonthlyRate(parseFloat(e.target.value) || 0)
                }
              />

              <p className="text-xs text-gray-400 mt-1">
                Default: {getDefaultRate(currentMonth)}%
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600">
                Total Weight (kg)
              </label>

              <input
                type="number"
                className="w-full p-2 border rounded"
                value={totalWeight}
                onChange={(e) => setTotalWeight(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <TrendingUp className="h-5 w-5 text-black mr-2" />
            <h2 className="text-lg font-semibold">Calculation Results</h2>
          </div>

          <div className="bg-gray-50 p-3 rounded text-sm space-y-1">
            <div>
              <strong>GSA:</strong> Rs. {(parseFloat(gsaValue) || 0).toFixed(2)}
            </div>
            <div>
              <strong>{monthlyRate} % of GSA: </strong> Rs.{" "}
              {calculatedRate.toFixed(2)}
            </div>
          </div>

          <div className="mt-4 border-l-4 border-green-900 p-3 rounded">
            <p className="text-xs text-gray-600 mb-1">Final Rate per Kg</p>
            <p className="text-lg font-bold text-green-900">
              Rs. {calculatedRate.toFixed(2)}
            </p>
          </div>

          <div className="mt-4 border-l-4 border-green-900 p-3 rounded">
            <p className="text-xs text-gray-600 mb-1">Total Payout</p>
            <p className="text-lg font-bold text-green-900">
              Rs. {totalPayout.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500">
              Based on {totalWeight.toLocaleString()} kg
            </p>
          </div>

          <div className="mt-4">
            <button
              onClick={handleSubmit}
              disabled={!gsaValue || calculatedRate === 0 || isSubmitted}
              className={`w-full px-5 py-2 rounded-md flex items-center justify-center text-sm font-medium transition-colors ${
                isSubmitted
                  ? "bg-green-600 text-white cursor-not-allowed"
                  : "bg-[#01251F] text-white hover:bg-[#104239]"
              }`}
            >
              <Send className="h-4 w-4 mr-2" />
              {isSubmitted ? "Submitted" : "Submit for Approval"}
            </button>
          </div>
        </div>
      </div>

      {/* Tea Rate Records Table */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <div className="flex items-center mb-4">
          <Table className="h-5 w-5 text-black mr-2" />
          <h2 className="text-lg font-semibold">Tea Rate Records</h2>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-900"></div>
              <p className="mt-2 text-gray-500">Loading tea rate records...</p>
            </div>
          ) : (
            <table className="w-full border-collapse border border-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-600">
                    Month
                  </th>
                  <th className="border border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-600">
                    NSA (Rs.)
                  </th>
                  <th className="border border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-600">
                    GSA (Rs.)
                  </th>
                  <th className="border border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-600">
                    Monthly Rate (%)
                  </th>
                  <th className="border border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-600">
                    Total Weight (kg)
                  </th>
                  <th className="border border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-600">
                    Final Rate/Kg (Rs.)
                  </th>
                  <th className="border border-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-600">
                    Total Payout (Rs.)
                  </th>
                </tr>
              </thead>
              <tbody>
                {teaRateRecords.map((record, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="border border-gray-200 px-4 py-2 text-sm text-gray-900">
                      {record.month
                        ? new Date(record.month).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                          })
                        : ""}
                    </td>
                    <td className="border border-gray-200 px-4 py-2 text-sm text-gray-900">
                      {record.nsa != null ? record.nsa.toFixed(2) : ""}
                    </td>
                    <td className="border border-gray-200 px-4 py-2 text-sm text-gray-900">
                      {record.gsa != null ? record.gsa.toFixed(2) : ""}
                    </td>
                    <td className="border border-gray-200 px-4 py-2 text-sm text-gray-900">
                      {record.monthlyRate != null
                        ? record.monthlyRate.toFixed(1)
                        : ""}
                      %
                    </td>
                    <td className="border border-gray-200 px-4 py-2 text-sm text-gray-900">
                      {record.totalWeight != null
                        ? record.totalWeight.toLocaleString()
                        : ""}
                    </td>
                    <td className="border border-gray-200 px-4 py-2 text-sm font-medium text-green-900">
                      {record.finalRatePerKg != null
                        ? record.finalRatePerKg.toFixed(2)
                        : ""}
                    </td>
                    <td className="border border-gray-200 px-4 py-2 text-sm font-medium text-green-900">
                      {record.totalPayout != null
                        ? record.totalPayout.toLocaleString()
                        : ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {!loading && teaRateRecords.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No tea rate records found. Submit a rate to see it in the table.
          </div>
        )}
      </div>
    </div>
  );
}
