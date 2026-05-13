import React, { useState, useEffect } from 'react';
import axios from '../../api/axios';
import { Package, Calendar, CircleDollarSign, Sprout, Tag } from 'lucide-react';

export default function SupplierInventory() {
  const [loading, setLoading] = useState(true);
  const [supplierId, setSupplierId] = useState(null);
  const [advances, setAdvances] = useState([]);

  useEffect(() => {
    fetchInventoryData();
  }, []);

  const fetchInventoryData = async () => {
    try {
      setLoading(true);
      const profileRes = await axios.get('/suppliers/me');
      if (profileRes.data.success && profileRes.data.data) {
        const id = profileRes.data.data._id;
        setSupplierId(id);

        const advancesRes = await axios.get(`/advances/supplier/${id}`);
        if (advancesRes.data.success) {
          setAdvances(advancesRes.data.content || advancesRes.data.data || []);
        }
      }
    } catch (error) {
      console.error('Error fetching inventory data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'APPROVED':
        return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Approved</span>;
      case 'PENDING':
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">Pending</span>;
      case 'REJECTED':
        return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">Rejected</span>;
      default:
        return <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">{status}</span>;
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
          <h1 className="text-2xl font-bold text-gray-900">Inventory & Advances</h1>
          <p className="text-gray-500 mt-1">Review your issued fertilizer and cash advances.</p>
        </div>
        <div className="p-3 bg-green-100 text-[#104137] rounded-lg">
          <Package size={28} />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">Advance History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm">
                <th className="p-4 border-b font-medium">Date</th>
                <th className="p-4 border-b font-medium">Type</th>
                <th className="p-4 border-b font-medium">Amount / Quantity</th>
                <th className="p-4 border-b font-medium">Status</th>
                <th className="p-4 border-b font-medium text-right">Deducted Month</th>
              </tr>
            </thead>
            <tbody>
              {advances.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500">
                    No advances or inventory records found.
                  </td>
                </tr>
              ) : (
                advances.map((advance, index) => (
                  <tr key={advance._id || index} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-gray-800">
                      <div className="flex items-center space-x-2">
                        <Calendar size={16} className="text-gray-400" />
                        <span>{new Date(advance.requestedDate || advance.createdAt).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="p-4 text-gray-800">
                      <div className="flex items-center space-x-2">
                        {advance.advanceType === 'FERTILIZER' ? (
                          <Sprout size={16} className="text-green-600" />
                        ) : (
                          <CircleDollarSign size={16} className="text-blue-600" />
                        )}
                        <span className="capitalize">{(advance.advanceType || advance.type || 'Cash').toLowerCase()}</span>
                      </div>
                    </td>
                    <td className="p-4 text-gray-800 font-medium">
                      {advance.advanceType === 'FERTILIZER'
                        ? `${advance.amount || 0} Bags`
                        : `Rs. ${(advance.requestedAmount || advance.amount || 0).toLocaleString()}`
                      }
                    </td>
                    <td className="p-4">
                      {getStatusBadge(advance.status)}
                    </td>
                    <td className="p-4 text-right text-gray-600">
                      <div className="flex justify-end items-center space-x-2">
                        <Tag size={16} className="text-gray-400" />
                        <span>{advance.deductionMonth || 'Pending'}</span>
                      </div>
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
