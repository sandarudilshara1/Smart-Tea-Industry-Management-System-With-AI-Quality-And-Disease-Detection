# GreenLeaf Tea Factory Management System

A comprehensive full-stack web application for managing tea factory operations, from supplier management to quality assessment. Built with React.js, Node.js/Express, MongoDB, Tailwind CSS, and Firebase for real-time data management and authentication.

---

## 🚀 Features

### User Management & Authentication
- Multi-role authentication system (Owner, Factory Manager, Inventory Manager, Payment Manager, Transport Manager, Fertilizer Manager, Supplier, Driver)
- Firebase authentication with email/password
- Role-based access control and protected routes
- User profile management with avatar support

### Dashboard & Analytics
- **Owner Dashboard**: Comprehensive overview of all operations, manager performance, and financial analytics
- **Factory Manager Dashboard**: Supplier management, driver assignments, inventory tracking, and fertilizer control
- **Inventory Manager Dashboard**: Real-time leaf weight tracking, bag weight management, and processing history
- **Payment Manager Dashboard**: Automated payment processing, advance management, loan tracking, and tea rate calculations
- **Transport Manager Dashboard**: Driver management, route planning, and vehicle tracking
- **Fertilizer Manager Dashboard**: Stock management, distribution tracking, and request handling
- **Supplier Dashboard**: Tea supply submission, payment history, and quality feedback
- **Driver Dashboard**: Route assignments, delivery tracking, and schedule management

### Core Functionalities
- **Tea Quality Assessment**: Advanced quality grading system with chemical composition analysis
  - 7 tea flavor types (Black Tea, Green Tea, Oolong, White Tea, Matcha, Chai Spice, Earl Grey)
  - 8 quality parameters evaluation (Particle Size, Moisture, Color, Aroma, Taste, Solubility, Caffeine, Fineness)
  - Automated grading (A+ to D) and dynamic pricing
  - Market comparison and recommendations

- **Tea Disease Detection**: AI-powered disease identification system for tea leaves

- **Supply Chain Management**: 
  - Tea leaf collection and weight tracking
  - Automated payment calculations based on quality grades
  - Advance payment and loan management
  - Tea rate management with historical tracking

- **Inventory Management**:
  - Real-time leaf weight recording
  - Bag weight tracking for production
  - Historical data analysis with charts
  - Stock level monitoring

- **Transport & Logistics**:
  - Driver assignment and route optimization
  - Vehicle tracking and maintenance
  - Delivery scheduling and confirmation

- **Fertilizer Management**:
  - Stock inventory and usage tracking
  - Distribution to suppliers
  - Request management system

- **Reporting & Analytics**:
  - Interactive charts (Tea Supply Chart, Advance Chart)
  - Custom date range reports
  - PDF export functionality
  - Performance metrics and KPIs

### User Interface Features
- Responsive design for desktop, tablet, and mobile
- Modern, clean interface with consistent green theme
- Real-time notifications with dropdown system
- Built-in calculator for quick calculations
- Profile management with dropdown menu
- Sidebar navigation with role-based menu items
- Pagination controls for data tables
- Search and filter capabilities

---

## 🛠️ Technology Stack

### Frontend Framework & Libraries
- **React.js 19** - UI framework
- **Vite** - Build tool and dev server
- **React Router DOM** - Client-side routing
- **Tailwind CSS 4** - Utility-first CSS framework
- **Lucide React** - Icon library
- **Chart.js** - Data visualization
- **Leaflet** - Interactive maps

### Backend & Database
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **Firebase** - Authentication and cloud storage
- **JWT** - JSON Web tokens for authentication
- **bcryptjs** - Password hashing
- **Axios** - HTTP client for API requests

### Additional Tools
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **React Context API** - State management
- **CORS** - Cross-origin resource sharing
- **PM2** - Production process management

---

## 📦 Project Structure

This is a monorepo containing both frontend and backend applications:

```
tea-factory-frontend-web-dev/
├── frontend/                # React Frontend Application
│   ├── src/                 # React source code
│   │   ├── api/            # API integration modules
│   │   ├── components/     # Reusable React components
│   │   ├── contexts/       # React context providers
│   │   ├── layouts/        # Page layout components
│   │   ├── pages/          # Page-level components (by role)
│   │   ├── router/         # Route configuration
│   │   └── utils/          # Utility functions
│   ├── public/             # Static assets
│   └── ...config files
│
├── backend/                # Node.js + Express Backend API
│   ├── config/             # Configuration files (database, etc.)
│   ├── controllers/        # Business logic controllers
│   ├── models/             # MongoDB/Mongoose models
│   ├── routes/             # API route definitions
│   ├── middleware/         # Custom middleware (auth, validation)
│   └── server.js           # Express server entry point
│
├── README.md               # This file
├── PROJECT_STRUCTURE.md    # Detailed project structure
└── ...scripts & docs
```

**📄 For detailed folder structure, see [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)**


---

