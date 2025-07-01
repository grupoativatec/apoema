import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/database/db';

export async function POST(req: NextRequest) {
  try {
    const { code, name, termsAccepted } = await req.json();

    if (!code || !name) {
      return NextResponse.json({ error: 'Código e nome são obrigatórios.' }, { status: 400 });
    }

    if (!termsAccepted) {
      return NextResponse.json(
        { error: 'Você precisa aceitar os termos de uso.' },
        { status: 400 },
      );
    }

    // Busca o registro
    const [rows]: any = await pool.query(
      'SELECT link FROM apoema.EtiquetasDownloads WHERE id = ?',
      [code],
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'Código de download inválido ou expirado.' },
        { status: 404 },
      );
    }

    // Atualiza accepted_name e accepted_at
    await pool.query(
      `UPDATE apoema.EtiquetasDownloads
       SET accepted_name = ?, accepted_at = NOW()
       WHERE id = ?`,
      [name, code],
    );

    return NextResponse.json({ link: rows[0].link });
  } catch (error: any) {
    console.error('[validateDownloadForm] Erro:', error?.message || error);
    return NextResponse.json({ error: 'Erro interno no servidor.' }, { status: 500 });
  }
}
