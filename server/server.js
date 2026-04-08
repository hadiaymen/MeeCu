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
  socket.on('join-queue', (userData) => {
    // Prevent duplicate entries from React Strict Mode double-firing
    waitingQueue = waitingQueue.filter(u => u.socketId !== socket.id);
    const { name, department, matchPreference } = userData; // matchPreference: 'same' | 'random'
    
    // Check if there's someone in the queue
    let matchIndex = -1;
    
    if (matchPreference === 'dept') {
      // Try to find someone from the same department who also wants dept-match OR random
      matchIndex = waitingQueue.findIndex(u => u.dept === department);
      if (matchIndex === -1) {
        // Fall back to any waiting user if none from same dept
        matchIndex = waitingQueue.length > 0 ? 0 : -1;
      }
    } else {
      // 'random': match with anyone
      matchIndex = waitingQueue.length > 0 ? 0 : -1;
    }

    if (matchIndex !== -1) {
      // Found a match
      const partner = waitingQueue.splice(matchIndex, 1)[0];
      const roomId = uuidv4();

      rooms[roomId] = [socket.id, partner.socketId];
      
      socket.join(roomId);
      const partnerSocket = io.sockets.sockets.get(partner.socketId);
      if (partnerSocket) {
        partnerSocket.join(roomId);
      }

      console.log(`Matched ${socket.id} with ${partner.socketId} in room ${roomId}`);

      // Notify both that a match is found, sending each partner's details
      socket.emit('match-found', { 
        roomId, 
        partner: { name: partner.name, department: partner.dept } 
      });
      
      if (partnerSocket) {
        partnerSocket.emit('match-found', { 
          roomId, 
          partner: { name: userData.name, department: userData.department } 
        });
      }
    } else {
      // No match found, join queue
      waitingQueue.push({ dept: department, socketId: socket.id, name });
      console.log(`${name} (${department}) joined the wait queue.`);
    }
  });

  // User explicitly cancelled queue search
  socket.on('leave-queue', () => {
    const before = waitingQueue.length;
    waitingQueue = waitingQueue.filter(u => u.socketId !== socket.id);
    if (waitingQueue.length < before) {
      console.log(`${socket.id} left the queue.`);
    }
  });

  // Chat Signaling
  socket.on('send-message', (data) => {
    // data: { roomId, message: string, timestamp: Date }
    socket.to(data.roomId).emit('receive-message', data.message);
  });

  socket.on('typing-start', (roomId) => {
    socket.to(roomId).emit('typing-start');
  });

  socket.on('typing-stop', (roomId) => {
    socket.to(roomId).emit('typing-stop');
  });

  // Leave room / End chat
  socket.on('leave-room', (roomId) => {
    console.log(`${socket.id} leaving room ${roomId}`);
    socket.leave(roomId);
    socket.to(roomId).emit('peer-disconnected');
    
    // Cleanup room
    if (rooms[roomId]) {
      delete rooms[roomId];
    }
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    // Remove from queue if they were waiting
    waitingQueue = waitingQueue.filter(u => u.socketId !== socket.id);

    // Notify room if they were in one
    for (const [roomId, users] of Object.entries(rooms)) {
      if (users.includes(socket.id)) {
        socket.to(roomId).emit('peer-disconnected');
        delete rooms[roomId];
      }
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
