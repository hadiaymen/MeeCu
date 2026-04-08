const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
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
    
    if (matchPreference === 'dept' || matchPreference === 'same') {
      matchIndex = waitingQueue.findIndex(u => u.dept === department);
    } else {
      // Just find the first waiting user
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
