# Tea Factory Backend

Backend API for the Tea Factory Management System.

## Setup Instructions

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Environment Variables**
   - Copy `.env.example` to `.env` (if available)
   - Update the `.env` file with your configuration
   - Make sure to change the JWT_SECRET in production

3. **Start the Server**

   Development mode (with auto-restart):
   ```bash
   npm run dev
   ```

   Production mode:
   ```bash
   npm start
   ```

## Project Structure

```
backend/
├── config/          # Configuration files
│   └── database.js  # MongoDB connection
├── models/          # Mongoose models
│   └── User.js      # User model
├── routes/          # API routes
├── controllers/     # Route controllers
├── middleware/      # Custom middleware
│   └── auth.js      # Authentication middleware
├── .env             # Environment variables
├── server.js        # Entry point
└── package.json     # Dependencies
```

## API Endpoints

### Base URL
```
http://localhost:5000
```

### Available Routes
- `GET /` - API status check

### Future Routes (to be implemented)
- `/api/auth` - Authentication routes
- `/api/users` - User management
- `/api/inventory` - Inventory management
- `/api/payments` - Payment processing
- `/api/suppliers` - Supplier management
- `/api/drivers` - Driver management
- `/api/fertilizer` - Fertilizer management

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| MONGODB_URI | MongoDB connection string | - |
| PORT | Server port | 5000 |
| NODE_ENV | Environment (development/production) | development |
| JWT_SECRET | Secret key for JWT tokens | - |
| FRONTEND_URL | Frontend URL for CORS | http://localhost:5173 |

## Technologies Used

- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variables

## Development

- Server runs on `http://localhost:5000`
- Frontend runs on `http://localhost:5173`
- MongoDB Atlas is used for database hosting

## Security Notes

⚠️ **Important**: Before deploying to production:
- Change the JWT_SECRET to a secure random string
- Update MongoDB credentials
- Enable security features in MongoDB Atlas
- Use HTTPS in production
- Implement rate limiting
- Add input validation
- Set up proper logging
