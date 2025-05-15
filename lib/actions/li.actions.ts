/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use server";

import { createAdminClient } from "@/lib/appwrite";
import { appwriteConfig } from "@/lib/appwrite/config";
import { ID, Query } from "node-appwrite";
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
    const { databases } = await createAdminClient();

    const result = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.licencaImportacaoCollectionId,
      ID.unique(),
      data
    );

    return result;
  } catch (error) {
    console.error("Erro ao criar Licença de Importação", error);
    throw error;
  }
};

// Atualiza uma Licença de Importação existente no banco de dados
export const updateLicencaImportacao = async (
  id: string,
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
    const { databases } = await createAdminClient();

    // Atualiza um documento existente usando o ID da Licença de Importação
    const result = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.licencaImportacaoCollectionId,
      id, // ID do documento a ser atualizado
      data // Novos dados a serem salvos
    );

    return result; // Retorna o documento atualizado
  } catch (error) {
    console.error("Erro ao atualizar Licença de Importação", error);
    throw error;
  }
};

// Retorna a lista de todas as Licenças de Importação
export const getLicencasImportacao = async () => {
  try {
    const { databases } = await createAdminClient();

    const result = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.licencaImportacaoCollectionId,
      [Query.limit(7000)]
    );

    return result.documents;
  } catch (error) {
    console.error("Erro ao listar Licenças de Importação", error);
    throw error;
  }
};

// Exclui uma Licença de Importação com base no ID
export const deleteLicencaImportacao = async (id: string) => {
  try {
    const { databases } = await createAdminClient();

    const result = await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.licencaImportacaoCollectionId,
      id
    );

    return result;
  } catch (error) {
    console.error("Erro ao excluir Licença de Importação", error);
    throw error;
  }
};

// Defina uma interface para os documentos
interface LicencaImportacao {
  imp: string;
  importador: string;
  numeroLi: string;
  situacao: string;
  previsaoDeferimento: string;
  // Adicione outras propriedades que você espera
}

// Função para retornar Licenças de Importação com data de deferimento igual ao dia atual
// ou a mais próxima do dia atual
// Se não houver nenhuma, retorna uma lista vazia
export const getLicencasImportacaoDeferidasHoje = async () => {
  try {
    const { databases } = await createAdminClient();

    // Função para formatar a data como DD/MM/YYYY
    const formatarData = (data: Date) => {
      return `${data.getDate().toString().padStart(2, "0")}/${(
        data.getMonth() + 1
      )
        .toString()
        .padStart(2, "0")}/${data.getFullYear()}`;
    };

    const hoje = new Date();
    const dataDeHoje = formatarData(hoje);

    // Primeiro, tenta buscar os documentos com a data de hoje e situação "em análise"
    const result = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.licencaImportacaoCollectionId,
      [
        Query.equal("previsaoDeferimento", dataDeHoje),
        Query.equal("situacao", "em análise"),
        Query.limit(10),
      ]
    );

    // Se encontrou documentos, retorna
    if (result.total > 0) {
      return result.documents.map((doc) => ({
        imp: doc.imp,
        importador: doc.importador,
        numeroLi: doc.numeroLi,
        situacao: doc.situacao,
        previsaoDeferimento: doc.previsaoDeferimento,
      }));
    }

    // Caso contrário, busca todos, ordena pela data e pega a mais próxima
    const todos = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.licencaImportacaoCollectionId,
      [Query.equal("situacao", "em análise"), Query.limit(1000)]
    );

    const documentosOrdenados = todos.documents
      .filter((doc) => !!doc.previsaoDeferimento)
      .map((doc) => {
        const licenca = doc as unknown as LicencaImportacao;
        return {
          ...licenca,
          dataParsed: new Date(
            licenca.previsaoDeferimento.split("/").reverse().join("-")
          ),
        };
      })
      .sort(
        (a, b) =>
          Math.abs(a.dataParsed.getTime() - hoje.getTime()) -
          Math.abs(b.dataParsed.getTime() - hoje.getTime())
      );

    if (documentosOrdenados.length === 0) return [];

    // Pega todos os documentos que têm a mesma data mais próxima encontrada
    const dataMaisProxima = formatarData(documentosOrdenados[0].dataParsed);

    const proximos = documentosOrdenados.filter(
      (doc) => formatarData(doc.dataParsed) === dataMaisProxima
    );

    return proximos.map((doc) => ({
      imp: doc.imp,
      importador: doc.importador,
      numeroLi: doc.numeroLi,
      situacao: doc.situacao,
      previsaoDeferimento: doc.previsaoDeferimento,
    }));
  } catch (error) {
    console.error(
      "Erro ao buscar Licenças de Importação com data de deferimento mais próxima de hoje e situação 'em análise':",
      error
    );
    throw error;
  }
};

// Função para retornar a quantidade de Licenças de Importação feitas no mês atual
export const getQuantidadeLicencasImportacaoFeitasNoMes = async () => {
  try {
    const { databases } = await createAdminClient();

    const hoje = new Date();
    const anoAtual = hoje.getFullYear();
    const mesAtual = hoje.getMonth() + 1;

    const result = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.licencaImportacaoCollectionId,
      [Query.limit(7000)]
    );

    const licencasNoMes = result.documents.filter((doc) => {
      const dataRegistro = doc.dataRegistroLI;
      const [dia, mes, ano] = dataRegistro.split("/").map(Number);

      return ano === anoAtual && mes === mesAtual;
    });

    return licencasNoMes.length;
  } catch (error) {
    console.error(
      "Erro ao buscar Licenças de Importação feitas no mês:",
      error
    );
    throw error;
  }
};

