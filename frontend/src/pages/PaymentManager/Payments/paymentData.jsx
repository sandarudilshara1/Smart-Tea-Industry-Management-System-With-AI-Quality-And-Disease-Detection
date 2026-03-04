// Dummy data for payment management

// Sample route data
export const routes = [
  {
    id: "R001",
    routeName: "Kandy Route",
    routeNumber: "KD-001",
    totalWeight: 4241.5, // Sum of total weights: SUP001(1250.5) + SUP002(890.2) + SUP003(2100.8)
    totalAmount: 328381.3, // Sum of gross amounts using net weight × rate: 95667.5 + 70105 + 162608.8
    supplierCount: 3, // Actual number of suppliers
    suppliers: ["SUP001", "SUP002", "SUP003"],
  },
  {
    id: "R002",
    routeName: "Matale Route",
    routeNumber: "MT-002",
    totalWeight: 2437.2, // Sum of total weights: SUP004(756.3) + SUP005(1680.9)
    totalAmount: 187741.65, // Sum of gross amounts using net weight × rate: 59901.6 + 127840.05
    supplierCount: 2, // Actual number of suppliers
    suppliers: ["SUP004", "SUP005"],
  },
  {
    id: "R003",
    routeName: "Nuwara Eliya Route",
    routeNumber: "NE-003",
    totalWeight: 0, // No suppliers defined
    totalAmount: 0, // No suppliers defined
    supplierCount: 0, // No suppliers defined
    suppliers: [],
  },
];

