# Slot Swapper Backend API

Express + MongoDB backend for the Slot Swapper application with comprehensive test coverage.

## Features

- 🔐 JWT-based authentication
- 📅 Event management with conflict detection
- 🔄 Atomic swap operations with MongoDB transactions
- ✅ **Comprehensive test suite (60+ tests)**
- 🛡️ Protected routes with middleware
- 📊 RESTful API design

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express 5
- **Database**: MongoDB (Mongoose ODM)
- **Auth**: JWT (jsonwebtoken) + bcryptjs
- **Testing**: Jest + Supertest + MongoDB Memory Server
- **Dev Tools**: Nodemon

## Project Structure

```
backend/
├── __tests__/              # Test suite
│   ├── setup.js           # Test configuration
│   ├── helpers.js         # Test utilities
│   ├── auth.test.js       # Auth route tests
│   ├── events.test.js     # Event route tests
│   └── swap.test.js       # Swap logic tests
├── middleware/
│   └── auth.js            # JWT authentication middleware
├── models/
│   ├── RegisterUser.js    # User model
│   ├── Events.js          # Event model
│   └── SwapRequest.js     # Swap request model
├── routes/
│   ├── auth.js            # Authentication routes
│   ├── events.js          # Event CRUD routes
│   ├── marketplace.js     # Marketplace routes
│   └── swap.js            # Swap operation routes
├── utils/
│   └── jwt.js             # JWT utilities
├── server.js              # Express app & server
├── jest.config.js         # Jest configuration
└── package.json
```

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env` file:

```env
MONGODB_URI=mongodb://localhost:27017/slot-swapper
PORT=5000
JWT_SECRET=your-secret-key-here
```

### 3. Start Development Server

```bash
npm run dev
```

Server runs at `http://localhost:5000`

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current user (protected)

### Events

- `POST /api/events` - Create event
- `GET /api/events` - Get user's events (with filters)
- `GET /api/events/:id` - Get single event
- `PUT /api/events/:id` - Update event (full)
- `PATCH /api/events/:id` - Update event (partial)
- `PATCH /api/events/:id/status` - Update status only
- `DELETE /api/events/:id` - Delete event

### Marketplace

- `GET /api/swappable-slots` - Get all swappable slots (excluding user's own)

### Swap Operations

- `POST /api/swap-request` - Create swap request
- `POST /api/swap-response/:requestId` - Accept/reject swap request
- `GET /api/swap-requests/incoming` - Get incoming requests (pending)
- `GET /api/swap-requests/outgoing` - Get sent requests (all statuses)

## Testing 🧪

### Run All Tests

```bash
npm test
```

### Watch Mode (Development)

```bash
npm run test:watch
```

### Coverage Report

```bash
npm run test:coverage
```

### Test Coverage

| Module | Tests | Coverage |
|--------|-------|----------|
| Auth Routes | 15 | Registration, Login, Protected Routes |
| Event Routes | 20 | CRUD, Validation, Conflicts |
| Swap Routes | 25 | Request, Accept, Reject, Edge Cases |
| **Total** | **60** | **Comprehensive** |

**Key Testing Areas:**
- ✅ Authentication & Authorization
- ✅ Event conflict detection
- ✅ Partial update validation
- ✅ Swap transaction atomicity
- ✅ Ownership exchange verification
- ✅ Transaction rollback on failure
- ✅ Edge cases & error handling

See [`__tests__/README.md`](./__tests__/README.md) for detailed test documentation.

## API Examples

### Register User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Create Event

```bash
curl -X POST http://localhost:5000/api/events \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Team Meeting",
    "startTime": "2025-11-06T10:00:00Z",
    "endTime": "2025-11-06T11:00:00Z",
    "status": "SWAPPABLE"
  }'
```

### Request Swap

```bash
curl -X POST http://localhost:5000/api/swap-request \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "mySlotId": "EVENT_ID_1",
    "theirSlotId": "EVENT_ID_2"
  }'
```

### Accept Swap

```bash
curl -X POST http://localhost:5000/api/swap-response/SWAP_REQUEST_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "accept": true
  }'
```

## Key Features

### 1. Event Conflict Detection

Automatically prevents overlapping events for the same user:

```javascript
// Checks for time conflicts before creating/updating
if (conflictingEvents.length > 0) {
  return res.status(400).json({ message: 'Time conflict detected' });
}
```

### 2. Atomic Swap Operations

Uses MongoDB transactions for data consistency:

```javascript
const session = await mongoose.startSession();
session.startTransaction();
try {
  // Update both slots and swap request atomically
  await Event.findByIdAndUpdate(slot1, { userId: user2 }, { session });
  await Event.findByIdAndUpdate(slot2, { userId: user1 }, { session });
  await session.commitTransaction();
} catch (error) {
  await session.abortTransaction(); // Rollback on failure
}
```

### 3. Partial Updates

Efficiently update only changed fields:

```javascript
PATCH /api/events/:id
{
  "title": "Updated Title"  // Only updates title, keeps other fields
}
```

### 4. Status Management

Event statuses: `BUSY`, `SWAPPABLE`, `SWAP_PENDING`

```javascript
// Swap flow
SWAPPABLE → SWAP_PENDING (request created)
SWAP_PENDING → BUSY (swap accepted)
SWAP_PENDING → SWAPPABLE (swap rejected)
```

## Error Handling

All routes return consistent error format:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error (dev mode only)"
}
```

## Development

### Scripts

```bash
npm start          # Production server
npm run dev        # Development with nodemon
npm test           # Run test suite
npm run test:watch # Watch mode for tests
npm run test:coverage # Generate coverage report
```

### Database Indexes

Optimized indexes for performance:

```javascript
// Event model
{ userId: 1, startTime: 1 }  // User's events by time
{ status: 1 }                 // Filter by status

