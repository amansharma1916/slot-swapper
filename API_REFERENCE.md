# 📮 API Quick Reference

Quick lookup guide for all Slot Swapper API endpoints.

**Base URL**: `http://localhost:5000/api`

**Authentication**: Include JWT token in Authorization header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 🔐 Authentication Endpoints

### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (201)**:
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": { "_id": "...", "fullName": "...", "email": "..." },
  "token": "eyJhbGciOiJIUzI1..."
}
```

---

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200)**:
```json
{
  "success": true,
  "message": "Login successful",
  "user": { "_id": "...", "fullName": "...", "email": "..." },
  "token": "eyJhbGciOiJIUzI1..."
}
```

---

### Get Current User
```http
GET /auth/me
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response (200)**:
```json
{
  "success": true,
  "user": { "_id": "...", "fullName": "...", "email": "..." }
}
```

---

## 📅 Event Endpoints

### Create Event
```http
POST /events
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "title": "Data Structures Lab",
  "startTime": "2025-11-07T10:00:00Z",
  "endTime": "2025-11-07T12:00:00Z",
  "status": "SWAPPABLE",
  "description": "Lab session in Room 301"
}
```

**Status Values**: `BUSY` | `SWAPPABLE` | `SWAP_PENDING`

**Response (201)**:
```json
{
  "success": true,
  "message": "Event created successfully",
  "event": {
    "_id": "...",
    "title": "Data Structures Lab",
    "startTime": "2025-11-07T10:00:00.000Z",
    "endTime": "2025-11-07T12:00:00.000Z",
    "status": "SWAPPABLE",
    "description": "Lab session in Room 301",
    "userId": "..."
  }
}
```

---

### Get All Events
```http
GET /events
Authorization: Bearer YOUR_JWT_TOKEN
```

**Query Parameters**:
- `status` - Filter by status (`BUSY`, `SWAPPABLE`, `SWAP_PENDING`)
- `startDate` - Filter by start date (ISO 8601)
- `endDate` - Filter by end date (ISO 8601)

**Examples**:
```http
GET /events?status=SWAPPABLE
GET /events?startDate=2025-11-01&endDate=2025-11-30
GET /events?status=BUSY&startDate=2025-11-01
```

**Response (200)**:
```json
{
  "success": true,
  "count": 5,
  "events": [
    {
      "_id": "...",
      "title": "...",
      "startTime": "...",
      "endTime": "...",
      "status": "...",
      "userId": "..."
    }
  ]
}
```

---

### Get Single Event
```http
GET /events/:id
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response (200)**:
```json
{
  "success": true,
  "event": {
    "_id": "...",
    "title": "...",
    "startTime": "...",
    "endTime": "...",
    "status": "...",
    "description": "...",
    "userId": "..."
  }
}
```

---

### Update Event (Full)
```http
PUT /events/:id
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "title": "Updated Title",
  "startTime": "2025-11-07T14:00:00Z",
  "endTime": "2025-11-07T16:00:00Z",
  "status": "BUSY",
  "description": "Updated description"
}
```

**Note**: All fields required for PUT

**Response (200)**:
```json
{
  "success": true,
  "message": "Event updated successfully",
  "event": { /* updated event */ }
}
```

---

### Update Event (Partial)
```http
PATCH /events/:id
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "title": "Only Update Title"
}
```

**Allowed Fields**: `title`, `description`, `status`, `startTime`, `endTime`

**Note**: Only provided fields are updated

**Response (200)**:
```json
{
  "success": true,
  "message": "Event updated successfully",
  "event": { /* updated event */ }
}
```

---

### Update Event Status Only
```http
PATCH /events/:id/status
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "status": "SWAPPABLE"
}
```

**Response (200)**:
```json
{
  "success": true,
  "message": "Event status updated successfully",
  "event": { /* updated event */ }
}
```

---

### Delete Event
```http
DELETE /events/:id
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response (200)**:
```json
{
  "success": true,
  "message": "Event deleted successfully"
}
```

---

## 🛒 Marketplace Endpoints

### Get All Swappable Slots
```http
GET /swappable-slots
Authorization: Bearer YOUR_JWT_TOKEN
```

**Query Parameters**:
- `startDate` - Filter by start date (ISO 8601)
- `endDate` - Filter by end date (ISO 8601)

**Examples**:
```http
GET /swappable-slots
GET /swappable-slots?startDate=2025-11-01&endDate=2025-11-30
```

**Response (200)**:
```json
{
  "success": true,
  "count": 10,
  "events": [
    {
      "_id": "...",
      "title": "...",
      "startTime": "...",
      "endTime": "...",
      "status": "SWAPPABLE",
      "userId": "..."
    }
  ]
}
```

**Note**: Excludes your own slots

---

## 🔄 Swap Endpoints

### Create Swap Request
```http
POST /swap-request
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "mySlotId": "673a1b2c3d4e5f6g7h8i9j0k",
  "theirSlotId": "673b2c3d4e5f6g7h8i9j0k1l"
}
```

**Requirements**:
- `mySlotId` must be your own event
- `theirSlotId` must belong to another user
- Both slots must have status `SWAPPABLE`

