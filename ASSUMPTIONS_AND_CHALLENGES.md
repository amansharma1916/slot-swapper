# 📋 Assumptions & Challenges Summary

Quick reference document for project assumptions and challenges faced during development.

---

## 🎯 Key Assumptions

### 1. User & Organization Context

| Assumption | Impact | Future Enhancement |
|------------|--------|-------------------|
| **Single Organization** | All users belong to same college/institution | Add multi-tenant support with organization IDs |
| **User Trust Model** | Users honor swap agreements | Implement rating/reputation system |
| **No User Verification** | Email addresses not verified | Add email verification flow |
| **Single Role System** | All users have same permissions | Add admin/moderator roles |

### 2. Time & Scheduling

| Assumption | Impact | Future Enhancement |
|------------|--------|-------------------|
| **UTC Storage** | All times stored in UTC, client converts | Works for single timezone; add timezone field for global |
| **Manual Event Creation** | Each event created individually | Add recurring events, templates, bulk import |
| **No Calendar Integration** | Standalone calendar system | Sync with Google Calendar, Outlook |
| **Sequential Time Slots** | Events are independent of each other | Add event dependencies, prerequisites |

### 3. Swap Mechanics

| Assumption | Impact | Future Enhancement |
|------------|--------|-------------------|
| **One-to-One Swaps** | Only bilateral exchanges (A ↔ B) | Support multi-party circular swaps (A → B → C → A) |
| **No Swap Conditions** | Simple accept/reject only | Add conditional swaps, counter-offers |
| **Immediate Swap** | Swap happens instantly on accept | Add scheduled swaps for future dates |
| **No Partial Swaps** | Must swap entire time slot | Allow partial time slot exchanges |

### 4. Technical & Security

| Assumption | Impact | Future Enhancement |
|------------|--------|-------------------|
| **localStorage Tokens** | JWT in localStorage (XSS risk) | Move to httpOnly cookies for production |
| **No Rate Limiting** | API can be called unlimited times | Add rate limiting middleware |
| **Client-side Routing** | React Router handles all routes | Add server-side rendering for SEO |
| **No CDN** | Assets served from same server | Use CDN for static assets |

### 5. Communication & Notifications

| Assumption | Impact | Future Enhancement |
|------------|--------|-------------------|
| **No Real-Time Updates** | Manual refresh needed | WebSocket integration with Socket.io |
| **No Email Notifications** | In-app only | SendGrid/Mailgun integration |
| **No Chat System** | Request/accept only | Real-time messaging per swap request |
| **No Push Notifications** | Web-only notifications | PWA with push notifications |

### 6. Data & Storage

| Assumption | Impact | Future Enhancement |
|------------|--------|-------------------|
| **Single Database** | One MongoDB for all data | Microservices with separate databases |
| **No Data Backup** | Manual backup required | Automated daily backups |
| **No Data Encryption** | Passwords hashed, but data not encrypted | Encrypt sensitive fields at rest |
| **Unlimited Storage** | No file size/count limits | Add storage quotas per user |

### 7. Event Types & Categories

| Assumption | Impact | Future Enhancement |
|------------|--------|-------------------|
| **Generic Events** | No distinction between event types | Add types: CLASS, LAB, MEETING, APPOINTMENT |
| **No Event Priority** | All events treated equally | Priority levels for important events |
| **No Event Categories** | No grouping mechanism | Categories/tags for organization |
| **No Attendance Tracking** | No verification of event attendance | Check-in system for events |

---

## 🚧 Major Challenges Faced

### 1. MongoDB Transactions ⚠️ HIGH COMPLEXITY

**Challenge**: 
- First time implementing distributed transactions
- Complex session management and error handling
- Ensuring atomicity across multiple collections

**Solution**:
```javascript
const session = await mongoose.startSession();
session.startTransaction();
try {
  await Event.findByIdAndUpdate(slot1, { userId: user2 }, { session });
  await Event.findByIdAndUpdate(slot2, { userId: user1 }, { session });
  await SwapRequest.findByIdAndUpdate(swapId, { status: 'ACCEPTED' }, { session });
  await session.commitTransaction();
} catch (error) {
  await session.abortTransaction();
  throw error;
} finally {
  session.endSession();
}
```

