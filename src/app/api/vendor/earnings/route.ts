//get earnings for a vendor
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

    const orders = await Order.find({ 'items.vendor': user._id }).lean();

    const earnings = orders.reduce((total, order) => {
      const vendorItems = order.items.filter((item) => item.vendor.toString() === user._id.toString());
      const orderEarnings = vendorItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      return total + orderEarnings;
    }, 0);

    return NextResponse.json({ earnings });
  } catch (err) {
    console.error('Vendor earnings GET error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});