# 🗂️ Project Structure

Visual representation of the Slot Swapper project structure.

---

## 📁 Complete Directory Tree

```
slot-swapper/
│
├── 📄 README.md                                    # Main project documentation
├── 📄 QUICK_START.md                               # 5-minute setup guide
├── 📄 API_REFERENCE.md                             # API quick reference
├── 📄 DOCKER_GUIDE.md                              # Docker setup guide
├── 📄 DESIGN_CHOICES.md                            # Design decisions explained
├── 📄 ASSUMPTIONS_AND_CHALLENGES.md                # Assumptions and challenges
├── 📄 DOCUMENTATION_INDEX.md                       # This documentation index
├── 📄 PROJECT_STRUCTURE.md                         # This file
├── 📦 Slot_Swapper_API.postman_collection.json     # Postman API collection
│
├── 🐳 docker-compose.yml                           # Development Docker setup
├── 🐳 docker-compose.prod.yml                      # Production Docker setup
├── ⚙️ nginx.conf                                   # Nginx reverse proxy config
├── 📋 .env.example                                 # Environment template
├── 📋 .gitignore                                   # Git ignore rules
│
├── 📂 backend/                                     # Backend API (Node.js + Express)
│   │
│   ├── 📄 README.md                                # Backend documentation
│   ├── 📄 TEST_SUMMARY.md                          # Test statistics
│   ├── 📄 TEST_QUICK_START.html                    # Interactive test guide
│   │
│   ├── 📝 server.js                                # Express server entry point
│   ├── ⚙️ package.json                             # Dependencies and scripts
│   ├── ⚙️ jest.config.js                           # Jest test configuration
│   ├── 🐳 Dockerfile                               # Production Docker image
│   ├── 🐳 Dockerfile.dev                           # Development Docker image
│   ├── 📋 .dockerignore                            # Docker ignore rules
│   ├── 📋 .env                                     # Environment variables (gitignored)
│   ├── 📋 .env.example                             # Environment template
│   │
│   ├── 📂 models/                                  # MongoDB schemas
│   │   ├── 📝 RegisterUser.js                      # User model (auth, password hashing)
│   │   ├── 📝 Events.js                            # Event model (slots)
│   │   └── 📝 SwapRequest.js                       # Swap request model
│   │
│   ├── 📂 routes/                                  # API route handlers
│   │   ├── 📝 auth.js                              # Auth routes (register, login)
│   │   ├── 📝 events.js                            # Event CRUD routes
│   │   ├── 📝 marketplace.js                       # Marketplace routes
│   │   └── 📝 swap.js                              # Swap operation routes
│   │
│   ├── 📂 middleware/                              # Express middleware
│   │   └── 📝 auth.js                              # JWT authentication middleware
│   │
│   ├── 📂 utils/                                   # Utility functions
│   │   └── 📝 jwt.js                               # JWT token generation/validation
│   │
│   └── 📂 __tests__/                               # Test suite (60+ tests)
│       ├── 📄 README.md                            # Test documentation
│       ├── 📝 setup.js                             # MongoDB Memory Server setup
│       ├── 📝 helpers.js                           # Test utilities
│       ├── 🧪 auth.test.js                         # Auth tests (15 tests)
│       ├── 🧪 events.test.js                       # Event tests (20 tests)
│       └── 🧪 swap.test.js                         # Swap tests (25 tests)
│
└── 📂 frontend/                                    # Frontend app (React + Vite)
    │
    ├── 📄 README.md                                # Frontend documentation
    │
    ├── 📝 index.html                               # HTML entry point
    ├── ⚙️ package.json                             # Dependencies and scripts
    ├── ⚙️ vite.config.js                           # Vite configuration
    ├── ⚙️ eslint.config.js                         # ESLint configuration
    ├── 🐳 Dockerfile                               # Production Docker image
    ├── 🐳 Dockerfile.dev                           # Development Docker image
    ├── 📋 .dockerignore                            # Docker ignore rules
    ├── 📋 .gitignore                               # Git ignore rules
    ├── 📋 .env                                     # Environment variables (gitignored)
    ├── 📋 .env.example                             # Environment template
    │
    ├── 📂 public/                                  # Static assets
    │   └── (favicon, images, etc.)
    │
    └── 📂 src/                                     # Source code
        │
        ├── 📝 main.jsx                             # Application entry point
        ├── 📝 App.jsx                              # Main app component (routing)
        ├── 🎨 App.css                              # Global app styles
        ├── 🎨 index.css                            # Root styles, CSS variables
        │
        ├── 📂 assets/                              # Images, icons
        │   └── (logo, images, etc.)
        │
        ├── 📂 components/                          # Reusable components
        │   ├── 📝 LoginPage.jsx                    # Login form component
        │   └── 📝 RegisterPage.jsx                 # Registration form component
        │
        ├── 📂 Pages/                               # Page components
        │   ├── 📝 Dashboard.jsx                    # Main dashboard with calendar
        │   ├── 📝 CreateEvent.jsx                  # Event creation form
        │   ├── 📝 EditEvent.jsx                    # Event editing form
        │   ├── 📝 Marketplace.jsx                  # Browse swappable slots
        │   └── 📝 Notifications.jsx                # Swap requests management
        │
        └── 📂 Styles/                              # CSS stylesheets
            ├── 📂 components/                      # Component-specific styles
            │   ├── 🎨 Login.css                    # Login page styles
            │   └── 🎨 Register.css                 # Register page styles
            │
            └── 📂 Pages/                           # Page-specific styles
                ├── 🎨 Dashboard.css                # Dashboard styles
                ├── 🎨 CreateEvent.css              # Create event styles
                ├── 🎨 EditEvent.css                # Edit event styles
                ├── 🎨 Marketplace.css              # Marketplace styles
                └── 🎨 Notifications.css            # Notifications styles
```

