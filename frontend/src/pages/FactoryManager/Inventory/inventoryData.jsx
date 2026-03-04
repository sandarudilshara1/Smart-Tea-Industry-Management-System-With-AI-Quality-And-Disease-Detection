// Dummy data for inventory management

// Sample route data
export const routes = [
  {
    id: "R001",
    routeName: "Kandy Route",
    routeNumber: "KD-001",
    totalWeight: 4241.5, // Total tea leaf weight collected
    netWeight: 4114.3, // Net weight after removing 3% moisture
    totalBags: 158, // Total number of bags
    storageCapacity: 5000, // kg
    utilizedCapacity: 4241.5, // kg
    supplierCount: 3, // Actual number of suppliers
    suppliers: ["SUP001", "SUP002", "SUP003"],
    status: "Active",
    lastUpdated: "2025-07-02",
  },
  {
    id: "R002",
    routeName: "Matale Route",
    routeNumber: "MT-002",
    totalWeight: 2437.2, // Total tea leaf weight collected
    netWeight: 2364.1, // Net weight after removing 3% moisture
    totalBags: 92, // Total number of bags
    storageCapacity: 3500, // kg
    utilizedCapacity: 2437.2, // kg
    supplierCount: 2, // Actual number of suppliers
    suppliers: ["SUP004", "SUP005"],
    status: "Active",
    lastUpdated: "2025-07-01",
  },
  {
    id: "R003",
    routeName: "Nuwara Eliya Route",
    routeNumber: "NE-003",
    totalWeight: 0, // No suppliers defined
    netWeight: 0, // No net weight
    totalBags: 0, // No bags
    storageCapacity: 4000, // kg
    utilizedCapacity: 0, // kg
    supplierCount: 0, // No suppliers defined
    suppliers: [],
    status: "Inactive",
    lastUpdated: "2025-06-30",
  },
];

