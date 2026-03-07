import React from "react";
import { useNavigate } from "react-router-dom";

const PaymentManagerDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="payment-manager-dashboard p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Payment Manager Dashboard</h1>
      <div className="mb-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => navigate('/payment-manager/dashboard')}
          className="px-4 py-2 rounded-md text-sm font-medium bg-[#01251F] text-white"
        >
          Payment Manager Dashboard
        </button>
        <button
          type="button"
          onClick={() => navigate('/payment-manager/payments')}
          className="px-4 py-2 rounded-md text-sm font-medium bg-[#e1f4ef] text-[#165E52] hover:bg-[#cfece6]"
        >
          Payment Management
        </button>
      </div>
      <div className="dashboard-content">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          <div 
            className="dashboard-card bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => navigate('/payment-manager/advances')}
          >
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Advance Management</h3>
            <p className="text-gray-600">Manage advance payments and requests</p>
          </div>
          <div 
            className="dashboard-card bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => navigate('/payment-manager/loans')}
          >
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Loan Management</h3>
            <p className="text-gray-600">Handle loan applications and processing</p>
            <div className="mt-3 flex gap-2">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  navigate('/payment-manager/loans/active');
                }}
                className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-md hover:bg-green-200 transition-colors"
              >
                View Active Loans
              </button>
            </div>
          </div>
          <div 
            className="dashboard-card bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => navigate('/payment-manager/payments')}
          >
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Payment Processing</h3>
            <p className="text-gray-600">Process and manage payments</p>
          </div>
          <div 
            className="dashboard-card bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => navigate('/payment-manager/tea-rates')}
          >
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Tea Rate Management</h3>
            <p className="text-gray-600">Adjust and manage tea rates</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentManagerDashboard;
