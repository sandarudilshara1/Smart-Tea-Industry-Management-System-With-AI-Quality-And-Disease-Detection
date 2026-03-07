## Tea Flavor Quality & Price Calculator - Quick Setup Guide

### ✅ What's Been Created

**Backend (Node.js + MongoDB):**
1. ✅ `backend/models/TeaFlavorQualityCalculation.js` - MongoDB schema with indexes & aggregation methods
2. ✅ `backend/controllers/teaFlavorQualityController.js` - Business logic with quality calculation engine
3. ✅ `backend/routes/teaFlavorQuality.js` - 8 protected API endpoints
4. ✅ `backend/server.js` - Updated with route registration

**Frontend (React):**
1. ✅ `frontend/src/api/teaFlavorQuality.js` - Axios API client with 8 functions
2. ✅ `frontend/src/pages/TeaFlavorQualityCalculator.jsx` - Full-featured React component

**Documentation:**
1. ✅ `TEA_FLAVOR_QUALITY_CALCULATOR_DOCUMENTATION.md` - Complete technical documentation

---

### 🚀 How to Use

#### 1. Start Backend (if not running)
```bash
cd backend
npm run dev
```

#### 2. Start Frontend (if not running)
```bash
cd frontend
npm run dev
```

#### 3. Navigate to Component
Visit: `http://localhost:5173/tea-flavor-quality`
(or add route link as shown below)

#### 4. Add to Navigation (Optional)
Find your navigation/menu component and add:
```jsx
<Link to="/tea-flavor-quality">
  <BarChart3 className="w-5 h-5" />
  Tea Quality Calculator
</Link>
```

#### 5. Add Route to Your Router
In `frontend/src/router/AppRouter.jsx` or your route configuration:

```jsx
import TeaFlavorQualityCalculator from '../pages/TeaFlavorQualityCalculator';

// Add this route:
{
  path: '/tea-flavor-quality',
  element: <TeaFlavorQualityCalculator />
}
```

---

### 📊 System Features

**Quality Calculator:**
- Input 8 quality parameters (particle size, moisture, color, aroma, taste, solubility, caffeine, fineness)
- Select tea flavor type (7 options)
- Automatic quality score calculation
- Dynamic grade assignment (A+ to D)
- Real-time pricing with multipliers
- Save calculations to database

**History Management:**
- View all saved calculations
- Search by ID, flavor, or grade
- Filter by grade (A+, A, A-, B+, B, B-, C, D)
- Download PDF reports
- Delete records with confirmation
- Pagination support

**Statistics Dashboard:**
- Today's assessment metrics
- Average quality score
- Premium grades count
- Price analytics
- 30-day grade distribution
- Grade-wise performance table

---

### 🔌 API Endpoints

All endpoints require JWT authentication (Bearer token)

```
GET    /api/tea-flavor-quality/flavors/list           - Available tea flavors
POST   /api/tea-flavor-quality                        - Create new calculation
GET    /api/tea-flavor-quality                        - Get all calculations
GET    /api/tea-flavor-quality/recent/list            - Get recent calculations
GET    /api/tea-flavor-quality/stats/overview         - Get statistics
GET    /api/tea-flavor-quality/:id                    - Get specific calculation
PUT    /api/tea-flavor-quality/:id                    - Update calculation
DELETE /api/tea-flavor-quality/:id                    - Delete calculation
```

---

### 💾 Database Collections

**TeaFlavorQualityCalculations:**
- Stores all quality assessments
- Indexed on: userId + createdAt, grade + createdAt, status
- Automatic timestamps (createdAt, updatedAt)
- User-scoped data (only access own records)

---

### 🍵 7 Tea Flavor Types

Each with unique quality standards and base prices:

