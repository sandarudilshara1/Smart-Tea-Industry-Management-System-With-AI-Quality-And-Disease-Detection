# Driver Management - Add & Routes Documentation

## 🔧 Fixed Issue
**Problem:** "A driver with this licenseNumber already exists" error was preventing driver creation.

**Solution:** Removed license number uniqueness validation from:
- Backend Model (Driver.js)
- Backend Controller (driverController.js - both create and update methods)
- Error handler for duplicate keys

## 📋 Backend Routes

### Base URL: `/api/drivers`

All routes require authentication (`auth` middleware).

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/` | owner, transport_manager | Create new driver |
| GET | `/` | All authenticated | Get all drivers (with filters) |
| GET | `/:id` | All authenticated | Get single driver by ID |
| PUT | `/:id` | owner, transport_manager | Update driver |
| DELETE | `/:id` | owner, transport_manager | Delete driver (soft delete) |
| POST | `/:id/assign-route` | owner, transport_manager | Assign route to driver |
| DELETE | `/:id/assign-route/:routeId` | owner, transport_manager | Unassign route from driver |

### Route Implementation

**File:** `backend/routes/drivers.js`

```javascript
const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const {
    createDriver,
    getAllDrivers,
    getDriverById,
    updateDriver,
    deleteDriver,
    assignRoute,
    unassignRoute
} = require('../controllers/driverController');

// Protect all routes
router.use(auth);

// Driver CRUD routes
router.post('/', authorize('owner', 'transport_manager'), createDriver);
router.get('/', getAllDrivers);
router.get('/:id', getDriverById);
router.put('/:id', authorize('owner', 'transport_manager'), updateDriver);
router.delete('/:id', authorize('owner', 'transport_manager'), deleteDriver);

// Route assignment
router.post('/:id/assign-route', authorize('owner', 'transport_manager'), assignRoute);
router.delete('/:id/assign-route/:routeId', authorize('owner', 'transport_manager'), unassignRoute);

module.exports = router;
```

## 🎯 Create Driver API

### Endpoint
`POST /api/drivers`

### Authentication Required
Yes - JWT token in Authorization header

### Authorization
Only `owner` and `transport_manager` can create drivers

### Request Body

```json
{
  "userId": "optional-user-id",          // Optional: MongoDB ObjectId
  "name": "John Doe",                    // Required
  "email": "john@example.com",           // Required (unique)
  "phone": "+1234567890",                // Required
  "licenseNo": "DL123456",               // Required (NO LONGER UNIQUE)
  "licenseExpiry": "2025-12-31",         // Optional
  "vehicleNo": "ABC-1234",               // Optional
  "nic": "123456789V",                   // Required
  "address": "123 Main St, City",        // Required
  "status": "Available",                 // Optional (default: "Available")
  "experience": 5,                       // Optional (default: 0)
  "emergencyContact": {                  // Optional
    "name": "Jane Doe",
    "phone": "+9876543210",
    "relationship": "Spouse"
  },
  "factoryId": 1                         // Optional
}
```

### Field Validation

#### Required Fields
- `name`: Driver's full name
- `email`: Valid email address (must be unique)
- `phone`: Contact phone number
- `licenseNo`: Driver's license number (can be duplicate now)
- `nic`: National Identity Card number
- `address`: Full address

#### Optional Fields
- `userId`: Link to User account (if driver has login access)
- `licenseExpiry`: License expiration date
- `vehicleNo`: Assigned vehicle number
- `status`: One of ['Available', 'On Route', 'On Leave', 'Inactive']
- `experience`: Years of driving experience (number)
- `emergencyContact`: Object with name, phone, relationship
- `factoryId`: Factory assignment (number)

### Response

#### Success (201 Created)
```json
{
  "success": true,
  "message": "Driver created successfully",
  "data": {
    "driver": {
      "_id": "507f1f77bcf86cd799439011",
      "userId": "507f1f77bcf86cd799439012",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "licenseNo": "DL123456",
      "licenseExpiry": "2025-12-31T00:00:00.000Z",
      "vehicleNo": "ABC-1234",
      "nic": "123456789V",
      "address": "123 Main St, City",
      "status": "Available",
      "assignedRoutes": [],
      "experience": 5,
      "rating": 0,
      "totalTrips": 0,
      "emergencyContact": {
        "name": "Jane Doe",
        "phone": "+9876543210",
        "relationship": "Spouse"
      },
      "factoryId": 1,
      "isActive": true,
      "createdAt": "2025-01-15T10:30:00.000Z",
      "updatedAt": "2025-01-15T10:30:00.000Z"
    }
  }
}
```

#### Error (400 Bad Request)
```json
{
  "success": false,
  "message": "Please provide all required fields"
}
```

OR

```json
{
  "success": false,
  "message": "Driver with this email already exists"
}
```

## 🎨 Frontend Implementation

### Files Involved

#### API Client
**File:** `frontend/src/api/driver.js`

```javascript
// Create a new driver
export const createDriver = async (driverData) => {
    try {
        const response = await axios.post('/drivers', driverData);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Failed to create driver' };
    }
};
```

#### Main Component
**File:** `frontend/src/pages/FactoryManager/Drivers/DriverManagement.jsx`

```javascript
// Handler for creating driver
const handleCreateDriver = () => {
  setEditingDriver(null);
  setShowDriverModal(true);
};

