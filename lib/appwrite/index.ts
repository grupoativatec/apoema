"use server";

import { Account, Avatars, Client, Databases, Storage } from "node-appwrite";
import { appwriteConfig } from "@/lib/appwrite/config";
import { cookies } from "next/headers";

// Função para criar um cliente autenticado pelo cookie da sessão
export const createSessionClient = async () => {
  const client = new Client()
    .setEndpoint(appwriteConfig.endpoint) // Define o endpoint do Appwrite
    .setProject(appwriteConfig.projectId); // Define o ID do projeto

  const session = (await cookies()).get("appwrite-session"); // Obtém o cookie da sessão do Appwrite

  if (!session || !session.value) throw new Error("No session");

  client.setSession(session.value); // Define a sessão no cliente do Appwrite

  return {
    get account() {
      return new Account(client); // Retorna uma instância da API de contas do Appwrite
    },
    get databases() {
      return new Databases(client); // Retorna uma instância da API de bancos de dados do Appwrite
    },
  };
};

// Função para criar um cliente de administração com a secret key
export const createAdminClient = async () => {
  const client = new Client()
    .setEndpoint(appwriteConfig.endpoint) // Define o endpoint do Appwrite
    .setProject(appwriteConfig.projectId) // Define o ID do projeto
    .setKey(appwriteConfig.secretKey); // Define a chave secreta de administrador

  return {
    get account() {
      return new Account(client); // Retorna uma instância da API de contas do Appwrite
    },
    get databases() {
      return new Databases(client); // Retorna uma instância da API de bancos de dados do Appwrite
    },
    get storage() {
      return new Storage(client); // Retorna uma instância da API de armazenamento do Appwrite
    },
    get avatars() {
      return new Avatars(client); // Retorna uma instância da API de avatares do Appwrite
    },
  };
};
