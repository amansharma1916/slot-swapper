# 🎨 Slot Swapper - Frontend

Modern, responsive React frontend for the Slot Swapper application built with Vite, featuring vibrant UI design and seamless user experience.

## 🎯 Overview

The frontend provides an intuitive interface for students to manage their time slots, browse available swaps, and interact with the swap marketplace. Built with React 19 and Vite for optimal performance and developer experience.

## ✨ Features

- 🔐 **Authentication Pages** - Login and Registration with validation
- 📊 **Dashboard** - Personal event calendar with visual timeline
- 📝 **Event Management** - Create, edit, and delete events
- 🛒 **Marketplace** - Browse and filter available swappable slots
- 🔔 **Notifications** - Incoming and outgoing swap requests
- 🎨 **Modern UI** - Cyan/Emerald theme with smooth animations
- 📱 **Responsive Design** - Mobile-first approach
- ⚡ **Fast Performance** - Vite HMR for instant updates

## 🏗️ Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19.1.1 | UI library |
| **React Router DOM** | 7.9.5 | Client-side routing |
| **Vite** | 7.1.7 | Build tool and dev server |
| **ESLint** | 9.36.0 | Code linting |

## 📁 Project Structure

```
frontend/
├── public/                    # Static assets
├── src/
│   ├── assets/               # Images, icons
│   ├── components/           # Reusable components
│   │   ├── LoginPage.jsx    # Login form component
│   │   └── RegisterPage.jsx # Registration form component
│   ├── Pages/                # Page components
│   │   ├── Dashboard.jsx    # Main dashboard with calendar
│   │   ├── CreateEvent.jsx  # Event creation form
│   │   ├── EditEvent.jsx    # Event editing form
│   │   ├── Marketplace.jsx  # Browse swappable slots
│   │   └── Notifications.jsx # Swap requests management
│   ├── Styles/               # CSS stylesheets
│   │   ├── components/      # Component-specific styles
│   │   └── Pages/           # Page-specific styles
│   ├── App.jsx               # Main app component with routing
│   ├── App.css               # Global app styles
│   ├── index.css             # Root styles and CSS variables
│   └── main.jsx              # Application entry point
├── .env                      # Environment variables (local)
├── .env.example              # Environment template
├── .gitignore
├── Dockerfile                # Production Docker image
├── Dockerfile.dev            # Development Docker image
├── eslint.config.js          # ESLint configuration
├── index.html                # HTML entry point
├── package.json              # Dependencies and scripts
├── README.md                 # This file
└── vite.config.js            # Vite configuration

```

## 🚀 Getting Started

### Prerequisites

- Node.js 20.x or higher
- npm or yarn
- Backend API running (see [backend/README.md](../backend/README.md))

### Installation

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install
```

### Environment Setup

Create a `.env` file:

```bash
cp .env.example .env
```

**Configuration:**
```env
# Backend API URL
VITE_API_URL=http://localhost:5000

# Optional: Enable debug mode
VITE_DEBUG=true
```

### Development Server

```bash
# Start dev server with hot-reload
npm run dev
```

The application will be available at: `http://localhost:5173`

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

Built files are output to `dist/` directory.

## 📱 Application Pages

### 1. Authentication

#### Login Page (`/`)
- Email and password authentication
- JWT token storage in localStorage
- Form validation
- Error handling with user feedback
- "Remember me" functionality

#### Register Page (`/register`)
- User registration with full name, email, password
- Password confirmation validation
- Real-time error messages
- Redirect to dashboard on success

### 2. Dashboard (`/dashboard`)
- **Calendar View**: Visual timeline of all events
- **Event Cards**: Display title, time, status
- **Status Indicators**:
  - 🔴 BUSY - Not available for swap
  - 🟢 SWAPPABLE - Available in marketplace
  - 🟡 SWAP_PENDING - Currently in swap process
- **Quick Actions**: Create, edit, delete events
- **Filters**: By status, date range

### 3. Create Event (`/create-event`)
- Event creation form
- Fields: Title, Start Time, End Time, Status, Description
- Date/time pickers
- Status dropdown (BUSY/SWAPPABLE)
- Conflict detection feedback
- Success/error notifications

### 4. Edit Event (`/edit-event/:id`)
- Pre-populated form with existing event data
- Same validation as create
- Update or delete options
- Confirmation dialogs for destructive actions

