import React, { useState } from 'react';
import { DollarSign, Users, Calendar, CreditCard, CheckCircle, XCircle, Download, FileText, AlertCircle, TrendingUp, Clock, Search, Filter } from 'lucide-react';
import jsPDF from 'jspdf';

const SimplePaymentSystem = () => {
  const [activeTab, setActiveTab] = useState('process');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [processing, setProcessing] = useState(false);
  const [showReceipt, setShowReceipt] = useState(null);

  // Sample supplier data
  const suppliers = [
    { 
      id: 'SUP001', 
      name: 'Kumar Silva', 
      route: 'Route A', 
      weight: 150.5, 
      rate: 125, 
      advance: 5000, 
      loan: 2000,
      status: 'pending',
      bankAccount: '1234567890',
      paymentMethod: 'bank'
    },
    { 
      id: 'SUP002', 
      name: 'Nimal Perera', 
      route: 'Route B', 
      weight: 200.0, 
      rate: 125, 
      advance: 3000, 
      loan: 0,
      status: 'pending',
      bankAccount: '0987654321',
      paymentMethod: 'bank'
    },
    { 
      id: 'SUP003', 
      name: 'Sandya Fernando', 
      route: 'Route A', 
      weight: 175.8, 
      rate: 125, 
      advance: 4500, 
      loan: 1500,
      status: 'pending',
      bankAccount: '5555666677',
      paymentMethod: 'cash'
    },
    { 
      id: 'SUP004', 
      name: 'Kamal Wickrama', 
      route: 'Route C', 
      weight: 220.3, 
      rate: 125, 
      advance: 6000, 
      loan: 3000,
      status: 'completed',
      bankAccount: '9988776655',
      paymentMethod: 'bank'
    },
    { 
      id: 'SUP005', 
      name: 'Chamari Dias', 
      route: 'Route B', 
      weight: 185.7, 
      rate: 125, 
      advance: 3500, 
      loan: 500,
      status: 'completed',
      bankAccount: '1122334455',
      paymentMethod: 'cheque'
    },
  ];

  const [paymentData, setPaymentData] = useState(suppliers);

  // Calculate payment details
  const calculatePayment = (supplier) => {
    const grossAmount = supplier.weight * supplier.rate;
    const totalDeductions = supplier.advance + supplier.loan;
    const netPayment = grossAmount - totalDeductions;
    
    return {
      grossAmount,
      totalDeductions,
      netPayment,
      advanceDeduction: supplier.advance,
      loanDeduction: supplier.loan
    };
  };

  // Process payment
  const processPayment = (supplierId) => {
    setProcessing(true);
    setTimeout(() => {
      setPaymentData(prev => 
        prev.map(supplier => 
          supplier.id === supplierId 
            ? { ...supplier, status: 'completed', paymentDate: new Date().toISOString() }
            : supplier
        )
      );
      setProcessing(false);
      alert('Payment processed successfully!');
    }, 1500);
  };

  // Process bulk payments
  const processBulkPayments = () => {
    setProcessing(true);
    setTimeout(() => {
      setPaymentData(prev => 
        prev.map(supplier => 
          supplier.status === 'pending'
            ? { ...supplier, status: 'completed', paymentDate: new Date().toISOString() }
            : supplier
        )
      );
      setProcessing(false);
      alert('All pending payments processed successfully!');
    }, 2000);
  };

  // Generate PDF receipt
  const generateReceipt = (supplier) => {
    const payment = calculatePayment(supplier);
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    let yPos = 20;

    // Header
    doc.setFillColor(34, 197, 94);
    doc.rect(0, 0, pageWidth, 35, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text('Payment Receipt', pageWidth / 2, 15, { align: 'center' });
    doc.setFontSize(10);
    doc.text('Tea Factory Management System', pageWidth / 2, 25, { align: 'center' });

    yPos = 45;

    // Receipt Information
    doc.setTextColor(0, 0, 0);
    doc.setFillColor(248, 250, 252);
    doc.rect(14, yPos, pageWidth - 28, 30, 'F');
    
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text('Receipt No:', 18, yPos + 8);
    doc.setFont(undefined, 'normal');
    doc.text(`PAY-${supplier.id}-${Date.now()}`, 55, yPos + 8);

    doc.setFont(undefined, 'bold');
    doc.text('Date:', 18, yPos + 16);
    doc.setFont(undefined, 'normal');
    doc.text(new Date().toLocaleDateString(), 55, yPos + 16);

    doc.setFont(undefined, 'bold');
    doc.text('Payment Method:', 18, yPos + 24);
    doc.setFont(undefined, 'normal');
    doc.text(supplier.paymentMethod.toUpperCase(), 55, yPos + 24);

    yPos += 40;

    // Supplier Details
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Supplier Information', 14, yPos);
    yPos += 8;

    doc.setFillColor(240, 253, 244);
    doc.rect(14, yPos, pageWidth - 28, 35, 'F');

    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text('Supplier ID:', 18, yPos + 8);
    doc.setFont(undefined, 'normal');
    doc.text(supplier.id, 55, yPos + 8);

    doc.setFont(undefined, 'bold');
    doc.text('Supplier Name:', 18, yPos + 16);
    doc.setFont(undefined, 'normal');
    doc.text(supplier.name, 55, yPos + 16);

    doc.setFont(undefined, 'bold');
    doc.text('Route:', 18, yPos + 24);
    doc.setFont(undefined, 'normal');
    doc.text(supplier.route, 55, yPos + 24);

    if (supplier.bankAccount) {
      doc.setFont(undefined, 'bold');
      doc.text('Bank Account:', pageWidth / 2 + 10, yPos + 16);
      doc.setFont(undefined, 'normal');
      doc.text(supplier.bankAccount, pageWidth / 2 + 45, yPos + 16);
    }

    yPos += 45;

    // Payment Calculation
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Payment Calculation', 14, yPos);
    yPos += 8;

    doc.setFillColor(254, 249, 195);
    doc.rect(14, yPos, pageWidth - 28, 45, 'F');

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text('Tea Leaf Weight:', 18, yPos + 8);
    doc.text(`${supplier.weight} kg`, pageWidth - 60, yPos + 8);

    doc.text('Rate per kg:', 18, yPos + 16);
    doc.text(`Rs ${supplier.rate.toFixed(2)}`, pageWidth - 60, yPos + 16);

    doc.setFont(undefined, 'bold');
    doc.text('Gross Amount:', 18, yPos + 24);
    doc.text(`Rs ${payment.grossAmount.toFixed(2)}`, pageWidth - 60, yPos + 24);

    doc.setFont(undefined, 'normal');
    doc.text('Less: Advance:', 18, yPos + 32);
    doc.text(`Rs ${payment.advanceDeduction.toFixed(2)}`, pageWidth - 60, yPos + 32);

    doc.text('Less: Loan:', 18, yPos + 40);
    doc.text(`Rs ${payment.loanDeduction.toFixed(2)}`, pageWidth - 60, yPos + 40);

    yPos += 55;

    // Net Payment
    doc.setFillColor(34, 197, 94);
    doc.rect(14, yPos, pageWidth - 28, 15, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('NET PAYMENT:', 18, yPos + 10);
    doc.text(`Rs ${payment.netPayment.toFixed(2)}`, pageWidth - 60, yPos + 10);

    yPos += 25;

    // Notes
    doc.setTextColor(0, 0, 0);
    doc.setFillColor(240, 249, 255);
    doc.rect(14, yPos, pageWidth - 28, 25, 'F');
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text('Notes:', 18, yPos + 8);
    doc.setFont(undefined, 'normal');
    doc.text('This is a computer-generated receipt. No signature required.', 18, yPos + 15);
    doc.text('For queries, contact the payment department.', 18, yPos + 21);

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text('Generated on: ' + new Date().toLocaleString(), pageWidth / 2, doc.internal.pageSize.height - 10, { align: 'center' });

    doc.save(`Payment_Receipt_${supplier.id}_${Date.now()}.pdf`);
  };

  // Generate summary report
  const generateSummaryReport = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    let yPos = 20;

    // Header
    doc.setFillColor(59, 130, 246);
    doc.rect(0, 0, pageWidth, 35, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text('Payment Summary Report', pageWidth / 2, 15, { align: 'center' });
    doc.setFontSize(10);
    doc.text(`Period: ${new Date().toLocaleDateString()}`, pageWidth / 2, 25, { align: 'center' });

    yPos = 45;

    // Summary Statistics
    const totalSuppliers = paymentData.length;
    const completedPayments = paymentData.filter(s => s.status === 'completed').length;
    const pendingPayments = paymentData.filter(s => s.status === 'pending').length;
    
    const totalGross = paymentData.reduce((sum, s) => sum + calculatePayment(s).grossAmount, 0);
    const totalDeductions = paymentData.reduce((sum, s) => sum + calculatePayment(s).totalDeductions, 0);
    const totalNet = paymentData.reduce((sum, s) => sum + calculatePayment(s).netPayment, 0);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Summary Statistics', 14, yPos);
    yPos += 10;

    doc.setFillColor(240, 240, 240);
    doc.rect(14, yPos, pageWidth - 28, 40, 'F');

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Total Suppliers: ${totalSuppliers}`, 18, yPos + 8);
    doc.text(`Completed: ${completedPayments}`, 18, yPos + 16);
    doc.text(`Pending: ${pendingPayments}`, 18, yPos + 24);
    doc.text(`Completion Rate: ${((completedPayments/totalSuppliers)*100).toFixed(1)}%`, 18, yPos + 32);

    yPos += 50;

    // Financial Summary
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Financial Summary', 14, yPos);
    yPos += 10;

    doc.setFillColor(220, 252, 231);
    doc.rect(14, yPos, pageWidth - 28, 30, 'F');

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text('Total Gross Amount:', 18, yPos + 8);
    doc.text(`Rs ${totalGross.toFixed(2)}`, pageWidth - 60, yPos + 8);

    doc.text('Total Deductions:', 18, yPos + 16);
    doc.text(`Rs ${totalDeductions.toFixed(2)}`, pageWidth - 60, yPos + 16);

    doc.setFont(undefined, 'bold');
    doc.text('Total Net Payment:', 18, yPos + 24);
    doc.text(`Rs ${totalNet.toFixed(2)}`, pageWidth - 60, yPos + 24);

    yPos += 40;

    // Supplier Details Table
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Supplier Details', 14, yPos);
    yPos += 8;

    doc.setFontSize(8);
    doc.setFont(undefined, 'bold');
    doc.text('ID', 14, yPos);
    doc.text('Name', 35, yPos);
    doc.text('Weight(kg)', 90, yPos);
    doc.text('Gross', 125, yPos);
    doc.text('Deductions', 155, yPos);
    doc.text('Net', 185, yPos);
    yPos += 5;

    doc.setFont(undefined, 'normal');
    paymentData.forEach((supplier, index) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }

      const payment = calculatePayment(supplier);
      
      doc.text(supplier.id, 14, yPos);
      doc.text(supplier.name.substring(0, 20), 35, yPos);
      doc.text(supplier.weight.toString(), 90, yPos);
      doc.text(payment.grossAmount.toFixed(0), 125, yPos);
      doc.text(payment.totalDeductions.toFixed(0), 155, yPos);
      doc.text(payment.netPayment.toFixed(0), 185, yPos);
      
      yPos += 5;
    });

    doc.save(`Payment_Summary_${Date.now()}.pdf`);
  };

  // Filter suppliers
  const filteredSuppliers = paymentData.filter(supplier => {
    const matchesSearch = supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || supplier.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Calculate statistics
  const stats = {
    totalSuppliers: paymentData.length,
    pendingPayments: paymentData.filter(s => s.status === 'pending').length,
    completedPayments: paymentData.filter(s => s.status === 'completed').length,
    totalAmount: paymentData.reduce((sum, s) => sum + calculatePayment(s).netPayment, 0)
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-lg">
                <DollarSign className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Simple Payment System</h1>
                <p className="text-gray-600 mt-1">Automated payment processing and management</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={generateSummaryReport}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-md"
              >
                <FileText className="w-5 h-5" />
                Summary Report
              </button>
              {stats.pendingPayments > 0 && (
                <button
                  onClick={processBulkPayments}
                  disabled={processing}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-md disabled:opacity-50"
                >
                  <CheckCircle className="w-5 h-5" />
                  Process All ({stats.pendingPayments})
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 text-blue-600" />
              <span className="text-2xl font-bold text-blue-600">{stats.totalSuppliers}</span>
            </div>
            <p className="text-gray-600 font-medium">Total Suppliers</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-8 h-8 text-orange-600" />
              <span className="text-2xl font-bold text-orange-600">{stats.pendingPayments}</span>
            </div>
            <p className="text-gray-600 font-medium">Pending Payments</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <span className="text-2xl font-bold text-green-600">{stats.completedPayments}</span>
            </div>
            <p className="text-gray-600 font-medium">Completed</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-purple-600" />
              <span className="text-2xl font-bold text-purple-600">
                Rs {(stats.totalAmount / 1000).toFixed(0)}K
              </span>
            </div>
            <p className="text-gray-600 font-medium">Total Amount</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <Filter className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Suppliers Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Supplier
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Route
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Weight (kg)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gross Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Deductions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Net Payment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSuppliers.map((supplier) => {
                  const payment = calculatePayment(supplier);
                  return (
                    <tr key={supplier.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{supplier.name}</div>
                          <div className="text-sm text-gray-500">{supplier.id}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {supplier.route}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {supplier.weight} kg
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Rs {payment.grossAmount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                        Rs {payment.totalDeductions.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">
                        Rs {payment.netPayment.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {supplier.status === 'completed' ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Completed
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                            <Clock className="w-4 h-4 mr-1" />
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {supplier.status === 'pending' && (
                            <button
                              onClick={() => processPayment(supplier.id)}
                              disabled={processing}
                              className="text-green-600 hover:text-green-900 p-2 hover:bg-green-50 rounded transition-colors"
                              title="Process Payment"
                            >
                              <CreditCard className="w-5 h-5" />
                            </button>
                          )}
                          <button
                            onClick={() => generateReceipt(supplier)}
                            className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded transition-colors"
                            title="Download Receipt"
                          >
                            <Download className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredSuppliers.length === 0 && (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No suppliers found matching your criteria</p>
            </div>
          )}
        </div>

        {/* Processing Indicator */}
        {processing && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-sm w-full mx-4">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-lg font-semibold text-gray-800">Processing Payment...</p>
                <p className="text-sm text-gray-600 mt-2">Please wait</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SimplePaymentSystem;
