// app/api/processos/status/route.ts
import { getQuantidadeProcessosLiPorStatus } from '@/lib/actions/orquestra.actions';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const data = await getQuantidadeProcessosLiPorStatus();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar dados' }, { status: 500 });
  }
}