## ⚡ Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager
- MongoDB (local or MongoDB Atlas)
- Firebase account for authentication and storage

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/tea-factory-frontend-web-dev.git
cd tea-factory-frontend-web-dev
```

2. Install all dependencies (Frontend + Backend):
```bash
npm run install:all
```

3. Configure Backend:
   - Navigate to `backend/` folder
   - Create a `.env` file with:
     ```env
     MONGODB_URI=your_mongodb_connection_string
     JWT_SECRET=your_jwt_secret_key
     PORT=5000
     ```

4. Configure Frontend Firebase:
   - Create a Firebase project at https://console.firebase.google.com
   - Enable Authentication (Email/Password)
   - Enable Cloud Storage
   - Copy your Firebase configuration
   - Update `frontend/src/firebase.js` with your credentials

5. Start the development servers (Both Frontend & Backend):
```bash
npm run dev
```

Or start them individually:
```bash
# Terminal 1 - Backend
npm run dev:backend

# Terminal 2 - Frontend
npm run dev:frontend
```

6. Open your browser and navigate to:
```
Frontend: http://localhost:5173
Backend API: http://localhost:5000
```

### Build for Production

```bash
# Build frontend
npm run build:frontend
```

The production-ready files will be generated in the `frontend/dist/` directory.

### Preview Production Build

```bash
npm run preview:frontend
```

### Additional Scripts

- `npm run lint:frontend` - Run ESLint on frontend code
- `npm run start:backend` - Start backend in production mode
- `npm run start:frontend` - Start frontend dev server

---

## 🎯 User Roles & Access

### Owner
- Full system access and oversight
- Manager performance monitoring
- Financial reports and analytics
- System-wide announcements
- Tea rate management

### Factory Manager
- Supplier management
- Driver assignments
- Inventory oversight
- Fertilizer tracking
- Route management

### Inventory Manager
- Leaf weight recording
- Bag weight tracking
- Production monitoring
- Historical data analysis

### Payment Manager
- Payment processing
- Advance management
- Loan tracking
- Tea rate calculations
- Financial reports

### Transport Manager
- Driver management
- Vehicle tracking
- Route planning
- Delivery scheduling

### Fertilizer Manager
- Stock management
- Distribution tracking
- Request handling
- Usage monitoring

### Supplier
- Tea supply submission
- Payment history
- Quality feedback
- Delivery schedules

### Driver
- Route assignments
- Delivery tracking
- Schedule management
- Status updates

---

## 🔑 Key Features Explained

### Tea Quality Assessment System
The system evaluates tea powder across 8 parameters:
1. **Particle Size** (mesh)
2. **Moisture Content** (%)
3. **Color Value** (L* value)
4. **Aroma Power** (0-10 scale)
5. **Taste Strength** (0-10 scale)
6. **Solubility** (%)
7. **Caffeine Content** (%)
8. **Powder Fineness** (%)

Each parameter is weighted and scored against industry standards. The system calculates:
- Overall quality score (0-100%)
- Quality grade (A+, A, A-, B+, B, B-, C, D)
- Base price adjustment multiplier
- Market-competitive pricing
- Total batch value

### Payment Calculation
Payments are automatically calculated based on:
- Tea leaf weight supplied
- Quality grade assigned
- Current tea rate (Rs/kg)
- Advance payments deducted
- Active loans considered

---

## 🎨 Design System

### Color Palette
- **Primary Green**: #165E52
- **Success Green**: #10B981
- **Info Blue**: #3B82F6
- **Warning Orange**: #F59E0B
- **Background Gray**: #F9FAFB

### Typography
- Font Family: Inter, system-ui, sans-serif
- Headings: Bold weights (600-700)
- Body: Regular weight (400)

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Style Guidelines
- Use functional components with hooks
- Follow ESLint configuration
- Use Tailwind CSS utility classes
- Keep components modular and reusable
- Write clear comments for complex logic

---

## 📝 Scripts

### Root Level Scripts (Workspace)
```bash
npm run install:all       # Install all dependencies (frontend + backend)
npm run dev               # Run both frontend and backend concurrently
npm run dev:frontend      # Start frontend dev server only
npm run dev:backend       # Start backend dev server only
npm run start:frontend    # Start frontend in dev mode
npm run start:backend     # Start backend in production mode
npm run build:frontend    # Build frontend for production
npm run lint:frontend     # Run ESLint on frontend
npm run preview:frontend  # Preview frontend production build
```

### Frontend Scripts (in frontend/ folder)
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Backend Scripts (in backend/ folder)
```bash
npm start            # Start server in production mode
npm run dev          # Start server with nodemon (auto-restart)
npm run pm2:start    # Start with PM2
npm run pm2:stop     # Stop PM2 process
npm run pm2:restart  # Restart PM2 process
npm run pm2:logs     # View PM2 logs
```

---

## 🐛 Known Issues & Limitations

- Mobile responsiveness optimized for tablet and above
- Real-time updates require active Firebase connection
- Large data sets may require pagination optimization

---

## 🚀 Future Enhancements

- [ ] Mobile app integration
- [ ] Advanced analytics dashboard
- [ ] Export functionality for all reports
- [ ] Multi-language support
- [ ] Dark mode theme
- [ ] Email notification system
- [ ] SMS alerts for critical events
- [ ] Automated backup system

---

## 📄 License

This project is part of an academic project and is intended for educational purposes.

---

## 👥 Team

3rd Year Project - Group 14

---

## 📞 Support

For issues, questions, or contributions, please open an issue in the GitHub repository.

---

© 2025 GreenLeaf Tea Factory Management System. All rights reserved.
