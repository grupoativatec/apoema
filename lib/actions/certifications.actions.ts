/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use server";

import { createAdminClient } from "@/lib/appwrite";
import { appwriteConfig } from "@/lib/appwrite/config";
import { ID, Query } from "node-appwrite";

// Cria um novo certificado
export const createCertification = async (data: {
  referencia: string;
  nomeComercial: string;
  validade: string;
  manutencaoData: string;
  manutencaoEmAndamento: boolean;
  certificado: string;
}) => {
  try {
    const { databases } = await createAdminClient();

    const result = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.certificationsCollectionId,
      ID.unique(),
      data
    );

    return result;
  } catch (error) {
    console.error("Erro ao criar Certificado", error);
    throw error;
  }
};

// Atualiza um Certificado existente
export const updateCertification = async (
  id: string,
  data: {
    referencia: string;
    nomeComercial: string;
    validade: string;
    manutencaoData: string;
    manutencaoEmAndamento: boolean;
    certificado: string;
  }
) => {
  try {
    const { databases } = await createAdminClient();

    const result = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.certificationsCollectionId,
      id,
      data
    );

    return result;
  } catch (error) {
    console.error("Erro ao atualizar Certificado", error);
    throw error;
  }
};

// Retorna a lista de todos os Certificados
export const getCertifications = async () => {
  try {
    const { databases } = await createAdminClient();

    const result = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.certificationsCollectionId,
      [Query.limit(7000)]
    );

    return result.documents;
  } catch (error) {
    console.error("Erro ao listar Certificados", error);
    throw error;
  }
};

// Exclui um Certificado com base no ID
export const deleteCertification = async (id: string) => {
  try {
    const { databases } = await createAdminClient();

    const result = await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.certificationsCollectionId,
      id
    );

    return result;
  } catch (error) {
    console.error("Erro ao excluir Certificado", error);
    throw error;
  }
};

// Retorna os Certificados com validade igual ao dia atual ou mais próxima
export const getCertificationsValidToday = async () => {
  try {
    const { databases } = await createAdminClient();

    const formatarData = (data: Date) => {
      return `${data.getDate().toString().padStart(2, "0")}/${(
        data.getMonth() + 1
      )
        .toString()
        .padStart(2, "0")}/${data.getFullYear()}`;
    };

    const hoje = new Date();
    const dataDeHoje = formatarData(hoje);

    const result = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.certificationsCollectionId,
      [Query.equal("validade", dataDeHoje), Query.limit(10)]
    );

    if (result.total > 0) {
      return result.documents.map((doc) => ({
        referencia: doc.referencia,
        nomeComercial: doc.nomeComercial,
        validade: doc.validade,
        manutencaoEmAndamento: doc.manutencaoEmAndamento,
        certificado: doc.certificado,
      }));
    }

    const todos = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.certificationsCollectionId,
      [Query.limit(1000)]
    );

    const documentosOrdenados = todos.documents
      .filter((doc) => !!doc.validade)
      .map((doc) => {
        const cert = doc as unknown as {
          validade: string;
          referencia: string;
          nomeComercial: string;
          manutencaoEmAndamento: boolean;
          certificado: string;
        };
        return {
          ...cert,
          dataParsed: new Date(cert.validade.split("/").reverse().join("-")),
        };
      })
      .sort(
        (a, b) =>
          Math.abs(a.dataParsed.getTime() - hoje.getTime()) -
          Math.abs(b.dataParsed.getTime() - hoje.getTime())
      );

    if (documentosOrdenados.length === 0) return [];

    const dataMaisProxima = formatarData(documentosOrdenados[0].dataParsed);

    const proximos = documentosOrdenados.filter(
      (doc) => formatarData(doc.dataParsed) === dataMaisProxima
    );

    return proximos.map((doc) => ({
      referencia: doc.referencia,
      nomeComercial: doc.nomeComercial,
      validade: doc.validade,
      manutencaoEmAndamento: doc.manutencaoEmAndamento,
      certificado: doc.certificado,
    }));
  } catch (error) {
    console.error(
      "Erro ao buscar Certificados com validade mais próxima de hoje:",
      error
    );
    throw error;
  }
};

// Retorna a quantidade de Certificados criados no mês atual
export const getCertificationsCreatedThisMonth = async () => {
  try {
    const { databases } = await createAdminClient();

    const hoje = new Date();
    const anoAtual = hoje.getFullYear();
    const mesAtual = hoje.getMonth() + 1;

    const result = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.certificationsCollectionId,
      [Query.limit(7000)]
    );

    const certificationsNoMes = result.documents.filter((doc) => {
      const validade = doc.validade;
      const [dia, mes, ano] = validade.split("/").map(Number);

      return ano === anoAtual && mes === mesAtual;
    });

    return certificationsNoMes.length;
  } catch (error) {
    console.error("Erro ao buscar Certificados criados no mês:", error);
    throw error;
  }
};
