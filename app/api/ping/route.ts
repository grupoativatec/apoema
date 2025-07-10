// app/api/ping/route.ts
import { pool } from '@/lib/database/db'; // ajuste conforme sua estrutura
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const urlParam = req.nextUrl.searchParams.get('url');

  if (!urlParam || typeof urlParam !== 'string') {
    return NextResponse.json({ error: 'Missing or invalid URL' }, { status: 400 });
  }

  // Busca da API pelo real_url
  const [rows]: any = await pool.query('SELECT * FROM monitoramentoApis WHERE real_url = ?', [
    urlParam,
  ]);
  const api = rows[0];

  if (!api) {
    return NextResponse.json({ error: 'API not found in database' }, { status: 404 });
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const start = performance.now();

    const res = await fetch(urlParam, {
      method: api.method || 'GET',
      headers: {
        ...(api.authorization ? { Authorization: api.authorization } : {}),
        'Content-Type': 'application/json',
      },
      ...(api.method === 'POST' ? { body: api.body || '{}' } : {}),
      signal: controller.signal,
    });

    const responseTime = Math.round(performance.now() - start);
    clearTimeout(timeoutId);

    return NextResponse.json({
      online: res.status < 500,
      responseTime,
      statusCode: res.status,
    });
  } catch (err) {
    clearTimeout(timeoutId);
    return NextResponse.json({
      online: false,
      responseTime: null,
    });
  }
}
