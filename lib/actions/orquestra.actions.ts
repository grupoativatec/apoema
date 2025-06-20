/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use server';

import { createAdminClient } from '@/lib/appwrite';
import { appwriteConfig } from '@/lib/appwrite/config';
import { ID, Query } from 'node-appwrite';
import { pool } from '../database/db';

const normalizeDateToISO = (dateStr: string) => {
  if (!dateStr) return '';

  // Já está em formato ISO (YYYY-MM-DD)
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr;
  }

  // Está em formato brasileiro (DD/MM/YYYY)
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
    const [day, month, year] = dateStr.split('/');
    return `${year}-${month}-${day}`;
  }

  // Formato inválido
  return '';
};

// CREATE
export const createOrquestra = async (data: {
  imp: string;
  referencia: string;
  exportador: string;
  importador: string;
  recebimento: string;
  chegada: string;
  destino: string;
  status?: string;
  analista?: string;
  anuencia: string;
}) => {
  try {
    const status = 'PendenteLi';

    const [existing]: any = await pool.query('SELECT * FROM processos WHERE imp = ? LIMIT 1', [
      data.imp,
    ]);

    if (existing.length > 0) return existing[0];

    const [result]: any = await pool.query(
      `INSERT INTO processos (
        imp, referencia, exportador, importador,
        recebimento, chegada, destino, status, anuencia, analista
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.imp,
        data.referencia,
        data.exportador,
        data.importador,
        normalizeDateToISO(data.recebimento),
        normalizeDateToISO(data.chegada),
        data.destino,
        status,
        data.analista,
      ],
    );

    return { processoid: result.insertId, ...data };
  } catch (error) {
    console.error('Erro ao criar processo:', error);
    throw error;
  }
};

// Função para atualizar um documento na tabela "orquestra"
export const updateOrquestra = async (
  id: number,
  data: {
    imp: string;
    referencia: string;
    exportador: string;
    importador: string;
    recebimento: string;
    chegada: string;
    destino: string;
    status?: string;
    obs?: string;
    analista?: string;
  },
) => {
  try {
    await pool.query(
      `UPDATE processos SET 
        imp = ?, referencia = ?, exportador = ?, importador = ?, 
        recebimento = ?, chegada = ?, destino = ?, 
        status = ?, obs = ?, analista = ?
      WHERE processoid = ?`,
      [
        data.imp,
        data.referencia,
        data.exportador,
        data.importador,
        data.recebimento,
        data.chegada,
        data.destino,
        data.status ?? '',
        data.obs ?? '',
        data.analista ?? '',
        id,
      ],
    );

    return { processoid: id, ...data };
  } catch (error) {
    console.error('Erro ao atualizar processo:', error);
    throw error;
  }
};

// READ
export const getOrquestras = async () => {
  try {
    const [rows]: any = await pool.query('SELECT * FROM processos');
    return rows;
  } catch (error) {
    console.error('Erro ao buscar orquestras:', error);
    throw error;
  }
};

// Função para excluir um documento da tabela "orquestra"
export const deleteOrquestra = async (id: number) => {
  try {
    await pool.query('DELETE FROM processos WHERE processoid = ?', [id]);
    return { success: true };
  } catch (error) {
    console.error('Erro ao deletar processo:', error);
    throw error;
  }
};

// Função para retornar as orquestras que foram recebidas hoje
// GET recebidas hoje
export const getOrquestrasRecebidasHoje = async () => {
  try {
    const hoje = new Date();
    const data = hoje.toLocaleDateString('pt-BR');

    const [rows]: any = await pool.query('SELECT * FROM processos WHERE recebimento = ? LIMIT 10', [
      data,
    ]);

    return rows;
  } catch (error) {
    console.error('Erro ao buscar recebidas hoje:', error);
    throw error;
  }
};

// Função para retornar a quantidade de orquestras no mês atual
export const getQuantidadeOrquestrasNoMes = async () => {
  try {
    const hoje = new Date();
    const mes = (hoje.getMonth() + 1).toString().padStart(2, '0');
    const ano = hoje.getFullYear();

    const [rows]: any = await pool.query('SELECT recebimento FROM processos');

    const total = rows.filter((row: any) => {
      const [dia, mesRow, anoRow] = row.recebimento.split('/').map(Number);
      return mesRow === parseInt(mes) && anoRow === ano;
    }).length;

    return total;
  } catch (error) {
    console.error('Erro ao contar orquestras no mês:', error);
    throw error;
  }
};

// Função para atualizar o status de uma orquestra pelo campo "imp"
export const updateOrquestraStatus = async (
  imp: string,
  status: string,
  dataFinalizacao?: string,
) => {
  try {
    let query = 'UPDATE processos SET status = ?';
    const params: any[] = [status];

    if (status === 'Finalizado' && dataFinalizacao) {
      query += ', dataFinalizacao = ?';
      params.push(dataFinalizacao);
    } else {
      query += ', dataFinalizacao = NULL';
    }

    query += ' WHERE imp = ?';
    params.push(imp);

    const [rows]: any = await pool.query(query, params);

    return { imp, status, dataFinalizacao: status === 'Finalizado' ? dataFinalizacao : null };
  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    throw error;
  }
};

// Função para atualizar a observação ("obs") de uma orquestra pelo campo "imp"
export const updateOrquestraObs = async (imp: string, obs: string) => {
  try {
    const [rows]: any = await pool.query('UPDATE processos SET obs = ? WHERE imp = ?', [obs, imp]);

    return { imp, obs };
  } catch (error) {
    console.error('Erro ao atualizar obs do processo:', error);
    throw error;
  }
};

// Função para retornar todas as orquestras cujo status esteja como "finalizado"
export const getOrquestrasFinalizadas = async () => {
  try {
    const [rows]: any = await pool.query("SELECT * FROM processos WHERE status = 'Finalizado'");

    return rows;
  } catch (error) {
    console.error('Erro ao buscar finalizadas:', error);
    throw error;
  }
};

export const getQuantidadeProcessosLiPorStatus = async () => {
  try {
    const [rows]: any = await pool.query(`
      SELECT
        COUNT(CASE WHEN status = 'PendenteLi' THEN 1 END) AS pendentes,
        COUNT(CASE WHEN status != 'Finalizado' THEN 1 END) AS emAndamento,
        COUNT(CASE WHEN status = 'Finalizado' THEN 1 END) AS concluidos
      FROM processos;
    `);

    return {
      pendentes: rows[0].pendentes,
      emAndamento: rows[0].emAndamento,
      concluidos: rows[0].concluidos,
    };
  } catch (error) {
    console.error('Erro ao buscar contagem de processos Li por status:', error);
    throw error;
  }
};
