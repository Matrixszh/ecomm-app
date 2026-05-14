import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Category } from '@/models/Category';
import { redis } from '@/lib/redis';
import { requireAdmin } from '@/lib/authMiddleware';
import { categorySchema } from '@/lib/validations';

export const PATCH = requireAdmin(async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params;
    await connectDB();
    const body = await req.json();

    const validation = categorySchema.partial().safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.issues }, { status: 400 });
    }

    const category = await Category.findByIdAndUpdate(id, validation.data, { new: true });
    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    await redis.del('categories:all');

    return NextResponse.json(category);
  } catch (error) {
    console.error('Admin category PATCH error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});

export const DELETE = requireAdmin(async (
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params;
    await connectDB();

    const category = await Category.findByIdAndDelete(id);
    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    await redis.del('categories:all');

    return NextResponse.json({ message: 'Deleted' });
  } catch (error) {
    console.error('Admin category DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});
