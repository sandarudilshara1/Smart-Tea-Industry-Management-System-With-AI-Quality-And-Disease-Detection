
import React, { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { getFertilizerCompanies } from "../../../api/owner";

const FertilizerCompany = () => {
  const [companies, setCompanies] = useState([]);
  const [categories, setCategories] = useState([]);
  const [totalFertilizers, setTotalFertilizers] = useState(0);

  // Fetch companies from backend
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const data = await getFertilizerCompanies();
        if (data && data.length > 0) {
          setCompanies(data);
          // Extract unique categories
          const allCategories = Array.from(
            new Set(data.flatMap((company) => company.categories))
          );
          setCategories(allCategories);
          setTotalFertilizers(allCategories.length);
        } else {
          // Use sample data if API returns empty
          const sampleData = [
            {
              id: 1,
              name: "AgriCorp International",
              address: "No. 45, Main Street, Colombo 03",
              contactPerson: "Mr. Kamal Silva",
              contactNumber: "+94 77 123 4567",
              email: "info@agricorp.lk",
              categories: ["Urea", "NPK 15-15-15", "Potassium Nitrate"]
            },
            {
              id: 2,
              name: "FarmSolutions Ltd",
              address: "258/A, Kandy Road, Peradeniya",
              contactPerson: "Mrs. Nimal Fernando",
              contactNumber: "+94 77 234 5678",
              email: "sales@farmsolutions.lk",
              categories: ["NPK 15-15-15", "Ammonium Sulfate", "Triple Super Phosphate"]
            },
            {
              id: 3,
              name: "EcoGrow Fertilizers",
              address: "123, Galle Road, Matara",
              contactPerson: "Mr. Sunil Perera",
              contactNumber: "+94 77 345 6789",
              email: "contact@ecogrow.lk",
              categories: ["Urea", "Calcium Nitrate", "Potassium Nitrate"]
            },
            {
              id: 4,
              name: "TeaGreen Specialists",
              address: "87/B, Nuwara Eliya Road, Hatton",
              contactPerson: "Ms. Sanduni Jayawardena",
              contactNumber: "+94 77 456 7890",
              email: "info@teagreen.lk",
              categories: ["NPK 15-15-15", "Urea", "Micronutrient Mix"]
            },
            {
              id: 5,
              name: "NutriSoil Systems",
              address: "456, Temple Road, Negombo",
              contactPerson: "Mr. Ravi Kumar",
              contactNumber: "+94 77 567 8901",
              email: "support@nutrisoil.lk",
              categories: ["Triple Super Phosphate", "Ammonium Sulfate", "Calcium Nitrate"]
            },
            {
              id: 6,
              name: "Green Valley Agro",
              address: "12/3, Hill Street, Badulla",
              contactPerson: "Mrs. Chamari Dissanayake",
              contactNumber: "+94 77 678 9012",
              email: "info@greenvalley.lk",
              categories: ["Urea", "NPK 20-20-20", "Potassium Sulfate"]
            },
            {
              id: 7,
              name: "Lanka Fertilizer Co.",
              address: "789, Industrial Estate, Ratmalana",
              contactPerson: "Mr. Asanka Bandara",
              contactNumber: "+94 77 789 0123",
              email: "sales@lankafertilizer.lk",
              categories: ["NPK 15-15-15", "Urea", "DAP", "Zinc Sulfate"]
            },
            {
              id: 8,
              name: "Ceylon Agro Products",
              address: "321, Baseline Road, Colombo 09",
              contactPerson: "Mr. Pradeep Mendis",
              contactNumber: "+94 77 890 1234",
              email: "contact@ceylonagro.lk",
              categories: ["Calcium Nitrate", "Magnesium Sulfate", "Boron"]
            }
          ];
          setCompanies(sampleData);
          const allCategories = Array.from(
            new Set(sampleData.flatMap((company) => company.categories))
          );
          setCategories(allCategories);
          setTotalFertilizers(allCategories.length);
        }
      } catch (error) {
        console.error("Error fetching companies:", error);
        // Fallback to sample data on error
        const sampleData = [
          {
            id: 1,
            name: "AgriCorp International",
            address: "No. 45, Main Street, Colombo 03",
            contactPerson: "Mr. Kamal Silva",
            contactNumber: "+94 77 123 4567",
            email: "info@agricorp.lk",
            categories: ["Urea", "NPK 15-15-15", "Potassium Nitrate"]
          },
          {
            id: 2,
            name: "FarmSolutions Ltd",
            address: "258/A, Kandy Road, Peradeniya",
            contactPerson: "Mrs. Nimal Fernando",
            contactNumber: "+94 77 234 5678",
            email: "sales@farmsolutions.lk",
            categories: ["NPK 15-15-15", "Ammonium Sulfate", "Triple Super Phosphate"]
          },
          {
            id: 3,
            name: "EcoGrow Fertilizers",
            address: "123, Galle Road, Matara",
            contactPerson: "Mr. Sunil Perera",
            contactNumber: "+94 77 345 6789",
            email: "contact@ecogrow.lk",
            categories: ["Urea", "Calcium Nitrate", "Potassium Nitrate"]
          },
          {
            id: 4,
            name: "TeaGreen Specialists",
            address: "87/B, Nuwara Eliya Road, Hatton",
            contactPerson: "Ms. Sanduni Jayawardena",
            contactNumber: "+94 77 456 7890",
            email: "info@teagreen.lk",
            categories: ["NPK 15-15-15", "Urea", "Micronutrient Mix"]
          },
          {
            id: 5,
            name: "NutriSoil Systems",
            address: "456, Temple Road, Negombo",
            contactPerson: "Mr. Ravi Kumar",
            contactNumber: "+94 77 567 8901",
            email: "support@nutrisoil.lk",
            categories: ["Triple Super Phosphate", "Ammonium Sulfate", "Calcium Nitrate"]
          },
          {
            id: 6,
            name: "Green Valley Agro",
            address: "12/3, Hill Street, Badulla",
            contactPerson: "Mrs. Chamari Dissanayake",
            contactNumber: "+94 77 678 9012",
            email: "info@greenvalley.lk",
            categories: ["Urea", "NPK 20-20-20", "Potassium Sulfate"]
          },
          {
            id: 7,
            name: "Lanka Fertilizer Co.",
            address: "789, Industrial Estate, Ratmalana",
            contactPerson: "Mr. Asanka Bandara",
            contactNumber: "+94 77 789 0123",
            email: "sales@lankafertilizer.lk",
            categories: ["NPK 15-15-15", "Urea", "DAP", "Zinc Sulfate"]
          },
          {
            id: 8,
            name: "Ceylon Agro Products",
            address: "321, Baseline Road, Colombo 09",
            contactPerson: "Mr. Pradeep Mendis",
            contactNumber: "+94 77 890 1234",
            email: "contact@ceylonagro.lk",
            categories: ["Calcium Nitrate", "Magnesium Sulfate", "Boron"]
          }
        ];
        setCompanies(sampleData);
        const allCategories = Array.from(
          new Set(sampleData.flatMap((company) => company.categories))
        );
        setCategories(allCategories);
        setTotalFertilizers(allCategories.length);
      }
    };
    fetchCompanies();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50 to-gray-50 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Fertilizer Companies
          </h1>
          <p className="text-gray-600">View fertilizer suppliers and their product categories</p>
        </div>
      </div>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                Total Companies
              </h2>
              <p className="text-4xl font-bold text-[#165E52]">
                {companies.length}
              </p>
            </div>
            <div className="w-16 h-16 bg-gradient-to-br from-[#165E52] to-[#1a7566] rounded-2xl flex items-center justify-center shadow-lg">
              <Plus className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                Total Fertilizer Types
              </h2>
              <p className="text-4xl font-bold text-[#165E52]">
                {totalFertilizers}
              </p>
            </div>
            <div className="w-16 h-16 bg-gradient-to-br from-[#165E52] to-[#1a7566] rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-2xl font-bold text-white">#</span>
            </div>
          </div>
        </div>
      </div>
      {/* Companies Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Company Details
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Contact Person
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Contact Info
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Categories
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {companies.map((company) => (
                <tr key={company.id} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-[#165E52] to-[#1a7566] flex items-center justify-center">
                          <span className="text-white font-bold text-sm">
                            {company.name.charAt(0)}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-semibold text-gray-900">
                          {company.name}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <span className="inline-block w-1 h-1 bg-gray-400 rounded-full"></span>
                          {company.address}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{company.contactPerson}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{company.contactNumber}</div>
                    <div className="text-sm text-gray-500">{company.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1.5">
                      {company.categories.slice(0, 3).map((category, index) => (
                        <span
                          key={index}
                          className="px-2.5 py-1 text-xs font-medium rounded-full bg-gradient-to-r from-[#165E52] to-[#1a7566] text-white"
                        >
                          {category}
                        </span>
                      ))}
                      {company.categories.length > 3 && (
                        <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
                          +{company.categories.length - 3} more
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {companies.length === 0 && (
                <tr>
                  <td
                    colSpan="4"
                    className="px-6 py-12 text-center"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <Plus className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500 font-medium mb-2">No companies found</p>
                      <p className="text-sm text-gray-400">No companies available</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FertilizerCompany;