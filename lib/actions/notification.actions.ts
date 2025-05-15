"use server";

import { createAdminClient } from "@/lib/appwrite";
import { appwriteConfig } from "@/lib/appwrite/config";
import { ID, Query } from "node-appwrite";

// Cria uma nova notificação
export const createNotification = async (data: {
  text: string;
  imp?: string;
  importador?: string;
  lida?: boolean;
  userId: string; // Agora sempre exige o userId
}) => {
  try {
    const { databases } = await createAdminClient();

    const existingNotification = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.notificationsCollectionId,
      [
        Query.equal("text", data.text || ""),
        Query.equal("imp", data.imp || ""),
        Query.equal("importador", data.importador || ""),
        Query.equal("userId", data.userId),
        Query.equal("deleted", true),
      ]
    );

    if (existingNotification.documents.length > 0) {
      const notification = existingNotification.documents[0];
      const result = await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.notificationsCollectionId,
        notification.$id,
        { ...data, deleted: false, lida: data.lida ?? false }
      );
      return result;
    }

    const result = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.notificationsCollectionId,
      ID.unique(),
      { ...data, lida: data.lida ?? false, deleted: false }
    );

    return result;
  } catch (error) {
    console.error("Erro ao criar Notificação", error);
    throw error;
  }
};

// Atualiza uma notificação existente
export const updateNotification = async (
  id: string,
  data: {
    text?: string;
    imp?: string;
    importador?: string;
    lida?: boolean;
  }
) => {
  try {
    const { databases } = await createAdminClient();

    const result = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.notificationsCollectionId,
      id,
      data
    );

    return result;
  } catch (error) {
    console.error("Erro ao atualizar Notificação", error);
    throw error;
  }
};

// Retorna a lista de todas as notificações (excluindo as deletadas)
export const getNotifications = async (userId: string) => {
  try {
    const { databases } = await createAdminClient();

    const result = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.notificationsCollectionId,
      [
        Query.equal("deleted", false),
        Query.equal("userId", userId),
        Query.limit(20),
      ]
    );

    return result.documents;
  } catch (error) {
    console.error("Erro ao listar Notificações", error);
    throw error;
  }
};

// Marca uma notificação como excluída
export const deleteNotification = async (id: string) => {
  try {
    const { databases } = await createAdminClient();

    const result = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.notificationsCollectionId,
      id,
      { deleted: true }
    );

    return result;
  } catch (error) {
    console.error("Erro ao excluir Notificação", error);
    throw error;
  }
};

// Marca todas as notificações como lidas
export const markAllNotificationsAsRead = async (userId: string) => {
  try {
    const notifications = await getNotifications(userId);

    const { databases } = await createAdminClient();
    const updatePromises = notifications.map((notification) =>
      databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.notificationsCollectionId,
        notification.$id,
        { lida: true }
      )
    );

    await Promise.all(updatePromises);
    return { success: true };
  } catch (error) {
    console.error("Erro ao marcar todas as notificações como lidas:", error);
    throw error;
  }
};

// Retorna a quantidade de notificações não lidas
export const getUnreadNotificationsCount = async (userId: string) => {
  try {
    const { databases } = await createAdminClient();

    const result = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.notificationsCollectionId,
      [
        Query.equal("userId", userId),
        Query.equal("lida", false),
        Query.equal("deleted", false),
      ]
    );

    return result.total;
  } catch (error) {
    console.error("Erro ao buscar notificações não lidas:", error);
    throw error;
  }
};

// Retorna o timestamp mais recente de atualização das notificações
export const getBackendLastUpdated = async (userId: string) => {
  try {
    const { databases } = await createAdminClient();

    const result = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.notificationsCollectionId,
      [
        Query.equal("userId", userId),
        Query.equal("deleted", false),
        Query.orderDesc("$updatedAt"),
        Query.limit(1),
      ]
    );

    if (result.documents.length > 0) {
      return result.documents[0].$updatedAt;
    } else {
      return null;
    }
  } catch (error) {
    console.error(
      "Erro ao buscar o timestamp mais recente de notificações:",
      error
    );
    throw error;
  }
};

// Marca notificações em lote como lidas
export const markAllNotificationsAsReadBatch = async (ids: string[]) => {
  try {
    const { databases } = await createAdminClient();

    const updatePromises = ids.map((id) =>
      databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.notificationsCollectionId,
        id,
        { lida: true }
      )
    );

    await Promise.all(updatePromises);

    return { success: true, updatedCount: ids.length };
  } catch (error) {
    console.error("Erro ao marcar notificações como lidas em lote:", error);
    throw error;
  }
};
