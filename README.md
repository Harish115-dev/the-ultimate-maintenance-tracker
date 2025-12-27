# 🏭 GearGuard - Industrial Maintenance System

GearGuard is a comprehensive **Enterprise Asset Management (EAM)** system designed to streamline industrial maintenance operations. It bridges the gap between technicians, assets, and management through a unified full-stack platform.

## 🚀 Key Features

### 📊 Interactive Dashboard
- **Kanban Board**: Drag-and-drop interface for managing maintenance requests.
- **Real-time Analytics**: Instant visibility into open requests, overdue items, and asset health.
- **Calendar View**: Schedule preventive maintenance with an intuitive drag-and-drop calendar.

### 🏭 Asset Management
- **Equipment Database**: Track lifecycle, warranty, and location of all industrial assets.
- **Status Monitoring**: Real-time tracking of active vs. scrapped/maintenance equipment.

### 👥 Team Collaboration
- **Technician Assignment**: Assign tasks to specific specialists.
- **Role-Based Access**: Secure portal for Admins, Managers, and Technicians.

---

## 🛠️ Tech Stack

**Frontend**
- **Vanilla JavaScript (ES6+)**: High-performance, dependency-free client logic.
- **CSS3 Variables**: Modern, responsive, and themable design system.
- **HTML5**: Semantic and accessible structure.

**Backend**
- **Node.js & Express**: Robust and scalable API server.
- **SQLite & Sequelize**: Zero-config relational database with ORM.
- **JWT & Bcrypt**: Secure, stateless authentication system.

---

## ⚡ Quick Start Guide

This project is configured as a **Monolith**, meaning you can run the entire stack with a single command.

### 1. Installation
Install all dependencies for both backend and frontend tools.
```bash
npm install
```

### 2. Launch
Start the application server.
```bash
npm start
```

### 3. Access
Open your browser and navigate to:
👉 **[http://localhost:5000](http://localhost:5000)**

---

## 🔐 Default Credentials

The database comes pre-seeded with a demo admin account:

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `john@gearguard.com` | `admin123` |

---

## 📂 Project Structure

```
gearguard/
├── api/                # Client-side API wrappers
├── backend/            # Express Server & Database Logic
│   ├── config/         # DB Config
│   ├── controllers/    # Business Logic
│   ├── models/         # Database Schemas
│   └── routes/         # API Endpoints
├── dashboard.js        # Main Dashboard Logic
├── *.html              # Frontend Views
└── package.json        # Project Configuration
```

---

## 🛡️ License
Proprietary software tailored for Industrial Maintenance Hackathon.
