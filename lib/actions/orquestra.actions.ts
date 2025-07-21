/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use server';

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
  statusAnuencia?: string;
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
        recebimento, chegada, destino, status, statusAnuencia, anuencia, analista
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, // <- Agora tem 11 ?
      [
        data.imp,
        data.referencia,
        data.exportador,
        data.importador,
        normalizeDateToISO(data.recebimento),
        normalizeDateToISO(data.chegada),
        data.destino,
        status,
        data.statusAnuencia ?? '',
        data.anuencia,
        data.analista ?? '',
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
  status?: string,
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

export const updateOrquestraStatusAnuencia = async (imp: string, statusAnuencia: string) => {
  try {
    const [rows]: any = await pool.query('UPDATE processos SET statusAnuencia = ? WHERE imp = ?', [
      statusAnuencia,
      imp,
    ]);

    return { imp, statusAnuencia };
  } catch (error) {
    console.error('Erro ao atualizar statusAnuencia:', error);
    throw error;
  }
};

export const getRelatorioGeral = async () => {
  try {
    const [quantidadeTotal]: any = await pool.query('SELECT COUNT(*) AS total FROM processos');

    const [topImportadores]: any = await pool.query(`
  SELECT importador AS name, COUNT(*) AS value
  FROM apoema.processos
  WHERE importador IS NOT NULL AND importador != ''
  GROUP BY importador
  ORDER BY value DESC
  LIMIT 5
`);

    const [topExportadores]: any = await pool.query(`
      SELECT exportador, COUNT(*) AS total
      FROM processos
      GROUP BY exportador
      ORDER BY total DESC
      LIMIT 5
    `);

    const [topAnalistas]: any = await pool.query(`
      SELECT analista, COUNT(*) AS total
      FROM processos
      WHERE analista IS NOT NULL AND analista != ''
      GROUP BY analista
      ORDER BY total DESC
      LIMIT 5
    `);

    const [porData]: any = await pool.query(`
      SELECT recebimento AS data, COUNT(*) AS total
      FROM processos
      GROUP BY recebimento
      ORDER BY STR_TO_DATE(recebimento, '%d/%m/%Y') ASC
    `);

    return {
      totalProcessos: quantidadeTotal[0].total,
      importadores: topImportadores,
      exportadores: topExportadores,
      analistas: topAnalistas,
      porData,
    };
  } catch (error) {
    console.error('Erro ao gerar relatório geral:', error);
    throw error;
  }
};
