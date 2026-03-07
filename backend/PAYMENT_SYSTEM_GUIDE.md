# Payment System Implementation Guide

## Overview

The complete payment system has been implemented for the Tea Factory Management System. This includes backend models, controllers, routes, and integration with the existing frontend.

## System Components

### 1. **Database Models** (7 models created)

#### Payment Model (`backend/models/Payment.js`)
- Manages all types of payments (Monthly, Adhoc, Advance, Fertilizer)
- Tracks payment status from calculation to disbursement
- Stores deductions (advances, fertilizer, transport, loans, others)
- Supports both Bank and Cash payment methods

#### Advance Model (`backend/models/Advance.js`)
- Manages advance payment requests from suppliers
- Tracks status: REQUESTED → APPROVED/REJECTED → PAID
- Links to suppliers and tracks approval workflow

#### Supplier Model (`backend/models/Supplier.js`)
- Stores supplier information and bank details
- Tracks statistics (total supplied, earnings, outstanding advances)
- Links suppliers to routes and user accounts

#### Route Model (`backend/models/Route.js`)
- Manages collection routes for tea leaves
- Assigns drivers and vehicles to routes
- Tracks supplier count and collection schedule

#### TeaRate Model (`backend/models/TeaRate.js`)
- Stores tea pricing information
- Supports quality-based rates (A, B, C, Premium)
- Configurable deduction percentages (bag, water, coarse leaf)
- Transport rate per kg configuration

#### TeaLeafEntry Model (`backend/models/TeaLeafEntry.js`)
- Records daily tea leaf collections
- Calculates net weight after deductions
- Applies quality-based rates
- Tracks from Recorded → Verified → Processed → Paid

#### BankBatch Model (`backend/models/BankBatch.js`)
- Groups bank payments for CSV generation
- Tracks batch status through the banking process
- Stores batch metadata and file information

### 2. **Controllers** (6 controllers created)

#### Payment Controller (`backend/controllers/paymentController.js`)
**Endpoints:**
- `calculateMonthlyPayments` - Calculate payments for a period
- `getMonthlyPaymentsForApproval` - Get calculated payments pending approval
- `approveMonthlyPayments` - Approve multiple payments
- `createAdhocPayment` - Create one-time payment
- `getPendingAdhocPayments` - Get adhoc payments pending approval
- `approveAdhocPayment` - Approve adhoc payment
- `getBankPaymentsQueue` - Get approved bank payments
- `generateBankCsv` - Generate CSV for bank upload
- `downloadBankCsv` - Download generated CSV
- `getBankCsvHistory` - Get CSV generation history
- `getCashPaymentsQueue` - Get approved cash payments
- `getCashPaymentsByRoute` - Get cash payments for a route
- `disburseCash` - Mark cash payments as disbursed
- `getCashCollectionHistory` - Get cash disbursement history
- `getPaymentById` - Get payment details
- `getPaymentsBySupplier` - Get payments for a supplier
- `getPaymentsByRoute` - Get payments for a route
- `getPaymentHistory` - Get payment history with filters

#### Advance Controller (`backend/controllers/advanceController.js`)
**Endpoints:**
- `getAdvancesByStatus` - Get advances by status with pagination
- `getAdvanceDetails` - Get advance details by ID
- `approveAdvance` - Approve an advance request
- `rejectAdvance` - Reject an advance request
- `getAdvanceStatusCounts` - Get count by status
- `createAdvanceRequest` - Create new advance request
- `getAdvancesBySupplier` - Get advances for a supplier

#### Supplier Controller (`backend/controllers/supplierController.js`)
**Endpoints:**
- `getAllSuppliers` - Get all suppliers with filters
- `getSupplierById` - Get supplier details
- `createSupplier` - Create new supplier (with user account)
- `updateSupplier` - Update supplier
- `deleteSupplier` - Deactivate supplier
- `getSuppliersByRoute` - Get suppliers for a route
- `getSupplierStatistics` - Get supplier stats

#### Route Controller (`backend/controllers/routeController.js`)
**Endpoints:**
- `getAllRoutes` - Get all routes with filters
- `getRouteById` - Get route details with suppliers
- `createRoute` - Create new route
- `updateRoute` - Update route
- `deleteRoute` - Deactivate route
- `getRouteStatistics` - Get route statistics
- `updateRouteSupplierCount` - Update supplier count

#### Tea Rate Controller (`backend/controllers/teaRateController.js`)
**Endpoints:**
- `getActiveTeaRate` - Get currently active rate
- `getAllTeaRates` - Get all rates with pagination
- `getTeaRateById` - Get rate details
- `createTeaRate` - Create new rate (auto-deactivates others)
- `updateTeaRate` - Update rate
- `deleteTeaRate` - Delete inactive rate
- `activateTeaRate` - Activate a rate
- `getTeaRateForDate` - Get rate effective on specific date