---

## 📊 File Count Summary

| Category | Count | Purpose |
|----------|-------|---------|
| **Documentation** | 12 files | READMEs, guides, references |
| **Backend JS Files** | 11 files | Server, routes, models, middleware |
| **Backend Tests** | 6 files | Test suite (60+ tests) |
| **Frontend Components** | 7 files | React components and pages |
| **Frontend Styles** | 10 files | CSS files |
| **Config Files** | 10 files | Docker, Vite, Jest, ESLint |
| **Total Core Files** | **56+** | Not including node_modules |

---

## 🎯 Key Files by Function

### 🚀 Entry Points
```
backend/server.js          # Backend API server
frontend/src/main.jsx      # Frontend React app
```

### ⚙️ Configuration
```
backend/package.json       # Backend dependencies
frontend/package.json      # Frontend dependencies
backend/jest.config.js     # Test configuration
frontend/vite.config.js    # Build configuration
docker-compose.yml         # Development Docker
docker-compose.prod.yml    # Production Docker
```

### 🗄️ Data Models
```
backend/models/RegisterUser.js    # User schema
backend/models/Events.js          # Event schema
backend/models/SwapRequest.js     # Swap request schema
```

### 🛣️ API Routes
```
backend/routes/auth.js            # Authentication endpoints
backend/routes/events.js          # Event CRUD endpoints
backend/routes/marketplace.js     # Marketplace endpoints
backend/routes/swap.js            # Swap operation endpoints
```

### 🎨 UI Components
```
frontend/src/components/LoginPage.jsx       # Login
frontend/src/components/RegisterPage.jsx    # Registration
frontend/src/Pages/Dashboard.jsx            # Main dashboard
frontend/src/Pages/CreateEvent.jsx          # Create event
frontend/src/Pages/EditEvent.jsx            # Edit event
frontend/src/Pages/Marketplace.jsx          # Browse slots
frontend/src/Pages/Notifications.jsx        # Swap requests
```

### 🧪 Tests
```
backend/__tests__/auth.test.js       # Auth tests (15)
backend/__tests__/events.test.js     # Event tests (20)
backend/__tests__/swap.test.js       # Swap tests (25)
backend/__tests__/setup.js           # Test setup
backend/__tests__/helpers.js         # Test utilities
```

---

## 🔄 Application Flow

### 1. Authentication Flow
```
User → LoginPage.jsx → POST /api/auth/login → auth.js route
                                            → RegisterUser model
                                            → JWT token returned
                                            → Token stored in localStorage
                                            → Redirect to Dashboard
```

### 2. Event Creation Flow
```
User → Dashboard.jsx → CreateEvent.jsx → POST /api/events → events.js route
                                                          → Events model
                                                          → Conflict check
                                                          → Save to MongoDB
                                                          → Return event
                                                          → Update UI
```

### 3. Swap Request Flow
```
User → Marketplace.jsx → Select slot → POST /api/swap-request → swap.js route
                                                               → Start transaction
                                                               → Update both events
                                                               → Create SwapRequest
                                                               → Commit transaction
                                                               → Notify recipient
```

### 4. Swap Accept Flow
```
Recipient → Notifications.jsx → Accept → POST /api/swap-response/:id → swap.js route
                                                                     → Start transaction
                                                                     → Swap ownership
                                                                     → Update statuses
                                                                     → Commit transaction
                                                                     → Update UI
```

---

