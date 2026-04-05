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
    const marker = await prisma.user.findUnique({ where: { email: 'nguyenquangk981@gmail.com' } });
    if (!marker) {
      console.log('  ⏳ Seeding 500 demo users...');
      const hash = await bcrypt.hash('user123', 10);

      const ho = ['Nguyen', 'Tran', 'Le', 'Pham', 'Hoang', 'Vo', 'Dang', 'Bui', 'Do', 'Ngo', 'Duong', 'Ly', 'Truong', 'Dinh', 'Ha', 'Luong', 'Mai', 'Cao', 'Lam', 'Vu'];
      const dem = ['Van', 'Thi', 'Quang', 'Minh', 'Hoang', 'Duc', 'Thanh', 'Ngoc', 'Dinh', 'Xuan', 'Hong', 'Huu', 'Quoc', 'Anh', 'Phuoc', 'Bao', 'Gia', 'Duy', 'Khanh', 'Trung'];
      const ten = ['Khai', 'Hieu', 'Linh', 'Tuan', 'Hoa', 'Lan', 'Duc', 'Mai', 'Nam', 'Thu', 'An', 'Bao', 'Chi', 'Dung', 'Giang', 'Ha', 'Khoa', 'Long', 'Ngoc', 'Phuong', 'Quyen', 'Son', 'Tien', 'Uyen', 'Vy', 'Huy', 'Dat', 'Thao', 'Phuc', 'Nhi', 'Tam', 'Hung', 'Trinh', 'Luan', 'My', 'Tai', 'Sang', 'Nhat', 'Tuyet', 'Hai'];
      const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com'];

      const used = new Set<string>();
      const users = [];

      for (let i = 0; i < 500; i++) {
        const h = ho[i % ho.length];
        const d = dem[(i * 3 + 7) % dem.length];
        const t = ten[(i * 7 + 3) % ten.length];
        const fullName = `${h} ${d} ${t}`;

        // Generate realistic email: lowercase first letter of ho + dem + ten + random digits
        const base = (t.toLowerCase() + d.charAt(0).toLowerCase() + h.charAt(0).toLowerCase()).normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        let email = '';
        let attempts = 0;
        do {
          const num = Math.floor(Math.random() * 900) + 100;
          const domain = domains[i % domains.length];
          email = `${base}${num}@${domain}`;
          attempts++;
        } while (used.has(email) && attempts < 10);
        used.add(email);

        users.push({
          email,
          passwordHash: hash,
          name: fullName,
          isPremium: false,
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

