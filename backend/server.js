const express = require('express');
const dotenv = require('dotenv');

dotenv.config();

const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const chatRoutes = require('./routes/chatRoutes');
const messageRoutes = require('./routes/messageRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

connectDB();

const app = express();

app.use(cors());
app.use(express.json()); // to accept json data

// --- DEPLOYMENT LOGIC ---
const path = require('path');

if (process.env.NODE_ENV === "production") {
  // __dirname is backend/, so go up one level to find frontend/dist
  const frontendDistPath = path.join(__dirname, "..", "frontend", "dist");
  app.use(express.static(frontendDistPath));

  app.get("*", (req, res) =>
    res.sendFile(path.join(frontendDistPath, "index.html"))
  );
} else {
  app.get("/", (req, res) => {
    res.send("API is running Successfully");
  });
}
// --------------------------

app.use('/api/auth', authRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/upload', uploadRoutes);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => console.log(`Server started on PORT ${PORT}`));

const io = require('socket.io')(server, {
  pingTimeout: 60000,
  cors: {
    origin: 'http://localhost:5173', // Vite default port
  },
});

io.on('connection', (socket) => {
  console.log('Connected to socket.io');

  socket.on('setup', (userData) => {
    socket.join(userData._id);
    socket.emit('connected');
  });

  socket.on('join chat', (room) => {
    socket.join(room);
    console.log('User Joined Room: ' + room);
  });

  socket.on('typing', (room) => socket.in(room).emit('typing'));
  socket.on('stop typing', (room) => socket.in(room).emit('stop typing'));

  socket.on('new message', (newMessageRecieved) => {
    var chat = newMessageRecieved.chat;

    if (!chat.users) return console.log('chat.users not defined');

    chat.users.forEach((user) => {
      if (user._id == newMessageRecieved.sender._id) return;

      socket.in(user._id).emit('message recieved', newMessageRecieved);
    });
  });

  socket.off('setup', () => {
    console.log('USER DISCONNECTED');
    socket.leave(userData._id);
  });
});
