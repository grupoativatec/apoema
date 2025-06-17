'use server';

import { pool } from '../database/db';

// Criar tarefa
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
    await pool.query(
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

function formatDateToMariaDBDate(date?: string | Date): string | undefined {
  if (!date) return undefined;

  console.log('🕵️ Valor recebido em formatDateToMariaDBDate:', date);

  const d = typeof date === 'string' ? new Date(date) : date;

  if (!(d instanceof Date) || isNaN(d.getTime())) {
    console.warn('❌ Valor inválido para Date:', date);
    return undefined;
  }

  return d.toISOString().slice(0, 10); // 'YYYY-MM-DD'
}

// Buscar tarefas por Kanban
export const getTasksByKanban = async (kanbanId: string) => {
  try {
    const [rows]: any = await pool.query(
      `SELECT t.* FROM tasks t JOIN columns c ON t.column_id = c.id WHERE c.kanban_id = ?`,
      [kanbanId],
    );

    return rows.map((t: any) => ({
      ...t,
      columnId: t.column_id,
      assignedTo: t.assigned_to,
      startDate: formatDateToMariaDBDate(t.start_date),
      endDate: formatDateToMariaDBDate(t.end_date),
    }));
  } catch (error) {
    console.error('Erro ao buscar tarefas:', error);
    throw error;
  }
};

// Atualizar tarefa
export const updateTaskDB = async (
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

    await pool.query(`UPDATE tasks SET ${setClause} WHERE id = ?`, [...values, id]);
    return { success: true };
  } catch (error) {
    console.error('Erro ao atualizar tarefa:', error);
    throw error;
  }
};

// Deletar tarefa
export const deleteTaskDB = async (id: string) => {
  try {
    await pool.query('DELETE FROM tasks WHERE id = ?', [id]);
    return { success: true };
  } catch (error) {
    console.error('Erro ao deletar tarefa:', error);
    throw error;
  }
};

// Helper para converter camelCase → snake_case
function snakeCase(str: string) {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}
