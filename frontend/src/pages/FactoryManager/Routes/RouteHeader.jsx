const ACCENT_COLOR = "#165E52"; // Title & highlights
const BUTTON_COLOR = "#172526"; // Buttons
import { Plus } from "lucide-react"; // Add this import at the top
export default function RouteHeader({
  currentView,
  selectedRoute,
  onGoBack,
  onCreateRoute,
}) {
  const getTitle = () => {
    if (currentView === "routes") return "Route Management";
    if (currentView === "details") return `${selectedRoute?.routeName}`;
    if (currentView === "suppliers") return `Suppliers: ${selectedRoute?.routeName}`;
    return "Route Management";
  };

  const handleGoBack = () => {
    if (currentView === "details" || currentView === "suppliers") {
      onGoBack("routes");
    }
  };

  return (
    <div className="bg-white shadow-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
          {/* Title Section */}
          <div>
            <h1 className="text-3xl font-bold" style={{ color: ACCENT_COLOR }}>
              {getTitle()}
            </h1>
            {selectedRoute && (
              <div className="text-lg font-semibold mt-1" style={{ color: ACCENT_COLOR }}>
                {selectedRoute.status}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {(currentView === "details" || currentView === "suppliers") && (
              <button
                onClick={handleGoBack}
                className="px-5 py-2.5 rounded-lg text-sm font-medium text-white transition-colors duration-200"
                style={{ backgroundColor: BUTTON_COLOR }}
              >
                Back
              </button>
            )}

            {currentView === "routes" && (
              <button
  onClick={onCreateRoute}
  className="text-white font-semibold py-2.5 px-5 rounded-lg shadow-md transition-colors duration-200 flex items-center gap-2"
  style={{ backgroundColor: BUTTON_COLOR }}
>
  <Plus size={20} /> {/* This restores the add sign */}
  Create New Route
</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
