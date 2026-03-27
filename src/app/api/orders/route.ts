import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Order } from '@/models/Order';
import { Cart } from '@/models/Cart';
import { User } from '@/models/User';
import { redis } from '@/lib/redis';
import { requireAuth } from '@/lib/authMiddleware';
import { orderSchema } from '@/lib/validations';
import crypto from 'crypto';

type RazorpayOrderCreateResponse = {
  id: string;
  amount: number;
  currency: string;
  receipt?: string;
  status: string;
};

type RazorpayOrderGetResponse = {
  id: string;
  amount: number;
  currency: string;
  receipt?: string;
  status: string;
};

type RazorpayPaymentGetResponse = {
  id: string;
  status: string;
  order_id?: string;
  amount?: number;
  currency?: string;
};

function timingSafeEqual(a: string, b: string) {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

function getRazorpayAuthHeader() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    throw new Error('Razorpay keys are not configured');
  }
  return `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`;
}

async function createRazorpayOrder(options: {
  amountPaise: number;
  currency: string;
  receipt: string;
  notes?: Record<string, string>;
}): Promise<RazorpayOrderCreateResponse> {
  const auth = getRazorpayAuthHeader();

  const res = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      Authorization: auth,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: options.amountPaise,
      currency: options.currency,
      receipt: options.receipt,
      notes: options.notes,
    }),
  });

  const data = (await res.json()) as unknown;
  if (!res.ok) {
    const msg = typeof data === 'object' && data && 'error' in data ? JSON.stringify(data) : 'Razorpay order creation failed';
    throw new Error(msg);
  }

  return data as RazorpayOrderCreateResponse;
}

async function getRazorpayOrder(orderId: string): Promise<RazorpayOrderGetResponse> {
  const auth = getRazorpayAuthHeader();
  const res = await fetch(`https://api.razorpay.com/v1/orders/${encodeURIComponent(orderId)}`, {
    method: 'GET',
    headers: { Authorization: auth },
  });
  const data = (await res.json()) as unknown;
  if (!res.ok) {
    const msg = typeof data === 'object' && data && 'error' in data ? JSON.stringify(data) : 'Razorpay order fetch failed';
    throw new Error(msg);
  }
  return data as RazorpayOrderGetResponse;
}

async function getRazorpayPayment(paymentId: string): Promise<RazorpayPaymentGetResponse> {
  const auth = getRazorpayAuthHeader();
  const res = await fetch(`https://api.razorpay.com/v1/payments/${encodeURIComponent(paymentId)}`, {
    method: 'GET',
    headers: { Authorization: auth },
  });
  const data = (await res.json()) as unknown;
  if (!res.ok) {
    const msg = typeof data === 'object' && data && 'error' in data ? JSON.stringify(data) : 'Razorpay payment fetch failed';
    throw new Error(msg);
  }
  return data as RazorpayPaymentGetResponse;
}

export const GET = requireAuth(async (req: NextRequest, context) => {
  try {
    const uid = context.auth?.uid;
    if (!uid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    await connectDB();
    const user = await User.findOne({ firebaseUid: uid });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const [orders, total] = await Promise.all([
      Order.find({ user: user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments({ user: user._id }),
    ]);

    return NextResponse.json({
      orders,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error('Orders GET error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});

export const POST = requireAuth(async (req: NextRequest, context) => {
  try {
    const uid = context.auth?.uid;
    if (!uid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await connectDB();
    const body = await req.json();

    const validation = orderSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.flatten() }, { status: 400 });
    }

    const user = await User.findOne({ firebaseUid: uid });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    if (validation.data.paymentMethod === 'razorpay') {
      const rpOrderId = typeof body?.razorpay_order_id === 'string' ? body.razorpay_order_id : undefined;
      const rpPaymentId = typeof body?.razorpay_payment_id === 'string' ? body.razorpay_payment_id : undefined;
      const rpSignature = typeof body?.razorpay_signature === 'string' ? body.razorpay_signature : undefined;
      const providedOrderNumber = typeof body?.orderNumber === 'string' ? body.orderNumber : undefined;

      if (rpOrderId && rpPaymentId && rpSignature && providedOrderNumber) {
        const secret = process.env.RAZORPAY_KEY_SECRET;
        if (!secret) return NextResponse.json({ error: 'Razorpay keys are not configured' }, { status: 500 });

        const expected = crypto
          .createHmac('sha256', secret)
          .update(`${rpOrderId}|${rpPaymentId}`)
          .digest('hex');

        if (!timingSafeEqual(expected, rpSignature)) {
          return NextResponse.json({ error: 'Invalid Razorpay signature' }, { status: 400 });
        }

        const expectedAmountPaise = Math.round(validation.data.totalAmount * 100);
        const [rpOrder, rpPayment] = await Promise.all([getRazorpayOrder(rpOrderId), getRazorpayPayment(rpPaymentId)]);

        if (rpPayment.order_id && rpPayment.order_id !== rpOrderId) {
          return NextResponse.json({ error: 'Razorpay order mismatch' }, { status: 400 });
        }

        if (rpOrder.receipt && rpOrder.receipt !== providedOrderNumber) {
          return NextResponse.json({ error: 'Order number mismatch' }, { status: 400 });
        }

        if (rpOrder.amount !== expectedAmountPaise) {
          return NextResponse.json({ error: 'Amount mismatch' }, { status: 400 });
        }

        if (rpPayment.status !== 'captured') {
          return NextResponse.json({ error: 'Payment not captured' }, { status: 400 });
        }

        const order = await Order.create({
          ...validation.data,
          orderNumber: providedOrderNumber,
          user: user._id,
          orderStatus: 'confirmed',
          paymentStatus: 'paid',
          razorpayOrderId: rpOrderId,
          razorpayPaymentId: rpPaymentId,
          razorpaySignature: rpSignature,
        });

        await Cart.findOneAndDelete({ user: user._id });
        await redis.del(`cart:user:${uid}`);

        return NextResponse.json(order, { status: 201 });
      }

      const date = new Date();
      const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
      const randomStr = Math.floor(10000 + Math.random() * 90000).toString();
      const orderNumber = `ORD-${dateStr}-${randomStr}`;

      const amountPaise = Math.round(validation.data.totalAmount * 100);
      const rpOrder = await createRazorpayOrder({
        amountPaise,
        currency: 'INR',
        receipt: orderNumber,
        notes: {
          orderNumber,
          userId: String(user._id),
        },
      });

      return NextResponse.json(
        {
          orderNumber,
          razorpay: {
            keyId: process.env.RAZORPAY_KEY_ID,
            orderId: rpOrder.id,
            amount: rpOrder.amount,
            currency: rpOrder.currency,
          },
        },
        { status: 200 }
      );
    }

    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const randomStr = Math.floor(10000 + Math.random() * 90000).toString();
    const orderNumber = `ORD-${dateStr}-${randomStr}`;

    const order = await Order.create({
      ...validation.data,
      orderNumber,
      user: user._id,
      orderStatus: 'placed',
      paymentStatus: 'pending',
    });

    await Cart.findOneAndDelete({ user: user._id });
    await redis.del(`cart:user:${uid}`);

    return NextResponse.json(order, { status: 201 });
  } catch (err) {
    console.error('Orders POST error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});