1. **Black Tea Powder** - Rs 28,000/kg
2. **Green Tea Powder** - Rs 32,000/kg
3. **Oolong Tea Powder** - Rs 35,000/kg
4. **White Tea Powder** - Rs 40,000/kg
5. **Matcha Tea Powder** - Rs 50,000/kg (Premium)
6. **Chai Spice Tea Powder** - Rs 26,000/kg
7. **Earl Grey Tea Powder** - Rs 33,000/kg

---

### 📈 Quality Grading System

| Score | Grade | Label | Price Multiplier |
|-------|-------|-------|------------------|
| 95%+ | A+ | Premium Grade | 1.35x |
| 90%+ | A | Superior Grade | 1.25x |
| 85%+ | A- | High Grade | 1.15x |
| 80%+ | B+ | Good Grade | 1.05x |
| 75%+ | B | Standard Grade | 1.0x |
| 70%+ | B- | Commercial Grade | 0.9x |
| 60%+ | C | Low Grade | 0.75x |
| <60% | D | Reject Grade | 0.5x |

---

### 💻 Technology Stack

**Backend:**
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- RESTful API

**Frontend:**
- React 18+
- Axios
- Lucide React Icons
- jsPDF (PDF export)
- Tailwind CSS

---

### 🧪 Testing Checklist

After setup, test these features:

- [ ] Can see calculator form with all 8 parameters
- [ ] Can select different tea flavors
- [ ] Calculation result displays with grade and score
- [ ] Can save calculation to database
- [ ] Can view calculation history
- [ ] Can search and filter calculations
- [ ] Can download PDF report
- [ ] Can delete calculations
- [ ] Statistics page loads with data
- [ ] All filters and searches work correctly
- [ ] PDF exports contain correct data
- [ ] Responsive design works on mobile

---

### 🐛 Troubleshooting

**Issue: Backend not starting**
```
Error: listen EADDRINUSE: address already in use :::5000

Solution: Kill process or use different port
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

**Issue: API calls failing**
```
Check:
1. Backend is running on port 5000
2. JWT token is valid
3. User is authenticated
4. Check browser Network tab for details
```

**Issue: MongoDB connection error**
```
Check:
1. MongoDB is running
2. Connection URI is correct in .env
3. Network access/firewall settings
4. Database user credentials
```

**Issue: Component not loading**
```
Check:
1. Route is added to router
2. File paths are correct
3. No import errors in console
4. Component dependencies installed
```

---

### 📝 Example Usage

#### 1. Calculator Workflow
1. Select tea flavor: "Green Tea Powder"
2. Enter quality parameters:
   - Particle Size: 92 mesh
   - Moisture: 3.2%
   - Color Value: 85
   - Aroma Power: 8.5/10
   - Taste Strength: 8/10
   - Solubility: 96%
   - Caffeine: 2.8%
   - Powder Fineness: 95%
3. Batch Weight: 50 kg
4. Click "Calculate Quality"
5. See results: Grade A (91.5% quality score)
6. Adjusted Price: Rs 40,000/kg
7. Total Batch Value: Rs 2,000,000
8. Click "Save Calculation"

#### 2. History Workflow
1. Click "View History"
2. See table of all calculations
3. Search or filter by grade
4. Click eye icon to view details
5. Click download to get PDF
6. Click trash to delete (with confirmation)

#### 3. Statistics Workflow
1. Click "Statistics"
2. View today's metrics (5 cards)
3. See grade distribution
4. View performance table

---

### 🎓 Learning Resources

The system demonstrates:
- Full CRUD operations
- RESTful API design
- MongoDB aggregation pipelines
- React hooks (useState, useEffect)
- Form handling and validation
- Pagination
- PDF generation
- JWT authentication
- Error handling
- Responsive design

---

### 📞 Support Notes

- All data is user-scoped (JWT based)
- No sample data seeding needed (create as you use)
- Backward compatible with existing system
- Can be integrated with payment system
- Ready for production deployment

---

**Ready to use!** Navigate to `/tea-flavor-quality` in your app.
