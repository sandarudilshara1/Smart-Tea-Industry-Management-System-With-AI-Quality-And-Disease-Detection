# Tea Factory Management System - Architecture

## High-Level System Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        Browser[Web Browser]
    end
    
    subgraph "Presentation Layer - React Frontend"
        Router[App Router]
        Auth[Authentication Module]
        
        subgraph "User Interfaces"
            OwnerUI[Owner Dashboard]
            FMgrUI[Factory Manager Dashboard]
            FertMgrUI[Fertilizer Manager Dashboard]
            InvMgrUI[Inventory Manager Dashboard]
            PayMgrUI[Payment Manager Dashboard]
            TransMgrUI[Transport Manager Dashboard]
            SupUI[Supplier Dashboard]
            DrvUI[Driver Dashboard]
        end
        
        subgraph "Shared Components"
            Navbar[Navigation Bar]
            Sidebar[Sidebar]
            Charts[Charts & Analytics]
            Notifications[Notifications]
            Profile[Profile Management]
        end
        
        subgraph "Feature Modules"
            Inventory[Inventory Management]
            Payment[Payment Processing]
            Transport[Transport & Routes]
            Fertilizer[Fertilizer Management]
            Supply[Supply Chain]
            Quality[Tea Quality Detection]
            Disease[Disease Detection]
        end
    end
    
    subgraph "Service Layer"
        API[API Service Layer]
        
        subgraph "API Modules"
            AuthAPI[Auth API]
            UserAPI[User API]
            DriverAPI[Driver API]
            SupplierAPI[Supplier API]
            InventoryAPI[Inventory API]
            PaymentAPI[Payment API]
            LoanAPI[Loan API]
            FertilizerAPI[Fertilizer API]
            ManagerAPI[Manager API]
            OwnerAPI[Owner API]
        end
        
        Axios[Axios HTTP Client]
    end
    
    subgraph "External Services"
        Firebase[Firebase Auth & Storage]
        Backend[Backend REST API Server]
    end
    
    subgraph "Data Layer"
        Database[(Database)]
    end
    
    Browser --> Router
    Router --> Auth
    Auth --> Firebase
    
    Router --> OwnerUI
    Router --> FMgrUI
    Router --> FertMgrUI
    Router --> InvMgrUI
    Router --> PayMgrUI
    Router --> TransMgrUI
    Router --> SupUI
    Router --> DrvUI
    
    OwnerUI --> Shared Components
    FMgrUI --> Shared Components
    FertMgrUI --> Shared Components
    InvMgrUI --> Shared Components
    PayMgrUI --> Shared Components
    TransMgrUI --> Shared Components
    SupUI --> Shared Components
    DrvUI --> Shared Components
    
    OwnerUI --> Feature Modules
    FMgrUI --> Feature Modules
    FertMgrUI --> Feature Modules
    InvMgrUI --> Feature Modules
    PayMgrUI --> Feature Modules
    TransMgrUI --> Feature Modules
    SupUI --> Feature Modules
    DrvUI --> Feature Modules
    
    Feature Modules --> API
    Shared Components --> API
    
    API --> Axios
    Axios --> Backend
    Axios --> Firebase
    
    Backend --> Database
    Firebase --> Database
```

## Component Architecture

```mermaid
graph LR
    subgraph "React Application"
        Main[main.jsx Entry Point]
        App[App.jsx]
        Context[Auth Context]
        
        subgraph "Routing Layer"
            AppRouter[App Router]
            OwnerRoutes[Owner Routes]
            FMRoutes[Factory Manager Routes]
            FertRoutes[Fertilizer Manager Routes]
            InvRoutes[Inventory Manager Routes]
            PayRoutes[Payment Manager Routes]
            TransRoutes[Transport Manager Routes]
        end
        
        subgraph "Layout Layer"
            MainLayout[Main Layout]
            InvLayout[Inventory Manager Layout]
        end
        
        subgraph "Page Components"
            Dashboards[Role-Based Dashboards]
            Features[Feature Pages]
        end
    end
    
    Main --> App
    App --> Context
    App --> AppRouter
    AppRouter --> OwnerRoutes
    AppRouter --> FMRoutes
    AppRouter --> FertRoutes
    AppRouter --> InvRoutes
    AppRouter --> PayRoutes
    AppRouter --> TransRoutes
    
    OwnerRoutes --> MainLayout
    FMRoutes --> MainLayout
    FertRoutes --> MainLayout
    InvRoutes --> InvLayout
    PayRoutes --> MainLayout
    TransRoutes --> MainLayout
    
    MainLayout --> Dashboards
    InvLayout --> Dashboards
    Dashboards --> Features
