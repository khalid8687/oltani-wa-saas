import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { Server } from 'socket.io';
import { env } from './config/env.js';
import { getDb } from './config/firebase.js';
import { logger } from './utils/logger.js';
import { baileys } from './services/baileysManager.js';
import authRoutes from './routes/authRoutes.js';
import instanceRoutes from './routes/instanceRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

const app = express();
const server = http.createServer(app);

const allowedOrigins = (env.clientOrigin || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins.length ? allowedOrigins : false,
    methods: ['GET', 'POST']
  }
});

// Socket.io auth: every connection must present a valid Firebase ID token.
// Token is sent via `auth` field on the client OR as `auth` query param.
io.use(async (socket, next) => {
  try {
    const token =
      socket.handshake?.auth?.token ||
      socket.handshake?.headers?.authorization?.replace(/^Bearer\s+/i, '') ||
      socket.handshake?.query?.token;
    if (!token || typeof token !== 'string') {
      return next(new Error('Missing auth token.'));
    }
    const auth = getAuth();
    if (!auth) return next(new Error('Auth service unavailable.'));
    const decoded = await auth.verifyIdToken(token);
    socket.uid = decoded.uid;
    socket.email = decoded.email || '';
    next();
  } catch (err) {
    next(new Error('Invalid auth token.'));
  }
});

baileys.setSocketIO(io);

app.use(helmet());
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(morgan(env.isProd ? 'combined' : 'dev'));
app.use(cors({
  origin: allowedOrigins.length ? allowedOrigins : false,
  credentials: true
}));

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'oltani-backend',
    time: new Date().toISOString(),
    firestore: !!getDb()
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/instances', instanceRoutes);
app.use('/api/admin', adminRoutes);

app.use((req, res) => res.status(404).json({ success: false, error: 'Not found.' }));

app.use((err, req, res, next) => {
  logger.error({ msg: err.message, stack: err.stack }, 'Unhandled error.');
  res.status(500).json({ success: false, error: 'Internal server error.' });
});

io.on('connection', (socket) => {
  socket.on('instance:subscribe', (instanceId) => {
    if (typeof instanceId !== 'string' || !/^[a-zA-Z0-9_-]{4,80}$/.test(instanceId)) {
      socket.emit('instance:error', { instanceId, error: 'invalid_id' });
      return;
    }
    authorizeInstanceAccess(socket.uid, instanceId)
      .then((ok) => {
        if (ok) {
          socket.join(`inst:${instanceId}`);
          const status = baileys.getStatus(instanceId);
          socket.emit('instance:patch', { instanceId, ...status });
        } else {
          socket.emit('instance:error', { instanceId, error: 'forbidden' });
        }
      })
      .catch(() => socket.emit('instance:error', { instanceId, error: 'server_error' }));
  });
  socket.on('instance:unsubscribe', (instanceId) => {
    if (typeof instanceId === 'string' && /^[a-zA-Z0-9_-]{4,80}$/.test(instanceId)) {
      socket.leave(`inst:${instanceId}`);
    }
  });
});

/** Verify the socket's uid owns the instance (or is an admin). */
async function authorizeInstanceAccess(uid, instanceId) {
  if (!uid || !instanceId) return false;
  const db = getDb();
  if (!db) return true; // dev fallback when Firestore isn't configured
  try {
    const snap = await db.collection('instances').doc(instanceId).get();
    if (!snap.exists) return false;
    const data = snap.data();
    if (data.userId === uid) return true;
    const userSnap = await db.collection('users').doc(uid).get();
    const role = userSnap.exists ? (userSnap.data().role || 'user') : 'user';
    return role === 'admin';
  } catch (_) {
    return false;
  }
}

server.listen(env.port, () => {
  logger.info(`🚀 OLTANI backend on :${env.port} (${env.nodeEnv})`);
});

process.on('unhandledRejection', (reason) => {
  logger.error({ reason: String(reason) }, 'Unhandled rejection.');
});
