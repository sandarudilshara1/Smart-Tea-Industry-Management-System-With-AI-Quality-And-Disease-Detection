import { Scale, DollarSign, CheckCircle, Clock } from "lucide-react";

export default function SummaryCards({ currentView, summary }) {
  const baseCardStyle =
    "bg-white p-6 rounded-lg shadow-md transition-transform cursor-pointer hover:scale-[1.02]";
  const borderStyle = { border: "1.5px solid black" };

  if (currentView === "routes") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Total Weight */}
        <div className={baseCardStyle} style={borderStyle}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-black">Total Weight</p>
              <p className="text-2xl font-bold text-black">
                {summary.totalWeight?.toFixed(1) || "0.0"} kg
              </p>
              <p className="text-xs text-gray-500">
                {summary.routeCount || 0} routes • {summary.supplierCount || 0} suppliers
              </p>
            </div>
            <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center">
              <Scale size={30} color="black" />
            </div>
          </div>
        </div>

        {/* Total Amount */}
        <div className={baseCardStyle} style={borderStyle}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-black">Total Amount</p>
              <p className="text-2xl font-bold text-black">
                Rs. {summary.total?.toLocaleString() || "0"}
              </p>
              <p className="text-xs text-gray-500">
                {summary.routeCount || 0} routes • {summary.supplierCount || 0} suppliers
              </p>
            </div>
            <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center">
              <DollarSign size={30} color="black" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentView === "suppliers") {
    const cards = [
      {
        label: "Total Weight",
        value: `${summary.totalWeight?.toFixed(1) || "0.0"} kg`,
        icon: <Scale size={30} color="black" />,
      },
      {
        label: "Total Amount",
        value: `Rs. ${summary.total?.toLocaleString() || "0"}`,
        icon: <DollarSign size={30} color="black" />,
      },
      {
        label: "Paid",
        value: `Rs. ${summary.paid?.toLocaleString() || "0"}`,
        icon: <CheckCircle size={30} color="black" />,
      },
      {
        label: "Pending",
        value: `Rs. ${summary.pending?.toLocaleString() || "0"}`,
        icon: <Clock size={30} color="black" />,
      },
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {cards.map((card, idx) => (
          <div
            key={idx}
            className={baseCardStyle}
            style={borderStyle}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-black">{card.label}</p>
                <p className="text-2xl font-bold text-black">{card.value}</p>
              </div>
              <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center">
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return null;
}
