// Utility functions for driver management

export const getDriverSummary = (drivers) => {
  const totalDrivers = drivers.length;
  const activeDrivers = drivers.filter((d) => d.status === "active").length;
  const availableToday = drivers.filter(
    (d) => d.availabilityToday && d.status === "active"
  ).length;
  const expiredLicenses = drivers.filter(
    (d) => d.licenseStatus === "expired"
  ).length;
  const assignedDrivers = drivers.filter(
    (d) => d.assignedRoutes.length > 0
  ).length;
  const onLeaveDrivers = drivers.filter((d) => d.status === "on_leave").length;

  return {
    totalDrivers,
    activeDrivers,
    availableToday,
    expiredLicenses,
    assignedDrivers,
    onLeaveDrivers,
  };
};

export const filterDrivers = (drivers, filters) => {
  return drivers.filter((driver) => {
    const matchesSearch =
      !filters.search ||
      driver.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
      driver.vehicleNo?.toLowerCase().includes(filters.search.toLowerCase()) ||
      driver.phone?.includes(filters.search) ||
      driver._id?.toLowerCase().includes(filters.search.toLowerCase()) ||
      driver.email?.toLowerCase().includes(filters.search.toLowerCase());

    const matchesStatus =
      !filters.status || filters.status === "All" || driver.status === filters.status;

    return matchesSearch && matchesStatus;
  });
};

export const sortDrivers = (drivers, sortBy, sortOrder) => {
  return [...drivers].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];

    // Handle special cases
    if (sortBy === "assignedRoutes") {
      aValue = a.assignedRoutes.length;
      bValue = b.assignedRoutes.length;
    }

    if (typeof aValue === "string") {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    if (sortOrder === "asc") {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });
};

export const generateDriverId = (drivers) => {
  const existingIds = drivers.map((d) => d.id);
  let counter = 1;
  let newId;

  do {
    newId = `DRV-${String(counter).padStart(3, "0")}`;
    counter++;
  } while (existingIds.includes(newId));

  return newId;
};

export const validateDriver = (driver) => {
  const errors = {};

  if (!driver.name?.trim()) {
    errors.name = "Driver name is required";
  }

  if (!driver.email?.trim()) {
    errors.email = "Email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(driver.email)) {
    errors.email = "Invalid email format";
  }

  if (!driver.nic?.trim()) {
    errors.nic = "NIC number is required";
  } else if (!/^\d{9}[vVxX]$|^\d{12}$/.test(driver.nic)) {
    errors.nic = "Invalid NIC format";
  }

  if (!driver.phone?.trim()) {
    errors.phone = "Contact number is required";
  } else {
    // Remove all spaces and validate
    const cleanedPhone = driver.phone.replace(/\s+/g, '');
    if (!/^(\+94\d{9}|0\d{9})$/.test(cleanedPhone)) {
      errors.phone = "Invalid contact number (use +94XXXXXXXXX or 0XXXXXXXXX)";
    }
  }

  if (!driver.address?.trim()) {
    errors.address = "Address is required";
  }

  if (!driver.licenseNo?.trim()) {
    errors.licenseNo = "License number is required";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const isLicenseExpiringSoon = (expiryDate, daysThreshold = 30) => {
  const expiry = new Date(expiryDate);
  const today = new Date();
  const timeDiff = expiry - today;
  const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

  return daysDiff <= daysThreshold && daysDiff > 0;
};

export const formatDriverForExport = (drivers) => {
  return drivers.map((driver) => ({
    "Driver ID": driver._id,
    Name: driver.name,
    Email: driver.email,
    Vehicle: driver.vehicleNo || "Not assigned",
    Contact: driver.phone,
    NIC: driver.nic,
    "License Number": driver.licenseNo,
    "License Expiry": driver.licenseExpiry ? new Date(driver.licenseExpiry).toLocaleDateString() : "N/A",
    Status: driver.status,
    "Routes Assigned": driver.assignedRoutes?.map(r => r.routeName || r).join(", ") || "None",
    Experience: `${driver.experience || 0} years`,
    Rating: driver.rating || "N/A",
  }));
};
