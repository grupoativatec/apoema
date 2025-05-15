"use server";

import { pool } from "../database/db";

// Cria um novo certificado
export const createCertification = async (data: {
  referencia: string;
  nomeComercial: string;
  validade: Date;
  manutencaoData: Date;
  manutencaoEmAndamento: boolean;
  certificado: string;
}) => {
  const query = `
    INSERT INTO certificacoes
    (referencia, nomeComercial, validade, manutencaoData, manutencaoEmAndamento, certificado)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  const values = [
    data.referencia,
    data.nomeComercial,
    data.validade,
    data.manutencaoData,
    data.manutencaoEmAndamento,
    data.certificado,
  ];

  await pool.execute(query, values);
};



// Atualiza um certificado existente
export const updateCertification = async (
  id: string,
  data: {
    referencia: string;
    nomeComercial: string;
    validade: Date;
    manutencaoData: Date;
    manutencaoEmAndamento: boolean;
    certificado: string;
  }
) => {
  const query = `
    UPDATE certificacoes
    SET referencia = ?, nomeComercial = ?, validade = ?, manutencaoData = ?, manutencaoEmAndamento = ?, certificado = ?
    WHERE id = ?
  `;
  const values = [
    data.referencia,
    data.nomeComercial,
    data.validade,
    data.manutencaoData,
    data.manutencaoEmAndamento,
    data.certificado,
    id,
  ];
  await pool.execute(query, values);
};

// Lista todos os certificados
export const getCertifications = async (): Promise<any[]> => {
  const [rows]: [any[], any] = await pool.query("SELECT * FROM certificacoes LIMIT 7000");
  return rows;
};


// Deleta um certificado
export const deleteCertification = async (id: string) => {
  await pool.execute("DELETE FROM certificacoes WHERE id = ?", [id]);
};

// Retorna os certificados com validade igual a hoje ou mais próxima
export const getCertificationsValidToday = async () => {
  const [rows] = await pool.query<any[]>("SELECT * FROM certificacoes");

  const hoje = new Date();
  const sameDay = (d1: Date, d2: Date) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  const comValidadeHoje = rows.filter((row: any) => {
    const validade = new Date(row.validade);
    return sameDay(validade, hoje);
  });

  if (comValidadeHoje.length > 0) return comValidadeHoje;

  const ordenados = rows
    .filter((row: any) => row.validade)
    .map((row: any) => ({
      ...row,
      validadeDate: new Date(row.validade),
    }))
    .sort(
      (a: any, b: any) =>
        Math.abs(a.validadeDate.getTime() - hoje.getTime()) -
        Math.abs(b.validadeDate.getTime() - hoje.getTime())
    );

  if (ordenados.length === 0) return [];

  const dataMaisProxima = ordenados[0].validadeDate;
  const proximos = ordenados.filter((row: any) =>
    sameDay(new Date(row.validade), dataMaisProxima)
  );

  return proximos;
};

// Quantidade de certificados criados no mês atual (baseado em validade)
export const getCertificationsCreatedThisMonth = async () => {
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = hoje.getMonth() + 1;

  const query = `
    SELECT COUNT(*) as total FROM certificacoes
    WHERE YEAR(validade) = ? AND MONTH(validade) = ?
  `;

  const [rows]: any = await pool.execute(query, [ano, mes]);
  return rows[0].total;
};
