import { CheckCircle, User, MapPin, Users } from "lucide-react";

export default function DriverSummaryCards({ currentView, summary }) {
  if (currentView !== "list") return null;

  const cards = [
    {
      title: "Total Drivers",
      value: summary.totalDrivers || 0,
      icon: Users,
    },
    {
      title: "Available Today",
      value: summary.availableToday || 0,
      icon: CheckCircle,
    },
    {
      title: "Assigned Drivers",
      value: summary.assignedDrivers || 0,
      icon: MapPin,
    },
    {
      title: "On Leave",
      value: summary.onLeaveDrivers || 0,
      icon: User,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card, index) => {
        const Icon = card.icon;

        return (
          <div
            key={index}
            className="bg-white p-6 rounded-lg shadow-md border border-black hover:border-black transition-all duration-200 hover:shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-black">{card.title}</p>
                <p className="text-2xl font-bold text-black">{card.value}</p>
              </div>
              <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center">
                <Icon size={24} className="text-black" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
