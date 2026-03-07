# Tea Disease Detection System - Documentation

## Overview
Complete backend and frontend implementation for Tea Disease Detection with MongoDB integration, providing real-time disease analysis, detection history, and comprehensive reporting.

## System Architecture

### Backend Components

#### 1. Database Model (`backend/models/DiseaseDetection.js`)
MongoDB schema for storing disease detection records:

**Key Fields:**
- `userId`: Reference to User who performed detection
- `diseaseType`: Enum ['BB', 'RR', 'RSM', 'GL'] - Disease codes
- `diseaseName`: Full disease name
- `confidence`: Detection confidence score (0-100)
- `imagePath`: Path/URL to analyzed image
- `severity`: Disease severity level
- `symptoms`: Array of observed symptoms
- `immediateActions`: Array of immediate treatment steps
- `preventiveMeasures`: Array of prevention steps
- `status`: Enum ['pending', 'treated', 'healthy', 'monitoring']
- `treatmentPlan`: Object containing treatment plan details
- `analyzedBy`: Object with user name and role
- `timestamps`: Automatic createdAt and updatedAt fields

**Indexes:**
- `userId` + `createdAt` (descending)
- `diseaseType`
- `status`
- `createdAt` (descending)

**Methods:**
- `markAsTreated()`: Updates status and treatment completion
- `createTreatmentPlan(planDetails)`: Creates treatment plan

**Static Methods:**
- `getStatisticsByUser(userId, startDate, endDate)`: Aggregate statistics
- `getDailyStatistics()`: Today's detection statistics

#### 2. Controller (`backend/controllers/diseaseDetectionController.js`)

**Disease Database:**
Built-in disease information for:
- **BB (Brown Blight)**: High severity fungal disease
- **RR (Red Rust)**: Medium severity algal infection  
- **RSM (Red Spider Mite)**: High severity pest infestation
- **GL (Green Leaf)**: Healthy leaf indicator

**API Functions:**

1. **createDetection** - `POST /api/disease-detections`
   - Creates new detection record
   - Auto-populates disease information from database
   - Requires: diseaseType, confidence, imagePath
   - Returns: Created detection object

2. **getAllDetections** - `GET /api/disease-detections`
   - Retrieves all detections with filters
   - Query params: diseaseType, status, startDate, endDate, limit, page
   - Supports pagination
   - Role-based filtering (non-admin users see only their own)

3. **getDetectionById** - `GET /api/disease-detections/:id`
   - Retrieves single detection
   - Includes authorization check
   - Populates user information

4. **updateDetection** - `PUT /api/disease-detections/:id`
   - Updates status, notes, treatment plan
   - Authorization required
   - Returns updated detection

5. **deleteDetection** - `DELETE /api/disease-detections/:id`
   - Deletes detection record
   - Owner/admin/creator only
   - Permanent deletion

6. **getStatistics** - `GET /api/disease-detections/statistics/summary`
   - Comprehensive statistics
   - Groups by disease type and status
   - Daily statistics included
   - Query params: startDate, endDate, userId

7. **markAsTreated** - `PATCH /api/disease-detections/:id/treat`
   - Quick status update to 'treated'
   - Uses model method

8. **createTreatmentPlan** - `POST /api/disease-detections/:id/treatment-plan`
   - Creates treatment plan
   - Requires planDetails in body
   - Timestamps creation

9. **getRecentDetections** - `GET /api/disease-detections/recent/list`
   - Recent detections for widgets
   - Query param: limit (default 10)
   - Minimal fields for performance

#### 3. Routes (`backend/routes/diseaseDetections.js`)
All routes protected with JWT authentication middleware.

**Route Structure:**
```
/api/disease-detections
├── GET    /                          - Get all detections
├── POST   /                          - Create detection
├── GET    /statistics/summary        - Get statistics
├── GET    /recent/list               - Get recent detections
├── GET    /:id                       - Get detection by ID
├── PUT    /:id                       - Update detection
├── DELETE /:id                       - Delete detection
├── PATCH  /:id/treat                 - Mark as treated
└── POST   /:id/treatment-plan        - Create treatment plan
```

**Route Registration:**
Added to `server.js`:
```javascript
app.use('/api/disease-detections', require('./routes/diseaseDetections'));
```

### Frontend Components

#### 4. API Client (`frontend/src/api/diseaseDetection.js`)

**Functions:**

