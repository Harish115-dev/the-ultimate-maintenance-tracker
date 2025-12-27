# GearGuard Backend API

Production-ready backend for the GearGuard Maintenance Management System.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment
Edit `.env` file with your settings (JWT secret, email credentials, etc.)

### 3. Seed Database
```bash
npm run seed
```

### 4. Start Server
```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

Server will run on `http://localhost:5000`

## 📋 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login (returns JWT token)
- `GET /api/auth/me` - Get current user info (Protected)
- `PUT /api/auth/change-password` - Change password (Protected)

### Equipment
- `GET /api/equipment` - Get all equipment (Protected)
- `GET /api/equipment/:id` - Get single equipment
- `POST /api/equipment` - Create equipment (Admin/Manager)
- `PUT /api/equipment/:id` - Update equipment (Admin/Manager)
- `DELETE /api/equipment/:id` - Delete equipment (Admin)
- `GET /api/equipment/:id/requests` - Get equipment requests

### Requests
- `GET /api/requests` - Get all requests (Protected)
- `GET /api/requests/:id` - Get single request
- `POST /api/requests` - Create request (Protected)
- `PUT /api/requests/:id` - Update request
- `DELETE /api/requests/:id` - Delete request (Admin/Manager)
- `PATCH /api/requests/:id/status` - Update status
- `PATCH /api/requests/:id/assign` - Assign to technician

### Teams
- `GET /api/teams` - Get all teams (Protected)
- `GET /api/teams/:id` - Get single team
- `POST /api/teams` - Create team (Admin/Manager)
- `PUT /api/teams/:id` - Update team (Admin/Manager)
- `DELETE /api/teams/:id` - Delete team (Admin)
- `POST /api/teams/:id/members` - Add member (Admin/Manager)
- `DELETE /api/teams/:id/members/:userId` - Remove member (Admin/Manager)

## 🔐 Authentication

All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## 👥 User Roles

- **admin**: Full access
- **manager**: Can create/edit equipment, teams, requests
- **technician**: Can view and update assigned requests
- **user**: Can create requests and view equipment

## 🧪 Test Credentials

After seeding the database:
```
Email: john@gearguard.com
Password: admin123
Role: admin
```

## 📁 Project Structure

```
backend/
├── config/
│   └── database.js          # SQLite3 configuration
├── controllers/
│   ├── authController.js
│   ├── equipmentController.js
│   ├── requestController.js
│   └── teamController.js
├── middleware/
│   ├── auth.js              # JWT authentication
│   ├── validation.js        # Joi validation
│   ├── errorHandler.js
│   └── rateLimiter.js
├── models/
│   ├── User.js
│   ├── Equipment.js
│   ├── Request.js
│   ├── Team.js
│   ├── TeamMember.js
│   └── index.js             # Model associations
├── routes/
│   ├── auth.js
│   ├── equipment.js
│   ├── requests.js
│   └── teams.js
├── scripts/
│   └── seed.js              # Database seeding
├── .env
├── .gitignore
├── package.json
└── server.js                # Main entry point
```

## 🛠️ Technologies

- **Node.js** + **Express** - Server framework
- **Sequelize** - ORM for database operations
- **SQLite3** - Lightweight SQL database
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Joi** - Input validation
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing

## 📊 Database Schema

See `models/` directory for complete schema definitions. Key tables:
- `users` - User accounts with roles
- `equipment` - Company assets
- `requests` - Maintenance requests
- `teams` - Maintenance teams
- `team_members` - User-Team relationships

## 🔒 Security Features

- JWT token authentication
- Password hashing with bcrypt
- Rate limiting (100 req/15min, 5 login/15min)
- Input validation on all routes
- SQL injection protection via Sequelize
- CORS configuration
- Helmet security headers

## 🚢 Deployment

### Option 1: Heroku
```bash
heroku create gearguard-api
git push heroku main
```

### Option 2: DigitalOcean
Use App Platform with auto-deploy from Git

### Option 3: VPS
1. Install Node.js
2. Clone repository
3. Run `npm install --production`
4. Use PM2 for process management: `pm2 start server.js`

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment | development |
| `PORT` | Server port | 5000 |
| `JWT_SECRET` | JWT signing key | *required* |
| `JWT_EXPIRE` | Token expiry | 7d |
| `DB_PATH` | SQLite file path | ./database.sqlite |
| `FRONTEND_URL` | Frontend URL (CORS) | http://localhost:3000 |

## 🐛 Troubleshooting

**Database locked error**: Close all connections to `database.sqlite`

**Authentication fails**: Check `JWT_SECRET` in `.env`

**CORS errors**: Update `FRONTEND_URL` in `.env`

## 📄 License

ISC
