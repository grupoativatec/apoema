// app/api/etiquetas/validateDownloadForm/route.ts

import { NextRequest, NextResponse } from "next/server";

interface Download {
  code: string;
  link: string;
}

// “Banco” fake em memória
const fakeDownloads: Download[] = [
  { code: "DL001", link: "https://drive.google.com/file/d/1" },
  { code: "DL002", link: "https://drive.google.com/file/d/2" },
  { code: "DL003", link: "https://drive.google.com/file/d/3" },
];

export async function POST(req: NextRequest) {
  const { code, email, termsAccepted } = await req.json();

  if (!code || !email) {
    return NextResponse.json(
      { error: "Código e e-mail são obrigatórios." },
      { status: 400 }
    );
  }
  if (!termsAccepted) {
    return NextResponse.json(
      { error: "Você precisa aceitar os termos de uso." },
      { status: 400 }
    );
  }

  const record = fakeDownloads.find((d) => d.code === code);
  if (!record) {
    return NextResponse.json(
      { error: "Código de download inválido." },
      { status: 404 }
    );
  }

  // (Aqui você poderia gravar o e-mail em algum log/DB, se quiser)
  return NextResponse.json({ link: record.link });
}
