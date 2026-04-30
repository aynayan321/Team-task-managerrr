# ⚡ Team Task Manager

A full-stack team task management application built with React (Vite), Node.js/Express, and MongoDB. Features JWT authentication, role-based access control (Admin/Member), project management, and real-time task tracking.

---

## 🔗 Live Project

Frontend: https://your-frontend-url
Backend: https://your-backend-url

---

## 🎥 Demo Video

https://your-demo-video-link


## 📸 Features

* 🔐 **JWT Authentication** — Secure login/register with bcrypt password hashing
* 👥 **Role-Based Access Control** — Admin and Member roles with different permissions
* 📁 **Project Management** — Create projects, manage team members
* ✅ **Task Management** — Create, assign, and track tasks with status updates
* 📊 **Dashboard** — Live stats (total, completed, in-progress, overdue tasks)
* 🔔 **Toast Notifications** — User-friendly feedback on all actions
* 🌗 **Modern UI** — Clean and responsive interface

---

## 🗂 Project Structure

```
team-task-manager/
├── backend/
├── frontend/
```

---

## 🚀 Local Setup

### 1. Install Dependencies

```bash
cd backend
npm install

cd ../frontend
npm install
```

---

### 2. Run Project

```bash
# Backend
cd backend
npm run dev

# Frontend
cd frontend
npm run dev
```

---

## 🔌 API Overview

* Auth: `/api/auth`
* Projects: `/api/projects`
* Tasks: `/api/tasks`
* Dashboard: `/api/dashboard`

---

## 🚂 Deployment (Railway)

* Backend deployed on Railway
* Frontend deployed on Railway/Vercel
* MongoDB Atlas used for database

---

## 🔑 Role Permissions

| Feature            | Admin | Member        |
| ------------------ | ----- | ------------- |
| Create Projects    | ✅     | ❌             |
| Assign Tasks       | ✅     | ❌             |
| Update Task Status | ✅     | ✅             |
| View Tasks         | ✅     | Assigned Only |

---

## 🛠 Tech Stack

* Frontend: React + Vite + Tailwind
* Backend: Node.js + Express
* Database: MongoDB
* Auth: JWT + bcrypt

---

## 📄 License

MIT
