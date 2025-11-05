# Event Calendar Frontend

Frontend application for the Event Calendar Management System built with React, Vite, and Tailwind CSS.

## Features

- **Authentication**: Secure login with JWT tokens
- **Role-Based Access**: Different views and permissions for SUPERADMIN, UNITADMIN, and VIEWER
- **Interactive Calendar**: Monthly calendar view with event indicators
- **Event Management**: Create, edit, view, and delete events with detailed forms
- **Admin Panels**: Manage units and users based on role permissions
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS

## Tech Stack

- React 18
- Vite
- React Router DOM
- Zustand (state management)
- Tailwind CSS
- date-fns (date utilities)

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Backend API running on port 3001

## Installation

1. **Install dependencies:**
   \`\`\`bash
   npm install
   \`\`\`

2. **Set up environment variables:**
   
   Copy `.env.example` to `.env`:
   \`\`\`bash
   cp .env.example .env
   \`\`\`

   The default configuration should work if your backend is running on `http://localhost:3001`:
   \`\`\`
   VITE_API_URL=http://localhost:3001/api
   \`\`\`

## Running the Application

**Development mode:**
\`\`\`bash
npm run dev
\`\`\`

The application will start on `http://localhost:5173`

**Build for production:**
\`\`\`bash
npm run build
\`\`\`

**Preview production build:**
\`\`\`bash
npm run preview
\`\`\`

## Project Structure

\`\`\`
frontend/
├── src/
│   ├── components/
│   │   ├── Admin/
│   │   │   ├── UnitsManager.jsx      # Units management component
│   │   │   └── UsersManager.jsx      # Users management component
│   │   ├── Calendar/
│   │   │   ├── CalendarGrid.jsx      # Monthly calendar grid
│   │   │   ├── EventList.jsx         # Event list for selected date
│   │   │   └── EventModal.jsx        # Event create/edit modal
│   │   ├── Layout.jsx                # Main layout with navigation
│   │   └── ProtectedRoute.jsx        # Route protection wrapper
│   ├── pages/
│   │   ├── Login.jsx                 # Login page
│   │   ├── Calendar.jsx              # Calendar page
│   │   └── Admin.jsx                 # Admin panel page
│   ├── services/
│   │   └── api.js                    # API service layer
│   ├── store/
│   │   └── authStore.js              # Zustand auth store
│   ├── App.jsx                       # Main app component
│   ├── main.jsx                      # Entry point
│   └── index.css                     # Global styles
├── index.html
├── vite.config.js
├── tailwind.config.js
└── package.json
\`\`\`

## Default Login Credentials

Use these credentials to test different user roles:

**SUPERADMIN:**
- Email: `admin@municipio.gov`
- Password: `admin123`
- Permissions: Full access to all features

**UNITADMIN (Zoonosis):**
- Email: `zoonosis@municipio.gov`
- Password: `unit123`
- Permissions: Manage events and viewers for Zoonosis unit

**VIEWER (Zoonosis):**
- Email: `viewer.zoonosis@municipio.gov`
- Password: `viewer123`
- Permissions: Read-only access to Zoonosis events

## Features by Role

### SUPERADMIN
- View and manage all events from all units
- Create, edit, and delete units
- Create UNITADMIN and VIEWER users
- Assign users to specific units
- Global calendar view

### UNITADMIN
- View and manage events for their assigned unit only
- Create VIEWER users for their unit
- Cannot access other units' data

### VIEWER
- View events for their assigned unit only
- Read-only access (cannot create, edit, or delete)
- No access to admin panels

## API Integration

The frontend communicates with the backend API through the `api.js` service layer. All requests include JWT authentication tokens in the Authorization header.

**API Endpoints Used:**
- `POST /api/auth/login` - User authentication
- `GET /api/auth/me` - Get current user
- `GET /api/units` - Get all units
- `POST /api/units` - Create unit
- `PUT /api/units/:id` - Update unit
- `DELETE /api/units/:id` - Delete unit
- `GET /api/users` - Get users
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `GET /api/events` - Get events
- `POST /api/events` - Create event
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event

## State Management

The application uses Zustand for state management with persistence:

- **Auth Store**: Manages user authentication state, token, and user information
- Persisted to localStorage for session persistence
- Automatically includes token in API requests

## Styling

The application uses Tailwind CSS with a custom configuration:

- Primary color: Blue (#3b82f6)
- Custom utility classes for buttons, inputs, and cards
- Responsive design with mobile-first approach
- Clean, professional interface

## Development Tips

1. **Hot Module Replacement**: Vite provides fast HMR for instant updates during development

2. **API Proxy**: Vite is configured to proxy `/api` requests to the backend server

3. **Error Handling**: All API calls include try-catch blocks with user-friendly error messages

4. **Form Validation**: HTML5 validation with required fields and proper input types

## Troubleshooting

**Cannot connect to API:**
- Verify backend is running on port 3001
- Check VITE_API_URL in .env file
- Check browser console for CORS errors

**Authentication issues:**
- Clear localStorage and try logging in again
- Verify JWT_SECRET matches between frontend and backend
- Check token expiration in backend configuration

**Calendar not displaying events:**
- Verify events exist in the database
- Check user role and unit_id assignments
- Review browser console for API errors

## Building for Production

1. Update environment variables for production API URL
2. Run `npm run build`
3. Deploy the `dist` folder to your hosting service
4. Ensure backend API is accessible from production domain
5. Configure CORS on backend to allow production domain
