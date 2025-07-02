import { NextResponse } from 'next/server';
import { deleteOrquestra } from '@/lib/actions/orquestra.actions';
import { isAdmin } from '@/lib/actions/user.actions';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const { processoid } = await req.json();
    const userId = (await cookies()).get('usuario_id')?.value;

    if (!userId) {
      return NextResponse.json({ success: false, message: 'Usuário não autenticado' });
    }

    const admin = await isAdmin(Number(userId));
    if (!admin) {
      return NextResponse.json({ success: false, message: 'Acesso negado' });
    }

    if (!processoid) {
      return NextResponse.json({ success: false, message: 'ID do processo não informado' });
    }

    const result = await deleteOrquestra(Number(processoid));
    return NextResponse.json(result);
  } catch (error) {
    console.error('Erro na API de deleção:', error);
    return NextResponse.json({ success: false, message: 'Erro interno no servidor' });
  }
}
