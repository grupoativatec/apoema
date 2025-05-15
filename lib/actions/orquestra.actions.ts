/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use server";

import { createAdminClient } from "@/lib/appwrite";
import { appwriteConfig } from "@/lib/appwrite/config";
import { ID, Query } from "node-appwrite";

// Função para criar um documento na tabela "orquestra"
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
}) => {
  try {
    const { databases } = await createAdminClient();

    // Verificar se a orquestra já existe
    const existingOrquestras = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.orquestraCollectionId,
      [Query.equal("imp", data.imp), Query.limit(1)]
    );

    // Se a orquestra já existir, retorne-a sem criar uma nova
    if (existingOrquestras.total > 0) {
      return existingOrquestras.documents[0]; // Retorne o documento existente
    }

    // Caso contrário, crie uma nova orquestra
    const result = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.orquestraCollectionId,
      ID.unique(),
      data
    );

    return result;
  } catch (error) {
    console.error("Erro ao criar Orquestra", error);
    throw error;
  }
};

// Função para atualizar um documento na tabela "orquestra"
export const updateOrquestra = async (
  id: string,
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
  }
) => {
  try {
    const { databases } = await createAdminClient();

    const result = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.orquestraCollectionId,
      id,
      data
    );

    return result;
  } catch (error) {
    console.error("Erro ao atualizar Orquestra", error);
    throw error;
  }
};

// Função para listar todos os documentos da tabela "orquestra"
export const getOrquestras = async () => {
  try {
    const { databases } = await createAdminClient();

    const result = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.orquestraCollectionId,
      [Query.limit(7000)]
    );

    return result.documents;
  } catch (error) {
    console.error("Erro ao listar Orquestras", error);
    throw error;
  }
};

// Função para excluir um documento da tabela "orquestra"
export const deleteOrquestra = async (id: string) => {
  try {
    const { databases } = await createAdminClient();

    const result = await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.orquestraCollectionId,
      id
    );

    return result;
  } catch (error) {
    console.error("Erro ao excluir Orquestra", error);
    throw error;
  }
};

// Função para retornar as orquestras que foram recebidas hoje
export const getOrquestrasRecebidasHoje = async () => {
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
      appwriteConfig.orquestraCollectionId,
      [Query.equal("recebimento", dataDeHoje), Query.limit(10)]
    );

    if (result.total > 0) {
      return result.documents.map((doc) => ({
        imp: doc.imp,
        referencia: doc.referencia,
        exportador: doc.exportador,
        importador: doc.importador,
        recebimento: doc.recebimento,
        chegada: doc.chegada,
        destino: doc.destino,
      }));
    }

    return [];
  } catch (error) {
    console.error("Erro ao buscar Orquestras recebidas hoje:", error);
    throw error;
  }
};

// Função para retornar a quantidade de orquestras no mês atual
export const getQuantidadeOrquestrasNoMes = async () => {
  try {
    const { databases } = await createAdminClient();

    const hoje = new Date();
    const anoAtual = hoje.getFullYear();
    const mesAtual = hoje.getMonth() + 1;

    const result = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.orquestraCollectionId,
      [Query.limit(7000)]
    );

    const orquestrasNoMes = result.documents.filter((doc) => {
      const dataRecebimento = doc.recebimento;
      const [dia, mes, ano] = dataRecebimento.split("/").map(Number);

      return ano === anoAtual && mes === mesAtual;
    });

    return orquestrasNoMes.length;
  } catch (error) {
    console.error("Erro ao buscar Orquestras no mês:", error);
    throw error;
  }
};

// Função para retornar a quantidade de orquestras com um destino específico
export const getQuantidadeOrquestrasPorDestino = async (destino: string) => {
  try {
    const { databases } = await createAdminClient();

    const result = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.orquestraCollectionId,
      [Query.equal("destino", destino), Query.limit(7000)]
    );

    return result.total;
  } catch (error) {
    console.error("Erro ao buscar Orquestras por destino:", error);
    throw error;
  }
};

// Função para atualizar o status de uma orquestra pelo campo "imp"
export const updateOrquestraStatus = async (
  imp: string,
  novoStatus: string
) => {
  try {
    const { databases } = await createAdminClient();

    // Buscar o documento da orquestra pelo campo "imp"
    const orquestras = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.orquestraCollectionId,
      [Query.equal("imp", imp), Query.limit(1)]
    );

    if (orquestras.total === 0) {
      throw new Error(`Orquestra com imp "${imp}" não encontrada.`);
    }

    const docId = orquestras.documents[0].$id;

    // Atualizar somente o status
    const result = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.orquestraCollectionId,
      docId,
      { status: novoStatus }
    );

    return result;
  } catch (error) {
    console.error("Erro ao atualizar status da Orquestra:", error);
    throw error;
  }
};

// Função para atualizar a observação ("obs") de uma orquestra pelo campo "imp"
export const updateOrquestraObs = async (imp: string, obs: string) => {
  try {
    const { databases } = await createAdminClient();

    // 1) Busca o documento da orquestra pelo campo "imp"
    const orquestras = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.orquestraCollectionId,
      [Query.equal("imp", imp), Query.limit(1)]
    );

    if (orquestras.total === 0) {
      throw new Error(`Orquestra com imp "${imp}" não encontrada.`);
    }

    const docId = orquestras.documents[0].$id;

    // 2) Atualiza apenas o campo "obs"
    const result = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.orquestraCollectionId,
      docId,
      { obs }
    );

    return result;
  } catch (error) {
    console.error("Erro ao atualizar observação da Orquestra:", error);
    throw error;
  }
};

// Função para retornar todas as orquestras cujo status esteja como "finalizado"
export const getOrquestrasFinalizadas = async () => {
  try {
    const { databases } = await createAdminClient();

    const result = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.orquestraCollectionId,
      [
        Query.equal("status", "Finalizado"),
        Query.limit(7000), // ajusta conforme o volume esperado
      ]
    );

    // Retorna todos os campos de cada documento
    return result.documents;
  } catch (error) {
    console.error("Erro ao buscar Orquestras finalizadas:", error);
    throw error;
  }
};