**Learnings**:
- Must pass `{ session }` to EVERY operation
- Rollback is automatic on exception
- Test transactions thoroughly with concurrent operations
- MongoDB 4.0+ required for multi-document transactions

**Time Investment**: ~6 hours (learning + implementation + testing)

---

### 2. Race Conditions in Swap Requests ⚠️ HIGH COMPLEXITY

**Challenge**:
- Multiple users requesting same slot simultaneously
- Status changes could conflict
- Partial updates creating inconsistent states

**Solution**:
- Implemented state machine with SWAP_PENDING status
- Used transactions to lock both slots atomically
- Validation checks before status transitions

**State Flow**:
```
SWAPPABLE → (Request) → SWAP_PENDING → (Accept) → BUSY
                                      ↓ (Reject)
                                   SWAPPABLE
```

**Code**:
```javascript
// Validate both slots are SWAPPABLE before proceeding
if (mySlot.status !== 'SWAPPABLE' || theirSlot.status !== 'SWAPPABLE') {
  return res.status(400).json({ 
    success: false,
    message: 'Both slots must be SWAPPABLE' 
  });
}

// Lock both slots atomically
await Event.findByIdAndUpdate(mySlot._id, 
  { status: 'SWAP_PENDING' }, 
  { session }
);
await Event.findByIdAndUpdate(theirSlot._id, 
  { status: 'SWAP_PENDING' }, 
  { session }
);
```

**Time Investment**: ~4 hours

---

### 3. Event Conflict Detection Algorithm ⚖️ MEDIUM COMPLEXITY

**Challenge**:
- Detecting overlapping time ranges
- Multiple edge cases (exact same time, partial overlap, contained events)
- Performance concerns with many events

**Solution**:
Used MongoDB query for efficient single-query check:

```javascript
// Two events overlap if:
// Event1.start < Event2.end AND Event1.end > Event2.start
const conflictingEvents = await Event.find({
  userId: req.user._id,
  _id: { $ne: eventId }, // Exclude current event for updates
  startTime: { $lt: endTime },
  endTime: { $gt: startTime }
});
```

**Edge Cases Covered**:
| Scenario | Example | Detected? |
|----------|---------|-----------|
| Exact same time | 10:00-11:00 vs 10:00-11:00 | ✅ Yes |
| Partial overlap | 10:00-11:00 vs 10:30-11:30 | ✅ Yes |
| Completely contained | 10:00-12:00 vs 10:30-11:00 | ✅ Yes |
| Back-to-back | 10:00-11:00 vs 11:00-12:00 | ✅ No (correct) |
| No overlap | 10:00-11:00 vs 12:00-13:00 | ✅ No |

**Time Investment**: ~3 hours

---

### 4. Testing Transaction Atomicity 🧪 HIGH COMPLEXITY

**Challenge**:
- Need real MongoDB for transaction tests
- In-memory testing difficult
- Verifying ownership swap happened correctly
- Test isolation between runs

**Solution**:
- MongoDB Memory Server for isolated test database
- Fresh database for each test
- Explicit verification of ownership changes

**Test Pattern**:
```javascript
// Capture initial state
const beforeMySlot = await Event.findById(mySlotId);
const beforeTheirSlot = await Event.findById(theirSlotId);

// Perform swap
const response = await request(app)
  .post(`/api/swap-response/${swapRequestId}`)
  .set('Authorization', `Bearer ${recipientToken}`)
  .send({ accept: true });

// Verify atomic swap
const afterMySlot = await Event.findById(mySlotId);
const afterTheirSlot = await Event.findById(theirSlotId);

expect(afterMySlot.userId.toString()).toBe(beforeTheirSlot.userId.toString());
expect(afterTheirSlot.userId.toString()).toBe(beforeMySlot.userId.toString());
```

**Time Investment**: ~5 hours (setup + test writing)

---

### 5. JWT Token Management & Expiration ⚖️ MEDIUM COMPLEXITY

**Challenge**:
- Users logged out unexpectedly
- No token refresh mechanism
- Poor UX on expiration
- Token invalidation on logout

