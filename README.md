# ConnectWith - Real-Time Chat App

ConnectWith is a modern, real-time messaging application built with the MERN stack (MongoDB, Express, React, Node.js) and Socket.IO. It supports one-on-one text chats, group chats, and multimedia file sharing by integrating Cloudinary.

## Features
- **Real-Time Messaging:** Instant message delivery across all connected clients using Socket.IO.
- **Authentication:** Secure user login and registration using JWT (JSON Web Tokens).
- **Group Chats:** Create multi-user channels or talk one-on-one.
- **Media Uploads:** Share images, PDFs, and videos seamlessly via Cloudinary.
- **Modern UI:** A clean, minimalistic, responsive interface designed for both Desktop and Mobile browsers.
- **Typing Indicators:** See when others are typing in real time.

## Tech Stack
- **Frontend:** React, Vite, React Router, Socket.IO-Client, Axios, Lucide React (for icons)
- **Backend:** Node.js, Express, Mongoose, Socket.IO, JWT, Multer, Cloudinary
- **Database:** MongoDB

## Folder Structure
```
ConnectWith/
├── backend/
│   ├── config/          # DB connection & token logic
│   ├── controllers/     # Route logic for auth, chats, messages
│   ├── middleware/      # JWT protection middleware
│   ├── models/          # Mongoose Schemas (User, Chat, Message)
│   ├── routes/          # Express API route mapping
│   ├── server.js        # Entry point for backend
│   └── .env             # Environment variables
└── frontend/
    ├── src/
    │   ├── components/  # React components (MyChats, ChatBox)
    │   ├── Context/     # React state management
    │   ├── pages/       # Login/Register, Main Chat Layout
    │   ├── App.jsx      # Main application router
    │   └── App.css      # Custom styling
    └── index.html
```

## Step-by-Step Local Setup

### 1. Clone & Prerequisites
Make sure you have Node.js and MongoDB installed on your machine.

### 2. Backend Setup
Navigate to the backend directory and install dependencies:
```bash
cd backend
npm install
```

### 3. Environment Variables
In the `backend` folder, the `.env` file must contain your configuration. Make sure you fill in the bolded items below:

```env
PORT=5000
MONGO_URI=your_mongo_url
JWT_SECRET=supersecretjwtkey_change_me_in_production
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```
*Note: Create a free Cloudinary account to get your keys for media uploads to work properly.*

### 4. Run the Backend Server
```bash
node server.js
```
The console should say: `Server started on PORT 5000` and `MongoDB Connected`.

### 5. Frontend Setup
Open a new terminal window, navigate to the frontend directory, and install dependencies:
```bash
cd frontend
npm install
```

### 6. Run the Frontend App
```bash
npm run dev
```
Navigate to `http://localhost:5173` in your browser.

## Versions Used
- Node.js: >=18.0.0
- MongoDB Shell/Server: ^6.0 or ^7.0
- React: ^18.2.0
- Express: ^4.21.0
- Socket.IO: ^4.8.0

## ConnectWith UI Screenshots
1. Login Page
<img width="2880" height="1624" alt="image" src="https://github.com/user-attachments/assets/d9a75a98-9aaa-4cf9-ad45-f86c16b3afb0" />

2. Private Chat with File Upload
<img width="2880" height="1624" alt="image" src="https://github.com/user-attachments/assets/f241c047-96f2-421c-817d-2cadc7b47e01" />

3. Creating Group Chat
<img width="2880" height="1624" alt="image" src="https://github.com/user-attachments/assets/7f4c0475-3056-489e-9e4b-a84f31b5bd2d" />

4. Group Chat
<img width="2880" height="1624" alt="image" src="https://github.com/user-attachments/assets/4abc5a34-966f-4572-b6c7-e5bd480e1de4" />

5. Notifications
<img width="2880" height="1624" alt="image" src="https://github.com/user-attachments/assets/29bca646-ec67-4368-85cd-8f0efa1c86f3" />

6. Profile Page
<img width="2880" height="1624" alt="image" src="https://github.com/user-attachments/assets/6e6b01ac-1ce6-47de-9974-d3b254b1a9b6" />





