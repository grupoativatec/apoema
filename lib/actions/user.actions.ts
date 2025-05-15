"use server";

import { createAdminClient, createSessionClient } from "@/lib/appwrite";
import { appwriteConfig } from "@/lib/appwrite/config";
import { Query, ID } from "node-appwrite";
import { parseStringify } from "@/lib/utils";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// Função que busca um usuário pelo e-mail na base de dados do Appwrite
const getUserByEmail = async (email: string) => {
  const { databases } = await createAdminClient();

  // Consulta a coleção de usuários filtrando pelo e-mail informado
  const result = await databases.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.userCollectionId,
    [Query.equal("email", [email])]
  );

  // Retorna o primeiro usuário encontrado ou null se não houver correspondência
  return result.total > 0 ? result.documents[0] : null;
};

// Função auxiliar para tratar erros, registrando no console e lançando a exceção
const handleError = (error: unknown, message: string) => {
  console.log(error, message);
  throw error;
};

// Envia um código OTP  por e-mail para autenticação
export const sendEmailOTP = async ({ email }: { email: string }) => {
  const { account } = await createAdminClient();

  try {
    // Cria um token de e-mail único para autenticação via Appwrite
    const session = await account.createEmailToken(ID.unique(), email);

    return session.userId; // Retorna o ID do usuário vinculado ao token
  } catch (error) {
    handleError(error, "Failed to send email OTP");
  }
};

// Criação de conta no sistema, verificando se já existe um usuário com o e-mail informado
export const createAccount = async ({
  fullName,
  email,
}: {
  fullName: string;
  email: string;
}) => {
  // Verifica se já existe um usuário com o e-mail fornecido
  const existingUser = await getUserByEmail(email);

  // Envia um OTP e obtém um ID de conta associado
  const accountId = await sendEmailOTP({ email });
  if (!accountId) throw new Error("Failed to send an OTP");

  // Se o usuário ainda não existir, cria um novo registro na base de dados
  if (!existingUser) {
    const { databases } = await createAdminClient();

    await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      ID.unique(),
      {
        fullName,
        email,
        avatar:
          "https://hwchamber.co.uk/wp-content/uploads/2022/04/avatar-placeholder.gif",
        accountId,
      }
    );
  }

  // Retorna os dados da conta em formato JSON serializado
  return parseStringify({ accountId });
};

// Verifica as credenciais do usuário e cria uma sessão autenticada
export const verifySecret = async ({
  accountId,
  password,
}: {
  accountId: string;
  password: string;
}) => {
  try {
    const { account } = await createAdminClient();

    // Cria uma sessão de autenticação com as credenciais fornecidas
    const session = await account.createSession(accountId, password);

    // Define a validade do cookie para 30 dias
    const oneMonthInSeconds = 30 * 24 * 60 * 60;

    // Armazena o segredo da sessão nos cookies com validade de 1 mês
    (await cookies()).set("appwrite-session", session.secret, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: true,
      maxAge: oneMonthInSeconds, // Duração claramente definida para 1 mês
    });

    // Retorna o ID da sessão criada
    return parseStringify({ sessionId: session.$id });
  } catch (error) {
    handleError(error, "Failed to verify OTP");
  }
};

// Obtém os dados do usuário atualmente autenticado
export const getCurrentUser = async () => {
  try {
    const { databases, account } = await createSessionClient();

    // Obtém os detalhes da conta autenticada
    const result = await account.get();

    // Busca na base de dados um usuário vinculado ao ID da conta autenticada
    const user = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [Query.equal("accountId", result.$id)]
    );

    // Se o usuário não for encontrado, retorna null
    if (user.total <= 0) return null;

    return parseStringify(user.documents[0]); // Retorna os dados do usuário
  } catch (error) {
    console.log(error);
  }
};

// Realiza o logout do usuário, removendo a sessão e o cookie correspondente
export const signOutUser = async () => {
  const { account } = await createSessionClient();

  try {
    await account.deleteSession("current"); // Deleta a sessão atual
    (await cookies()).delete("appwrite-session"); // Remove o cookie de autenticação
  } catch (error) {
    handleError(error, "Failed to sign out user");
  } finally {
    redirect("/sign-in"); // Redireciona para a página de login após o logout
  }
};

// Realiza o login do usuário com autenticação via OTP
export const signInUser = async ({ email }: { email: string }) => {
  try {
    // Verifica se o usuário já existe no banco de dados
    const existingUser = await getUserByEmail(email);

    // Se o usuário não for encontrado, retorna um erro informando que o usuário não existe
    if (!existingUser) {
      return parseStringify({ accountId: null, error: "User not found" });
    }

    // Se o usuário existir, envia o OTP e retorna o accountId
    await sendEmailOTP({ email });

    return parseStringify({ accountId: existingUser.accountId });
  } catch (error) {
    handleError(error, "Failed to sign in user");
  }
};

export const deleteUser = async (userId: string) => {
  try {
    const { databases } = await createAdminClient();

    await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      userId
    );

    return { success: true };
  } catch (error) {
    handleError(error, "Erro ao deletar usuário");
  }
};

export const getAllUsers = async () => {
  const { databases } = await createAdminClient();

  const result = await databases.listDocuments(
    appwriteConfig.databaseId,
    appwriteConfig.userCollectionId
  );

  return result.documents.map((doc) => ({
    id: doc.$id,
    name: doc.fullName,
    email: doc.email,
    avatarUrl: doc.avatar,
  }));
};

export const updateUser = async ({
  userId,
  fullName,
  email,
  avatar,
}: {
  userId: string;
  fullName: string;
  email: string;
  avatar: string;
}) => {
  try {
    const { databases } = await createAdminClient();

    await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      userId,
      {
        fullName,
        email,
        avatar,
      }
    );

    return { success: true };
  } catch (error) {
    handleError(error, "Erro ao atualizar usuário");
  }
};

// Obtém o ID da conta do usuário autenticado
export const getAccountId = async () => {
  try {
    const { account } = await createSessionClient();
    const session = await account.get();

    return session.$id;
  } catch (error) {
    console.error("Failed to get accountId", error);
    return null;
  }
};
