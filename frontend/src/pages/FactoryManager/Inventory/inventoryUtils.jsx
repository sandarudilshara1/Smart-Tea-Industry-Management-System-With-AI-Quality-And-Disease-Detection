// Utility functions for inventory management calculations

export function getInventoryStatistics(routes) {
  const total = routes.reduce(
    (acc, route) => {
      acc.totalWeight += route.totalWeight || 0;
      acc.totalBags += route.totalBags || 0;
      acc.totalRoutes += 1;
      acc.totalSuppliers += route.supplierCount || 0;
      acc.totalCapacity += route.storageCapacity || 0;
      acc.totalUtilized += route.utilizedCapacity || 0;
      // Calculate net weight (assuming 3% average moisture content if not specified)
      const moisturePercent = route.moistureContent || 3.0;
      const netWeight = (route.totalWeight || 0) * (1 - moisturePercent / 100);
      acc.netWeight += netWeight;
      return acc;
    },
    {
      totalWeight: 0,
      totalBags: 0,
      totalRoutes: 0,
      totalSuppliers: 0,
      totalCapacity: 0,
      totalUtilized: 0,
      netWeight: 0,
    }
  );

  const utilizationRate =
    total.totalCapacity > 0
      ? ((total.totalUtilized / total.totalCapacity) * 100).toFixed(1)
      : 0;

  const averageWeight =
    total.totalRoutes > 0
      ? (total.totalWeight / total.totalRoutes).toFixed(1)
      : 0;

  return {
    ...total,
    utilizationRate,
    averageWeight,
  };
}

export function getUnifiedSummary(suppliers) {
  const summary = suppliers.reduce(
    (acc, supplier) => {
      acc.totalWeight += supplier.totalWeight || 0;
      acc.totalBags += supplier.totalBags || 0;
      acc.totalSuppliers += 1;
      // Calculate net weight for each supplier
      const moisturePercent = supplier.moistureContent || 3.0;
      const netWeight =
        (supplier.totalWeight || 0) * (1 - moisturePercent / 100);
      acc.netWeight += netWeight;

      // Count by storage type
      const storageType = supplier.storageType || "Unknown";
      acc.storageTypes[storageType] = (acc.storageTypes[storageType] || 0) + 1;

      // Count by quality grade
      const grade = supplier.qualityGrade || "Unknown";
      acc.qualityGrades[grade] = (acc.qualityGrades[grade] || 0) + 1;

      // Count by inventory status
      const status = supplier.inventoryStatus || "Unknown";
      acc.inventoryStatuses[status] = (acc.inventoryStatuses[status] || 0) + 1;

      // Count by processing status
      const processStatus = supplier.processingStatus || "Unknown";
      acc.processingStatuses[processStatus] =
        (acc.processingStatuses[processStatus] || 0) + 1;

      // Sum moisture content for average
      acc.totalMoisture += supplier.moistureContent || 0;

      return acc;
    },
    {
      totalWeight: 0,
      totalBags: 0,
      totalSuppliers: 0,
      totalMoisture: 0,
      netWeight: 0,
      storageTypes: {},
      qualityGrades: {},
      inventoryStatuses: {},
      processingStatuses: {},
    }
  );

  // Calculate averages
  summary.averageBagWeight =
    summary.totalBags > 0
      ? (summary.totalWeight / summary.totalBags).toFixed(1)
      : 0;

  summary.averageMoisture =
    summary.totalSuppliers > 0
      ? (summary.totalMoisture / summary.totalSuppliers).toFixed(1)
      : 0;

  return summary;
}

export function calculateInventoryMetrics(supplier) {
  const metrics = {
    weightPerBag:
      supplier.totalBags > 0
        ? (supplier.totalWeight / supplier.totalBags).toFixed(1)
        : 0,
    moisturePercentage: supplier.moistureContent || 0,
    qualityScore: getQualityScore(supplier.qualityGrade),
    daysToExpiry: calculateDaysToExpiry(supplier.expiryDate),
    storageEfficiency: calculateStorageEfficiency(supplier),
  };

  return metrics;
}

function getQualityScore(grade) {
  const scores = {
    "A+": 95,
    A: 85,
    "B+": 75,
    B: 65,
    "C+": 55,
    C: 45,
  };
  return scores[grade] || 0;
}

function calculateDaysToExpiry(expiryDate) {
  if (!expiryDate) return 0;

  const today = new Date();
  const expiry = new Date(expiryDate);
  const diffTime = expiry - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return Math.max(0, diffDays);
}

function calculateStorageEfficiency(supplier) {
  // Calculate efficiency based on moisture content, quality grade, and storage type
  let efficiency = 100;

  // Deduct points for high moisture content
  if (supplier.moistureContent > 4) {
    efficiency -= 20;
  } else if (supplier.moistureContent > 3) {
    efficiency -= 10;
  }

  // Adjust for quality grade
  const qualityScore = getQualityScore(supplier.qualityGrade);
  efficiency = (efficiency + qualityScore) / 2;

  // Adjust for storage type
  const storageMultipliers = {
    "Climate Controlled": 1.1,
    "Dry Storage": 1.0,
    "Cold Storage": 1.05,
    "Regular Storage": 0.9,
  };

  efficiency *= storageMultipliers[supplier.storageType] || 1.0;

  return Math.min(100, efficiency).toFixed(1);
}

