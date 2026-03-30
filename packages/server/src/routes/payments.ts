import { Router } from 'express';
import crypto from 'crypto';
import { prisma } from '../config/database.js';
import { requireAuth } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';

const router: Router = Router();

const MOMO_PARTNER_CODE = process.env.MOMO_PARTNER_CODE || 'MOMO';
const MOMO_ACCESS_KEY = process.env.MOMO_ACCESS_KEY || 'F8BBA842ECF85';
const MOMO_SECRET_KEY = process.env.MOMO_SECRET_KEY || 'K951B6PE1waDMi640xX08PD3vg6EkVlz';
const MOMO_ENDPOINT =
  process.env.MOMO_ENDPOINT || 'https://test-payment.momo.vn/v2/gateway/api/create';
const SERVER_URL = process.env.SERVER_URL || 'http://localhost:3001';
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

const PREMIUM_AMOUNT_VND = 99000; // 99,000 VND/month
const PREMIUM_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

// POST /payments/create
router.post('/create', requireAuth, async (req, res, next) => {
  try {
    const user = req.user!;

    if (user.isPremium && user.premiumUntil && user.premiumUntil > new Date()) {
      throw AppError.badRequest('Already a premium member');
    }

    const requestId = `req-${Date.now()}-${user.id.slice(0, 8)}`;
    const orderId = `anvago-${Date.now()}-${user.id.slice(0, 8)}`;
    const orderInfo = 'Anvago Premium - 1 thang';
    const redirectUrl = `${CLIENT_URL}/payment/result`;
    const ipnUrl = `${SERVER_URL}/api/v1/payments/ipn`;
    const requestType = 'payWithMethod';
    const extraData = '';
    const amount = PREMIUM_AMOUNT_VND;

    const rawSignature =
      `accessKey=${MOMO_ACCESS_KEY}` +
      `&amount=${amount}` +
      `&extraData=${extraData}` +
      `&ipnUrl=${ipnUrl}` +
      `&orderId=${orderId}` +
      `&orderInfo=${orderInfo}` +
      `&partnerCode=${MOMO_PARTNER_CODE}` +
      `&redirectUrl=${redirectUrl}` +
      `&requestId=${requestId}` +
      `&requestType=${requestType}`;

    const signature = crypto
      .createHmac('sha256', MOMO_SECRET_KEY)
      .update(rawSignature)
      .digest('hex');

    const payload = {
      partnerCode: MOMO_PARTNER_CODE,
      partnerName: 'Anvago',
      storeId: 'AnvagoStore',
      requestId,
      amount,
      orderId,
      orderInfo,
      redirectUrl,
      ipnUrl,
      lang: 'vi',
      extraData,
      requestType,
      signature,
    };

    const momoRes = await fetch(MOMO_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const momoData = (await momoRes.json()) as {
      resultCode: number;
      message: string;
      payUrl?: string;
      qrCodeUrl?: string;
      deeplink?: string;
    };

    if (momoData.resultCode !== 0) {
      throw AppError.internal(`MoMo error: ${momoData.message}`);
    }

    await prisma.payment.create({
      data: {
        userId: user.id,
        orderId,
        requestId,
        amount,
        status: 'pending',
      },
    });

    res.json({
      success: true,
      data: {
        payUrl: momoData.payUrl,
        qrCodeUrl: momoData.qrCodeUrl,
        deeplink: momoData.deeplink,
        orderId,
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /payments/ipn  — MoMo Instant Payment Notification
// No auth — called by MoMo's servers. Verified via HMAC signature.
router.post('/ipn', async (req, res) => {
  const {
    partnerCode,
    orderId,
    requestId,
    amount,
    orderInfo,
    orderType,
    transId,
    resultCode,
    message,
    payType,
    responseTime,
    extraData,
    signature,
  } = req.body;

  // Verify MoMo signature
  const rawSignature =
    `accessKey=${MOMO_ACCESS_KEY}` +
    `&amount=${amount}` +
    `&extraData=${extraData}` +
    `&message=${message}` +
    `&orderId=${orderId}` +
    `&orderInfo=${orderInfo}` +
    `&orderType=${orderType}` +
    `&partnerCode=${partnerCode}` +
    `&payType=${payType}` +
    `&requestId=${requestId}` +
    `&responseTime=${responseTime}` +
    `&resultCode=${resultCode}` +
    `&transId=${transId}`;

  const expectedSig = crypto
    .createHmac('sha256', MOMO_SECRET_KEY)
    .update(rawSignature)
    .digest('hex');

  if (signature !== expectedSig) {
    console.error('[MoMo IPN] Invalid signature for orderId:', orderId);
    return res.status(400).json({ message: 'Invalid signature' });
  }

  const payment = await prisma.payment.findUnique({ where: { orderId } });

  if (!payment) {
    console.error('[MoMo IPN] Unknown orderId:', orderId);
    return res.status(404).json({ message: 'Payment not found' });
  }

  if (payment.status !== 'pending') {
    // Already processed (duplicate IPN)
    return res.status(204).send();
  }

  if (resultCode === 0) {
    await prisma.$transaction([
      prisma.payment.update({
        where: { orderId },
        data: { status: 'completed', momoTransId: String(transId) },
      }),
      prisma.user.update({
        where: { id: payment.userId },
        data: {
          isPremium: true,
          premiumUntil: new Date(Date.now() + PREMIUM_DURATION_MS),
        },
      }),
    ]);
    console.log(`[MoMo IPN] Payment completed — userId: ${payment.userId}, orderId: ${orderId}`);
  } else {
    await prisma.payment.update({
      where: { orderId },
      data: { status: 'failed' },
    });
    console.log(
      `[MoMo IPN] Payment failed — orderId: ${orderId}, resultCode: ${resultCode}`
    );
  }

  return res.status(204).send();
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