// Sample supplier data with detailed tea leaf entries
export const suppliers = [
  {
    id: "SUP001",
    supplierName: "John Farmer",
    routeId: "R001",
    totalWeight: 1250.5,
    bagWeight: 62.5, // ~5% of total weight (typical bag weight)
    waterWeight: 37.5, // ~3% of total weight (moisture deduction)
    coarseLeafWeight: 25.0, // ~2% of total weight (quality deduction)
    netWeight: 1250.5 - 62.5 - 37.5 - 25.0, // 1125.5 kg
    ratePerKg: 85.0,
    grossAmount: (1250.5 - 62.5 - 37.5 - 25.0) * 85.0, // Calculate using net weight × rate
    advances: 15000,
    fertilizer: 3500,
    transport: Math.round((1250.5 - 62.5 - 37.5 - 25.0) * 10), // Rs. 10 per kg of net weight
    others: 800,
    totalDeductions:
      15000 + 3500 + Math.round((1250.5 - 62.5 - 37.5 - 25.0) * 10) + 800,
    finalAmount:
      (1250.5 - 62.5 - 37.5 - 25.0) * 85.0 -
      (15000 + 3500 + Math.round((1250.5 - 62.5 - 37.5 - 25.0) * 10) + 800),
    paymentMethod: "Bank",
    status: "Paid",
    paidDate: "2025-06-25",
    paymentDate: "2025-06-30", // Add payment date for filtering
    upcomingPayments: {
      loanInstallment: 12500,
      fertilizerDue: 3200,
    },
    teaLeafEntries: [
      {
        date: "2025-06-01",
        weight: 125.5,
        quality: "A",
        rate: 85.0,
        amount: 10667.5,
      },
      {
        date: "2025-06-03",
        weight: 145.2,
        quality: "A",
        rate: 85.0,
        amount: 12342.0,
      },
      {
        date: "2025-06-05",
        weight: 135.8,
        quality: "B",
        rate: 82.0,
        amount: 11135.6,
      },
      {
        date: "2025-06-07",
        weight: 155.3,
        quality: "A",
        rate: 85.0,
        amount: 13200.5,
      },
      {
        date: "2025-06-10",
        weight: 142.7,
        quality: "A",
        rate: 85.0,
        amount: 12129.5,
      },
      {
        date: "2025-06-12",
        weight: 138.9,
        quality: "B",
        rate: 82.0,
        amount: 11390.8,
      },
      {
        date: "2025-06-15",
        weight: 148.6,
        quality: "A",
        rate: 85.0,
        amount: 12631.0,
      },
      {
        date: "2025-06-18",
        weight: 158.5,
        quality: "A",
        rate: 85.0,
        amount: 13472.5,
      },
      {
        date: "2025-06-20",
        weight: 100.0,
        quality: "C",
        rate: 78.0,
        amount: 7800.0,
      },
    ],
  },
  {
    id: "SUP002",
    supplierName: "Mary Silva",
    routeId: "R001",
    totalWeight: 890.2,
    bagWeight: 44.5, // ~5% of total weight
    waterWeight: 26.7, // ~3% of total weight
    coarseLeafWeight: 17.8, // ~2% of total weight
    netWeight: 890.2 - 44.5 - 26.7 - 17.8, // 801.2 kg
    ratePerKg: 87.5,
    grossAmount: (890.2 - 44.5 - 26.7 - 17.8) * 87.5, // Calculate using net weight × rate
    advances: 8000,
    fertilizer: 2200,
    transport: Math.round((890.2 - 44.5 - 26.7 - 17.8) * 10), // Rs. 10 per kg of net weight
    others: 500,
    totalDeductions:
      8000 + 2200 + Math.round((890.2 - 44.5 - 26.7 - 17.8) * 10) + 500,
    finalAmount:
      (890.2 - 44.5 - 26.7 - 17.8) * 87.5 -
      (8000 + 2200 + Math.round((890.2 - 44.5 - 26.7 - 17.8) * 10) + 500),
    paymentMethod: "Cash",
    status: "Pending",
    paidDate: null,
    paymentDate: "2025-06-30", // Add payment date for filtering
    upcomingPayments: {
      fertilizerDue: 5800,
    },
    teaLeafEntries: [
      {
        date: "2025-06-02",
        weight: 98.5,
        quality: "A",
        rate: 87.5,
        amount: 8618.75,
      },
      {
        date: "2025-06-04",
        weight: 112.3,
        quality: "A",
        rate: 87.5,
        amount: 9826.25,
      },
      {
        date: "2025-06-06",
        weight: 105.8,
        quality: "B",
        rate: 84.0,
        amount: 8887.2,
      },
      {
        date: "2025-06-09",
        weight: 125.4,
        quality: "A",
        rate: 87.5,
        amount: 10972.5,
      },
      {
        date: "2025-06-11",
        weight: 118.7,
        quality: "A",
        rate: 87.5,
        amount: 10386.25,
      },
      {
        date: "2025-06-14",
        weight: 108.9,
        quality: "B",
        rate: 84.0,
        amount: 9147.6,
      },
      {
        date: "2025-06-17",
        weight: 115.2,
        quality: "A",
        rate: 87.5,
        amount: 10080.0,
      },
      {
        date: "2025-06-19",
        weight: 105.4,
        quality: "A",
        rate: 87.5,
        amount: 9222.5,
      },
    ],
  },
  {
    id: "SUP003",
    supplierName: "David Perera",
    routeId: "R001",
    totalWeight: 2100.8,
    bagWeight: 105.0, // ~5% of total weight
    waterWeight: 63.0, // ~3% of total weight
    coarseLeafWeight: 42.0, // ~2% of total weight
    netWeight: 2100.8 - 105.0 - 63.0 - 42.0, // 1890.8 kg
    ratePerKg: 86.0,
    grossAmount: (2100.8 - 105.0 - 63.0 - 42.0) * 86.0, // Calculate using net weight × rate
    advances: 25000,
    fertilizer: 5500,
    transport: Math.round((2100.8 - 105.0 - 63.0 - 42.0) * 10), // Rs. 10 per kg of net weight
    others: 1200,
    totalDeductions:
      25000 + 5500 + Math.round((2100.8 - 105.0 - 63.0 - 42.0) * 10) + 1200,
    finalAmount:
      (2100.8 - 105.0 - 63.0 - 42.0) * 86.0 -
      (25000 + 5500 + Math.round((2100.8 - 105.0 - 63.0 - 42.0) * 10) + 1200),
    paymentMethod: "Bank",
    status: "Pending",
    paidDate: null,
    upcomingPayments: {
      loanInstallment: 18500,
      fertilizerDue: 7200,
    },
    teaLeafEntries: [
      {
        date: "2025-06-01",
        weight: 185.2,
        quality: "A",
        rate: 86.0,
        amount: 15927.2,
      },
      {
        date: "2025-06-03",
        weight: 198.5,
        quality: "A",
        rate: 86.0,
        amount: 17071.0,
      },
      {
        date: "2025-06-05",
        weight: 175.8,
        quality: "B",
        rate: 83.0,
        amount: 14591.4,
      },
      {
        date: "2025-06-08",
        weight: 205.3,
        quality: "A",
        rate: 86.0,
        amount: 17655.8,
      },
      {
        date: "2025-06-10",
        weight: 188.7,
        quality: "A",
        rate: 86.0,
        amount: 16228.2,
      },
      {
        date: "2025-06-12",
        weight: 195.4,
        quality: "A",
        rate: 86.0,
        amount: 16804.4,
      },
      {
        date: "2025-06-15",
        weight: 182.9,
        quality: "B",
        rate: 83.0,
        amount: 15180.7,
      },
      {
        date: "2025-06-17",
        weight: 201.6,
        quality: "A",
        rate: 86.0,
        amount: 17337.6,
      },
      {
        date: "2025-06-20",
        weight: 167.4,
        quality: "A",
        rate: 86.0,
        amount: 14396.4,
      },
    ],
  },
  {
    id: "SUP004",
    supplierName: "Sarah Fernando",
    routeId: "R002",
    totalWeight: 756.3,
    bagWeight: 37.8, // ~5% of total weight
    waterWeight: 22.7, // ~3% of total weight
    coarseLeafWeight: 15.1, // ~2% of total weight
    netWeight: 756.3 - 37.8 - 22.7 - 15.1, // 680.7 kg
    ratePerKg: 88.0,
    grossAmount: (756.3 - 37.8 - 22.7 - 15.1) * 88.0, // Calculate using net weight × rate
    advances: 12000,
    fertilizer: 1800,
    transport: Math.round((756.3 - 37.8 - 22.7 - 15.1) * 10), // Rs. 10 per kg of net weight
    others: 300,
    totalDeductions:
      12000 + 1800 + Math.round((756.3 - 37.8 - 22.7 - 15.1) * 10) + 300,
    finalAmount:
      (756.3 - 37.8 - 22.7 - 15.1) * 88.0 -
      (12000 + 1800 + Math.round((756.3 - 37.8 - 22.7 - 15.1) * 10) + 300),
    paymentMethod: "Cash",
    status: "Paid",
    paidDate: "2025-06-26",
    paymentDate: "2025-06-30", // Add payment date for filtering
    teaLeafEntries: [
      {
        date: "2025-06-02",
        weight: 85.4,
        quality: "A",
        rate: 88.0,
        amount: 7515.2,
      },
      {
        date: "2025-06-04",
        weight: 92.8,
        quality: "A",
        rate: 88.0,
        amount: 8166.4,
      },
      {
        date: "2025-06-07",
        weight: 88.2,
        quality: "A",
        rate: 88.0,
        amount: 7761.6,
      },
      {
        date: "2025-06-09",
        weight: 95.6,
        quality: "A",
        rate: 88.0,
        amount: 8412.8,
      },
      {
        date: "2025-06-12",
        weight: 89.7,
        quality: "B",
        rate: 85.0,
        amount: 7624.5,
      },
      {
        date: "2025-06-14",
        weight: 91.3,
        quality: "A",
        rate: 88.0,
        amount: 8034.4,
      },
      {
        date: "2025-06-16",
        weight: 87.9,
        quality: "A",
        rate: 88.0,
        amount: 7735.2,
      },
      {
        date: "2025-06-19",
        weight: 94.2,
        quality: "A",
        rate: 88.0,
        amount: 8289.6,
      },
      {
        date: "2025-06-21",
        weight: 86.2,
        quality: "B",
        rate: 85.0,
        amount: 7327.0,
      },
    ],
  },
  {
    id: "SUP005",
    supplierName: "Michael Jayasinghe",
    routeId: "R002",
    totalWeight: 1680.9,
    bagWeight: 84.0, // ~5% of total weight
    waterWeight: 50.4, // ~3% of total weight
    coarseLeafWeight: 33.6, // ~2% of total weight
    netWeight: 1680.9 - 84.0 - 50.4 - 33.6, // 1512.9 kg
    ratePerKg: 84.5,
    grossAmount: (1680.9 - 84.0 - 50.4 - 33.6) * 84.5, // Calculate using net weight × rate
    advances: 20000,
    fertilizer: 4200,
    transport: Math.round((1680.9 - 84.0 - 50.4 - 33.6) * 10), // Rs. 10 per kg of net weight
    others: 600,
    totalDeductions:
      20000 + 4200 + Math.round((1680.9 - 84.0 - 50.4 - 33.6) * 10) + 600,
    finalAmount:
      (1680.9 - 84.0 - 50.4 - 33.6) * 84.5 -
      (20000 + 4200 + Math.round((1680.9 - 84.0 - 50.4 - 33.6) * 10) + 600),
    paymentMethod: "Bank",
    status: "Pending",
    paidDate: null,
    paymentDate: "2025-06-30", // Add payment date for filtering
    teaLeafEntries: [
      {
        date: "2025-06-01",
        weight: 152.3,
        quality: "A",
        rate: 84.5,
        amount: 12869.35,
      },
      {
        date: "2025-06-03",
        weight: 165.8,
        quality: "A",
        rate: 84.5,
        amount: 14010.1,
      },
      {
        date: "2025-06-06",
        weight: 148.7,
        quality: "B",
        rate: 81.0,
        amount: 12044.7,
      },
      {
        date: "2025-06-08",
        weight: 172.4,
        quality: "A",
        rate: 84.5,
        amount: 14567.8,
      },
      {
        date: "2025-06-11",
        weight: 159.6,
        quality: "A",
        rate: 84.5,
        amount: 13486.2,
      },
      {
        date: "2025-06-13",
        weight: 168.2,
        quality: "A",
        rate: 84.5,
        amount: 14212.9,
      },
      {
        date: "2025-06-16",
        weight: 155.9,
        quality: "B",
        rate: 81.0,
        amount: 12627.9,
      },
      {
        date: "2025-06-18",
        weight: 174.8,
        quality: "A",
        rate: 84.5,
        amount: 14770.6,
      },
      {
        date: "2025-06-21",
        weight: 163.2,
        quality: "A",
        rate: 84.5,
        amount: 13790.4,
      },
    ],
  },
];

// Tea rate information
export const teaRate = {
  submittedDate: "2025-06-28",
  rates: {
    gradeA: 85.0,
    gradeB: 82.0,
    gradeC: 78.0,
  },
  status: "Approved",
  approvedBy: "Tea Board Authority",
};

// Month names for display
export const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// Available years based on data
export const availableYears = [2024, 2025];

// Get available months for selected year
export const getAvailableMonths = (year) => {
  if (year === 2025) {
    return Array.from({ length: 6 }, (_, i) => i); // January to June 2025
  } else {
    return Array.from({ length: 12 }, (_, i) => i);
  }
};
