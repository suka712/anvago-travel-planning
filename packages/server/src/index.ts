import 'dotenv/config';
import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { errorHandler } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/requestLogger.js';
import { setupPassport } from './config/passport.js';
import routes from './routes/index.js';
import { prisma } from './config/database.js';
import bcrypt from 'bcryptjs';

const app: Express = express();
const PORT = process.env.PORT || 3001;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Security middleware // Redeployment test
app.use(helmet());
app.use(cors({
  origin: CLIENT_URL,
  credentials: true,
}));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Request logging
app.use(requestLogger);

// Passport setup
setupPassport();

// API routes
app.use('/api/v1', routes);

// Health check
app.get('/health', (_, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '0.1.0',
    name: 'Anvago API'
  });
});

// Error handling
app.use(errorHandler);

// Ensure demo account has admin access & seed 500 users
(async () => {
  try {
    const r = await prisma.user.updateMany({
      where: { email: 'demo@anvago.com' },
      data: { isAdmin: true, isPremium: true },
    });
    if (r.count > 0) console.log('  ✓ demo@anvago.com promoted to admin');

    // Seed 500 demo users if not already present
    const marker = await prisma.user.findUnique({ where: { email: 'user001@anvago.com' } });
    if (!marker) {
      console.log('  ⏳ Seeding 500 demo users...');
      const hash = await bcrypt.hash('user123', 10);
      const firstNames = ['Minh', 'Linh', 'Hoa', 'Tuan', 'Lan', 'Duc', 'Mai', 'Nam', 'Thu', 'Khoa', 'An', 'Bao', 'Chi', 'Dung', 'Giang', 'Ha', 'Khanh', 'Long', 'Ngoc', 'Phuong'];
      const lastNames = ['Nguyen', 'Tran', 'Le', 'Pham', 'Hoang', 'Vo', 'Dang', 'Bui', 'Do', 'Ngo'];

      const users = Array.from({ length: 500 }, (_, i) => {
        const idx = i + 1;
        const first = firstNames[i % firstNames.length];
        const last = lastNames[i % lastNames.length];
        return {
          email: `user${String(idx).padStart(3, '0')}@anvago.com`,
          passwordHash: hash,
          name: `${first} ${last} ${idx}`,
          isPremium: i % 5 === 0, // 20% premium
        };
      });

      await prisma.user.createMany({ data: users, skipDuplicates: true });
      console.log('  ✓ 500 demo users created');
    }
  } catch (e) {
    console.error('  ✗ User seeding failed:', e);
  }
})();

// Start server - bind to 0.0.0.0 for container environments
const server = app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`
  ╔═══════════════════════════════════════════════╗
  ║                                               ║
  ║   🌏 ANVAGO API SERVER                        ║
  ║   Travel the world your way                   ║
  ║                                               ║
  ║   🚀 Server running on port ${PORT}              ║
  ║   📍 http://0.0.0.0:${PORT}                      ║
  ║   🔗 Client: ${CLIENT_URL}              ║
  ║                                               ║
  ╚═══════════════════════════════════════════════╝
  `);
});

server.on('error', (err) => {
  console.error('Server failed to start:', err);
  process.exit(1);
});

export default app;

