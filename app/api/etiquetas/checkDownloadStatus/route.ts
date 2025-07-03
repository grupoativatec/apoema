// app/api/etiquetas/checkDownloadStatus/route.ts
import { getDownloadStatusByCode } from '@/lib/actions/etiquetasDownloads.actions';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.json({ success: false, message: 'Código não informado' }, { status: 400 });
  }

  const data = await getDownloadStatusByCode(code);

  if (!data) {
    return NextResponse.json({ success: false, message: 'Código não encontrado' }, { status: 404 });
  }

  const isValidated = !!(data.acceptedAt && data.acceptedName);

  return NextResponse.json({
    success: true,
    validated: isValidated,
    name: data.acceptedName,
    link: isValidated ? data.link : null,
  });
}
