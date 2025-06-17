'use server';

import { pool } from '../database/db';

// Criar coluna
export const createColumn = async (data: { id: string; kanbanId: string; title: string }) => {
  try {
    await pool.query('INSERT INTO columns (id, kanban_id, title) VALUES (?, ?, ?)', [
      data.id,
      data.kanbanId,
      data.title,
    ]);
    return { success: true, ...data };
  } catch (error) {
    console.error('Erro ao criar coluna:', error);
    throw error;
  }
};

// Buscar colunas por Kanban
export const getColumnsByKanban = async (kanbanId: string) => {
  try {
    const [rows]: any = await pool.query('SELECT * FROM columns WHERE kanban_id = ?', [kanbanId]);
    return rows;
  } catch (error) {
    console.error('Erro ao buscar colunas:', error);
    throw error;
  }
};

// Atualizar título da coluna
export const updateColumnTitle = async (id: string, title: string) => {
  try {
    await pool.query('UPDATE columns SET title = ? WHERE id = ?', [title, id]);
    return { success: true };
  } catch (error) {
    console.error('Erro ao atualizar coluna:', error);
    throw error;
  }
};

// Deletar coluna
export const deleteColumnDB = async (id: string) => {
  try {
    await pool.query('DELETE FROM columns WHERE id = ?', [id]);
    return { success: true };
  } catch (error) {
    console.error('Erro ao deletar coluna:', error);
    throw error;
  }
};
