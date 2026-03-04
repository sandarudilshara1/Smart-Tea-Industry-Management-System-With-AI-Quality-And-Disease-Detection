import {
  Package,
  Scale,
  BarChart2,
} from "lucide-react";

export default function SummaryCards({ currentView, summary }) {
  const cardStyle =
    "bg-white p-6 rounded-lg shadow-md border border-black transition-all duration-200 hover:shadow-lg hover:border-black";

  const iconWrapper =
    "h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center";

  const iconSize = 24;

  if (currentView === "routes") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {/* Total Weight */}
        <div className={cardStyle}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-black">Total Weight</p>
              <p className="text-2xl font-bold text-black">
                {summary.totalWeight?.toFixed(1) || "0.0"} kg
              </p>
            </div>
            <div className={iconWrapper}>
              <Scale size={iconSize} className="text-black" />
            </div>
          </div>
        </div>

        {/* Total Bags */}
        <div className={cardStyle}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-black">Total Bags</p>
              <p className="text-2xl font-bold text-black">
                {summary.totalBags || "0"}
              </p>
            </div>
            <div className={iconWrapper}>
              <Package size={iconSize} className="text-black" />
            </div>
          </div>
        </div>

        {/* Net Weight */}
        <div className={cardStyle}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-black">Net Weight</p>
              <p className="text-2xl font-bold text-black">
                {summary.netWeight?.toFixed(1) || "0.0"} kg
              </p>
            </div>
            <div className={iconWrapper}>
              <BarChart2 size={iconSize} className="text-black" />
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
        Icon: Scale,
      },
      {
        label: "Total Bags",
        value: `${summary.totalBags || "0"}`,
        Icon: Package,
      },
      {
        label: "Net Weight",
        value: `${summary.netWeight?.toFixed(1) || "0.0"} kg`,
        Icon: BarChart2,
      },
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {cards.map(({ label, value, Icon }, index) => (
          <div key={index} className={cardStyle}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-black">{label}</p>
                <p className="text-2xl font-bold text-black">{value}</p>
              </div>
              <div className={iconWrapper}>
                <Icon size={iconSize} className="text-black" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return null;
}
