import React, { useState, useEffect } from 'react';
import axios from '../../api/axios';
import { Settings, Calendar, DollarSign, CreditCard, Clock, FileText } from 'lucide-react';

export default function SupplierProcessing() {
  const [loading, setLoading] = useState(true);
  const [supplierId, setSupplierId] = useState(null);
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    fetchProcessingData();
  }, []);

  const fetchProcessingData = async () => {
    try {
      setLoading(true);
      const profileRes = await axios.get('/suppliers/me');
      if (profileRes.data.success && profileRes.data.data) {
        const id = profileRes.data.data._id;
        setSupplierId(id);

        const paymentsRes = await axios.get(`/payments/supplier/${id}`);
        if (paymentsRes.data.success) {
          setPayments(paymentsRes.data.content || paymentsRes.data.data || []);
        }
      }
    } catch (error) {
      console.error('Error fetching processing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Paid':
        return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Paid</span>;
      case 'Pending Approval':
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">Processing</span>;
      case 'Rejected':
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
          <h1 className="text-2xl font-bold text-gray-900">Payment Processing</h1>
          <p className="text-gray-500 mt-1">Review your payment statements and processing status.</p>
        </div>
        <div className="p-3 bg-green-100 text-[#104137] rounded-lg">
          <Settings size={28} />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">Payment History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm">
                <th className="p-4 border-b font-medium">Month / Period</th>
                <th className="p-4 border-b font-medium">Method</th>
                <th className="p-4 border-b font-medium">Deductions</th>
                <th className="p-4 border-b font-medium">Net Amount</th>
                <th className="p-4 border-b font-medium text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500">
                    No payment records found.
                  </td>
                </tr>
              ) : (
                payments.map((payment, index) => (
                  <tr key={payment._id || index} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-gray-800 font-medium">
                      <div className="flex items-center space-x-2">
                        <Calendar size={16} className="text-[#104137]" />
                        <span>
                          {payment.paymentPeriod
                            ? `${new Date(payment.paymentPeriod.year, payment.paymentPeriod.month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`
                            : payment.month ? `${payment.month} ${payment.year}` : new Date(payment.calculatedDate || payment.createdAt).toLocaleDateString()
                          }
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-gray-600">
                      <div className="flex items-center space-x-2">
                        <CreditCard size={16} />
                        <span>{payment.paymentMethod || 'Bank Transfer'}</span>
                      </div>
                    </td>
                    <td className="p-4 text-red-600">
                      <div className="flex items-center space-x-2">
                        <FileText size={16} />
                        <span>-Rs. {(payment.totalDeductions || 0).toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="p-4 font-bold text-[#104137]">
                      <div className="flex items-center space-x-2">
                        <DollarSign size={16} />
                        <span>Rs. {(payment.finalAmount || 0).toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      {getStatusBadge(payment.paymentStatus || payment.status)}
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
