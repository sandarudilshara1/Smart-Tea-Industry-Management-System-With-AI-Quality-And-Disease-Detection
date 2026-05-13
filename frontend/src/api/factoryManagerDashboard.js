import instance from "./axios";

export const getInventorySummary = async (viewMode, params = {}) => {
  const queryParams = { viewMode };

  if (viewMode === "daily") {
    queryParams.date = params.date;
  } else if (viewMode === "monthly") {
    queryParams.month = params.month;
    queryParams.year = params.year;
  }

  // Add routeId if provided
  if (params.routeId) {
    queryParams.routeId = params.routeId;
  }

  try {
    const response = await instance.get(
      `/factory-dashboard/inventory`,
      { params: queryParams }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching inventory summary:", error);
    throw error;
  }
};

export const getInventoryRoutes = async (viewMode, params = {}) => {
  const queryParams = { viewMode };

  if (viewMode === "daily") {
    queryParams.date = params.date;
  } else if (viewMode === "monthly") {
    queryParams.month = params.month;
    queryParams.year = params.year;
  }

  // Add pagination and sorting params
  if (params.page !== undefined) queryParams.page = params.page;
  if (params.size !== undefined) queryParams.size = params.size;
  if (params.search) queryParams.search = params.search;
  if (params.sortDir) queryParams.sortDir = params.sortDir;

  try {
    const response = await instance.get(
      `/factory-dashboard/inventory/route`,
      { params: queryParams }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching inventory routes:", error);
    throw error;
  }
};

export const getInventoryRouteSuppliers = async (
  routeId,
  viewMode,
  params = {}
) => {
  const queryParams = { viewMode };

  if (viewMode === "daily") {
    queryParams.date = params.date;
  } else if (viewMode === "monthly") {
    queryParams.month = params.month;
    queryParams.year = params.year;
  }

  // Add pagination and sorting params
  if (params.page !== undefined) queryParams.page = params.page;
  if (params.size !== undefined) queryParams.size = params.size;
  if (params.search) queryParams.search = params.search;
  if (params.sortDir) queryParams.sortDir = params.sortDir;

  try {
    const response = await instance.get(
      `/factory-dashboard/inventory/route/${routeId}/suppliers`,
      { params: queryParams }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching inventory route suppliers:", error);
    throw error;
  }
};

export const getSupplierMonthlySummary = async (supplierId, month, year) => {
  try {
    const response = await instance.get(
      `/factory-dashboard/supplier/${supplierId}/monthly-summary`,
      { params: { month, year } }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching supplier monthly summary:", error);
    throw error;
  }
};

export const getSupplierDailySummary = async (supplierId, month, year) => {
  try {
    const response = await instance.get(
      `/factory-dashboard/supplier/${supplierId}/daily-summary`,
      { params: { month, year } }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching supplier daily summary:", error);
    throw error;
  }
};
