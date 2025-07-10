'use server';

import { pool } from '../database/db';

// Buscar todas as APIs
export const getAllMonitoramentoApis = async () => {
  const [rows]: any = await pool.query('SELECT * FROM monitoramentoApis');
  return rows;
};

// Adicionar nova API
export const addMonitoramentoApi = async ({
  name,
  url,
  realUrl,
  categoria,
  descricao,
  authorization,
}: {
  name: string;
  url: string;
  realUrl: string;
  categoria: string;
  descricao: string;
  authorization?: string;
}) => {
  try {
    await pool.query(
      'INSERT INTO monitoramentoApis (name, url, real_url, categoria, descricao, authorization) VALUES (?, ?, ?, ?, ?, ?)',
      [name, url, realUrl, categoria, descricao, authorization || null],
    );
    return { success: true };
  } catch (error) {
    console.error('Erro ao adicionar API:', error);
    return { success: false };
  }
};

// Atualizar status da API
export const updateMonitoramentoApiStatus = async ({
  url,
  online,
  responseTime,
}: {
  url: string;
  online: boolean;
  responseTime: number | null;
}) => {
  try {
    await pool.query('UPDATE monitoramentoApis SET online = ?, response_time = ? WHERE url = ?', [
      online,
      responseTime,
      url,
    ]);
    return { success: true };
  } catch (error) {
    console.error('Erro ao atualizar status da API:', error);
    return { success: false };
  }
};

// Editar uma API
export const updateMonitoramentoApi = async ({
  id,
  name,
  url,
  realUrl,
  categoria,
  descricao,
  authorization,
}: {
  id: number;
  name: string;
  url: string;
  realUrl: string;
  categoria: string;
  descricao: string;
  authorization?: string;
}) => {
  try {
    await pool.query(
      `
      UPDATE monitoramentoApis 
      SET name = ?, url = ?, real_url = ?, categoria = ?, descricao = ?, authorization = ?
      WHERE id = ?
      `,
      [name, url, realUrl, categoria, descricao, authorization || null, id],
    );
    return { success: true };
  } catch (error) {
    console.error('Erro ao editar API:', error);
    return { success: false };
  }
};

// Deletar uma API
export const deleteMonitoramentoApi = async (id: number) => {
  try {
    await pool.query('DELETE FROM monitoramentoApis WHERE id = ?', [id]);
    return { success: true };
  } catch (error) {
    console.error('Erro ao deletar API:', error);
    return { success: false };
  }
};
