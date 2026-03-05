# Add Driver - Working Example

## ✅ Fixed Issues:
1. **Old problem**: Used wrong API (auth register instead of driver API)
2. **Old problem**: Two-step process with confusing workflows  
3. **New solution**: Single form with proper driver API integration

## 📋 Required Fields:
- **Full Name** - Driver's complete name
- **Email** - Unique email address (no duplicates)
- **Phone** - 10-digit phone number
- **License Number** - Driver's license number
- **NIC** - National Identity Card number
- **Address** - Full residential address

## 📝 Fresh Example Data (Use These Instead):

> ⚠️ **Important**: If you get "licenseNumber already exists", the example data is already in your database. Use one of these fresh examples below:

### Example 1 (Fresh):
```
Full Name: Chaminda Rajapaksa
Email: chaminda.rajapaksa@teafactory.com
Phone: 0763456789
License Number: C9988776
NIC: 921234567V
Address: 67 Negombo Road, Gampaha
Vehicle Number: WP EF-4567 (optional)
License Expiry: 2028-06-30 (optional)
Experience: 8 (optional)
Status: Available

Emergency Contact (optional):
  Name: Saman Rajapaksa
  Phone: 0714567890
  Relationship: Father
```

### Example 2 (Fresh):
```
Full Name: Dinesh Jayawardena
Email: dinesh.j@teafactory.com
Phone: 0778899001
License Number: D5544332
NIC: 900987654V
Address: 234 Kandy Road, Kadawatha
Vehicle Number: WP GH-8901 (optional)
License Expiry: 2027-09-15 (optional)
Experience: 6 (optional)
Status: Available

Emergency Contact (optional):
  Name: Kumari Jayawardena
  Phone: 0762233445
  Relationship: Mother
```

### Example 3 (Fresh):
```
Full Name: Pradeep Gamage
Email: pradeep.gamage@teafactory.com
Phone: 0756677889
License Number: E7711223
NIC: 881122334V
Address: 89 High Level Road, Colombo 06
Vehicle Number: WP IJ-2345 (optional)
License Expiry: 2029-12-31 (optional)
Experience: 12 (optional)
Status: Available

Emergency Contact (optional):
  Name: Ruwan Gamage
  Phone: 0789900112
  Relationship: Brother
```

## 🚀 How to Add a Driver:

### Step 1: Navigate to Driver Management
- Go to Transport Manager Dashboard
- Click "Driver Management" or navigate to `/transportManager/drivers`

### Step 2: Click "Add New Driver"
- Green button in the top right corner
- This opens the Add Driver form at `/transportManager/drivers/add`

### Step 3: Fill in the Form
**Required Fields (marked with *):**
1. Full Name: `Chaminda Rajapaksa`
2. Email: `chaminda.rajapaksa@teafactory.com`
3. Phone: `0763456789`
4. License Number: `C9988776` ← **Use this fresh one!**
5. NIC: `921234567V`
6. Address: `67 Negombo Road, Gampaha`

**Optional Fields:**
- Vehicle Number: `WP EF-4567`
- License Expiry Date: Select a future date (e.g., 2028-06-30)
- Experience: `8` (years)
- Status: Choose from dropdown (Available, On Route, On Leave, Inactive)
- Emergency Contact: Name, Phone, Relationship

### Step 4: Submit
- Click the "Add Driver" button at the bottom
- Success notification appears
- Automatically redirects to driver list

## 🔧 Technical Details:

### API Endpoint Used:
```
POST /api/drivers
```

### Payload Structure:
```json
{
  "name": "Chaminda Rajapaksa",
  "email": "chaminda.rajapaksa@teafactory.com",
  "phone": "0763456789",
  "licenseNo": "C9988776",
  "nic": "921234567V",
  "address": "67 Negombo Road, Gampaha",
  "vehicleNo": "WP EF-4567",
  "licenseExpiry": "2028-06-30",
  "experience": 8,
  "status": "Available",
  "emergencyContact": {
    "name": "Saman Rajapaksa",
    "phone": "0714567890",
    "relationship": "Father"
  }
}
```

### Backend Model (Driver Schema):
```javascript
{
  name: String (required),
  email: String (required, unique),
  phone: String (required),
  licenseNo: String (required),
  nic: String (required),
  address: String (required),
  vehicleNo: String (optional),
  licenseExpiry: Date (optional),
  status: Enum ['Available', 'On Route', 'On Leave', 'Inactive'],
  experience: Number (years),
  emergencyContact: {
    name: String,
    phone: String,
    relationship: String
  }
}
```

## ⚠️ Common Errors & Solutions:

### Error: "A driver with this licenseNumber already exists"
- **Cause**: License number is already registered in the system
- **Solution**: 
  1. ✅ **This is GOOD** - validation is working!
  2. Use a different license number from the **Fresh Examples** above
  3. Try `C9988776`, `D5544332`, or `E7711223` instead
  4. Never reuse existing license numbers (they must be unique)

### Error: "Email already exists"
- **Cause**: Another driver with the same email
- **Solution**: Use a unique email address

### Error: "Phone number is required"
- **Cause**: Phone field is empty or invalid format
- **Solution**: Enter exactly 10 digits (e.g., 0771234567)

### Error: "License number is required"
- **Cause**: License number field is empty
- **Solution**: Enter the driver's license number

### Error: "Failed to add driver"
- **Cause**: Server or network issue
- **Solution**: 
  1. Check backend server is running on port 5000
  2. Check console for detailed error message
  3. Verify you're logged in with proper role (transport_manager or owner)

## 🎯 What Changed:

### Before (Broken):
- `AddDriverUser.jsx` - Created User account, NOT Driver
- `AddDriverDetails.jsx` - Never connected to backend
- Two-step confusing process
- Wrong API endpoints

### After (Working):
- `AddDriver.jsx` - Single comprehensive form
- Uses proper `/api/drivers` endpoint
- All required fields properly validated
- Emergency contact support
- Success/error notifications
- Auto-redirect on success

## 🧪 Test It Now:

1. Backend running? Check: `netstat -ano | findstr :5000`
2. Navigate to: http://localhost:5173/transportManager/drivers
3. Click "Add New Driver"
4. **Use fresh example data above** (not the old B1234567!)
5. Try **Example 1** with license `C9988776`
6. Submit and check success!

## 📞 More Fresh Examples:

### Example 4:
```
Name: Anura Wickramasinghe
Email: anura.w@teafactory.com
Phone: 0741122334
License: F3366998
NIC: 951234567V
Address: 156 Baseline Road, Colombo 09
Vehicle: WP KL-6789
Experience: 4
Status: Available
```

### Example 5:
```
Name: Tharaka Bandara
Email: tharaka.bandara@teafactory.com
Phone: 0767788990
License: G8899771
NIC: 870011223V
Address: 45 Old Kottawa Road, Maharagama
Vehicle: WP MN-3456
Experience: 15
Status: On Route
```

### Example 6:
```
Name: Janaka Perera
Email: janaka.p@teafactory.com
Phone: 0759988776
License: H1122884
NIC: 931234567V
Address: 78 Station Road, Negombo
Vehicle: WP OP-7890
Experience: 7
Status: Available
```
