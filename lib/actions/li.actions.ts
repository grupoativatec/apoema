/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use server";

import { createAdminClient } from "@/lib/appwrite";
import { appwriteConfig } from "@/lib/appwrite/config";
import { ID, Query } from "node-appwrite";
import { pool } from "../database/db";
export const createLicencaImportacao = async (data: {
  imp: string;
  importador: string;
  referenciaDoCliente: string;
  numeroOrquestra: number;
  numeroLi: string;
  ncm: string;
  dataRegistroLI: string;
  dataInclusaoOrquestra: string;
  previsaoDeferimento: string;
  situacao: string;
  observacoes: string;
}) => {
  try {


    const [result]: any = await pool.query(
      `INSERT INTO licencaimportacao (
        imp, importador, referenciaDoCliente, numeroOrquestra, numeroLi,
        ncm, dataRegistroLI, dataInclusaoOrquestra, previsaoDeferimento,
        situacao, observacoes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.imp,
        data.importador,
        data.referenciaDoCliente,
        data.numeroOrquestra,
        data.numeroLi,
        data.ncm,
        data.dataRegistroLI,
        data.dataInclusaoOrquestra,
        data.previsaoDeferimento,
        data.situacao,
        data.observacoes,
      ]
    );

    return { licencaimportacaoid: result.insertId, ...data };
  } catch (error) {
    console.error("Erro ao criar Licença de Importação:", error);
    throw error;
  }
};

// Atualiza uma Licença de Importação existente no banco de dados
export const updateLicencaImportacao = async (
  id: number,
  data: {
    imp: string;
    importador: string;
    referenciaDoCliente: string;
    numeroOrquestra: number;
    numeroLi: string;
    ncm: string;
    dataRegistroLI: string;
    dataInclusaoOrquestra: string;
    previsaoDeferimento: string;
    situacao: string;
    observacoes: string;
  }
) => {
  try {
    
    await pool.query(
      `UPDATE licencaimportacao SET
        imp = ?, importador = ?, referenciaDoCliente = ?, numeroOrquestra = ?, numeroLi = ?,
        ncm = ?, dataRegistroLI = ?, dataInclusaoOrquestra = ?, previsaoDeferimento = ?,
        situacao = ?, observacoes = ?
      WHERE licencaimportacaoid = ?`,
      [
        data.imp,
        data.importador,
        data.referenciaDoCliente,
        data.numeroOrquestra,
        data.numeroLi,
        data.ncm,
        data.dataRegistroLI,
        data.dataInclusaoOrquestra,
        data.previsaoDeferimento,
        data.situacao,
        data.observacoes,
        id,
      ]
    );

    return { licencaimportacaoid: id, ...data };
  } catch (error) {
    console.error("Erro ao atualizar Licença de Importação:", error);
    throw error;
  }
};


// Retorna a lista de todas as Licenças de Importação
export const getLicencasImportacao = async () => {
  try {
    const [rows]: any = await pool.query("SELECT * FROM licencaimportacao");
    return rows;
  } catch (error) {
    console.error("Erro ao buscar licenças de importação:", error);
    throw error;
  }
};

// Exclui uma Licença de Importação com base no ID
export const deleteLicencaImportacao = async (id: number) => {
  try {
    await pool.query("DELETE FROM licencaimportacao WHERE licencaimportacaoid = ?", [id]);
    return { success: true };
  } catch (error) {
    console.error("Erro ao excluir Licença de Importação:", error);
    throw error;
  }
};


// Função para retornar Licenças de Importação com data de deferimento igual ao dia atual
// ou a mais próxima do dia atual
// Se não houver nenhuma, retorna uma lista vazia
export const getLicencasImportacaoDeferidasHoje = async () => {
  try {
    const hoje = new Date();
    const yyyyMMdd = hoje.toISOString().split("T")[0]; // YYYY-MM-DD

    const [rows]: any = await pool.query(
      "SELECT * FROM licencaimportacao WHERE previsaoDeferimento = ? AND situacao = ? LIMIT 10",
      [yyyyMMdd, "analise"]
    );

    if (rows.length > 0) return rows;

    const [todas]: any = await pool.query(
      "SELECT * FROM licencaimportacao WHERE situacao = ? AND previsaoDeferimento IS NOT NULL",
      ["analise"]
    );

    if (!todas.length) return [];

    todas.forEach((row: any) => {
      row.dataParsed = new Date(row.previsaoDeferimento);
    });

    todas.sort(
      (a: any, b: any) =>
        Math.abs(a.dataParsed.getTime() - hoje.getTime()) -
        Math.abs(b.dataParsed.getTime() - hoje.getTime())
    );

    const maisProxima = todas[0].dataParsed.toISOString().split("T")[0];

    return todas.filter(
      (row: any) =>
        row.dataParsed.toISOString().split("T")[0] === maisProxima
    );
  } catch (error) {
    console.error("Erro ao buscar LIs deferidas hoje:", error);
    throw error;
  }
};


// Função para retornar a quantidade de Licenças de Importação feitas no mês atual
export const getQuantidadeLicencasImportacaoFeitasNoMes = async () => {
  try {
    const hoje = new Date();
    const mesAtual = (hoje.getMonth() + 1).toString().padStart(2, "0");
    const anoAtual = hoje.getFullYear();

    const [rows]: any = await pool.query("SELECT dataRegistroLI FROM licencaimportacao");

    const qtd = rows.filter((row: any) => {
      if (!row.dataRegistroLI) return false;
      const data = new Date(row.dataRegistroLI);
      return data.getFullYear() === anoAtual && data.getMonth() + 1 === parseInt(mesAtual);
    }).length;

    return qtd;
  } catch (error) {
    console.error("Erro ao buscar LIs no mês:", error);
    throw error;
  }
};

// Função para retornar a quantidade de Licenças de Importação em análise no mês atual
export const getQuantidadeLicencasImportacaoEmAnaliseNoMes = async () => {
  try {
    const hoje = new Date();
    const mesAtual = hoje.getMonth() + 1;
    const anoAtual = hoje.getFullYear();

    const [rows]: any = await pool.query(
      "SELECT previsaoDeferimento, situacao FROM licencaimportacao WHERE situacao = ?",
      ["analise"]
    );

    return rows.filter((row: any) => {
      if (!row.previsaoDeferimento) return false;
      const data = new Date(row.previsaoDeferimento);
      return data.getFullYear() === anoAtual && data.getMonth() + 1 === mesAtual;
    }).length;
  } catch (error) {
    console.error("Erro ao contar LIs em análise no mês:", error);
    throw error;
  }
};


// Função para retornar a quantidade de Licenças de Importação deferidas no mês atual
export const getQuantidadeLicencasImportacaoDeferidasNoMes = async () => {
  try {
    const hoje = new Date();
    const mesAtual = hoje.getMonth() + 1;
    const anoAtual = hoje.getFullYear();

    const [rows]: any = await pool.query(
      "SELECT previsaoDeferimento, situacao FROM licencaimportacao WHERE situacao = ?",
      ["deferida"]
    );

    return rows.filter((row: any) => {
      if (!row.previsaoDeferimento) return false;
      const data = new Date(row.previsaoDeferimento);
      return data.getFullYear() === anoAtual && data.getMonth() + 1 === mesAtual;
    }).length;
  } catch (error) {
    console.error("Erro ao contar LIs deferidas no mês:", error);
    throw error;
  }
};

// GET lista de IMPs com LIs deferindo hoje
export const getImpsComLIsDeferindoHoje = async () => {
  try {
    const hoje = new Date().toISOString().split("T")[0];

    const [rows]: any = await pool.query(
      "SELECT imp, importador FROM licencaimportacao WHERE previsaoDeferimento = ?",
      [hoje]
    );

    return rows;
  } catch (error) {
    console.error("Erro ao buscar IMPs deferindo hoje:", error);
    throw error;
  }
};
// CACHE QTD IMPs deferindo hoje

let cache = {
  data: null as number | null, // Armazena o resultado da requisição
  lastExecutionDate: null as string | null, // Armazena a data da última execução no formato "YYYY-MM-DD"
};

export const getQuantidadeImpsDeferindoHoje = async () => {
  try {
    const hoje = new Date();
    const yyyyMMdd = hoje.toISOString().split("T")[0];

    if (cache.lastExecutionDate === yyyyMMdd && cache.data !== null) {
      return cache.data;
    }

    const [rows]: any = await pool.query(
      "SELECT COUNT(*) as total FROM licencaimportacao WHERE previsaoDeferimento = ?",
      [yyyyMMdd]
    );

    const total = rows[0]?.total || 0;
    cache = { data: total, lastExecutionDate: yyyyMMdd };

    return total;
  } catch (error) {
    console.error("Erro ao contar IMPs deferindo hoje:", error);
    throw error;
  }
};