# 🐳 Docker Setup Guide

Complete containerization setup for the Slot Swapper application with MongoDB, Backend API, and Frontend.

## 📋 Prerequisites

- [Docker](https://docs.docker.com/get-docker/) (v20.10+)
- [Docker Compose](https://docs.docker.com/compose/install/) (v2.0+)
- 4GB+ RAM available for Docker
- Ports 5173 (frontend), 5000 (backend), and 27017 (MongoDB) available

## 🚀 Quick Start (Development)

### 1. Clone and Navigate

```bash
cd "Slot Swapper"
```

### 2. Start All Services

```bash
docker-compose up
```

That's it! The application will be available at:
- 🌐 Frontend: http://localhost:5173
- 🔌 Backend API: http://localhost:5000
- 🗄️ MongoDB: mongodb://localhost:27017

### 3. Stop Services

```bash
# Stop and keep containers
docker-compose stop

# Stop and remove containers
docker-compose down

# Stop and remove containers + volumes (clean slate)
docker-compose down -v
```

## 📦 What's Included

### Services

| Service | Port | Description |
|---------|------|-------------|
| **frontend** | 5173 | React + Vite dev server with hot-reload |
| **backend** | 5000 | Node.js + Express API with nodemon |
| **mongodb** | 27017 | MongoDB 7.0 database |

### Docker Files

```
.
├── docker-compose.yml           # Development setup
├── docker-compose.prod.yml      # Production setup
├── nginx.conf                   # Nginx reverse proxy config
├── .env.example                 # Environment variables template
├── backend/
│   ├── Dockerfile              # Production backend image
│   ├── Dockerfile.dev          # Development backend image
│   └── .dockerignore           # Files to exclude from image
└── frontend/
    ├── Dockerfile              # Production frontend image
    ├── Dockerfile.dev          # Development frontend image
    └── .dockerignore           # Files to exclude from image
```

## 🛠️ Development Workflow

### Start in Detached Mode (Background)

```bash
docker-compose up -d
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb
```

### Rebuild After Code Changes

```bash
# Rebuild all services
docker-compose up --build

# Rebuild specific service
docker-compose up --build backend
```

### Execute Commands in Containers

```bash
# Backend: Run tests
docker-compose exec backend npm test

# Backend: Install new package
docker-compose exec backend npm install <package-name>

# MongoDB: Access mongo shell
docker-compose exec mongodb mongosh slot-swapper
```

### Hot Reload

Both frontend and backend support hot-reload:
- **Frontend**: Changes to `.jsx`, `.css` files auto-reload
- **Backend**: Changes to `.js` files restart server (nodemon)

Files are mounted as volumes, so edit on your host machine and see changes instantly!

## 🏭 Production Deployment

### 1. Create Environment File

```bash
cp .env.example .env.prod
```

Edit `.env.prod`:

```env
MONGO_ROOT_PASSWORD=your-secure-password
JWT_SECRET=your-super-secret-jwt-key-at-least-32-chars
API_URL=http://your-domain.com:5000
```

### 2. Build and Run Production

```bash
docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d --build
```

Production setup includes:
- ✅ Optimized multi-stage builds
- ✅ Production-only dependencies
- ✅ Health checks for all services
- ✅ Nginx reverse proxy (optional)
- ✅ MongoDB authentication
- ✅ Auto-restart policies

### 3. Access Application

- 🌐 Via Nginx: http://localhost (or your domain)
- 🌐 Frontend direct: http://localhost:3000
- 🔌 Backend API: http://localhost:5000

### 4. Monitor Services

```bash
# Check service status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Check health
docker-compose -f docker-compose.prod.yml exec backend wget -qO- http://localhost:5000/
```

## 🔧 Configuration

### Environment Variables

#### Development (docker-compose.yml)
Already configured with sensible defaults. No `.env` file needed.

#### Production (docker-compose.prod.yml)
Required variables in `.env.prod`:

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGO_ROOT_PASSWORD` | MongoDB admin password | `SecurePass123!` |
| `JWT_SECRET` | JWT signing secret (32+ chars) | `your-secret-key-here` |
| `API_URL` | Backend API URL for frontend | `http://localhost:5000` |

### Port Customization

Edit `docker-compose.yml` ports section:

```yaml
services:
  frontend:
    ports:
      - "8080:5173"  # Access on port 8080
  backend:
    ports:
      - "4000:5000"  # Access on port 4000
```

## 🧪 Running Tests in Docker

### Backend Tests

```bash
# Run all tests
docker-compose exec backend npm test

# Watch mode
docker-compose exec backend npm run test:watch

# Coverage report
docker-compose exec backend npm run test:coverage
```

### Access Coverage Report

```bash
# Generate coverage
docker-compose exec backend npm run test:coverage

# Copy coverage to host
docker cp slot-swapper-backend:/app/coverage ./backend-coverage

# Open in browser
open backend-coverage/lcov-report/index.html  # macOS
start backend-coverage/lcov-report/index.html # Windows
```

## 📊 Database Management

### Backup MongoDB

```bash
# Backup to host
docker-compose exec mongodb mongodump --out /data/backup
docker cp slot-swapper-mongodb:/data/backup ./mongodb-backup

# Or use volume
docker-compose exec mongodb mongodump --out /data/db/backup
```

### Restore MongoDB

```bash
# Copy backup to container
docker cp ./mongodb-backup slot-swapper-mongodb:/data/restore

# Restore
docker-compose exec mongodb mongorestore /data/restore
```

### Access MongoDB Shell

```bash
# Development
docker-compose exec mongodb mongosh slot-swapper

# Production (with auth)
docker-compose -f docker-compose.prod.yml exec mongodb mongosh \
  -u admin -p $MONGO_ROOT_PASSWORD --authenticationDatabase admin slot-swapper
```

### Common MongoDB Commands

```javascript
// List all databases
show dbs

// Use slot-swapper database
use slot-swapper

// Show collections
show collections

// Count users
db.users.countDocuments()

// Find all events
db.events.find().pretty()

// Clear all swap requests
db.swaprequests.deleteMany({})
```

## 🐛 Troubleshooting

### Port Already in Use

**Error**: `Bind for 0.0.0.0:5000 failed: port is already allocated`

**Solution**:
```bash
# Find process using the port (Windows)
netstat -ano | findstr :5000

# Kill the process
taskkill /PID <PID> /F

# Or change port in docker-compose.yml
```

### Container Won't Start

**Check logs**:
```bash
docker-compose logs backend
docker-compose logs frontend
docker-compose logs mongodb
```

**Common fixes**:
```bash
# Remove old containers and volumes
docker-compose down -v

# Rebuild from scratch
docker-compose build --no-cache

# Restart Docker Desktop
```

### MongoDB Connection Failed

**Issue**: Backend can't connect to MongoDB

**Solution**:
```bash
# Check if MongoDB is running
docker-compose ps

# Check MongoDB logs
docker-compose logs mongodb

# Verify MongoDB is healthy
docker-compose exec mongodb mongosh --eval "db.adminCommand('ping')"
```

### Hot Reload Not Working

**Issue**: Code changes not reflecting

**Solution**:
```bash
# Ensure volumes are mounted correctly
docker-compose down
docker-compose up

# Or restart specific service
docker-compose restart backend
```

### Out of Disk Space

**Check Docker disk usage**:
```bash
docker system df
```

**Clean up**:
```bash
# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune

# Remove everything unused
docker system prune -a --volumes
```

## 🔒 Security Best Practices

### For Production

1. **Change Default Passwords**
   ```bash
   # Generate secure password
   openssl rand -base64 32
   ```

2. **Use Secrets Management**
   ```bash
   # Don't commit .env.prod
   echo ".env.prod" >> .gitignore
   ```

3. **Enable MongoDB Authentication**
   - Already configured in `docker-compose.prod.yml`
   - Use strong passwords

4. **Use HTTPS with Nginx**
   - Add SSL certificates
   - Configure nginx for HTTPS

5. **Limit MongoDB Access**
   ```yaml
   mongodb:
     ports:
       - "127.0.0.1:27017:27017"  # Only localhost
   ```

## 📈 Performance Optimization

### Multi-Stage Builds

Already implemented in production Dockerfiles:
- ✅ Smaller image sizes
- ✅ Faster deployments
- ✅ Security improvements

### Docker Layer Caching

Optimize Dockerfile order:
```dockerfile
# 1. Copy package files first (rarely change)
COPY package*.json ./
RUN npm install

# 2. Copy source code (changes frequently)
COPY . .
```

### Reduce Image Size

```bash
# Use alpine base images (already done)
FROM node:20-alpine

# Multi-stage builds (already done)
FROM node:20-alpine AS builder
...
FROM node:20-alpine
COPY --from=builder ...
```

## 🔄 CI/CD Integration

### GitHub Actions Example

```yaml
name: Docker Build and Test

on: [push]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run tests
        run: |
          docker-compose up -d
          docker-compose exec -T backend npm test
          docker-compose down
```

### Build and Push to Registry

```bash
# Build images
docker-compose -f docker-compose.prod.yml build

# Tag images
docker tag slot-swapper-backend:latest your-registry/slot-swapper-backend:latest
docker tag slot-swapper-frontend:latest your-registry/slot-swapper-frontend:latest

# Push to registry
docker push your-registry/slot-swapper-backend:latest
docker push your-registry/slot-swapper-frontend:latest
```

## 🎯 Common Tasks

### Reset Everything

```bash
docker-compose down -v
docker-compose up --build
```

### Update Dependencies

```bash
# Backend
docker-compose exec backend npm update

# Frontend
docker-compose exec frontend npm update

# Rebuild
docker-compose up --build
```

### Scale Services (Production)

```bash
docker-compose -f docker-compose.prod.yml up -d --scale backend=3
```

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [MongoDB Docker Hub](https://hub.docker.com/_/mongo)
- [Node.js Docker Best Practices](https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md)

## 🆘 Need Help?

- Check logs: `docker-compose logs -f`
- Verify services: `docker-compose ps`
- Restart services: `docker-compose restart`
- Clean slate: `docker-compose down -v && docker-compose up --build`

---

**Happy Dockerizing! 🐳**