### 5. Marketplace (`/marketplace`)
- **Browse Slots**: All available swappable slots from other users
- **Filters**: Date range, time of day
- **Slot Cards**: Display event details and owner info
- **Request Swap Button**: Initiates swap request
- **Your Slots Section**: Select your slot to offer in exchange
- **Real-time Updates**: Status changes immediately

### 6. Notifications (`/notifications`)
- **Two Tabs**:
  - **Incoming**: Requests from others (pending only)
  - **Outgoing**: Your sent requests (all statuses)
- **Request Details**: Shows both slots being swapped
- **Actions**:
  - Accept/Reject for incoming
  - View status for outgoing
- **Status Badges**: PENDING, ACCEPTED, REJECTED

## 🎨 Design System

### Color Palette

```css
/* CSS Variables in index.css */

/* Primary Colors */
--color-primary: #06b6d4;        /* Cyan */
--color-primary-2: #22c55e;      /* Emerald */
--color-primary-rgb: 6, 182, 212;

/* Background */
--bg-dark: #121212;
--bg-card: #1e1e1e;
--bg-hover: #2a2a2a;

/* Text */
--text-primary: #e0e0e0;
--text-secondary: #a0a0a0;
--text-muted: #6b6b6b;

/* Status Colors */
--status-busy: #ef4444;          /* Red */
--status-swappable: #22c55e;     /* Green */
--status-pending: #f59e0b;       /* Amber */

/* Borders */
--border-color: #333;
--border-hover: #444;
```

### Typography

```css
/* Font Stack */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 
             Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;

/* Sizes */
--font-xs: 0.75rem;    /* 12px */
--font-sm: 0.875rem;   /* 14px */
--font-base: 1rem;     /* 16px */
--font-lg: 1.125rem;   /* 18px */
--font-xl: 1.25rem;    /* 20px */
--font-2xl: 1.5rem;    /* 24px */
--font-3xl: 1.875rem;  /* 30px */
```

### Component Patterns

#### Button Styles
```css
.primary-button {
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-2));
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  transition: transform 0.2s, box-shadow 0.2s;
}

.primary-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(6, 182, 212, 0.3);
}
```

#### Card Styles
```css
.card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 0.75rem;
  padding: 1.5rem;
  transition: all 0.3s ease;
}

.card:hover {
  border-color: var(--color-primary);
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}
```

## 🔄 State Management

### Local Storage

The app uses localStorage for:
- **Authentication Token**: JWT stored as `token`
- **User Data**: User info stored as `user`
- **Session Persistence**: Auto-login on page refresh

```javascript
// Token management
localStorage.setItem('token', jwtToken);
const token = localStorage.getItem('token');
localStorage.removeItem('token'); // Logout
```

### Component State

Uses React hooks for state management:
- `useState` - Local component state
- `useEffect` - Side effects and API calls
- `useNavigate` - React Router navigation

## 🌐 API Integration

### Fetch Wrapper

```javascript
// Example API call with auth
const fetchWithAuth = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`${import.meta.env.VITE_API_URL}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    if (response.status === 401) {
      // Redirect to login
      localStorage.removeItem('token');
      window.location.href = '/';
    }
    throw new Error('API request failed');
  }
  
  return response.json();
};
```

### API Endpoints Used

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `GET /api/events` - Fetch user events
- `POST /api/events` - Create event
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event
- `GET /api/swappable-slots` - Fetch marketplace slots
- `POST /api/swap-request` - Create swap request
- `POST /api/swap-response/:id` - Accept/reject swap
- `GET /api/swap-requests/incoming` - Incoming requests
- `GET /api/swap-requests/outgoing` - Outgoing requests

## 🧪 Development

### Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run ESLint
npm run lint

# Fix ESLint errors
npm run lint -- --fix
```

### Hot Module Replacement (HMR)

Vite provides instant HMR:
- Save any file to see changes immediately
- React Fast Refresh preserves component state
- CSS updates without page reload

### Development Tips

1. **Use React DevTools**: Install the browser extension for debugging
2. **Check Console**: Errors and warnings appear in browser console
3. **Network Tab**: Monitor API requests and responses
4. **Responsive Mode**: Test mobile views in browser DevTools

