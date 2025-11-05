# Event Calendar Backend API

Backend API for the Event Calendar Management System with role-based access control.

## Features

- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access Control**: Three user roles (SUPERADMIN, UNITADMIN, VIEWER)
- **PostgreSQL Database**: Robust relational database with proper schema
- **RESTful API**: Clean and organized API endpoints
- **Security**: Password hashing with bcrypt, protected routes

## Tech Stack

- Node.js
- Express.js
- PostgreSQL
- JWT (JSON Web Tokens)
- bcrypt

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

## Installation

1. **Install dependencies:**
   \`\`\`bash
   npm install
   \`\`\`

2. **Set up environment variables:**
   
   Copy `.env.example` to `.env` and configure:
   \`\`\`bash
   cp .env.example .env
   \`\`\`

   Edit `.env` with your database credentials:
   \`\`\`
   DATABASE_URL=postgresql://username:password@localhost:5432/event_calendar
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRES_IN=7d
   PORT=3001
   NODE_ENV=development
   FRONTEND_URL=http://localhost:5173
   \`\`\`

3. **Create the database:**
   \`\`\`bash
   createdb event_calendar
   \`\`\`

4. **Run database migrations:**
   \`\`\`bash
   psql -d event_calendar -f scripts/01-create-schema.sql
   psql -d event_calendar -f scripts/02-seed-data.sql
   \`\`\`

## Running the Server

**Development mode (with auto-reload):**
\`\`\`bash
npm run dev
\`\`\`

**Production mode:**
\`\`\`bash
npm start
\`\`\`

The server will start on `http://localhost:3001`

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current user info (protected)

### Units (SUPERADMIN only)
- `GET /api/units` - Get all units
- `GET /api/units/:id` - Get single unit
- `POST /api/units` - Create new unit
- `PUT /api/units/:id` - Update unit
- `DELETE /api/units/:id` - Delete unit

### Users
- `GET /api/users` - Get all users (filtered by role)
- `GET /api/users/:id` - Get single user
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Events
- `GET /api/events` - Get all events (filtered by role and unit)
- `GET /api/events/:id` - Get single event
- `POST /api/events` - Create new event
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event

## Default Users (from seed data)

**SUPERADMIN:**
- Email: `admin@municipio.gov`
- Password: `admin123`

**UNITADMIN (Zoonosis):**
- Email: `zoonosis@municipio.gov`
- Password: `unit123`

**VIEWER (Zoonosis):**
- Email: `viewer.zoonosis@municipio.gov`
- Password: `viewer123`

## User Roles & Permissions

### SUPERADMIN
- Full CRUD on all units
- Full CRUD on all events (all units)
- Can create UNITADMIN and VIEWER users
- View global calendar

### UNITADMIN
- CRUD events for their assigned unit only
- Can create VIEWER users for their unit
- View calendar for their unit

### VIEWER
- Read-only access to events in their assigned unit
- Cannot create, edit, or delete anything

## Database Schema

### Tables
- `units` - Municipal units (Zoonosis, Emabra, etc.)
- `users` - User accounts with roles
- `events` - Calendar events associated with units

See `scripts/01-create-schema.sql` for complete schema.

## Security Notes

- All passwords are hashed using bcrypt
- JWT tokens expire after 7 days (configurable)
- All API routes (except login) require authentication
- Role-based middleware protects sensitive operations
- CORS configured for frontend origin

## Troubleshooting

**Database connection issues:**
- Verify PostgreSQL is running
- Check DATABASE_URL in .env
- Ensure database exists

**Authentication errors:**
- Verify JWT_SECRET is set
- Check token expiration
- Ensure Authorization header format: `Bearer <token>`

**Permission errors:**
- Verify user role in database
- Check unit_id assignments
- Review middleware authorization logic