#### Tea Leaf Entry Controller (`backend/controllers/teaLeafEntryController.js`)
**Endpoints:**
- `getAllTeaLeafEntries` - Get all entries with filters
- `getTeaLeafEntryById` - Get entry details
- `createTeaLeafEntry` - Create new entry (auto-calculates)
- `updateTeaLeafEntry` - Update entry (recalculates if needed)
- `deleteTeaLeafEntry` - Delete unprocessed entry
- `getTeaLeafEntriesBySupplier` - Get entries for supplier
- `getTeaLeafEntriesByRoute` - Get entries for route
- `verifyTeaLeafEntry` - Verify recorded entry
- `bulkCreateTeaLeafEntries` - Create multiple entries

### 3. **Routes** (6 route files created)

All routes are prefixed with `/api` and require authentication:

- `/api/payments` - Payment operations
- `/api/advances` - Advance management
- `/api/suppliers` - Supplier management
- `/api/routes` - Route management
- `/api/tea-rates` - Tea rate configuration
- `/api/tea-leaf-entries` - Tea leaf entry recording

### 4. **Server Configuration**

Routes have been registered in `backend/server.js`:
```javascript
app.use('/api/payments', require('./routes/payments'));
app.use('/api/advances', require('./routes/advances'));
app.use('/api/suppliers', require('./routes/suppliers'));
app.use('/api/routes', require('./routes/routes'));
app.use('/api/tea-rates', require('./routes/teaRates'));
app.use('/api/tea-leaf-entries', require('./routes/teaLeafEntries'));
```

## Database Setup

### Step 1: Initialize Tea Rate

Before using the payment system, create an active tea rate:

**POST** `/api/tea-rates`
```json
{
  "factoryId": "YOUR_FACTORY_ID",
  "effectiveDate": "2025-01-01",
  "defaultRate": 85.0,
  "rates": [
    { "quality": "Premium", "ratePerKg": 95.0 },
    { "quality": "A", "ratePerKg": 85.0 },
    { "quality": "B", "ratePerKg": 75.0 },
    { "quality": "C", "ratePerKg": 65.0 }
  ],
  "transportRatePerKg": 10,
  "bagWeightPercentage": 5,
  "waterWeightPercentage": 3,
  "coarseLeafPercentage": 2,
  "status": "Active",
  "createdBy": "MANAGER_USER_ID",
  "notes": "Initial tea rate configuration"
}
```

### Step 2: Create Routes

**POST** `/api/routes`
```json
{
  "factoryId": "YOUR_FACTORY_ID",
  "routeNumber": "KD-001",
  "routeName": "Kandy Route",
  "area": "Kandy District",
  "description": "Main collection route for Kandy area",
  "collectionDays": ["Monday", "Wednesday", "Friday"],
  "status": "Active"
}
```

### Step 3: Create Suppliers

**POST** `/api/suppliers`
```json
{
  "factoryId": "YOUR_FACTORY_ID",
  "supplierCode": "SUP001",
  "name": "John Farmer",
  "routeId": "ROUTE_ID_FROM_STEP_2",
  "address": "123 Tea Estate Road, Kandy",
  "contactNumber": "0771234567",
  "email": "john@example.com",
  "password": "supplier123",
  "nicNumber": "123456789V",
  "bankDetails": {
    "bankName": "Bank of Ceylon",
    "branchName": "Kandy Branch",
    "accountNumber": "1234567890",
    "accountHolderName": "John Farmer"
  },
  "preferredPaymentMethod": "Bank",
  "status": "Active"
}
```

### Step 4: Record Tea Leaf Entries

**POST** `/api/tea-leaf-entries`
```json
{
  "supplierId": "SUPPLIER_ID_FROM_STEP_3",
  "factoryId": "YOUR_FACTORY_ID",
  "routeId": "ROUTE_ID_FROM_STEP_2",
  "date": "2025-06-15",
  "weight": 125.5,
  "quality": "A",
  "recordedBy": "MANAGER_USER_ID",
  "vehicleNumber": "KA-1234",
  "driverName": "Driver Name",
  "notes": "Good quality leaves"
}
```

## Payment Workflow

### Monthly Payment Process:

1. **Record tea leaf entries** throughout the month
2. **Calculate payments** at month end:
   ```
   POST /api/payments/monthly/calculate
   {
     "factoryId": "FACTORY_ID",
     "month": 6,
     "year": 2025,
     "supplierIds": ["SUP1", "SUP2"] // Optional, calculates for all if empty
   }
   ```

3. **Review calculated payments**:
   ```
   GET /api/payments/monthly/pending-approval?factoryId=FACTORY_ID&month=6&year=2025
   ```

