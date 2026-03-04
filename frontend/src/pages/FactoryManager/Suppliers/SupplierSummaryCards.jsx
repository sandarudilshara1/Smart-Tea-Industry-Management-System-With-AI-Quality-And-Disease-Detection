import { Users, Clock, X } from "lucide-react";

export default function SupplierSummaryCards({
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
      type: "approved",
      label: "Total Suppliers",
      value: metrics.approved,
      icon: <Users size={30} color="black" />,
    },
    {
      type: "pending",
      label: "Pending Requests",
      value: metrics.pending,
      icon: <Clock size={30} color="black" />,
    },
    {
      type: "rejected",
      label: "Rejected",
      value: metrics.rejected,
      icon: <X size={30} color="#ef4444" />,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      {cards.map((card) => {
        const isApproved = card.type === "approved";
        return (
          <div
            key={card.type}
            onClick={() => setCurrentView(card.type)}
            className={`bg-white p-6 rounded-lg shadow-md cursor-pointer transition-transform duration-200 ${
              !isApproved ? "hover:scale-[1.02]" : "hover:shadow-none"
            } ${getRingClass(card.type)}`}
            style={{
              border: `1px solid ${borderColor}`,
            }}
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
        );
      })}
    </div>
  );
}
