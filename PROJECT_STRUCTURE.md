# 🏭 Tea Factory Management System - Project Structure

## 📁 Folder Organization

This project is organized into two main directories:

```
tea-factory-frontend-web-dev/
│
├── 📱 frontend/              # React Frontend Application
│   ├── src/                 # React source code
│   │   ├── api/            # API integration modules
│   │   ├── assets/         # Images, icons, etc.
│   │   ├── components/     # Reusable React components
│   │   ├── contexts/       # React context providers
│   │   ├── layouts/        # Page layout components
│   │   ├── pages/          # Page-level components
│   │   ├── router/         # Route configuration
│   │   ├── utils/          # Utility functions
│   │   ├── App.jsx         # Main App component
│   │   ├── main.jsx        # Application entry point
│   │   └── index.css       # Global styles
│   ├── public/              # Static assets
│   ├── node_modules/        # Frontend dependencies
│   ├── package.json         # Frontend package configuration
│   ├── vite.config.js       # Vite build configuration
│   ├── tailwind.config.js   # Tailwind CSS configuration
│   ├── eslint.config.js     # ESLint configuration
│   ├── jsconfig.json        # JavaScript configuration
│   ├── index.html           # Entry HTML file
│   └── architecture-viewer.html  # Architecture documentation
│
├── 🖥️ backend/               # Node.js + Express Backend API
│   ├── config/              # Configuration files (database, etc.)
│   ├── controllers/         # Business logic controllers
│   ├── models/              # MongoDB/Mongoose models
│   ├── routes/              # API route definitions
│   ├── middleware/          # Custom middleware (auth, validation)
│   ├── logs/                # Application logs
│   ├── node_modules/        # Backend dependencies
│   ├── server.js            # Express server entry point
│   ├── package.json         # Backend package configuration
│   ├── ecosystem.config.js  # PM2 configuration
│   ├── nodemon.json         # Nodemon configuration
│   ├── .env                 # Environment variables (DO NOT COMMIT)
│   ├── README.md            # Backend documentation
│   ├── API_TESTING.md       # API testing guide
│   ├── CRASH_PREVENTION.md  # Error handling guide
│   ├── PORT_CONFLICT_FIX.md # Port conflict solutions
│   └── DRIVER_ADD_DOCUMENTATION.md  # Driver feature documentation
│
├── 📄 Documentation Files
│   ├── README.md            # Project overview
│   └── PROJECT_STRUCTURE.md # This file
│
├── 🛠️ Scripts & Configuration
│   ├── package.json         # Root workspace configuration
│   └── .gitignore           # Git ignore rules
```

---

## 🚀 Quick Start

### ⚡ Quick Start (All-in-One)

```bash
# Install all dependencies (frontend + backend)
npm run install:all

# Run both frontend and backend concurrently
npm run dev
```

**Backend runs at:** `http://localhost:5000`  
**Frontend runs at:** `http://localhost:5173`

---

### 1️⃣ Backend Setup (Individual)

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Configure environment variables
# Edit the .env file with your MongoDB URI and other settings

# Start the backend server
npm run dev    # Development mode with auto-restart
# OR
npm start      # Production mode
```

**Backend runs at:** `http://localhost:5000`

### 2️⃣ Frontend Setup (Individual)

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

**Frontend runs at:** `http://localhost:5173`

---

## 💻 Technology Stack

### Frontend Technologies
- ⚛️ **React 18+** - UI library
- ⚡ **Vite** - Build tool & dev server
- 🎨 **Tailwind CSS** - Utility-first CSS
- 🧭 **React Router** - Client-side routing
- 📡 **Axios** - HTTP client
- 🔥 **Firebase** - Authentication & storage
- 📊 **Chart Libraries** - Data visualization

### Backend Technologies
- 🟢 **Node.js** - JavaScript runtime
- 🚂 **Express.js** - Web framework
- 🍃 **MongoDB** - NoSQL database
- 📦 **Mongoose** - MongoDB ODM
- 🔐 **JWT** - JSON Web Tokens for auth
- 🔒 **bcryptjs** - Password hashing
- 🌐 **CORS** - Cross-origin resource sharing

---

## 📂 Detailed Directory Structure

### Frontend (`/frontend`)

