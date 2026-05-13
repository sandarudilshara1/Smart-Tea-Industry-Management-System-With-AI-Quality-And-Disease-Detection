# Inventory Manager — Fertilizer Inventory Plan

## Goal
Enable **Inventory Manager** to:
1. Maintain fertilizer suppliers (companies) (add/update/delete as required by your workflow).
2. Record fertilizer stock **received** (kg + unit price + supplier + type/category).
3. Record fertilizer stock **used** (date/time + kg + purpose/notes).
4. See a **summary** of current fertilizer availability (kg available) and history totals.

## Non-goals (for this iteration)
- No Fertilizer Manager dashboard (explicitly not needed).
- No “request sent / request approved / stock arrived” workflow.
- No email notifications for requests (can be added later if you want).

## Current State (what already exists)
- Fertilizer companies exist in backend: `GET /api/fertilizer-companies`, `POST/PUT/DELETE /api/fertilizer-companies`.
  - Currently restricted to `authorize('owner')` for create/update/delete.
- Inventory Manager routes exist in frontend in `frontend/src/router/InventoryManagerRoutes.jsx`.
- Frontend references `/fertilizer-stocks` and `/fertilizer-requests`, but backend implementation for `/fertilizer-stocks` is not clearly present in the repo yet.

## Proposed Approach
Implement a simple **inventory ledger** (transaction-based) owned by the system:
- **Stock-In transaction**: fertilizer received
- **Stock-Out transaction**: fertilizer used

Summary is computed from the ledger:
\[
\text{availableKg} = \sum(\text{inKg}) - \sum(\text{outKg})
\]

This is more reliable than storing a single “current stock” number and trying to keep it updated.

## Backend Changes

### 1) Authorization updates (fertilizer companies)
Because you stated “Inventory manager is the one add new fertilizer companies”:
- Update backend route protection to allow `inventory_manager` to create/update/delete fertilizer companies.
  - Example: `authorize('owner', 'inventory_manager')`.

### 2) New model: FertilizerInventoryTransaction
Create `backend/models/FertilizerInventoryTransaction.js`:

**Fields (minimal, practical)**
- `type`: `'IN' | 'OUT'`
- `categoryId`: `ObjectId` (or `String` id if categories are not Mongo IDs in your project)
- `categoryName`: `String` (denormalize for stable reporting)
- `companyId`: `ObjectId` (for IN only; optional for OUT)
- `companyName`: `String` (denormalize)
- `kg`: `Number` (must be > 0)
- `unitPrice`: `Number` (IN only; price per kg)
- `totalPrice`: `Number` (IN only; stored for easy reporting; computed as `kg * unitPrice`)
- `eventAt`: `Date` (date/time stock received or used; defaults to now)
- `purpose`: `String` (OUT only, e.g., “Field A fertilizing”, optional)
- `note`: `String` (optional)
- `createdBy`: `ObjectId` ref `User`
- `factoryId`: optional, only if you want per-factory stock

**Indexes**
- `(categoryId, eventAt)`
- `(type, eventAt)`

### 3) New controller + routes
Create:
- `backend/controllers/fertilizerInventoryController.js`
- `backend/routes/fertilizerInventory.js`

Endpoints (all `auth` required)
- `POST /api/fertilizer-inventory/receive`
  - Access: `inventory_manager` (and optionally `owner`)
  - Body: `{ categoryId, categoryName, companyId, companyName, kg, unitPrice, eventAt?, note? }`
- `POST /api/fertilizer-inventory/use`
  - Access: `inventory_manager` (and optionally `owner`)
  - Body: `{ categoryId, categoryName, kg, eventAt?, purpose?, note? }`
  - Validation: cannot use more than available for that category (prevents negative stock)
- `GET /api/fertilizer-inventory/summary`
  - Access: `inventory_manager` (and optionally `owner`)
  - Returns computed summary + breakdown per fertilizer type.
- `GET /api/fertilizer-inventory/transactions?type=IN|OUT&categoryId=&from=&to=&page=&size=`
  - Access: `inventory_manager` (and optionally `owner`)
  - Returns paginated ledger for audit/history.

### 4) Summary definition (what Inventory Manager should see)
**Global summary**
- `totalAvailableKg`
- `totalReceivedKg`
- `totalUsedKg`
- `totalReceivedValue` (sum of IN `totalPrice`)
- `avgUnitCostOverall` (weighted): `totalReceivedValue / totalReceivedKg` (guard divide-by-zero)
- `lastReceivedAt`
- `lastUsedAt`

**Breakdown by fertilizer category** (rows in a table)
For each category:
- `availableKg`
- `receivedKg`
- `usedKg`
- `avgUnitCost` (weighted for IN txns)
- `lastMovementAt`

> If you want a “stock value” number: `availableKg * avgUnitCost`.

### 5) Wiring into server
Mount route in `backend/server.js`:
- `app.use('/api/fertilizer-inventory', fertilizerInventoryRoutes)`

## Frontend Changes (Inventory Manager only)

### 1) New Inventory Manager page
Create a single page with:
- Summary cards
- Two small forms:
  - **Receive Stock** (kg + unit price + category + company)
  - **Use Stock** (kg + category + eventAt + purpose)
- A simple transactions table (optional, but strongly recommended for traceability)

Suggested route:
- `/inventoryManager/fertilizer-inventory`

Add it to `frontend/src/router/InventoryManagerRoutes.jsx`.

### 2) API client
Create `frontend/src/api/fertilizerInventory.js`:
- `getFertilizerInventorySummary()`
- `receiveFertilizerStock(payload)`
- `useFertilizerStock(payload)`
- `getFertilizerTransactions(params)`

### 3) Dropdown data sources
Reuse existing APIs:
- Fertilizer categories: `GET /api/fertilizer-categories` (already used elsewhere)
- Fertilizer companies:
  - Either `GET /api/fertilizer-companies` or `GET /api/fertilizer-companies/dropdown`

## Validation Rules
- `kg > 0` for both receive/use.
- `unitPrice > 0` for receive.
- For `use`: cannot exceed computed `availableKg` for that category.
- Ensure all endpoints return consistent response shapes (e.g., `{ success, data }`).

## Step-by-step Implementation Plan
1. **Backend: permissions** — allow `inventory_manager` to manage fertilizer companies (create/update/delete).
2. **Backend: model** — add `FertilizerInventoryTransaction`.
3. **Backend: API** — implement receive/use/summary/transactions endpoints with correct auth.
4. **Backend: mount routes** — mount `/api/fertilizer-inventory`.
5. **Frontend: API client** — add `frontend/src/api/fertilizerInventory.js`.
6. **Frontend: Inventory Manager page** — add `frontend/src/pages/InventoryManager/FertilizerInventory/FertilizerInventory.jsx`.
7. **Frontend: route** — add `/inventoryManager/fertilizer-inventory` route.
8. **Smoke test** — receive stock → summary increases; use stock → available decreases; attempt over-use blocked.

## Acceptance Criteria
- Inventory Manager can record a stock receipt with (category, company, kg, unit price, date/time) and it appears in transactions.
- Inventory Manager can record fertilizer usage with (category, kg, date/time, purpose) and it appears in transactions.
- Summary shows accurate **available kg** per fertilizer type and overall totals.
- Over-usage is prevented (no negative stock).
- Fertilizer company management is possible for Inventory Manager (per your requirement).

## Optional (Future)
- Email notification on “Request stock” (can reuse existing `backend/utils/mailer.js`).
- Per-factory fertilizer inventory (if you have multiple factories and want separated stock).
- Export summary/ledger to CSV/PDF.
