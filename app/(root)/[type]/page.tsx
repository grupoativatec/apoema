import Card from "@/components/Card";
import Sort from "@/components/Sort";
import { getFiles } from "@/lib/actions/file.actions";
import { getFileTypesParams } from "@/lib/utils";
import { Models } from "node-appwrite";
import React from "react";

const page = async ({ searchParams, params }: SearchParamProps) => {
  const type = ((await params)?.type as string) || "";

  const types = getFileTypesParams(type) as FileType[];
  const searchText = ((await searchParams)?.query as string) || "";
  const sort = ((await searchParams)?.sort as string) || "";

  const files = await getFiles({ types, searchText, sort });

  return (
    <div className="page-container dark:bg-zinc-900/80 dark:text-white">
      <section className="w-full">
        <h1 className="h1 capitalize">
          {type === "certificados" ? "Certificados Digitais" : type}
        </h1>
        <div className="total-size-section">
          <p className="body-1"></p>

          <div className="sort-container">
            <p className="body-1 hidden text-light-200 dark:text-light-300 sm:block">
              Filtrar por:
            </p>
            <Sort />
          </div>
        </div>
      </section>
      {files.total > 0 ? (
        // Se houver arquivos retornados (total > 0), renderiza a lista de arquivos
        <section className="file-list">
          {files.documents.map((file: Models.Document) => (
            <Card key={file.$id} file={file} />
          ))}
        </section>
      ) : (
        // Caso contrário, exibe uma mensagem indicando que nenhum arquivo foi encontrado
        <p className="empty-list">Nenhum arquivo encontrado</p>
      )}
    </div>
  );
};

export default page;