export function getInventoryAlerts(suppliers) {
  const alerts = [];

  suppliers.forEach((supplier) => {
    const daysToExpiry = calculateDaysToExpiry(supplier.expiryDate);

    // Expiry alerts
    if (daysToExpiry <= 1) {
      alerts.push({
        type: "critical",
        message: `${supplier.supplierName} inventory expires in ${daysToExpiry} day(s)`,
        supplier: supplier.id,
      });
    } else if (daysToExpiry <= 3) {
      alerts.push({
        type: "warning",
        message: `${supplier.supplierName} inventory expires in ${daysToExpiry} days`,
        supplier: supplier.id,
      });
    }

    // High moisture content alerts
    if (supplier.moistureContent > 4) {
      alerts.push({
        type: "warning",
        message: `${supplier.supplierName} has high moisture content (${supplier.moistureContent}%)`,
        supplier: supplier.id,
      });
    }

    // Quality alerts
    if (supplier.qualityGrade === "C" || supplier.qualityGrade === "C+") {
      alerts.push({
        type: "info",
        message: `${supplier.supplierName} has low quality grade (${supplier.qualityGrade})`,
        supplier: supplier.id,
      });
    }
  });

  return alerts;
}

export function generateInventoryReport(data, type) {
  const report = {
    generatedAt: new Date().toISOString(),
    type,
    data,
    summary: {},
  };

  if (type === "routes") {
    report.summary = getInventoryStatistics(data);
  } else if (type === "suppliers") {
    report.summary = getUnifiedSummary(data);
    report.alerts = getInventoryAlerts(data);
  }

  return report;
}

// Monthly aggregation functions
export function getMonthlyInventoryStats(suppliers, month, year) {
  // Filter suppliers that had activity in the specified month/year
  const monthlySuppliers = suppliers.filter((supplier) => {
    const receivedDate = new Date(supplier.receivedDate);
    const lastDeliveryDate = new Date(supplier.lastDelivery);

    return (
      (receivedDate.getMonth() === month &&
        receivedDate.getFullYear() === year) ||
      (lastDeliveryDate.getMonth() === month &&
        lastDeliveryDate.getFullYear() === year)
    );
  });

  const stats = getUnifiedSummary(monthlySuppliers);

  // Add monthly-specific metrics
  stats.totalDeliveries = monthlySuppliers.length;
  stats.avgWeightPerDelivery =
    stats.totalSuppliers > 0
      ? (stats.totalWeight / stats.totalSuppliers).toFixed(1)
      : 0;

  // Calculate monthly capacity utilization
  const totalMonthlyCapacity = monthlySuppliers.reduce(
    (sum, supplier) => sum + (supplier.storageCapacity || 0),
    0
  );
  stats.monthlyUtilization =
    totalMonthlyCapacity > 0
      ? ((stats.totalWeight / totalMonthlyCapacity) * 100).toFixed(1)
      : 0;

  return stats;
}

export function getHistoricalData(suppliers, months = 6) {
  const history = [];
  const currentDate = new Date();

  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(currentDate);
    date.setMonth(date.getMonth() - i);

    const monthStats = getMonthlyInventoryStats(
      suppliers,
      date.getMonth(),
      date.getFullYear()
    );

    history.push({
      month: date.getMonth(),
      year: date.getFullYear(),
      monthName: new Intl.DateTimeFormat("en-US", { month: "long" }).format(
        date
      ),
      ...monthStats,
    });
  }

  return history;
}

export function compareMonthlyData(currentMonth, currentYear, suppliers) {
  const currentStats = getMonthlyInventoryStats(
    suppliers,
    currentMonth,
    currentYear
  );

  // Get previous month stats
  const prevDate = new Date(currentYear, currentMonth - 1);
  const prevStats = getMonthlyInventoryStats(
    suppliers,
    prevDate.getMonth(),
    prevDate.getFullYear()
  );

  // Calculate percentage changes
  const weightChange =
    prevStats.totalWeight > 0
      ? (
          ((currentStats.totalWeight - prevStats.totalWeight) /
            prevStats.totalWeight) *
          100
        ).toFixed(1)
      : 0;

  const supplierChange =
    prevStats.totalSuppliers > 0
      ? (
          ((currentStats.totalSuppliers - prevStats.totalSuppliers) /
            prevStats.totalSuppliers) *
          100
        ).toFixed(1)
      : 0;

  const deliveryChange =
    prevStats.totalDeliveries > 0
      ? (
          ((currentStats.totalDeliveries - prevStats.totalDeliveries) /
            prevStats.totalDeliveries) *
          100
        ).toFixed(1)
      : 0;

  return {
    current: currentStats,
    previous: prevStats,
    changes: {
      weight: weightChange,
      suppliers: supplierChange,
      deliveries: deliveryChange,
    },
  };
}
