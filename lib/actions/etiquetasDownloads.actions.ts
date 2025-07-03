'use server';

import { pool } from '@/lib/database/db';
import { v4 as uuidv4 } from 'uuid';

// Tipagem padrão usada em todas as respostas
export interface EtiquetasDownload {
  id: string;
  pedido: string;
  client: string;
  link: string;
  acceptedAt: Date | null;
  acceptedName: string | null;
}

export type CreateDownloadResponse =
  | { success: true; download: EtiquetasDownload }
  | { success: false; message: string };

export type UpdateDownloadResponse = { success: true } | { success: false; message: string };

export type DeleteDownloadResponse = { success: true } | { success: false; message: string };

// ========================
// CRIAR DOWNLOAD
// ========================

export const createDownload = async ({
  pedido,
  client,
  link,
}: {
  pedido: string;
  client: string;
  link: string;
}): Promise<CreateDownloadResponse> => {
  try {
    const id = uuidv4();

    await pool.query(
      `
      INSERT INTO apoema.EtiquetasDownloads
      (id, pedido, client, link)
      VALUES (?, ?, ?, ?)
    `,
      [id, pedido, client, link],
    );

    return {
      success: true as const,
      download: {
        id,
        pedido,
        client,
        link,
        acceptedAt: null,
        acceptedName: null,
      },
    };
  } catch (error) {
    console.error('Erro ao criar download:', error);
    return {
      success: false as const,
      message: 'Erro ao criar download',
    };
  }
};

// ========================
// LISTAR TODOS
// ========================
export const getAllDownloads = async (): Promise<EtiquetasDownload[]> => {
  try {
    const [rows]: any = await pool.query(
      'SELECT id, pedido, client, link, accepted_at as acceptedAt, accepted_name as acceptedName FROM apoema.EtiquetasDownloads ORDER BY accepted_at DESC',
    );
    return rows.map((row: any) => ({
      ...row,
      acceptedAt: row.acceptedAt ? new Date(row.acceptedAt) : null,
    }));
  } catch (error) {
    console.error('Erro ao buscar downloads:', error);
    return [];
  }
};

// ========================
// ATUALIZAR DOWNLOAD
// ========================
export const updateDownload = async ({
  id,
  pedido,
  client,
  link,
}: {
  id: string;
  pedido?: string;
  client?: string;
  link?: string;
}): Promise<UpdateDownloadResponse> => {
  try {
    const fields: string[] = [];
    const values: any[] = [];

    if (pedido && pedido.trim()) {
      fields.push('pedido = ?');
      values.push(pedido.trim());
    }

    if (client && client.trim()) {
      fields.push('client = ?');
      values.push(client.trim());

      // Atualiza accepted_name com base no client
      fields.push('accepted_name = ?');
      values.push(client.toLowerCase().replace(/\s/g, '') + '@example.com');
    }

    if (link && link.trim()) {
      fields.push('link = ?');
      values.push(link.trim());
    }

    if (fields.length === 0) {
      return {
        success: false,
        message: 'Nenhum campo válido para atualizar.',
      };
    }

    // Finaliza a query com WHERE id
    const sql = `UPDATE apoema.EtiquetasDownloads SET ${fields.join(', ')} WHERE id = ?`;
    values.push(id);

    await pool.query(sql, values);

    return { success: true as const };
  } catch (error) {
    console.error('Erro ao atualizar download:', error);
    return {
      success: false as const,
      message: 'Erro ao atualizar download',
    };
  }
};

// ========================
// DELETAR DOWNLOAD
// ========================
export const deleteDownload = async (id: string): Promise<DeleteDownloadResponse> => {
  try {
    await pool.query('DELETE FROM apoema.EtiquetasDownloads WHERE id = ?', [id]);
    return { success: true as const };
  } catch (error) {
    console.error('Erro ao deletar download:', error);
    return {
      success: false as const,
      message: 'Erro ao deletar download',
    };
  }
};

export const getDownloadStatusByCode = async (code: string): Promise<EtiquetasDownload | null> => {
  try {
    const [rows]: any = await pool.query(
      `
        SELECT id, pedido, client, link, accepted_at as acceptedAt, accepted_name as acceptedName
        FROM apoema.EtiquetasDownloads
        WHERE id = ?
        LIMIT 1
      `,
      [code],
    );

    if (rows.length === 0) return null;

    const row = rows[0];

    return {
      id: row.id,
      pedido: row.pedido,
      client: row.client,
      link: row.link,
      acceptedAt: row.acceptedAt ? new Date(row.acceptedAt) : null,
      acceptedName: row.acceptedName,
    };
  } catch (error) {
    console.error('Erro ao buscar status do download:', error);
    return null;
  }
};
