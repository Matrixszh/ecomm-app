import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Category } from '@/models/Category';
import { redis } from '@/lib/redis';
import { requireAdmin } from '@/lib/authMiddleware';
import { categorySchema } from '@/lib/validations';

export const GET = requireAdmin(async () => {
  try {
    await connectDB();
    const categories = await Category.find().sort({ name: 1 }).lean();
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Admin categories GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});

export const POST = requireAdmin(async (req: NextRequest) => {
  try {
    await connectDB();
    const body = await req.json();

    const validation = categorySchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.issues }, { status: 400 });
    }

    const slug = body.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const category = await Category.create({ ...validation.data, slug });

    await redis.del('categories:all');

    return NextResponse.json(category, { status: 201 });
  } catch (error: unknown) {
    if ((error as { code?: number }).code === 11000) {
      return NextResponse.json({ error: 'Category name already exists' }, { status: 409 });
    }
    console.error('Admin categories POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});