**Response (201)**:
```json
{
  "success": true,
  "message": "Swap request created",
  "request": {
    "_id": "...",
    "requester": "...",
    "recipient": "...",
    "mySlot": "...",
    "theirSlot": "...",
    "status": "PENDING",
    "createdAt": "..."
  }
}
```

**Effect**: Both slots marked as `SWAP_PENDING`

---

### Accept Swap Request
```http
POST /swap-response/:requestId
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "accept": true
}
```

**Response (200)**:
```json
{
  "success": true,
  "message": "Swap request accepted",
  "request": {
    "_id": "...",
    "status": "ACCEPTED",
    /* other fields */
  }
}
```

**Effect**: 
- Slot ownership swapped atomically
- Both slots marked as `BUSY`
- Swap request marked as `ACCEPTED`

---

### Reject Swap Request
```http
POST /swap-response/:requestId
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "accept": false
}
```

**Response (200)**:
```json
{
  "success": true,
  "message": "Swap request rejected",
  "request": {
    "_id": "...",
    "status": "REJECTED",
    /* other fields */
  }
}
```

**Effect**:
- Both slots revert to `SWAPPABLE`
- Swap request marked as `REJECTED`

---

### Get Incoming Swap Requests
```http
GET /swap-requests/incoming
Authorization: Bearer YOUR_JWT_TOKEN
```

**Returns**: Pending swap requests sent TO you

**Response (200)**:
```json
{
  "success": true,
  "count": 3,
  "requests": [
    {
      "_id": "...",
      "requester": {
        "_id": "...",
        "fullName": "John Doe",
        "email": "john@example.com"
      },
      "mySlot": {
        "_id": "...",
        "title": "Your Event",
        "startTime": "...",
        "endTime": "...",
        "status": "SWAP_PENDING"
      },
      "theirSlot": {
        "_id": "...",
        "title": "Their Event",
        "startTime": "...",
        "endTime": "...",
        "status": "SWAP_PENDING"
      },
      "status": "PENDING",
      "createdAt": "..."
    }
  ]
}
```

---

### Get Outgoing Swap Requests
```http
GET /swap-requests/outgoing
Authorization: Bearer YOUR_JWT_TOKEN
```

**Returns**: All swap requests YOU sent (all statuses)

**Response (200)**:
```json
{
  "success": true,
  "count": 5,
  "requests": [
    {
      "_id": "...",
      "recipient": {
        "_id": "...",
        "fullName": "Jane Smith",
        "email": "jane@example.com"
      },
      "mySlot": { /* ... */ },
      "theirSlot": { /* ... */ },
      "status": "ACCEPTED", // or PENDING or REJECTED
      "createdAt": "..."
    }
  ]
}
```

---

## 🔴 Error Responses

All errors follow this format:

```json
{
  "success": false,
  "message": "Error description"
}
```

### Common HTTP Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| **200** | Success | GET request successful |
| **201** | Created | Resource created successfully |
| **400** | Bad Request | Invalid input, validation error |
| **401** | Unauthorized | Missing or invalid token |
| **403** | Forbidden | Not authorized for this resource |
| **404** | Not Found | Resource doesn't exist |
| **409** | Conflict | Duplicate email on registration |
| **500** | Server Error | Internal server error |

### Example Error Responses

**400 - Validation Error**:
```json
{
  "success": false,
  "message": "Email and password are required"
}
```

**401 - Unauthorized**:
```json
{
  "success": false,
  "message": "Invalid token"
}
```

**403 - Forbidden**:
```json
{
  "success": false,
  "message": "Not authorized to access this event"
}
```

**404 - Not Found**:
```json
{
  "success": false,
  "message": "Event not found"
}
```

**409 - Conflict**:
```json
{
  "success": false,
  "message": "User with this email already exists"
}
```

**Time Conflict**:
```json
{
  "success": false,
  "message": "This event conflicts with an existing event",
  "conflicts": [
    {
      "_id": "...",
      "title": "Conflicting Event",
      "startTime": "...",
      "endTime": "..."
    }
  ]
}
```

---

## 📝 Request Examples (curl)

### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
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
    "title": "Data Structures Lab",
    "startTime": "2025-11-07T10:00:00Z",
    "endTime": "2025-11-07T12:00:00Z",
    "status": "SWAPPABLE"
  }'
```

### Get Events
```bash
curl -X GET http://localhost:5000/api/events \
  -H "Authorization: Bearer YOUR_TOKEN"
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

---

## 📥 Import into Postman

Use the provided Postman collection for easier testing:

**File**: `Slot_Swapper_API.postman_collection.json`

**Features**:
- ✅ All endpoints pre-configured
- ✅ Automatic token management
- ✅ Environment variables
- ✅ Request examples

**Setup**:
1. Import collection in Postman
2. Set `baseUrl` variable to `http://localhost:5000/api`
3. Register/Login to get token
4. Token auto-saved in `authToken` variable

---

## 🔗 Related Documentation

- **[Complete README](./README.md)** - Full project documentation
- **[Backend Guide](./backend/README.md)** - Detailed backend documentation
- **[Quick Start](./QUICK_START.md)** - Get running in 5 minutes
- **[Design Choices](./DESIGN_CHOICES.md)** - Architecture decisions

---

**Version**: 1.0  
**Last Updated**: November 5, 2025