// Função para retornar a quantidade de Licenças de Importação em análise no mês atual
export const getQuantidadeLicencasImportacaoEmAnaliseNoMes = async () => {
  const removerAcentos = (str: string) => {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  };

  try {
    const { databases } = await createAdminClient();

    const hoje = new Date();
    const anoAtual = hoje.getFullYear();
    const mesAtual = hoje.getMonth() + 1;

    const result = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.licencaImportacaoCollectionId,
      [Query.limit(7000)]
    );

    const licencasEmAnaliseNoMes = result.documents.filter((doc) => {
      const dataPrevisaoDeferimento = doc.previsaoDeferimento;
      const situacao = doc.situacao ? doc.situacao.trim() : "";
      if (!dataPrevisaoDeferimento || !situacao) return false;

      const [dia, mes, ano] = dataPrevisaoDeferimento.split("/").map(Number);

      return (
        removerAcentos(situacao.toLowerCase()) === "em analise" &&
        ano === anoAtual &&
        mes === mesAtual
      );
    });

    return licencasEmAnaliseNoMes.length;
  } catch (error) {
    console.error(
      "Erro ao buscar Licenças de Importação em análise no mês:",
      error
    );
    throw error;
  }
};

// Função para retornar a quantidade de Licenças de Importação deferidas no mês atual
export const getQuantidadeLicencasImportacaoDeferidasNoMes = async () => {
  const removerAcentos = (str: string) => {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  };

  try {
    const { databases } = await createAdminClient();

    const hoje = new Date();
    const anoAtual = hoje.getFullYear();
    const mesAtual = hoje.getMonth() + 1;

    const result = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.licencaImportacaoCollectionId,
      [Query.limit(7000)]
    );

    const licencasDeferidasNoMes = result.documents.filter((doc) => {
      const dataPrevisaoDeferimento = doc.previsaoDeferimento;
      const situacao = doc.situacao ? doc.situacao.trim() : "";
      if (!dataPrevisaoDeferimento || !situacao) return false;

      const [dia, mes, ano] = dataPrevisaoDeferimento.split("/").map(Number);

      return (
        removerAcentos(situacao.toLowerCase()) === "deferida" &&
        ano === anoAtual &&
        mes === mesAtual
      );
    });

    return licencasDeferidasNoMes.length;
  } catch (error) {
    console.error(
      "Erro ao buscar Licenças de Importação deferidas no mês:",
      error
    );
    throw error;
  }
};

export const getImpsComLIsDeferindoHoje = async () => {
  try {
    const { databases } = await createAdminClient();

    const formatarData = (data: Date) => {
      return `${data.getDate().toString().padStart(2, "0")}/${(
        data.getMonth() + 1
      )
        .toString()
        .padStart(2, "0")}/${data.getFullYear()}`;
    };

    const hoje = new Date(); // Use a data atual dinamicamente

    const dataDeHoje = formatarData(hoje);

    const result = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.licencaImportacaoCollectionId,
      [Query.equal("previsaoDeferimento", dataDeHoje), Query.limit(70)]
    );

    if (result.total > 0) {
      const impsComLIsDeferindoHoje = result.documents.map((doc) => ({
        imp: doc.imp,
        importador: doc.importador,
      }));

      return impsComLIsDeferindoHoje;
    }

    return [];
  } catch (error) {
    console.error("Erro ao buscar imps com LIs deferindo hoje:", error);
    throw error;
  }
};

let cache = {
  data: null as number | null, // Armazena o resultado da requisição
  lastExecutionDate: null as string | null, // Armazena a data da última execução no formato "YYYY-MM-DD"
};

export const getQuantidadeImpsDeferindoHoje = async () => {
  try {
    const { databases } = await createAdminClient();

    const formatarData = (data: Date): string => {
      return `${data.getFullYear()}-${(data.getMonth() + 1)
        .toString()
        .padStart(2, "0")}-${data.getDate().toString().padStart(2, "0")}`;
    };

    const hoje = new Date();
    const dataDeHoje = formatarData(hoje);

    // Verifica se já temos o cache para a data de hoje
    if (cache.lastExecutionDate === dataDeHoje && cache.data !== null) {
      return cache.data; // Retorna o valor armazenado no cache
    }

    // Caso não tenha cache ou seja um novo dia, faz a requisição
    const result = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.licencaImportacaoCollectionId,
      [
        Query.equal(
          "previsaoDeferimento",
          `${hoje.getDate()}/${hoje.getMonth() + 1}/${hoje.getFullYear()}`
        ), // Formato DD/MM/YYYY
        Query.limit(1000),
      ]
    );

    // Atualiza o cache
    cache = {
      data: result.total,
      lastExecutionDate: dataDeHoje,
    };

    return result.total;
  } catch (error) {
    console.error("Erro ao buscar quantidade de imps deferindo hoje:", error);
    throw error;
  }
};