```

## Data Flow Diagram

```mermaid
sequenceDiagram
    participant User
    participant UI as User Interface
    participant Auth as Auth Module
    participant API as API Layer
    participant Backend as Backend Server
    participant DB as Database
    participant Firebase as Firebase
    
    User->>UI: Access Application
    UI->>Auth: Check Authentication
    Auth->>Firebase: Verify Token
    Firebase-->>Auth: Auth Status
    
    alt Authenticated
        Auth-->>UI: Grant Access
        UI->>API: Request Data
        API->>Backend: HTTP Request
        Backend->>DB: Query Data
        DB-->>Backend: Return Data
        Backend-->>API: JSON Response
        API-->>UI: Formatted Data
        UI-->>User: Display Content
    else Not Authenticated
        Auth-->>UI: Redirect to Login
        UI-->>User: Show Login Page
        User->>UI: Submit Credentials
        UI->>Firebase: Authenticate
        Firebase-->>UI: Token
        UI->>Backend: Register Session
    end
    
    User->>UI: Perform Action (CRUD)
    UI->>API: API Request
    API->>Backend: HTTP Request (POST/PUT/DELETE)
    Backend->>DB: Update Data
    DB-->>Backend: Confirmation
    Backend-->>API: Success Response
    API-->>UI: Update State
    UI-->>User: Show Notification
```

## User Role Flow

```mermaid
graph TD
    Start[User Login] --> Auth{Authentication}
    Auth -->|Success| RoleCheck{Check User Role}
    Auth -->|Failure| Login[Login Page]
    
    RoleCheck -->|Owner| OwnerDash[Owner Dashboard]
    RoleCheck -->|Factory Manager| FMDash[Factory Manager Dashboard]
    RoleCheck -->|Fertilizer Manager| FertDash[Fertilizer Manager Dashboard]
    RoleCheck -->|Inventory Manager| InvDash[Inventory Manager Dashboard]
    RoleCheck -->|Payment Manager| PayDash[Payment Manager Dashboard]
    RoleCheck -->|Transport Manager| TransDash[Transport Manager Dashboard]
    RoleCheck -->|Supplier| SupDash[Supplier Dashboard]
    RoleCheck -->|Driver| DrvDash[Driver Dashboard]
    
    OwnerDash --> OwnerFeatures[Manage All Operations<br/>View Reports<br/>Manage Employers<br/>Set Rates<br/>Announcements]
    FMDash --> FMFeatures[Manage Inventory<br/>Manage Drivers<br/>Manage Routes<br/>Manage Suppliers<br/>Manage Fertilizers]
    FertDash --> FertFeatures[Manage Stock<br/>Track Requests<br/>View History<br/>Generate Reports<br/>Driver Routes]
    InvDash --> InvFeatures[Record Leaf Weight<br/>Record Bag Weight<br/>View History]
    PayDash --> PayFeatures[Process Payments<br/>Manage Advances<br/>Manage Loans<br/>Set Tea Rates]
    TransDash --> TransFeatures[Manage Routes<br/>Assign Drivers<br/>Track Vehicles]
    SupDash --> SupFeatures[Submit Supply<br/>View History<br/>Track Payments]
    DrvDash --> DrvFeatures[View Routes<br/>Update Status<br/>View Assignments]
