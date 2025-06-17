'use server';

import { pool } from '../database/db';

// criando um novo kanban
export const createKanban = async (data: { id: string; name: string }) => {
  try {
    const [result]: any = await pool.query('INSERT INTO kanbans (id, name) VALUES (?, ?)', [
      data.id,
      data.name,
    ]);

    return { success: true, ...data };
  } catch (error) {
    console.error('Erro ao criar Kanban:', error);
    throw error;
  }
};

// retornando todos os kanbans
export const getAllKanbans = async () => {
  try {
    const [rows]: any = await pool.query('SELECT * FROM kanbans');
    return rows;
  } catch (error) {
    console.error('Erro ao buscar Kanbans:', error);
    throw error;
  }
};

// criando nova coluna
export const createColumn = async (data: { id: string; kanbanId: string; title: string }) => {
  try {
    const [result]: any = await pool.query(
      'INSERT INTO columns (id, kanban_id, title) VALUES (?, ?, ?)',
      [data.id, data.kanbanId, data.title],
    );
    return { success: true, ...data };
  } catch (error) {
    console.error('Erro ao criar Coluna:', error);
    throw error;
  }
};

// pegando colunas pelo o kanban
export const getColumnsByKanban = async (kanbanId: string) => {
  try {
    const [rows]: any = await pool.query('SELECT * FROM columns WHERE kanban_id = ?', [kanbanId]);
    return rows;
  } catch (error) {
    console.error('Erro ao buscar colunas:', error);
    throw error;
  }
};

// criando nova task
export const createTask = async (task: {
  id: string;
  columnId: string;
  content: string;
  assignedTo?: string;
  tags?: string;
  startDate?: string;
  endDate?: string;
}) => {
  try {
    const [result]: any = await pool.query(
      `INSERT INTO tasks (id, column_id, content, assigned_to, tags, start_date, end_date)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        task.id,
        task.columnId,
        task.content,
        task.assignedTo ?? null,
        task.tags ?? null,
        task.startDate ?? null,
        task.endDate ?? null,
      ],
    );
    return { success: true, ...task };
  } catch (error) {
    console.error('Erro ao criar tarefa:', error);
    throw error;
  }
};

// Pegando a tasks pelo o kanban
export const getTasksByKanban = async (kanbanId: string) => {
  try {
    const [rows]: any = await pool.query(
      `SELECT t.*
       FROM tasks t
       JOIN columns c ON t.column_id = c.id
       WHERE c.kanban_id = ?`,
      [kanbanId],
    );
    return rows;
  } catch (error) {
    console.error('Erro ao buscar tarefas:', error);
    throw error;
  }
};

// Atualiza Tarefa
export const updateTask = async (
  id: string,
  updates: Partial<{
    content: string;
    assignedTo: string;
    tags: string;
    startDate: string;
    endDate: string;
    columnId: string;
  }>,
) => {
  try {
    const fields = Object.keys(updates);
    const values = Object.values(updates);
    const setClause = fields.map((field) => `${snakeCase(field)} = ?`).join(', ');

    const [result]: any = await pool.query(`UPDATE tasks SET ${setClause} WHERE id = ?`, [
      ...values,
      id,
    ]);
    return { success: true };
  } catch (error) {
    console.error('Erro ao atualizar tarefa:', error);
    throw error;
  }
};

// Atualizar kanban nome
export const updateKanbanName = async (id: string, name: string) => {
  try {
    await pool.query('UPDATE kanbans SET name = ? WHERE id = ?', [name, id]);
    return { success: true };
  } catch (error) {
    console.error('Erro ao atualizar nome do kanban:', error);
    throw error;
  }
};

// Helper para converter camelCase → snake_case
function snakeCase(str: string) {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

// Deleta Tarefa
export const deleteTask = async (id: string) => {
  try {
    await pool.query('DELETE FROM tasks WHERE id = ?', [id]);
    return { success: true };
  } catch (error) {
    console.error('Erro ao deletar tarefa:', error);
    throw error;
  }
};

// Deleta Kanban
export const deleteKanban = async (id: string) => {
  try {
    await pool.query('DELETE FROM kanbans WHERE id = ?', [id]);
    return { success: true };
  } catch (error) {
    console.error('Erro ao deletar kanban:', error);
    throw error;
  }
};