## 🐳 Docker Architecture

### Development Setup
```
docker-compose.yml
├── MongoDB Container (port 27017)
│   └── Named volume: mongodb_data
│
├── Backend Container (port 5000)
│   ├── Hot-reload: nodemon
│   └── Volume mount: ./backend → /app
│
└── Frontend Container (port 5173)
    ├── Hot-reload: Vite HMR
    └── Volume mount: ./frontend → /app
```

### Production Setup
```
docker-compose.prod.yml
├── MongoDB Container (port 27017)
│   ├── Authentication enabled
│   └── Named volume: mongodb_data
│
├── Backend Container (port 5000)
│   ├── Optimized build
│   ├── Health checks
│   └── Auto-restart
│
├── Frontend Container (port 3000)
│   ├── Multi-stage build
│   ├── Static file serving
│   └── Health checks
│
└── Nginx Container (port 80)
    ├── Reverse proxy
    ├── Frontend: / → :3000
    └── Backend: /api → :5000
```

---

## 📦 Dependencies Overview

### Backend Dependencies
```json
{
  "production": [
    "express",        // Web framework
    "mongoose",       // MongoDB ODM
    "bcryptjs",       // Password hashing
    "jsonwebtoken",   // JWT authentication
    "cors",           // CORS middleware
    "dotenv"          // Environment variables
  ],
  "development": [
    "nodemon",               // Hot-reload
    "jest",                  // Testing framework
    "supertest",             // HTTP testing
    "mongodb-memory-server"  // In-memory MongoDB
  ]
}
```

### Frontend Dependencies
```json
{
  "production": [
    "react",            // UI library
    "react-dom",        // React DOM renderer
    "react-router-dom"  // Client-side routing
  ],
  "development": [
    "vite",                      // Build tool
    "@vitejs/plugin-react",      // React plugin
    "eslint",                    // Code linting
    "eslint-plugin-react-hooks"  // React hooks linting
  ]
}
```

---

## 🔐 Security Files

```
.gitignore                  # Prevent committing sensitive files
.dockerignore               # Exclude files from Docker images
.env (gitignored)           # Local environment variables
.env.example (committed)    # Environment template
```

**Ignored Files**:
- `.env` (contains secrets)
- `node_modules/` (dependencies)
- `dist/` (build output)
- `coverage/` (test coverage)
- `.DS_Store` (macOS)

---

## 📈 Code Statistics

### Lines of Code
| Component | Files | Lines | Purpose |
|-----------|-------|-------|---------|
| **Backend Routes** | 4 files | ~1,200 | API endpoints |
| **Backend Models** | 3 files | ~250 | Database schemas |
| **Backend Tests** | 3 files | ~810 | Test suite |
| **Frontend Components** | 7 files | ~2,000 | UI components |
| **Frontend Styles** | 10 files | ~1,500 | CSS styling |
| **Documentation** | 12 files | ~5,750 | READMEs & guides |
| **TOTAL** | **39+ files** | **~11,500+** | Complete project |

---

## 🎯 Quick Navigation

### Need to work on...

**Authentication?**
- Backend: `backend/routes/auth.js`, `backend/models/RegisterUser.js`
- Frontend: `frontend/src/components/LoginPage.jsx`, `RegisterPage.jsx`
- Middleware: `backend/middleware/auth.js`

**Events?**
- Backend: `backend/routes/events.js`, `backend/models/Events.js`
- Frontend: `frontend/src/Pages/Dashboard.jsx`, `CreateEvent.jsx`, `EditEvent.jsx`

**Swaps?**
- Backend: `backend/routes/swap.js`, `backend/models/SwapRequest.js`
- Frontend: `frontend/src/Pages/Marketplace.jsx`, `Notifications.jsx`

**Styling?**
- Global: `frontend/src/index.css` (CSS variables)
- Components: `frontend/src/Styles/components/`
- Pages: `frontend/src/Styles/Pages/`

**Testing?**
- Tests: `backend/__tests__/`
- Config: `backend/jest.config.js`
- Helpers: `backend/__tests__/helpers.js`

**Docker?**
- Dev: `docker-compose.yml`
- Prod: `docker-compose.prod.yml`
- Configs: `Dockerfile`, `Dockerfile.dev` (in backend/ and frontend/)

---

## 🔗 Related Documentation

- **[README.md](./README.md)** - Main project overview
- **[DOCUMENTATION_INDEX.md](./DOCUMENTATION_INDEX.md)** - All docs explained
- **[QUICK_START.md](./QUICK_START.md)** - Get started quickly

---

**Last Updated**: November 5, 2025  
**Maintained By**: Aman Sharma