```

## ML Model Training Architecture

```mermaid
graph TB
    subgraph "Data Collection Layer"
        FieldData[Field Data Collection]
        ImageCapture[Tea Leaf Image Capture]
        LabData[Lab Quality Testing Data]
        HistoricalData[Historical Records]
    end
    
    subgraph "Data Processing Pipeline"
        DataClean[Data Cleaning]
        DataLabel[Data Labeling]
        DataAug[Data Augmentation]
        DataSplit[Train/Val/Test Split]
    end
    
    subgraph "Model Training"
        DiseaseModel[Disease Detection Model<br/>CNN/ResNet]
        QualityModel[Quality Assessment Model<br/>ML Classifier]
        ModelValidation[Model Validation]
        Hyperparameter[Hyperparameter Tuning]
    end
    
    subgraph "Model Deployment"
        ModelExport[Model Export<br/>ONNX/TensorFlow.js]
        ModelAPI[Model Serving API]
        EdgeDeploy[Edge Deployment]
    end
    
    subgraph "Inference & Prediction"
        WebApp[Web Application]
        RealTime[Real-time Prediction]
        BatchProcess[Batch Processing]
        Results[Results & Analytics]
    end
    
    subgraph "Model Management"
        VersionControl[Model Versioning]
        Performance[Performance Monitoring]
        Retraining[Automated Retraining]
        MLOps[MLOps Pipeline]
    end
    
    FieldData --> DataClean
    ImageCapture --> DataClean
    LabData --> DataClean
    HistoricalData --> DataClean
    
    DataClean --> DataLabel
    DataLabel --> DataAug
    DataAug --> DataSplit
    
    DataSplit --> DiseaseModel
    DataSplit --> QualityModel
    DiseaseModel --> ModelValidation
    QualityModel --> ModelValidation
    ModelValidation --> Hyperparameter
    Hyperparameter --> ModelExport
    
    ModelExport --> ModelAPI
    ModelExport --> EdgeDeploy
    
    ModelAPI --> WebApp
    EdgeDeploy --> WebApp
    WebApp --> RealTime
    WebApp --> BatchProcess
    RealTime --> Results
    BatchProcess --> Results
    
    ModelExport --> VersionControl
    Results --> Performance
    Performance --> Retraining
    Retraining --> MLOps
    MLOps --> DataClean
```

## ML Model Training Workflow

```mermaid
sequenceDiagram
    participant Researcher as Data Scientists
    participant DataTeam as Data Collection Team
    participant Storage as Data Storage
    participant Training as Training Pipeline
    participant Validation as Validation System
    participant Deploy as Deployment Server
    participant App as Web Application
    participant User as End Users
    
    DataTeam->>Storage: Upload Tea Leaf Images
    DataTeam->>Storage: Upload Quality Labels
    DataTeam->>Storage: Upload Disease Labels
    
    Researcher->>Storage: Access Training Dataset
    Storage-->>Researcher: Return Dataset
    
    Researcher->>Training: Configure Training Parameters
    Researcher->>Training: Start Training Job
    
    Training->>Training: Data Preprocessing
    Training->>Training: Model Training (Epochs)
    Training->>Training: Calculate Loss & Metrics
    
    Training->>Validation: Validate Model
    Validation->>Validation: Test on Validation Set
    Validation->>Validation: Calculate Accuracy/F1
    
    alt Model Performance Acceptable
        Validation-->>Researcher: Validation Passed
        Researcher->>Deploy: Deploy Model
        Deploy->>Deploy: Convert to Production Format
        Deploy->>App: Update Model Endpoint
        App-->>User: New Model Available
        
        User->>App: Upload Tea Leaf Image
        App->>Deploy: Request Prediction
        Deploy->>Deploy: Run Inference
        Deploy-->>App: Return Prediction
        App-->>User: Display Results
        
        Deploy->>Validation: Log Performance Metrics
    else Model Needs Improvement
        Validation-->>Researcher: Validation Failed
        Researcher->>Training: Adjust Hyperparameters
        Researcher->>Training: Retrain Model
    end
    
    Validation->>Researcher: Monitor Model Drift
    Researcher->>Training: Trigger Retraining
```

## Technology Stack

```mermaid
graph TB
    subgraph "Frontend Technologies"
        React[React 18+]
        Vite[Vite Build Tool]
        Tailwind[Tailwind CSS]
        Router[React Router]
    end
    
    subgraph "State & Context"
        Context[React Context API]
        AuthCtx[Auth Context]
    end
    
    subgraph "HTTP & API"
        Axios[Axios HTTP Client]
        RestAPI[RESTful API]
    end
    
    subgraph "Authentication & Storage"
        FirebaseAuth[Firebase Authentication]
        FirebaseStorage[Firebase Storage]
    end
    
    subgraph "UI Components"
        CustomUI[Custom Components]
        Charts[Chart Libraries]
        Forms[Form Components]
    end
    
    React --> Vite
    React --> Tailwind
    React --> Router
    React --> Context
    Context --> AuthCtx
    React --> Axios
    Axios --> RestAPI
    React --> FirebaseAuth
    React --> FirebaseStorage
    React --> CustomUI
    CustomUI --> Charts
    CustomUI --> Forms
