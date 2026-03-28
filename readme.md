# 💬 PingUp

A high-performance, full-stack communication platform built with the **MERN** stack. PingUp digitizes interactions using an event-driven architecture, featuring seamless authentication via **Clerk**, background job orchestration with **Inngest**, and real-time media optimization through **ImageKit**.

> **PingUp** is designed for speed and scalability, leveraging the latest features of React 19 and Tailwind CSS 4 to provide a cutting-edge user experience.

---

## 🌟 Features

### 👨‍💻 For Users
- **Seamless Onboarding:** Quick sign-up and login with Social Auth (Google/GitHub) powered by **Clerk**.
- **Instant Interaction:** Modern chat-style interface for fluid communication.
- **Media Sharing:** High-speed image uploads with automatic CDN optimization via **ImageKit**.
- **Real-time Updates:** Stay informed with instant notifications and status changes.
- **Responsive Design:** A fully adaptive UI that works perfectly on Mobile, Tablet, and Desktop.

### ⚙️ Under the Hood
- **Event-Driven Workflows:** **Inngest** handles background tasks like welcome emails and data syncing without blocking the main thread.
- **Modern Styling:** Built with the next-gen **Tailwind CSS 4** engine for smaller bundles and faster builds.
- **State Management:** Predictable and centralized data flow using **Redux Toolkit**.
- **Secure Backend:** **Express 5** implementation with strict **Mongoose 9** schemas and Clerk middleware protection.

---

## 🛠️ Technologies Used

### Frontend
- **React 19 (Vite)** - Latest concurrent rendering features.
- **Tailwind CSS 4** - Next-gen utility-first styling.
- **Redux Toolkit** - Modern state management.
- **Lucide React** - High-quality, consistent iconography.
- **React Router 7** - Declarative and type-safe routing.

### Backend
- **Node.js & Express 5** - Scalable server architecture.
- **MongoDB (Mongoose 9)** - Flexible NoSQL data modeling.
- **Inngest** - Serverless event queue and background processing.
- **Clerk SDK** - Enterprise-grade authentication and identity.
- **ImageKit** - Cloud-based image management and optimization.
- **Nodemailer** - Automated email delivery.

---

## 📁 Project Structure

```text
PingUp/
│
├── frontend/                # React + Vite Application
│   ├── src/
│   │   ├── components/      # UI components (Lucide Icons)
│   │   ├── store/           # Redux slices and store config
│   │   ├── pages/           # Route views
│   │   └── hooks/           # Custom React 19 hooks
│   └── package.json
│
├── server/                  # Express.js Backend
│   ├── models/              # Mongoose Schemas (v9)
│   ├── routes/              # API Endpoints
│   ├── inngest/             # Background job functions
│   └── server.js            # Entry point
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18 or higher)
- **MongoDB Atlas** account
- **Clerk** API keys
- **Inngest** Dev Server

### Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/AkshayKumarShaw44/PingUp.git](https://github.com/AkshayKumarShaw44/PingUp.git)
   cd PingUp
   ```

2. **Configure the Backend:**
   ```bash
   cd server
   npm install
   ```
   Create a `.env` file in the `server` directory:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   CLERK_PUBLISHABLE_KEY=your_clerk_pub_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
   ```

3. **Configure the Frontend:**
   ```bash
   cd ../frontend
   npm install
   ```
   Create a `.env` file in the `frontend` directory:
   ```env
   VITE_CLERK_PUBLISHABLE_KEY=your_clerk_pub_key
   ```

4. **Run the Application:**
   Open two terminals:
   ```bash
   # Terminal 1: Backend
   cd server
   npm run dev

   # Terminal 2: Frontend
   cd frontend
   npm run dev
   ```

---

## 🎯 Core Functionality: Event Workflow
**PingUp** uses a modern event-driven flow:
- **Trigger:** A user performs an action (e.g., Register/Update).
- **Event Dispatch:** The Express server sends an event to **Inngest**.
- **Background Job:** Inngest triggers functions for **ImageKit** processing or **Nodemailer** alerts.
- **UI Response:** The frontend reflects changes immediately via **Redux** state updates.

---

## 🚧 Future Enhancements
- [ ] **Real-time Chat:** Implementation of Socket.io for live messaging.
- [ ] **Video Calls:** WebRTC integration for 1-on-1 video communication.
- [ ] **AI Search:** Enhanced user and content search using Vector embeddings.
- [ ] **Dark Mode:** Native implementation using Tailwind 4 features.

---

## 🤝 Contributing
Contributions make the open-source community an amazing place to learn, inspire, and create.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License
This project is open-source and available under the **ISC License**.

## 👤 Author
**Akshay Kumar Shaw**
- **GitHub:** [@AkshayKumarShaw44](https://github.com/AkshayKumarShaw44)
- **LinkedIn:** [akshaykumarshaw44](https://linkedin.com/in/akshaykumarshaw44)

---

### 🌟 Show Your Support
If this project helped you or you like the tech stack, please give it a **Star** ⭐️!

<p align="center">
  <b>Built using MERN, Clerk, and Inngest</b>
</p>

<p align="center">
  Released under the <a href="./LICENSE">ISC License</a>.
</p>

<p align="center">
  <b>© 2026 PingUp — All Rights Reserved.</b><br>
</p>
