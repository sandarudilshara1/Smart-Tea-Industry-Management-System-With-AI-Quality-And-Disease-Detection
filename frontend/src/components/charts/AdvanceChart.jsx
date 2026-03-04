import React, { useState, useRef } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";


ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);


const ACCENT_COLOR = "#b4e4dcff";
const BTN_COLOR = "#01251F";


// Helper function to calculate suitable max for Y-axis with 10% margin
function computeMax(dataArray) {
  if (!dataArray || !dataArray.length) return undefined;
  const max = Math.max(...dataArray);
  if (max > 1000) return Math.ceil(max * 1.1 / 100) * 100;
  if (max > 100) return Math.ceil(max * 1.1 / 10) * 10;
  return Math.ceil(max * 1.1);
}


const AdvanceChart = ({ data, selectedMonth, selectedYear }) => {
  const chartRef = useRef(null);
  const [viewType, setViewType] = useState("daily");
  const currentDate = new Date();


  // Generate chart data based on selected view type
  const getChartData = () => {
    if (viewType === "daily") {
      const monthToUse = selectedMonth ?? currentDate.getMonth();
      const yearToUse = selectedYear ?? currentDate.getFullYear();
      const daysInMonth = new Date(yearToUse, monthToUse + 1, 0).getDate();
      const dailyLabels = Array.from({ length: daysInMonth }, (_, i) => `${i + 1}`);
      const dailyData = Array.from(
        { length: daysInMonth }, () => Math.floor(Math.random() * 50) + 20
      );
      return {
        labels: dailyLabels,
        datasets: [
          {
            label: "Tea Supply (kg)",
            data: dailyData,
            backgroundColor: ACCENT_COLOR,
            hoverBackgroundColor: "#165E52",
            hoverBorderColor: "#165E52",
            borderColor: ACCENT_COLOR,
            borderWidth: 1,
            borderRadius: 8,
            borderSkipped: false,
          },
        ],
      };
    }
    // Monthly view data fallback or provided data
    return (
      data || {
        labels: [
          "Jan", "Feb", "Mar", "Apr", "May", "Jun",
          "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ],
        datasets: [
          {
            label: "Tea Supply (kg)",
            data: [
              12000, 14500, 13200, 15800, 16200, 17500,
              18200, 16800, 15200, 13800, 12500, 11200,
            ],
            backgroundColor: ACCENT_COLOR,
            borderColor: ACCENT_COLOR,
            hoverBackgroundColor: "#165E52",
            hoverBorderColor: "#165E52",
            borderWidth: 1,
            borderRadius: 8,
            borderSkipped: false,
          },
        ],
      }
    );
  };


  const chartData = getChartData();
  const yMax = computeMax(chartData.datasets?.[0]?.data);


  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: viewType === "daily" ? "Daily Tea Collection" : "Monthly Tea Collection",
        font: { size: 18 },
        color: "#1e293b",
        padding: { top: 10, bottom: 20 },
      },
      datalabels: {
        display: false,
        anchor: "center",
        align: "center",
        color: "#1e293b",
        font: { weight: "bold", size: 11 },
        formatter: (value) => value + " kg",
      },
      tooltip: {
        callbacks: {
          label: (context) => `${context.dataset.label}: ${context.parsed.y} kg`,
        },
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "#fff",
        bodyColor: "#fff",
        borderColor: "#3b82f6",
        borderWidth: 1,
        displayColors: false,
        titleFont: { size: 14 },
        bodyFont: { size: 12 },
        cornerRadius: 8,
        caretPadding: 10,
        padding: 12,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: yMax,
        title: {
          display: true,
          text: "Tea Supply (kg)",
          color: "#1e293b",
          font: { weight: "bold" },
        },
        grid: { color: "rgba(0,0,0,0.1)" },
        ticks: { color: "#1e293b", font: { size: 11 } },
      },
      x: {
        title: {
          display: true,
          text: "Time Period",
          color: "#1e293b",
          font: { weight: "bold" },
        },
        grid: { display: false },
        ticks: { color: "#1e293b", font: { size: 11 } },
      },
    },
  };


  return (
    <div className="w-full h-96">
      <div className="flex items-center justify-center mb-4">
        <div
          className="rounded-lg p-1 flex"
          style={{
            background: "#e1f4ef",
            border: `2px solid #cfece6`,
          }}
        >
          <button
            onClick={() => setViewType("daily")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              viewType === "daily"
                ? "text-white shadow-sm"
                : "hover:bg-[#e1f4ef]"
            }`}
            style={{
              backgroundColor: viewType === "daily" ? BTN_COLOR : "transparent",
              color: viewType === "daily" ? "#fff" : BTN_COLOR,
              border: "none",
            }}
          >
            Daily View
          </button>
          <button
            onClick={() => setViewType("monthly")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              viewType === "monthly"
                ? "text-white shadow-sm"
                : "hover:bg-[#e1f4ef]"
            }`}
            style={{
              backgroundColor: viewType === "monthly" ? BTN_COLOR : "transparent",
              color: viewType === "monthly" ? "#fff" : BTN_COLOR,
              border: "none",
            }}
          >
            Monthly View
          </button>
        </div>
      </div>
      <Bar
        ref={chartRef}
        data={chartData}
        options={options}
        plugins={[ChartDataLabels]}
      />
    </div>
  );
};


export default AdvanceChart;



