import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Package, Building2, Weight, Warehouse, Calendar } from "lucide-react";

const ACCENT_COLOR = "#165E52";

const ViewStock = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Mock data - in real app, this would be fetched based on id
  const stock = {
    id: id,
    name: "NPK 20-20-20",
    company: "GreenGrow Ltd",
    quantity: 150,
    weight: "50kg",
    warehouse: "Warehouse A",
    dateAdded: "2024-07-01",
    description: "High-quality NPK fertilizer suitable for all crops",
    batchNumber: "BTH001234",
    expiryDate: "2025-07-01",
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => navigate("/fertilizerManager/stocks")}
            className="flex items-center text-gray-600 hover:text-gray-800 mb-4"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Stock List
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Stock Details</h1>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Basic Information
              </h2>
              <div className="space-y-4">
                <div className="flex items-center">
                  <Package className="text-green-600 mr-3" size={20} />
                  <div>
                    <p className="text-sm text-gray-500">Fertilizer Name</p>
                    <p className="font-medium">{stock.name}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Building2 className="text-blue-600 mr-3" size={20} />
                  <div>
                    <p className="text-sm text-gray-500">Company</p>
                    <p className="font-medium">{stock.company}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Weight className="text-purple-600 mr-3" size={20} />
                  <div>
                    <p className="text-sm text-gray-500">Weight per Unit</p>
                    <p className="font-medium">{stock.weight}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Warehouse className="text-orange-600 mr-3" size={20} />
                  <div>
                    <p className="text-sm text-gray-500">Warehouse Location</p>
                    <p className="font-medium">{stock.warehouse}</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Stock Details
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Current Quantity</p>
                  <p className="text-2xl font-bold text-green-600">{stock.quantity} units</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Batch Number</p>
                  <p className="font-medium">{stock.batchNumber}</p>
                </div>
                <div className="flex items-center">
                  <Calendar className="text-gray-600 mr-3" size={20} />
                  <div>
                    <p className="text-sm text-gray-500">Date Added</p>
                    <p className="font-medium">{stock.dateAdded}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Expiry Date</p>
                  <p className="font-medium">{stock.expiryDate}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
            <p className="text-gray-600">{stock.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewStock;
