import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  ArrowLeft,
  Download,
  Eye,
  Trash,
  Search,
  Filter,
  Calendar,
  CheckCircle,
  AlertCircle,
  Plus,
  Loader,
  Save,
  RotateCcw
} from 'lucide-react';
import jsPDF from 'jspdf';
import { useAuth } from '../contexts/AuthContext';
import * as teaFlavorQualityAPI from '../api/teaFlavorQuality';

const TeaFlavorQualityCalculator = () => {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState('calculator');
  const [teaFlavors, setTeaFlavors] = useState([]);
  const [loading, setLoading] = useState(false);

  // Calculator form data
  const [formData, setFormData] = useState({
    teaFlavor: '',
    particleSize: '',
    moistureContent: '',
    colorValue: '',
    aromaPower: '',
    tasteStrength: '',
    solubility: '',
    caffeineContent: '',
    powderFineness: '',
    batchWeight: '',
    notes: ''
  });

  // Results
  const [results, setResults] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // History
  const [allCalculations, setAllCalculations] = useState([]);
  const [filteredCalculations, setFilteredCalculations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGrade, setFilterGrade] = useState('all');
  const [selectedCalculation, setSelectedCalculation] = useState(null);

  // Statistics
  const [statistics, setStatistics] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // Load tea flavors
  useEffect(() => {
    const loadTeaFlavors = async () => {
      try {
        console.log('📋 Loading tea flavors...');
        const response = await teaFlavorQualityAPI.getTeaFlavorsList();
        if (response.success) {
          setTeaFlavors(response.data);
          console.log('✅ Tea flavors loaded:', response.data.length);
        }
      } catch (error) {
        console.error('❌ Error loading tea flavors:', error);
      }
    };

    loadTeaFlavors();
  }, []);

  // Load calculations and statistics
  useEffect(() => {
    if (currentView === 'history') {
      fetchCalculations();
    } else if (currentView === 'statistics') {
      fetchStatistics();
    }
  }, [currentView]);

  // Fetch calculations
  const fetchCalculations = async () => {
    try {
      setLoading(true);
      console.log('📊 Fetching calculations...');
      const response = await teaFlavorQualityAPI.getAllCalculations({ limit: 50 });
      if (response.success) {
        setAllCalculations(response.data);
        filterCalculations(response.data);
        console.log('✅ Calculations loaded:', response.data.length);
      }
    } catch (error) {
      console.error('❌ Error fetching calculations:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter calculations
  const filterCalculations = (data) => {
    let filtered = data;

    if (filterGrade !== 'all') {
      filtered = filtered.filter(calc => calc.grade === filterGrade);
    }

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(calc =>
        calc._id.toLowerCase().includes(search) ||
        calc.teaFlavor.label.toLowerCase().includes(search) ||
        calc.grade.toLowerCase().includes(search)
      );
    }

    setFilteredCalculations(filtered);
  };

  // Fetch statistics
  const fetchStatistics = async () => {
    try {
      setStatsLoading(true);
      console.log('📈 Fetching statistics...');
      const response = await teaFlavorQualityAPI.getStatistics(30);
      if (response.success) {
        setStatistics(response.data);
        console.log('✅ Statistics loaded');
      }
    } catch (error) {
      console.error('❌ Error fetching statistics:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Calculate quality
  const calculateQuality = () => {
    const flavor = teaFlavors.find(t => t.value === formData.teaFlavor);
    if (!flavor) {
      alert('Please select a tea flavor');
      return;
    }

    const standards = flavor.standards;
    let qualityScore = 0;
    let maxScore = 0;
    const parameterResults = [];

    const parameters = [
      { name: 'Particle Size', value: parseFloat(formData.particleSize), range: standards.particleSize, unit: 'mesh', weight: 12 },
      { name: 'Moisture Content', value: parseFloat(formData.moistureContent), range: standards.moisture, unit: '%', weight: 15 },
      { name: 'Color Value', value: parseFloat(formData.colorValue), range: standards.color, unit: 'L*', weight: 10 },
      { name: 'Aroma Power', value: parseFloat(formData.aromaPower), range: standards.aroma, unit: '/10', weight: 15 },
      { name: 'Taste Strength', value: parseFloat(formData.tasteStrength), range: standards.taste, unit: '/10', weight: 15 },
      { name: 'Solubility', value: parseFloat(formData.solubility), range: standards.solubility, unit: '%', weight: 13 },
      { name: 'Caffeine Content', value: parseFloat(formData.caffeineContent), range: standards.caffeine, unit: '%', weight: 10 },
      { name: 'Powder Fineness', value: parseFloat(formData.powderFineness), range: standards.fineness, unit: '%', weight: 10 }
    ];

    parameters.forEach(param => {
      maxScore += param.weight;
      const isInRange = param.value >= param.range[0] && param.value <= param.range[1];

      if (isInRange) {
        qualityScore += param.weight;
        parameterResults.push({
          name: param.name,
          value: param.value,
          unit: param.unit,
          range: param.range,
          status: 'pass',
          score: param.weight
        });
      } else {
        const deviation = Math.min(
          Math.abs(param.value - param.range[0]),
          Math.abs(param.value - param.range[1])
        );
        const rangeSize = param.range[1] - param.range[0];
        const partialScore = Math.max(0, param.weight * (1 - (deviation / rangeSize)));

        qualityScore += partialScore;
        parameterResults.push({
          name: param.name,
          value: param.value,
          unit: param.unit,
          range: param.range,
          status: 'fail',
          score: partialScore
        });
      }
    });

    const qualityPercentage = (qualityScore / maxScore) * 100;

    let grade, gradeLabel, priceMultiplier, qualityStatus;

    if (qualityPercentage >= 95) {
      grade = 'A+';
      gradeLabel = 'Premium Grade';
      priceMultiplier = 1.35;
      qualityStatus = 'Exceptional Quality';
    } else if (qualityPercentage >= 90) {
      grade = 'A';
      gradeLabel = 'Superior Grade';
      priceMultiplier = 1.25;
      qualityStatus = 'Excellent Quality';
    } else if (qualityPercentage >= 85) {
      grade = 'A-';
      gradeLabel = 'High Grade';
      priceMultiplier = 1.15;
      qualityStatus = 'Very Good Quality';
    } else if (qualityPercentage >= 80) {
      grade = 'B+';
      gradeLabel = 'Good Grade';
      priceMultiplier = 1.05;
      qualityStatus = 'Good Quality';
    } else if (qualityPercentage >= 75) {
      grade = 'B';
      gradeLabel = 'Standard Grade';
      priceMultiplier = 1.0;
      qualityStatus = 'Standard Quality';
    } else if (qualityPercentage >= 70) {
      grade = 'B-';
      gradeLabel = 'Commercial Grade';
      priceMultiplier = 0.9;
      qualityStatus = 'Acceptable Quality';
    } else if (qualityPercentage >= 60) {
      grade = 'C';
      gradeLabel = 'Low Grade';
      priceMultiplier = 0.75;
      qualityStatus = 'Below Standard';
    } else {
      grade = 'D';
      gradeLabel = 'Reject Grade';
      priceMultiplier = 0.5;
      qualityStatus = 'Poor Quality - Not Recommended';
    }

    const batchWeight = parseFloat(formData.batchWeight) || 0;
    const basePrice = flavor.basePrice;
    const adjustedPricePerKg = basePrice * priceMultiplier;
    const totalBatchValue = adjustedPricePerKg * batchWeight;
    const marketAvgPrice = basePrice;
    const priceDifference = adjustedPricePerKg - marketAvgPrice;
    const pricePercentDiff = ((priceDifference / marketAvgPrice) * 100).toFixed(1);

    setResults({
      flavorName: flavor.label,
      qualityScore: qualityPercentage,
      grade,
      gradeLabel,
      qualityStatus,
      priceMultiplier,
      basePrice,
      adjustedPricePerKg,
      totalBatchValue,
      batchWeight,
      marketAvgPrice,
      priceDifference,
      pricePercentDiff,
      parameterResults
    });
  };

  // Save calculation
  const saveCalculation = async () => {
    if (!results) {
      alert('Please calculate quality first');
      return;
    }

    try {
      setIsSaving(true);
      console.log('💾 Saving calculation...');
      const response = await teaFlavorQualityAPI.createCalculation({
        teaFlavor: formData.teaFlavor,
        particleSize: formData.particleSize,
        moistureContent: formData.moistureContent,
        colorValue: formData.colorValue,
        aromaPower: formData.aromaPower,
        tasteStrength: formData.tasteStrength,
        solubility: formData.solubility,
        caffeineContent: formData.caffeineContent,
        powderFineness: formData.powderFineness,
        batchWeight: formData.batchWeight,
        notes: formData.notes
      });

      if (response.success) {
        console.log('✅ Calculation saved successfully');
        alert('Calculation saved successfully!');
        clearForm();
        setResults(null);
      }
    } catch (error) {
      console.error('❌ Error saving calculation:', error);
      alert('Error saving calculation: ' + error.response?.data?.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Clear form
  const clearForm = () => {
    setFormData({
      teaFlavor: '',
      particleSize: '',
      moistureContent: '',
      colorValue: '',
      aromaPower: '',
      tasteStrength: '',
      solubility: '',
      caffeineContent: '',
      powderFineness: '',
      batchWeight: '',
      notes: ''
    });
    setResults(null);
  };

  // Delete calculation
  const handleDeleteCalculation = async (id) => {
    if (!window.confirm('Are you sure you want to delete this calculation?')) return;

    try {
      console.log('🗑️ Deleting calculation...');
      const response = await teaFlavorQualityAPI.deleteCalculation(id);
      if (response.success) {
        console.log('✅ Calculation deleted');
        await fetchCalculations();
      }
    } catch (error) {
      console.error('❌ Error deleting calculation:', error);
      alert('Error deleting calculation');
    }
  };

  // Download PDF
  const downloadPDF = (calculation) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    let yPos = 20;

    // Header
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('Tea Flavor Quality Assessment Report', pageWidth / 2, yPos, { align: 'center' });

    yPos += 15;
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');

    // Report info
    doc.text(`Report ID: ${calculation._id}`, 14, yPos);
    yPos += 7;
    doc.text(`Tea Flavor: ${calculation.teaFlavor.label}`, 14, yPos);
    yPos += 7;
    doc.text(`Date: ${new Date(calculation.createdAt).toLocaleDateString()}`, 14, yPos);
    yPos += 7;
    doc.text(`Grade: ${calculation.grade} - ${calculation.gradeLabel}`, 14, yPos);
    yPos += 10;

    // Quality Score Box
    doc.setFillColor(76, 175, 80);
    doc.rect(14, yPos, pageWidth - 28, 15, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont(undefined, 'bold');
    doc.text(`Quality Score: ${calculation.qualityScore.toFixed(2)}%`, pageWidth / 2, yPos + 10, { align: 'center' });
    yPos += 20;

    // Parameters
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, 'bold');
    doc.text('Quality Parameters:', 14, yPos);
    yPos += 8;

    doc.setFontSize(8);
    doc.setFont(undefined, 'normal');
    calculation.parameterResults.forEach((param, index) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      const status = param.status === 'pass' ? '✓' : '✗';
      doc.text(`${index + 1}. ${param.name}: ${param.value} ${param.unit} (${param.range[0]}-${param.range[1]}) ${status}`, 14, yPos);
      yPos += 5;
    });

    yPos += 8;

    // Pricing
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text('Pricing Information:', 14, yPos);
    yPos += 7;

    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    doc.text(`Base Price: Rs ${calculation.pricing.basePrice.toLocaleString()}/kg`, 14, yPos);
    yPos += 5;
    doc.text(`Price Multiplier: ${calculation.priceMultiplier.toFixed(2)}x`, 14, yPos);
    yPos += 5;
    doc.text(`Adjusted Price: Rs ${calculation.pricing.adjustedPricePerKg.toLocaleString()}/kg`, 14, yPos);
    yPos += 5;
    doc.text(`Batch Weight: ${calculation.batchWeight} kg`, 14, yPos);
    yPos += 5;
    doc.text(`Total Batch Value: Rs ${calculation.pricing.totalBatchValue.toLocaleString()}`, 14, yPos);
    yPos += 5;
    doc.text(`Price Difference: ${calculation.pricing.pricePercentDiff}%`, 14, yPos);

    // Notes
    if (calculation.notes) {
      yPos += 10;
      doc.setFont(undefined, 'bold');
      doc.text('Notes:', 14, yPos);
      yPos += 5;
      doc.setFont(undefined, 'normal');
      const notesLines = doc.splitTextToSize(calculation.notes, pageWidth - 28);
      notesLines.forEach(line => {
        doc.text(line, 14, yPos);
        yPos += 4;
      });
    }

    doc.save(`tea-quality-report-${calculation._id}.pdf`);
  };

  // ========== MAIN RENDER ==========
  return (
    <div className="w-full">
      {/* CALCULATOR VIEW */}
      {currentView === 'calculator' && (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="text-4xl font-bold text-gray-900 mb-2">Quality & Price Calculator</h2>
                <p className="text-gray-600">Assess quality parameters and calculate optimal pricing</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentView('history')}
                  className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-2"
                >
                  <BarChart3 className="w-4 h-4" />
                  History
                </button>
                <button
                  onClick={() => setCurrentView('statistics')}
                  className="px-4 py-2 rounded bg-purple-600 hover:bg-purple-700 text-white font-semibold flex items-center gap-2"
                >
                  <TrendingUp className="w-4 h-4" />
                  Statistics
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Form */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Quality Parameters</h2>

              <div className="space-y-4">
                {/* Tea Flavor */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Tea Flavor Type *</label>
                  <select
                    name="teaFlavor"
                    value={formData.teaFlavor}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="">Select Tea Flavor</option>
                    {teaFlavors.map(flavor => (
                      <option key={flavor.value} value={flavor.value}>
                        {flavor.label} - Base: Rs {flavor.basePrice.toLocaleString()}/kg
                      </option>
                    ))}
                  </select>
                </div>

                {/* Quality Parameters Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Particle Size (mesh) *</label>
                    <input
                      type="number"
                      name="particleSize"
                      value={formData.particleSize}
                      onChange={handleInputChange}
                      placeholder="e.g., 100"
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Moisture (%)*</label>
                    <input
                      type="number"
                      name="moistureContent"
                      value={formData.moistureContent}
                      onChange={handleInputChange}
                      placeholder="e.g., 4"
                      step="0.1"
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Color Value (L*) *</label>
                    <input
                      type="number"
                      name="colorValue"
                      value={formData.colorValue}
                      onChange={handleInputChange}
                      placeholder="e.g., 70"
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Aroma Power (/10) *</label>
                    <input
                      type="number"
                      name="aromaPower"
                      value={formData.aromaPower}
                      onChange={handleInputChange}
                      placeholder="e.g., 8.5"
                      step="0.1"
                      min="0"
                      max="10"
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Taste Strength (/10) *</label>
                    <input
                      type="number"
                      name="tasteStrength"
                      value={formData.tasteStrength}
                      onChange={handleInputChange}
                      placeholder="e.g., 8.5"
                      step="0.1"
                      min="0"
                      max="10"
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Solubility (%) *</label>
                    <input
                      type="number"
                      name="solubility"
                      value={formData.solubility}
                      onChange={handleInputChange}
                      placeholder="e.g., 95"
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Caffeine (%) *</label>
                    <input
                      type="number"
                      name="caffeineContent"
                      value={formData.caffeineContent}
                      onChange={handleInputChange}
                      placeholder="e.g., 3.8"
                      step="0.1"
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Powder Fineness (%) *</label>
                    <input
                      type="number"
                      name="powderFineness"
                      value={formData.powderFineness}
                      onChange={handleInputChange}
                      placeholder="e.g., 92"
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>

                {/* Batch Weight */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Batch Weight (kg) *</label>
                  <input
                    type="number"
                    name="batchWeight"
                    value={formData.batchWeight}
                    onChange={handleInputChange}
                    placeholder="e.g., 100"
                    step="0.1"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Notes</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Additional notes..."
                    rows="3"
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={calculateQuality}
                    className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-semibold"
                  >
                    Calculate Quality
                  </button>
                  <button
                    onClick={clearForm}
                    className="px-6 py-3 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg transition-colors font-semibold flex items-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Clear
                  </button>
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Results</h2>

              {results ? (
                <div className="space-y-6">
                  {/* Grade Badge */}
                  <div className={`bg-gradient-to-r ${
                    results.grade.startsWith('A') ? 'from-green-400 to-emerald-500' :
                    results.grade.startsWith('B') ? 'from-blue-400 to-indigo-500' : 'from-yellow-400 to-orange-500'
                  } rounded-lg p-6 text-white`}>
                    <div className="text-center">
                      <p className="text-sm font-semibold opacity-90">Tea Grade</p>
                      <p className="text-5xl font-bold mb-2">{results.grade}</p>
                      <p className="text-lg font-semibold">{results.gradeLabel}</p>
                    </div>
                  </div>

                  {/* Quality Score */}
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-2">Quality Score</p>
                    <div className="flex items-baseline gap-2 mb-2">
                      <p className="text-4xl font-bold text-purple-600">{results.qualityScore.toFixed(1)}</p>
                      <p className="text-lg text-gray-600">%</p>
                    </div>
                    <div className="w-full bg-gray-300 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full"
                        style={{ width: `${results.qualityScore}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                    <p className="text-sm font-semibold text-blue-900">{results.qualityStatus}</p>
                  </div>

                  {/* Pricing */}
                  <div className="border-2 border-gray-200 rounded-lg p-4 space-y-3">
                    <h4 className="font-bold text-gray-800">Pricing Information</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Base Price</p>
                        <p className="font-semibold">Rs {results.basePrice.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Multiplier</p>
                        <p className="font-semibold">{results.priceMultiplier.toFixed(2)}x</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Adjusted Price/kg</p>
                        <p className="font-semibold">Rs {results.adjustedPricePerKg.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Total Batch Value</p>
                        <p className="font-bold text-green-600">Rs {results.totalBatchValue.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>

                  {/* Parameters Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="text-left px-3 py-2 font-semibold">Parameter</th>
                          <th className="text-center px-3 py-2 font-semibold">Value</th>
                          <th className="text-center px-3 py-2 font-semibold">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {results.parameterResults.map((param, idx) => (
                          <tr key={idx} className="border-t hover:bg-gray-50">
                            <td className="px-3 py-2">{param.name}</td>
                            <td className="text-center px-3 py-2">{param.value} {param.unit}</td>
                            <td className="text-center px-3 py-2">
                              {param.status === 'pass' ? (
                                <CheckCircle className="w-5 h-5 text-green-500 inline" />
                              ) : (
                                <AlertCircle className="w-5 h-5 text-orange-500 inline" />
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Save Button */}
                  <button
                    onClick={saveCalculation}
                    disabled={isSaving}
                    className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSaving ? <Loader className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    {isSaving ? 'Saving...' : 'Save Calculation'}
                  </button>
                </div>
              ) : (
                <div className="h-96 flex items-center justify-center text-gray-500 text-center">
                  <div>
                    <AlertCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p>Enter parameters and click "Calculate Quality" to see results</p>
                  </div>
                </div>
              )}
            </div>
            </div>
          </div>
        </div>
      )}

      {/* HISTORY VIEW */}
      {currentView === 'history' && (
        <div className="bg-gray-50 p-6 min-h-screen">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setCurrentView('calculator')}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-gray-700" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Calculation History</h1>
                <p className="text-gray-600">View and manage all quality assessments</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentView('calculator')}
                className="px-4 py-2 rounded bg-green-600 hover:bg-green-700 text-white font-semibold flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Calculator
              </button>
              <button
                onClick={() => setCurrentView('statistics')}
                className="px-4 py-2 rounded bg-purple-600 hover:bg-purple-700 text-white font-semibold flex items-center gap-2"
              >
                <TrendingUp className="w-4 h-4" />
                Statistics
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by ID, flavor, or grade..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    filterCalculations(allCalculations);
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div className="relative">
                <Filter className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <select
                  value={filterGrade}
                  onChange={(e) => {
                    setFilterGrade(e.target.value);
                    filterCalculations(allCalculations);
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 appearance-none"
                >
                  <option value="all">All Grades</option>
                  <option value="A+">A+ (Premium)</option>
                  <option value="A">A (Superior)</option>
                  <option value="A-">A- (High)</option>
                  <option value="B+">B+ (Good)</option>
                  <option value="B">B (Standard)</option>
                  <option value="B-">B- (Commercial)</option>
                  <option value="C">C (Low)</option>
                  <option value="D">D (Reject)</option>
                </select>
              </div>

              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="w-5 h-5" />
                <span className="text-sm">Showing {filteredCalculations.length} results</span>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-12 text-center">
                <Loader className="w-8 h-8 animate-spin mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">Loading calculations...</p>
              </div>
            ) : filteredCalculations.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Tea Flavor</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase">Quality Score</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase">Grade</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase">Price/kg</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Date</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredCalculations.map((calc) => (
                      <tr key={calc._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{calc._id.slice(-6).toUpperCase()}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{calc.teaFlavor.label}</td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center">
                            <span className="text-sm font-semibold">{calc.qualityScore.toFixed(1)}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`text-sm font-bold px-2 py-1 rounded ${
                            calc.grade.startsWith('A') ? 'bg-green-100 text-green-800' :
                            calc.grade.startsWith('B') ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'
                          }`}>
                            {calc.grade}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                          Rs {calc.pricing.adjustedPricePerKg.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(calc.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => setSelectedCalculation(calc)}
                              className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
                              title="View"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => downloadPDF(calc)}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              title="Download PDF"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteCalculation(calc._id)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="Delete"
                            >
                              <Trash className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center text-gray-500">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No calculations available yet</p>
            </div>
          )}
        </div>
      </div>
      )}

      {/* STATISTICS VIEW */}
      {currentView === 'statistics' && (
        <div className="bg-gray-50 p-6 min-h-screen">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Quality Assessment Statistics</h2>
                <p className="text-gray-600">Analysis of quality assessments over the last 30 days</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentView('calculator')}
                  className="px-4 py-2 rounded bg-green-600 hover:bg-green-700 text-white font-semibold flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Calculator
                </button>
                <button
                  onClick={() => setCurrentView('history')}
                  className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-2"
                >
                  <BarChart3 className="w-4 h-4" />
                  History
                </button>
              </div>
            </div>

          {statsLoading ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <Loader className="w-12 h-12 animate-spin mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">Loading statistics...</p>
              </div>
            </div>
          ) : statistics ? (
            <div className="space-y-6">
              {/* Stats Cards */}
              {statistics.dailyStats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <p className="text-gray-600 text-sm mb-2">Today's Assessments</p>
                    <p className="text-3xl font-bold text-green-600">{statistics.dailyStats.totalAssessments || 0}</p>
                  </div>
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <p className="text-gray-600 text-sm mb-2">Avg Quality Score</p>
                    <p className="text-3xl font-bold text-blue-600">{(statistics.dailyStats.avgQualityScore || 0).toFixed(1)}%</p>
                  </div>
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <p className="text-gray-600 text-sm mb-2">Premium Grades Today</p>
                    <p className="text-3xl font-bold text-purple-600">{statistics.dailyStats.premiumGrades || 0}</p>
                  </div>
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <p className="text-gray-600 text-sm mb-2">Avg Price/kg</p>
                    <p className="text-3xl font-bold text-orange-600">Rs {(statistics.dailyStats.avgPrice || 0).toLocaleString()}</p>
                  </div>
                </div>
              )}

              {/* Grade Distribution */}
              {statistics.gradeDistribution && statistics.gradeDistribution.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-6">Grade Distribution (Last 30 Days)</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {statistics.gradeDistribution.map((item) => (
                      <div key={item._id} className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold text-gray-800">{item._id}</p>
                        <p className="text-gray-600">{item.count} assessment{item.count !== 1 ? 's' : ''}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Statistics Table */}
              {statistics.statistics && statistics.statistics.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm p-6 overflow-x-auto">
                  <h3 className="text-xl font-bold text-gray-800 mb-6">Grade-wise Analysis</h3>
                  <table className="w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Grade</th>
                        <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Count</th>
                        <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Avg Quality Score</th>
                        <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Avg Price/kg</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {statistics.statistics.map((stat) => (
                        <tr key={stat._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 font-semibold text-gray-900">{stat._id}</td>
                          <td className="px-6 py-4 text-center text-gray-700">{stat.count}</td>
                          <td className="px-6 py-4 text-center text-gray-700">{(stat.avgQualityScore || 0).toFixed(1)}%</td>
                          <td className="px-6 py-4 text-right font-semibold text-gray-900">Rs {(stat.avgPrice || 0).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center text-gray-500">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No statistics available yet</p>
            </div>
          )}
        </div>
      </div>
      )}
    </div>
  );
};

export default TeaFlavorQualityCalculator;
