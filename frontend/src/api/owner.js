import axios from "./axios";

// Get pending tea rates
export const getPendingTeaRates = async () => {
  const res = await axios.get("/tea_rates/pending");
  return res.data;
};

// Get approved tea rates
export const getApprovedTeaRates = async (params = {}) => {
  const res = await axios.get("/tea_rates/approved", { params });
  return res.data;
};

// Approve tea rate
export const approveTeaRate = async (rateId) => {
  const res = await axios.put(`/tea_rates/${rateId}/approve`);
  return res.data;
};

// Adjust and approve tea rate
export const adjustTeaRate = async (rateId, adjustedRate, reason = "") => {
  const body = { adjustedRate, adjustmentReason: reason };
  const res = await axios.put(`/tea_rates/${rateId}/adjust`, body);
  return res.data;
};

// Export tea rate report
export const exportTeaRateReport = async (config) => {
  const res = await axios.post("/tea_rates/export", config, { responseType: "blob" });
  return res.data;
};

// Fertilizer Company API
export const getFertilizerCompanies = async () => {
  const res = await axios.get("/fertilizer-companies");
  return res.data;
};

// Simplified dropdown (id + name)
export const getFertilizerCompanyDropdown = async () => {
  const res = await axios.get("/fertilizer-companies/dropdown");
  return res.data; // [{id, name}]
};

// Categories for a selected company
export const getFertilizerCategoriesByCompany = async (companyId) => {
  if (!companyId) return [];
  const res = await axios.get(`/fertilizer-companies/${companyId}/categories`);
  return res.data; // [{id, name}]
};

export const createFertilizerCompany = async (companyData) => {
  const res = await axios.post("/fertilizer-companies", companyData);
  return res.data;
};

export const updateFertilizerCompany = async (id, companyData) => {
  const res = await axios.put(`/fertilizer-companies/${id}`, companyData);
  return res.data;
};

export const deleteFertilizerCompany = async (id) => {
  const res = await axios.delete(`/fertilizer-companies/${id}`);
  return res.data;
};

// Announcements
// Create a new announcement (supports attachments via FormData)
export const addAnnouncement = async (formData) => {
  // formData should be a FormData instance with fields: topic, subject, content, factories[], attachments[]
  const res = await axios.post("/announcements", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// Loan Rate APIs
export const getLoanRates = async () => {
  const res = await axios.get("/loan-rate");
  return res.data;
};

export const createLoanRate = async (loanRateData) => {
  const res = await axios.post("/loan-rate", loanRateData);
  return res.data;
};

// Update an existing announcement by id (supports FormData)
export const updateAnnouncement = async (id, formData) => {
  const res = await axios.put(`/announcements/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

// View announcements (optionally pass params for filtering/pagination)
export const viewAnnouncements = async (params = {}) => {
  const res = await axios.get("/announcements", { params });
  return res.data;
};

// Delete announcement by id
export const deleteAnnouncement = async (id) => {
  const res = await axios.delete(`/announcements/${id}`);
  return res.data;
};

// Get all fertilizer categories
export const getAllFertilizerCategories = async () => {
  const res = await axios.get("/fertilizer-categories");
  return res.data; // [{id, name}]
};

// Get companies that provide a specific fertilizer category
export const getCompaniesByFertilizerCategory = async (categoryId) => {
  if (!categoryId) return [];
  const res = await axios.get(`/fertilizer-categories/${categoryId}/companies`);
  return res.data; // [{id, name}]
};
