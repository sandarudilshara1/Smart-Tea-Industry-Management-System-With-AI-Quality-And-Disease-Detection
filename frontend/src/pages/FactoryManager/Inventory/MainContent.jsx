import RoutesView from "./RoutesView";
import SuppliersView from "./SuppliersView";
import SupplierDetailView from "./SupplierDetailView";

export default function MainContent({
  currentView,
  suppliersData,
  filteredData,
  summary,
  onViewRoute,
  onViewSupplierDetail,
  selectedSupplier,
  selectedRoute,
  page,
  totalPages,
  totalElements,
  setPage,
  loading,
}) {
  if (currentView === "routes") {
    return (
      <RoutesView
        filteredData={filteredData}
        summary={summary}
        onViewRoute={onViewRoute}
        loading={loading}
      />
    );
  } else if (currentView === "suppliers") {
    return (
      <SuppliersView
        suppliersData={suppliersData}
        summary={summary}
        onViewSupplierDetail={onViewSupplierDetail}
        selectedRoute={selectedRoute}
        page={page}
        totalPages={totalPages}
        totalElements={totalElements}
        setPage={setPage}
        loading={loading}
      />
    );
  } else if (currentView === "detail") {
    return <SupplierDetailView supplier={selectedSupplier} />;
  }

  return null;
}
