import { UserCheck, Plus } from "lucide-react";

// Design system tokens
const ACCENT_COLOR = "#165E52";
const BTN_COLOR = "#01251F";
const BORDER_COLOR = "#cfece6";
const BG_LIGHT = "#e1f4ef";

export default function DriverHeader({
  currentView,
  selectedDriver,
  onGoBack,
  onCreateDriver,
  onQuickAssign,
}) {
  const getTitle = () => {
    if (currentView === "list") return "Driver Management";
    if (currentView === "profile") return selectedDriver?.name || "Driver Profile";
    if (currentView === "assign") return "Daily Assignments";
    return "Driver Management";
  };

  const handleGoBack = () => {
    if (currentView === "profile" || currentView === "assign") {
      onGoBack("list");
    }
  };

  return (
    <div
      className="bg-white shadow-md border-b"
      style={{ borderColor: BORDER_COLOR }}
    >
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
          {/* Left: Title */}
          <div>
            <h1 className="text-3xl font-bold" style={{ color: ACCENT_COLOR }}>
              {getTitle()}
            </h1>
          </div>

          {/* Right: Buttons */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {(currentView === "profile" || currentView === "assign") && (
              <button
                onClick={handleGoBack}
                className="px-6 py-3 rounded-lg text-sm font-semibold transition-colors duration-200"
                style={{
                  backgroundColor: BG_LIGHT,
                  color: ACCENT_COLOR,
                  border: `1px solid ${BORDER_COLOR}`,
                }}
              >
                ← Back to Drivers
              </button>
            )}

            {currentView === "list" && (
              <div className="flex gap-3">
                <button
                  onClick={onQuickAssign}
                  className="py-3 px-6 rounded-lg shadow-md text-sm font-semibold transition-colors duration-200 flex items-center gap-2"
                  style={{
                    backgroundColor: BTN_COLOR,
                    color: "#ffffff",
                  }}
                >
                  <UserCheck size={20} />
                  Quick Assign
                </button>

                <button
                  onClick={onCreateDriver}
                  className="py-3 px-6 rounded-lg shadow-md text-sm font-semibold transition-colors duration-200 flex items-center gap-2"
                  style={{
                    backgroundColor: BTN_COLOR,
                    color: "#ffffff",
                  }}
                >
                  <Plus size={20} />
                  Add Driver
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
