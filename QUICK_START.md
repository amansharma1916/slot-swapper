# 🚀 Quick Setup Guide

Get Slot Swapper running on your machine in **5 minutes**!

## ⚡ Choose Your Setup Method

### 🐳 Option 1: Docker (Recommended - Easiest)

**Prerequisites**: Docker & Docker Compose installed

```bash
# 1. Clone repository
git clone https://github.com/amansharma1916/slot-swapper.git
cd slot-swapper

# 2. Start all services
docker-compose up

# 3. Open your browser
# Frontend: http://localhost:5173
# Backend: http://localhost:5000
```

**That's it!** All services are running with hot-reload enabled.

#### Useful Commands
```bash
# Run in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop everything
docker-compose down

# Fresh start (removes data)
docker-compose down -v && docker-compose up
```

---

### 💻 Option 2: Manual Setup (Traditional)

**Prerequisites**: Node.js 20+, MongoDB 7+

#### Step 1: Setup Backend

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your settings:
# MONGODB_URI=mongodb://localhost:27017/slot-swapper
# PORT=5000
# JWT_SECRET=your-secret-key-here

# Start MongoDB (if not running)
# Windows: net start MongoDB
# Mac/Linux: sudo systemctl start mongod

# Start backend server
npm run dev
```

✅ Backend running at `http://localhost:5000`

#### Step 2: Setup Frontend

```bash
# Open new terminal
cd frontend

# Install dependencies
npm install

# (Optional) Create .env for custom API URL
cp .env.example .env

# Start frontend
npm run dev
```

✅ Frontend running at `http://localhost:5173`

---

## 🧪 Testing the Application

### 1. Register a User

**URL**: http://localhost:5173/register

```
Full Name: John Doe
Email: john@example.com
Password: password123
```

### 2. Create an Event

**Dashboard** → **Create Event**

```
Title: Data Structures Lab
Start Time: Tomorrow 10:00 AM
End Time: Tomorrow 12:00 PM
Status: SWAPPABLE
```

### 3. Browse Marketplace

**Marketplace** → See available slots from other users

### 4. Request a Swap

1. Click on a slot you want
2. Select your slot to offer
3. Click "Request Swap"
4. Check **Notifications** for updates

---

## 🧪 Running Tests

### Backend Tests (60+ tests)

```bash
cd backend

# Run all tests
npm test

# Watch mode (auto-rerun on changes)
npm run test:watch

# Coverage report
npm run test:coverage
```

---

## 📮 API Testing with Postman

### Import Collection

1. Open Postman
2. Click **Import**
3. Select `Slot_Swapper_API.postman_collection.json`
4. Set base URL: `http://localhost:5000/api`

### Quick Test Flow

1. **Register User** → Copy token from response
2. **Set token** in collection variables (authToken)
3. **Create Event** → Copy event ID
4. **Get Events** → Verify event created
5. **Create Swap Request** → Test swap flow

---

## 🐛 Troubleshooting

### Port Already in Use

**Error**: `EADDRINUSE: address already in use :::5000`

**Solution**:
```bash
# Windows - Find and kill process
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Or change port in .env
PORT=3001
```

---

### MongoDB Connection Failed

**Error**: `MongoNetworkError: connect ECONNREFUSED`

**Solution**:
```bash
# Check MongoDB is running
# Windows:
net start MongoDB

# Mac/Linux:
sudo systemctl start mongod

# Or verify connection string in .env
MONGODB_URI=mongodb://localhost:27017/slot-swapper
```

---

### Cannot find module errors

**Error**: `Cannot find module 'xyz'`

**Solution**:
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Or with Docker
docker-compose down -v
docker-compose up --build
```

---

### CORS Errors

**Error**: `Access-Control-Allow-Origin`

**Solution**:
- Ensure backend CORS is configured
- Check frontend API URL matches backend
- Verify both services are running

---

### White Screen / Blank Page

**Solution**:
```bash
# Clear browser cache
# Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

# Check browser console for errors
# Rebuild frontend
cd frontend
npm run build
npm run preview
```

---

## 📁 Project Structure Reference

```
slot-swapper/
├── backend/              # Node.js + Express API
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API endpoints
│   ├── middleware/      # Auth middleware
│   ├── __tests__/       # 60+ tests
│   └── server.js        # Entry point
│
├── frontend/            # React + Vite app
│   ├── src/
│   │   ├── components/  # Reusable UI
│   │   ├── Pages/       # Page components
│   │   └── Styles/      # CSS files
│   └── vite.config.js
│
├── docker-compose.yml   # Dev setup
├── docker-compose.prod.yml  # Production setup
└── README.md           # Full documentation
```

---

## 🎯 Next Steps

1. ✅ Register 2-3 test users
2. ✅ Create events with different statuses
3. ✅ Test the swap flow end-to-end
4. ✅ Browse through all pages
5. ✅ Check notifications system
6. ✅ Try API with Postman
7. ✅ Run the test suite

---

## 📚 Full Documentation

- 📖 [Complete README](./README.md)
- 🎨 [Frontend Guide](./frontend/README.md)
- 🔧 [Backend API Docs](./backend/README.md)
- 🐳 [Docker Guide](./DOCKER_GUIDE.md)
- 💡 [Design Choices](./DESIGN_CHOICES.md)
- 🧪 [Test Documentation](./backend/__tests__/README.md)

---

## 🆘 Need Help?

**Check in order:**
1. This quick guide
2. Full README.md
3. Browser console for errors
4. Backend terminal logs
5. GitHub Issues

---

**Happy Swapping! 🔄**

Built with ❤️ by Aman Sharma
