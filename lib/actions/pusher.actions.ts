// lib/actions/pusher.actions.ts
'use server';

import { pusherServer } from '@/lib/pusher-server';

export async function triggerPusherServer(event: string, data: any) {
  try {
    await pusherServer.trigger('kanban-channel', event, data);
  } catch (err) {
    console.error('Erro ao disparar evento do Pusher:', err);
  }
}
