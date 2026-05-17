import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { requireAuth } from '@/lib/authMiddleware';
import { User } from '@/models/User';

export const PATCH = requireAuth(async (req: NextRequest, { auth }) => {
  await connectDB();

  const { name, avatar } = await req.json();

  const updated = await User.findOneAndUpdate(
    { firebaseUid: auth.uid },
    { $set: { ...(name && { name }), ...(avatar && { avatar }) } },
    { new: true }
  ).lean();

  if (!updated) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  return NextResponse.json({ user: updated });
});