// Sample supplier data with detailed inventory information
export const suppliers = [
  {
    id: "SUP001",
    supplierName: "John Farmer",
    routeId: "R001",
    totalWeight: 1250.5,
    totalBags: 47,
    averageBagWeight: 26.6, // kg per bag
    moistureContent: 3.0, // percentage
    qualityGrade: "A",
    storageType: "Dry Storage",
    storageLocation: "Warehouse A-1",
    receivedDate: "2025-07-02",
    expiryDate: "2025-07-09", // 7 days from received date
    inventoryStatus: "Fresh",
    processingStatus: "Pending",
    notes: "High quality tea leaves, ready for processing",
    contactPerson: "John Farmer",
    contactNumber: "077-1234567",
    lastDelivery: "2025-07-02",
    deliveryFrequency: "Daily",
  },
  {
    id: "SUP002",
    supplierName: "Mary's Tea Garden",
    routeId: "R001",
    totalWeight: 890.2,
    totalBags: 34,
    averageBagWeight: 26.2, // kg per bag
    moistureContent: 3.5, // percentage
    qualityGrade: "B+",
    storageType: "Climate Controlled",
    storageLocation: "Warehouse A-2",
    receivedDate: "2025-07-02",
    expiryDate: "2025-07-09",
    inventoryStatus: "Fresh",
    processingStatus: "In Progress",
    notes: "Good quality, slight moisture content",
    contactPerson: "Mary Silva",
    contactNumber: "077-2345678",
    lastDelivery: "2025-07-02",
    deliveryFrequency: "Daily",
  },
  {
    id: "SUP003",
    supplierName: "Green Valley Estate",
    routeId: "R001",
    totalWeight: 2100.8,
    totalBags: 77,
    averageBagWeight: 27.3, // kg per bag
    moistureContent: 2.8, // percentage
    qualityGrade: "A+",
    storageType: "Dry Storage",
    storageLocation: "Warehouse A-3",
    receivedDate: "2025-07-01",
    expiryDate: "2025-07-08",
    inventoryStatus: "Fresh",
    processingStatus: "Completed",
    notes: "Premium quality tea leaves, excellent condition",
    contactPerson: "Rohan Perera",
    contactNumber: "077-3456789",
    lastDelivery: "2025-07-01",
    deliveryFrequency: "Daily",
  },
  {
    id: "SUP004",
    supplierName: "Highland Tea Co",
    routeId: "R002",
    totalWeight: 756.3,
    totalBags: 29,
    averageBagWeight: 26.1, // kg per bag
    moistureContent: 4.2, // percentage
    qualityGrade: "B",
    storageType: "Regular Storage",
    storageLocation: "Warehouse B-1",
    receivedDate: "2025-07-01",
    expiryDate: "2025-07-08",
    inventoryStatus: "Fresh",
    processingStatus: "Pending",
    notes: "Moderate quality, higher moisture content",
    contactPerson: "Sunil Bandara",
    contactNumber: "077-4567890",
    lastDelivery: "2025-07-01",
    deliveryFrequency: "Every 2 days",
  },
  {
    id: "SUP005",
    supplierName: "Mountain View Tea",
    routeId: "R002",
    totalWeight: 1680.9,
    totalBags: 63,
    averageBagWeight: 26.7, // kg per bag
    moistureContent: 3.1, // percentage
    qualityGrade: "A",
    storageType: "Climate Controlled",
    storageLocation: "Warehouse B-2",
    receivedDate: "2025-07-01",
    expiryDate: "2025-07-08",
    inventoryStatus: "Fresh",
    processingStatus: "In Progress",
    notes: "Good quality tea leaves, optimal moisture",
    contactPerson: "Chandra Wickrama",
    contactNumber: "077-5678901",
    lastDelivery: "2025-07-01",
    deliveryFrequency: "Daily",
    teaLeafEntries: [
      { day: 1, weight: 125.5, hasWater: true, hasCoarseLeaf: true },
      { day: 3, weight: 142.2, hasWater: false, hasCoarseLeaf: true },
      { day: 4, weight: 135.8, hasWater: true, hasCoarseLeaf: false },
      { day: 7, weight: 152.3, hasWater: true, hasCoarseLeaf: true },
      { day: 10, weight: 148.7, hasWater: false, hasCoarseLeaf: false },
      { day: 12, weight: 138.7, hasWater: true, hasCoarseLeaf: true },
      { day: 15, weight: 145.6, hasWater: false, hasCoarseLeaf: true },
      { day: 18, weight: 154.5, hasWater: true, hasCoarseLeaf: false },
      { day: 20, weight: 108.9, hasWater: false, hasCoarseLeaf: false },
    ],
  },
  {
    id: "SUP002",
    supplierName: "Mary's Tea Garden",
    routeId: "R001",
    totalWeight: 890.2,
    totalBags: 34,
    averageBagWeight: 26.2, // kg per bag
    moistureContent: 3.5, // percentage
    qualityGrade: "B+",
    storageType: "Climate Controlled",
    storageLocation: "Warehouse A-2",
    receivedDate: "2025-07-02",
    expiryDate: "2025-07-09",
    inventoryStatus: "Fresh",
    processingStatus: "In Progress",
    notes: "Good quality, slight moisture content",
    contactPerson: "Mary Silva",
    contactNumber: "077-2345678",
    lastDelivery: "2025-07-02",
    deliveryFrequency: "Daily",
    teaLeafEntries: [
      { day: 2, weight: 98.3, hasWater: true, hasCoarseLeaf: false },
      { day: 5, weight: 115.7, hasWater: false, hasCoarseLeaf: true },
      { day: 8, weight: 132.1, hasWater: true, hasCoarseLeaf: true },
      { day: 11, weight: 89.5, hasWater: false, hasCoarseLeaf: false },
      { day: 14, weight: 167.2, hasWater: true, hasCoarseLeaf: true },
      { day: 17, weight: 143.8, hasWater: false, hasCoarseLeaf: false },
      { day: 19, weight: 95.6, hasWater: true, hasCoarseLeaf: true },
    ],
  },
  {
    id: "SUP003",
    supplierName: "Green Valley Estate",
    routeId: "R001",
    totalWeight: 2100.8,
    totalBags: 77,
    averageBagWeight: 27.3, // kg per bag
    moistureContent: 2.8, // percentage
    qualityGrade: "A+",
    storageType: "Dry Storage",
    storageLocation: "Warehouse A-3",
    receivedDate: "2025-07-01",
    expiryDate: "2025-07-08",
    inventoryStatus: "Fresh",
    processingStatus: "Completed",
    notes: "Premium quality tea leaves, excellent condition",
    contactPerson: "Rohan Perera",
    contactNumber: "077-3456789",
    lastDelivery: "2025-07-01",
    deliveryFrequency: "Daily",
    teaLeafEntries: [
      { day: 1, weight: 187.4, hasWater: true, hasCoarseLeaf: true },
      { day: 2, weight: 165.2, hasWater: false, hasCoarseLeaf: true },
      { day: 4, weight: 198.7, hasWater: true, hasCoarseLeaf: false },
      { day: 6, weight: 176.3, hasWater: false, hasCoarseLeaf: false },
      { day: 9, weight: 203.1, hasWater: true, hasCoarseLeaf: true },
      { day: 13, weight: 189.5, hasWater: false, hasCoarseLeaf: true },
      { day: 16, weight: 212.8, hasWater: true, hasCoarseLeaf: false },
      { day: 21, weight: 158.9, hasWater: false, hasCoarseLeaf: false },
    ],
  },
  {
    id: "SUP004",
    supplierName: "Highland Tea Co",
    routeId: "R002",
    totalWeight: 756.3,
    totalBags: 29,
    averageBagWeight: 26.1, // kg per bag
    moistureContent: 4.2, // percentage
    qualityGrade: "B",
    storageType: "Regular Storage",
    storageLocation: "Warehouse B-1",
    receivedDate: "2025-07-01",
    expiryDate: "2025-07-08",
    inventoryStatus: "Fresh",
    processingStatus: "Pending",
    notes: "Moderate quality, higher moisture content",
    contactPerson: "Sunil Bandara",
    contactNumber: "077-4567890",
    lastDelivery: "2025-07-01",
    deliveryFrequency: "Every 2 days",
    teaLeafEntries: [
      { day: 3, weight: 89.7, hasWater: true, hasCoarseLeaf: true },
      { day: 7, weight: 124.5, hasWater: false, hasCoarseLeaf: false },
      { day: 12, weight: 156.2, hasWater: true, hasCoarseLeaf: true },
      { day: 18, weight: 98.3, hasWater: false, hasCoarseLeaf: true },
      { day: 22, weight: 187.6, hasWater: true, hasCoarseLeaf: false },
    ],
  },
  {
    id: "SUP005",
    supplierName: "Mountain View Tea",
    routeId: "R002",
    totalWeight: 1680.9,
    totalBags: 63,
    averageBagWeight: 26.7, // kg per bag
    moistureContent: 3.1, // percentage
    qualityGrade: "A",
    storageType: "Climate Controlled",
    storageLocation: "Warehouse B-2",
    receivedDate: "2025-07-01",
    expiryDate: "2025-07-08",
    inventoryStatus: "Fresh",
    processingStatus: "In Progress",
    notes: "Good quality tea leaves, optimal moisture",
    contactPerson: "Chandra Wickrama",
    contactNumber: "077-5678901",
    lastDelivery: "2025-07-01",
    deliveryFrequency: "Daily",
    teaLeafEntries: [
      { day: 1, weight: 156.8, hasWater: true, hasCoarseLeaf: false },
      { day: 4, weight: 189.2, hasWater: false, hasCoarseLeaf: true },
      { day: 8, weight: 134.7, hasWater: true, hasCoarseLeaf: true },
      { day: 11, weight: 167.3, hasWater: false, hasCoarseLeaf: false },
      { day: 15, weight: 198.5, hasWater: true, hasCoarseLeaf: true },
      { day: 19, weight: 143.9, hasWater: false, hasCoarseLeaf: false },
      { day: 23, weight: 176.4, hasWater: true, hasCoarseLeaf: true },
    ],
  },
];

