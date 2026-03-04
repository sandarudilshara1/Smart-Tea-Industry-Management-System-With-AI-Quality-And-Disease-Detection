// Utility functions for route management

export const getRouteStatistics = (routes) => {
  const totalRoutes = routes.length;
  const activeRoutes = routes.filter(
    (route) => route.status === "Active"
  ).length;
  const totalSuppliers = routes.reduce(
    (sum, route) => sum + route.supplierCount,
    0
  );
  const totalEstimatedLoad = routes.reduce(
    (sum, route) => sum + route.estimatedLoad,
    0
  );
  const totalActualLoad = routes.reduce(
    (sum, route) => sum + route.actualLoad,
    0
  );
  const totalDistance = routes.reduce((sum, route) => sum + route.distance, 0);
  const totalBagCounts = routes.reduce(
    (sum, route) => sum + (route.bagCounts || 0),
    0
  );

  return {
    totalRoutes,
    activeRoutes,
    inactiveRoutes: totalRoutes - activeRoutes,
    totalSuppliers,
    totalEstimatedLoad,
    totalActualLoad,
    totalDistance,
    totalBagCounts,
    averageLoad: totalRoutes > 0 ? totalActualLoad / totalRoutes : 0,
    loadEfficiency:
      totalEstimatedLoad > 0 ? (totalActualLoad / totalEstimatedLoad) * 100 : 0,
  };
};

export const getRouteSummary = (routes) => {
  const stats = getRouteStatistics(routes);

  return {
    totalRoutes: stats.totalRoutes,
    activeRoutes: stats.activeRoutes,
    totalSuppliers: stats.totalSuppliers,
    totalLoad: stats.totalActualLoad,
    estimatedLoad: stats.totalEstimatedLoad,
    totalDistance: stats.totalDistance,
    totalBagCounts: stats.totalBagCounts,
    loadEfficiency: stats.loadEfficiency,
  };
};

export const filterRoutes = (routes, filters) => {
  return routes.filter((route) => {
    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const matchesSearch =
        route.routeName.toLowerCase().includes(searchTerm) ||
        route.id.toLowerCase().includes(searchTerm) ||
        route.region.toLowerCase().includes(searchTerm) ||
        (route.assignedDriver &&
          route.assignedDriver.toLowerCase().includes(searchTerm));

      if (!matchesSearch) return false;
    }

    // Status filter
    if (filters.status !== "All" && route.status !== filters.status) {
      return false;
    }

    // Region filter
    if (filters.region !== "All" && route.region !== filters.region) {
      return false;
    }

    // Driver assignment filter
    if (filters.driverAssignment !== "All") {
      if (filters.driverAssignment === "Assigned" && !route.assignedDriver)
        return false;
      if (filters.driverAssignment === "Unassigned" && route.assignedDriver)
        return false;
    }

    return true;
  });
};

export const sortRoutes = (routes, sortBy, sortOrder) => {
  const sorted = [...routes].sort((a, b) => {
    let aValue, bValue;

    switch (sortBy) {
      case "routeName":
        aValue = a.routeName.toLowerCase();
        bValue = b.routeName.toLowerCase();
        return sortOrder === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);

      case "supplierCount":
        aValue = a.supplierCount;
        bValue = b.supplierCount;
        return sortOrder === "asc" ? aValue - bValue : bValue - aValue;

      case "estimatedLoad":
        aValue = a.estimatedLoad;
        bValue = b.estimatedLoad;
        return sortOrder === "asc" ? aValue - bValue : bValue - aValue;

      case "actualLoad":
        aValue = a.actualLoad;
        bValue = b.actualLoad;
        return sortOrder === "asc" ? aValue - bValue : bValue - aValue;

      case "bagCounts":
        aValue = a.bagCounts || 0;
        bValue = b.bagCounts || 0;
        return sortOrder === "asc" ? aValue - bValue : bValue - aValue;

      case "distance":
        aValue = a.distance;
        bValue = b.distance;
        return sortOrder === "asc" ? aValue - bValue : bValue - aValue;

      case "status":
        aValue = a.status.toLowerCase();
        bValue = b.status.toLowerCase();
        return sortOrder === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);

      default:
        return 0;
    }
  });

  return sorted;
};

export const generateRouteId = (existingRoutes) => {
  const maxId = existingRoutes.reduce((max, route) => {
    const idNumber = parseInt(route.id.split("-")[1]);
    return idNumber > max ? idNumber : max;
  }, 0);

  return `TR-${String(maxId + 1).padStart(3, "0")}`;
};

export const validateRoute = (routeData) => {
  const errors = {};

  if (!routeData.routeName?.trim()) {
    errors.routeName = "Route name is required";
  }

  if (!routeData.region?.trim()) {
    errors.region = "Region is required";
  }

  if (routeData.estimatedLoad && routeData.estimatedLoad <= 0) {
    errors.estimatedLoad = "Estimated load must be greater than 0";
  }

  if (routeData.bagCounts && routeData.bagCounts < 0) {
    errors.bagCounts = "Bag counts must not be negative";
  }

  if (routeData.distance && routeData.distance <= 0) {
    errors.distance = "Distance must be greater than 0";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const getDriverName = (driverId, drivers) => {
  const driver = drivers.find((d) => d.id === driverId);
  return driver ? driver.name : null;
};