// Handler for submitting driver form
const handleDriverSubmit = async (driverData) => {
  try {
    if (editingDriver) {
      // Update existing driver
      const response = await updateDriverAPI(editingDriver._id, driverData);
      if (response.success) {
        setDrivers((prev) =>
          prev.map((d) =>
            d._id === editingDriver._id ? response.data.driver : d
          )
        );
      }
    } else {
      // Create new driver
      const response = await createDriverAPI(driverData);
      if (response.success) {
        setDrivers((prev) => [...prev, response.data.driver]);
      }
    }
    setShowDriverModal(false);
    setEditingDriver(null);
  } catch (err) {
    console.error('Error saving driver:', err);
    alert(err.message || 'Failed to save driver');
  }
};
```

#### Modal Component
**File:** `frontend/src/pages/FactoryManager/Drivers/DriverModal.jsx`

This component provides the form for adding/editing driver details.

### UI Flow

1. User clicks "Add Driver" button
2. `DriverModal` opens with empty form
3. User fills in required fields:
   - Name
   - Email (must be unique)
   - Phone
   - License Number (can be duplicate)
   - NIC
   - Address
4. Optional fields can be filled
5. User submits form
6. Frontend calls `createDriver()` API
7. Backend validates and creates driver
8. Success: Driver added to list
9. Error: Display error message

## 🔐 Database Model

**File:** `backend/models/Driver.js`

### Schema Structure

```javascript
{
  userId: ObjectId,              // Reference to User model (optional)
  name: String,                  // Required
  email: String,                 // Required, unique
  phone: String,                 // Required
  licenseNo: String,             // Required, NOT UNIQUE ANYMORE
  licenseExpiry: Date,           // Optional
  vehicleNo: String,             // Optional
  nic: String,                   // Required
  address: String,               // Required
  status: String,                // Enum: ['Available', 'On Route', 'On Leave', 'Inactive']
  assignedRoutes: [{             // Array of route assignments
    routeId: String,
    routeName: String,
    assignedDate: Date
  }],
  experience: Number,            // Default: 0
  rating: Number,                // Default: 0, Range: 0-5
  totalTrips: Number,            // Default: 0
  emergencyContact: {            // Optional
    name: String,
    phone: String,
    relationship: String
  },
  factoryId: Number,             // Optional
  isActive: Boolean,             // Default: true (for soft delete)
  timestamps: true               // Adds createdAt and updatedAt
}
```

### Indexes
- `email`: Unique index (automatic from unique: true)
- `status`: Regular index for faster queries
- `factoryId`: Regular index for filtering by factory

## ✅ Testing the Fix

### Using PowerShell

```powershell
# Test creating a driver with duplicate license number
$headers = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer YOUR_JWT_TOKEN"
}

$body = @{
    name = "Test Driver"
    email = "test@example.com"
    phone = "+1234567890"
    licenseNo = "DL123456"  # Can be duplicate now
    nic = "987654321V"
    address = "Test Address"
    status = "Available"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/drivers" -Method POST -Headers $headers -Body $body
```

### Expected Behavior

✅ **BEFORE FIX:** Error if license number already exists
✅ **AFTER FIX:** Driver created successfully even with duplicate license number

## 📝 Notes

1. **Email is still unique** - Only one driver per email address
2. **License numbers can be duplicate** - Multiple drivers can have same license number
3. **Soft delete** - Deleted drivers are marked as `isActive: false`, not removed from database
4. **Status values** - Must be one of: 'Available', 'On Route', 'On Leave', 'Inactive'
5. **Authorization** - Only owners and transport managers can create/update/delete drivers
6. **All users can view** - Any authenticated user can view driver list

## 🚀 How to Use

### Adding a Driver

1. **Via UI:**
   - Navigate to Factory Manager → Drivers
   - Click "Add Driver" button
   - Fill in the form
   - Submit

2. **Via API:**
   ```javascript
   import { createDriver } from '@/api/driver';
   
   const newDriver = {
     name: "John Doe",
     email: "john@example.com",
     phone: "+1234567890",
     licenseNo: "DL123456",
     nic: "123456789V",
     address: "123 Main St"
   };
   
   const result = await createDriver(newDriver);
   ```

### Updating a Driver

```javascript
import { updateDriver } from '@/api/driver';

const updatedData = {
  phone: "+9876543210",
  status: "On Route"
};

const result = await updateDriver(driverId, updatedData);
```

### Filtering Drivers

```javascript
import { getAllDrivers } from '@/api/driver';

// Get all available drivers
const result = await getAllDrivers({ status: 'Available' });

// Get drivers from specific factory
const result = await getAllDrivers({ factoryId: 1 });
```

## 🔄 Backend Flow

1. **Request arrives** at POST `/api/drivers`
2. **Auth middleware** validates JWT token
3. **Authorize middleware** checks user role (owner/transport_manager)
4. **Controller** `createDriver()` function executes:
   - Validates required fields
   - Checks if email already exists (⚠️ email must be unique)
   - ~~Checks if license number exists~~ (✅ REMOVED)
   - Creates driver in database
   - Returns success response
5. **Error handling** catches validation and database errors

## 🎯 Summary of Changes

### What Was Changed
- ✅ Removed `unique: true` from `licenseNo` field in Driver model
- ✅ Removed manual license number duplicate check in `createDriver()`
- ✅ Removed license number validation in `updateDriver()`
- ✅ Updated duplicate key error handler to not mention license number

### What Remains Unchanged
- ✅ Email uniqueness validation (still required)
- ✅ All other validations
- ✅ Authorization checks
- ✅ API routes structure
- ✅ Frontend components

### Impact
- 🟢 Multiple drivers CAN now have the same license number
- 🟢 Multiple drivers CANNOT have the same email address
- 🟢 All other functionality remains the same
