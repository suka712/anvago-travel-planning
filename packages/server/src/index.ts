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

    // Clean up old seed users and seed 500 realistic ones
    await prisma.user.deleteMany({
      where: {
        email: { endsWith: '@anvago.com' },
        NOT: { email: { in: ['demo@anvago.com', 'admin@anvago.com', 'foodie@anvago.com'] } },
      },
    });
    const seedCount = await prisma.user.count({ where: { email: { not: { endsWith: '@anvago.com' } } } });
    if (seedCount < 50) {
      console.log('  ⏳ Seeding 500 demo users...');
      const hash = await bcrypt.hash('user123', 10);

      const ho = ['Nguyen', 'Tran', 'Le', 'Pham', 'Hoang', 'Vo', 'Dang', 'Bui', 'Do', 'Ngo', 'Duong', 'Ly', 'Truong', 'Dinh', 'Ha', 'Luong', 'Mai', 'Cao', 'Lam', 'Vu', 'Tang', 'Trinh', 'Huynh', 'Ta', 'Chau', 'Quach', 'Dam', 'Bach', 'Tong', 'Mach'];
      const dem = ['Van', 'Thi', 'Quang', 'Minh', 'Hoang', 'Duc', 'Thanh', 'Ngoc', 'Dinh', 'Xuan', 'Hong', 'Huu', 'Quoc', 'Anh', 'Phuoc', 'Bao', 'Gia', 'Duy', 'Khanh', 'Trung', 'Tuan', 'Kim', 'Trong', 'Hien', 'Phu'];
      const ten = ['Khai', 'Hieu', 'Linh', 'Tuan', 'Hoa', 'Lan', 'Duc', 'Mai', 'Nam', 'Thu', 'An', 'Bao', 'Chi', 'Dung', 'Giang', 'Ha', 'Khoa', 'Long', 'Ngoc', 'Phuong', 'Quyen', 'Son', 'Tien', 'Uyen', 'Vy', 'Huy', 'Dat', 'Thao', 'Phuc', 'Nhi', 'Tam', 'Hung', 'Trinh', 'Luan', 'My', 'Tai', 'Sang', 'Nhat', 'Tuyet', 'Hai', 'Khiem', 'Truc', 'Yen', 'Loc', 'Quan', 'Vinh', 'Trang', 'Hien', 'Thuy', 'Dieu'];
      const domains = ['gmail.com', 'gmail.com', 'gmail.com', 'yahoo.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com'];

      const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
      const strip = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

      const used = new Set<string>();
      const users = [];
      const now = Date.now();

      for (let i = 0; i < 500; i++) {
        const h = pick(ho);
        const d = pick(dem);
        const t = pick(ten);
        const fullName = `${h} ${d} ${t}`;
        const domain = pick(domains);

        // Varied email patterns like real people use
        const patterns = [
          () => `${strip(t)}${strip(h)}${Math.floor(Math.random() * 99)}@${domain}`,
          () => `${strip(t)}.${strip(h)}${Math.floor(Math.random() * 999)}@${domain}`,
          () => `${strip(h)}${strip(t)}${Math.floor(Math.random() * 9000) + 1000}@${domain}`,
          () => `${strip(t)}${strip(d).charAt(0)}${strip(h).charAt(0)}${Math.floor(Math.random() * 900) + 100}@${domain}`,
          () => `${strip(t)}_${strip(h)}${Math.floor(Math.random() * 99)}@${domain}`,
          () => `${strip(h)}.${strip(d)}.${strip(t)}@${domain}`,
          () => `${strip(t)}${Math.floor(Math.random() * 90) + 10}${strip(h).charAt(0)}@${domain}`,
          () => `${strip(t)}${strip(h)}${String(Math.floor(Math.random() * 100)).padStart(2, '0')}@${domain}`,
        ];

        let email = '';
        let attempts = 0;
        do {
          email = pick(patterns)();
          attempts++;
        } while (used.has(email) && attempts < 20);
        used.add(email);

        // Spread createdAt over last 6 months
        const daysAgo = Math.floor(Math.random() * 180);
        const createdAt = new Date(now - daysAgo * 86400000);

        users.push({
          email,
          passwordHash: hash,
          name: fullName,
          isPremium: false,
          createdAt,
        });
      }

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

