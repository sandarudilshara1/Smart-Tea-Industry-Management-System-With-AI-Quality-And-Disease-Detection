import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getBagWeightIdBySupplyRequest, updateEmptyBagTare } from "../../../api/inventoryManager/bagWeight";
import { getSupplierInfoBySupplyRequest, getBagDetailsBySupplyRequest } from "../../../api/inventoryManager/leafWeight";

export default function Supplier() {
  const navigate = useNavigate();
  const { supplyRequestId } = useParams();
  const [teaBags, setTeaBags] = useState([]);
  const [selectedBags, setSelectedBags] = useState([]);
  const [selectedBagsWeight, setSelectedBagsWeight] = useState("");
  const [bagWeightId, setBagWeightId] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [apiSuccess, setApiSuccess] = useState(false);
  const [supplierInfo, setSupplierInfo] = useState(null);

  useEffect(() => {
    if (!supplyRequestId) return;
    getBagWeightIdBySupplyRequest(supplyRequestId)
      .then((data) => setBagWeightId(data ? data : null))
      .catch(() => setBagWeightId(null));
    // Fetch supplier info
    getSupplierInfoBySupplyRequest(supplyRequestId)
      .then((data) => {
        setSupplierInfo(data);
        console.log("Supplier info from API:", data);
      })
      .catch(() => setSupplierInfo(null));
    // Fetch weighed bags
    getBagDetailsBySupplyRequest(supplyRequestId, "weighed")
      .then((data) => {
        const bags = Array.isArray(data) ? data : [];
        setTeaBags(bags);
        setSelectedBags(bags.map((bag) => bag.bagNo)); // Select all by default
      })
      .catch(() => {
        setTeaBags([]);
        setSelectedBags([]);
      });
  }, [supplyRequestId]);

  // sessionId is now available from location.state
  console.log("Bag Weight ID:", bagWeightId);

  const handleEnter = async () => {
    if (apiSuccess) {
      navigate(-1);
      return;
    }
    if (submitted) return;
    setSubmitted(true);
    const payload = {
      tareWeight: selectedBagsWeight,
    };
    try {
      await updateEmptyBagTare(bagWeightId, payload);
      setApiSuccess(true);
      setSubmitted(false);
      setSelectedBagsWeight("");
      console.log("Bag weights submitted successfully!");
    } catch (err) {
      setSubmitted(false);
      setApiSuccess(false);
      console.log("Error submitting bag weights:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-5 pb-5 px-4">
      <div className="max-w-8xl mx-auto space-y-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6 ">
          <h1 className="text-2xl font-bold" style={{ color: "#165E52" }}>
            Empty Bag Weighing
          </h1>
        </div>

        {/* Supplier Info Section (not cards) */}
        <div
          className="bg-white rounded-lg shadow-sm p-4 mb-6 border"
          style={{ borderColor: "#cfece6" }}
        >
          <div className="grid grid-cols-3 gap-6">
            <div>
              <label
                className="text-sm font-semibold mb-1 block"
                style={{ color: "#165E52" }}
              >
                Supplier ID
              </label>
              <div className="text-lg font-semibold text-[#01251F]">
                {supplierInfo?.supplierId || "-"}
              </div>
            </div>
            <div>
              <label
                className="text-sm font-semibold mb-1 block"
                style={{ color: "#165E52" }}
              >
                Supplier Name
              </label>
              <div className="text-lg font-semibold text-gray-900">
                {supplierInfo?.supplierName || "Supplier Name Not Available"}
              </div>
            </div>
            <div>
              <label
                className="text-sm font-semibold mb-1 block"
                style={{ color: "#165E52" }}
              >
                Total Bags
              </label>
              <div className="text-lg font-semibold text-gray-900">
                {teaBags.length}
              </div>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6 ">
          <div className="flex justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Bags Containing Tea Leaves
              </h2>
            </div>
          </div>
        </div>

        {/* Bags Table */}
        {/* <div className="bg-white rounded-lg shadow-sm border overflow-hidden "> */}
        {/* <div className="bg-white rounded-lg shadow-sm border overflow-hidden max-w-md mx-auto"> */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden max-w-md">
          <div className="bg-[#01251F] text-white">
            <div className="p-3 font-medium text-center">Bag No</div>
          </div>
          <div
            className="divide-y divide-gray-200"
            style={{
              maxHeight: teaBags.length > 5 ? "320px" : "auto", // ~5 rows * 64px
              overflowY: teaBags.length > 5 ? "auto" : "visible",
              minHeight: "45px",
            }}
          >
            {teaBags.map((bag, index) => (
              <div
                key={index}
                className="p-4 text-center bg-emerald-50 font-medium text-emerald-700"
              >
                <span className="px-2 py-1 rounded">{bag.bagNo}</span>
              </div>
            ))}
          </div>
        </div>

        {/* In Factory Section */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6 border-emerald-200 border transition-all duration-200 pb-10">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            In Factory
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selected Bags
              </label>
              <div className="text-sm text-gray-600 bg-emerald-50 p-3 rounded-lg border border-emerald-200 min-h-10 flex items-center">
                {selectedBags.length > 0
                  ? selectedBags.join(", ")
                  : "No bags selected"}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selected Bags Weight
              </label>
              <input
                type="number"
                value={selectedBagsWeight}
                onChange={(e) => setSelectedBagsWeight(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="Enter weight"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    if (!submitted) {
                      handleEnter();
                    }
                    e.preventDefault();
                  }
                }}
                disabled={submitted}
              />
            </div>

            <div>
              <button
                onClick={handleEnter}
                disabled={
                  !apiSuccess &&
                  (selectedBags.length === 0 ||
                    submitted ||
                    !selectedBagsWeight ||
                    !bagWeightId)
                }
                className={`bg-[#01251F] hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-2 px-6 rounded-lg transition-all duration-200 w-full transform hover:scale-105`}
              >
                {apiSuccess ? "Back to Route" : "Enter"}
              </button>
              {!bagWeightId && (
                <div className="mt-2 text-sm text-red-600 font-medium">
                  No bag record found for today. Please check the date or supply
                  request.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
