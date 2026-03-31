import { Router } from 'express';
import { SePayPgClient } from 'sepay-pg-node';
import { prisma } from '../config/database.js';
import { requireAuth } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';

const router: Router = Router();

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
const SERVER_URL = process.env.SERVER_URL || 'http://localhost:3001';

const sepay = new SePayPgClient({
  env: (process.env.SEPAY_ENV as 'sandbox' | 'production') || 'sandbox',
  merchant_id: process.env.SEPAY_MERCHANT_ID || '',
  secret_key: process.env.SEPAY_SECRET_KEY || '',
});

const PREMIUM_AMOUNT_VND = 99000; // 99,000 VND/month
const PREMIUM_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

// POST /payments/create
router.post('/create', requireAuth, async (req, res, next) => {
  try {
    const user = req.user!;

    if (user.isPremium && user.premiumUntil && user.premiumUntil > new Date()) {
      throw AppError.badRequest('Already a premium member');
    }

    const orderId = `anvago-${Date.now()}-${user.id.slice(0, 8)}`;

    const fields = sepay.checkout.initOneTimePaymentFields({
      operation: 'PURCHASE',
      payment_method: 'BANK_TRANSFER',
      order_invoice_number: orderId,
      order_amount: PREMIUM_AMOUNT_VND,
      currency: 'VND',
      order_description: 'Anvago Premium - 1 thang',
      success_url: `${CLIENT_URL}/payment/result?orderId=${orderId}`,
      error_url: `${CLIENT_URL}/payment/result?orderId=${orderId}&status=error`,
      cancel_url: `${CLIENT_URL}/payment/result?orderId=${orderId}&status=cancel`,
    });

    const checkoutUrl = sepay.checkout.initCheckoutUrl();

    await prisma.payment.create({
      data: {
        userId: user.id,
        orderId,
        amount: PREMIUM_AMOUNT_VND,
        status: 'pending',
      },
    });

    res.json({
      success: true,
      data: {
        checkoutUrl,
        fields,
        orderId,
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /payments/ipn  — SEPAY Instant Payment Notification
// No auth — verified via X-Secret-Key header
router.post('/ipn', async (req, res) => {
  const secretKey = req.headers['x-secret-key'];

  if (secretKey !== process.env.SEPAY_SECRET_KEY) {
    console.error('[SEPAY IPN] Invalid secret key');
    return res.status(400).json({ message: 'Invalid secret key' });
  }

  const { notification_type, order, transaction } = req.body as {
    notification_type: string;
    order: { order_invoice_number: string; order_status: string };
    transaction: { transaction_status: string; transaction_id?: string };
  };

  const orderId = order?.order_invoice_number;

  const payment = await prisma.payment.findUnique({ where: { orderId } });

  if (!payment) {
    console.error('[SEPAY IPN] Unknown orderId:', orderId);
    return res.status(404).json({ message: 'Payment not found' });
  }

  if (payment.status !== 'pending') {
    // Already processed (duplicate IPN)
    return res.status(200).json({ success: true });
  }

  if (order.order_status === 'CAPTURED' && transaction.transaction_status === 'APPROVED') {
    await prisma.$transaction([
      prisma.payment.update({
        where: { orderId },
        data: {
          status: 'completed',
          gatewayTransId: transaction.transaction_id ?? null,
        },
      }),
      prisma.user.update({
        where: { id: payment.userId },
        data: {
          isPremium: true,
          premiumUntil: new Date(Date.now() + PREMIUM_DURATION_MS),
        },
      }),
    ]);
    console.log(`[SEPAY IPN] Payment completed — userId: ${payment.userId}, orderId: ${orderId}`);
  } else {
    await prisma.payment.update({
      where: { orderId },
      data: { status: 'failed' },
    });
    console.log(
      `[SEPAY IPN] Payment failed — orderId: ${orderId}, notification_type: ${notification_type}`
    );
  }

  return res.status(200).json({ success: true });
});

// GET /payments/status/:orderId  — polled by frontend after redirect
router.get('/status/:orderId', requireAuth, async (req, res, next) => {
  try {
    const payment = await prisma.payment.findUnique({
      where: { orderId: req.params.orderId },
    });

    if (!payment || payment.userId !== req.user!.id) {
      throw AppError.notFound('Payment not found');
    }

    res.json({
      success: true,
      data: {
        orderId: payment.orderId,
        status: payment.status,
        amount: payment.amount,
        createdAt: payment.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
