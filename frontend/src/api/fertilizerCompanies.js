import axios from "./axios";

export const getFertilizerCompanies = async () => {
    const res = await axios.get("/fertilizer-companies");
    return res.data;
};

export const getFertilizerCompanyDropdown = async () => {
    const res = await axios.get("/fertilizer-companies/dropdown");
    return res.data;
};

export const getFertilizerCategoriesByCompany = async (companyId) => {
    if (!companyId) return [];
    const res = await axios.get(`/fertilizer-companies/${companyId}/categories`);
    return res.data;
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
