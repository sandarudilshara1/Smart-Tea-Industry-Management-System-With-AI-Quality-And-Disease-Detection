import axios from "./axios";

// Get all managers
export const getManagers = async () => {
  const res = await axios.get("/manager-info");
  return res.data;
};

// Get managers by factory id
export const getManagersByFactory = async (factoryId) => {
  const res = await axios.get(`/manager-info/${factoryId}`);
  return res.data;
};
