import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import instanceRoutes from './routes/instanceRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { baileysManager } from './services/baileysManager.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

app.use(cors());
app.use(express.json());

// Pass socket.io reference to Baileys manager
baileysManager.setSocketIO(io);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'OLTANI WhatsApp Engine',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/instances', instanceRoutes);
app.use('/api/admin', adminRoutes);

// Socket.io Connection & Room Joiner
io.on('connection', (socket) => {
  console.log(`🔌 Client connected to Socket.io: ${socket.id}`);

  socket.on('join_instance', (instanceId) => {
    socket.join(instanceId);
    console.log(`Socket ${socket.id} joined room: ${instanceId}`);
    
    // Send current status immediately
    const status = baileysManager.getStatus(instanceId);
    socket.emit('status_change', { instanceId, ...status });
  });

  socket.on('leave_instance', (instanceId) => {
    socket.leave(instanceId);
  });

  socket.on('disconnect', () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 OLTANI Backend Server running on port ${PORT}`);
});