```

## ML Models & AI Features

### 1. **Tea Disease Detection Model**

**Architecture**: Convolutional Neural Network (CNN) / ResNet-50

**Purpose**: Identify diseases and pest infestations in tea leaves from images

**Training Process**:
```
1. Data Collection
   - Collect 10,000+ tea leaf images
   - Categories: Healthy, Blister Blight, Gray Blight, Red Rust, Anthracnose
   - Field photos with varying lighting conditions

2. Data Preprocessing
   - Image resizing (224x224 or 299x299)
   - Normalization (0-1 scale)
   - Data augmentation: rotation, flip, zoom, brightness adjustment
   - Train/Val/Test split: 70/15/15

3. Model Training
   - Base Model: Pre-trained ResNet-50 or EfficientNet
   - Transfer Learning: Fine-tune top layers
   - Loss Function: Categorical Cross-Entropy
   - Optimizer: Adam (lr=0.001)
   - Batch Size: 32
   - Epochs: 50-100 with early stopping
   - Data Augmentation: Online during training

4. Evaluation Metrics
   - Accuracy: >95%
   - Precision/Recall per class
   - F1-Score
   - Confusion Matrix

5. Model Export
   - TensorFlow.js for web deployment
   - ONNX for cross-platform compatibility
   - Model quantization for mobile devices
```

**Deployment**:
- Client-side inference using TensorFlow.js
- Server-side API for batch processing
- Real-time prediction in browser (<2 seconds)
- Confidence scores for each disease class

**Features in UI**:
- Image upload interface
- Real-time camera capture
- Disease probability visualization
- Treatment recommendations
- Historical detection records

### 2. **Tea Quality Assessment Model**

**Architecture**: Multi-class Classification (Random Forest / XGBoost / Neural Network)

**Purpose**: Predict tea quality grade based on multiple factors

**Input Features**:
- Leaf appearance (color, texture, size)
- Physical measurements (weight, moisture content)
- Processing parameters (withering time, fermentation level)
- Chemical composition (polyphenols, caffeine)
- Origin and harvesting data
- Weather conditions during growth

**Training Process**:
```
1. Feature Engineering
   - Numerical features: standardization (z-score)
   - Categorical features: one-hot encoding
   - Feature selection: correlation analysis, feature importance
   - Handle missing values: imputation or removal

2. Model Selection
   - Test multiple algorithms:
     * Random Forest Classifier
     * Gradient Boosting (XGBoost, LightGBM)
     * Neural Network (MLP)
     * Support Vector Machine
   - Cross-validation (5-fold)
   - Select best performing model

3. Training Configuration
   - Train/Test split: 80/20
   - Hyperparameter tuning: Grid Search or Bayesian Optimization
   - Handle class imbalance: SMOTE or class weights
   - Regularization to prevent overfitting

4. Quality Classes
   - Premium Grade (90-100 points)
   - High Grade (80-89 points)
   - Standard Grade (70-79 points)
   - Low Grade (<70 points)

5. Evaluation
   - Classification accuracy
   - Multi-class AUC-ROC
   - Precision-Recall curves
   - Feature importance analysis
