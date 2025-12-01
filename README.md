# TaskFlow

TaskFlow is a full-stack task management application featuring user authentication, task creation, categorization, and persistent storage. The project is separated into two main parts:

- **frontend/** – React-based UI  
- **backend/** – Node.js/Express server with MongoDB

---

## 🚀 Features

- User Authentication (Login / Signup)
- Add / Edit / Delete Tasks
- Task Categorization (To-Do, In Progress, Done)
- Persistent Storage using MongoDB
- Clean and responsive UI
- REST API architecture

---

## 📂 Project Structure

TaskFlow-main/
│
├── backend/ # Express server, routes, controllers, models
├── frontend/ # React application (Vite/CRA)
├── package.json
├── package-lock.json
└── README.md

---

## 🛠️ Tech Stack

### **Frontend**
- React
- CSS / Tailwind (if used)
- Axios for API calls

### **Backend**
- Node.js
- Express.js
- MongoDB + Mongoose
- JWT Authentication (if implemented)

---

## 🔧 Installation & Setup

### 1️⃣ Clone the repository

```
git clone <your-repo-url>
cd TaskFlow-main
```

🖥️ Backend Setup

```
cd backend
npm install
npm start
```


Backend runs at:
```
http://localhost:5000
```

API Overview (based on backend folder)
```
POST /auth/register
POST /auth/login
GET  /tasks
POST /tasks
PUT  /tasks/:id
DELETE /tasks/:id
```