1. **createDetection(detectionData)**
   - Creates new detection record
   - Parameters: diseaseType, confidence, imagePath, imageUploadMethod, location, notes, processingTime

2. **getAllDetections(params)**
   - Retrieves detections with filters
   - Parameters: diseaseType, status, startDate, endDate, limit, page

3. **getDetectionById(id)**
   - Retrieves single detection by ID

4. **updateDetection(id, updateData)**
   - Updates detection record
   - Parameters: status, notes, treatmentPlan

5. **deleteDetection(id)**
   - Deletes detection record

6. **getStatistics(params)**
   - Gets statistics summary
   - Parameters: startDate, endDate, userId

7. **markAsTreated(id)**
   - Quick status update to treated

8. **createTreatmentPlan(id, planDetails)**
   - Creates treatment plan for detection

9. **getRecentDetections(limit)**
   - Gets recent detections (default 10)

10. **getDailyStatistics()**
    - Gets today's statistics

11. **simulateAIAnalysis(imageFile)**
    - Client-side AI simulation
    - Returns: diseaseType, confidence, processingTime
    - 3-second delay simulation

#### 5. Updated Component (`frontend/src/pages/TeaDiseaseDetection.jsx`)

**New Features:**

1. **Backend Integration:**
   - Fetches real detections from database
   - Displays live statistics
   - Saves detections to MongoDB
   - Real-time data updates

2. **State Management:**
   ```jsx
   const [allDetections, setAllDetections] = useState([])
   const [statistics, setStatistics] = useState({...})
   const [loading, setLoading] = useState(false)
   const [isSaving, setIsSaving] = useState(false)
   const [uploadMethod, setUploadMethod] = useState('upload')
   ```

3. **New Functions:**
   - `fetchDetections()`: Loads detections from backend
   - `fetchStatistics()`: Loads daily statistics
   - `saveDetectionToBackend()`: Saves analysis results
   - `handleMarkAsTreated(id)`: Updates detection status
   - `handleCreateTreatmentPlan(id)`: Creates treatment plan

4. **Enhanced UI:**
   - Real-time statistics display
   - Save button with loading state
   - Upload method tracking (upload vs camera)
   - Backend-powered detection history
   - Treatment plan creation

5. **Data Flow:**
   ```
   Image Upload → AI Analysis → Save to Backend → Refresh List → Update Statistics
   ```

## Disease Types

| Code | Name | Scientific Name | Severity | Impact |
|------|------|----------------|----------|---------|
| BB | Brown Blight | Colletotrichum gloeosporioides | High | 20-30% yield loss |
| RR | Red Rust | Cephaleuros parasiticus | Medium | 10-15% quality degradation |
| RSM | Red Spider Mite | Oligonychus coffeae | High | 15-25% yield loss |
| GL | Healthy Leaf | No disease detected | None | Optimal quality |

## Usage Examples

### Creating a Detection (Frontend)
```javascript
const detectionData = {
  diseaseType: 'BB',
  confidence: 92.5,
  imagePath: imageBase64,
  imageUploadMethod: 'camera',
  processingTime: 2800
};

const response = await diseaseAPI.createDetection(detectionData);
```

### Getting Statistics
```javascript
const stats = await diseaseAPI.getStatistics({
  startDate: '2026-01-01',
  endDate: '2026-03-31'
});

console.log(stats.data.byDisease); // Disease breakdown
console.log(stats.data.daily);     // Today's stats
```

### Marking as Treated
```javascript
await diseaseAPI.markAsTreated(detectionId);
```

### Creating Treatment Plan
```javascript
const plan = "Apply copper fungicide twice daily for 7 days...";
await diseaseAPI.createTreatmentPlan(detectionId, plan);
```

## API Response Formats

