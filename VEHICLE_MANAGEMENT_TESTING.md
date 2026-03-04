# Vehicle Management - Testing Guide

## Issues Fixed ✅
1. **Route Capitalization**: Fixed inconsistent path capitalization
   - Changed `/transportManager/Vehicle/add` → `/transportManager/vehicle/add`
   - Changed `/transportManager/Vehicle/view/:id` → `/transportManager/vehicle/view/:id`

## Backend Setup

### 1. Start Backend Server
```bash
cd backend
npm run dev
```

**Expected Output:**
```
✅ Connected to MongoDB
🚀 Server is running on port 5000
```

### 2. Verify Backend Routes
The following routes are registered in `server.js`:
- ✅ `/api/vehicles` - Vehicle management endpoints

## Frontend Setup

### 1. Start Frontend
```bash
cd frontend
npm run dev
```

### 2. Navigate to Add Vehicle
**URL:** `http://localhost:5173/transportManager/vehicle/add`

**Route:** `/transportManager/vehicle/add` (lowercase 'v')

## Testing Steps

### Test 1: Add New Vehicle
1. Login as Transport Manager or Owner
2. Navigate to: **Transport Manager Dashboard → Vehicle Management**
3. Click **"New Vehicle"** button
4. Fill in required fields:
   - **Vehicle Number**: TRK-001
   - **Vehicle Type**: Truck
   - **Model**: Tata Ace
   - **Capacity**: 1000kg
5. Click **"Register Vehicle"**
6. Should see success notification
7. Should redirect to vehicle list

### Test 2: View Vehicle List
1. Navigate to: `/transportManager/vehicle`
2. Should see:
   - Statistics cards (Total, Available, Maintenance)
   - Search bar
   - Status filter
   - Vehicle table with data

### Test 3: Driver Assignment
1. In Add Vehicle form
2. Select a driver from "Assigned Driver" dropdown
3. Driver list should load from `/api/drivers?status=Active`
4. Submit form
5. Check that both vehicle and driver records are updated

## API Endpoints

### 1. Create Vehicle
**POST** `/api/vehicles`

**Request Body:**
```json
{
  "vehicleNumber": "TRK-001",
  "vehicleType": "Truck",
  "model": "Tata Ace",
  "capacity": "1000kg",
  "status": "Available",
  "driverId": "507f1f77bcf86cd799439011" // Optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "Vehicle created successfully",
  "data": { ... }
}
```

### 2. Get All Vehicles
**GET** `/api/vehicles`

**Query Parameters:**
- `status` - Filter by status (Available, In Use, Maintenance, Unavailable)
- `vehicleType` - Filter by type
- `isActive` - Filter active vehicles

### 3. Get Vehicle Stats
**GET** `/api/vehicles/stats/summary`

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 10,
    "available": 5,
    "inUse": 3,
    "maintenance": 2,
    "byType": [...]
  }
}
```

## Common Issues & Solutions

### Issue 1: "Cannot GET /transportManager/Vehicle/add"
**Solution:** ✅ FIXED - Route paths now use lowercase 'vehicle'

### Issue 2: "Network Error" or "Failed to fetch"
**Solution:** 
- Ensure backend is running on port 5000
- Check CORS configuration in `backend/server.js`
- Verify `VITE_API_BASE` in frontend `.env` file

### Issue 3: "401 Unauthorized"
**Solution:**
- Login as Transport Manager or Owner
- Check JWT token in localStorage: `localStorage.getItem('authToken')`
- Verify token is being sent in Authorization header

### Issue 4: Driver dropdown not loading
**Solution:**
- Ensure Driver backend API is running: `/api/drivers`
- Check browser console for errors
- Verify getAllDrivers function in `frontend/src/api/driver.js`

### Issue 5: Duplicate index warning
**Solution:**
- This is just a warning, not an error
- Can be ignored or remove `{ unique: true }` from vehicleNumber field in model

## File Checklist

### Backend Files ✅
- [x] `backend/models/Vehicle.js`
- [x] `backend/controllers/vehicleController.js`
- [x] `backend/routes/vehicles.js`
- [x] `backend/server.js` (route registered)

### Frontend Files ✅
- [x] `frontend/src/api/vehicle.js`
- [x] `frontend/src/pages/TransportManager/Vehicle/VehicleList.jsx`
- [x] `frontend/src/pages/TransportManager/Vehicle/AddVehicle.jsx`
- [x] `frontend/src/router/TransportManagerRoutes.jsx`

## Testing Checklist

- [ ] Backend server starts without errors
- [ ] Can access vehicle list page
- [ ] Statistics cards show correct data
- [ ] Can click "New Vehicle" button
- [ ] Add Vehicle form loads
- [ ] Driver dropdown loads active drivers
- [ ] Can submit form successfully
- [ ] Success notification appears
- [ ] Redirects to vehicle list after success
- [ ] New vehicle appears in list
- [ ] Can edit vehicle
- [ ] Can delete vehicle
- [ ] Can filter by status
- [ ] Can search vehicles

## Database Check

Test vehicle creation directly in MongoDB:
```javascript
use teaFactoryDB;
db.vehicles.find().pretty();
db.vehicles.countDocuments();
```

## Browser Console Commands

Check if API is accessible:
```javascript
// Check auth token
console.log(localStorage.getItem('authToken'));

// Test API call
fetch('http://localhost:5000/api/vehicles', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('authToken')
  }
}).then(r => r.json()).then(console.log);
```

## Next Steps
1. Start both backend and frontend servers
2. Login as Transport Manager
3. Navigate to Vehicle Management
4. Click "New Vehicle"
5. Test adding a vehicle

If you encounter any errors, check:
- Browser console (F12)
- Backend terminal output
- Network tab in browser DevTools
