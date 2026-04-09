const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());

// Health check — keeps Render free instance alive and lets Netlify verify
app.get('/health', (req, res) => res.json({ status: 'ok' }));

const ALLOWED_ORIGINS = [
  /https?:\/\/localhost(:\d+)?$/,           // local dev
  /https?:\/\/.*\.netlify\.app$/,           // any Netlify subdomain
  /https?:\/\/meecu\..*/,                   // custom domain if added later
];

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: (origin, cb) => {
      // Allow requests with no origin (e.g. mobile apps, curl)
      if (!origin) return cb(null, true);
      const allowed = ALLOWED_ORIGINS.some(pattern => pattern.test(origin));
      if (allowed) return cb(null, true);
      console.warn('CORS blocked origin:', origin);
      cb(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST']
  }
});

// Store waiting users: { dept: string, socketId: string, name: string }
let waitingQueue = [];
let rooms = {};

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // When user is searching for a match
  socket.on('join_queue', (userData) => {
    // Prevent duplicate entries from React Strict Mode double-firing
    waitingQueue = waitingQueue.filter(u => u.socketId !== socket.id);
    const { name, department, matchPreference } = userData;
    
    // Check if there's someone in the queue (excluding self)
    let matchIndex = -1;
    
    if (matchPreference === 'dept') {
      matchIndex = waitingQueue.findIndex(u => u.dept === department && u.socketId !== socket.id);
      if (matchIndex === -1) {
        matchIndex = waitingQueue.findIndex(u => u.socketId !== socket.id);
      }
    } else {
      matchIndex = waitingQueue.findIndex(u => u.socketId !== socket.id);
    }

    if (matchIndex !== -1) {
      const partner = waitingQueue.splice(matchIndex, 1)[0];
      const roomId = uuidv4();

      rooms[roomId] = [socket.id, partner.socketId];
      
      socket.join(roomId);
      const partnerSocket = io.sockets.sockets.get(partner.socketId);
      if (partnerSocket) {
        partnerSocket.join(roomId);
      }

      console.log(`Matched ${socket.id} with ${partner.socketId} in room ${roomId}`);

      socket.emit('matched', { 
        roomId, 
        partner: { name: partner.name, department: partner.dept } 
      });
      
      if (partnerSocket) {
        partnerSocket.emit('matched', { 
          roomId, 
          partner: { name: userData.name, department: userData.department } 
        });
      }
    } else {
      waitingQueue.push({ dept: department, socketId: socket.id, name });
      console.log(`${name} (${department}) joined the wait queue.`);
    }
  });

  socket.on('next_user', (userData) => {
    console.log(`User ${socket.id} requested next user`);
    
    // 1. Notify partner and leave current rooms
    for (const [roomId, users] of Object.entries(rooms)) {
      if (users.includes(socket.id)) {
        socket.to(roomId).emit('user_disconnected');
        socket.leave(roomId);
        delete rooms[roomId];
      }
    }

    // 2. Put user back in queue
    // We reuse the join_queue logic or emit it internally if needed, 
    // but the requirement says "On next_user event: Add user back to matchmaking queue"
    // So we can just trigger the join_queue logic manually here or wait for frontend to emit join_queue.
    // Given the "Instantly connect" requirement, let's process it here.
    
    if (userData) {
      // Logic same as join_queue
      waitingQueue = waitingQueue.filter(u => u.socketId !== socket.id);
      const { name, department, matchPreference } = userData;
      let matchIndex = -1;
      
      if (matchPreference === 'dept') {
        matchIndex = waitingQueue.findIndex(u => u.dept === department && u.socketId !== socket.id);
        if (matchIndex === -1) matchIndex = waitingQueue.findIndex(u => u.socketId !== socket.id);
      } else {
        matchIndex = waitingQueue.findIndex(u => u.socketId !== socket.id);
      }

      if (matchIndex !== -1) {
        const partner = waitingQueue.splice(matchIndex, 1)[0];
        const roomId = uuidv4();
        rooms[roomId] = [socket.id, partner.socketId];
        socket.join(roomId);
        const partnerSocket = io.sockets.sockets.get(partner.socketId);
        if (partnerSocket) partnerSocket.join(roomId);

        socket.emit('matched', { roomId, partner: { name: partner.name, department: partner.dept } });
        if (partnerSocket) partnerSocket.emit('matched', { roomId, partner: { name: userData.name, department: userData.department } });
      } else {
        waitingQueue.push({ dept: department, socketId: socket.id, name });
      }
    }
  });

  // User explicitly cancelled queue search
  socket.on('leave_queue', () => {
    waitingQueue = waitingQueue.filter(u => u.socketId !== socket.id);
  });

  // Chat Signaling
  socket.on('send_message', (data) => {
    socket.to(data.roomId).emit('receive_message', data.message);
  });

  socket.on('typing-start', (roomId) => {
    socket.to(roomId).emit('typing-start');
  });

  socket.on('typing-stop', (roomId) => {
    socket.to(roomId).emit('typing-stop');
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    waitingQueue = waitingQueue.filter(u => u.socketId !== socket.id);

    for (const [roomId, users] of Object.entries(rooms)) {
      if (users.includes(socket.id)) {
        socket.to(roomId).emit('user_disconnected');
        delete rooms[roomId];
      }
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