```

**Deployment**:
- REST API endpoint for quality prediction
- Batch processing for inventory assessment
- Real-time scoring during inspection
- Integration with inventory management

**Features in UI**:
- Input form for quality parameters
- Automated quality scoring
- Quality trend analysis over time
- Grade distribution charts
- Quality reports and exports

### 3. **ML Pipeline & MLOps**

**Data Management**:
- Firebase Storage for image datasets
- Cloud database for structured training data
- Version control for datasets (DVC)
- Automated data validation

**Training Infrastructure**:
- Cloud GPU instances (AWS/GCP) for training
- Jupyter Notebooks for experimentation
- Automated training pipelines
- Experiment tracking (MLflow, Weights & Biases)

**Model Versioning**:
- Semantic versioning (v1.0.0, v1.1.0)
- Model registry with metadata
- A/B testing for new models
- Rollback capability

**Monitoring & Maintenance**:
- Prediction confidence tracking
- Model performance metrics dashboard
- Data drift detection
- Automated retraining triggers
- User feedback collection

**Continuous Improvement**:
```
1. Collect user feedback on predictions
2. Gather new labeled data quarterly
3. Retrain models with expanded dataset
4. Validate improved performance
5. Deploy updated models
6. Monitor production performance
```

### 4. **AI-Assisted Features**

**Predictive Analytics**:
- Supply forecasting based on historical patterns
- Payment prediction models
- Route optimization using historical data
- Inventory demand forecasting

**Recommendation Systems**:
- Optimal fertilizer recommendations
- Best harvesting time suggestions
- Quality improvement recommendations
- Supplier performance predictions

**Anomaly Detection**:
- Unusual supply patterns
- Payment fraud detection
- Inventory discrepancies
- Quality anomalies

## Module Breakdown

### 1. **Authentication Module**
- Firebase Authentication integration
- Login/Signup flows
- Password recovery
- Session management
- Role-based access control

### 2. **Owner Module**
- Complete system oversight
- Employer management
- Payment approvals
- Rate setting (Tea & Fertilizer)
- System-wide announcements
- Comprehensive reporting
- Supplier & company management

### 3. **Factory Manager Module**
- Dashboard with key metrics
- Inventory oversight
- Driver management
- Route planning
- Supplier coordination
- Fertilizer management

### 4. **Fertilizer Manager Module**
- Stock management
- Request processing
- Distribution tracking
- Driver route coordination
- History & reporting

### 5. **Inventory Manager Module**
- Leaf weight recording
- Bag weight recording
- Inventory history tracking
- Real-time updates

### 6. **Payment Manager Module**
- Payment processing
- Advance management
- Loan administration
- Tea rate management
- Payment history & reports

### 7. **Transport Manager Module**
- Route management
- Driver assignment
- Vehicle tracking
- Schedule coordination

### 8. **Supplier Module**
- Tea supply submission
- Supply history
- Payment tracking
- Performance metrics

### 9. **Driver Module**
- Route assignments
- Status updates
- Delivery tracking
- Schedule viewing

## Data Flow Patterns

### 1. **Create/Update Flow**
```
User Input → Form Validation → API Call → Backend Processing → Database Update → 
Success Response → UI Update → Notification → State Refresh
```

### 2. **Read/Display Flow**
```
Page Load → API Request → Backend Query → Database Fetch → Data Transform → 
API Response → State Update → Component Render
```

### 3. **Authentication Flow**
```
Login Form → Firebase Auth → Token Generation → Backend Verification → 
Role Assignment → Context Update → Route Redirect → Dashboard Load
```

### 4. **Real-time Updates Flow**
```
Action Trigger → API Call → Database Update → Notification Service → 
UI Notification → Auto-refresh → Updated Display
```

## Key Features

- **Role-Based Access Control (RBAC)**: Different interfaces for 8 user roles
- **Real-time Notifications**: System-wide notification system
- **Analytics & Reporting**: Charts and data visualization
- **Inventory Tracking**: Real-time leaf and bag weight management
- **Payment Processing**: Comprehensive payment, advance, and loan management
- **Supply Chain Management**: End-to-end tracking from supplier to factory
- **AI-Powered Quality Control**: ML-based tea quality assessment and disease detection
- **Disease Detection AI**: CNN-based image recognition for tea leaf diseases
- **Predictive Analytics**: ML models for forecasting and optimization
- **Route Optimization**: Transport and delivery route management
- **Document Management**: Firebase storage for files and images
- **MLOps Integration**: Continuous model training and deployment pipeline

## Security Considerations

- Firebase Authentication for secure user management
- Token-based session management
- Role-based route protection
- API authentication headers
- Secure data transmission (HTTPS)
- Input validation and sanitization

## Scalability Features

- Modular component architecture
- Lazy loading of routes
- Code splitting with Vite
- API abstraction layer
- Reusable component library
- Centralized state management
- Distributed ML model serving
- Edge computing for inference
- Scalable training infrastructure
- Automated model retraining pipeline
- Caching strategies for predictions
- Load balancing for API endpoints
