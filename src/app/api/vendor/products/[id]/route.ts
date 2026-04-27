import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { requireVendor } from '@/lib/authMiddleware';
import { Product } from '@/models/Product';
import { User } from '@/models/User';
import { productSchema } from '@/lib/validations';
import { redis } from '@/lib/redis';

export const PATCH = requireVendor(async (req: NextRequest, context) => {
  await connectDB();

  const auth = (context as { auth: { uid: string } }).auth;
  const { id } = await (context.params as Promise<{ id: string }>);
  const body = await req.json();
  const parsed = productSchema.partial().safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const user = await User.findOne({ firebaseUid: auth.uid }).lean();
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const product = await Product.findOneAndUpdate(
    { _id: id, vendor: user._id },
    { $set: parsed.data },
    { new: true }
  );
  if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

  await Promise.all([
    redis.del('products:list'),
    redis.del(`product:${product.slug}`),
  ]);

  return NextResponse.json({ product });
});

export const DELETE = requireVendor(async (_req: NextRequest, context) => {
  await connectDB();

  const auth = (context as { auth: { uid: string } }).auth;
  const { id } = await (context.params as Promise<{ id: string }>);
  const user = await User.findOne({ firebaseUid: auth.uid }).lean();
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const product = await Product.findOneAndDelete({ _id: id, vendor: user._id });
  if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

  await Promise.all([
    redis.del('products:list'),
    redis.del(`product:${product.slug}`),
  ]);

  return NextResponse.json({ message: 'Product deleted' });
});
