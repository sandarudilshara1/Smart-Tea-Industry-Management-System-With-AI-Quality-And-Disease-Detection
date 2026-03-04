import React from "react";

export default function PaginationControls({
  page,
  totalPages,
  totalElements,
  setPage,
}) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between mt-3">
      <div className="text-sm text-gray-600">
        Page {page + 1} of {totalPages} — {totalElements} items
      </div>
      <div className="flex items-center gap-2">
        <button
          className="px-3 py-1 bg-white border rounded disabled:opacity-50"
          disabled={page <= 0}
          onClick={() => setPage((p) => Math.max(0, p - 1))}
        >
          Previous
        </button>
        <button
          className="px-3 py-1 bg-white border rounded disabled:opacity-50"
          disabled={page + 1 >= totalPages}
          onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
        >
          Next
        </button>
      </div>
    </div>
  );
}
