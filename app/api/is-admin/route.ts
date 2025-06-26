// app/api/is-admin/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { isAdmin } from '@/lib/actions/user.actions';

export async function GET() {
  const cookieStore = cookies();
  const userId = (await cookieStore).get('usuario_id')?.value;

  if (!userId) return NextResponse.json({ isAdmin: false });

  const admin = await isAdmin(Number(userId));
  return NextResponse.json({ isAdmin: admin });
}