```
frontend/
├── src/
│   ├── api/                    # API service layers
│   │   ├── auth.js             # Authentication API
│   │   ├── axios.js            # Axios configuration
│   │   ├── driver.js           # Driver API
│   │   ├── supplier.js         # Supplier API
│   │   ├── inventory.js        # Inventory API
│   │   ├── payment.js          # Payment API
│   │   └── ...                 # Other API modules
│   │
│   ├── components/             # Reusable React components
│   │   ├── Auth.jsx            # Authentication components
│   │   ├── Navbar.jsx          # Navigation bar
│   │   ├── SignupForm.jsx      # Registration form
│   │   ├── charts/             # Chart components
│   │   ├── Navbar/             # Navbar components
│   │   └── ui/                 # UI components
│   │
│   ├── contexts/               # React Context providers
│   │   └── AuthContext.jsx    # Authentication context
│   │
│   ├── layouts/                # Layout components
│   │   ├── Layout.jsx          # Main layout
│   │   └── InventoryManagerLayout.jsx
│   │
│   ├── pages/                  # Page components
│   │   ├── auth/               # Authentication pages
│   │   ├── driver/             # Driver pages
│   │   ├── Owner/              # Owner pages
│   │   ├── FactoryManager/     # Factory manager pages
│   │   ├── FertilizerManager/  # Fertilizer manager pages
│   │   ├── InventoryManager/   # Inventory manager pages
│   │   ├── PaymentManager/     # Payment manager pages
│   │   ├── TransportManager/   # Transport manager pages
│   │   └── supplier/           # Supplier pages
│   │
│   ├── router/                 # Routing configuration
│   │   ├── AppRouter.jsx       # Main router
│   │   ├── OwnerRoutes.jsx     # Owner routes
│   │   ├── FactoryManagerRoutes.jsx
│   │   └── ...                 # Other role-based routes
│   │
│   ├── utils/                  # Utility functions
│   │   └── firebaseStorage.js  # Firebase storage utilities
│   │
│   ├── App.jsx                 # Root App component
│   ├── main.jsx                # Entry point
│   ├── index.css               # Global styles
│   └── firebase.js             # Firebase configuration
│
├── public/                     # Static assets
│   └── assets/                 # Images, icons, etc.
│
├── index.html                  # HTML template
├── package.json                # Dependencies & scripts
├── vite.config.js              # Vite configuration
├── tailwind.config.js          # Tailwind configuration
├── eslint.config.js            # ESLint rules
└── jsconfig.json               # JavaScript configuration
```

### Backend (`/backend`)

```
backend/
├── config/
│   └── database.js             # MongoDB connection config
│
├── controllers/                # Request handlers
│   └── authController.js       # Auth logic (login, register, etc.)
│
├── models/                     # Database models
│   └── User.js                 # User model with 8 roles
│
├── routes/                     # API endpoints
│   └── auth.js                 # Authentication routes
│
├── middleware/                 # Custom middleware
│   └── auth.js                 # JWT authentication middleware
│
├── server.js                   # Express app entry point
├── package.json                # Dependencies & scripts
├── .env                        # Environment variables
├── .gitignore                  # Ignored files
├── README.md                   # Backend documentation
└── API_TESTING.md              # API testing guide
```

---

## 🔗 Communication Flow

```
Frontend (React)  ←→  Backend API (Express)  ←→  Database (MongoDB)
  Port: 5173            Port: 5000              MongoDB Atlas
```

- Frontend makes HTTP requests to Backend API
- Backend processes requests and interacts with MongoDB
- Backend sends JSON responses back to Frontend
- Firebase handles authentication and file storage

---

## 👥 User Roles Hierarchy

1. **Owner** - Full system access, all features
2. **Factory Manager** - Operations management
3. **Fertilizer Manager** - Fertilizer operations
4. **Inventory Manager** - Inventory tracking
5. **Payment Manager** - Financial processing
6. **Transport Manager** - Logistics management
7. **Supplier** - Tea supply submission
8. **Driver** - Delivery management

---

## 🔐 Environment Variables

### Backend (`.env`)
```env
MONGODB_URI=mongodb+srv://...
PORT=5000
NODE_ENV=development
JWT_SECRET=your_secret_key
FRONTEND_URL=http://localhost:5173
```

### Frontend (if needed)
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_FIREBASE_API_KEY=...
# Add other Firebase config
```

---

## 📝 Development Workflow

1. **Start Backend First**
   ```bash
   cd backend
   npm run dev
   ```

2. **Then Start Frontend**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Access the Application**
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:5000`
   - API Docs: See `backend/API_TESTING.md`

---

## 🧪 Testing

### Backend API
- Use Postman, Thunder Client, or any REST client
- See `backend/API_TESTING.md` for complete API documentation and examples

### Frontend
- Manual testing in browser
- Check console for errors
- Use React DevTools for debugging

---

## 📚 Documentation

- **Project Overview**: `README.md` (root)
- **Backend API**: `backend/README.md` & `backend/API_TESTING.md`
- **Architecture**: `frontend/architecture-viewer.html`
- **This Structure Guide**: `PROJECT_STRUCTURE.md`

---

## 🚨 Important Notes

- ⚠️ Never commit `.env` files
- ⚠️ Keep `JWT_SECRET` secure in production
- ⚠️ Use environment variables for sensitive data
- ✅ Backend must be running for frontend to work
- ✅ MongoDB connection required for backend

---

## 🤝 Contributing

1. Work in feature branches
2. Follow existing code structure
3. Test both frontend and backend
4. Update documentation if needed
5. Submit pull requests

---

**Status**: ✅ Authentication Complete | 🚧 Features In Progress