// SwapRequest model
{ recipient: 1, status: 1, createdAt: -1 }  // Incoming requests
{ requester: 1, createdAt: -1 }             // Outgoing requests
```

## Security

- 🔒 Passwords hashed with bcryptjs (salt rounds: 10)
- 🎟️ JWT tokens with expiration
- 🛡️ Protected routes with middleware
- ✅ Input validation on all endpoints
- 🚫 Authorization checks prevent cross-user access

## Contributing

1. Write tests for new features
2. Ensure all tests pass (`npm test`)
3. Maintain >80% code coverage
4. Follow existing code style
5. Update documentation

## Troubleshooting

### MongoDB Connection Error

Ensure MongoDB is running:
```bash
# Windows
net start MongoDB

# macOS/Linux
sudo systemctl start mongod
```

### Port Already in Use

Change port in `.env`:
```env
PORT=3001
```

### Test Failures

Run with verbose output:
```bash
npm test -- --verbose
```

## Docker Support 🐳

This backend is fully containerized with Docker support for both development and production environments.

### Quick Start with Docker

**Development:**
```bash
# From project root
docker-compose up
```

**Production:**
```bash
# From project root
docker-compose -f docker-compose.prod.yml up -d
```

See [DOCKER_GUIDE.md](../DOCKER_GUIDE.md) for complete Docker documentation.

## API Testing with Postman

Import the Postman collection for quick API testing:

📥 [Download Postman Collection](../Slot_Swapper_API.postman_collection.json)

The collection includes:
- ✅ Pre-configured endpoints
- ✅ Environment variables
- ✅ Automatic token management
- ✅ Example requests for all routes
- ✅ Test scripts for automation

## Related Documentation

- 📖 [Main Project README](../README.md) - Complete project overview
- 🎨 [Frontend Documentation](../frontend/README.md) - React frontend guide
- 🐳 [Docker Guide](../DOCKER_GUIDE.md) - Containerization setup
- 🧪 [Test Documentation](./__tests__/README.md) - Comprehensive test guide
- 🚀 [Quick Start Guide](./TEST_QUICK_START.html) - Interactive HTML guide
- 📊 [Test Summary](./TEST_SUMMARY.md) - Test statistics

## License

MIT

---

**Need Help?**
- 📖 [Test Documentation](./__tests__/README.md)
- 🚀 [Quick Start Guide](./TEST_QUICK_START.html)
- 📊 [Test Summary](./TEST_SUMMARY.md)
- 🌐 [Main README](../README.md)
