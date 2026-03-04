import axios from "./axios";

// Register a new user
export const register = async (userData) => {
  const res = await axios.post("/auth/register", userData);
  return res.data;
};

// Login user with email and password
export const login = async (email, password) => {
  const res = await axios.post("/auth/login", { email, password });
  return res.data;
};

// Get current user profile
export const getCurrentUser = async () => {
  const res = await axios.get("/auth/me");
  return res.data;
};

// Update user profile
export const updateProfile = async (profileData) => {
  const res = await axios.put("/auth/profile", profileData);
  return res.data;
};

// Change password
export const changePassword = async (currentPassword, newPassword) => {
  const res = await axios.put("/auth/change-password", { 
    currentPassword, 
    newPassword 
  });
  return res.data;
};
