import { useState, useEffect } from "react";
import { X, Search, Users, Check, AlertCircle } from "lucide-react";

export default function SupplierSelectionModal({
  isOpen,
  onClose,
  onSubmit,
  currentSupplierIds = [],
}) {
  const [selectedSuppliers, setSelectedSuppliers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [allSuppliers, setAllSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      const mockSuppliers = [
        {
          id: "S001",
          name: "Kumara Tea Estate",
          location: "Galle",
          contactPerson: "Kumara Perera",
          phone: "077-1234567",
          expectedLoad: 45,
          actualLoad: 42,
          lastMonthWeight: 44,
          bagCount: 4,
        },
        {
          id: "S002",
          name: "Silva Gardens",
          location: "Akuressa",
          contactPerson: "Silva Fernando",
          phone: "077-2345678",
          expectedLoad: 38,
          actualLoad: 35,
          lastMonthWeight: 37,
          bagCount: 3,
        },
        {
          id: "S003",
          name: "Green Valley Tea",
          location: "Elpitiya",
          contactPerson: "Rohan Jayasinghe",
          phone: "077-3456789",
          expectedLoad: 52,
          actualLoad: 48,
          lastMonthWeight: 50,
          bagCount: 5,
        },
        {
          id: "S004",
          name: "Highland Tea Co",
          location: "Kandy",
          contactPerson: "Mahinda Rajapaksa",
          phone: "077-4567890",
          expectedLoad: 65,
          actualLoad: 62,
          lastMonthWeight: 64,
          bagCount: 6,
        },
        {
          id: "S005",
          name: "Mountain View Estate",
          location: "Peradeniya",
          contactPerson: "Sunil Bandara",
          phone: "077-5678901",
          expectedLoad: 55,
        },
        {
          id: "S006",
          name: "Alpine Tea Gardens",
          location: "Nuwara Eliya",
          contactPerson: "Chandra Wickrama",
          phone: "077-6789012",
          expectedLoad: 75,
        },
        {
          id: "S007",
          name: "Sunshine Plantations",
          location: "Matara",
          contactPerson: "Lasith Malinga",
          phone: "077-7890123",
          expectedLoad: 50,
        },
        {
          id: "S008",
          name: "Emerald Valley",
          location: "Hatton",
          contactPerson: "Kumar Sangakkara",
          phone: "077-8901234",
          expectedLoad: 60,
        },
        {
          id: "S009",
          name: "Ceylon Heritage Farms",
          location: "Badulla",
          contactPerson: "Anjali Gunathilaka",
          phone: "077-9012345",
          expectedLoad: 48,
        },
        {
          id: "S010",
          name: "Misty Hills Estate",
          location: "Ella",
          contactPerson: "Dinesh Chandimal",
          phone: "077-0123456",
          expectedLoad: 55,
        },
      ];
      setAllSuppliers(mockSuppliers);
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setSelectedSuppliers([]);
      setSearchQuery("");
      setShowConfirmation(false);
    }
  }, [isOpen]);

  const filteredSuppliers = allSuppliers.filter((supplier) => {
    const matchesSearch =
      searchQuery.trim() === "" ||
      supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier.id.toLowerCase().includes(searchQuery.toLowerCase());

    const isNotAlreadyOnRoute = !currentSupplierIds.includes(supplier.id);

    return matchesSearch && isNotAlreadyOnRoute;
  });

  const handleToggleSupplier = (supplier) => {
    setSelectedSuppliers((prev) =>
      prev.some((s) => s.id === supplier.id)
        ? prev.filter((s) => s.id !== supplier.id)
        : [...prev, supplier]
    );
  };

  const handleSubmit = () => {
    if (selectedSuppliers.length === 0) {
      return;
    }
    if (!showConfirmation) {
      setShowConfirmation(true);
      return;
    }
    onSubmit(selectedSuppliers);
    onClose();
  };

  const handleConfirmSubmit = () => {
    onSubmit(selectedSuppliers);
    onClose();
  };

  const handleCancel = () => {
    if (showConfirmation) {
      setShowConfirmation(false);
    } else {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
   <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4">

      <div className="bg-[#ffffff] rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col border border-[#cfece6]">
        {/* Modal Header */}
        <div className="p-6 border-b border-[#cfece6] bg-[#e1f4ef] flex justify-between items-center rounded-t-lg">
          <h2 className="text-xl font-bold text-[#165E52] flex items-center gap-2">
            <Users size={20} className="text-[#165E52]" />
            Add Suppliers to Route
          </h2>
          <button
            onClick={onClose}
            className="text-[#165E52] hover:text-[#165E52] focus:outline-none"
            disabled={showConfirmation}
          >
            <X size={20} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-[#cfece6]">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-[#165E52]" />
            </div>
            <input
              type="text"
              placeholder="Search suppliers by ID, name, or location..."
              className="pl-10 pr-4 py-2 border border-[#cfece6] rounded-md w-full text-[#165E52] focus:ring-[#165E52] focus:border-[#165E52]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Confirmation Dialog */}
        {showConfirmation && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
            <div className="bg-[#ffffff] rounded-lg shadow-xl w-full max-w-md border border-[#cfece6]">
              <div className="p-6">
                <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-[#e1f4ef] rounded-full">
                  <AlertCircle className="w-6 h-6 text-[#165E52]" />
                </div>
                <h3 className="text-lg font-semibold text-center text-[#165E52] mb-2">
                  Confirm Add Suppliers
                </h3>
                <p className="text-center text-[#165E52] mb-6">
                  Are you sure you want to add {selectedSuppliers.length}{" "}
                  supplier
                  {selectedSuppliers.length !== 1 ? "s" : ""} to this route?
                  This will update the route and notify the assigned driver.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={handleCancel}
                    className="flex-1 px-4 py-2 text-[#165E52] bg-[#e1f4ef] hover:bg-[#cfece6] font-medium rounded-lg transition-colors duration-200 border border-[#cfece6]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmSubmit}
                    className="flex-1 px-4 py-2 bg-[#01251F] hover:bg-[#01251F] text-white font-medium rounded-lg transition-colors duration-200"
                  >
                    Confirm Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Suppliers List */}
        <div className="overflow-y-auto flex-grow">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-pulse flex flex-col items-center">
                <div className="h-12 w-12 bg-[#e1f4ef] rounded-full mb-4"></div>
                <div className="h-4 bg-[#cfece6] rounded w-1/2 mb-3"></div>
                <div className="h-3 bg-[#cfece6] rounded w-1/3"></div>
              </div>
            </div>
          ) : filteredSuppliers.length > 0 ? (
            <>
              {/* Table Header */}
              <div className="bg-[#e1f4ef] border-b border-[#cfece6] p-4">
                <div className="grid grid-cols-4 gap-4 text-sm font-medium text-[#165E52]">
                  <div>Supplier ID</div>
                  <div>Name</div>
                  <div>Location</div>
                  <div className="text-right">Weight (kg)</div>
                </div>
              </div>
              {/* Suppliers List */}
              <div className="divide-y divide-[#cfece6]">
                {filteredSuppliers.map((supplier) => {
                  const isSelected = selectedSuppliers.some(
                    (s) => s.id === supplier.id
                  );
                  return (
                    <div
                      key={supplier.id}
                      className={`p-4 flex items-center cursor-pointer hover:bg-[#e1f4ef] transition-colors ${
                        isSelected ? "bg-[#cfece6]" : ""
                      }`}
                      onClick={() => handleToggleSupplier(supplier)}
                    >
                      <div
                        className={`w-5 h-5 rounded-md border flex items-center justify-center mr-4 ${
                          isSelected
                            ? "bg-[#165E52] border-[#165E52]"
                            : "border-[#cfece6]"
                        }`}
                      >
                        {isSelected && <Check className="h-3 w-3 text-white" />}
                      </div>
                      <div className="flex-grow">
                        <div className="grid grid-cols-4 gap-4 items-center">
                          <div>
                            <p className="font-mono text-sm text-[#165E52]">
                              {supplier.id}
                            </p>
                          </div>
                          <div>
                            <p className="font-medium text-[#165E52]">
                              {supplier.name}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-[#165E52]">
                              {supplier.location}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-[#165E52]">
                              {supplier.lastMonthWeight ||
                                supplier.expectedLoad ||
                                0}{" "}
                              kg
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="p-8 text-center text-[#165E52]">
              <Users size={48} className="mx-auto text-[#cfece6] mb-4" />
              <p className="font-medium mb-2">No matching suppliers found</p>
              <p className="text-sm">
                {searchQuery.trim() !== ""
                  ? "Try adjusting your search query"
                  : "All suppliers are already on this route"}
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-[#cfece6] bg-[#e1f4ef] flex justify-between rounded-b-lg">
          <div className="text-sm text-[#165E52]">
            {selectedSuppliers.length} supplier
            {selectedSuppliers.length !== 1 ? "s" : ""} selected
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleCancel}
              className="px-4 py-2 border border-[#cfece6] rounded-md shadow-sm text-sm font-medium text-[#165E52] bg-[#e1f4ef] hover:bg-[#cfece6] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#165E52]"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={selectedSuppliers.length === 0}
              className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#165E52] ${
                selectedSuppliers.length === 0
                  ? "bg-[#cfece6] cursor-not-allowed"
                  : "bg-[#01251F] hover:bg-[#01251F]"
              }`}
            >
              Add Suppliers
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