**Solution**:
```javascript
// Frontend: Intercept 401 responses
if (response.status === 401) {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/';
  alert('Session expired. Please login again.');
}

// Backend: Verify token middleware
const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};
```

**Future**: Implement refresh tokens for better UX

**Time Investment**: ~2 hours

---

### 6. Responsive UI for Mobile Devices 🎨 MEDIUM COMPLEXITY

**Challenge**:
- Complex dashboard calendar not mobile-friendly
- Too much information on small screens
- Touch targets too small (iOS requires 44×44px minimum)
- Different interaction patterns (hover vs touch)

**Solution**:
```css
/* Mobile-first approach */
.event-card {
  padding: 1rem;
  font-size: 0.875rem;
  min-height: 44px; /* Touch target */
  touch-action: manipulation;
}

/* Desktop enhancements */
@media (min-width: 768px) {
  .event-card {
    padding: 1.5rem;
    font-size: 1rem;
  }
  
  .event-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  }
}

/* Remove hover effects on touch devices */
@media (hover: none) {
  .event-card:hover {
    transform: none;
  }
}
```

**Time Investment**: ~4 hours

---

### 7. Docker Hot-Reload Configuration 🐳 MEDIUM COMPLEXITY

**Challenge**:
- Changes not reflecting in containers
- node_modules conflicts with volume mounts
- Different paths between Windows/Mac/Linux
- MongoDB data persistence

**Solution**:
```yaml
# docker-compose.yml
services:
  backend:
    volumes:
      - ./backend:/app           # Mount source
      - /app/node_modules        # Exclude node_modules
      - /app/__tests__/coverage  # Exclude coverage
    command: npm run dev         # nodemon for hot-reload

  frontend:
    volumes:
      - ./frontend:/app
      - /app/node_modules
      - /app/dist
    command: npm run dev         # Vite HMR

  mongodb:
    volumes:
      - mongodb_data:/data/db    # Named volume for persistence

volumes:
  mongodb_data:                  # Persists across restarts
```

**.dockerignore**:
```
node_modules
npm-debug.log
dist
coverage
.git
.env
```

**Time Investment**: ~3 hours

---

### 8. Environment Variable Management 🔧 LOW-MEDIUM COMPLEXITY

**Challenge**:
- Different configs for dev/prod
- Risk of committing secrets to Git
- Docker environment variables confusion
- Vite's VITE_ prefix requirement

**Solution**:
```bash
# Project structure
.env.example       # Template (committed to Git)
.env              # Local development (gitignored)
.env.prod         # Production (gitignored)

# .gitignore
.env
.env.prod
.env.local
```

**Backend (.env.example)**:
```env
MONGODB_URI=mongodb://localhost:27017/slot-swapper
PORT=5000
JWT_SECRET=your-secret-key-at-least-32-characters
```

**Frontend (.env.example)**:
```env
VITE_API_URL=http://localhost:5000
```

**Docker**:
```yaml
services:
  backend:
    env_file:
      - .env.prod  # Load from file
    environment:
      - NODE_ENV=production  # Override specific vars
```

**Time Investment**: ~2 hours

---

### 9. CORS Configuration for Development 🌐 LOW COMPLEXITY

**Challenge**:
- Frontend on port 5173, backend on 5000
- CORS errors blocking API calls
- Different origins in dev vs production

**Solution**:
```javascript
// Backend: server.js
const cors = require('cors');

app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? 'https://yourdomain.com'  // Production domain
    : 'http://localhost:5173',  // Dev frontend
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

**Time Investment**: ~1 hour

---

### 10. Partial Update Validation 🔍 MEDIUM COMPLEXITY

**Challenge**:
- Supporting PATCH for partial updates
- Validating only provided fields
- Handling time range validation when only one time field updated
- Preventing invalid partial updates

**Solution**:
```javascript
// Extract only allowed fields from request
const allowed = ['title', 'description', 'status', 'startTime', 'endTime'];
const updateFields = {};

for (const key of allowed) {
  if (req.body.hasOwnProperty(key)) {
    updateFields[key] = req.body[key];
  }
}

