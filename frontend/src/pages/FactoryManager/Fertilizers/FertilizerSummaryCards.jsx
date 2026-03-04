import { Package, Clock, CheckCircle, XCircle } from "lucide-react";

export default function FertilizerSummaryCards({
  metrics,
  currentView,
  setCurrentView,
}) {
  // All cards use the same border color
  const borderColor = "#165E52";

  // All cards use the same ring color for active/selected state
  // Enhance active card focus: stronger ring, scale, and shadow
  const getRingClass = (type) => {
    if (currentView === type) {
      return "ring-4 ring-[#165E52]/60 scale-[1.04] shadow-lg z-10";
    }
    return "";
  };

  const cards = [
    {
      type: "all",
      label: "All Requests",
      value: metrics.total,
      icon: <Package size={30} color="black" />,
    },
    {
      type: "pending",
      label: "Pending Requests",
      value: metrics.pending,
      icon: <Clock size={30} color="#D97706" />,
    },
    {
      type: "approved",
      label: "Approved Requests",
      value: metrics.approved,
      icon: <CheckCircle size={30} color="#047857" />,
    },
    {
      type: "rejected",
      label: "Rejected Requests",
      value: metrics.rejected,
      icon: <XCircle size={30} color="#DC2626" />,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {cards.map((card) => (
        <div
          key={card.type}
          onClick={() => setCurrentView(card.type)}
          className={`bg-white border p-6 rounded-lg shadow-md cursor-pointer transition-all duration-300 relative ${getRingClass(
            card.type
          )}`}
          style={{ borderColor: borderColor }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">{card.label}</p>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
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
