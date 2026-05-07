import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Order } from '@/models/Order';
import { User } from '@/models/User';
import { requireVendor } from '@/lib/authMiddleware';

export const GET = requireVendor(async (req: NextRequest, context) => {
  try {
    await connectDB();

    const auth = (context as { auth: { uid: string } }).auth;
    const user = await User.findOne({ firebaseUid: auth.uid }).lean();
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const orders = await Order.find({ 'items.vendor': user._id })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ orders });
  } catch (err) {
    console.error('Vendor orders GET error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});

const VENDOR_ALLOWED_STATUSES = ['processing', 'shipped', 'delivered', 'cancelled'] as const;

export const PATCH = requireVendor(async (req: NextRequest, context) => {
  try {
    await connectDB();

    const auth = (context as { auth: { uid: string } }).auth;
    const user = await User.findOne({ firebaseUid: auth.uid }).lean();
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const { orderId, status } = await req.json();
    if (!orderId || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!VENDOR_ALLOWED_STATUSES.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const order = await Order.findOne({ _id: orderId, 'items.vendor': user._id });
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    order.orderStatus = status;
    await order.save();

    return NextResponse.json({ message: 'Order status updated' });
  } catch (err) {
    console.error('Vendor orders PATCH error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});