// Validate time range if either time field present
const hasStart = 'startTime' in updateFields;
const hasEnd = 'endTime' in updateFields;

if (hasStart || hasEnd) {
  const startCandidate = hasStart ? new Date(updateFields.startTime) : event.startTime;
  const endCandidate = hasEnd ? new Date(updateFields.endTime) : event.endTime;
  
  if (endCandidate <= startCandidate) {
    return res.status(400).json({ message: 'End time must be after start time' });
  }
  
  // Check conflicts with new time range
  // ...
}

// Update with $set to only modify provided fields
await Event.findByIdAndUpdate(
  eventId, 
  { $set: updateFields },
  { new: true, runValidators: true }
);
```

**Time Investment**: ~3 hours

---

## 📊 Challenge Summary Statistics

| Complexity | Count | Total Time |
|------------|-------|------------|
| **High** | 3 | ~15 hours |
| **Medium** | 6 | ~19 hours |
| **Low** | 1 | ~1 hour |
| **TOTAL** | 10 | **~35 hours** |

### Time Breakdown by Category

| Category | Time Spent | % of Total |
|----------|------------|------------|
| **Backend Logic** | ~15 hours | 43% |
| **Testing** | ~8 hours | 23% |
| **UI/UX** | ~6 hours | 17% |
| **DevOps** | ~5 hours | 14% |
| **Security** | ~1 hour | 3% |

---

## 🎓 Key Learnings

### Technical Skills Gained

1. **MongoDB Transactions**
   - Session management
   - Rollback mechanisms
   - Multi-document ACID operations
   - Transaction testing

2. **Race Condition Prevention**
   - Status locking patterns
   - Atomic state transitions
   - Concurrent operation handling

3. **Docker Proficiency**
   - Multi-stage builds
   - Volume management
   - Environment configuration
   - Hot-reload setup

4. **Testing Best Practices**
   - Test isolation
   - Mock data management
   - Coverage strategies
   - Transaction verification

5. **API Design**
   - RESTful principles
   - Partial update patterns
   - Error handling consistency
   - Status code usage

### Soft Skills Developed

1. **Problem Decomposition**: Breaking complex problems (swap atomicity) into testable units
2. **Documentation**: Writing clear, comprehensive documentation for future developers
3. **Trade-off Analysis**: Balancing feature complexity vs implementation time
4. **User Experience**: Considering edge cases from user perspective

---

## 💡 Best Practices Established

### Code Quality
- ✅ Comprehensive test coverage (60+ tests)
- ✅ ESLint for code consistency
- ✅ Descriptive commit messages
- ✅ Modular code structure

### Security
- ✅ Password hashing with bcrypt
- ✅ JWT authentication
- ✅ Input validation on all endpoints
- ✅ Authorization checks

### DevOps
- ✅ Docker containerization
- ✅ Environment-based configuration
- ✅ Health checks for services
- ✅ Automated testing in CI/CD ready

### Documentation
- ✅ Comprehensive README files
- ✅ API documentation with examples
- ✅ Inline code comments for complex logic
- ✅ Postman collection for testing

---

## 🔮 Lessons for Future Projects

1. **Start with Transactions Early**: Don't add transaction support late; design data flows with transactions from the start

2. **Test Concurrency from Day 1**: Race conditions are hard to debug; test concurrent operations early

3. **Document Assumptions**: Write down assumptions explicitly; they guide implementation and testing

4. **Mobile-First Always**: Designing for mobile first makes desktop easier, not the other way around

5. **Docker from Start**: Setting up Docker after development is harder; start with it

6. **Authentication Pattern**: JWT with refresh tokens should be standard; implementing later is painful

7. **State Machines**: Explicit state machines prevent bugs; document state transitions clearly

8. **Environment Management**: Set up .env structure early; changing it later affects everyone

---

**Document Version**: 1.0  
**Last Updated**: November 5, 2025  
**Author**: Aman Sharma

---

## 📞 Questions?

If you have questions about any assumptions or challenges:
1. Check the [DESIGN_CHOICES.md](./DESIGN_CHOICES.md) for detailed explanations
2. Review the [README.md](./README.md) for overall context
3. See specific documentation files for detailed guides