## 📦 Build & Deployment

### Production Build

```bash
npm run build
```

Optimizations included:
- ✅ Code minification
- ✅ Tree shaking (removes unused code)
- ✅ Asset optimization
- ✅ CSS extraction and minification
- ✅ Lazy loading for routes

### Build Output

```
dist/
├── assets/
│   ├── index-[hash].js     # Optimized JavaScript
│   ├── index-[hash].css    # Optimized CSS
│   └── [images]            # Optimized images
└── index.html              # Entry HTML
```

### Deployment Options

#### 1. Static Hosting (Vercel, Netlify, GitHub Pages)

```bash
npm run build
# Upload dist/ folder to hosting platform
```

#### 2. Docker Container

```bash
# Build production image
docker build -f Dockerfile -t slot-swapper-frontend .

# Run container
docker run -p 3000:3000 slot-swapper-frontend
```

#### 3. With Docker Compose

```bash
# Production deployment
docker-compose -f docker-compose.prod.yml up -d
```

### Environment Variables for Production

```env
# Production API URL
VITE_API_URL=https://api.yourdomain.com

# Optional: Analytics
VITE_GA_ID=G-XXXXXXXXXX

# Optional: Sentry
VITE_SENTRY_DSN=https://xxx@sentry.io/xxx
```

## 🎯 Features in Detail

### Authentication Flow

1. User enters credentials
2. Frontend sends POST to `/api/auth/login`
3. Backend validates and returns JWT token
4. Frontend stores token in localStorage
5. All subsequent requests include token in Authorization header
6. Token validated on each API call
7. Auto-logout on token expiration (401 response)

### Swap Request Flow

1. User browses marketplace for available slots
2. Selects a slot they want
3. Selects their own slot to offer
4. Clicks "Request Swap"
5. POST to `/api/swap-request` with both slot IDs
6. Both slots marked as SWAP_PENDING
7. Recipient sees request in Notifications (Incoming tab)
8. Recipient accepts or rejects
9. If accepted:
   - Slot ownership swapped
   - Both slots marked as BUSY
10. If rejected:
    - Both slots revert to SWAPPABLE

### Error Handling

All pages include error handling for:
- Network failures
- Invalid responses
- Unauthorized access (401)
- Not found (404)
- Validation errors (400)
- Server errors (500)

User-friendly error messages displayed with:
- Alert boxes
- Inline form errors
- Toast notifications
- Status badges

## 🐛 Troubleshooting

### Common Issues

**1. API Connection Failed**
```
Error: Failed to fetch
```
**Solution**: 
- Check backend is running on port 5000
- Verify VITE_API_URL in .env
- Check CORS settings in backend

**2. White Screen on Load**
```
Blank page, no errors
```
**Solution**:
- Clear browser cache
- Check browser console for errors
- Verify all dependencies installed (`npm install`)

**3. Login Redirects Immediately**
```
Redirected to login after successful login
```
**Solution**:
- Check token is being saved to localStorage
- Verify JWT_SECRET matches between frontend and backend
- Check token expiration time

**4. Hot Reload Not Working**
```
Changes not appearing
```
**Solution**:
- Restart dev server (`npm run dev`)
- Clear browser cache
- Check Vite config

**5. Build Errors**
```
Failed to build
```
**Solution**:
- Run `npm install` to ensure dependencies are up to date
- Check for ESLint errors: `npm run lint`
- Verify environment variables are set

## 🔒 Security Considerations

- ✅ JWT tokens stored in localStorage (consider httpOnly cookies for production)
- ✅ XSS protection via React's automatic escaping
- ✅ CSRF protection via JWT (stateless auth)
- ✅ Input sanitization on forms
- ✅ No sensitive data in client-side code
- ✅ HTTPS recommended for production
- ✅ Environment variables for secrets

## 📚 Additional Resources

- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [React Router](https://reactrouter.com/)
- [ESLint](https://eslint.org/)

## 🤝 Contributing

When contributing to the frontend:

1. Follow existing component structure
2. Use CSS variables for colors
3. Maintain responsive design
4. Test on mobile devices
5. Run ESLint before committing
6. Update this README if adding new pages/features

## 📄 License

MIT License - see [LICENSE](../LICENSE) file for details.

---

Built with ⚡ Vite + ⚛️ React