4. **Approve payments**:
   ```
   POST /api/payments/monthly/approve
   {
     "paymentIds": ["PAY1", "PAY2"],
     "approvedBy": "MANAGER_USER_ID"
   }
   ```

5. **Process bank payments**:
   ```
   POST /api/payments/bank/generate-csv
   {
     "factoryId": "FACTORY_ID",
     "paymentIds": ["PAY1", "PAY2"],
     "generatedBy": "MANAGER_USER_ID"
   }
   
   GET /api/payments/bank/csv/BATCH_ID/download
   ```

6. **Disburse cash payments**:
   ```
   POST /api/payments/cash/disburse
   {
     "paymentIds": ["PAY3", "PAY4"],
     "disbursedBy": "MANAGER_USER_ID",
     "receiptNumbers": ["CASH-001", "CASH-002"]
   }
   ```

### Advance Payment Process:

1. **Create advance request** (by supplier or on behalf):
   ```
   POST /api/advances
   {
     "supplierId": "SUPPLIER_ID",
     "factoryId": "FACTORY_ID",
     "requestedAmount": 15000,
     "reason": "Medical emergency",
     "notes": "Urgent advance request"
   }
   ```

2. **Review pending advances**:
   ```
   GET /api/advances/FACTORY_ID/status?status=REQUESTED
   ```

3. **Approve/Reject advance**:
   ```
   PUT /api/advances/ADVANCE_ID/approve
   {
     "approvedAmount": 15000,
     "approvedBy": "MANAGER_USER_ID",
     "notes": "Approved"
   }
   ```

4. Advances are automatically deducted in monthly payment calculations

## Frontend Integration

The frontend already has comprehensive UI components in:
- `frontend/src/pages/PaymentManager/`
- `frontend/src/api/paymentManager.js`

The API calls in `paymentManager.js` now connect to the backend routes created.

## Testing the System

### 1. Start Backend Server:
```bash
cd backend
npm run dev
```

### 2. Test Health Check:
```
GET http://localhost:5000/health
```

### 3. Test Authentication:
First login to get token:
```
POST http://localhost:5000/api/auth/login
{
  "email": "manager@example.com",
  "password": "your_password"
}
```

### 4. Test Payment Endpoints:

Use the token from login in Authorization header:
```
Authorization: Bearer YOUR_TOKEN
```

Test endpoints in order:
1. Create tea rate
2. Create route
3. Create supplier  
4. Create tea leaf entries
5. Calculate monthly payments
6. Approve payments
7. Generate bank CSV
8. Disburse cash

## Key Features

✅ **Complete Payment Calculation**
- Automatic weight deductions (bag, water, coarse leaf)
- Quality-based pricing
- Transport cost calculation
- Advance deductions
- Fertilizer deductions
- Loan deductions

✅ **Advance Management**
- Request/Approval workflow
- Status tracking
- Automatic deduction in payments

✅ **Bank Payment Processing**
- CSV generation for bank upload
- Batch tracking
- Download history

✅ **Cash Payment Processing**
- Route-based disbursement
- Receipt number tracking
- Disbursement history

✅ **Supplier Management**
- User account creation
- Bank details storage
- Statistics tracking

✅ **Route Management**
- Driver/Vehicle assignment
- Supplier grouping
- Collection schedules

✅ **Tea Rate Configuration**
- Quality-based rates
- Deduction percentages
- Historical rate tracking

✅ **Tea Leaf Entry Recording**
- Daily collection tracking
- Automatic calculations
- Quality grading
- Verification workflow

## Security Notes

- All endpoints require authentication via JWT
- Payment approval requires manager role
- CSV generation is logged and tracked
- Supplier bank details are securely stored
- Historical data is preserved

## Database Indexes

All models include optimized indexes for:
- Factory-based queries
- Date-range queries
- Status filtering
- Supplier/Route lookups
- Payment tracking

## Error Handling

All controllers include comprehensive error handling:
- Validation errors (400)
- Not found errors (404)
- Authorization errors (401/403)
- Server errors (500)
- Detailed error messages for debugging

## Next Steps

1. **Test the system** with sample data
2. **Configure frontend** to use new endpoints
3. **Set up initial data** (tea rates, routes, suppliers)
4. **Train users** on the payment workflow
5. **Monitor logs** for any issues

## Support

For issues or questions:
- Check backend console logs
- Verify MongoDB connection
- Ensure all environment variables are set
- Test endpoints with Postman/Thunder Client
- Check frontend API calls match backend routes

---

**System Status**: ✅ Fully Implemented and Ready for Testing
**Database**: ✅ Connected
**Routes**: ✅ Registered
**Controllers**: ✅ Complete
**Models**: ✅ Created with Indexes
**Frontend**: ✅ Already exists and ready to connect