// Storage types
export const storageTypes = [
  "Dry Storage",
  "Climate Controlled",
  "Regular Storage",
  "Cold Storage",
];

// Quality grades
export const qualityGrades = ["A+", "A", "B+", "B", "C+", "C"];

// Inventory status options
export const inventoryStatuses = [
  "Fresh",
  "Aging",
  "Expired",
  "Damaged",
  "Processing",
];

// Processing status options
export const processingStatuses = [
  "Pending",
  "In Progress",
  "Completed",
  "Quality Check",
  "Ready for Sale",
];

// Date utility functions
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const getDaysFromToday = (dateString) => {
  const today = new Date();
  const targetDate = new Date(dateString);
  const diffTime = targetDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

export const getDateRange = (days = 30) => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  return { startDate, endDate };
};

// Month names for monthly view
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

// Available years for monthly view
export const availableYears = [2023, 2024, 2025, 2026];

// Function to get available months for a given year
export const getAvailableMonths = (year) => {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();

  if (year < currentYear) {
    return monthNames.map((_, index) => index);
  } else if (year === currentYear) {
    return Array.from({ length: currentMonth + 1 }, (_, index) => index);
  } else {
    return []; // Future years
  }
};

// Storage locations
export const storageLocations = [
  "Warehouse A-1",
  "Warehouse A-2",
  "Warehouse A-3",
  "Warehouse B-1",
  "Warehouse B-2",
  "Warehouse C-1",
  "Warehouse C-2",
  "Cold Storage 1",
  "Cold Storage 2",
];

// Route status options
export const routeStatuses = [
  "Active",
  "Inactive",
  "Under Maintenance",
  "Suspended",
];