### Detection Object
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "userId": "507f1f77bcf86cd799439012",
  "diseaseType": "BB",
  "diseaseName": "Brown Blight",
  "diseaseFullName": "Colletotrichum gloeosporioides",
  "confidence": 94.2,
  "imagePath": "/uploads/leaf-12345.jpg",
  "imageUploadMethod": "camera",
  "severity": "High",
  "symptoms": ["Brown/black lesions on leaves", "..."],
  "impact": "20-30% yield loss",
  "immediateActions": ["Apply copper-based fungicide", "..."],
  "preventiveMeasures": ["Regular pruning", "..."],
  "status": "pending",
  "analyzedBy": {
    "name": "John Silva",
    "role": "factory_manager"
  },
  "createdAt": "2026-03-07T10:30:00Z",
  "updatedAt": "2026-03-07T10:30:00Z"
}
```

### Statistics Response
```json
{
  "success": true,
  "data": {
    "total": 150,
    "healthy": 89,
    "diseased": 61,
    "byDisease": [
      {
        "_id": "BB",
        "count": 25,
        "avgConfidence": 91.5,
        "diseaseName": "Brown Blight"
      }
    ],
    "byStatus": [
      {"_id": "treated", "count": 45},
      {"_id": "pending", "count": 16}
    ],
    "daily": {
      "totalScans": 12,
      "diseasesFound": 5,
      "healthyLeaves": 7,
      "avgConfidence": 93.2
    }
  }
}
```

## Authentication & Authorization

All disease detection endpoints require JWT authentication:
- User token must be valid
- `req.user` contains userId, role, name
- Role-based filtering:
  - Regular users: See only their own detections
  - Owner/admin: See all detections

## Testing

### Manual Testing Steps

1. **Backend Setup:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Frontend Setup:**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Login:**
   - Navigate to login page
   - Login with any role

4. **Test Detection:**
   - Go to Tea Disease Detection
   - Upload an image
   - Click "Analyze Image"
   - Wait for AI simulation (3 seconds)
   - Click "Save Detection"
   - Check MongoDB for new record

5. **Test History:**
   - Click "View All" in Recent Detections
   - Filter by disease type
   - Search by ID or analyzer name
   - View detection details
   - Mark as treated
   - Create treatment plan

6. **Test Statistics:**
   - Check sidebar statistics
   - Verify today's scans count
   - Check disease distribution

### API Testing (Postman/Thunder Client)

```http
### Create Detection
POST http://localhost:5000/api/disease-detections
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "diseaseType": "BB",
  "confidence": 92.5,
  "imagePath": "/test/image.jpg",
  "imageUploadMethod": "upload",
  "processingTime": 2500
}

### Get All Detections
GET http://localhost:5000/api/disease-detections?limit=10&page=1
Authorization: Bearer <your-jwt-token>

### Get Statistics
GET http://localhost:5000/api/disease-detections/statistics/summary
Authorization: Bearer <your-jwt-token>

### Mark as Treated
PATCH http://localhost:5000/api/disease-detections/<detection-id>/treat
Authorization: Bearer <your-jwt-token>
```

## Future Enhancements

1. **Image Storage:**
   - Integrate cloud storage (AWS S3, Cloudinary)
   - Upload images to cloud instead of base64
   - Generate thumbnails

2. **Real AI Model:**
   - Replace simulation with actual ML model
   - TensorFlow.js or external API
   - Real-time confidence scores

3. **Advanced Analytics:**
   - Disease trend graphs
   - Location-based heatmaps
   - Seasonal pattern analysis

4. **Notifications:**
   - Email alerts for new diseases
   - SMS notifications for critical detections
   - Push notifications

5. **Export Features:**
   - Bulk export to CSV/Excel
   - Scheduled reports
   - Dashboard widgets

6. **Treatment Tracking:**
   - Treatment progress tracking
   - Follow-up schedules
   - Effectiveness metrics

## Troubleshooting

### Detection Not Saving
- Check JWT token validity
- Verify backend is running on port 5000
- Check MongoDB connection
- Check browser console for errors

### Statistics Not Loading
- Verify detections exist in database
- Check date filters
- Verify user permissions

### Images Not Displaying
- Check imagePath format
- Update to use cloud storage URLs
- Verify image file paths

## Security Considerations

1. **Authentication:**
   - All endpoints protected with JWT
   - Token expiration handled

2. **Authorization:**
   - Role-based access control
   - Users can only modify own detections
   - Admin/owner override

3. **Input Validation:**
   - Disease type enum validation
   - Confidence score range validation
   - ObjectId validation

4. **Data Privacy:**
   - User-specific data filtering
   - Secure image storage
   - HIPAA-compliant if needed

## Maintenance

### Regular Tasks
- Monitor database size
- Clean up old images
- Archive old detections
- Update disease database
- Review AI model accuracy

### Backup
- Daily MongoDB backups
- Image storage backups
- Configuration backups

## Support

For issues or questions:
- Check error logs in browser console
- Check backend logs
- Review API response messages
- Verify MongoDB connection

---

**Version:** 1.0.0  
**Last Updated:** March 7, 2026  
**Author:** Tea Factory Development Team
