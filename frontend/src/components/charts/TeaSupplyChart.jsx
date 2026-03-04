import React, { useRef } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
    LineElement,
    PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";


ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);


const ACCENT_COLOR = "#b4e4dcff";


const TeaSupplyChart = ({ data, period = "daily" }) => {
  const chartRef = useRef(null);


  // Different data sets for different periods
  const getDataByPeriod = () => {
    switch (period) {
      case "daily":
        return {
          labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
          datasets: [
            {
              label: "Tea Supply (kg)",
              data: [450, 520, 380, 600, 490, 670, 430],
              backgroundColor: ACCENT_COLOR,
              borderColor: ACCENT_COLOR,
              borderWidth: 2,
              tension: 0.3,
            },
          ],
        };
      case "monthly":
        return {
          labels: [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
          ],
          datasets: [
            {
              label: "Tea Supply (kg)",
              data: [
                12000, 14500, 13200, 15800, 16200, 17500, 18200, 16800, 15200,
                13800, 12500, 11200,
              ],
              backgroundColor: ACCENT_COLOR,
              borderColor: ACCENT_COLOR,
              borderWidth: 2,
              tension: 0.3,
            },
          ],
        };
      case "yearly":
        return {
          labels: ["2020", "2021", "2022", "2023", "2024", "2025"],
          datasets: [
            {
              label: "Tea Supply (kg)",
              data: [185000, 198000, 210000, 195000, 220000, 180000],
              backgroundColor: ACCENT_COLOR,
              borderColor: ACCENT_COLOR,
              borderWidth: 2,
              tension: 0.3,
            },
          ],
        };
      default:
        return getDataByPeriod("daily");
    }
  };


  const chartData = data || getDataByPeriod();
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: data && data.datasets && data.datasets[0] && data.datasets[0].label
          ? `${data.datasets[0].label} over time`
          : `${period.charAt(0).toUpperCase() + period.slice(1)} Tea Collection`,
        font: { size: 18 },
        color: "#1e293b",
        padding: { top: 10, bottom: 20 },
      },
      datalabels: {
        display: true,
        anchor: "end",
        align: "top",
        color: "#1e293b",
        font: { weight: "bold", size: 11 },
        formatter: (value, ctx) => {
          const label = ctx.dataset && ctx.dataset.label ? ctx.dataset.label.toLowerCase() : '';
          if (label.includes('rate')) return `Rs. ${Number(value).toFixed(2)}`;
          if (label.includes('weight') || label.includes('kg')) return `${value} kg`;
          return value;
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.dataset.label || '';
            if (label.toLowerCase().includes('rate')) {
              return `${label}: Rs. ${context.parsed.y}`;
            }
            return `${label}: ${context.parsed.y} kg`;
          },
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
        title: {
          display: true,
          text: data && data.datasets && data.datasets[0] && data.datasets[0].label && data.datasets[0].label.toLowerCase().includes('rate') ? 'Rate (Rs.)' : 'Tea Supply (kg)',
          color: "#1e293b",
          font: { weight: "bold" },
        },
        grid: {
          color: "rgba(0, 0, 0, 0.1)",
        },
        ticks: {
          color: "#1e293b",
          font: { size: 11 },
        },
      },
      x: {
        title: {
          display: true,
          text: "Time Period",
          color: "#1e293b",
          font: { weight: "bold" },
        },
        grid: {
          display: false,
        },
        ticks: {
          color: "#1e293b",
          font: { size: 11 },
        },
      },
    },
  };


  return (
    <div className="w-full h-full">
      <Line
        ref={chartRef}
        data={chartData}
        options={options}
        plugins={[ChartDataLabels]}
      />
    </div>
  );
};


export default TeaSupplyChart;



