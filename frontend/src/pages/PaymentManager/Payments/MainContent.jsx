import RoutesView from "./RoutesView";
import SuppliersView from "./SuppliersView";
import SupplierBillView from "./SupplierBillView";

export default function MainContent({
  currentView,
  filteredData,
  summary,
  getCurrentData,
  onViewRoute,
  onViewSupplierBill,
  onDownloadCSV,
  selectedSupplier,
  selectedRoute,
  selectedMonth,
  selectedYear,
  monthNames,
}) {
  if (currentView === "routes") {
    return (
      <RoutesView
        filteredData={filteredData}
        summary={summary}
        getCurrentData={getCurrentData}
        onViewRoute={onViewRoute}
      />
    );
  } else if (currentView === "suppliers") {
    return (
      <SuppliersView
        filteredData={filteredData}
        summary={summary}
        getCurrentData={getCurrentData}
        onViewSupplierBill={onViewSupplierBill}
        onDownloadCSV={onDownloadCSV}
      />
    );
  } else if (currentView === "bill") {
    return (
      <SupplierBillView
        selectedSupplier={selectedSupplier}
        selectedRoute={selectedRoute}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        monthNames={monthNames}
      />
    );
  }
  return null;
}
