"use server";

import { createAdminClient, createSessionClient } from "@/lib/appwrite";
import { appwriteConfig } from "@/lib/appwrite/config";
import { Query, ID } from "node-appwrite";
import { parseStringify } from "@/lib/utils";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { pool } from "../database/db";
import bcrypt from "bcryptjs";


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
  password,
}: {
  fullName: string;
  email: string;
  password: string;
}) => {
  try {
    // Verifica se já existe um usuário com esse e-mail
    const [existing]: any = await pool.query("SELECT id FROM usuarios WHERE email = ?", [email]);

    if (existing.length > 0) {
      return { success: false, message: "E-mail já está em uso" };
    }

    // Cria hash da senha
    const senhaHash = await bcrypt.hash(password, 10);

    // Define avatar padrão
    const avatar = "https://hwchamber.co.uk/wp-content/uploads/2022/04/avatar-placeholder.gif";

    // Insere no banco
    const [result]: any = await pool.query(
      "INSERT INTO usuarios (nome, email, senha_hash, avatar) VALUES (?, ?, ?, ?)",
      [fullName, email, senhaHash, avatar]
    );

    return {
      success: true,
      user: {
        id: result.insertId,
        nome: fullName,
        email,
        avatar,
      },
    };
  } catch (error) {
    console.error("Erro ao criar conta:", error);
    return { success: false, message: "Erro interno ao criar conta" };
  }
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
    const cookieStore = cookies();
    const userId = (await cookieStore).get("usuario_id")?.value;

    if (!userId) return null;

    const [rows]: any = await pool.query("SELECT * FROM usuarios WHERE id = ?", [userId]);

    if (rows.length === 0) return null;

    const user = rows[0];

    return {
      id: user.id,
      nome: user.nome,
      email: user.email,
      avatar: user.avatar,
    };
  } catch (error) {
    console.error("Erro ao buscar usuário autenticado:", error);
    return null;
  }
};

// Realiza o logout do usuário, removendo a sessão e o cookie correspondente
export const signOutUser = async () => {
  try {
    (await cookies()).delete("usuario_id");
  } catch (error) {
    console.error("Erro ao sair:", error);
  } finally {
    redirect("/sign-in"); // Redireciona para a página de login
  }
};

// Realiza o login do usuário com autenticação via OTP
export const signInUser = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  try {
    const [rows]: any = await pool.query("SELECT * FROM usuarios WHERE email = ?", [email]);

    if (rows.length === 0) {
      return { success: false, message: "Usuário não encontrado" };
    }

    const usuario = rows[0];
    const isMatch = await bcrypt.compare(password, usuario.senha_hash);

    if (!isMatch) {
      return { success: false, message: "Senha incorreta" };
    }

    // Cria um cookie com o ID do usuário
    (await
      
      cookies()).set("usuario_id", String(usuario.id), {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: true,
      maxAge: 60 * 60 * 24 * 30, // 30 dias
    });

    return {
      success: true,
      user: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        avatar: usuario.avatar,
      },
    };
  } catch (error) {
    console.error("Erro no login:", error);
    return { success: false, message: "Erro no servidor" };
  }
};

// Deletando usarios
export const deleteUser = async (userId: number) => {
  try {
    await pool.query("DELETE FROM usuarios WHERE id = ?", [userId]);
    return { success: true };
  } catch (error) {
    console.error("Erro ao deletar usuário:", error);
    return { success: false, message: "Erro ao deletar usuário" };
  }
};


// Retornando todos os usarios
export const getAllUsers = async () => {
  try {
    const [rows]: any = await pool.query("SELECT id, nome, email, avatar FROM usuarios");

    return rows.map((row: any) => ({
      id: row.id,
      name: row.nome,
      email: row.email,
      avatarUrl: row.avatar,
    }));
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    return [];
  }
};


// atualizando usuarios
export const updateUser = async ({
  userId,
  fullName,
  email,
  avatar,
}: {
  userId: number;
  fullName: string;
  email: string;
  avatar: string;
}) => {
  try {
    await pool.query(
      "UPDATE usuarios SET nome = ?, email = ?, avatar = ? WHERE id = ?",
      [fullName, email, avatar, userId]
    );

    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    return { success: false, message: "Erro ao atualizar usuário" };
  }
};

// Obtém o ID da conta do usuário autenticado
export const getAccountId = async () => {
  try {
    const cookieStore = cookies();
    const userId = (await cookieStore).get("usuario_id")?.value;

    if (!userId) return null;

    return parseInt(userId); 
  } catch (error) {
    console.error("Failed to get accountId", error);
    return null;
  }
};