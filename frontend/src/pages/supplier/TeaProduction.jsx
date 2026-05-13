import React, { useState, useEffect } from 'react';
import axios from '../../api/axios';
import { Package, Calendar, Scale, Droplets, Leaf } from 'lucide-react';

export default function TeaProduction() {
  const [loading, setLoading] = useState(true);
  const [supplierId, setSupplierId] = useState(null);
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    fetchProductionData();
  }, []);

  const fetchProductionData = async () => {
    try {
      setLoading(true);
      const profileRes = await axios.get('/suppliers/me');
      if (profileRes.data.success && profileRes.data.data) {
        const id = profileRes.data.data._id;
        setSupplierId(id);

        const entriesRes = await axios.get(`/tea-leaf-entries/supplier/${id}`);
        if (entriesRes.data.success) {
          setEntries(entriesRes.data.content || entriesRes.data.data || entriesRes.data);
        }
      }
    } catch (error) {
      console.error('Error fetching production data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#104137]"></div>
      </div>
    );
  }

  if (!supplierId) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">Profile Not Found</h2>
          <p className="text-gray-600 mt-2">Your account is not linked to a supplier profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tea Production History</h1>
          <p className="text-gray-500 mt-1">Review your supplied green leaf entries.</p>
        </div>
        <div className="p-3 bg-green-100 text-[#104137] rounded-lg">
          <Package size={28} />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">Recent Deliveries</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm">
                <th className="p-4 border-b font-medium">Date</th>
                <th className="p-4 border-b font-medium">Gross Weight</th>
                <th className="p-4 border-b font-medium">Water Ded.</th>
                <th className="p-4 border-b font-medium">Coarse Ded.</th>
                <th className="p-4 border-b font-medium text-right">Net Weight</th>
              </tr>
            </thead>
            <tbody>
              {entries.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500">
                    No production records found.
                  </td>
                </tr>
              ) : (
                entries.map((entry, index) => (
                  <tr key={entry._id || index} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-gray-800">
                      <div className="flex items-center space-x-2">
                        <Calendar size={16} className="text-gray-400" />
                        <span>{new Date(entry.date).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="p-4 text-gray-800">
                      <div className="flex items-center space-x-2">
                        <Scale size={16} className="text-gray-400" />
                        <span>{entry.weight} kg</span>
                      </div>
                    </td>
                    <td className="p-4 text-red-600">
                      <div className="flex items-center space-x-2">
                        <Droplets size={16} />
                        <span>-{entry.waterWeight || 0} kg</span>
                      </div>
                    </td>
                    <td className="p-4 text-red-600">
                      <div className="flex items-center space-x-2">
                        <Leaf size={16} />
                        <span>-{entry.coarseLeafWeight || 0} kg</span>
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-[#104137] text-right">
                      {entry.netWeight} kg
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
