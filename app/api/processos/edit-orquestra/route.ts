// /api/edit-orquestra.ts

import { updateOrquestra } from '@/lib/actions/orquestra.actions';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const updated = await updateOrquestra(body.processoid, body);

    return new Response(JSON.stringify({ success: true, updated }), {
      status: 200,
    });
  } catch (error) {
    console.error('Erro ao atualizar processo:', error);
    return new Response(JSON.stringify({ success: false }), {
      status: 500,
    });
  }
}
