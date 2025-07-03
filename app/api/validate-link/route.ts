import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { url } = await req.json();

  try {
    const res = await fetch(url, { method: 'HEAD' });

    const isOnline = res.status >= 200 && res.status < 400;

    return NextResponse.json({ online: isOnline, status: res.status });
  } catch (err) {
    return NextResponse.json({ online: false, error: 'Falha na verificação' }, { status: 500 });
  }
}
