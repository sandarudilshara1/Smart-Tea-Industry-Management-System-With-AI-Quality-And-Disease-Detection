// Sample data for fertilizer requests
export const fertilizerRequests = [
  {
    id: "FR-001",
    categoryId: "cat-001",
    categoryName: "Urea",
    companyId: "comp-001",
    companyName: "AgriCorp International",
    userId: "user-001",
    userName: "John Smith",
    quantity: 500,
    unit: "kg",
    status: "PENDING",
    note: "Urgent need for upcoming planting season",
    description: "Required for tea plants in southern area",
    createdAt: "2023-10-15T08:30:00Z",
    updatedAt: "2023-10-15T08:30:00Z"
  },
  {
    id: "FR-002",
    categoryId: "cat-002",
    categoryName: "NPK 15-15-15",
    companyId: "comp-002",
    companyName: "FarmSolutions Ltd",
    userId: "user-002",
    userName: "Mary Johnson",
    quantity: 250,
    unit: "kg",
    status: "APPROVED",
    note: "Monthly standard supply",
    description: "Regular order for maintenance of eastern plots",
    createdAt: "2023-10-10T10:15:00Z",
    updatedAt: "2023-10-11T14:20:00Z"
  },
  {
    id: "FR-003",
    categoryId: "cat-003",
    categoryName: "Potassium Nitrate",
    companyId: "comp-001",
    companyName: "AgriCorp International",
    userId: "user-003",
    userName: "Robert Williams",
    quantity: 150,
    unit: "kg",
    status: "REJECTED",
    note: "Special formulation for young plants",
    description: "Budget constraints - alternative options needed",
    rejectReason: "Over budget for current quarter",
    createdAt: "2023-10-05T09:45:00Z",
    updatedAt: "2023-10-06T15:30:00Z"
  },
  {
    id: "FR-004",
    categoryId: "cat-004",
    categoryName: "Ammonium Sulfate",
    companyId: "comp-003",
    companyName: "EcoGrow Fertilizers",
    userId: "user-001",
    userName: "John Smith",
    quantity: 350,
    unit: "kg",
    status: "PENDING",
    note: "Required for soil acidity management",
    description: "Testing for improved yield in western fields",
    createdAt: "2023-10-17T11:20:00Z",
    updatedAt: "2023-10-17T11:20:00Z"
  },
  {
    id: "FR-005",
    categoryId: "cat-001",
    categoryName: "Urea",
    companyId: "comp-002",
    companyName: "FarmSolutions Ltd",
    userId: "user-004",
    userName: "Sarah Brown",
    quantity: 200,
    unit: "kg",
    status: "FULFILLED",
    note: "End of season application",
    description: "Last application before monsoon season",
    createdAt: "2023-09-28T13:10:00Z",
    updatedAt: "2023-10-03T09:45:00Z"
  }
];

// Sample fertilizer categories
export const fertilizerCategories = [
  { id: "cat-001", name: "Urea" },
  { id: "cat-002", name: "NPK 15-15-15" },
  { id: "cat-003", name: "Potassium Nitrate" },
  { id: "cat-004", name: "Ammonium Sulfate" },
  { id: "cat-005", name: "Triple Super Phosphate" },
  { id: "cat-006", name: "Calcium Nitrate" },
];

// Sample fertilizer companies
export const fertilizerCompanies = [
  { id: "comp-001", name: "AgriCorp International" },
  { id: "comp-002", name: "FarmSolutions Ltd" },
  { id: "comp-003", name: "EcoGrow Fertilizers" },
  { id: "comp-004", name: "TeaGreen Specialists" },
  { id: "comp-005", name: "NutriSoil Systems" },
];