# Backend Test Suite

Comprehensive unit and integration tests for the Slot Swapper API.

## Test Coverage

### Auth Routes (`auth.test.js`)
- **Registration**: Field validation, duplicate email detection, password hashing
- **Login**: Credential validation, token generation
- **Protected Routes**: JWT authentication, token validation

### Event Routes (`events.test.js`)
- **Create Events**: Validation, conflict detection, date/time validation
- **Read Events**: Filtering, authorization, pagination
- **Update Events**: Partial updates, conflict detection on time changes
- **Delete Events**: Authorization, cascade effects
- **Status Updates**: State transitions validation

### Swap Routes (`swap.test.js`)
- **Swap Request Creation**: 
  - Ownership validation
  - Status checks (both slots must be SWAPPABLE)
  - Self-swap prevention
  - Transaction atomicity
- **Swap Response**:
  - Accept flow: ownership exchange, status updates to BUSY
  - Reject flow: status restoration to SWAPPABLE
  - Authorization (only recipient can respond)
  - Idempotency (cannot accept/reject twice)
  - Transaction rollback on failure
- **List Requests**: Incoming/outgoing filtering, pagination
- **Edge Cases**: Missing slots, invalid IDs, concurrent requests

## Running Tests

### Install Dependencies
```bash
npm install
```

### Run All Tests
```bash
npm test
```

### Watch Mode (for development)
```bash
npm run test:watch
```

### Coverage Report
```bash
npm run test:coverage
```

## Test Structure

```
backend/
├── __tests__/
│   ├── setup.js          # Global test configuration & MongoDB Memory Server
│   ├── helpers.js        # Test utilities and fixtures
│   ├── auth.test.js      # Authentication tests
│   ├── events.test.js    # Event CRUD tests
│   └── swap.test.js      # Swap logic tests (most complex)
├── jest.config.js        # Jest configuration
└── package.json          # Test scripts
```

## Key Testing Strategies

### Isolated Database
- Uses `mongodb-memory-server` for fast, isolated testing
- Each test starts with a clean database
- No external dependencies or test pollution

### Authentication Fixtures
- Helper functions create authenticated users and tokens
- Reusable across all test suites

### Transaction Testing
- Validates atomic operations in swap logic
- Tests rollback behavior on failure
- Ensures data consistency

### Edge Case Coverage
- Invalid inputs, missing fields
- Authorization failures
- Concurrent operation conflicts
- Already-processed requests (idempotency)

## Test Output Example

```
PASS  __tests__/auth.test.js
  Auth Routes
    POST /api/auth/register
      ✓ should register a new user successfully (245ms)
      ✓ should fail when required fields are missing (12ms)
      ✓ should fail when email already exists (87ms)
    POST /api/auth/login
      ✓ should login with valid credentials (156ms)
      ✓ should fail with invalid password (123ms)

PASS  __tests__/events.test.js
  Event Routes
    POST /api/events
      ✓ should create a new event successfully (98ms)
      ✓ should detect conflicting events (145ms)
    PATCH /api/events/:id
      ✓ should update event with partial data (112ms)

PASS  __tests__/swap.test.js
  Swap Routes
    POST /api/swap-request
      ✓ should create a swap request successfully (187ms)
      ✓ should rollback on transaction failure (156ms)
    POST /api/swap-response/:requestId
      ✓ should accept swap and exchange slot ownership (234ms)
      ✓ should reject swap and restore SWAPPABLE status (198ms)

Test Suites: 3 passed, 3 total
Tests:       42 passed, 42 total
Time:        12.456s
```

## CI/CD Integration

Add to your CI pipeline:
```yaml
- name: Run Tests
  run: |
    cd backend
    npm install
    npm test
```

## Best Practices

1. **Clean State**: Each test starts with a fresh database
2. **Descriptive Names**: Test names clearly state what they verify
3. **Arrange-Act-Assert**: Tests follow AAA pattern
4. **Realistic Data**: Use helper functions to create valid fixtures
5. **Error Validation**: Assert on both success and failure cases
6. **Transaction Safety**: Verify atomic operations and rollbacks

## Troubleshooting

### Tests Timeout
Increase timeout in `jest.config.js`:
```js
testTimeout: 60000 // 60 seconds
```

### Port Conflicts
MongoDB Memory Server handles ports automatically, no conflicts.

### Pending Handles
Run with `--detectOpenHandles` to identify leaks:
```bash
npm test -- --detectOpenHandles
```

## Next Steps

- Add marketplace route tests
- Test concurrent swap request scenarios
- Add performance/load testing
- Implement test fixtures for complex scenarios
- Add integration tests with real MongoDB (optional)
